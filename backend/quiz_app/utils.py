"""Pipeline that turns a YouTube video into a stored quiz.

The steps run synchronously inside the request: yt_dlp downloads the audio
track and FFmpeg converts it to mp3, Whisper transcribes it locally and Gemini
Flash writes the questions. The result is validated before it is saved.
"""

import logging
import re
import tempfile
from functools import lru_cache
from pathlib import Path

import yt_dlp
from django.conf import settings
from django.db import transaction
from google import genai
from google.genai import errors as genai_errors
from google.genai import types
from pydantic import BaseModel
from rest_framework import status
from rest_framework.exceptions import APIException

from .models import Question, Quiz

logger = logging.getLogger(__name__)

QUESTION_COUNT = 10
OPTION_COUNT = 4

YOUTUBE_ID_PATTERN = re.compile(
    r'^(?:https?://)?(?:www\.|m\.)?'
    r'(?:youtube\.com/(?:watch\?(?:\S*&)?v=|shorts/|embed/|live/)'
    r'|youtu\.be/)'
    r'([\w-]{11})(?:[?&#/]\S*)?$'
)

QUIZ_PROMPT_TEMPLATE = """
You create a multiple choice quiz from the transcript of a YouTube video.

Rules:
- Write the quiz in the language of the transcript.
- Create exactly {question_count} questions.
- Every question has exactly {option_count} different answer options.
- Exactly one option is correct and "answer" repeats it word for word.
- Only ask about facts that are stated in the transcript.
- Mix easy and harder questions and avoid trick questions.
- The title has at most 60 characters, the description at most 150
  characters and summarises what the quiz is about.

Transcript:
\"\"\"
{transcript}
\"\"\"
"""


class VideoProcessingError(APIException):
    """The video could not be turned into a usable transcript."""

    status_code = status.HTTP_400_BAD_REQUEST
    default_detail = 'The video could not be processed.'


class QuizGenerationError(APIException):
    """The AI did not return a usable quiz."""

    status_code = status.HTTP_500_INTERNAL_SERVER_ERROR
    default_detail = 'The quiz could not be generated.'


class GeneratedQuestion(BaseModel):
    """Shape of a single question in the Gemini response."""

    question_title: str
    question_options: list[str]
    answer: str


class GeneratedQuiz(BaseModel):
    """Shape of the complete Gemini response."""

    title: str
    description: str
    questions: list[GeneratedQuestion]


def extract_video_id(url):
    """Return the 11 character video id of a YouTube URL or ``None``."""
    match = YOUTUBE_ID_PATTERN.match(url.strip())
    return match.group(1) if match else None


def build_video_url(video_id):
    """Return the canonical watch URL that the frontend can embed."""
    return f'https://www.youtube.com/watch?v={video_id}'


def build_download_options(target_dir):
    """Return yt_dlp options that store the audio track as ``audio.mp3``."""
    return {
        'format': 'bestaudio/best',
        'outtmpl': str(target_dir / 'audio.%(ext)s'),
        'noplaylist': True,
        'quiet': True,
        'no_warnings': True,
        'postprocessors': [{
            'key': 'FFmpegExtractAudio',
            'preferredcodec': 'mp3',
        }],
    }


def download_audio(video_url, target_dir):
    """Download the audio track of the video and return the file path."""
    try:
        with yt_dlp.YoutubeDL(build_download_options(target_dir)) as ydl:
            ydl.download([video_url])
    except yt_dlp.utils.DownloadError as error:
        logger.warning('Download of %s failed: %s', video_url, error)
        raise VideoProcessingError(
            'The video could not be downloaded.') from error
    return target_dir / 'audio.mp3'


@lru_cache(maxsize=1)
def load_whisper_model():
    """Load the Whisper model once per process, loading takes seconds."""
    import whisper
    return whisper.load_model(settings.WHISPER_MODEL)


def transcribe_audio(audio_path):
    """Transcribe the audio file locally with Whisper."""
    result = load_whisper_model().transcribe(str(audio_path), fp16=False)
    return result['text'].strip()


def transcribe_video(video_url):
    """Download the video audio into a temp dir and return its transcript."""
    with tempfile.TemporaryDirectory() as temp_dir:
        audio_path = download_audio(video_url, Path(temp_dir))
        transcript = transcribe_audio(audio_path)
    if not transcript:
        raise VideoProcessingError('The video contains no spoken text.')
    return transcript


def build_quiz_prompt(transcript):
    """Fill the transcript into the quiz instructions for Gemini."""
    return QUIZ_PROMPT_TEMPLATE.format(
        question_count=QUESTION_COUNT,
        option_count=OPTION_COUNT,
        transcript=transcript,
    )


def request_quiz_from_gemini(prompt):
    """Send the prompt to Gemini Flash and return the parsed JSON answer."""
    if not settings.GEMINI_API_KEY:
        raise QuizGenerationError('GEMINI_API_KEY is not configured.')
    client = genai.Client(api_key=settings.GEMINI_API_KEY)
    response = client.models.generate_content(
        model=settings.GEMINI_MODEL,
        contents=prompt,
        config=types.GenerateContentConfig(
            response_mime_type='application/json',
            response_schema=GeneratedQuiz,
        ),
    )
    return response.parsed


def validate_question(question):
    """Reject a question without four distinct options or a valid answer."""
    options = question.question_options
    if len(set(options)) != OPTION_COUNT or len(options) != OPTION_COUNT:
        raise QuizGenerationError('A question does not have four options.')
    if question.answer not in options:
        raise QuizGenerationError('An answer is not one of its options.')


def validate_generated_quiz(generated_quiz):
    """Make sure Gemini returned exactly the quiz shape that was asked for."""
    if generated_quiz is None:
        raise QuizGenerationError('Gemini returned no parsable quiz.')
    if len(generated_quiz.questions) != QUESTION_COUNT:
        raise QuizGenerationError('Gemini returned the wrong question count.')
    for question in generated_quiz.questions:
        validate_question(question)


def generate_quiz(transcript):
    """Let Gemini write a quiz for the transcript and validate it."""
    try:
        generated_quiz = request_quiz_from_gemini(
            build_quiz_prompt(transcript))
    except genai_errors.APIError as error:
        logger.error('Gemini request failed: %s', error)
        raise QuizGenerationError('Gemini request failed.') from error
    validate_generated_quiz(generated_quiz)
    return generated_quiz


def build_question(quiz, generated_question):
    """Create an unsaved question model from a generated question."""
    return Question(
        quiz=quiz,
        question_title=generated_question.question_title,
        question_options=generated_question.question_options,
        answer=generated_question.answer,
    )


@transaction.atomic
def save_quiz(owner, video_url, generated_quiz):
    """Store the quiz together with all of its questions."""
    quiz = Quiz.objects.create(
        owner=owner,
        title=generated_quiz.title,
        description=generated_quiz.description,
        video_url=video_url,
    )
    Question.objects.bulk_create(
        build_question(quiz, question)
        for question in generated_quiz.questions)
    return quiz


def create_quiz_from_video(owner, video_url):
    """Run the complete pipeline from YouTube URL to stored quiz."""
    transcript = transcribe_video(video_url)
    generated_quiz = generate_quiz(transcript)
    return save_quiz(owner, video_url, generated_quiz)

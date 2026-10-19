from pathlib import Path
from unittest.mock import patch

from django.contrib.auth.models import User
from django.test import SimpleTestCase, override_settings
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from .models import Question, Quiz
from .utils import (
    GeneratedQuestion,
    GeneratedQuiz,
    QuizGenerationError,
    VideoProcessingError,
    build_quiz_prompt,
    extract_video_id,
    generate_quiz,
    transcribe_video,
)

VIDEO_URL = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'


def build_generated_question(number):
    """Return a valid generated question."""
    options = [f'Option {letter}' for letter in 'ABCD']
    return GeneratedQuestion(
        question_title=f'Question {number}',
        question_options=options,
        answer=options[0],
    )


def build_generated_quiz(question_count=10):
    """Return a generated quiz with the given number of valid questions."""
    return GeneratedQuiz(
        title='Generated title',
        description='Generated description',
        questions=[build_generated_question(n) for n in range(question_count)],
    )


def create_quiz(owner, title='Quiz'):
    """Store a quiz with one question for the given owner."""
    quiz = Quiz.objects.create(owner=owner, title=title, video_url=VIDEO_URL)
    Question.objects.create(
        quiz=quiz, question_title='Q', question_options=['A', 'B', 'C', 'D'],
        answer='A')
    return quiz


class VideoUrlTests(SimpleTestCase):
    """Tests for recognising YouTube URLs."""

    def test_extracts_id_from_supported_formats(self):
        urls = [
            VIDEO_URL,
            'https://youtu.be/dQw4w9WgXcQ',
            'https://m.youtube.com/watch?feature=share&v=dQw4w9WgXcQ',
            'youtube.com/shorts/dQw4w9WgXcQ?si=abc',
        ]
        for url in urls:
            self.assertEqual(extract_video_id(url), 'dQw4w9WgXcQ', url)

    def test_rejects_other_urls(self):
        for url in ['https://vimeo.com/12345678', 'not a url',
                    'https://www.youtube.com/watch?v=short']:
            self.assertIsNone(extract_video_id(url), url)


class PipelineTests(SimpleTestCase):
    """Tests for the transcription and generation steps with mocked AI."""

    @patch('quiz_app.utils.transcribe_audio', return_value='')
    @patch('quiz_app.utils.download_audio', return_value=Path('audio.mp3'))
    def test_silent_video_raises_processing_error(self, *mocks):
        with self.assertRaises(VideoProcessingError):
            transcribe_video(VIDEO_URL)

    def test_prompt_contains_transcript_and_rules(self):
        prompt = build_quiz_prompt('Bananas are berries.')
        self.assertIn('Bananas are berries.', prompt)
        self.assertIn('exactly 10 questions', prompt)

    @override_settings(GEMINI_API_KEY='')
    def test_missing_api_key_raises_generation_error(self):
        with self.assertRaises(QuizGenerationError):
            generate_quiz('Transcript')

    @patch('quiz_app.utils.request_quiz_from_gemini')
    def test_wrong_question_count_is_rejected(self, request_mock):
        request_mock.return_value = build_generated_quiz(question_count=9)
        with self.assertRaises(QuizGenerationError):
            generate_quiz('Transcript')

    @patch('quiz_app.utils.request_quiz_from_gemini')
    def test_answer_outside_options_is_rejected(self, request_mock):
        generated_quiz = build_generated_quiz()
        generated_quiz.questions[3].answer = 'Option E'
        request_mock.return_value = generated_quiz
        with self.assertRaises(QuizGenerationError):
            generate_quiz('Transcript')


class QuizCreateTests(APITestCase):
    """Tests for generating a quiz through the API."""

    def setUp(self):
        self.user = User.objects.create_user(username='alice', password='pw')
        self.client.force_authenticate(self.user)
        self.url = reverse('quiz-list')

    @patch('quiz_app.utils.request_quiz_from_gemini')
    @patch('quiz_app.utils.transcribe_video', return_value='Transcript')
    def test_create_stores_quiz_with_ten_questions(self, _, request_mock):
        request_mock.return_value = build_generated_quiz()
        response = self.client.post(
            self.url, {'url': 'https://youtu.be/dQw4w9WgXcQ'}, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['video_url'], VIDEO_URL)
        self.assertEqual(len(response.data['questions']), 10)
        self.assertIn('created_at', response.data['questions'][0])
        self.assertEqual(Quiz.objects.get().owner, self.user)

    def test_create_rejects_non_youtube_url(self):
        response = self.client.post(
            self.url, {'url': 'https://vimeo.com/1'}, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    @patch('quiz_app.utils.transcribe_video',
           side_effect=VideoProcessingError('The video could not be '
                                            'downloaded.'))
    def test_download_failure_returns_400(self, _):
        response = self.client.post(self.url, {'url': VIDEO_URL})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertFalse(Quiz.objects.exists())

    @patch('quiz_app.utils.transcribe_video', return_value='Transcript')
    @patch('quiz_app.utils.request_quiz_from_gemini', return_value=None)
    def test_unusable_ai_answer_returns_500(self, *mocks):
        response = self.client.post(self.url, {'url': VIDEO_URL})
        self.assertEqual(
            response.status_code, status.HTTP_500_INTERNAL_SERVER_ERROR)

    def test_create_requires_authentication(self):
        self.client.force_authenticate(None)
        response = self.client.post(self.url, {'url': VIDEO_URL})
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


class QuizListAndDetailTests(APITestCase):
    """Tests for listing, reading, updating and deleting quizzes."""

    def setUp(self):
        self.user = User.objects.create_user(username='alice', password='pw')
        self.other = User.objects.create_user(username='bob', password='pw')
        self.quiz = create_quiz(self.user)
        self.foreign_quiz = create_quiz(self.other, 'Foreign')
        self.client.force_authenticate(self.user)
        self.detail_url = reverse('quiz-detail', args=[self.quiz.id])

    def test_list_contains_only_own_quizzes(self):
        response = self.client.get(reverse('quiz-list'))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual([quiz['id'] for quiz in response.data],
                         [self.quiz.id])
        self.assertNotIn('created_at', response.data[0]['questions'][0])

    def test_detail_returns_own_quiz(self):
        response = self.client.get(self.detail_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['video_url'], VIDEO_URL)

    def test_foreign_quiz_returns_403(self):
        url = reverse('quiz-detail', args=[self.foreign_quiz.id])
        for method in ('get', 'patch', 'delete'):
            response = getattr(self.client, method)(url)
            self.assertEqual(
                response.status_code, status.HTTP_403_FORBIDDEN, method)

    def test_missing_quiz_returns_404(self):
        response = self.client.get(reverse('quiz-detail', args=[9999]))
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_patch_updates_title_and_description_only(self):
        payload = {'title': 'New title', 'description': 'New description',
                   'video_url': 'https://example.com'}
        response = self.client.patch(self.detail_url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.quiz.refresh_from_db()
        self.assertEqual(self.quiz.title, 'New title')
        self.assertEqual(self.quiz.video_url, VIDEO_URL)

    def test_delete_removes_quiz_and_questions(self):
        response = self.client.delete(self.detail_url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(
            Question.objects.filter(quiz_id=self.quiz.id).exists())

    def test_put_is_not_allowed(self):
        response = self.client.put(self.detail_url, {'title': 'x'})
        self.assertEqual(
            response.status_code, status.HTTP_405_METHOD_NOT_ALLOWED)

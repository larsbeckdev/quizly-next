from rest_framework import serializers

from ..models import Question, Quiz
from ..utils import build_video_url, extract_video_id


class QuestionSerializer(serializers.ModelSerializer):
    """Question as it appears in the quiz list and detail responses."""

    class Meta:
        model = Question
        fields = ['id', 'question_title', 'question_options', 'answer']


class QuestionWithTimestampsSerializer(QuestionSerializer):
    """Question as it appears in the response of a freshly created quiz."""

    class Meta(QuestionSerializer.Meta):
        fields = QuestionSerializer.Meta.fields + ['created_at', 'updated_at']


class QuizSerializer(serializers.ModelSerializer):
    """Quiz with its questions; only title and description are editable."""

    questions = QuestionSerializer(many=True, read_only=True)

    class Meta:
        model = Quiz
        fields = [
            'id', 'title', 'description', 'created_at', 'updated_at',
            'video_url', 'questions',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'video_url']


class CreatedQuizSerializer(QuizSerializer):
    """Quiz response of the create endpoint, questions with timestamps."""

    questions = QuestionWithTimestampsSerializer(many=True, read_only=True)


class QuizCreateSerializer(serializers.Serializer):
    """Accepts the YouTube URL a new quiz is generated from."""

    url = serializers.CharField()

    def validate_url(self, value):
        """Accept YouTube links only and return their canonical form."""
        video_id = extract_video_id(value)
        if video_id is None:
            raise serializers.ValidationError(
                'Please provide a valid YouTube video URL.')
        return build_video_url(video_id)

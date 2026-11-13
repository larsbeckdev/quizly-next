from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from ..models import Quiz
from ..utils import create_quiz_from_video
from .permissions import IsQuizOwner
from .serializers import (
    CreatedQuizSerializer,
    QuizCreateSerializer,
    QuizSerializer,
)


class QuizListCreateView(generics.ListCreateAPIView):
    """Lists the quizzes of the user and generates new ones."""

    serializer_class = QuizSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """Return only the quizzes of the requesting user."""
        return Quiz.objects.filter(
            owner=self.request.user).prefetch_related('questions')

    def create(self, request, *args, **kwargs):
        """Generate a quiz from the posted YouTube URL.

        Pipeline failures raise ``VideoProcessingError`` (400) or
        ``QuizGenerationError`` (500), which DRF turns into JSON responses.
        """
        serializer = QuizCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        quiz = create_quiz_from_video(
            request.user, serializer.validated_data['url'])
        return Response(
            CreatedQuizSerializer(quiz).data, status=status.HTTP_201_CREATED)


class QuizDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Reads, renames and deletes a single quiz of its owner."""

    queryset = Quiz.objects.prefetch_related('questions')
    serializer_class = QuizSerializer
    permission_classes = [IsAuthenticated, IsQuizOwner]
    http_method_names = ['get', 'patch', 'delete', 'head', 'options']

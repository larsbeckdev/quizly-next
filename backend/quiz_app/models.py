from django.contrib.auth.models import User
from django.db import models


class Quiz(models.Model):
    """A quiz generated from the transcript of a YouTube video."""

    owner = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='quizzes',
    )
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True, default='')
    video_url = models.URLField(max_length=500)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Quiz'
        verbose_name_plural = 'Quizzes'
        ordering = ['-created_at']

    def __str__(self):
        return self.title


class Question(models.Model):
    """A single multiple choice question with four options."""

    quiz = models.ForeignKey(
        Quiz,
        on_delete=models.CASCADE,
        related_name='questions',
    )
    question_title = models.CharField(max_length=500)
    question_options = models.JSONField(default=list)
    answer = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Question'
        verbose_name_plural = 'Questions'
        ordering = ['id']

    def __str__(self):
        return self.question_title

from django.contrib import admin

from .models import Question, Quiz


class QuestionInline(admin.StackedInline):
    """Edit the questions directly on the page of their quiz."""

    model = Question
    extra = 0
    fields = ['question_title', 'question_options', 'answer']


@admin.register(Quiz)
class QuizAdmin(admin.ModelAdmin):
    """Admin configuration for quizzes including their questions."""

    list_display = ['title', 'owner', 'question_count', 'created_at']
    list_filter = ['created_at']
    search_fields = ['title', 'description', 'owner__username']
    readonly_fields = ['created_at', 'updated_at']
    inlines = [QuestionInline]

    @admin.display(description='Questions')
    def question_count(self, quiz):
        """Show how many questions the quiz has."""
        return quiz.questions.count()


@admin.register(Question)
class QuestionAdmin(admin.ModelAdmin):
    """Admin configuration for editing single quiz questions."""

    list_display = ['question_title', 'quiz', 'answer']
    list_filter = ['quiz']
    search_fields = ['question_title', 'quiz__title']
    readonly_fields = ['created_at', 'updated_at']

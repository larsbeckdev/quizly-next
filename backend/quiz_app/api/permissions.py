from rest_framework.permissions import BasePermission


class IsQuizOwner(BasePermission):
    """Grants access to a quiz only to the user who created it."""

    def has_object_permission(self, request, view, obj):
        """Compare the quiz owner with the requesting user."""
        return obj.owner_id == request.user.id

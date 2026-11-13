from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import InvalidToken

from .utils import ACCESS_COOKIE


class CookieJWTAuthentication(JWTAuthentication):
    """Authenticates requests with the access token from its HTTP-only cookie.

    The frontend never sees the token, so there is no ``Authorization``
    header to read. A missing or expired cookie leaves the request anonymous
    instead of failing it, so public endpoints like login and token refresh
    keep working; protected endpoints then answer ``401``.
    """

    def authenticate(self, request):
        """Return the user and token stored in the access token cookie."""
        raw_token = request.COOKIES.get(ACCESS_COOKIE)
        if raw_token is None:
            return None
        try:
            validated_token = self.get_validated_token(raw_token)
        except InvalidToken:
            return None
        return self.get_user(validated_token), validated_token

"""Helpers that move JWT tokens in and out of HTTP-only cookies."""

from django.conf import settings
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
from rest_framework_simplejwt.serializers import TokenRefreshSerializer
from rest_framework_simplejwt.tokens import RefreshToken

ACCESS_COOKIE = 'access_token'
REFRESH_COOKIE = 'refresh_token'


def set_auth_cookie(response, name, token, lifetime):
    """Store a token as an HTTP-only cookie that expires with the token."""
    response.set_cookie(
        name,
        str(token),
        max_age=int(lifetime.total_seconds()),
        httponly=True,
        secure=settings.AUTH_COOKIE_SECURE,
        samesite=settings.AUTH_COOKIE_SAMESITE,
    )


def set_access_cookie(response, access_token):
    """Store the access token cookie."""
    lifetime = settings.SIMPLE_JWT['ACCESS_TOKEN_LIFETIME']
    set_auth_cookie(response, ACCESS_COOKIE, access_token, lifetime)


def set_login_cookies(response, user):
    """Create a fresh token pair for the user and store both as cookies."""
    refresh_token = RefreshToken.for_user(user)
    lifetime = settings.SIMPLE_JWT['REFRESH_TOKEN_LIFETIME']
    set_access_cookie(response, refresh_token.access_token)
    set_auth_cookie(response, REFRESH_COOKIE, refresh_token, lifetime)


def delete_auth_cookies(response):
    """Remove both token cookies from the browser."""
    for name in (ACCESS_COOKIE, REFRESH_COOKIE):
        response.delete_cookie(
            name, samesite=settings.AUTH_COOKIE_SAMESITE)


def refresh_access_token(raw_token):
    """Return a new access token, or raise ``InvalidToken`` (401)."""
    if not raw_token:
        raise InvalidToken('Refresh token missing.')
    serializer = TokenRefreshSerializer(data={'refresh': raw_token})
    try:
        serializer.is_valid(raise_exception=True)
    except TokenError as error:
        raise InvalidToken(str(error)) from error
    return serializer.validated_data['access']


def blacklist_refresh_token(raw_token):
    """Put the refresh token on the blacklist so it can never be reused.

    A missing, expired or already blacklisted token is unusable anyway, so
    there is nothing left to invalidate in that case.
    """
    if not raw_token:
        return
    try:
        RefreshToken(raw_token).blacklist()
    except TokenError:
        return

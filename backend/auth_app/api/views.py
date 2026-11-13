from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .serializers import (
    LoginSerializer,
    RegistrationSerializer,
    UserSerializer,
)
from .utils import (
    REFRESH_COOKIE,
    blacklist_refresh_token,
    delete_auth_cookies,
    refresh_access_token,
    set_access_cookie,
    set_login_cookies,
)


class RegistrationView(APIView):
    """Creates a new user account."""

    permission_classes = [AllowAny]

    def post(self, request):
        """Register a user after validating the sign up data."""
        serializer = RegistrationSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(
            {'detail': 'User created successfully!'},
            status=status.HTTP_201_CREATED,
        )


class LoginView(APIView):
    """Authenticates a user and sets the JWT cookies."""

    permission_classes = [AllowAny]

    def post(self, request):
        """Validate credentials and answer with the user and both cookies."""
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']
        response = Response({
            'detail': 'Login successfully!',
            'user': UserSerializer(user).data,
        })
        set_login_cookies(response, user)
        return response


class LogoutView(APIView):
    """Logs the user out and invalidates the refresh token."""

    permission_classes = [IsAuthenticated]

    def post(self, request):
        """Blacklist the refresh token and delete both cookies."""
        blacklist_refresh_token(request.COOKIES.get(REFRESH_COOKIE))
        response = Response({
            'detail': 'Log-Out successfully! All Tokens will be deleted. '
                      'Refresh token is now invalid.',
        })
        delete_auth_cookies(response)
        return response


class CookieTokenRefreshView(APIView):
    """Issues a new access token from the refresh token cookie."""

    permission_classes = [AllowAny]

    def post(self, request):
        """Validate the refresh token and set a new access token cookie."""
        access_token = refresh_access_token(
            request.COOKIES.get(REFRESH_COOKIE))
        response = Response({'detail': 'Token refreshed'})
        set_access_cookie(response, access_token)
        return response

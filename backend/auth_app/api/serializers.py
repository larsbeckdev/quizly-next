from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers
from rest_framework.exceptions import AuthenticationFailed


class RegistrationSerializer(serializers.ModelSerializer):
    """Validates sign up data and creates the user account."""

    confirmed_password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'confirmed_password']
        extra_kwargs = {
            'password': {'write_only': True},
            'email': {'required': True, 'allow_blank': False},
        }

    def validate_email(self, value):
        """Reject an email address that is already taken."""
        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError(
                'This email address is already in use.')
        return value

    def validate(self, attrs):
        """Make sure both passwords match and the password is strong."""
        if attrs['password'] != attrs['confirmed_password']:
            raise serializers.ValidationError(
                {'confirmed_password': 'The passwords do not match.'})
        validate_password(attrs['password'])
        return attrs

    def create(self, validated_data):
        """Create the user with a hashed password."""
        validated_data.pop('confirmed_password')
        return User.objects.create_user(**validated_data)


class LoginSerializer(serializers.Serializer):
    """Validates credentials and exposes the authenticated user."""

    username = serializers.CharField()
    password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        """Authenticate the credentials with a deliberately vague error."""
        user = authenticate(
            username=attrs['username'], password=attrs['password'])
        if not user:
            raise AuthenticationFailed('Invalid username or password.')
        attrs['user'] = user
        return attrs


class UserSerializer(serializers.ModelSerializer):
    """Public representation of the logged in user."""

    class Meta:
        model = User
        fields = ['id', 'username', 'email']

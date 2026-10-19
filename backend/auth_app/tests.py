from django.contrib.auth.models import User
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from rest_framework_simplejwt.token_blacklist.models import BlacklistedToken

PASSWORD = 'Quizly-Secret-42'


def create_user(username='alice'):
    """Create a user with a known password."""
    return User.objects.create_user(
        username=username, email=f'{username}@example.com', password=PASSWORD)


class RegistrationTests(APITestCase):
    """Tests for the registration endpoint."""

    def setUp(self):
        self.url = reverse('register')
        self.payload = {
            'username': 'newuser',
            'email': 'new@example.com',
            'password': PASSWORD,
            'confirmed_password': PASSWORD,
        }

    def test_registration_creates_user(self):
        response = self.client.post(self.url, self.payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['detail'], 'User created successfully!')
        self.assertTrue(User.objects.filter(username='newuser').exists())

    def test_registration_rejects_mismatching_passwords(self):
        payload = {**self.payload, 'confirmed_password': 'Other-Secret-42'}
        response = self.client.post(self.url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_registration_rejects_duplicate_email(self):
        create_user('taken')
        payload = {**self.payload, 'email': 'TAKEN@example.com'}
        response = self.client.post(self.url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_registration_requires_email(self):
        payload = {**self.payload, 'email': ''}
        response = self.client.post(self.url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_registration_rejects_weak_password(self):
        payload = {
            **self.payload, 'password': '123', 'confirmed_password': '123'}
        response = self.client.post(self.url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


class LoginTests(APITestCase):
    """Tests for the login endpoint."""

    def setUp(self):
        self.user = create_user()
        self.url = reverse('login')

    def test_login_sets_http_only_cookies(self):
        response = self.client.post(
            self.url, {'username': 'alice', 'password': PASSWORD})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['user']['id'], self.user.id)
        for name in ('access_token', 'refresh_token'):
            self.assertTrue(response.cookies[name]['httponly'])

    def test_login_rejects_wrong_password_with_401(self):
        response = self.client.post(
            self.url, {'username': 'alice', 'password': 'wrong'})
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertNotIn('access_token', response.cookies)

    def test_login_ignores_stale_access_cookie(self):
        self.client.cookies['access_token'] = 'expired-or-broken'
        response = self.client.post(
            self.url, {'username': 'alice', 'password': PASSWORD})
        self.assertEqual(response.status_code, status.HTTP_200_OK)


class LogoutAndRefreshTests(APITestCase):
    """Tests for logout, token refresh and the refresh token blacklist."""

    def setUp(self):
        create_user()
        self.client.post(
            reverse('login'), {'username': 'alice', 'password': PASSWORD})

    def test_refresh_sets_new_access_cookie(self):
        response = self.client.post(reverse('token-refresh'))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['detail'], 'Token refreshed')
        self.assertIn('access_token', response.cookies)

    def test_refresh_without_cookie_returns_401(self):
        self.client.cookies.clear()
        response = self.client.post(reverse('token-refresh'))
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_logout_blacklists_refresh_token_and_deletes_cookies(self):
        refresh_token = self.client.cookies['refresh_token'].value
        response = self.client.post(reverse('logout'))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.cookies['access_token'].value, '')
        self.assertEqual(BlacklistedToken.objects.count(), 1)
        self.client.cookies['refresh_token'] = refresh_token
        response = self.client.post(reverse('token-refresh'))
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_logout_requires_authentication(self):
        self.client.cookies.clear()
        response = self.client.post(reverse('logout'))
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

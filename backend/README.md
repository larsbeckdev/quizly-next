# Quizly Backend

REST API for Quizly, built with Django and the Django REST Framework. A user
pastes a YouTube link, the backend turns the video into a quiz with ten
multiple choice questions and stores it for the user to play again later.

How a quiz is created:

1. **yt_dlp** downloads the audio track of the YouTube video and **FFmpeg**
   converts it to mp3.
2. **Whisper** transcribes the audio locally on this machine.
3. **Gemini Flash** receives the transcript and returns a title, a
   description and ten questions with four options each as structured JSON.
4. The answer is validated (ten questions, four distinct options, the answer
   is one of the options) and saved.

The frontend lives in [`../frontend`](../frontend) and talks to this API over
HTTP only.

## Requirements

- Python 3.12 or newer
- **FFmpeg, installed globally and available on the `PATH`.** Whisper and the
  yt_dlp audio conversion both call it. Without FFmpeg, every quiz creation
  fails.
  - Windows: `winget install Gyan.FFmpeg`, then open a new terminal
  - macOS: `brew install ffmpeg`
  - Debian / Ubuntu: `sudo apt install ffmpeg`
  - Check with `ffmpeg -version`
- A free Gemini API key from <https://aistudio.google.com/apikey>
- About 2 GB of disk space for PyTorch and the Whisper model

## Setup

```bash
git clone <repository-url>
cd quizly/backend

python -m venv env
# Windows
env\Scripts\activate
# macOS / Linux
source env/bin/activate

pip install -r requirements.txt
```

### Configuration

Copy the template and enter at least your Gemini API key:

```bash
cp .env.template .env.local
```

| Variable | Default | Purpose |
| --- | --- | --- |
| `GEMINI_API_KEY` | empty | **Required** for quiz generation |
| `GEMINI_MODEL` | `gemini-2.5-flash` | Gemini model used for the questions |
| `WHISPER_MODEL` | `base` | `tiny`, `base`, `small`, `medium` or `large`; bigger is more accurate and slower |
| `DJANGO_SECRET_KEY` | insecure dev key | Django secret key |
| `DJANGO_DEBUG` | `True` | Debug mode |
| `DJANGO_ALLOWED_HOSTS` | `localhost,127.0.0.1` | Comma separated hosts |
| `DJANGO_CORS_ALLOWED_ORIGINS` | Live Server and port 3000 on `localhost` and `127.0.0.1` | Frontend origins allowed to send cookies |
| `DJANGO_AUTH_COOKIE_SECURE` | `False` | Set to `True` when the API runs on HTTPS |
| `DJANGO_AUTH_COOKIE_SAMESITE` | `Lax` | `SameSite` attribute of the auth cookies |

`.env.local` is ignored by git and must never be committed.

### Database and start

```bash
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

The API is then available at `http://127.0.0.1:8000/api/`, the admin interface
at `http://127.0.0.1:8000/admin/`. In the admin, quizzes can be edited
together with their questions, and single questions have their own list.

The first quiz takes longer: Whisper downloads the selected model once
(`base` is about 140 MB) into its cache folder.

## Frontend connection

Serve [`../frontend`](../frontend) with a static server, for example the VS
Code Live Server extension on port 5500, and open it on `127.0.0.1`. The
frontend expects the API at `http://127.0.0.1:8000/api/`
(`shared/js/config.js`).

Open the frontend on the same host name as the API: `127.0.0.1` with
`127.0.0.1`, or `localhost` with `localhost`. The auth cookies use
`SameSite=Lax`, and the browser treats the two names as different sites, so
mixing them drops the cookies.

## Authentication

Authentication uses JWT stored in **HTTP-only cookies**, the frontend never
sees a token:

- `POST /api/login/` sets `access_token` (15 minutes) and `refresh_token`
  (1 day).
- Every request sends the cookies automatically when the frontend uses
  `credentials: "include"`.
- `POST /api/token/refresh/` exchanges the refresh token cookie for a new
  access token cookie.
- `POST /api/logout/` puts the refresh token on the blacklist and deletes
  both cookies. The blacklisted refresh token can never be used again. An
  access token is stateless and expires on its own after at most 15 minutes.

## Endpoints

| Method | Path | Permission | Success |
| --- | --- | --- | --- |
| POST | `/api/register/` | public | `201` |
| POST | `/api/login/` | public | `200`, sets cookies |
| POST | `/api/logout/` | authenticated | `200`, deletes cookies |
| POST | `/api/token/refresh/` | `refresh_token` cookie | `200`, sets new access cookie |
| GET | `/api/quizzes/` | authenticated | `200`, own quizzes, newest first |
| POST | `/api/quizzes/` | authenticated | `201`, generated quiz |
| GET | `/api/quizzes/<id>/` | quiz owner | `200` |
| PATCH | `/api/quizzes/<id>/` | quiz owner | `200`, only `title` and `description` |
| DELETE | `/api/quizzes/<id>/` | quiz owner | `204`, deletes the questions too |

Error codes:

- `400`: invalid input, a link that is not a YouTube video, a video that
  cannot be downloaded or contains no speech.
- `401`: missing or expired cookie, wrong login data. Login errors are
  deliberately vague and do not say whether the username exists.
- `403`: the quiz belongs to another user.
- `404`: the quiz does not exist.
- `500`: Gemini failed or returned an unusable quiz. Trying again usually
  works.

### Create a quiz

```http
POST /api/quizzes/
Content-Type: application/json

{"url": "https://www.youtube.com/watch?v=example"}
```

Accepted links: `youtube.com/watch?v=`, `youtu.be/`, `youtube.com/shorts/`,
`youtube.com/embed/` and `youtube.com/live/`, with or without `www.` or `m.`.
The URL is stored in the canonical `https://www.youtube.com/watch?v=<id>`
form.

The request runs synchronously and takes from a few seconds to several
minutes, depending on the video length and the Whisper model. Short videos
are the better choice on a machine without a GPU.

## Project structure

```text
core/              settings, central routing, wsgi
auth_app/          registration, login, logout, token refresh
  api/authentication.py   reads the access token from its cookie
  api/utils.py            sets, refreshes, deletes and blacklists tokens
quiz_app/          quiz and question models, admin
  utils.py                pipeline: download, transcription, Gemini, saving
  api/                    serializers, views, urls, owner permission
```

## Tests

```bash
python manage.py test
```

Download, transcription and Gemini are mocked, so the tests run without
FFmpeg, network or API key. With coverage:

```bash
coverage run --source=. --omit="*/migrations/*,*/tests.py,manage.py,core/wsgi.py,core/asgi.py,env/*" manage.py test
coverage report -m
```

PEP 8 check:

```bash
flake8 --exclude env,migrations .
```

## Troubleshooting

**Creating a quiz answers `400` "The video could not be downloaded."**
The video is private, age restricted or region locked, or FFmpeg is missing.
Check `ffmpeg -version` in the terminal that runs the server.

**Creating a quiz answers `500`.**
Read the `detail` of the response. `GEMINI_API_KEY is not configured.` means
`.env.local` is missing the key, a restart of `runserver` is needed after
adding it. Any other message means Gemini failed or returned an unusable
answer; try again.

**Every request answers `401` right after a successful login.**
The frontend and the API are opened under different host names
(`localhost` vs `127.0.0.1`), or the frontend does not send
`credentials: "include"`. See [Frontend connection](#frontend-connection).

**The browser reports a CORS error.**
Add the frontend origin to `DJANGO_CORS_ALLOWED_ORIGINS` in `.env.local`.

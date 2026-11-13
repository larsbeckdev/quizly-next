# Quizly

Turns YouTube videos into quizzes, with a Django REST API ([backend/](backend/)) and a Next.js frontend ([frontend/](frontend/)).

A user pastes a YouTube link, the backend downloads the audio with yt_dlp and FFmpeg, transcribes it locally with Whisper and lets Gemini Flash write ten multiple choice questions. Authentication uses JWT in HTTP-only cookies.

For local development without Docker, follow [backend/README.md](backend/README.md) and [frontend/README.md](frontend/README.md). Everything below describes the Docker Compose stack that runs it on a server.

## Docker Compose stack

| Service | Port | Role |
| --- | --- | --- |
| `api` | `3070` | Django behind gunicorn, serving `/api/`, `/admin/` and its own static files. FFmpeg is part of the image. |
| `web` | `3071` | Next.js in standalone mode. The browser talks to the API directly, not through this container. |

Open the frontend and the API under the same host name, for example both on `http://<host>:3071` and `http://<host>:3070`. The auth cookies are `SameSite=Lax`, and with a different host name the browser drops them. The frontend therefore builds the API URL from the host it was opened with plus `API_PORT`.

### Start

```bash
cp .env.example .env
python -c "import secrets; print(secrets.token_urlsafe(50))"   # -> DJANGO_SECRET_KEY
# and enter GEMINI_API_KEY, free key at https://aistudio.google.com/apikey
docker compose up -d --build
```

Compose refuses to start without `DJANGO_SECRET_KEY` and `GEMINI_API_KEY`. The app is then on `http://<host>:3071`, the API on `http://<host>:3070/api/`.

`migrate` and `collectstatic` run automatically on every start of the `api` container.

The image installs the CPU build of PyTorch, the default Linux wheel would add several GB of CUDA libraries that the container never uses. The first build still takes a few minutes.

### Configuration

All of it lives in `.env`, see [.env.example](.env.example) for the full list with defaults. The ones that matter:

| Variable | Default | Meaning |
| --- | --- | --- |
| `DJANGO_SECRET_KEY` | — | Required. |
| `GEMINI_API_KEY` | — | Required. |
| `WHISPER_MODEL` | `base` | `tiny` is faster, `small` and up are more accurate and much slower on a CPU. |
| `API_PORT` | `3070` | Host port of the API. Also baked into the frontend build. |
| `WEB_PORT` | `3071` | Host port of the frontend. |
| `NEXT_PUBLIC_API_BASE_URL` | empty | Full API URL, only needed when the API is not on `<same host>:<API_PORT>`. Needs a rebuild. |
| `GUNICORN_WORKERS` | `2` | Every worker holds its own Whisper model in memory and is blocked while it generates a quiz. |
| `GUNICORN_TIMEOUT` | `900` | Seconds a quiz request may take before gunicorn kills the worker. |
| `DJANGO_ALLOWED_HOSTS` | `*` | Comma separated. Narrow this once the host name is fixed. |
| `DJANGO_CORS_ALLOW_ALL_ORIGINS` | `True` | Set to `False` on a public deployment and list the origins below. |
| `DJANGO_CORS_ALLOWED_ORIGINS` | empty | Comma separated origins the frontend runs on, scheme and host only. |
| `DJANGO_AUTH_COOKIE_SECURE` | `False` | Set to `True` once the site runs on HTTPS. |

`DJANGO_DEBUG` defaults to `0` in the stack. Without any environment variables the settings keep their development defaults, so the local workflow in `backend/README.md` is unaffected.

### Data

`./data` is bind mounted into the `api` container and holds the SQLite database (`data/db.sqlite3`) and the Whisper model cache (`data/cache/whisper/`), so the model is downloaded only once. `./data` is git ignored.

### Admin user

```bash
docker compose run --rm api python manage.py createsuperuser
```

The admin is served by the API container at `http://<host>:3070/admin/`. Quizzes can be edited there together with their questions.

### Behind a TLS proxy

If something in front terminates HTTPS, set in `.env`:

```bash
DJANGO_TRUST_PROXY_SSL_HEADER=1
DJANGO_CSRF_TRUSTED_ORIGINS=https://demo.example.com
DJANGO_AUTH_COOKIE_SECURE=True
DJANGO_CORS_ALLOW_ALL_ORIGINS=False
DJANGO_CORS_ALLOWED_ORIGINS=https://demo.example.com
```

Without the first two the admin login rejects its own POST as a CSRF failure, without the third the browser sends the auth cookies over plain HTTP too.

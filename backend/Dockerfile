FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

# Whisper and the yt_dlp audio conversion both call the ffmpeg binary.
RUN apt-get update \
    && apt-get install -y --no-install-recommends ffmpeg \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# The default PyTorch wheel on Linux bundles CUDA and adds several GB. The
# container transcribes on the CPU, so the CPU wheel is installed first and
# openai-whisper then finds its torch requirement already satisfied.
RUN pip install --no-cache-dir torch \
    --index-url https://download.pytorch.org/whl/cpu

COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

# ponytail: runs as root. The SQLite volume is root-owned, so a non-root user
# would need a chown step in an entrypoint. Add both together if the
# deployment ever holds data worth protecting.
CMD ["gunicorn", "core.wsgi:application", \
     "--bind", "0.0.0.0:8000", "--workers", "2", "--timeout", "900"]

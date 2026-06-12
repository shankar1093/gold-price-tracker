# syntax=docker.io/docker/dockerfile:1

# Use slim Python image for smaller size and faster pulls
FROM python:3.11-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Set the working directory in the container
WORKDIR /app

# Install system dependencies in a single layer
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    libpq-dev \
    cron \
    postgresql-client \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies with cache mount
COPY requirements.txt .
RUN --mount=type=cache,target=/root/.cache/pip \
    pip install --upgrade pip && \
    pip install -r requirements.txt

# Copy the project code into the container
COPY . .

# Copy and set permissions for scripts
COPY wait-for-it.sh /app/wait-for-it.sh
COPY entrypoint.sh /app/entrypoint.sh
RUN chmod +x /app/wait-for-it.sh /app/entrypoint.sh

# Expose the port the app runs on
EXPOSE 8000

ENTRYPOINT ["/app/wait-for-it.sh", "db:5432", "/app/entrypoint.sh"]
CMD ["gunicorn", "mjw_services.wsgi:application", "--bind", "0.0.0.0:8000", "--workers", "3"]

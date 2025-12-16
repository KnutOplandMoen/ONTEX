# Stage 1: Build React Frontend
FROM node:18-alpine as build-frontend

WORKDIR /app

# Copy package files
COPY frontend/package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY frontend/ ./

# Build the app
RUN npm run build

# Stage 2: Python Backend
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies (if any needed for postgres/etc)
RUN apt-get update && apt-get install -y \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements
COPY requirements.txt .

# Install python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend code
COPY app/ ./app/

# Copy built frontend assets from Stage 1 to static directory
# We map /app/static to the frontend build output. 
# app/main.py expects static files in /app/static or relative to file.
# Since we copy frontend/dist to /app/static, we need to ensure main.py looks there.
# My main.py logic: os.path.join(os.path.dirname(__file__), "static") -> /app/app/static
# Wait, if I copy to /app/static (root of container/static), main.py needs to look there?
# No, main.py is in /app/app/main.py usually if I run `uvicorn app.main:app`.
# If WORKDIR is /app, `uvicorn app.main:app` runs.
# Code is at /app/app.
# `__file__` is /app/app/main.py.
# `dirname(__file__)` is /app/app.
# So I should copy frontend build to /app/app/static.

COPY --from=build-frontend /app/dist /app/app/static

# Set environment variables
ENV PYTHONUNBUFFERED=1

# Expose port (Railway sets $PORT, but good to document)
EXPOSE 8000

# Run the application
# Use shell form to expand $PORT
CMD uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}


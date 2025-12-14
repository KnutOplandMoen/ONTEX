# 1. Use an official Python runtime as a parent image
# Using the "slim" version keeps the final image size smaller
FROM python:3.10-slim

# 2. Set the working directory inside the container
WORKDIR /app

# 3. Copy the dependencies file first and install them
# This is a Docker optimization. This layer is only rebuilt if requirements.txt changes.
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 4. Copy the rest of your application's code into the container
COPY . .

# 5. Expose the port the app will run on
EXPOSE 8000

# 6. Define the command to run your app
# Uvicorn is the server that will run your FastAPI code.
# The host 0.0.0.0 is crucial for it to be accessible from outside the container.
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]


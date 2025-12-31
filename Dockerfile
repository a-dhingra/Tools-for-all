# Use an official Python runtime as a parent image
FROM python:3.12-slim

# Set the working directory in the container
WORKDIR /app

# Install system dependencies (ffmpeg)
# We also install build-essential just in case some python packages need compilation,
# though for the current requirements it might not be strictly necessary.
RUN apt-get update && apt-get install -y \
    ffmpeg \
    && rm -rf /var/lib/apt/lists/*

# Copy the current directory contents into the container at /app
COPY . /app

# Install any needed packages specified in requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Make port 5000 available to the world outside this container
EXPOSE 5000

# Define environment variable
ENV FLASK_APP=app.py

# Run app.py when the container launches
# Using gunicorn is better for production, but for simplicity we can use python app.py
# or install gunicorn. Let's install gunicorn for a better "production-ready" example for Azure.
RUN pip install gunicorn

# Bind to 0.0.0.0:$PORT (Azure sets PORT, default to 5000 if not set)
CMD gunicorn --bind 0.0.0.0:5000 app:app

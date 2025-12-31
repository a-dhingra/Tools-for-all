# Tools for all

Aim is to publish tools for people to use.

## Tools Available

1.  **MP4 to MP3 Converter**: Convert your MP4 video files to MP3 audio files.
2.  **YouTube Audio Downloader**: Download audio from YouTube videos.

## Web Application

This repository includes a Flask web application to showcase and use these tools via a user-friendly interface.

### Is this a Static Web App?
**No.** This is a dynamic Python web application. It performs server-side processing including file I/O and media conversion using `ffmpeg`. It cannot be hosted on static hosting services (like Azure Static Web Apps) alone; it requires a backend server environment.

### Prerequisites

*   Python 3.x
*   FFmpeg (Required for media conversion)
*   Docker (Optional, recommended for deployment)

### Installation (Local)

1.  **Install FFmpeg**:
    *   Ubuntu/Debian: `sudo apt update && sudo apt install -y ffmpeg`
    *   macOS: `brew install ffmpeg`
    *   Windows: Download from [ffmpeg.org](https://ffmpeg.org/download.html) and add to PATH.

2.  **Clone the repository** and install dependencies:
    ```bash
    pip install -r requirements.txt
    ```

3.  **Run the application**:
    ```bash
    python app.py
    ```
    Access at `http://127.0.0.1:5000`.

### Deployment to Azure

Since this application requires system dependencies (`ffmpeg`), the recommended way to deploy to Azure is using **Docker** via **Azure App Service for Containers** or **Azure Container Apps**.

#### Option 1: Azure App Service (Docker)

1.  **Build the Docker image**:
    ```bash
    docker build -t tools-for-all .
    ```

2.  **Run locally (to test)**:
    ```bash
    docker run -p 5000:5000 tools-for-all
    ```

3.  **Push to a Container Registry** (e.g., Azure Container Registry or Docker Hub).

4.  **Create an Web App for Containers** in Azure:
    *   Select **Docker Container** as the Publish method.
    *   Choose **Linux** as the OS.
    *   Select your image source.
    *   Azure will automatically pull the image and run it. The `Dockerfile` is configured to use `gunicorn` on port 5000.

#### Resources Needed

*   **Azure App Service Plan**: Basic (B1) or Standard (S1) is recommended for production to ensure enough CPU/Memory for media conversion. Free/Shared tiers might timeout during heavy conversions.
*   **Storage**: The app uses local temporary storage (`uploads/` and `downloads/`). In a containerized environment, these are ephemeral. If you need persistence, mount an Azure File Share.

### Command Line Scripts

The original command line scripts are also available:
*   `mp4_to_mp3.py`
*   `yt_download.py`

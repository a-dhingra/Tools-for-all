# Tools for all

Aim is to publish tools for people to use.

## Tools Available

1.  **MP4 to MP3 Converter**: Convert your MP4 video files to MP3 audio files.
2.  **YouTube Audio Downloader**: Download audio from YouTube videos.

## Web Application

This repository includes a Flask web application to showcase and use these tools via a user-friendly interface.

### Prerequisites

*   Python 3.x
*   FFmpeg (Required for media conversion)

To install FFmpeg on Ubuntu/Debian:
```bash
sudo apt update && sudo apt install -y ffmpeg
```

### Installation

1.  Clone the repository.
2.  Install the required Python packages:
    ```bash
    pip install -r requirements.txt
    ```

### Usage

1.  Run the Flask application:
    ```bash
    python app.py
    ```
2.  Open your web browser and navigate to:
    ```
    http://127.0.0.1:5000
    ```

### Command Line Scripts

The original command line scripts are also available:
*   `mp4_to_mp3.py`
*   `yt_download.py`

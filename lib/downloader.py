from pytube import YouTube
import os

def download_youtube_audio(url, output_path):
    """
    Downloads the audio from a YouTube video and saves it to the specified path.
    Returns the path to the downloaded file.
    """
    try:
        yt = YouTube(url)
        # Filter for audio only, prefer mp4 for compatibility
        stream = yt.streams.filter(only_audio=True, file_extension='mp4').first()

        if not stream:
             stream = yt.streams.filter(only_audio=True).first()

        if not stream:
            raise Exception("No suitable audio stream found")

        # Download to the output_path directory
        downloaded_file = stream.download(output_path=output_path)

        # Rename to mp3? The original script converted it.
        # But pytube download gives an audio file (usually mp4/webm).
        # We can leave it as is or use the converter.
        # For now, let's just return the downloaded file path.
        return downloaded_file
    except Exception as e:
        print(f"Error downloading {url}: {e}")
        raise e

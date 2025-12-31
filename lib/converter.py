from moviepy import AudioFileClip
import os

def convert_mp4_2_mp3(input_path, output_path):
    """
    Converts a single MP4 file to MP3.
    """
    try:
        if not input_path.endswith(".mp4"):
            raise ValueError("Input file must be an MP4 file.")

        if not output_path.endswith(".mp3"):
             output_path = os.path.splitext(output_path)[0] + ".mp3"

        audio_mp4 = AudioFileClip(input_path)
        audio_mp4.write_audiofile(output_path)
        audio_mp4.close()
        return output_path
    except Exception as e:
        print(f"Error converting {input_path}: {e}")
        return None

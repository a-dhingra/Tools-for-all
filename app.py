from flask import Flask, render_template, request, send_file, redirect, url_for, flash
import os
from werkzeug.utils import secure_filename
from lib.converter import convert_mp4_2_mp3
from lib.downloader import download_youtube_audio
import shutil

app = Flask(__name__)
app.secret_key = 'supersecretkey' # Change this in production
app.config['UPLOAD_FOLDER'] = 'uploads'
app.config['DOWNLOAD_FOLDER'] = 'downloads'

# Ensure directories exist
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
os.makedirs(app.config['DOWNLOAD_FOLDER'], exist_ok=True)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/mp4-to-mp3', methods=['GET', 'POST'])
def mp4_to_mp3():
    if request.method == 'POST':
        if 'file' not in request.files:
            flash('No file part')
            return redirect(request.url)
        file = request.files['file']
        if file.filename == '':
            flash('No selected file')
            return redirect(request.url)
        if file and file.filename.endswith('.mp4'):
            filename = secure_filename(file.filename)
            upload_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
            file.save(upload_path)

            output_filename = os.path.splitext(filename)[0] + '.mp3'
            output_path = os.path.join(app.config['DOWNLOAD_FOLDER'], output_filename)

            result = convert_mp4_2_mp3(upload_path, output_path)

            if result:
                return render_template('result.html', title="Conversion Complete", message="Your file has been converted.", download_url=url_for('download_file', filename=output_filename))
            else:
                flash('Error converting file.')
                return redirect(request.url)
        else:
             flash('Invalid file type. Please upload an MP4 file.')
             return redirect(request.url)

    return render_template('mp4_converter.html')

@app.route('/yt-download', methods=['GET', 'POST'])
def yt_download():
    if request.method == 'POST':
        url = request.form.get('url')
        if not url:
            flash('Please enter a URL')
            return redirect(request.url)

        try:
            # We download to downloads folder directly
            downloaded_path = download_youtube_audio(url, app.config['DOWNLOAD_FOLDER'])

            # The original tool converted it to mp3. Let's do that too if it's not mp3
            if not downloaded_path.endswith('.mp3'):
                 # Convert to mp3
                 mp3_path = os.path.splitext(downloaded_path)[0] + '.mp3'
                 convert_mp4_2_mp3(downloaded_path, mp3_path)
                 # Remove original
                 os.remove(downloaded_path)
                 filename = os.path.basename(mp3_path)
            else:
                 filename = os.path.basename(downloaded_path)

            return render_template('result.html', title="Download Complete", message="Your video has been downloaded and converted.", download_url=url_for('download_file', filename=filename))

        except Exception as e:
            flash(f'Error downloading: {str(e)}')
            return redirect(request.url)

    return render_template('yt_downloader.html')

@app.route('/download/<filename>')
def download_file(filename):
    return send_file(os.path.join(app.config['DOWNLOAD_FOLDER'], filename), as_attachment=True)

if __name__ == '__main__':
    app.run(debug=True, port=5000)

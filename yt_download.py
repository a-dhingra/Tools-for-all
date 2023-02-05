from pytube import YouTube
from pytube import Playlist
from moviepy.editor import *
import os
from datetime import time, datetime, date

'''
-------     -------     -------     -------
                  READ ME
-------     -------     -------     -------
- Script has two modes - automatic and manual
    - automatic (default) :
        - music files are downloaded at the default location
        - script will look at song's URL file (list.txt) to download the songs. will NOT consider playlist list.
        
- Before running the script, two text files need to be created:
    - Files should be in the same directory as the script
    - Name of the files would be as below: 
        - "playlist_list.txt" to store URLs for Youtube playlists
        - "list.txt" to store URLs for Youtube songs
    - Each URL should be in a new line. 
    - No Comma separation is required

- Music files will be downloaded in music_files folder in the running directory
    - Within music_files, the folder would be named using the timestamp of the run 
    
- Format of the files will be mp3
'''

mode = 'automatic'  # 'manual' is the other option, where user input would be needed
default_download_location = os.getcwd() + "\\music_files"
time_stamp = str(datetime.now()).replace('-', '').replace(':', '').split('.')[0].replace(' ', '_')
playlist_file = 'playlist_list.txt'
songlist_file = 'list.txt'


def convert_mp4_2_mp3(song):
    if ".mp4" in song:
        print("...mp4 conversion initiated for : ", song)
        audio_mp4 = AudioFileClip(song)
        print('...writing mp3 file now')
        audio_mp4.write_audiofile(song[:-1] + '3')
        audio_mp4.close()
        print(f'Converted this song into mp3- {song[:10]} ... \n')
        print('...deleting  mp4 file from the directory\n')
        os.remove(song)


def convert_mp4_2_mp3_dir(dir):
    print(f'dir is : {dir}')
    list_dir = os.listdir(dir)
    print(f'Number of files in the directory are : {len(list_dir)}')
    for i in list_dir:
        print("Reading file : ", i)
        if ".mp4" in i:
            print("...mp4 conversion initiated for : ", i)
            audio_mp4 = AudioFileClip(i)
            print('...writing mp3 file now')
            audio_mp4.write_audiofile(i[:-1] + '3')
            print('...closing mp4 file now')
            audio_mp4.close()
            print('...deleting  mp4 file from the directory\n')
            print('-' * 30, '\n')
            os.remove(dir + '/' + i)


def down(url, down_location=default_download_location):
    d = YouTube(url)
    d_filter = d.streams.filter(only_audio=True, adaptive=False, abr="128kbps")
    d_stream = d_filter.get_audio_only()
    print(f'Song Name: {d_stream.title}')
    d_stream.download(down_location)


# Working with Playlist
def playlist_down(playlist_link, down_location=default_download_location):
        p = Playlist(playlist_link)
        playlist_name = p.title
        print(playlist_name)
        print('*'*10, '\n')
        songsList = []
        for url in p.video_urls:  # works only for videos, not audios
            print('Song URL in the playlist: ', url)
            songsList.append(url)
            down(url, down_location)
        print('\nThe list of songs in the playlist : \n')
        print(songsList)


# reading playlist from a file
def reading_playlists_from_file(down_location=default_download_location):
    with open(playlist_file, 'r') as f:
        playlists = f.readlines()

    for i in playlists:
        try:
            print(f'\n\nWorking on the playlist with the following URL : {i}')
            playlist_down(i, down_location)
        except Exception as e:
            # to handle exception
            print(str(e))


# reading individual urls from a file
def reading_url_from_file(down_location=default_download_location):
    with open(songlist_file, 'r') as f:
        x = f.readlines()

    for i in x:
        try:
            print(f'Song URL: {i}')
            down(i, down_location)
        except Exception as e:
            # to handle exception
            print(str(e))


def main():
    if mode == 'automatic':
        file_download_location = default_download_location + "\\" + time_stamp
        print('\nFiles will be downloaded to : ', file_download_location)
        print()
        reading_url_from_file(file_download_location)
    else:
        # asking user for local location for file download and using default if not provided
        user_down_loc = input("\tWhat should be the location for downloaded songs: ")
        if user_down_loc:
            file_download_location = user_down_loc + "\\" + time_stamp
            reading_url_from_file(file_download_location)
        else:
            file_download_location = default_download_location + "\\" + time_stamp
            # print('Please enter a valid location.')
            # main()

        print('\nFiles will be downloaded to : ', file_download_location)
        print()

        # asking user if they want to download a playlist or a song
        print("\tDo you have URL of a song or a playlist ? \n(1) Song\n(2) Playlist\n")
        song_o_playlist = input("\tPlease enter the number of your selection: ")

        if song_o_playlist == '1':  # song
            reading_url_from_file(file_download_location)  # song URLs are read from list.txt
        elif song_o_playlist == '2':  # playlist
            reading_playlists_from_file(file_download_location)  # playlist URLs are read from playlist_list.txt

    # running mp4 to mp3 conversion
    print('\n ...initiating mp4 to mp3 conversion')
    print(f'File Download Location is : {file_download_location}')
    os.chdir(file_download_location)
    convert_mp4_2_mp3_dir(file_download_location)


if __name__ == "__main__":
    start_time = datetime.now()
    main()
    # calculating the time taken for the process
    print("--- Time taken : %s ---" % (datetime.now() - start_time))
    print('\n\n*****************\n\tCOMPLETED\n*****************')

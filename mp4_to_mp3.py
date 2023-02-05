from moviepy.editor import *
import os

file_loc = r'C:\Users\anupa\PycharmProjects\Learning_Libraries\youtube_download\file_X\20230204_144136'
os.chdir(file_loc)
files = os.listdir(file_loc)


def convert_mp4_2_mp3(song):
    if ".mp4" in song:
        print(song)
        audio_mp4 = AudioFileClip(song)
        audio_mp4.close()
        print(f'Converted this song into mp3- {song[:10]} ... \n')
        return audio_mp4.write_audiofile(song[:-1]+'3')


def convert_mp4_2_mp3_dir(dir):
    print(f'dir is : {dir}')
    for i in dir:
        print("Reading file : ", i)
        if ".mp4" in i:
            print("mp4 conversion initiated for : ", i)
            audio_mp4 = AudioFileClip(i)
            print('...writing mp3 file now')
            audio_mp4.write_audiofile(i[:-1]+'3')
            print('...closing mp4 file now')
            audio_mp4.close()
            print('...deleting  mp4 file from the directory\n')
            print('-'*30, '\n')
            os.remove(file_loc+'/'+i)
        # print(i)


if __name__ == "__main__":
    convert_mp4_2_mp3_dir(files)




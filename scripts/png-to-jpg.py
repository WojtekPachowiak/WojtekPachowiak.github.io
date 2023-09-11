#python scripts/png-to-jpg.py c:\Users\wojtek\Desktop\Programming\Web\WojtekPachowiak.github.io\image 

from PIL import Image
import sys
import os


images_path = r"www\resources\image"

#list all files in the directory
for f in os.listdir(images_path):
    if f.endswith('.png'):
        i = Image.open(os.path.join(images_path, f))
        i = i.convert('RGB')
        fn, fext = os.path.splitext(f)
        i.save(f'{images_path}/{fn}.jpg')

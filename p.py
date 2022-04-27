import sys
from pdf2image import convert_from_path
import os
  
PDF_file = sys.argv[1]
op_dir = sys.argv[2]
file_name = sys.argv[3]

os.makedirs(op_dir)

pages = convert_from_path(PDF_file, 600)
  
image_counter = 1
  
for page in pages:
    filename = file_name + str(image_counter) + ".jpg"
    page.save(op_dir + "/" + filename, 'JPEG')
    image_counter = image_counter + 1

print(image_counter - 1);
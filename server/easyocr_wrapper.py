import easyocr
import sys

images = []
for path in sys.argv[1:]:
    images.append(path)

if not images:
    print('failure')
for im in images:
    reader = easyocr.Reader(['ja'], gpu=False)
    joined = ''
    res = reader.readtext(im, detail=0)
    for text in res:
        joined += text
    print(joined)
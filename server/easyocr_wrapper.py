import easyocr
import sys

images = []
full = False
for arg in sys.argv[1:]:
    if arg == 'full':
        full = True
    else:
        images.append(arg)

if not images:
    print('failure')
for im in images:
    reader = easyocr.Reader(['ja'], gpu=False)
    joined = ''
    res = reader.readtext(im, detail=0)
    for text in res:
        if full or len(text) > 7:
            joined += text
    print(joined)
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

    #tweaks to improve accuracy around commas
    joined = joined.replace(' ', '、')
    joined = joined.replace(';', '、')
    joined = joined.replace(',', '、')

    #remove leading and ending cjk quotation marks and other undesirable chars
    leading_ending_undesirables = ['「', '」', '『', '』', '(', ')']
    while joined[0] in leading_ending_undesirables:
        joined = joined[1:]
    while joined[-1] in leading_ending_undesirables:
        joined = joined[0:-1]

    #some lol fixes for characters that annoy me
    joined = joined.replace('?', '？')
    joined = joined.replace('!', '！')

    print(joined)

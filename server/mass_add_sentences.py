import json
import urllib.request

API_SENTENCES_ENDPOINT = 'http://localhost:3003/api/sentence_for_character'

def request(action, **params):
    return {'action': action, 'params': params, 'version': 6}


def invoke(action, **params):
    requestJson = json.dumps(request(action, **params)).encode('utf-8')
    response = json.load(urllib.request.urlopen(
        urllib.request.Request('http://localhost:8765', requestJson)))
    if len(response) != 2:
        raise Exception('response has an unexpected number of fields')
    if 'error' not in response:
        raise Exception('response is missing required error field')
    if 'result' not in response:
        raise Exception('response is missing required result field')
    if response['error'] is not None:
        raise Exception(response['error'])
    return response['result']

start = 0
end = 3000

notes_ids = []
notes = []
characters = []
no_sentence_chars = []
one_sentence_chars = []
notes_ids = invoke('findNotes', query='deck:\"Zhongwen Core3k Hanzi\"')
notes = invoke('notesInfo', notes=notes_ids)
for note in notes:
    characters.append(note['fields']['Hanzi']['value'])
for i in range(len(notes_ids)):
    if i >= start and i < end:
        print('Adding sentences for', characters[i], 'character number:', i )
        payload = {'character': characters[i]}
        payload_encoded = urllib.parse.urlencode(payload).encode('utf-8')
        sentences_response = json.load(urllib.request.urlopen(urllib.request.Request(API_SENTENCES_ENDPOINT, payload_encoded)))
        traditional_sentences = ''
        simplified_sentences = ''
        if sentences_response['simplified'] and sentences_response['traditional']:
            #only attempt if there's actually something there
            if len(sentences_response['traditional']) == 1:
                traditional_sentences = sentences_response['traditional'][0]
                one_sentence_chars.append(characters[i])
            else:
                for j in range(len(sentences_response['traditional']) - 1):
                    traditional_sentences += sentences_response['traditional'][j] + '<br>'
                traditional_sentences += sentences_response['traditional'][len(sentences_response) - 1]
            if len(sentences_response['simplified']) == 1:
                simplified_sentences = sentences_response['simplified'][0]
            else:
                for j in range(len(sentences_response['simplified']) - 1):
                    simplified_sentences += sentences_response['simplified'][j] + '<br>'
                simplified_sentences += sentences_response['simplified'][len(sentences_response) - 1]
            invoke('updateNoteFields', note={'id': notes_ids[i], 'fields': {'Traditional Sentences': traditional_sentences, 'Simplified Sentences': simplified_sentences}})
        else:
            print('no sentences found for', characters[i])
            no_sentence_chars.append(characters[i])

print('finished, characters where there wasn\'t a sentence:', no_sentence_chars)
print('characters where there was only 1:', one_sentence_chars)

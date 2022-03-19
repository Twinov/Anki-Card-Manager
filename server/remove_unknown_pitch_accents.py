# Script to clear fields with "No pitch accent data"
# Use at your own risk

import json
import urllib.request

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

CHARACTER_FIELD = 'Front'
FIELDS_TO_CLEAR = ['Graph', 'reading-pitch']

notes_ids = invoke('findNotes', query='"No pitch accent data"')
notes = invoke('notesInfo', notes=notes_ids)
words = []

for i, note in enumerate(notes):
    words.append(note['fields'][CHARACTER_FIELD]['value'])
    print('fixing', words[-1], 'ID: ', notes_ids[i])
    for field in FIELDS_TO_CLEAR:
        if 'No pitch accent data' in note['fields'][field]['value']:
            print('clearing', field)
            invoke('updateNoteFields', note={'id': notes_ids[i], 'fields': {field: ''}})
    print()

print('Successfully fixed', len(notes_ids), 'card(s).')
print('IDs fixed:', notes_ids)
print('Words fixed:', words)
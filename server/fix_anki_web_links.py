# Script to fix web links introduced by Anacreon's daijisen dictionary
# When added from Yomichan, they aren't made clickable by default
# This fixes that makes them clickable
# Use at your own risk

import json
import re
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

field_name = 'Glossary'

notes_ids = invoke('findNotes', query='re:"<li>(https?://.+?\.jpg)"')
notes = invoke('notesInfo', notes=notes_ids)
words = []

for i, note in enumerate(notes):
    words.append(note['fields']['Front']['value'])
    print('fixing', words[-1], 'ID: ', notes_ids[i])
    previous = note['fields'][field_name]['value']
    replacement_text = re.sub(r'<li>(https?://.+?\.jpg)', r'<li><a href="\1">\1</a>', previous)
    print('previous text:')
    print(previous)
    print('new text:')
    print(replacement_text)
    invoke('updateNoteFields', note={'id': notes_ids[i], 'fields': {field_name: replacement_text}})
    print()

print('Successfully fixed', len(notes_ids), 'card(s).')
print('IDs fixed:', notes_ids)
print('Words fixed:', words)
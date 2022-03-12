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

# Enter decks in format: ('deck query', 'field name to match', set())
decks = [('deck:"Mining"', 'Front', set()), ('deck:"Mining"', 'Japanese', set())]

for deck in decks:
    for note in invoke('notesInfo', notes=invoke('findNotes', query=deck[0])):
        if deck[1] in note['fields']:
            deck[2].add(note['fields'][deck[1]]['value'])
print(list(decks[0][2].intersection(*[deck[2] for deck in decks])))

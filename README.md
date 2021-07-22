# Anki-Card-Manager
A frontend for Anki flashcard card creation and field updating.    
Made for my own use, so functionality is only what I need/want.  

Supported functionality:
- Add example sentences to Chinese card decks
- Add mined Japanese sentence cards to Anki in combination with [Yomichan](https://foosoft.net/projects/yomichan/)

# Usage
## SQLite Example Sentences Nodejs Server:
The frontend uses an SQLite loading/querying Node Server to fetch Chinese example sentences to add to cards.  

Run it using `node db-server.js` in the `server` folder. SQLite database pulled from [infinyte7/Chinese-Example-Sentences](https://github.com/infinyte7/Chinese-Example-Sentences) which uses [Tatoeba](https://tatoeba.org/eng/downloads) for example Chinese sentences.

## Svelte Card Manager Frontend
### Developing
In the `anki-card-manager` folder:  
```
npm run dev
```

### Deploying (with Docker)
```
docker build -t [your-tag] ./anki-card-manager
docker run -p 5000:5000 [your-tag]
```

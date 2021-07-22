# Anki-Card-Manager
A frontend for Anki flashcard card creation and field updating.    
Made for my own use, so functionality is only what I need.  
Supported functionality:  
- Add example sentences to Chinese card decks
- Add mined Japanese sentence cards to Anki in combination with [Yomichan](https://foosoft.net/projects/yomichan/)

# Usage
## SQLite Example Sentences Nodejs Server:
The frontend uses the SQLite loading/querying Node Server in `server/db-server.js`.  

Run it using `node db-server.js` in the `server` folder. Sentences SQLite database pulled from  
https://github.com/infinyte7/Chinese-Example-Sentences  
which uses [Tatoeba](https://tatoeba.org/eng/downloads).

## Svelte Card Manager Frontend
### Developing
In the `anki-card-manager` folder:  
```npm run dev```

### Deploying
`docker build -t [your-tag] ./anki-card-manager`  
`docker run -p 5000:5000 [your-tag]`

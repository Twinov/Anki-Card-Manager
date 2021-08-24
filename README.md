# Anki-Card-Manager
A frontend for Anki flashcard card creation and field updating.    
Made for my own use, so functionality is only what I need/want.  

Supported functionality:
- Add example sentences to Chinese card decks
- Add mined Japanese sentence cards to Anki in combination with [Yomichan](https://foosoft.net/projects/yomichan/)  

Example of a pending screenshot to be mined and the result:  
![Pending Screenshot](https://github.com//Twinov/Anki-Card-Manager//blob/main/pendingscreenshot.jpg?raw=true)  
![Result](https://github.com//Twinov/Anki-Card-Manager//blob/main/result.jpg?raw=true)  

# Usage
## Backend Node.js Server:
### Non-Docker
To support features in the frontend, there's a backend Node.js server with various endpoints exposed at port 3003.  

Run it using `node server.js` in the `server` folder. The Chinese example sentences SQLite database was pulled from [infinyte7/Chinese-Example-Sentences](https://github.com/infinyte7/Chinese-Example-Sentences) which uses [Tatoeba](https://tatoeba.org/eng/downloads) for the backing data.  

To enable Japanese card mining, copy `constants_template.js` into a new file called `constants.js` and fill in the complete path to pending screenshots to be mined.  

### Running with Docker
The backend also supports running via Docker. To run it through docker, first go to the `server` directory and then run  

```
docker build . -t <your-tag>
docker run -p <your-port>:3003 -d <your-tag>
```

## React Card Manager Frontend
### Developing
In the `anki-card-manager` folder:  
```
yarn start
```

Note that the backend will need to be running for most features to work properly.

const express = require('express')
const winston = require('winston')
const expressWinston = require('express-winston')
const { spawn } = require('child_process')
const fs = require('fs')
const mv = require('mv')
const sqlite3 = require('sqlite3').verbose()
const fetch = require('node-fetch')
const queue = require('express-queue')

const constants = require('./constants')

let db = new sqlite3.Database('./chinese_sentences.sqlite', sqlite3.OPEN_READONLY, (err) => {
  if (err) {
    console.error(err.message)
  }
  console.log('connected to example sentences database')
})

const app = express()
const port = 3003

app.use(express.urlencoded({ extended: true }))
app.use(express.json())
// app.use(
//   expressWinston.logger({
//     transports: [new winston.transports.Console()],
//     format: winston.format.combine(winston.format.colorize(), winston.format.json()),
//   })
// )

app.use('/api/static', express.static(constants.ANKICARDSLOCATION))
app.use('/api/static', express.static('./assets/'))

app.post('/api/sentence_for_character', (req, res) => {
  console.log(`getting sentences for ${req.body.character}`)
  const sql = `SELECT * FROM examples WHERE simplified LIKE '%${req.body.character}%' LIMIT 5`
  db.all(sql, [], (err, rows) => {
    if (err) {
      res.status(400).json({ error: err.message })
      return console.err(err.message)
    }
    const traditional = []
    const simplified = []
    console.log(`sentences for ${req.body.character}:`)
    rows.forEach((row) => {
      console.log(row.traditional, row.simplified)
      traditional.push(row.traditional)
      simplified.push(row.simplified)
    })
    console.log('')
    res.json({ traditional: traditional, simplified: simplified })
  })
})

app.post('/api/mass_sentence_add', (req, res) => {
  console.log('mass adding Chinese example sentences')
  const python = spawn('python', ['mass_add_sentences.py'])
  python.stdout.on('data', (data) => {
    console.log(data.toString())
  })
  python.on('close', (code) => {
    console.log(`mass_sentence_add.py process closed with code ${code}`)
  })
  res.json({ status: 'success' })
})

app.post('/api/ocr_image', queue({ activeLimit: 1, queuedLimit: -1}), (req, res) => {
  console.log(`running easyocr on image ${req.body.imageLocation}`)
  const python = spawn('python', ['easyocr_wrapper.py', `${constants.ANKICARDSLOCATION}${req.body.imageLocation}`])
  result = ''
  python.stdout.on('data', (data) => {
    result = data.toString().substring(0, data.toString().length - 1)
  })
  python.on('close', (code) => {
    console.log(result)
    console.log(`easyocr_wrapper.py process closed with code ${code}`)
    res.json({ result: result })
  })
})

app.get('/api/pending_card_names', (req, res) => {
  console.log('retrieving pending card names')
  const pendingCards = []
  fs.readdir(constants.ANKICARDSLOCATION, (err, files) => {
    if (err) {
      throw err
    }

    files.forEach((file) => {
      pendingCards.push(file)
    })

    res.json({ cardNames: pendingCards })
  })
})

app.post('/api/delete_image', (req, res) => {
  console.log(`deleting image ${req.body.imageLocation}`)
  try {
    fs.unlinkSync(`${constants.ANKICARDSLOCATION}${req.body.imageLocation}`)
    res.json({ status: 'success' })
  } catch (error) {
    console.log(error)
    res.json({ status: 'failure' })
  }
})

app.post('/api/move_image_to_done', (req, res) => {
  console.log(`moving image ${req.body.imageLocation} to done folder`)
  try {
    const oldPath = `${constants.ANKICARDSLOCATION}${req.body.imageLocation}`
    const newPath = `${constants.ANKIDONECARDSLOCATION}${req.body.imageLocation}`
    mv(oldPath, newPath, {clobber: false}, function (err) {
      if (err) {
        console.log(err)
      } else {
        res.json({ status: 'success' })
      }
    })
  } catch (error) {
    console.log(error)
    res.json({ status: 'failure' })
  }
})

app.post('/api/find_note_wrapper', (req, res) => {
  console.log(`getting note IDs for query: ${req.body.query}`)
  fetch(constants.ANKICONNECTENDPOINT, {
    method: 'POST',
    body: JSON.stringify({
      action: 'findNotes',
      version: 6,
      params: {
        query: req.body.query,
      },
    }),
  })
    .then((response) => response.json())
    .then((response) => res.json(response))
})

app.post('/api/note_info_wrapper', (req, res) => {
  console.log(`getting note information for note IDs: ${req.body.cardIDs}`)
  fetch(constants.ANKICONNECTENDPOINT, {
    method: 'POST',
    body: JSON.stringify({
      action: 'notesInfo',
      version: 6,
      params: {
        notes: JSON.parse(req.body.cardIDs)
      },
    }),
  })
    .then((response) => response.json())
    .then((response) => res.json(response))
})

app.post('/api/add_image_to_card', (req, res) => {
  console.log(`Adding image ${req.body.imageLocation} to card ${req.body.cardID}`)

  fetch(constants.ANKICONNECTENDPOINT, {
    method: 'POST',
    body: JSON.stringify({
      action: 'updateNoteFields',
      version: 6,
      params: {
        note: {
          id: req.body.cardID,
          fields: {
            Source: '',
          },
          picture: [
            {
              url: `http://localhost:${port}/api/static/${req.body.imageLocation}`,
              filename: req.body.imageLocation,
              fields: ['Source'],
            },
          ],
        },
      },
    }),
  })
    .then((response) => response.json())
    .then((response) => res.json(response))
})

app.listen(port, () => {
  console.log(`Anki Card Manager backend listening on localhost port ${port}`)
})

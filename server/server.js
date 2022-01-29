const express = require('express')
const winston = require('winston')
const expressWinston = require('express-winston')
const { spawn } = require('child_process')
const fs = require('fs')
const mv = require('mv')
const sqlite3 = require('sqlite3').verbose()
const fetch = require('node-fetch')
const queue = require('express-queue')
const im = require('imagemagick')

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
app.use(express.json({ limit: '50mb' }))
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

app.post('/api/add_image_to_queue', (req, res) => {
  console.log('adding image to queue')
  let timestamp = new Date()
  const baseImage = req.body.image

  // from https://stackoverflow.com/a/54662788
  const ext = baseImage.substring(baseImage.indexOf('/') + 1, baseImage.indexOf(';base64'))
  const fileType = baseImage.substring('data:'.length, baseImage.indexOf('/'))
  const regex = new RegExp(`^data:${fileType}\/${ext};base64,`, 'gi')
  const base64Data = baseImage.replace(regex, '')

  const imageFilename = timestamp.toISOString().slice(0, 19).replace(':', '').replace(':', '') + '.' + ext
  console.log(imageFilename)
  require('fs').writeFile(`${constants.ANKICARDSLOCATION}${imageFilename}`, base64Data, 'base64', function (err) {
    if (err) return console.log(err)
  })
  console.log(`${constants.ANKICARDSLOCATION}${imageFilename} successfully created`)
  res.json({ status: 'success' })
})

app.post('/api/ocr_image', queue({ activeLimit: 1, queuedLimit: -1 }), (req, res) => {
  console.log(`running easyocr on image ${req.body.imageLocation}`)
  var startTime = new Date()
  const python = spawn('python', ['easyocr_wrapper.py', `${constants.ANKICARDSLOCATION}${req.body.imageLocation}`])
  result = ''
  python.stdout.on('data', (data) => {
    result = data.toString().substring(0, data.toString().length - 1)
  })
  python.on('close', (code) => {
    console.log(result)
    console.log(`easyocr_wrapper.py process closed with code ${code} in ${Math.round((new Date() - startTime) / 1000)} seconds`)
    res.json({ result: result })
  })
})

app.post('/api/full_ocr_image', queue({ activeLimit: 1, queuedLimit: -1 }), (req, res) => {
  console.log(`running full easyocr on image ${req.body.imageLocation}`)
  var startTime = new Date()
  const python = spawn('python', ['easyocr_wrapper.py', 'full', `${constants.ANKICARDSLOCATION}${req.body.imageLocation}`])
  result = ''
  python.stdout.on('data', (data) => {
    result = data.toString().substring(0, data.toString().length - 1)
  })
  python.on('close', (code) => {
    console.log(result)
    console.log(`easyocr_wrapper.py process closed with code ${code} in ${Math.round((new Date() - startTime) / 1000)} seconds`)
    res.json({ result: result })
  })
})

app.post('/api/autocrop_image', (req, res) => {
  console.log(`running autocrop on ${req.body.imageLocation}`)
  const fileLoc = `${constants.ANKICARDSLOCATION}${req.body.imageLocation}`
  im.convert([fileLoc, '-trim', '+repage', fileLoc], function (err, stdout) {
    if (err) throw err
    console.log(`finished autocrop for ${req.body.imageLocation}`)
    res.json({ result: 'success' })
  })
})

app.get('/api/pending_card_names', (req, res) => {
  console.log('retrieving pending card names')
  const pendingCards = []
  fs.readdir(constants.ANKICARDSLOCATION, (err, files) => {
    if (err) {
      throw err
    }
    filesSorted = files
      .map(function (fileName) {
        return {
          name: fileName,
          time: fs.statSync(constants.ANKICARDSLOCATION + '/' + fileName).mtimeMs,
        }
      })
      .sort(function (a, b) {
        return a.time - b.time
      })
      .map(function (v) {
        return v.name
      })
    //change to filesSorted for sorted based on time, current is based on name
    files.forEach((file) => {
      if (file !== '.directory') pendingCards.push(file)
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
    mv(oldPath, newPath, { clobber: false }, function (err) {
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
        notes: JSON.parse(req.body.cardIDs),
      },
    }),
  })
    .then((response) => response.json())
    .then((response) => res.json(response))
})

app.post('/api/add_image_to_card', (req, res) => {
  if (req.body.sourceText)
    console.log(`Adding image ${req.body.imageLocation} with text ${req.body.sourceText} to card ${req.body.cardID}`)
  else
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
            Source: req.body.sourceText,
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

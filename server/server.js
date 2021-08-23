const express = require('express')
const winston = require('winston')
const expressWinston = require('express-winston')
const { spawn } = require('child_process')
const fs = require('fs')
const sqlite3 = require('sqlite3').verbose()

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
app.use(
  expressWinston.logger({
    transports: [new winston.transports.Console()],
    format: winston.format.combine(winston.format.colorize(), winston.format.json()),
  })
)

app.post('/api/sentence_for_character', (req, res) => {
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
  const python = spawn('python', ['mass_add_sentences.py'])
  python.stdout.on('data', (data) => {
    console.log(data.toString())
  })
  python.on('close', (code) => {
    console.log(`child process close with code ${code}`)
  })
  res.json({ status: 'success' })
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

app.listen(port, () => {
  console.log(`Sentence database API listening on localhost port ${port}`)
})
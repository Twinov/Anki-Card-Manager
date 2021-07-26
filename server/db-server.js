const express = require('express')
const { spawn } = require('child_process')
const sqlite3 = require('sqlite3').verbose()

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
  res.json({ 'status': 'success' })
})

app.listen(port, () => {
  console.log(`Sentence database API listening on localhost port ${port}`)
})

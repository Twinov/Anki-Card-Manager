const http = require('http')
const sqlite3 = require('sqlite3').verbose()

let db = new sqlite3.Database('./chinese_sentences.sqlite', sqlite3.OPEN_READONLY, (err) => {
  if (err) {
    console.error(err.message)
  }
  console.log('connected to example sentences database')
})

const requestListener = function (req, res) {
  res.writeHead(200)
  res.end('Hello, World!')
}

let sql = `SELECT traditional FROM examples limit 5`

db.all(sql, [], (err, rows) => {
  if (err) {
    throw err
  }
  rows.forEach((row) => {
    console.log(row)
  })
})

const server = http.createServer(requestListener)
server.listen(8080)

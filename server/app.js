


const { log } = console

const express = require('express')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const path = require('path')
const routes = require('./router')

const app = new express()
let output = process.env.OUTPUT || 'dist'
app.use(express.static(path.resolve(__dirname, '../'+output)))
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}))
app.use(cookieParser())

app.use('/', routes)

/** start the app */
app.start = (port, host = 'localhost') => {
  app.set('port', port)
  app.set('host', host)
  const server = app.listen(port, host, () => {
    const host = server.address().address
    const port = server.address().port
    log(`Server is running on http://${host}:${port}`)
  })
}

module.exports = app
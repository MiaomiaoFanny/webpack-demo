


const { host, port } = require('../config/environment').backend
const app = require('./app')

app.start(port, host)

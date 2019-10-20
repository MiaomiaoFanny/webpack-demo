
const express = require('express');
const router = express.Router()
const controller = require('./controller')

router.use((req, res, next) => {
  console.log('Time', new Date(), req.method, req.url)
  next()
})
router.get('/', controller.home)
router.get('/info', controller.info)
router.post('/login', controller.login)

module.exports = router
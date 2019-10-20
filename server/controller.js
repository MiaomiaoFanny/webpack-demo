


exports.home = (req, res) => {
  res.end('You are in Server Side')
}

exports.info = (req, res) => {
  res.json(['info'])
}

exports.login = (req, res) => {
  res.json({
    code: 0,
    message: 'login success'
  })
}

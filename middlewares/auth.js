module.exports = (req, res, next) => {
  console.log(req.session)
  if (req.session.authenticated) {
    var tens = 10000
    req.session.cookie.expires = new Date(Date.now() + tens)
    req.session.cookie.maxAge = tens
    next()
  } else {
    res.redirect('/login')
  }
}
var express = require('express');
var router = express.Router();
const sha1 = require('sha1')
const conn = require('../lib/conn')

router.get('/login', (req, res, next) => {
  var obj = {
    title: 'Login',
    partials: ['styles']
  }

  if (req.query.error) {
    obj.err = "Something isn't right"
  }

  res.render('login', obj)
})

router.post('/login', (req, res, next) => {
  const username = req.body.username
  const password = req.body.password

  const sql = 'SELECT count(1) as count FROM users WHERE username = ? AND password = ?'

  conn.query(sql, [req.body.username, sha1(req.body.password)], (err, results, fields) => {
    console.log(results, results[0].count)
    if (results[0].count > 0) {
      req.session.authenticated = true

      console.log(req.session)
      res.redirect('/')
    } else {
      res.redirect('/login?error=true')
    }
  })
})

router.post('/register', (req, res, next) => {
  const username = req.body.username
  const password = req.body.password
  const confirm = req.body.confirmpassword

  if (password !== confirm || password === '' || username === '') {
    res.redirect('/login?error=true')
  } else {
    const sql = `
      INSERT INTO users (username, password) VALUES (?, ?)
    `

    conn.query(sql, [req.body.username, sha1(req.body.password)], (err, results, fields) => {
      req.session.authenticated = true

      res.redirect('/')
    })
  }
})

router.get('/logout', (req, res, next) => {
  req.session.destroy(() => {
    res.redirect('/login')
  })
})

module.exports = router
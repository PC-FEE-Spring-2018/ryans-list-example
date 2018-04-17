var express = require('express');
var router = express.Router();
const shortid = require('shortid')

const conn = require('../lib/conn')

/* GET home page. */
router.get('/', function(req, res, next) {
  const query = `
    SELECT * FROM categories
  `

  conn.query(query, (err, results, fields) => {
    const cats = results.filter(cat => cat.parent_id === null).map(cat => {
      cat.children = results.filter(child => child.parent_id === cat.id)

      return cat
    })

    res.render('index', {
      title: "Ryan's List",
      partials: ['styles'],
      cats: cats
    })
  })
})

router.get('/create-post/:slug', (req, res, next) => {
  res.render('post-form', {
    title: 'Post Form',
    partials: ['styles'],
    slug: req.params.slug
  })
})

router.post('/add-post', (req, res, next) => {
  const categorySql = `SELECT id FROM categories WHERE slug = ?`
  const sql = `INSERT INTO posts (name, description, slug, category_id)
                          values (?, ? ,?, ?)`

  conn.query(categorySql, [req.body.slug], (err, results, fields) => {
    if (!err) {
      conn.query(sql, [req.body.name, req.body.description, shortid.generate(), results[0].id], (err2, results2, fields2) => {
        res.redirect('/' + req.body.slug)
      })
    }
  })
})

router.get('/view-post/:slug', (req, res, next) => {
  const sql = 'SELECT * FROM posts WHERE slug = ?'

  conn.query(sql, [req.params.slug], (err, results, fields) => {
    res.render('post', {
      title: results[0].name,
      partials: ['styles'],
      name: results[0].name,
      description: results[0].description
    })
  })
})

router.get('/:slug/:view?', (req, res, next) => {
  const query = `SELECT id, name FROM categories WHERE slug = ?`

  conn.query(query, [req.params.slug], (err, results, fields) => {
    if (results.length > 0) {
      const id = results[0].id

      const sql = `
select p.*
from posts p
left join categories c on p.category_id = c.id
where p.category_id = ? or c.parent_id = ?
      `

      conn.query(sql, [id, id], (err2, results2, fields2) => {
        res.render('listings', {
          view: req.params.view || 'list',
          title: results[0].name,
          posts: results2,
          categoryslug: req.params.slug
        })
      })
    } else {
      next()
    }
  })
})

module.exports = router;

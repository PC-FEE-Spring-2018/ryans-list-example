const mysql = require('mysql')
const config = require('../config/default.json')

const conn = mysql.createConnection(config.db)

conn.connect()

module.exports = conn
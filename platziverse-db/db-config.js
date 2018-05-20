'use strict'
const debug = require('debug')('platziverse:db:setup')

module.exports = function (init = true) {
  return {
    database: process.env.DB_NAME || 'platziverse',
    username: process.env.DB_USER || 'platzi',
    password: process.env.DB_PASS || 'platzi',
    host: process.env.DB_HOST || 'localhost',
    dialect: 'postgres',
    operatorsAliases: false,
    logging: s => debug(s),
    setup: init
  }
}

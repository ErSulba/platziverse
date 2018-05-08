'use strict'

const Sequuelize = require('sequelize')
let sequuelize = null

module.exports = function setupDataBase (config) {
  if (!sequuelize) {
    sequuelize = new Sequuelize(config)
  }

  return sequuelize
}

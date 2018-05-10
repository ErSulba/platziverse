'use strict'

const test = require('ava')

/* here we are adding a ligging function to the config in memory */
let config = {
  logging: function () {}
}

let db = null // here we are declaring the db global var so we can use it in the test

/* Connecting to the databse before each test */
test.beforeEach(async () => {
  const setupDatabase = require('../')
  db = await setupDatabase(config)
})

/* here we are making the real test of the Agent model with the Ava module */
test('Agent', t => {
  t.truthy(db.Agent, 'Agent service should exist')
})

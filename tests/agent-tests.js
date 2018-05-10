'use strict'

const test = require('ava')
const sinon = require('sinon')
const proxyquire = require('proxyquire')
const agentFixtures = require('./fixtures/agent')

/* here we are adding a ligging function to the config in memory */
let config = {
  logging: function () {}
}

/** Creating the metric stub that will overwrite the real one in order to use it for tests porpuses
 * here we are using the sinon module to know if the instance has been called
 */
let MetricStub = {
  belongsTo: sinon.spy()
}

let single = Object.assign({}, agentFixtures.single)
let id= 1
let AgentStub = null
let db = null // here we are declaring the db global var so we can use it in the test
let sandbox = null

/** Connecting to the databse before each test
 * we create a new sinon sandbox and assing it to the AgentStub
 * before that, we are using proxyquire to overwrite the functions of the real models
*/
test.beforeEach(async () => {
  sandbox = sinon.createSandbox()

  AgentStub = {
    hasMany: sandbox.spy()
  }

  const setupDatabase = proxyquire('../', {
    './models/agent': () => AgentStub,
    './models/metric': () => MetricStub
  })

  db = await setupDatabase(config)
})

/* here we are making the real test of the Agent model with the Ava module */
test('Agent', t => {
  t.truthy(db.Agent, 'Agent service should exist')
})

/* Serial tests using sinon */
test.serial('Setup', t => {
  t.true(AgentStub.hasMany.called, 'AgentModel.hasMany was executed')
  t.true(AgentStub.hasMany.calledWith(MetricStub), 'Argument should be the MetricModel')
  t.true(MetricStub.belongsTo.called, 'MetricModel.belongsTo was executed')
  t.true(MetricStub.belongsTo.calledWith(AgentStub), 'Argument should be the AgentModel')
})

test.serial('AgentFindById', async t => {
  let agent = await db.Agent.findById(id)

  t.deepEqual(agent, agentFixtures.byId(id), 'Should be the same')
})

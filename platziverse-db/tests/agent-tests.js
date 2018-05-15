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
let id = 1
let uuid = 'yyy-yyy-yyy'
let AgentStub = null
let db = null // here we are declaring the db global var so we can use it in the test
let sandbox = null

let uuidArgs = {
  where: {
    uuid
  }
}

let usernameArgs = {
  where: {
    username: 'platzi',
    connected: true
  }
}

let connectedArgs = {
  where: {
    connected: true
  }
}

let newAgent = {
  uuid: '123-123-123',
  name: 'test',
  username: 'test',
  hostname: 'test',
  pid: 0,
  connected: false
}

/** Connecting to the databse before each test
 * we create a new sinon sandbox and assing it to the AgentStub
 * before that, we are using proxyquire to overwrite the functions of the real models
*/
test.beforeEach(async () => {
  sandbox = sinon.createSandbox()

  AgentStub = {
    hasMany: sandbox.spy()
  }

  // Model findOne Stub
  AgentStub.findOne = sandbox.stub()
  AgentStub.findOne.withArgs(uuidArgs).returns(Promise.resolve(agentFixtures.byUuid(uuid)))

  // Model create Stub
  AgentStub.create = sandbox.stub()
  AgentStub.create.withArgs(newAgent).returns(Promise.resolve({
    toJSON () { return newAgent }
  }))

  // Model update Stub
  AgentStub.update = sandbox.stub()
  AgentStub.update.withArgs(single, uuidArgs).returns(Promise.resolve(single))

  // Model findAll
  AgentStub.findAll = sandbox.stub()
  AgentStub.findAll.withArgs().returns(Promise.resolve(agentFixtures.all))
  AgentStub.findAll.withArgs(connectedArgs).returns(Promise.resolve(agentFixtures.connected))
  AgentStub.findAll.withArgs(usernameArgs).returns(Promise.resolve(agentFixtures.platzi))
  // Model findByid Stub
  AgentStub.findById = sandbox.stub()
  //  This line means: when i call AgentStub.findByid with the argument "id" it will return a promise with the fixture of Agent with the given id
  AgentStub.findById.withArgs(id).returns(Promise.resolve(agentFixtures.byId(id)))
  // Here we are overwriting the models with our stubs to make some tests without calling the real functions
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

  t.true(AgentStub.findById.called, 'findById')
  t.true(AgentStub.findById.calledOnce, 'findById Should be called once')
  t.true(AgentStub.findById.calledWith(id), 'findById should be called with a an ID')
  t.deepEqual(agent, agentFixtures.byId(id), 'Should be the same')
})

test.serial('Agent#findAll', async t => {
  let agents = await db.Agent.findAll()

  t.true(AgentStub.findAll.called, 'findAll should be called on model')
  t.true(AgentStub.findAll.calledOnce, 'findAll should be called once')
  t.true(AgentStub.findAll.calledWith(), 'findAll should be called without args')

  t.is(agents.length, agentFixtures.all.length, 'agents should be the same amount')
  t.deepEqual(agents, agentFixtures.all, 'agents should be the same')
})

test.serial('Agent#findByUsername', async t => {
  let agents = await db.Agent.findByUsername('platzi')

  t.true(AgentStub.findAll.called, 'findAll should be called on model')
  t.true(AgentStub.findAll.calledOnce, 'findAll should be called once')
  t.true(AgentStub.findAll.calledWith(usernameArgs), 'findAll should be called with username args')

  t.is(agents.length, agentFixtures.platzi.length, 'agents should be the same amount')
  t.deepEqual(agents, agentFixtures.platzi, 'agents should be the same')
})

test.serial('Agent#findConnected', async t => {
  let agents = await db.Agent.findConnected()

  t.true(AgentStub.findAll.called, 'findAll should be called on model')
  t.true(AgentStub.findAll.calledOnce, 'findAll should be called once')
  t.true(AgentStub.findAll.calledWith(connectedArgs), 'findAll should be called with connected args')

  t.is(agents.length, agentFixtures.connected.length, 'agents should be the same amount')
  t.deepEqual(agents, agentFixtures.connected, 'agents should be the same')
})

test.serial('Agent#CreateOrUpdate -Exist', async t => {
  let agent = await db.Agent.createOrUpdate(single)

  t.true(AgentStub.findOne.called, 'findOne should be called')
  t.true(AgentStub.findOne.calledTwice, 'findOne should be called twice')
  t.true(AgentStub.update.calledOnce, 'update should be called once')

  t.deepEqual(agent, single, 'agent should be the same')
})

test.serial('Agent#CreateOrUpdate -New', async t => {
  let agent = await db.Agent.createOrUpdate(newAgent)

  t.true(AgentStub.findOne.called, 'findOne should be called')
  t.true(AgentStub.findOne.calledOnce, 'findOne should be called Once')
  t.true(AgentStub.findOne.calledWith({
    where: { uuid: newAgent.uuid }
  }), 'create should be called with args')

  t.true(AgentStub.create.called, 'create should be called')
  t.true(AgentStub.create.calledOnce, 'create should be called Once')
  t.true(AgentStub.create.calledWith(newAgent), 'create should be called with arguments')

  t.deepEqual(agent, newAgent, 'agent sould be the same')
})

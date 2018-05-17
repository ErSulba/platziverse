'use strict'

const util = require('../../utils')

const extend = util.extend
/**
 * Agents Fixture: these are the fake data we use to make some test without using a real DB conection
 */
const agent = {
  id: 1,
  uuid: 'yyy-yyy-yyy',
  name: 'fixture',
  username: 'platzi',
  hostname: 'test-host',
  pid: 0,
  connected: true,
  createdAt: new Date(),
  updatedAT: new Date()
}

const agents = [
  agent,
  extend(agent, {
    id: 2,
    uuid: 'yyy-yyy-yyx',
    connected: false,
    username: 'test'}),
  extend(agent, {
    id: 4,
    uuid: 'yyy-yyy-yyz'
  }),
  extend(agent, {
    id: 4,
    uuid: 'yyy-yyy-yyz',
    username: 'platzi'
  })

]

module.exports = {
  single: agent,
  all: agents,
  connected: agents.filter(a => a.connected),
  platzi: agents.filter(a => a.username === 'platzi'),
  byUuid: id => agents.filter(a => a.uuid === id).shift(),
  byId: id => agents.filter(a => a.id === id).shift()

}

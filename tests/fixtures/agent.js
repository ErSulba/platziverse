'use strict'

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
  extend(agent, { id: 2, uuid: 'yyy-yyy-yyx', connected: false, username: 'test'}),
  extend(agent, { id: 4, uuid: 'yyy-yyy-yyz'}),
  extend(agent, { id: 4, uuid: 'yyy-yyy-yyz', username: 'platzi'})

]

/**
 * Function to create copys of an object and rewrite some of its values
 * @param {object} obj
 * @param {*} values
 */
function extend (obj, values) {
  const clone = Object.assign({}, obj)
  return Object.assign(clone, values)
}

module.exports = {
  single: agent,
  all: agents,
  connected: agents.filter(a => a.connected),
  platzi: agents.filter(a => a.username === 'platzi'),
  byUuid: id => agents.filter(a => a.uuid === id).shift(),
  byId: id => agents.filter(a => a.id === id).shift()

}

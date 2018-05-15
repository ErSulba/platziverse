'use strict'

module.exports = function setupAgent (AgentModel) {
  /**
   * Function that wraps a method for the Agent Model
   * @param {int} id
   */
  function findById (id) {
    return AgentModel.findById(id)
  }

  /**
   * function that wraps a method for the agent model
   * @param {object} agent
   */
  async function createOrUpdate (agent) {
    const cond = {
      where: {
        uuid: agent.uuid
      }
    }

    const existingAgent = await AgentModel.findOne(cond)

    if (existingAgent) {
      const updated = await AgentModel.update(agent, cond)
      return updated ? AgentModel.findOne(cond) : existingAgent
    }

    const result = await AgentModel.create(agent)
    return result.toJSON()
  }
  /**
   * Function that returns a user for a given uuid
   * @param {string} uuid
   */
  function findByUuid (uuid) {
    return AgentModel.findOne({
      where: {
        uuid
      }
    })
  }

  /**
   * Function that returns a list of the users
   */
  function findAll () {
    return AgentModel.findAll()
  }

  /**
   * function that returns all the users connected at the moment
   */
  function findConnected () {
    return AgentModel.findAll({
      where: {
        connected: true
      }
    })
  }

  function findByUsername (username) {
    return AgentModel.findAll({
      where: {
        username,
        connected: true
      }
    })
  }
  return {
    findById,
    createOrUpdate,
    findByUuid,
    findAll,
    findConnected,
    findByUsername
  }
}

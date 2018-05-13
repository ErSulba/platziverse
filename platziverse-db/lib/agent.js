'use strict'

module.exports = function setupAgent (AgentModel) {
  /**
   * Function that wraps a method for the Agent Model
   * @param {int} id
   */
  function findById (id) {
    return AgentModel.findById(id)
  }

  return {
    findById
  }
}

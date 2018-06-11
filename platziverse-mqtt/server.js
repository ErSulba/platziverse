'use strict'

const debug = require('debug')('platziverse:mqtt')
const mosca = require('mosca')
const redis = require('redis')
const chalk = require('chalk')
const db = require('platziverse-db')
const config = require('../platziverse-db/db-config')(false)
const { parsePayload } = require('./utils')

// Configuration of Mosca back-end
const backend = {
  type: 'redis',
  redis,
  return_buffers: true
}

// Conf object for the MQTT mosca server
const settings = {
  port: 1883,
  backend /* This info is stored in the backend object */
}

// Instancia del servidor MQTT con Mosca
const server = new mosca.Server(settings)

// El objeto Map puede iterar sobre sus elementos
const clients = new Map()

// Servicio de Agente y Métricas
// Inicialización de las variables globales
let Agent, Metric

// Determina cuando un cliente se CONECTA al servidor
server.on('clientConnected', client => {
  debug(`Client Connected: ${client.id}`)
  // El método set inserta una clave y un valor al objeto Map
  clients.set(client.id, null)
})

// Determina cuando un cliente se DESCONECTA al servidor
server.on('clientDisconnected', async (client) => {
  debug(`Client Disconnected: ${client.id}`)
  const agent = clients.get(client.id)

  // Cuando el cliente se desconecte
  // Verificar si se registró en la DB
  if (agent) {
    // Mark Agent as Disconneted
    agent.connected = false

    try {
      // Crear o actualizar el agente en la DB: "Lo desconecta"
      await Agent.createOrUpdate(agent)
    } catch (e) {
      return handlerError(e)
    }

    // Delete Agent from Clients List
    clients.delete(client.id)
    // Notificación para todos los clientes conectados y estan que están escuchando en el evento AgentDisconnected que un agente se desconectó
    // Publicar un mensaje...
    server.publish({
      topic: 'agent/disconnected',
      payload: JSON.stringify({
        agent: {
          uuid: agent.uuid
        }
      })
    })
    debug(`Client (${client.id}) associated to Agent (${agent.uuid}) marked as disconnected`)
  }
})

// Determina cuando se PUBLICA un mensaje
server.on('published', async (packet, client) => {
  debug(`Received: ${packet.topic}`) /* Tipo de mensaje: Agent connected|disconnected|message */

  // Evaluación de casos con SWITCH
  switch (packet.topic) {
    // En caso de [Agente conectado]
    case 'agent/connected':
      break
    // En caso de [Agente desconectado]
    case 'agent/disconnected':
      debug(`Payload: ${packet.payload}`) /* La información: el mensaje */
      break
    // En caso de [Mensaje del Agente]
    case 'agent/message':
      debug(`Payload: ${packet.payload}`) /* La información: el mensaje */
      // to JSON
      const payload = parsePayload(packet.payload) /* Test: Mnesaje no transformado a JSON */
      if (payload) {
        // Establecer en modo "conectado" al agente
        payload.agent.connected = true

        let agent
        // Almacenar el agente en la DB /|
        try {
          // Crear o actualizar el agente en la DB: "Lo conecta"
          agent = await Agent.createOrUpdate(payload.agent)
        } catch (e) {
          return handlerError(e)
        }

        // Mensaje en la terminal: El agente fue almacenado
        debug(`Àgent ${agent.uuid} saved`)

        // Notify Agent is Connected
        // Si no tengo información del agente que se está notificando en el momento
        if (!clients.get(client.id)) {
          // Por medio de su ID se le agrega dicha información al agente
          clients.set(client.id, agent)
          // Notificación para todos los clientes conectados y estan que están escuchando en el evento AgentConnected que un agente se conectó
          // Publicar un mensaje...
          server.publish({
            topic: 'agent/connected',
            payload: JSON.stringify({
              agent: {
                uuid: agent.uuid,
                name: agent.name,
                hostname: agent.hostname,
                pid: agent.pid,
                connected: agent.connected
              }
            })
          })
        }

        // Almacenar las métricas en la DB /|
        // Store Metrics

        // for in: obj[i] -> Values
        // for of: Values
        for (let metric of payload.metrics) {
          let m

          try {
            m = await Metric.create(agent.uuid, metric)
          } catch (e) {
            return handlerError(e)
          }

          debug(`Metric ${m.id} saved on agent ${agent.uuid}`)
        }
      }
      break
  }
})

// Running
server.on('ready', async () => {
  // Cuando el servidor este OK
  // Requerir los servicios de Agent y Metric
  const services = await db(config).catch(handlerFatalError)
  // Establecer variables globales para los servicios
  Agent = services.Agent
  Metric = services.Metric
  console.log(`${chalk.green('PLATZIVERSE-MQTT ===>')} server is running`)
})

// Manejo de errores
server.on('error', handlerFatalError)

// Error fatal del servidor
function handlerFatalError (err) {
  console.error(`${chalk.red('FATAL ERROR ===>')} ${err.message}`)
  console.error(err.stack)
  process.exit(1)
}

// Error del servidor
function handlerError (err) {
  console.error(`${chalk.red('ERROR ===>')} ${err.message}`)
  console.error(err.stack)
}

// [Buena práctica] Manejo de excepciones
process.on('uncaughtException', handlerFatalError)

// [Buena práctica] Manejo de rechazo de promesas
process.on('unhandledRejection', handlerFatalError)

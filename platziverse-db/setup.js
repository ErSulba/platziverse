'use strict'

const inquirer = require('inquirer')
const chalk = require('chalk')
const db = require('./')
const argv = require('yargs').argv
const config = require('./db-config')()

const prompt = inquirer.createPromptModule()

async function setup () {
  if (!argv.y) {
    const answer = await prompt([
      {
        type: 'confirm',
        name: 'setup',
        message: 'This will destroy your databsae, are you sure?'
      }
    ])
    if (!answer.setup) {
      return console.log(`${chalk.blue('Nothing Happened :)')} `)
    }
  }

  await db(config).catch(handleFatalError)

  console.log(`${chalk.green('Succes!!')}`)
  process.exit(0)
}

function handleFatalError (err) {
  console.error(`${chalk.red('Fatal Error')} ${err.message} `)
  console.error(err.stack)
  process.exit(1)
}

setup()

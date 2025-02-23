// @ts-check
const inquirer = require('inquirer')

const { chalk, log } = require('../../utils')
const { login } = require('../login')

const LOGIN_NEW = 'I would like to login to a new account'

/**
 * The switch command
 * @param {import('commander').OptionValues} options
 * @param {import('../base-command').BaseCommand} command
 */
const switchCommand = async (options, command) => {
  const availableUsersChoices = Object.values(command.netlify.globalConfig.get('users') || {}).reduce(
    (prev, current) =>
      Object.assign(prev, { [current.id]: current.name ? `${current.name} (${current.email})` : current.email }),
    {},
  )

  const { accountSwitchChoice } = await inquirer.prompt([
    {
      type: 'list',
      name: 'accountSwitchChoice',
      message: 'Please select the account you want to use:',
      choices: [...Object.entries(availableUsersChoices).map(([, val]) => val), LOGIN_NEW],
    },
  ])

  if (accountSwitchChoice === LOGIN_NEW) {
    await login({ new: true }, command)
  } else {
    const selectedAccount = Object.entries(availableUsersChoices).find(
      ([, availableUsersChoice]) => availableUsersChoice === accountSwitchChoice,
    )
    command.netlify.globalConfig.set('userId', selectedAccount[0])
    log('')
    log(`You're now using ${chalk.bold(selectedAccount[1])}.`)
  }
}

/**
 * Creates the `netlify switch` command
 * @param {import('../base-command').BaseCommand} program
 * @returns
 */
const createSwitchCommand = (program) =>
  program.command('switch').description('Switch your active Netlify account').action(switchCommand)

module.exports = { createSwitchCommand }

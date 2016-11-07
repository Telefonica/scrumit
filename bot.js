const SlackBot = require('slackbots')

const BOT_TOKEN = process.env.BOT_TOKEN

console.log('Starting bot with token ' + BOT_TOKEN)

const bot = new SlackBot({
  token: BOT_TOKEN,
  name: 'Scrumit'
})

module.exports = bot

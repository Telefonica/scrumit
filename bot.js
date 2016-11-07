var SlackBot = require('slackbots');

var BOT_TOKEN = process.env.BOT_TOKEN;

console.log('Starting bot with token ' + BOT_TOKEN);

var bot = new SlackBot({
    token: BOT_TOKEN,
    name: 'Scrumit'
});

module.exports = bot;

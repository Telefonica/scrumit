'use strict'
const express = require('express')
const path = require('path')
const favicon = require('serve-favicon')
const logger = require('morgan')
const cookieParser = require('cookie-parser')
const bodyParser = require('body-parser')
const request = require('request-promise')
const bot = require('./bot')
const bigbrother = require('./bigbrother')
const winston = require('winston')
winston.remove(winston.transports.Console)
winston.add(winston.transports.Console, { colorize: true, timestamp: true, level: 'debug' })

const index = require('./routes/index')
const users = require('./routes/users')

const helpers = require('./helpers/')

const app = express()

var CHANNEL = 'general';
var CHANNEL_ID = 'C2ZRNGN6T';
const BOT_TOKEN = process.env.BOT_TOKEN

bot.on('message', (data) => {
  // mapear messages a controllers
  if (data.type === 'message') {
    console.log(data)
  }
})

function startBreak () {
  bot.postMessageToUser('guillermo', 'Chiste o juego o ...')
  setTimeout(() => {
    startWorking()
  }, 1 * 60 * 1000)
}

let todo
const configureTodo = function configureTodo () {
  if (process.env.MONGO_URI) {
    const TodoList = require('./todo/')
    todo = new TodoList(bot)
  }
}
configureTodo()

function postToEverybody(channel, message) {
  helpers.getMembers(channel).then((users) => {
    console.log(users)
    users.forEach((user) => {
      console.log('Sending', user.username, message)
      bot.postMessageToUser(user.username, message);
    });
  });
}

function askToEverybody(channel) {
  helpers.getMembers(channel).then((users) => {

    // On username
    console.log(users)
    users.forEach((user) => {
      bigbrother.askTo(user.username).then(function (question) {
        console.log('Sending', user.username, question)
        bot.postMessageToUser(user.username, question);
      })

      // Error on username, try with real name
      .catch(function(error){
        console.log("Jira issues not found -> "+ error);

        // Get user real name
        getUserRealName(user.userid).then(realname => {
          console.log("Real name: "+ realname);
          bigbrother.getUsername(realname).then(username => askTo(username))
            .then(function (question) {
              console.log('Sending', realname, question)
              bot.postMessageToUser(username, question);
          });
        }).catch(function(error){
          console.log("Error on get user name "+ error);
        });
      });
    });
  });
}

bot.on('message', (data) => {
  console.log('message', data)
  if (data.type !== 'message') return
  if (data.text.startsWith('todo')) {
    todo.handle(data)
  }
})

bot.on('open', (data) => {
  console.log('open', data)
})

bot.on('close', (data) => {
  console.log('close', data)
})

bot.on('error', (data) => {
  console.log('error', data)
})


function getUserRealName(userId) {
  var url = 'https://slack.com/api/users.info?token=' + BOT_TOKEN + '&user=' + userId;
  return request.post(url).then((response) => {
    console.log(response);
    return JSON.parse(response).user.real_name;
  });
}

function startWorking() {
    askToEverybody(CHANNEL);
    setTimeout(function() {
      postToEverybody(CHANNEL, 'What\'s up dude?');
      startBreak();
    }, 2 * 60 * 1000);
}


//startWorking();

bot.on('start', (data) => {
  console.log('start', data)
})

// view engine setup
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'jade')

// uncomment after placing your favicon in /public
// app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(express.static(path.join(__dirname, 'public')))

app.use('/', index)
app.use('/users', users)

// catch 404 and forward to error handler
app.use((req, res, next) => {
  const err = new Error('Not Found')
  err.status = 404
  next(err)
})

// error handler
app.use((err, req, res, next) => {
  // set locals, only providing error in development
  res.locals.message = err.message
  res.locals.error = req.app.get('env') === 'development' ? err : {}

  // render the error page
  res.status(err.status || 500)
  res.render('error')
})

module.exports = app

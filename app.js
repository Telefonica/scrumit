'use strict'
const express = require('express')
const path = require('path')
const favicon = require('serve-favicon')
const logger = require('morgan')
const cookieParser = require('cookie-parser')
const bodyParser = require('body-parser')
const bot = require('./bot')
const winston = require('winston')
winston.remove(winston.transports.Console)
winston.add(winston.transports.Console, { colorize: true, timestamp: true, level: 'debug' })

const index = require('./routes/index')
const users = require('./routes/users')

const TodoList = require('./todo/')

const app = express()

bot.on('message', (data) => {
  // mapear messages a controllers
  if (data.type === 'message') {
    console.log(data.channel, data.text)
  }
})

function startBreak () {
  bot.postMessageToUser('guillermo', 'Chiste o juego o ...')
  setTimeout(() => {
    startWorking()
  }, 1 * 60 * 1000)
}

function startWorking () {
  bot.getChannel('general').then((data) => {
    console.log(data)
  })

  bot.postMessageToUser('guillermo', 'Ola k ase?')
  setTimeout(() => {
    bot.postMessageToUser('guillermo', 'meow!')
    startBreak()
  }, 2 * 60 * 1000)
}

startWorking()

let todo
const configureTodo = function configureTodo () {
  todo = new TodoList(bot)
}
configureTodo()

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

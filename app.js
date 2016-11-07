var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var bot = require('./bot');

var index = require('./routes/index');
var users = require('./routes/users');

var app = express();

bot.on('message', function(data) {
    // mapear messages a controllers
    if (data.type === 'message') {
      console.log(data.channel, data.text)
    }
    // all ingoing events https://api.slack.com/rtm
    console.log(data);
});

function startBreak() {
  bot.postMessageToUser('ggb', 'Chiste o juego o ...');
  setTimeout(function() {
    startWorking();
  }, 1 * 60 * 1000);
}

function startWorking() {
  let channel = bot.getChannel('scrumbot-test');
  console.log(channel);
  bot.postMessageToUser('ggb', 'Ola k ase?');
  setTimeout(function() {
    bot.postMessageToUser('ggb', 'meow!');
    startBreak();
  }, 2 * 60 * 1000);
}

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);
app.use('/users', users);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;

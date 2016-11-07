var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var request = require('request-promise');
var bot = require('./bot');

var index = require('./routes/index');
var users = require('./routes/users');

var bigbrother = require('./bigbrother');

var app = express();

var CHANNEL = 'general';

bot.on('message', function(data) {
  // mapear messages a controllers
  if (data.type === 'message') {
    console.log(data)
    if (data.subtype != 'bot_message') {
      getUserInfo(data.user).then((username) => {
        bot.postMessageToChannel(CHANNEL, data.text, { as_user: false, username: username });
      });
    }
  }
});

var members;

function getMembers(channel) {
  if (members) {
    return Promise.resolve(members);
  }

  console.log('Retrieving channel members');
  return bot.getChannel(channel).then((data) => {
    var promises = [];
    data.members.forEach((userId, i) => {
      promises[i] = getUserInfo(userId).then((username) => {
        return username;
      });
    });
    return Promise.all(promises).then((usernames) => {
      members = usernames;
      return usernames;
    });
  });
}

function postToEverybody(channel, message) {
  getMembers(channel).then((usernames) => {
    console.log(usernames)
    usernames.forEach((username) => {
      console.log('Sending', username, message)
      bot.postMessageToUser(username, message);
    });
  });
}

function startBreak() {
  postToEverybody(CHANNEL, 'Juego, chiste, pregunta....');
  setTimeout(function() {
    startWorking();
  }, 1 * 60 * 1000);
}

var BOT_TOKEN = process.env.BOT_TOKEN;

function getUserInfo(userId) {
  var url = 'https://slack.com/api/users.info?token=' + BOT_TOKEN + '&user=' + userId;
  return request.post(url).then((response) => {
    return JSON.parse(response).user.name;
  });
}

function startWorking() {
  bigbrother.askTo('jorgev', function (error, question) {
    postToEverybody(CHANNEL, question);
    setTimeout(function() {
      postToEverybody(CHANNEL, 'Como ha ido?');
      startBreak();
    }, 2 * 60 * 1000);
  });
}

startWorking();

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

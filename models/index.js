'use strict'

const path = require('path')

const mongoose = require('mongoose')

if (process.env.MONGOOSE_DEBUG) {
  mongoose.set('debug', true)
}

// DeprecationWarning: Mongoose: mpromise (mongoose's default promise library)
// is deprecated, plug in your own promise library instead:
// http://mongoosejs.com/docs/promises.html
mongoose.Promise = global.Promise

const _ = require('underscore')
const winston = require('winston')
const namespace = 'db'

const models = require('require-all')({
  dirname: path.join(__dirname, 'schemas'),
  excludeDirs: /^helpers$/
})

const db = {}

const mongoURI = process.env.MONGO_URI

mongoose.connect(mongoURI)
const conn = mongoose.connection

conn.on('error', winston.error)

db.conn = conn
db.mongoose = mongoose
db.models = {}

_.each(models, (model, key) => {
  winston.debug(namespace, { action: 'modelloading', value: key })
  db.models[key] = model(mongoose, key)
  if (!db.models[key]) {
    winston.error(namespace, { action: 'model', error: 'Does not exist', key })
    return
  }
  db.models[key].on('index', (err) => {
    if (!err) return
  })
})

module.exports = db

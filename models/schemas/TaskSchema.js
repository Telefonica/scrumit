'use strict'

const winston = require('winston')

let model

module.exports = (mongoose, name) => {
  const schema = mongoose.Schema({
    id: String,
    title: String,
    description: String,
    due: Date,
    c_at: Date
  })

  model = mongoose.model(name, schema)

  return model
}

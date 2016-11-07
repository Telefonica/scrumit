'use strict'

const winston = require('winston')

let model

module.exports = (mongoose, name) => {
  const schema = mongoose.Schema({
    id: String,
    title: String,
    description: String,
    due: Date,
    finished: {
      type: Boolean,
      default: false
    },
    c_at: {
      type: Date,
      default: Date.now
    }
  })

  model = mongoose.model(name, schema)

  return model
}

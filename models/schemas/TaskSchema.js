'use strict'

const winston = require('winston')
const uuid = require('node-uuid')

let model

module.exports = (mongoose, name) => {
  const schema = mongoose.Schema({
    _id: {
      type: String,
      default: uuid.v4
    },
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

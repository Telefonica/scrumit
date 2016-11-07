'use strict'

const winston = require('winston')
const uuid = require('node-uuid')

const getUserId = function (data) {
  return `${data.team}-${data.user}`
}

let model

module.exports = (mongoose, name) => {
  const schema = mongoose.Schema({
    id: {
      type: String,
      required: true
    },
    tasks: ['Task']
  })

  schema.statics.addTask = function (data, cb) {
    model.findOne({ id: getUserId(data) }, (err, u) => {
      if (err) {
        return cb(err)
      }

      const Task = mongoose.model('TaskSchema')

      const task = new Task({
        id: uuid.v4(),
        title: data.text,
        description: '',
        due: data.due,
        c_at: new Date()
      })

      if (!u) {
        model.create({ id: getUserId(data) }, (err, u) => {
          if (err) {
            return cb(err)
          }
          u.tasks.addToSet(task)
          u.save(cb)
        })
      } else {
        u.tasks.addToSet(task)
        u.save(cb)
      }
    })
  }

  schema.statics.getTasks = function (data, cb) {
    model.findOne({ id: getUserId(data) }, (err, u) => {
      if (err || !u) {
        return cb('Error or not found')
      }

      cb(null, u.tasks)
    })
  }

  schema.statics.removeTask = function (data, cb) {
    model.findOne({ id: getUserId(data) }, (err, u) => {
      if (err || !u) {
        return cb('Error or not found')
      }

      const taskId = data.text.trim()
      u.tasks.pull({ _id: taskId })
      u.save(cb)
    })
  }

  schema.pre('save', (next) => {
    next()
  })

  model = mongoose.model(name, schema)

  return model
}

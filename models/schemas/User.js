'use strict'

const winston = require('winston')

const helpers = require('../../helpers/')

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
        title: data.text,
        description: '',
        due: data.due
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

  const getTasks = function (data, cb) {
    const opts = {
      team: data.team,
      user: data.otherUser || data.user
    }

    model.findOne({ id: getUserId(opts) }, (err, u) => {
      if (err) {
        return cb(err)
      }

      if (!u) {
        return cb('User not found')
      }

      cb(null, u.tasks)
    })
  }

  schema.statics.getTasks = function (data, cb) {
    if (data.otherUser) {
      winston.info(`[TODO] ${data.user} requested ${data.otherUser} task list!`)
      helpers.getMembers().then((members) => {
        const list = members.find((el) => {
          return el.username === data.otherUser
        })
        data.otherUser = list && list.userid
        getTasks(data, cb)
      })
    } else {
      winston.info(`[TODO] ${data.user} requested its own task list!`)
      getTasks(data, cb)
    }
  }

  schema.statics.removeTask = function (data, cb) {
    model.findOne({ id: getUserId(data) }, (err, u) => {
      if (err) {
        return cb(err)
      }

      if (!u) {
        return cb('User not found')
      }

      const taskId = data.text.trim()
      u.tasks = u.tasks.filter((t) => t._id.toString() !== taskId)
      u.markModified('u.tasks')
      u.save(cb)
    })
  }

  schema.pre('save', (next) => {
    next()
  })

  model = mongoose.model(name, schema)

  return model
}

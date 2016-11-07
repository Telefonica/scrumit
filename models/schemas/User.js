'use strict'

const winston = require('winston')
const uuid = require('node-uuid')

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

  const getTasks = function (data, cb) {
    const opts = {
      team: data.team,
      user: data.user
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
      // getUserId for this username
      helpers.getMembers().then((members) => {
        const list = members.find((el) => {
          return el.username === data.otherUser
        })
        data.user = list && list.userid
        getTasks(data, cb)
      })
    } else {
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

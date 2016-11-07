'use strict'
const request = require('request-promise')

function getChannelInfo (channelId) {
  const url = 'https://slack.com/api/channels.info?token=' + process.env.BOT_TOKEN + '&channel=' + channelId
  return request.post(url).then((response) => {
    return JSON.parse(response).channel
  })
}

function getUserInfo (userId) {
  const url = 'https://slack.com/api/users.info?token=' + process.env.BOT_TOKEN + '&user=' + userId
  return request.post(url).then((response) => {
    return JSON.parse(response).user.name
  })
}

const CHANNEL_ID = 'C2ZRNGN6T'
let members
function getMembers (channel) {
  console.log(`Retrieving ${channel || CHANNEL_ID} members`)
  if (members) {
    return Promise.resolve(members)
  }

  return getChannelInfo(CHANNEL_ID).then((data) => {
    const promises = []
    data.members.forEach((userId, i) => {
      promises[i] = getUserInfo(userId).then((username) => {
        return {username: username, userid: userId}
      })
    })
    return Promise.all(promises).then((username) => {
      members = username
      return username
    })
  })
}

module.exports = {
  getMembers,
  getUserInfo
}

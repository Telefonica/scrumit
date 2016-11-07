process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'

const jiraconfig = require('./jiraconfig')

if (jiraconfig.jiraUserName) {
  const JiraClient = require('jira-connector')

  const jira = new JiraClient({
    host: 'jirapdi.tid.es',
    basic_auth: {
      username: jiraconfig.jiraUserName,
      password: jiraconfig.jiraPassword
    }
  })

  module.exports.askTo = function (user) {
    return new Promise((fulfill, reject) => {
      let question = 'Hi ' + user + ', currently JIRA says you are working on these issues...\n'
      opts = {jql: 'assignee=' + user + ' and status = "In Progress"'}
      console.log(opts.jql)
      jira.search.search(opts, (error, issues) => {
        if (error) {
          console.log(error)
          reject(error)
        }
        console.log(issues)
        var issuesList = issues.issues
        if (issuesList.length == 0) {
          console.log('Rejecting with...' + issues.warningMessages)
          reject(issues.warningMessages)
        }

        console.log(issues)
        var issuesList = issues.issues
        for (const index in issuesList) {
          const issueQuestion = issuesList[index].key + ' -> ' + issuesList[index].fields.summary
          console.log(issueQuestion)
          question += '\n ' + issueQuestion
        }
        if (issuesList.length > 2) {
          question += "\n More than 2 issues? please, don't make me cry...."
        }

        question += '\n Tell me what you are currently working on... ^_^ '
        fulfill(question)
      })
    })
  }

  module.exports.getUsername = function (realname) {
    console.log('[getUsername] ' + realname)
    return new Promise((fulfill, reject) => {
      const opts = {username: realname}
      console.log('[getUsername] opts=' + opts + ' ' + realname)

      jira.user.search(opts, (error, user) => {
        console.log('[getUsername] Response: ' + error + ', ' + user)
        if (error) {
          reject('not found')
        }
        if (user.length > 0) {
          fulfill(user[0].key)
        } else {
          reject('empty, why?')
        }
      })
    })
  }
} else {
  module.exports.askTo = function (user) {
    return new Promise((fulfill, reject) => {
      fulfill('Hi ' + user + ', tell me what you are currently working on...\n')
      return
    })
  }

  module.exports.getUsername = function (realname) {
    return new Promise((fulfill, reject) => {
      return 'unknown'
    })
  }
}

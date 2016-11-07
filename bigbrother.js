process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

var jiraconfig = require('./jiraconfig')

var exports = module.exports = {};

var JiraClient = require('jira-connector');

var jira = new JiraClient( {
    host: 'jirapdi.tid.es',
    basic_auth: {
        username: jiraconfig.jiraUserName,
        password: jiraconfig.jiraPassword
    }
});


exports.askTo = function (user, callback) {

    question = "Hi " + user + ", currently you are working on...\n";
    opts = {jql:'assignee='+user+' and status = "In Progress"'};
    console.log(opts.jql);
    jira.search.search(opts, function(error, issues) {
        if (error) {
            callback(error, null);
            return;
        }
        console.log(issues);
        var issuesList = issues.issues;
        for (var index in issuesList) {
            var issueQuestion = issuesList[index].key+" -> "+ issuesList[index].fields.summary;
            console.log(issueQuestion);
            question += "\n "+issueQuestion;
        }
        question += "\n Tell me on what you are really working... ^_"
        callback(error, question);
    });
}







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

var GitHubApi = require("github");

var github = new GitHubApi({
    // optional args
    debug: true,
    protocol: "https",
    host: "github.com", // should be api.github.com for GitHub
    //pathPrefix: "/api/v3", // for some GHEs; none for GitHub
    headers: {
        "user-agent": "scrumit" // GitHub is happy with a unique user agent
    },
    Promise: require('bluebird'),
    followRedirects: false, // default: true; there's currently an issue with non-get redirects, so allow ability to disable follow-redirects
    timeout: 5000
});


exports.askTo = function (user, callback) {

    return new Promise(function (fulfill, reject){
    
    var question = "Hi " + user + ", currently JIRA says you are working on these issues...\n";
    opts = {jql:'assignee='+user+' and status = "In Progress"'};
    console.log(opts.jql);
    jira.search.search(opts, function(error, issues) {
        if (error) {
            fulfill("Hi " + user + ", tell me what you are currently working on...\n");
            return;
        }
        console.log(issues);
        var issuesList = issues.issues;
        for (var index in issuesList) {
            var issueQuestion = issuesList[index].key+" -> "+ issuesList[index].fields.summary;
            console.log(issueQuestion);
            question += "\n "+issueQuestion;
        }
        if (issuesList.length > 2) {
            question += "\n More than 2 issues? please, don't make me cry...."
        }

        question += "\n Tell me what you are currently working on... ^_^ "
        fulfill(question);
    });
  });
}





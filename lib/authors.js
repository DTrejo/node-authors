module.exports = {
  authors: authors
}

var pkg = require('../package.json')
var path = require('path')
var async = require('async')
var request = require('request')
var log

var git = require('./git')

// look for the email first. if no results, look for the name.
function lookupGithubLogin(p, print, callback) {
  var emailURI = 'https://api.github.com/legacy/user/email/'
  var searchURI = 'https://api.github.com/legacy/user/search/'
  var options = { json: true, headers: { 'user-agent': pkg.name + '/' + pkg.version } }
  function cb (err, p) {
    // if (print) log(toMarkdown(p))
    callback(err, p)
  }
  if (print) process.stdout.write('.')

  request(emailURI + encodeURIComponent(p.email), options, onEmail)
  function onEmail(err, res, data) {
    if (data.user) {
      p.login = data.user.login
      return cb(err, p)
    }
    request(searchURI + encodeURIComponent(p.name), options, onName)
  }
  function onName(err, res, data) {
    if (data.users && data.users[0]) {
      p.login = data.users[0].login
      return cb(err, p)
    }
    cb(err, p)
  }
}

function toMarkdown(p) {
  var str = '- '
    + '[' + p.name + ']'
    + '(https://github.com/' + p.login + ')'
  if (p.name != p.login) str += ' aka `' + p.login + '`'
  return str
}

function authors(path, print, cb) {
  cb = cb || function (err) { if (err) log(err.stack) }
  log = function log() {
    if (print) console.log.apply(console.log, arguments)
  }
  process.chdir(path)

  git.authors(path, function (er, list) {
    var tasks = []

    if (print) {
      log('Fetching ' + list.length + ' logins from github based on'
      + ' email/name...')
    }
    list.forEach(function (p) {
      tasks.push(async.apply(lookupGithubLogin, p, print))
    })
    async.parallel(tasks, function (err, results) {
      var seen = {}
      var uresults = results
        .map(function (p) {
          if (seen[p.login]) return null
          seen[p.login] = true
          return p
        })
        .filter(function (p) {
          return p
        })
      if (print) {
        log('')
        log('## Contributors')
        log('Ordered by date of first contribution.'
          + ' [Auto-generated](https://github.com/dtrejo/node-authors) on '
          + new Date().toUTCString() + '.')
        log('')
        log(uresults.map(toMarkdown).join('\n'))
      }
      cb(err, uresults)
    })
  })
}

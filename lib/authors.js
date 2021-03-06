module.exports = {
  authors: authors,
  nameAndEmail: nameAndEmail
}

var pkg = require('../package.json')
var async = require('async')
var request = require('request')
var exec = require('child_process').exec
var rateLimitExceeded = false
var log

// returns array of strings like
//    "firstname lastname <email@host.com>"
// - first contributions are first in the list
// - contains duplicates
// - might not have a real email
// - might not have real name
function gitAuthors (cb) {
  return exec('git log --pretty="%an <%ae>"', function (er, stdout, stderr) {
    if (er || stderr) throw new Error(er || stderr)
    return cb(null, stdout.split('\n').reverse())
  })
}

function nameAndEmail (cb) {
  return gitAuthors(function (er, ppl) {
    var uppl = unique(ppl)
    cb(er, uppl)
  })
}

function unique (list) {
  var seen = {}
  list.forEach(function (e) {
    if (e) seen[e] = 1
  })
  return Object.keys(seen)
}

// look for the email first. if no results, look for the name.
function lookupGithubLogin (p, print, callback) {
  var apiURI = 'https://api.github.com/search/users?q='
  var options = { json: true, headers: { 'user-agent': pkg.name + '/' + pkg.version } }
  if (process.env.OAUTH_TOKEN) {
    options.headers['Authorization'] = 'token ' + process.env.OAUTH_TOKEN.trim()
  }
  function cb (err, p) {
    callback(err, p)
  }
  if (print) process.stdout.write('.')

  request(apiURI + encodeURIComponent(p.email + ' in:email type:user'), options, onEmail)
  function onEmail (err, data) {
    rateLimitExceeded = rateLimitExceeded || data.body.message
    if (!err && data.body.items && data.body.items[0]) {
      p.login = data.body.items[0].login
      return cb(err, p)
    }
    request(apiURI + encodeURIComponent(p.name + ' in:fullname type:user'), options, onName)
  }
  function onName (err, data) {
    rateLimitExceeded = rateLimitExceeded || data.body.message
    if (!err && data.body.items && data.body.items[0]) {
      p.login = data.body.items[0].login
      return cb(err, p)
    }
    cb(err, p)
  }
}

function toData (ppl) {
  return ppl
    .map(function (p) {
      return {
        name: p.substring(0, p.indexOf('<')).trim(),
        email: p.substring(p.indexOf('<') + 1, p.indexOf('>')).trim()
      }
    })
}

function toMarkdown (p) {
  var str = '- '
  if (p.login && p.login !== 'undefined') {
    str = str + '[' + p.name + ']' + '(https://github.com/' + p.login + ')'
    if (p.name !== p.login) str += ' aka `' + p.login + '`'
  } else {
    str = str + p.name
  }
  return str
}

function authors (path, print, cb) {
  cb = cb || function (err) { if (err) log(err.stack) }
  log = function log () {
    if (print) console.log.apply(console.log, arguments)
  }
  process.chdir(path)

  nameAndEmail(function (er, ppl) {
    var list = toData(ppl)
    var tasks = []

    if (print) {
      log('Fetching ' + list.length + ' logins from github based on' + ' email/name...')
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
      if (rateLimitExceeded) {
        log('\nWarning: GitHub API rate limit exceeded! The result might be incomplete!\n')
        if (!process.env.OAUTH_TOKEN) {
          log('Hint: Set the "OAUTH_TOKEN" environment variable to increase your limit.\n')
        }
      }
      if (print) {
        log('')
        log('## Contributors')
        log('Ordered by date of first contribution.' +
          ' [Auto-generated](https://github.com/dtrejo/node-authors) on ' +
          new Date().toUTCString() + '.')
        log('')
        log(uresults.map(toMarkdown).join('\n'))
        log('')
      }
      cb(err, uresults)
    })
  })
}

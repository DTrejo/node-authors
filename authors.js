module.exports = {
  authors: authors,
  nameAndEmail: nameAndEmail
}

var path = require('path')
var ms = require('ms')
var async = require('async')
var underscore = _ = require('underscore')
var request = _.throttle(require('request'), 20);
var exec = require('child_process').exec

// returns array of strings like
//    "firstname lastname <email@host.com>"
// - first contributions are first in the list
// - contains duplicates
// - might not have a real email
// - might not have real name
function gitAuthors(cb) {
  return exec('git log --pretty="%an <%ae>"', function (er, stdout, stderr) {
    if (er || stderr) throw new Error(er || stderr);
    return cb(null, stdout.split('\n').reverse())
  })
}

function nameAndEmail(path, cb) {
  return gitAuthors(function (er, ppl) {
    uppl = unique(ppl)
    cb(er, uppl)
  })
}

function unique(list) {
  var seen = {};
  return list
    .map(function (e) {
      if (seen[e]) return null
      seen[e] = true
      return e
    })
    .filter(function (e) {
      return e
    })
}

// look for the email first. if no results, look for the name.
function lookupGithubLogin(p, print, callback) {
  var emailURI = 'https://api.github.com/legacy/user/email/'
  var searchURI = 'https://api.github.com/legacy/user/search/'
  var options = { json: true }
  function cb (err, p) {
    // if (print) console.log(toMarkdown(p))
    callback(err, p)
  }
  if (print) process.stdout.write('.')

  request(emailURI + encodeURIComponent(p.email), options, function (err, res, data) {
    if (data.user) {
      p.login = data.user.login
      return cb(err, p)
    }
    request(searchURI + encodeURIComponent(p.name), options, function (err, res, data) {
      if (data.users && data.users[0]) {
        p.login = data.users[0].login
        return cb(err, p)
      }
      cb(err, p)
    })
  });
};

function toData(ppl) {
  return ppl
    .map(function (p) {
      return {
        name: p.substring(0, p.indexOf('<')).trim()
      , email: p.substring(p.indexOf('<') + 1, p.indexOf('>')).trim()
      }
    })
}

function toMarkdown(p) {
  return '- '
  + '[' + p.name + ' aka `'+p.login+'`]'
  + '(https://github.com/' + p.login + ')'
}

function authors(path, print, cb) {
  cb = cb || function () {}

  process.chdir(path)
  nameAndEmail(path, function (er, ppl) {
    var list = toData(ppl)
    var tasks = []

    if (print) console.log('Fetching', list.length, 'logins from github based on email/name...')

    list.forEach(function (p) {
      tasks.push(async.apply(lookupGithubLogin, p, print))
    })
    async.series(tasks, function (err, results) {
      var seen = {}
      console.log(results)
      var uresults = results
        .map(function (p) {
          if (seen[p.login]) return null;
          seen[p.login] = true
          return p
        })
        .filter(function (p) {
          return p
        })
      if (print) {
        console.log('')
        console.log('## Contributors')
        console.log('Ordered by date of first contribution.')
        console.log('[Auto-generated](http://github.com/dtrejo/authors) on '
          + new Date() + '.')
        console.log()
        console.log(uresults.map(toMarkdown).join('\n'))
      }
      cb(err, uresults)
    })
  })
}

if (!module.parent) {
  console.log(gitAuthors())
}

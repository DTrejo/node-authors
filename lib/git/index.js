var exec = require('child_process').exec
  , _ = require('lodash')

var LogStream = require('./log_stream')

exports.authors = function (dir, callback) {
  var emails = []
    , names = {}

  var log = exec('git log --pretty="%an <%ae>"', { cwd: dir })
  .once('error', function (err) {
    callback(err)
  })
  .once('close', function () {
    var authors = _.unique(emails)
    .map(function (email) {
      return {
        name: names[email]
      , email: email
      }
    })

    callback(null, authors)
  })

  log.stdout.pipe(new LogStream())
  .on('data', function (author) {
    emails.unshift(author.email)
    names[author.email] = author.name
  })
  .once('error', function (err) {
    callback(err)
  })

  log.stderr.setEncoding('utf8')
  log.stderr.once('data', function (err) {
    callback(errorException(err, 'GITError'))
  })
}

function errorException(message, code) {
  var e = new Error(message)
  if (code) e.name = e.code = e.errno = code
  return e
}

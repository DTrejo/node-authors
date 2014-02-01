var Transform = require('stream').Transform
  , StringDecoder = require('string_decoder').StringDecoder
  , inherits = require('util').inherits

module.exports = LogStream
inherits(LogStream, Transform)

function LogStream (options) {
  if (!(this instanceof LogStream)) {
    return new LogStream(options)
  }

  Transform.call(this, options)

  this._writableState.objectMode = false
  this._readableState.objectMode = true

  this._decoder = new StringDecoder('utf8')
  this._buffer = ''
}

LogStream.prototype._transform = function (chunk, encoding, done) {
  this._buffer += this._decoder.write(chunk)

  var lines = this._buffer.split(/\r?\n/)
  this._buffer = lines.pop()

  var self = this
  lines.forEach(function (line) {
    self._line(line)
  })

  done()
}

LogStream.prototype._flush = function (done) {
  var remains = this._buffer.trim();
  if (remains) {
    this._line(remains)
  }

  done()
}

LogStream.prototype._line = function (line) {
  var match = line.match(/^([^\<]+) \<([^\>]+)\>$/)
  if (match) {
    this.push({
      name: match[1]
    , email: match[2]
    })
  }
}

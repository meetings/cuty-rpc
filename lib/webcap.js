/*\
 *  webcap.js
 *  2014-11-05 / Meetin.gs
\*/

var fs      = require('fs')
var tmp     = require('tmp')
var util    = require('util')
var async   = require('async')
var night   = require('nightmare')
var common  = require('./common')

var AUTH_TOKEN = 'somewhatsecret9211'

var status = {
  requests: 0,
  valid:    0,
  success:  0,
  avg:      0,

  fmt:
    '<pre>\n' +
    '    total  %s\n' +
    '    valid  %s\n' +
    '  invalid  %s\n' +
    'successes  %s\n' +
    '   errors  %s\n' +
    ' avg time  %s\n',

  yeah: function(n) {
    this.success++
    this.updateAvg(n)
  },
  updateAvg: function(n) {
    if (this.avg === 0) {
      this.avg = n
    }
    else {
      this.avg -= this.avg / this.success
      this.avg += n / this.success
    }
  },
  fabricateReport: function() {
    return util.format(
      this.fmt, this.requests, this.valid, (this.requests-this.valid),
      this.success, (this.requests-this.success), this.avg
    )
  }
}

var required_params = [
  { param: 'url',  code: 400, msg: 'Bad Request' },
  { param: 'auth', code: 401, msg: 'Unauthorized' }
]

var optional_params = [
  { param: 'upload', def: false }, /* FIXME unused */
  { param: 'delay',  def:     1 }, /* FIXME unused */
  { param: 'width',  def:  1280 },
  { param: 'height', def:   720 }
]

var MSG = {
  done: 'OK  %s ms',
  err:  'ERR %s %s',
  tmp:  'ERR 500 Failed to create temporary filename',
  send: 'ERR 500 Failed to send the file to client'
}

var getTmpName = function(request, result) {
  tmp.tmpName({postfix: '.png'}, function(err, filename) {
    if (err) {
      result.status(500).send('Temporary error')
      util.log(MSG.tmp)
      return
    }

    debug("filename", filename)

    captureQ.push({ req: request, res: result, fn:  filename })
  })
}

var reply = function(request, result, filename) {
  result.status(200).sendFile(filename, function(err) {
    if (err) {
      util.log(MSG.send)
      return
    }

    /* FIXME
     * Implement a unlink queue and delete files with delay.
     * http://stackoverflow.com/a/1590262
     */

    var duration = Date.now() - request.time
    util.log(util.format(MSG.done, duration))
    status.yeah(duration)
  })
}

var captureQ = async.queue(function(task, callback) {
  try {
    new night()
      .viewport(task.req.width, task.req.height)
      .goto(task.req.url)
      .screenshot(task.fn)
      .run(function() {
        callback()
        process.nextTick(function() {
          reply(task.req, task.res, task.fn)
        })
      })
  } catch (e) {
    debug("Nightmare.js error", e)
  }
}, 1)

module.exports.capture = function(request, result) {
  status.requests++

  var parsed = common.parseRequest(request, required_params, optional_params)

  if (!parsed.ok) {
    util.log(util.format(MSG.err, parsed.code, parsed.msg))
    result.status(parsed.code).send(parsed.msg)
    return
  }

  if (parsed.auth !== AUTH_TOKEN) {
    util.log(util.format(MSG.err, 401, 'Unauthorized'))
    result.status(401).send('Unauthorized')
    return
  }

  debug("request", parsed)

  status.valid++

  getTmpName(parsed, result)
}

/* FIXME
 * Add counters for errors, success, avg time and other.
 * Report here.
 */
module.exports.status = function() {
  return status.fabricateReport()
}

/*
function debug(msg, obj) {
  console.log(msg + "\n" + util.inspect(obj, { depth: 1, colors: true }))
}
*/

var debug=function(m,o){console.log(m+"\n"+util.inspect(o,{colors:true}))}

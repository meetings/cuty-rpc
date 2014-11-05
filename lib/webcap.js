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

    util.log(util.format(MSG.done, Date.now() - request.time))
  })
}

var captureQ = async.queue(function(task, callback) {
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
}, 1)

module.exports.capture = function(request, result) {
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

  tmp.tmpName({postfix: '.png'}, function(err, filename) {
    if (err) {
      result.status(500).send('Temporary error')
      util.log(MSG.tmp)
      return
    }

    debug("filename", filename)

    captureQ.push({
      req: parsed,
      res: result,
      fn:  filename
    })
  })
}

/* FIXME
 * Add counters for errors, success, avg time and other.
 * Report here.
 */
module.exports.status = function() {
  return 'OK'
}

function debug(msg, obj) {
  console.log("DEBUG :: " + msg + " ::")
  console.log(util.inspect(obj, {showHidden: true, depth: 1, colors: false}))
}

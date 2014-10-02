/*\
 *  web.js
 *  2014-10-02 / Meetin.gs
\*/

var child   = require('child_process')
var restler = require('restler')
var tmp     = require('tmp')
var util    = require('util')
var common  = require('./common')

var AUTH_TOKEN = 'somewhatsecret9211'

var phantom_path   = process.env.PHANTOM_PATH || '/usr/bin/phantomjs'
var phantom_script = 'phantom.js'

var required_params = [
  { param: 'auth', code: 401, msg: 'Unauthorized' },
  { param: 'url',  code: 400, msg: 'Bad Request' }
]

var EMSG = {
  /* FIXME */
  file: 'Could not create a resource\n',
  cuty: 'Failed to capture target\n',
  miss: 'Cannot find resource\n'
}

module.exports.capture = function(request, result) {
  var parsed = common.parseRequest(request, required_params)

  if (parsed.fail) {
    util.log(util.format('ERR %s from client', parsed.code))
    result.status(parsed.code).send(parsed.err)
    return
  }

  if (parsed.auth !== AUTH_TOKEN) {
    util.log(util.format('ERR %s from client', parsed.code))
    result.status(parsed.code).send(parsed.err)
    return
  }

  debug("request", parsed)

  process.nextTick(function() {
    createTmpFile(parsed, result)
  })
}

function createTmpFile(request, result) {
  tmp.tmpName({postfix: '.png'}, function(err, filename) {
    if (err) {
    }

    execPhantom(request, result, filename)
  })
}

function execPhantom(request, result, filename) {
  var args = [
    path.join(__dirname, phantom_script),
    request.url,
    filename
  ]

  var opts = {
    timeout: 6666
  }

  child.execFile(phantom_path, args, opts, function(err) {
    if (err) {
      debug("ERRR", err)
      /// FIXME
    }

    reply(request, result, filename)
  })

  /// web.render(filename, {format: 'png'})
}

/* Reply with the captured image data.
 */
function reply(req, result, filename) {
  /* FIXME Uploading to client specified
   *       target is currently disabled.
   */
  var upload = false;

  fs.stat(filename, function(err, stat) {
    if (err) {
      /// FIXME stat failed so file not found :-\
      debug("errorrr", err)
      result.status(500).send(EMSG.miss)
      return
    }
  })

  if (upload) {
    restler.post(upload, {
      multipart: true,
      data: {
        file: restler.file(filename, null, stat.size, null, "image/png")
      }
    }).on('complete', function(data) {
      fs.unlink(filename, function(err) {
        if (err) util.log('ERR  unable to remove: ' + filename)
      })

      /// util.log(util.format('DONE uploaded in %s', time))
      result.status(200).send(data)
    })
  }
  else {
    result.status(200).sendfile(filename, function(err) {
      if (err) {
        /// fixme This may have been client error, but anyway...
        debug("sendfile() failed", err)
        return
      }

      /// util.log(util.format('DONE replied  in %s', time))
    })
  }

  var duration = Date.now() - req.time

  debug("DONE in time", duration)
}

function debug(msg, obj) {
  console.log("DEBUG :: " + msg + " ::")
  console.log(util.inspect(obj, {showHidden: true, depth: 1, colors: false}))
}

/*\
 *  phantom.js
 *  2014-09-29 / Meetin.gs
\*/

var restler = require('restler')
var tmp     = require('tmp')
var util    = require('util')
var web     = require('webpage').create()

var AUTH_TOKEN = 'somewhatsecret9211'

var required_params = [
  { param: 'auth', code: 401, msg: 'Unauthorized' },
  { param: 'url',  code: 400, msg: 'Bad Request' }
]

var EMSG = {
  /* FIXME Rework */
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

    takeTheShot(request, result, filename)
  })
}

function takeTheShot(request, result, filename) {
  web.open(request.url, function(ok) {
    if (ok === 'fail') {
      /// FIXME
    }

    /* Please note, this is synchronous
     * and cannot be changed.
     */
    web.render(filename, {format: 'png'})

    postProcess(request, result, filename)
  })
}

/* Upload or reply with the captured image data.
 */
function postProcess(req, result, filename, time) {
  /* FIXME Uploading to client specified
   *       target is currently disabled.
   */
  var up_url = false;

  fs.stat(filename, function(err, stat) {
    if (err) {
      debug("ERR", err)
      util.log('ERR  stat failed, file missing')
      result.status(500).send(EMSG.miss)
      return
    }

    if (up_url === false) {
      result.status(200).sendfile(filename, function(err) {
        if (err) {
          util.log('ERR  sendfile failed for an unknown reason')
          return
        }

        util.log(util.format('DONE replied  in %s', time))
      })
    }
    else {
      restler.post(up_url, {
        multipart: true,
        data: {
          file: restler.file(filename, null, stat.size, null, "image/png")
        }
      }).on('complete', function(data) {
        fs.unlink(filename, function(err) {
          if (err) util.log('ERR  unable to remove: ' + filename)
        })

        util.log(util.format('DONE uploaded in %s', time))
        result.status(200).send(data)
      })
    }
  })
}

function debug(msg, obj) {
  console.log("DEBUG :: " + msg + " ::")
  console.log(util.inspect(obj, {showHidden: true, depth: 1, colors: false}))
}

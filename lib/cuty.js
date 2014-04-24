/*\
 *  cuty.js
 *  2014-04-24 / Meetin.gs
\*/

var _       = require('underscore')
var exec    = require('child_process').exec
var fs      = require('fs')
var tmp     = require('tmp')
var util    = require('util')
var restler = require('restler')
var common  = require('./lib/common.js')

var EMSG = {
    file: 'Could not create a resource\n',
    cuty: 'Failed to capture target\n',
    miss: 'Cannot find resource\n'
}

/* Receive client request and create a shell command.
 */
module.exports.cutycapt = function(req, result) {
    var parsed = common.parseRequest(req)

    if (parsed.fail) {
        util.log(util.format('ERR  %s from client', parsed.code))
        result.status(parsed.code).send(parsed.err)
        return
    }

    util.log(util.format('CAPT %s', parsed.url))

    tmp.tmpName({postfix: '.png'}, function(err, filename) {
        if (err) {
            util.log('ERR  unable to create a file')
            result.status(500).send(EMSG.file)
            return
        }

        var cmd = util.format(
            'xvfb-run -s "-screen 0 %sx%sx24" -w 1 cutycapt --url="%s"' +
            ' --delay=%s --max-wait=10000 --min-width=%s --min-height=%s' +
            ' --javascript=%s --out=%s',

            parsed.width, parsed.height,
            parsed.url, parsed.delay,
            parsed.width, parsed.height,
            parsed.js, filename
        )

        capture(req, result, cmd, parsed.upload, filename)
    })
}

/* Run cutycapt.
 */
function capture(req, result, cmd, up_url, filename) {
    var start = Date.now()

    var cuty = exec(cmd, function(err, stdout, stderr) {
        if (err) {
            debug("ERR", err)
            util.log('ERR  Xvfb/cutycapt returned with error')
            result.status(500).send(EMSG.cuty)
            return
        }

        var stop = Date.now()

        upload_or_reply(req, result, up_url, filename, (stop-start))
    })
}

/* Upload or reply with the captured image data.
 */
function upload_or_reply(req, result, up_url, filename, time) {
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
    console.log(util.inspect(obj, {showHidden: true, depth: 1, colors: true}))
}

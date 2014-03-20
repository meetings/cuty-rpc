#!/usr/bin/env nodejs

/*\
 *  cuty-rpc.js
 *  A web frontend to cutycapt
 *  2014-03-20 / Meetin.gs
\*/

var _    = require('underscore')
var app  = require('express')()
var exec = require('child_process').exec
var fs   = require('fs')
var rest = require('restler')
var tmp  = require('tmp')
var util = require('util')
var pkg  = require('./package.json')

var AUTH_TOKEN = 'somewhatsecret9211'

var EMSG = {
    auth: 'Authentication required\n',
    arg:  'Parameters url and upload required\n',
    file: 'Could not create a resource\n',
    cuty: 'Failed to capture target\n',
    miss: 'Cannot find resource\n'
}

/* Normalize given input.
 *
 * @return a positive integer or given default value.
 */
function toNaturalNumber(i, def) {
    if (_.isUndefined(i) || _.isEmpty(i)) {
        return def
    }

    if (!isNaN(i)) {
        return Math.abs(parseInt(i, 10))
    }

    return def
}

/* Parse and validate client request.
 *
 * @return a validated set of parameters.
 */
function parseRequest(req) {
    var parsed = { fail: false }

    parsed.auth   = req.param('auth')
    parsed.url    = req.param('url')
    parsed.upload = req.param('upload')
    parsed.delay  = req.param('delay')
    parsed.width  = req.param('width')
    parsed.height = req.param('height')
    parsed.js     = req.param('javascript')

    if (_.isUndefined(parsed.auth)) {
        parsed.auth = 'fail'
    }

    if (parsed.auth !== AUTH_TOKEN) {
        parsed.fail = true
        parsed.code = 401
        parsed.err = EMSG.auth
        return parsed
    }

    if (_.isUndefined(parsed.url)) {
        parsed.fail = true
        parsed.code = 400
        parsed.err = EMSG.arg
        return parsed
    }

    if (_.isUndefined(parsed.upload)) {
        parsed.upload = false
    }

    parsed.delay  = toNaturalNumber(parsed.delay,  1000)
    parsed.width  = toNaturalNumber(parsed.width,  800)
    parsed.height = toNaturalNumber(parsed.height, 600)

    if (!_.isUndefined(parsed.js) && parsed.js.toLowerCase() === 'off') {
        parsed.js = 'off'
    }
    else {
        parsed.js = 'on'
    }

    return parsed
}

/* Receive client request and create a shell command.
 */
function cutyrpc(req, result) {
    var parsed = parseRequest(req)

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
            rest.post(up_url, {
                multipart: true,
                data: {
                    file: rest.file(filename, null, stat.size, null, "image/png")
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

var port = toNaturalNumber(process.env.PORT, 8000)

app.get('/', cutyrpc)

app.listen(port)

util.log(pkg.name + ' ' + pkg.version)
util.log(pkg.description + ' by Meetin.gs Ltd')
util.log('Listening on port ' + port)

function debug(msg, obj) {
    console.log("DEBUG :: " + msg + " ::")
    console.log(util.inspect(obj, {showHidden: true, depth: 1, colors: true}))
}

/*\
 *  libav.js
 *  2014-04-26 / Meetin.gs
\*/

var exec    = require('child_process').exec
var fs      = require('fs')
var tmp     = require('tmp')
var http    = require('http')
var util    = require('util')
var request = require('request')
var restler = require('restler')
var common  = require('./common.js')

var EMSG = {
    file:  'Could not create temporary resource\n',
    dl:    'Failed to request the media\n',
    probe: 'Failed to execute avprobe\n',
    parse: 'Failed to parse duration\n'
}

/* Convert hh:mm:ss to seconds.
 */
function timeToSeconds(h, m, s) {
    return 3600*common.toNaturalNumber(h, 0) + 60*common.toNaturalNumber(m, 0) + common.toNaturalNumber(s, 0)
}

/*
 */
function media_duration(filename, result) {
    var cmd = util.format('avprobe %s', filename)
    var re = /Duration:\s+(\d+):(\d+):(\d+)/m;

    debug("CMD", cmd)

    exec(cmd, function(err, stdout, stderr) {
        if (err) {
            debug("ERR", err)
            util.log('ERR  avprobe returned with error')
            result.status(500).send(EMSG.probe)
            return
        }

        var match = re.exec(stderr)

        debug("MATCH", match)

        if (match !== null) {
            var duration = timeToSeconds(match[1], match[2], match[3])
            debug("DUR", duration)
            result.status(200).send(util.format('%s sec', duration))
        }
        else {
            debug("MATCH", match)
            result.status(500).send(EMSG.parse)
        }
    })
}

    // avprobe Peppitesti.mp4 2>&1 | grep Duration
    // Duration: 00:00:19.13, start: 0.000000, bitrate: 12161 kb/s
    /*
    var cmd = util.format(
        'xvfb-run -s "-screen 0 %sx%sx24" -w 1 cutycapt --url="%s"' +
    var cuty = exec(cmd, function(err, stdout, stderr) {
        if (err) {
    */


/* Calculate and return the duration of given video file.
 */
module.exports.duration = function(req, result) {
    var parsed = common.parseRequest(req, ['url'])

    /*
    tmp.tmpName(function(err, filename) {
        if (err) {
            util.log('ERR  unable to create tempfile')
            result.status(500).send(EMSG.file)
            return
        }

        var callback = function(err, response) {
            if (!err && response.statusCode === 200) {
                media_duration(filename, result)
            }
            else {
                util.log('ERR failed to download video')
                result.status(418).send(EMSG.dl)
                return
            }
        }

        request(parsed.url, callback).pipe(fs.createWriteStream(filename))
    })
    */

    media_duration('/tmp/peppitest.avi', result)
}

/* Capture a small thumbnail image of given video file.
 */
module.exports.thumb = function(req, result) {
    return
}

/* Convert given video file to a format suitable for embedding on a website.
 */
module.exports.convert = function(req, result) {
    return
}

function debug(msg, obj) {
    console.log("DEBUG :: " + msg + " ::")
    console.log(util.inspect(obj, {showHidden: true, depth: 1, colors: true}))
}

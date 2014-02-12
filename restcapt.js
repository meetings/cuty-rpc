#!/usr/bin/env nodejs

/*\
 *  restcapt.js
 *  2014-02-12 / Meetin.gs
\*/

var _    = require('underscore')
var app  = require('express')()
var exec = require('child_process').exec
var fs   = require('fs')
var rest = require('restler')
var tmp  = require('tmp')
var util = require('util')
var pkg  = require('./package.json')

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
 * @return a validated set of parameters or false.
 */
function parseRequest(req) {
    var parsed = {}

    var parsed['url']    = req.param('url')
    var parsed['upload'] = req.param('upload')
    var parsed['delay']  = req.param('delay')
    var parsed['width']  = req.param('min-width')
    var parsed['height'] = req.param('min-height')
    var parsed['js']     = req.param('javascript')

    if (_.isUndefined(parsed.url) || _.isUndefined(upload)) {
        return false
    }

    parsed.delay  = toNaturalNumber(parsed.delay,  1000)
    parsed.width  = toNaturalNumber(parsed.width,  800)
    parsed.height = toNaturalNumber(parsed.height, 600)

    parsed.js = (parsed.js.toLowerCase() !== 'off')? 'on': 'off'

    return parsed
}

/* Receive client request and create a shell command.
 */
function restcapt(req, result) {
    var jtn = parseRequest(req)

    debug("JTN parametreja", jtn)

    if (!jtn) {
        result.status(400).send('Required parameters: url & upload\n')
        return
    }

    tmp.tmpName(function(err, filename) {
        if (err) {
            result.status(500).send('Failed to create a file\n')
            return
        }

        var cmd = util.format(
            'xvfb-run -w1 cutycapt --url=%s --delay=%s ' +
            '--min-width=%s --min-height=%s --javascript=%s --out=%s',
            jtn.url,
            jtn.delay,
            jtn.width,
            jtn.height,
            jtn.js,
            filename
        )

        capture(req, result, cmd, jtn.upload, filename)
    })
}

/* Run cutycapt.
 */
function capture(req, result, cmd, upload, filename) {
    debug("capture() with CMD", cmd)

    // time xvfb-run -w1 cutycapt --delay=1000 --url="https://www.meetin.gs" --out=meetings.png
    // var filename = "capt_" + Date.now() + ".png"
    // var cmd = 'xvfb-run -w1 cutycapt --delay=1000 --url="' + url + '" --out=' + filename

    util.log('Before cmd: ' + Date.now())

    var cuty = exec(cmd, function(err, stdout, stderr) {
        if (err) {
            util.log('Xvfb/cutycapt stack trace:\nerr.stack')
            result.status(500).send('Failed to capture page\n')
        }

        util.log('At callback: ' + Date.now())

        upload(req, result, upload, filename)

        // result.status(200).send(filename)
    })

    cuty.on('exit', function(code) {
        util.log('At sig exit: ' + Date.now())
        // util.log('Child process returned with ' + code)
    })
}

/* Upload captured image data.
 */
function upload(req, result, upload, filename) {
    fs.stat(filename, function(err, file) {
        rest.post(upload, {
            multipart: true,
            data: {
                filename: rest.file(filename, null, file.size, null, "image/png")
            }
        }).on('complete', function(data) {
            debug("UPLOAD data", data)

            fs.unlink(filename, function(err) {
                if (err) util.log('Failed to remove tempfile: ' + filename)
                util.log('Cleanup: ' + filename)
            })
        })
    })
}

/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

// rest.post('https://twaud.io/api/v1/upload.json', {
//   multipart: true,
//   username: 'danwrong',
//   password: 'wouldntyouliketoknow',
//   data: {
//     'sound[message]': 'hello from restler!',
//     'sound[file]': rest.file('doug-e-fresh_the-show.mp3', null, 321567, null, 'audio/mpeg')
//   }
// }).on('complete', function(data) {
//   console.log(data.audio_url);
// });

// fs.stat("image.jpg", function(err, stats) {
//     restler.post("http://posttestserver.com/post.php", {
//         multipart: true,
//         data: {
//             "folder_id": "0",
//             "filename": restler.file("image.jpg", null, stats.size, null, "image/jpg")
//         }
//     }).on("complete", function(data) {
//         console.log(data);
//     });
// });

/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

app.get('/', restcapt)

app.listen(process.env.PORT)

util.log(pkg.name + ' ' + pkg.version)
util.log(pkg.description + ' by Meetin.gs Ltd')
util.log('Listening on port ' + process.env.PORT)

function debug(msg, obj) {
    console.log("DEBUG :: " + msg + " ::")
    console.log(util.inspect(obj, {showHidden: true, depth: 1, colors: true}))
}

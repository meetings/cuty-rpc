/*\
 *  libav.js
 *  2014-04-24 / Meetin.gs
\*/

var exec    = require('child_process').exec
var fs      = require('fs')
var tmp     = require('tmp')
var util    = require('util')
var restler = require('restler')
var common  = require('./lib/common.js')

var EMSG = {
    file: 'Could not create a resource\n',
    miss: 'Cannot find resource\n'
}

/* Do something...
 */
module.exports.length = function(req, result) {
    var parsed = common.parseRequest(req)

    debug("length() PARSED", parsed)

    result.status(200).send("Done")

    return
}

function debug(msg, obj) {
    console.log("DEBUG :: " + msg + " ::")
    console.log(util.inspect(obj, {showHidden: true, depth: 1, colors: true}))
}

/*\
 *  common.js
 *  2014-04-24 / Meetin.gs
\*/

var _ = require('underscore')

var AUTH_TOKEN = 'somewhatsecret9211'

var EMSG = {
    auth: 'Authentication required\n',
    arg:  'Parameters url and upload required\n'
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
module.exports.parseRequest = function(req) {
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

function debug(msg, obj) {
    console.log("DEBUG :: " + msg + " ::")
    console.log(util.inspect(obj, {showHidden: true, depth: 1, colors: true}))
}

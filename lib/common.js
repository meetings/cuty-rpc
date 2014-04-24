/*\
 *  common.js
 *  2014-04-26 / Meetin.gs
\*/

var _    = require('underscore')
var util = require('util')

var AUTH_TOKEN = 'somewhatsecret9211'

var EMSG = {
    auth: 'Authentication required\n',
    arg:  'Required parameter (%s) missing\n',
}

/* Filter undefined values.
 */
function toDefined(val) {
    return (_.isUndefined(val))? false: val;
}

/* Convert a input string to valid boolean value.
 *
 * @return true or false.
 */
function toBoolean(val) {
    if (!_.isUndefined(val))        return false
    if (val.toLowerCase() === 'on') return true
    if (val === '1')                return true
    return false
}

/* Normalize given input.
 *
 * @return a positive integer or given default value.
 */
var toNaturalNumber = function(i, def) {
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
var parseRequest = function(request, required) {
    var parsed = { fail: false }

    parsed.auth   = request.param('auth')
    parsed.url    = request.param('url')
    parsed.upload = request.param('upload')
    parsed.delay  = request.param('delay')
    parsed.width  = request.param('width')
    parsed.height = request.param('height')
    parsed.js     = request.param('javascript')

    if (toDefined(parsed.auth) !== AUTH_TOKEN) {
        parsed.fail = true
        parsed.code = 401
        parsed.err = EMSG.auth
        return parsed
    }

    _.each(required, function(param) {
        if (_.isUndefined(parsed[param])) {
            parsed.fail = true
            parsed.code = 400
            parsed.err = util.format(EMSG.arg, param)
            return parsed
        }
    })

    /*
    parsed.upload = toDefined(parsed.upload)
    parsed.delay  = toNaturalNumber(parsed.delay,  1000)
    parsed.width  = toNaturalNumber(parsed.width,  800)
    parsed.height = toNaturalNumber(parsed.height, 600)
    parsed.js     = toBoolean(parsed.js)
    */

    return parsed
}

module.exports = {
    parseRequest:    parseRequest,
    toNaturalNumber: toNaturalNumber
}

function debug(msg, obj) {
    console.log("DEBUG :: " + msg + " ::")
    console.log(util.inspect(obj, {showHidden: true, depth: 1, colors: true}))
}

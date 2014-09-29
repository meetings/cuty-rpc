/*\
 *  common.js
 *  2014-09-29 / Meetin.gs
\*/

var util = require('util')

/* Parse and validate client request.
 *
 * @return a validated set of parameters
 */
module.exports.parseRequest = function(request, required) {
  var parsed = {
    fail: false,
    time: Date.now()
  }

  parsed.auth   = request.param('auth', false)
  parsed.url    = request.param('url', false)
  parsed.upload = request.param('upload')

  /// parsed.delay  = request.param('delay')
  /// parsed.width  = request.param('width')
  /// parsed.height = request.param('height')

  /* [
   *   { param: 'auth', code: 400, msg: "err" }
   * ]
   */
  required.forEach(function(musthave) {
    if (!parsed[musthave.param]) {
      parsed.fail = true
      parsed.code = musthave.code
      parsed.msg  = musthave.msg
    }
  })

  return parsed
}

function debug(msg, obj) {
  console.log("DEBUG :: " + msg + " ::")
  console.log(util.inspect(obj, {showHidden: true, depth: 1, colors: true}))
}

/*\
 *  common.js
 *  2014-10-03 / Meetin.gs
\*/

/* Parse and validate client request.
 *
 * @return a validated set of parameters
 */
module.exports.parseRequest = function(request, required, optional) {
  var parsed = {
    ok:   true,
    time: Date.now()
  }

  /* Parse required parameters.
   */
  required.forEach(function(e) {
    parsed[e.param] = request.param(e.param, false)

    if (!parsed[e.param]) {
      parsed.ok   = false
      parsed.code = e.code
      parsed.msg  = e.msg
    }
  })

  /* Parse optional parameters.
   */
  optional.forEach(function(e) {
    parsed[e.param] = request.param(e.param, e.def)
  })

  return parsed
}

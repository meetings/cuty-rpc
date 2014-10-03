/*\
 *  phantom.js
 *  2014-10-03 / Meetin.gs
 *  Usage: phantomjs $0 <url> <file> [width] [height] [delay]
\*/

var args = require('system').args
var web  = require('webpage').create()

var url      = args[1] || phantom.exit()
var filename = args[2] || phantom.exit()
var delay    = args[5] || 1

web.viewportSize = {
  width:  args[3] || 1280,
  height: args[4] || 720
}

web.open(url, function(err) {
  setTimeout(function() {
    web.render(filename)
    phantom.exit()
  }, delay)
})

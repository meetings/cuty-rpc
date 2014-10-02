var args = require('system').args
var web  = require('webpage').create()

/// console.log("0:" + args[0])
/// console.log("1:" + args[1]) // url
/// console.log("2:" + args[2]) // filename

web.open(args[1], function(err) {
  web.render(args[2])
  phantom.exit()
})

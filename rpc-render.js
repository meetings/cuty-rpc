#!/usr/bin/phantomjs

/*\
 *  rpc-render.js
 *  Media creation and conversion as a service.
 *  2014-09-29 / Meetin.gs
\*/

var app     = require('express')()
var util    = require('util')
var phantom = require('./lib/phantom.js')
var pkg     = require('./package.json')

var port = parseInt(process.env.PORT, 10)

/* FIXME Legacy support */
app.get('/', phantom.capture)

app.get('/webcap', phantom.capture)
app.post('/webcap', phantom.capture)

app.get('/status', function(request, result) {
  result.status(200).send("status: running")
})

app.listen(port)

util.log(pkg.name + ' ' + pkg.version)
util.log(pkg.description + ' by Meetin.gs Ltd')
util.log('Listening on port ' + port)

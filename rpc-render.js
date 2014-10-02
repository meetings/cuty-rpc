#!/usr/bin/env nodejs

/*\
 *  rpc-render.js
 *  Media creation and conversion as a service.
 *  2014-10-02 / Meetin.gs
\*/

var express = require('express')
var app     = express()
var parser  = require('body-parser')
var util    = require('util')
var web     = require('./lib/web.js')
var pkg     = require('./package.json')

var port = parseInt(process.env.PORT, 10) || 8000

app.use(parser.urlencoded({extended: false}))

/* FIXME Legacy support */
app.get('/', web.capture)

app.get('/webcap', web.capture)
app.post('/webcap', web.capture)

app.get('/status', function(request, result) {
  result.status(200).send("status: running")
})

app.listen(port)

util.log(pkg.name + ' ' + pkg.version)
util.log(pkg.description + ' by Meetin.gs Ltd')
util.log('Listening on port ' + port)

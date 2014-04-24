#!/usr/bin/env nodejs

/*\
 *  cuty-rpc.js
 *  A remote access to cutycapt and libav.
 *  2014-04-26 / Meetin.gs
\*/

var app   = require('express')()
var util  = require('util')
var cuty  = require('./lib/cuty.js')
var libav = require('./lib/libav.js')
var pkg   = require('./package.json')

var port = parseInt(process.env.PORT, 10)

app.get('/',     cuty.cutycapt) /* This is legacy support */
app.get('/capt', cuty.cutycapt)

app.get('/libav/duration', libav.duration)
app.get('/libav/thumb',    libav.thumb)
app.get('/libav/convert',  libav.convert)

app.get('/status', function(request, result) {
    result.status(200).send("status: running")
})

app.listen(port)

util.log(pkg.name + ' ' + pkg.version)
util.log(pkg.description + ' by Meetin.gs Ltd')
util.log('Listening on port ' + port)

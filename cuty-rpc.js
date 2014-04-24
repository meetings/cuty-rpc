#!/usr/bin/env nodejs

/*\
 *  cuty-rpc.js
 *  A remote access to cutycapt and libav.
 *  2014-04-24 / Meetin.gs
\*/

var app    = require('express')()
var util   = require('util')
var cuty   = require('./lib/cuty.js')
var libav  = require('./lib/libav.js')
var pkg    = require('./package.json')

var port = toNaturalNumber(process.env.PORT, 8000)

app.get('/',     cuty.cutycapt) /* This is legacy support */
app.get('/capt', cuty.cutycapt)

app.get('/av/length',  libav.length)
app.get('/av/thumb',   libav.thumb)
app.get('/av/convert', libav.convert)

app.listen(port)

util.log(pkg.name + ' ' + pkg.version)
util.log(pkg.description + ' by Meetin.gs Ltd')
util.log('Listening on port ' + port)

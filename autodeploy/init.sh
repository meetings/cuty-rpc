#!/bin/sh
# init.sh, 2014-02-12 / Meetin.gs

npm config set prefix $PREFIX --global
npm install
npm link

install -m 0644 $DEPLOYDIR/$INTENT.conf /etc/init

service $INTENT start

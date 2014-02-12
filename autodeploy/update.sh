#!/bin/bash
# update.sh, 2014-02-12 / Meetin.gs

set -e
set -u

. $DEPLOYDIR/githupdate.sh

git_upgrade

if [ $? == 0 -o $FORCE ]; then
    echo "[update] Quitting"
    exit 0
fi

service $INTENT restart

echo "[update] Done"

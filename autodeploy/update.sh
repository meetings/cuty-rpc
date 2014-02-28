#!/bin/bash
# update.sh, 2014-02-12 / Meetin.gs

set -e
set -u

. $DEPLOYDIR/githupdate.sh

git_upgrade

if [ $? == 0 ] && [ "$FORCE" != "yes" ]; then
    echo Version has not changed, exiting
    exit 0
fi

service $INTENT restart

echo "[update] Done"

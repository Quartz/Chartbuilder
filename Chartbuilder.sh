#!/bin/bash

set -m
# A small launch script, starts the webserver and then opens a browser
#
#

WD=`pwd`
PYTHON="python2"
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd $DIR

$PYTHON -m SimpleHTTPServer &
sleep 1;
if command -v open >/dev/null; then
  open http://127.0.0.1:8000;
else
  xdg-open http://127.0.0.1:8000;
fi

fg

cd $WD

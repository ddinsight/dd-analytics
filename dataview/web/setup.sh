#!/bin/sh
export PATH=$PATH:/usr/local/mysql/bin/
export DYLD_LIBRARY_PATH=/usr/local/mysql/lib/
export CFLAGS=-Qunused-arguments export CPPFLAGS=-Qunused-arguments

python virtualenv.py flask
flask/bin/pip install --allow-all-external --allow-insecure twill -r  requirements.txt

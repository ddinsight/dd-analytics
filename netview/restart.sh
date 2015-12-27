#!/bin/bash

echo "### Kill 3333-listening processes"
tgtpid=`lsof -wni tcp:3333 | awk '{print $2}' | grep -v PID`
if [ -n "$tgtpid" ]; then
        echo "The PIDs to be killed: $tgtpid"
        kill -9 $tgtpid
fi
echo "### Start Netview server"
sleep 3
nohup node server.js &

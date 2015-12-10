kill -9 `lsof -wni tcp:3333 | awk '{print $2}' | grep -v PID`
nohup node server.js &

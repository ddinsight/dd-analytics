kill -9 `lsof -wni tcp:3333 | awk '{print $2}' | grep -v PID`
kill -9 `ps -ef  | grep grunt | awk '{print $2}' | grep -v PID`
redis-3.0.0/src/redis-cli flushall
redis-3.0.0/src/redis-cli shutdown
rm dump.rdb
rm nohup.out
nohup redis-3.0.0/src/redis-server &
nohup grunt  &


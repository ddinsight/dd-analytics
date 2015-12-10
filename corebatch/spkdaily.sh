#! /bin/bash
echo $(date) "SPARK BATCH JOB START"
spark-submit /your/script/directory/smkvidss.py

echo $(date) "SQOOP MySQL IMPORT START"

bin/sqoop-import --connect jdbc:mysql://mysql.server.yours.com:3306/apmain --username opendd --password xxxxx --table cellinfo --hive-import --hive-overwrite
bin/sqoop-import --connect jdbc:mysql://mysql.server.yours.com:3306/apmain --username opendd --password xxxxx --table apinfo --hive-import --hive-overwrite

echo $(date) "HIVE PRESENTATION TABLE MAKE START"
hive -f pscreate.sql

echo $(date) "HIVE DUMP"
hive -e "select * from lteidux" > lteidux.csv
hive -e "select * from cellidux" > cellidux.csv
hive -e "select * from lteidux_todow" > lteidux_todow.csv
hive -e "select * from lteidux_recentness" > lteidux_recentness.csv
hive -e "select * from lteidux_badness" > lteidux_badness.csv
hive -e "select * from lteidux_badness_3hr" > lteidux_badness_3hr.csv
hive -e "select * from cellidux_todow" > cellidux_todow.csv
hive -e "select * from cellidux_dev" > cellidux_dev.csv
hive -e "select * from cellidux_badness" > cellidux_badness.csv
hive -e "select * from cellidux_badness_todow" > cellidux_badness_todow.csv
hive -e "select * from cellidux_badness_dev" > cellidux_badness_dev.csv
hive -e "select * from bssidux" > bssidux.csv
hive -e "select * from bssidux_todow" > bssidux_todow.csv
hive -e "select * from bssidux_badness" > bssidux_badness.csv
hive -e "select * from bssidux_badness_todow" > bssidux_badness_todow.csv
hive -e "select * from sktdemo_cell_badness" > sktdemo_cell_badness.csv
hive -e "select * from sktdemo_cell_badness_dev" > sktdemo_cell_badness_dev.csv
hive -e "select * from sktdemo_cell_badness_todow" > sktdemo_cell_badness_todow.csv
hive -e "select * from sktdemo_wf_badness" > sktdemo_wf_badness.csv
hive -e "select * from sktdemo_wf_badness_dev" > sktdemo_wf_badness_dev.csv
hive -e "select * from sktdemo_wf_badness_todow" > sktdemo_wf_badness_todow.csv
hive -e "select * from vidsession_view" > vidsession.csv
hive -e "select * from vidsession_log_view" > vidsession_log.csv

echo $(date) "EXPORT TO POSTGRE"
psql  -h postgre.server.yours.com -U opendd -w -f pscopy.sql opendd

rm *.csv
echo $(date) "SPARK BATCH JOB COMPLETE"


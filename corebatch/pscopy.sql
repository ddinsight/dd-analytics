-- This SQL statements are executed in PostgreSQL.
truncate lteidux;
truncate cellidux;
truncate lteidux_todow;
truncate lteidux_recentness ;
truncate lteidux_badness;
truncate lteidux_badness_3hr;
truncate cellidux_todow;
truncate cellidux_dev;
truncate cellidux_badness;
truncate cellidux_badness_todow;
truncate cellidux_badness_dev;
truncate bssidux;
truncate bssidux_todow;
truncate bssidux_badness;
truncate bssidux_badness_todow;
truncate sktdemo_cell_badness;
truncate sktdemo_cell_badness_dev;
truncate sktdemo_cell_badness_todow;
truncate sktdemo_wf_badness;
truncate sktdemo_wf_badness_dev;
truncate sktdemo_wf_badness_todow;
truncate vidsession;
truncate vidsession_log;

\copy lteidux from '/your/working/directory/lteidux.csv'
\copy cellidux from '/your/working/directory/cellidux.csv'
\copy lteidux_todow from '/your/working/directory/lteidux_todow.csv'
\copy lteidux_recentness from '/your/working/directory/lteidux_recentness.csv'
\copy lteidux_badness from '/your/working/directory/lteidux_badness.csv'
\copy lteidux_badness_3hr from '/your/working/directory/lteidux_badness_3hr.csv'
\copy cellidux_todow from '/your/working/directory/cellidux_todow.csv'
\copy cellidux_dev from '/your/working/directory/cellidux_dev.csv'
\copy cellidux_badness from '/your/working/directory/cellidux_badness.csv'
\copy cellidux_badness_todow from '/your/working/directory/cellidux_badness_todow.csv'
\copy cellidux_badness_dev from '/your/working/directory/cellidux_badness_dev.csv'
\copy bssidux from '/your/working/directory/bssidux.csv'
\copy bssidux_todow from '/your/working/directory/bssidux_todow.csv'
\copy bssidux_badness from '/your/working/directory/bssidux_badness.csv'
\copy bssidux_badness_todow from '/your/working/directory/bssidux_badness_todow.csv'
\copy sktdemo_cell_badness from '/your/working/directory/sktdemo_cell_badness.csv'
\copy sktdemo_cell_badness_dev from '/your/working/directory/sktdemo_cell_badness_dev.csv'
\copy sktdemo_cell_badness_todow from '/your/working/directory/sktdemo_cell_badness_todow.csv'
\copy sktdemo_wf_badness from '/your/working/directory/sktdemo_wf_badness.csv'
\copy sktdemo_wf_badness_dev from '/your/working/directory/sktdemo_wf_badness_dev.csv'
\copy sktdemo_wf_badness_todow from '/your/working/directory/sktdemo_wf_badness_todow.csv'
\copy vidsession from '/your/working/directory/vidsession.csv'
\copy vidsession_log from '/your/working/directory/vidsession_log.csv'


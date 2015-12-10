-- This tables should be created in HIVE - HDFS and exported to PostgreSQL.
drop table lteidux;
drop table cellidux;
drop table lteux_t1;
drop table lteux_t2;
drop table lteidux_todow;
drop table lteidux_badness;
drop table lteidux_recentness_m1;
drop table lteidux_rcm1_t1;
drop table lteidux_recentness ;
drop table lteidux_badness_3hr;
drop table cellidux_todow;
drop table cellidux_dev;
drop table cellidux_t1;
drop table cellidux_badness;
drop table cellidux_badness_todow;
drop table cellidux_badness_dev;
drop table bssidux;
drop table bssidux_todow;
drop table bssidux_t1;
drop table bssidux_badness;
drop table bssidux_badness_todow;
drop table sktdemo_cell_badness;
drop table sktdemo_cell_badness_dev;
drop table sktdemo_cell_badness_todow;
drop table sktdemo_wf_badness;
drop table sktdemo_wf_badness_dev;
drop table sktdemo_wf_badness_todow;

create table lteidux as
select c.fullid, min(c.lat) as lat, min(c.lng) as lng,
count(distinct b.playsessionid) as sesscnt,
count(*) as logcnt, count(distinct b.androidid ) as usrcnt,
sum(a.playtime) as playtime, max(nvl(ss.splaytime,0)) as usrmaxtime,
sum(a.pausetime) as pausetime,
sum(if(a.logtype = 6, 1, 0)) as pausecnt,
sum(if(a.ntype = '0', a.wfrxbytes, a.cellrxbytes)) as cellrxbytes,
sum(if(a.ntype = '0', a.wfduration, a.cellduration)) as cellduration,
count(distinct if(b.vidnetStartTime = a.logStartTime, b.playsessionid, null)) as stPscnt,
sum(if(b.playtime = 0 and b.vidnetStartTime = a.logstartTime, 1, 0))  as stfail
from vidsession_log a, vidsession b,
  (select a.cellid, b.androidid , sum(a.playtime) as splaytime
  from vidsession_log a , cellid_ntype y , vidsession b
  where b.playsessionid = a.playsessionid and b.playservicemode in (2,3)
  and (a.cellid like '45008%' or a.cellid like '45005%' or a.cellid like '45006%')
  and logstarttime > unix_timestamp('2015-01-01 15:00:00')
  and a.ntype <> '0' and a.cellid = y.cellid and y.ntype like 'LTE%' and not (b.playTime >= 1800 and b.pausecnt >= 100)
  group by a.cellid, b.androidid) ss , cellinfo c, cellid_ntype y
where a.playsessionid = b.playsessionid and b.playservicemode in (2,3) and a.cellid=ss.cellid and b.androidid=ss.androidid
and b.vidnetstarttime > unix_timestamp('2015-01-01 15:00:00')
and a.cellid = c.fullid and (a.cellid like '45008%' or a.cellid like '45005%' or a.cellid like '45006%')
and c.lat > -200
and a.ntype <> '0' and c.fullid = y.cellid and y.ntype like 'LTE%'
and not (b.playTime >= 1800 and b.pausecnt >= 100)
group by c.fullid;

create table lteux_t1 as
select
a.playsessionid, a.cellid, a.logstarttime, a.logtype, a.ntype,a.pausetime,
a.wfrxbytes,a.cellrxbytes, a.cellduration, a.wfduration, a.playTime,
if(a.logtype = 6 and a.playTime <= 300, 1, 0) as largepc,
if(a.logtype <> 6 or a.playTime > 300, 1, 0) as smallpc
from (
  SELECT k.playsessionid, k.cellid, k.logstarttime, k.logtype, k.ntype,
      k.pausetime, k.wfrxbytes, k.cellrxbytes, k.cellduration, k.wfduration,
      sum(k.playtime) OVER (PARTITION BY playsessionid, k.cellid ORDER BY playsessionid, k.cellid, ttm ROWS UNBOUNDED PRECEDING) AS playtime
  FROM cellid_ntype m, vidsession_log k
  WHERE m.ntype <> '0' AND substr(k.cellid, 1, 5) IN ('45005', '45006', '45008') AND k.cellid = m.cellid AND m.ntype like 'LTE%'
) a;

create table lteux_t2 as
select t1.*, a.lat, a.lng from lteux_t1 t1, cellinfo a where t1.cellid = a.fullid and a.lat > -200;

create table lteidux_todow as
select
  a.cellid, min(a.lat) as lat, min(a.lng) as lng,
  hour(from_unixtime(b.vidnetstarttime)) as todow,
  count(distinct b.playsessionid) as sesscnt,
  count(*) as logcnt, count(distinct b.androidid ) as usrcnt,
  sum(a.playtime) as playtime, sum(a.pausetime) as pausetime,
  sum(if(a.logtype = 6, 1, 0)) as pausecnt,
  sum(if(a.ntype = '0', a.wfrxbytes, a.cellrxbytes)) as cellrxbytes,
  sum(if(a.ntype = '0', a.wfduration, a.cellduration)) as cellduration,
  count(distinct case when b.vidnetStartTime= a.logStartTime then b.playsessionid end) as stPscnt,
  sum(case when b.playtime = 0 and b.vidnetStartTime = a.logstartTime then 1 else 0 end)  as stfail
from lteux_t2 a, vidsession b
where a.playsessionid = b.playsessionid and b.playservicemode in (2,3)
  and not (b.playTime >= 1800 and b.pausecnt >= 100)
group by a.cellid, hour(from_unixtime(b.vidnetstarttime))
;

create table lteidux_badness as
select
  a.cellid, a.lat, a.lng,  count(distinct b.androidid) as usrcnt, count(distinct b.playsessionid) as sesscnt,
  count(distinct if(a.largepc> 0 or (a.cellid = b.cellidst and b.playtime <=30 and (b.vidnetendtime - b.vidnetstarttime) <= 1), b.androidid, null))
  as badusrcnt,
  count(distinct if(a.largepc> 0 or (a.cellid = b.cellidst and b.playtime <=30 and (b.vidnetendtime - b.vidnetstarttime) <= 1), b.playsessionid, null))
  as badsesscnt,
  count(distinct if(a.largepc> 0 or (a.cellid = b.cellidst and b.playtime <=30 and (b.vidnetendtime - b.vidnetstarttime) <= 1), from_unixtime(a.logstarttime, 'yyyyMMdd'), null))
  as baddaycnt,
  count(distinct from_unixtime(a.logstarttime, 'yyyyMMdd')) as daycnt,
  sum(if(a.cellid = b.cellidst and b.playtime <= 30 and (b.vidnetendtime - b.vidnetstarttime) <=1, 1, 0)) as stfail,
  min(0) as dronst,
  sum(a.largepc) as largepc,
  sum(a.smallpc) as smallpc
from lteux_t2 a, vidsession b
where a.playsessionid = b.playsessionid and b.playservicemode in (2,3)
and b.vidnetstarttime > unix_timestamp('2015-01-01 00:00:00')
and not (b.playtime >= 1800 and b.pausecnt >= 100)
group by a.cellid, a.lat, a.lng
;

create table lteidux_recentness_m1 as
select
a.cellid, a.lat, a.lng,  from_unixtime(a.logstarttime, 'yyyyMMdd') as todow,
count(distinct b.androidid) as usrcnt, count(distinct b.playsessionid) as sesscnt,
sum(if(a.ntype = '0', a.wfrxbytes, a.cellrxbytes)) as rxbytes,
sum(b.playtime) as playtime,
  sum(if(a.cellid = b.cellidst and b.playtime <= 30 and (b.vidnetendtime- b.vidnetstarttime)<=1, 1, 0)) as stfail,
  min(0) as dronst,
sum(a.largepc) as largepc,
sum(a.smallpc) as smallpc
from lteux_t2 a , vidsession b
where  a.playsessionid = b.playsessionid and b.playservicemode in (2,3)
and b.vidnetstarttime > unix_timestamp('2015-01-01 15:00:00')
and not (b.playtime >= 1800 and b.pausecnt >= 100)
group by a.cellid, a.lat, a.lng, from_unixtime(a.logstarttime, 'yyyyMMdd')
;

-- create table copy_ymd as select distinct sd_date from copy_ymdh;

create table lteidux_rcm1_t1 as
select b.cellid, b.lat, b.lng, b.todow, sum(b.rxbytes) as rxbytes, sum(b.playtime) as playtime,
  (sum(b.stfail)+sum(b.dronst)+sum(b.largepc)+sum(b.smallpc)) as badb,
  (sum(b.stfail)+sum(b.dronst)+sum(b.largepc)) as badt,
  ((pow(sum(b.usrcnt),2) * pow(sum(b.sesscnt),2))/((1+ pow(sum(b.usrcnt),2))*(1+pow(sum(b.sesscnt),2)))) as badm
from lteidux_recentness_m1 b group by cellid, lat, lng, todow ;

create table lteidux_recentness  as
select  x.cellid, x.todow, nvl(if(n.badb=0, 0, n.badt/n.badb*100*n.badm), 0) as badness, nvl(n.rxbytes, 0) as rxbytes, nvl(n.playtime, 0) as playtime
from
  (select a.cellid , y.todow  from
    (select distinct cellid from lteidux_recentness_m1 where 1=1 ) a,
    (select distinct regexp_replace(sd_date,'-', '') as todow from copy_ymdh where sd_date >= '2015-01-01' and sd_date< current_date) y
   order by y.todow ) x left join
   lteidux_rcm1_t1 n on x.cellid = n.cellid and x.todow = n.todow
;

create table lteidux_badness_3hr as
select
  a.cellid, a.lat, a.lng,
  floor(hour(from_unixtime(vidnetstarttime))/3) as todow,
  count(distinct b.androidid) as usrcnt, count(distinct b.playsessionid) as sesscnt,
  count(distinct if(a.largepc> 0  or (a.cellid = b.cellidst and b.playtime <=30 and (b.vidnetendtime - b.vidnetstarttime) <= 1)
            or (a.cellid = b.cellidend and b.playtime <=30 and (b.vidnetendtime - b.vidnetstarttime) <= 3), b.androidid, null))  as badusrcnt,
  count(distinct if(a.largepc> 0 or (a.cellid = b.cellidst and b.playtime <=30 and (b.vidnetendtime - b.vidnetstarttime) <= 1)
            or (a.cellid = b.cellidend and b.playtime <=30 and (b.vidnetendtime - b.vidnetstarttime) <= 3), b.playsessionid, null)) as badsesscnt,
  count(distinct if(a.largepc> 0 or (a.cellid = b.cellidst and b.playtime <=30 and (b.vidnetendtime - b.vidnetstarttime) <= 1)
            or (a.cellid = b.cellidend and b.playtime <=30 and (b.vidnetendtime - b.vidnetstarttime) <= 3), from_unixtime(a.logstarttime, 'yyyyMMdd'), null)) as baddaycnt,
  count(distinct from_unixtime(a.logstarttime, 'yyyyMMdd')) as daycnt,
  sum(if(a.cellid = b.cellidst and b.playtime <= 30 and (b.vidnetendtime - b.vidnetstarttime) <=1, 1, 0)) as stfail,
  min(0) as dronst,
  sum(a.largepc) as largepc,
  sum(a.smallpc) as smallpc
from lteux_t2 a , vidsession b
where a.playsessionid = b.playsessionid and b.playservicemode in (2,3)
and b.vidnetstarttime > unix_timestamp('2015-01-01 00:00:00')
and not (b.playtime >= 1800 and b.pausecnt >= 100)
group by a.cellid, a.lat, a.lng, floor(hour(from_unixtime(vidnetstarttime))/3)
;

create table cellidux_t1 as
select a.playSessionID, a.logstarttime, a.cellid, a.logtype, a.playtime, b.lat, b.lng,
  a.pausetime, a.wfrxbytes, a.wfduration, a.cellrxbytes, a.cellduration,
  if(a.logtype = 6 and a.playtime <= 20, 1, 0) as largepc,
  if(a.logtype = 6 and a.playtime > 20, 1, 0) as smallpc
  from vidsession_log a, cellinfo b
  where a.cellid = b.fullid and b.lat > -200 and a.ntype <> '0'
  and (a.cellid like '45008%' or a.cellid like '45005%' or a.cellid like '45006%')
  ;

create table cellidux as
select
  a.cellid, min(a.lat) as lat, min(a.lng) as lng,
  count(distinct b.playsessionid) as sesscnt,
  count(*) as logcnt, count(distinct b.androidid ) as usrcnt,
  sum(a.playtime) as playtime, sum(a.pausetime) as pausetime,
  sum(if(a.logtype = 6, 1, 0)) as pausecnt,
  sum(a.cellrxbytes) as cellrxbytes,
  sum(a.cellduration) as cellduration,
  count(distinct if(b.vidnetStartTime= a.logStartTime, b.playsessionid, null)) as stPscnt,
  sum(if(b.playtime = 0 and b.vidnetStartTime = a.logstartTime, 1, 0))  as stfail
from cellidux_t1 a, vidsession b
where a.playsessionid = b.playsessionid and b.playservicemode in (2,3)
  and not (b.playTime >= 1800 and b.pausecnt >= 100)
group by a.cellid
;

create table cellidux_todow as
select
  a.cellid, min(a.lat) as lat, min(a.lng) as lng,
  hour(from_unixtime(b.vidnetstarttime)) as todow,
  count(distinct b.playsessionid) as sesscnt,
  count(*) as logcnt, count(distinct b.androidid ) as usrcnt,
  sum(a.playtime) as playtime, sum(a.pausetime) as pausetime,
  sum(if(a.logtype = 6, 1, 0)) as pausecnt,
  sum(a.cellrxbytes) as cellrxbytes,
  sum(a.cellduration) as cellduration,
  count(distinct if(b.vidnetStartTime= a.logStartTime, b.playsessionid, null)) as stPscnt,
  sum(if(b.playtime = 0 and b.vidnetStartTime = a.logstartTime, 1, 0))  as stfail
from cellidux_t1 a, vidsession b
where a.playsessionid = b.playsessionid and b.playservicemode in (2,3)
  and not (b.playTime >= 1800 and b.pausecnt >= 100)
group by a.cellid, hour(from_unixtime(b.vidnetstarttime))
;

create table cellidux_dev as
select
  a.cellid, min(a.lat) as lat, min(a.lng) as lng,
  b.brand, b.model,
  count(distinct b.playsessionid) as sesscnt,
  count(*) as logcnt, count(distinct b.androidid ) as usrcnt,
  sum(a.playtime) as playtime, sum(a.pausetime) as pausetime,
  sum(if(a.logtype = 6, 1, 0)) as pausecnt,
  sum(a.cellrxbytes) as cellrxbytes,
  sum(a.cellduration) as cellduration,
  count(distinct if(b.vidnetStartTime= a.logStartTime, b.playsessionid, null)) as stPscnt,
  sum(if(b.playtime = 0 and b.vidnetStartTime = a.logstartTime, 1, 0))  as stfail
from cellidux_t1 a, vidsession b
where a.playsessionid = b.playsessionid and b.playservicemode in (2,3)
  and not (b.playTime >= 1800 and b.pausecnt >= 100)
group by a.cellid, b.brand, b.model
;

create table cellidux_badness as
select
  a.cellid, a.lat, a.lng,  count(distinct b.androidid) as usrcnt, count(distinct b.playsessionid) as sesscnt,
  count(distinct if(a.largepc > 0 or (a.cellid = b.cellidst and b.playtime <=30 and (b.vidnetendtime - b.vidnetstarttime) <= 1)
            or (a.cellid = b.cellidend and b.playtime <=30 and (b.vidnetendtime - b.vidnetstarttime) <= 3), b.androidid, null))  as badusrcnt,
  count(distinct if(a.largepc > 0 or (a.cellid = b.cellidst and b.playtime <=30 and (b.vidnetendtime - b.vidnetstarttime) <= 1)
            or (a.cellid = b.cellidend and b.playtime <=30 and (b.vidnetendtime - b.vidnetstarttime) <= 3), b.playsessionid, null)) as badsesscnt,
  count(distinct if(a.largepc > 0 or (a.cellid = b.cellidst and b.playtime <=30 and (b.vidnetendtime - b.vidnetstarttime) <= 1)
            or (a.cellid = b.cellidend and b.playtime <=30 and (b.vidnetendtime - b.vidnetstarttime) <= 3), from_unixtime(a.logstarttime, 'yyyyMMdd'), null)) as baddaycnt,
  count(distinct from_unixtime(a.logstarttime, 'yyyyMMdd')) as daycnt,
  sum(if(a.cellid = b.cellidst and b.playtime <= 30 and (b.vidnetendtime - b.vidnetstarttime) <=1, 1, 0)) as stfail,
  sum(if(a.cellid = b.cellidend and b.playtime <= 30 and (b.vidnetendtime - b.vidnetstarttime) <=3, 1, 0)) as dronst,
  sum(a.largepc) as largepc,
  sum(a.smallpc) as smallpc
from cellidux_t1 a , vidsession b
where a.playsessionid = b.playsessionid and b.playservicemode in (2,3)
  and b.vidnetstarttime > unix_timestamp('2015-01-01 00:00:00')
  and not (b.playtime >= 1800 and b.pausecnt >= 100)
group by a.cellid, a.lat, a.lng
;

create table cellidux_badness_todow as
select
  a.cellid, a.lat, a.lng,
  hour(from_unixtime(vidnetstarttime)) as todow,
  count(distinct b.androidid) as usrcnt,
  count(distinct b.playsessionid) as sesscnt,
  count(distinct if(a.largepc > 0 or (a.cellid = b.cellidst and b.playtime <=30 and (b.vidnetendtime - b.vidnetstarttime) <= 1)
            or (a.cellid = b.cellidend and b.playtime <=30 and (b.vidnetendtime - b.vidnetstarttime) <= 3), b.androidid, null))  as badusrcnt,
  count(distinct if(a.largepc > 0 or (a.cellid = b.cellidst and b.playtime <=30 and (b.vidnetendtime - b.vidnetstarttime) <= 1)
            or (a.cellid = b.cellidend and b.playtime <=30 and (b.vidnetendtime - b.vidnetstarttime) <= 3), b.playsessionid, null)) as badsesscnt,
  count(distinct if(a.largepc > 0 or (a.cellid = b.cellidst and b.playtime <=30 and (b.vidnetendtime - b.vidnetstarttime) <= 1)
            or (a.cellid = b.cellidend and b.playtime <=30 and (b.vidnetendtime - b.vidnetstarttime) <= 3), from_unixtime(a.logstarttime, 'yyyyMMdd'), null)) as baddaycnt,
  count(distinct from_unixtime(a.logstarttime, 'yyyyMMdd')) as daycnt,
  sum(if(a.cellid = b.cellidst and b.playtime <= 30 and (b.vidnetendtime - b.vidnetstarttime) <=1, 1, 0)) as stfail,
  sum(if(a.cellid = b.cellidend and b.playtime <= 30 and (b.vidnetendtime - b.vidnetstarttime) <=3, 1, 0)) as dronst,
  sum(a.largepc) as largepc, sum(a.smallpc) as smallpc
from cellidux_t1 a, vidsession b
where a.playsessionid = b.playsessionid and b.playservicemode in (2,3)
and not (b.playtime >= 1800 and b.pausecnt >= 100)
group by a.cellid, a.lat, a.lng, hour(from_unixtime(vidnetstarttime))
  ;

create table cellidux_badness_dev as
select
  a.cellid, a.lat, a.lng, b.brand, b.model,
  count(distinct b.androidid) as usrcnt,
  count(distinct b.playsessionid) as sesscnt,
  count(distinct if(a.largepc > 0 or (a.cellid = b.cellidst and b.playtime <=30 and (b.vidnetendtime - b.vidnetstarttime) <= 1)
            or (a.cellid = b.cellidend and b.playtime <=30 and (b.vidnetendtime - b.vidnetstarttime) <= 3), b.androidid, null))  as badusrcnt,
  count(distinct if(a.largepc > 0 or (a.cellid = b.cellidst and b.playtime <=30 and (b.vidnetendtime - b.vidnetstarttime) <= 1)
            or (a.cellid = b.cellidend and b.playtime <=30 and (b.vidnetendtime - b.vidnetstarttime) <= 3), b.playsessionid, null)) as badsesscnt,
  count(distinct if(a.largepc > 0 or (a.cellid = b.cellidst and b.playtime <=30 and (b.vidnetendtime - b.vidnetstarttime) <= 1)
            or (a.cellid = b.cellidend and b.playtime <=30 and (b.vidnetendtime - b.vidnetstarttime) <= 3), from_unixtime(a.logstarttime, 'yyyyMMdd'), null)) as baddaycnt,
  count(distinct from_unixtime(a.logstarttime, 'yyyyMMdd')) as daycnt,
  sum(if(a.cellid = b.cellidst and b.playtime <= 30 and (b.vidnetendtime - b.vidnetstarttime) <=1, 1, 0)) as stfail,
  sum(if(a.cellid = b.cellidend and b.playtime <= 30 and (b.vidnetendtime - b.vidnetstarttime) <=3, 1, 0)) as dronst,
  sum(a.largepc) as largepc, sum(a.smallpc) as smallpc
from cellidux_t1 a, vidsession b
where a.playsessionid = b.playsessionid and b.playservicemode in (2,3)
and not (b.playtime >= 1800 and b.pausecnt >= 100)
group by a.cellid, a.lat, a.lng, brand, model
;

create table bssidux as
select
  bssid, min(lat) as lat, min(lng) as lng, --min(ssid) as ssid,
--   to_char((TIMESTAMP 'epoch' + (vidnetstarttime + 32400) * INTERVAL '1 second'), 'D-HH24') as hh06,
--   devmodel  as model,
  count(distinct playsessionid) as sesscnt,
  sum(logcnt) as logcnt, count(distinct androidid ) as usrcnt,
  sum(pltime) as playtime,
  sum(pausetime) as pausetime,
  sum(pauseCnt) as pausecnt,
  sum(rxbytes) as wfrxbytes,
  sum(rxduration) as wfduration,
  sum(bstPs) as stPscnt,
  sum(bstfail)  as stfail
from
( select
  a.playSessionID, a.bssid, min(c.lat) as lat, min(c.lng) as lng,
           count(*) as logcnt, min(androidid) as androidid,
           sum(a.playtime) as pltime,
           min(b.pausecnt) as pauseCnt,
          sum(a.pausetime) as pausetime,
           sum(a.wfrxbytes) as rxbytes,
           sum(a.wfduration) as rxduration,
           min(if(b.vidnetStartTime = a.logStartTime, 1, 0)) as bstPs,
          min(if(b.vidnetStartTime = a.logStartTime and b.playtime <= 30 and (b.vidnetendtime - b.vidnetstarttime) <=1, 1, 0)) as bstfail
from vidsession_log a, vidsession b, apinfo c
where a.playsessionid = b.playsessionid
      and a.bssid = c.bssid and (a.cellid like '45008%' or a.cellid like '45005%' or a.cellid like '45006%')
      and c.lat > -200 and a.bssid > '00:00:00:00:00:00' and a.ntype = '0'
      and not (b.playTime >= 1800 and b.pausecnt >= 100)
group by a.playSessionID, a.bssid) k
group by bssid ;

create table bssidux_todow as
select
  bssid, min(lat) as lat, min(lng) as lng,
  hour(from_unixtime(vidnetstarttime)) as todow,
  count(distinct playsessionid) as sesscnt,
  sum(logcnt) as logcnt, count(distinct androidid ) as usrcnt,
  sum(pltime) as playtime,
  sum(pausetime) as pausetime,
  sum(pauseCnt) as pausecnt,
  sum(rxbytes) as wfrxbytes,
  sum(rxduration) as wfduration,
  sum(bstPs) as stPscnt,
  sum(bstfail)  as stfail
from
(select
  a.playSessionID, a.bssid, min(c.lat) as lat, min(c.lng) as lng,
          min(b.vidnetstarttime) as vidnetstarttime,
           count(*) as logcnt, min(androidid) as androidid,
           sum(a.playtime) as pltime,
           min(b.pausecnt) as pauseCnt,
          sum(a.pausetime) as pausetime,
           sum(a.wfrxbytes) as rxbytes,
           sum(a.wfduration) as rxduration,
           min(if(b.vidnetStartTime = a.logStartTime, 1, 0)) as bstPs,
          min(if(b.vidnetStartTime = a.logStartTime and b.playtime <= 30 and (b.vidnetendtime - b.vidnetstarttime) <=1, 1, 0)) as bstfail
from vidsession_log a, vidsession b, apinfo c
where a.playsessionid = b.playsessionid
      and a.bssid = c.bssid and (a.cellid like '45008%' or a.cellid like '45005%' or a.cellid like '45006%')
      and c.lat > -200 and a.bssid > '00:00:00:00:00:00' and a.ntype = '0'
      and not (b.playTime >= 1800 and b.pausecnt >= 100)
group by a.playSessionID, a.bssid ) k
group by bssid , hour(from_unixtime(vidnetstarttime));

create table bssidux_t1 as
select
  a.playsessionid, a.logtype, a.logstarttime, a.ntype, a.cellid, a.bssid, b.lat, b.lng,
  row_number() over (partition by a.playsessionid order by a.ttm asc) as rnk,
  if(a.logtype = 6 and a.playtime <= 10, 1, 0) as largepc,
  if(a.logtype = 6 and a.playtime > 10, 1, 0) as smallpc
  from vidsession_log a , apinfo b
  where a.ntype = '0'
  and a.bssid = b.bssid and (a.cellid like '45008%' or a.cellid like '45005%' or a.cellid like '45006%')
  and b.lat > -200
  ;

create table bssidux_badness as
select
  a.bssid, a.lat, a.lng,
  count(distinct b.androidid) as usrcnt, count(distinct b.playsessionid) as sesscnt,
  count(distinct if(a.largepc > 0 or (a.cellid = b.cellidst and b.playtime <=30 and (b.vidnetendtime - b.vidnetstarttime) <= 1)
            or (a.cellid = b.cellidend and b.playtime <=30 and (b.vidnetendtime - b.vidnetstarttime) <= 3), b.androidid, null))  as badusrcnt,
  count(distinct if(a.largepc > 0 or (a.cellid = b.cellidst and b.playtime <=30 and (b.vidnetendtime - b.vidnetstarttime) <= 1)
            or (a.cellid = b.cellidend and b.playtime <=30 and (b.vidnetendtime - b.vidnetstarttime) <= 3), b.playsessionid, null)) as badsesscnt,
  count(distinct if(a.largepc > 0 or (a.cellid = b.cellidst and b.playtime <=30 and (b.vidnetendtime - b.vidnetstarttime) <= 1)
            or (a.cellid = b.cellidend and b.playtime <=30 and (b.vidnetendtime - b.vidnetstarttime) <= 3), from_unixtime(a.logstarttime, 'yyyyMMdd'), null)) as baddaycnt,
  count(distinct from_unixtime(a.logstarttime, 'yyyyMMdd')) as daycnt,
  sum(case when a.rnk=1 and b.playtime <=30 and (b.vidnetendtime - b.vidnetstarttime) <= 1  then 1 else 0 end) as stfail,
  sum(case when a.rnk=1 and b.playtime <=30 and (b.vidnetendtime - b.vidnetstarttime) > 1 and  (b.vidnetendtime - b.vidnetstarttime) <= 3 then 1 else 0 end) as dronst,
  sum(a.largepc) as largepc,
  sum(a.smallpc) as smallpc
from bssidux_t1 a, vidsession b
where a.playsessionid = b.playsessionid -- and b.playservicemode in (2,3)
  and b.vidnetstarttime > unix_timestamp('2015-01-01 00:00:00')
  and a.ntype = '0' -- and a.bssid > '00:00:00:00:00:00'
  and not (b.playtime >= 1800 and b.pausecnt >= 100)
group by a.bssid, a.lat, a.lng
;

create table bssidux_badness_todow as
select
  a.bssid, a.lat, a.lng,hour(from_unixtime(vidnetstarttime)) as todow,
  count(distinct b.androidid) as usrcnt, count(distinct b.playsessionid) as sesscnt,
  count(distinct if(a.largepc > 0 or (a.cellid = b.cellidst and b.playtime <=30 and (b.vidnetendtime - b.vidnetstarttime) <= 1)
            or (a.cellid = b.cellidend and b.playtime <=30 and (b.vidnetendtime - b.vidnetstarttime) <= 3), b.androidid, null))  as badusrcnt,
  count(distinct if(a.largepc > 0 or (a.cellid = b.cellidst and b.playtime <=30 and (b.vidnetendtime - b.vidnetstarttime) <= 1)
            or (a.cellid = b.cellidend and b.playtime <=30 and (b.vidnetendtime - b.vidnetstarttime) <= 3), b.playsessionid, null)) as badsesscnt,
  count(distinct if(a.largepc > 0 or (a.cellid = b.cellidst and b.playtime <=30 and (b.vidnetendtime - b.vidnetstarttime) <= 1)
            or (a.cellid = b.cellidend and b.playtime <=30 and (b.vidnetendtime - b.vidnetstarttime) <= 3), from_unixtime(a.logstarttime, 'yyyyMMdd'), null)) as baddaycnt,
  count(distinct from_unixtime(a.logstarttime, 'yyyyMMdd')) as daycnt,
  sum(case when a.rnk=1 and b.playtime <=30 and (b.vidnetendtime - b.vidnetstarttime) <= 1  then 1 else 0 end) as stfail,
  sum(case when a.rnk=1 and b.playtime <=30 and (b.vidnetendtime - b.vidnetstarttime) > 1 and  (b.vidnetendtime - b.vidnetstarttime) <= 3 then 1 else 0 end) as dronst,
  sum(a.largepc) as largepc,
  sum(a.smallpc) as smallpc
from bssidux_t1 a, vidsession b
where 1=1
  and a.playsessionid = b.playsessionid -- and b.playservicemode in (2,3)
  and b.vidnetstarttime > unix_timestamp('2015-01-01 00:00:00')
  and a.ntype = '0' -- and a.bssid > '00:00:00:00:00:00'
  and not (b.playtime >= 1800 and b.pausecnt >= 100)
group by a.bssid, a.lat, a.lng, hour(from_unixtime(vidnetstarttime))
;

create table sktdemo_cell_badness as
select
  a.cellid, a.lat, a.lng,  count(distinct b.androidid) as usrcnt,
  count(distinct b.playsessionid) as sesscnt,
  sum(if(a.cellid = b.cellidst and b.playtime <= 30 and (b.vidnetendtime - b.vidnetstarttime) <=1, 1, 0)) as stfail,
  sum(if(a.cellid = b.cellidend and b.playtime <= 30 and (b.vidnetendtime - b.vidnetstarttime) <=3, 1, 0)) as dronst,
  sum(a.largepc) as largepc,
  sum(a.smallpc) as smallpc
from cellidux_t1 a , vidsession b
where a.playsessionid = b.playsessionid and b.playservicemode in (2,3)
and not (b.playtime >= 1800 and b.pausecnt >= 100)
group by a.cellid, a.lat, a.lng
  ;

create table sktdemo_cell_badness_dev as
select
  a.cellid, a.lat, a.lng, b.brand, b.model,
  count(distinct b.androidid) as usrcnt,
  count(distinct b.playsessionid) as sesscnt,
  sum(if(a.cellid = b.cellidst and b.playtime <= 30 and (b.vidnetendtime - b.vidnetstarttime) <=1, 1, 0)) as stfail,
  sum(if(a.cellid = b.cellidend and b.playtime <= 30 and (b.vidnetendtime - b.vidnetstarttime) <=3, 1, 0)) as dronst,
  sum(a.largepc) as largepc,
  sum(a.smallpc) as smallpc
from cellidux_t1 a , vidsession b
where a.playsessionid = b.playsessionid and b.playservicemode in (2,3)
and not (b.playtime >= 1800 and b.pausecnt >= 100)
group by a.cellid, a.lat, a.lng, b.brand, b.model
  ;

create table sktdemo_cell_badness_todow as
select
  a.cellid, a.lat, a.lng, hour(from_unixtime(b.vidnetstarttime)) as todow,
  count(distinct b.androidid) as usrcnt,
  count(distinct b.playsessionid) as sesscnt,
  sum(if(a.cellid = b.cellidst and b.playtime <= 30 and (b.vidnetendtime - b.vidnetstarttime) <=1, 1, 0)) as stfail,
  sum(if(a.cellid = b.cellidend and b.playtime <= 30 and (b.vidnetendtime - b.vidnetstarttime) <=3, 1, 0)) as dronst,
  sum(a.largepc) as largepc,
  sum(a.smallpc) as smallpc
from cellidux_t1 a , vidsession b
where a.playsessionid = b.playsessionid and b.playservicemode in (2,3)
and not (b.playtime >= 1800 and b.pausecnt >= 100)
group by a.cellid, a.lat, a.lng, hour(from_unixtime(b.vidnetstarttime))
  ;

create table sktdemo_wf_badness as
select
  a.bssid, a.lat, a.lng,
  count(distinct b.androidid) as usrcnt, count(distinct b.playsessionid) as sesscnt,
  sum(case when a.rnk=1 and b.playtime <=30 and (b.vidnetendtime - b.vidnetstarttime) <= 1  then 1 else 0 end) as stfail,
  sum(case when a.rnk=1 and b.playtime <=30 and (b.vidnetendtime - b.vidnetstarttime) > 1 and  (b.vidnetendtime - b.vidnetstarttime) <= 3 then 1 else 0 end) as dronst,
  sum(a.largepc) as largepc,
  sum(a.smallpc) as smallpc
from bssidux_t1 a, vidsession b
where 1=1
  and a.playsessionid = b.playsessionid -- and b.playservicemode in (2,3)
  and b.vidnetstarttime > unix_timestamp('2015-01-01 00:00:00')
  and a.ntype = '0' -- and a.bssid > '00:00:00:00:00:00'
  and not (b.playtime >= 1800 and b.pausecnt >= 100)
group by a.bssid, a.lat, a.lng
;

create table sktdemo_wf_badness_dev as
select
  a.bssid, a.lat, a.lng, b.brand, b.model,
  count(distinct b.androidid) as usrcnt, count(distinct b.playsessionid) as sesscnt,
  sum(case when a.rnk=1 and b.playtime <=30 and (b.vidnetendtime - b.vidnetstarttime) <= 1  then 1 else 0 end) as stfail,
  sum(case when a.rnk=1 and b.playtime <=30 and (b.vidnetendtime - b.vidnetstarttime) > 1 and  (b.vidnetendtime - b.vidnetstarttime) <= 3 then 1 else 0 end) as dronst,
  sum(a.largepc) as largepc,
  sum(a.smallpc) as smallpc
from bssidux_t1 a, vidsession b
where 1=1
  and a.playsessionid = b.playsessionid -- and b.playservicemode in (2,3)
  and b.vidnetstarttime > unix_timestamp('2015-01-01 00:00:00')
  and a.ntype = '0' -- and a.bssid > '00:00:00:00:00:00'
  and not (b.playtime >= 1800 and b.pausecnt >= 100)
group by a.bssid, a.lat, a.lng, b.brand, b.model
;

create table sktdemo_wf_badness_todow as
select
  a.bssid, a.lat, a.lng,hour(from_unixtime(vidnetstarttime)) as todow,
  count(distinct b.androidid) as usrcnt, count(distinct b.playsessionid) as sesscnt,
  sum(case when a.rnk=1 and b.playtime <=30 and (b.vidnetendtime - b.vidnetstarttime) <= 1  then 1 else 0 end) as stfail,
  sum(case when a.rnk=1 and b.playtime <=30 and (b.vidnetendtime - b.vidnetstarttime) > 1 and  (b.vidnetendtime - b.vidnetstarttime) <= 3 then 1 else 0 end) as dronst,
  sum(a.largepc) as largepc,
  sum(a.smallpc) as smallpc
from bssidux_t1 a, vidsession b
where 1=1
  and a.playsessionid = b.playsessionid -- and b.playservicemode in (2,3)
  and b.vidnetstarttime > unix_timestamp('2015-01-01 00:00:00')
  and a.ntype = '0' -- and a.bssid > '00:00:00:00:00:00'
  and not (b.playtime >= 1800 and b.pausecnt >= 100)
group by a.bssid, a.lat, a.lng, hour(from_unixtime(vidnetstarttime))
;

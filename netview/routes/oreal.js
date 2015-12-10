var express = require('express');
var path = require('path');
var pg = require('pg');
var pgConStr =  'postgres://USERNAME:PASSOWRD@POSTGRESERVER:PORT/DATABASENAME';
var http = require('http');


var redis = require('redis').createClient();
redis.on('error', function (err) {
  console.log('Error ' + err);
});


var TAG = 'oreal_'

var getPlmnid = function(optrcom){
	// return (optrcom=='KT'?'45008':(optrcom=='SKT'?'45005':optrcom=='LGT'?'45006':'000000'));
	return (optrcom=='45008'?'KT':(optrcom=='45005'?'SKT':optrcom=='45006'?'LGT':'000000'));
}


exports.map_lte_newfactor_list = function(req, res){
	var geojson = {'type':'FeatureCollection', 'features':[],"properties":{ "description":"Airplug, 2015 inc" }}
	var nm = req.query.nm;
	var ne = req.param('ne', 0.0);
	var sw = req.param('sw', 0.0);
	var recent = req.param('recent', 0.0);
	var tablepx ='';
	if(req.param('t','')=='hp'){
		tablepx = 'test.'
	}
	console.log('map_lte_newfactor_list ')
	var recentstr = "";
	if(recent == parseInt(0.7)){
		recentstr = "max(f.factor)*max(f.factor)*";
	}else if(recent == parseInt(0.4)){
		recentstr = "max(f.factor)*";
	}else{
		recentstr = "";
	}
	// var keynm = TAG + "map_lte_double_factor_list"+nm;
	var keynm = TAG + "map_lte_newfactor_list_"+ne+"_"+sw +"_" + recent + "_"+tablepx;
	console.log('map_lte_newfactor_list[' + keynm + '] and recentness is ' + recent);
	redis.get(keynm, function(err, data){
		if(data){
			console.log('memcached.get')
			console.log('['+keynm+'] memcached is not null');
			return res.json(JSON.parse(data));
		}else{
			console.log('['+keynm+'] memcached is null');
			pg.connect(pgConStr, function(err, client, don){ 
				client.query(" SELECT \
					  l.lat, \
					  l.lng, l.fullid as id, COALESCE(min(a.addr),'-') as addr, min(COALESCE(s.linen||'호선-('||stid1||'~'||stid2||')','not')) as subway, \
					  split_part(l.fullid, '_', 1) as optrcom, min(l.sesscnt) as sesscnt, \
					  min(l.usrcnt) AS usrcnt, min(f.factor) as recentness,min(f.rfactor) as rrecentness,min(f.pfactor) as precentness, \
					  min(t.t01) as t01,min(t.t02) as t02,min(t.t03) as t03,min(t.t04) as t04, \
					  min(badusrcnt)::float/min(l.usrcnt)*100 as badusr, \
					  min(badsesscnt)::float/min(l.sesscnt)*100 as badsess, \
					  min(baddaycnt)::float/min(daycnt)*100 as baddays, \
					  (case when (sum(b.stfail)+sum(b.dronst)+sum(b.largepc)+sum(b.smallpc))=0 then  0 else ((sum(b.stfail)+sum(b.dronst)+sum(b.largepc))::float/(sum(b.stfail)+sum(b.dronst)+sum(b.largepc)+sum(b.smallpc))) end)*100*(((sum(b.badusrcnt)/2)^2*(sum(b.sesscnt)/15)^2)/((1+(sum(b.badusrcnt)/2)^2)*(1+(sum(b.sesscnt)/15)^2))) as badness, \
					  sum(l.pausecnt) :: FLOAT / CASE WHEN sum(l.playtime) = 0 THEN 1 ELSE sum(l.playtime) END * 3600  AS pausecnt, \
					  sum(l.stfail) :: FLOAT / CASE WHEN sum(l.sesscnt) = 0 THEN 1 ELSE sum(l.sesscnt) END  AS stfail, \
					  sum(l.cellrxbytes) :: FLOAT * 8 / CASE WHEN sum(l.cellduration) = 0 THEN 1 ELSE sum(l.cellduration) END / 1000000 AS tp, \
					  sum(playtime)::float/3600  AS rxbytes, \
					  case when sum(playtime)=0 then 0 else sum(usrmaxtime)::float/sum(playtime) end  AS bias, \
					  sum(l.pausetime) :: FLOAT / CASE WHEN sum(playtime) = 0 THEN 1 ELSE sum(l.playtime) END * 3600  AS pausetime , \
					  max(tt.tci) as tci \
					FROM lteidux l left join subcells s on l.fullid = s.cellid \
					               left join (select addr, lat, lng  from ktwfloc_addr) a on l.lat = a.lat and l.lng = a.lng \
					               left join (select fullid, \
					                        sum(case when todow in ('03','04','05','06','07','08') then playtime else 0 end)::float/3600 as t01, \
					                        sum(case when todow in ('09','10','11','12','13','14') then playtime else 0 end)::float/3600 as t02, \
					                        sum(case when todow in ('15','16','17','18','19','20') then playtime else 0 end)::float/3600 as t03, \
					                        sum(case when todow in ('21','22','23','24','00','01','02') then playtime else 0 end)::float/3600 as t04 \
					                      from lteidux_todow where 1=1 and lat<$1 and lat>$2 and lng<$3 and lng>$4 \
					                      group by fullid ) t on l.fullid = t.fullid \
					  ,lteidux_badness b \
					  ,(select fullid, avr, rc as factor, rcr as rfactor, rcp as pfactor from ( \
					  select r.fullid, avg(r.badness) as avr , \
					    ((sum(DATE_PART('day', '20150101'::timestamp-todow::timestamp )::float*r.playtime)/case when sum(r.playtime)=0 then 1 else sum(r.playtime) end))/DATE_PART('day', min('20150101')::timestamp-now()) as rcp, \
					    ((sum(DATE_PART('day', '20150101'::timestamp-todow::timestamp )::float*r.rxbytes)/case when sum(r.rxbytes)=0 then 1 else sum(r.rxbytes) end))/DATE_PART('day', min('20150101')::timestamp- now()) as rcr, \
					    ((sum(DATE_PART('day', '20150101'::timestamp-todow::timestamp )::float*r.badness)/case when sum(r.badness)=0 then 1 else sum(r.badness) end))/DATE_PART('day', min('20150101')::timestamp-now()) as rc \
					  from lteidux_recentness r, lteidux l \
					  where 1=1 and l.fullid=r.fullid and l.lat<$1 and l.lat>$2 and l.lng<$3 and l.lng>$4 \
					  group by r.fullid ) aa ) f , \
					  (SELECT \
					    hh.fullid, \
					    sum(case when COALESCE(t.badsesscnt, 0)=0 then 0 else COALESCE(t.sesscnt, 0)::float/a.maxs*COALESCE(t.badsesscnt, 0)::float/COALESCE(t.badsesscnt, 0)/8 end)- avg(COALESCE(t.sesscnt, 0)::float/a.maxs)*avg(case when COALESCE(t.sesscnt, 0)=0 then 0 else COALESCE(t.badsesscnt, 0)::float/COALESCE(t.sesscnt, 0) end) as tci \
					  FROM (select \
					    d.fullid, min(d.lat) as lat , min(d.lng) as lng, \
					    max(d.sesscnt) as maxs, \
					    sum(d.sesscnt) as sums \
					  from lteidux_badness_3hr d where 1=1 and lat<$1 and lat>$2 and lng<$3 and lng>$4 group by d.fullid ) a, (SELECT \
					    t.fullid, \
					    hh.todow \
					  FROM (select distinct trunc(todow::int/3,0) as todow from copy_hh24) hh, lteidux_badness_3hr t \
					    where 1=1 and lat<$1 and lat>$2 and lng<$3 and lng>$4 \
					  group by t.fullid ,hh.todow) hh LEFT JOIN lteidux_badness_3hr t \
					      ON hh.todow = t.todow AND hh.fullid = t.fullid  and t.lat<$1 and t.lat>$2 and t.lng<$3 and t.lng>$4\
					  WHERE 1 = 1  and a.fullid = hh.fullid  \
					    group by hh.fullid \
					  ORDER BY hh.fullid) tt \
					WHERE 1 = 1 and l.lat=b.lat and l.lng=b.lng and l.fullid=b.fullid   and l.fullid=f.fullid and l.fullid = tt.fullid \
					and l.lat<$1 and l.lat>$2 and l.lng<$3 and l.lng>$4 \
					GROUP BY l.lat, l.lng, l.fullid having (case when (sum(b.stfail)+sum(b.dronst)+sum(b.largepc)+sum(b.smallpc))=0 then  0 else ((sum(b.stfail)+sum(b.dronst)+sum(b.largepc))::float/(sum(b.stfail)+sum(b.dronst)+sum(b.largepc)+sum(b.smallpc))) end)*100*(((sum(b.badusrcnt)/2)^2*(sum(b.sesscnt)/15)^2)/((1+(sum(b.badusrcnt)/2)^2)*(1+(sum(b.sesscnt)/15)^2))) > -1 \
					and min(f.factor) >= "+recent+" \
					order by badness desc " , [ne.split(',')[0], sw.split(',')[0], ne.split(',')[1], sw.split(',')[1] ], 
					 function(err, result){
					// done()
					if(err){
						return console.error('['+keynm+'] error running query', err);
					}
					// console.log('result length is ', result.rows);
					result.rows.forEach(function(d){
						geojson.features.push({'geometry':{'type':'Point', 'coordinates':[parseFloat(d.lng), parseFloat(d.lat)]}, 
							'type':'Feature','properties':{'optrcom':getPlmnid(d.optrcom), 'id':d.id ,'addr':d.addr,'subway':d.subway,'badness':parseFloat(d.badness),'pausecnt':parseFloat(d.pausecnt),'stfail':parseFloat(d.stfail),'tp':parseFloat(d.tp),'rxbytes':parseFloat(d.rxbytes),'pausetime':parseFloat(d.pausetime),'usrcnt':parseFloat(d.usrcnt),'sesscnt':parseFloat(d.sesscnt),'recentness':parseFloat(d.recentness),'rrecentness':parseFloat(d.rrecentness),'precentness':parseFloat(d.precentness) ,'badusr':parseFloat(d.badusr),'badsess':parseFloat(d.badsess) ,'baddays':parseFloat(d.baddays),'t01':parseFloat(d.t01),'t02':parseFloat(d.t02),'t03':parseFloat(d.t03),'t04':parseFloat(d.t04),'tci':parseFloat(d.tci),'bias':parseFloat(d.bias) } });	
					});					
					// console.log(geojson)
					var vvv = JSON.stringify(geojson);
					// memcached.set(keynm, JSON.stringify(geojson), 3600*7*24, function(err){console.log(err); });
					redis.set(keynm, JSON.stringify(geojson));
					// redis.expire(keynm, 3600*7*24);
					client.end();
					return res.json(JSON.parse(vvv));
				});
			});
		}
	});
}

exports.map_fullid_detail = function(req, res){
	var geojson = {'detail':[]};
	var fullid = req.query.fullid;
	var tablepx ='';
	if(req.param('t','')=='hp'){
		tablepx = 'test.'
	}

	var keynm = TAG + "map_fullid_detail_"+fullid;
	console.log('map_fullid_detail[' + keynm + ']');
	redis.get(keynm, function(err, data){
		if(data){
			console.log('['+keynm+'] memcached is not null');
			return res.json(JSON.parse(data));
		}else{
			pg.connect(pgConStr, function(err, client, don){
				client.query("select \
						  a.playsessionid, \
						  to_char((TIMESTAMP 'epoch' + (min(vidnetstarttime) + 32400) * INTERVAL '1 second'), 'YYYYMMDD HH24') as days, \
						  to_char((TIMESTAMP 'epoch' + (min(vidnetstarttime) + 32400) * INTERVAL '1 second'), 'DY') as dow, \
						  sum(case when a.ntype='0' then a.wfrxbytes else a.cellrxbytes end)/1024/1024::FLOAT as rxbytes, \
						  sum(case when a.logtype=6 then 1 else 0 end) as pausecnt, \
						  min(androidid) as androidid, min(b.model) as model, min(b.osver) as osver, case when min(b.apppkgnm) = 'com.appgate.gorealra' then 'SBS' else 'OTM' end as pkg, \
						  sum(case when b.apppkgnm='com.appgate.gorealra' then (case when a.cellid = b.cellidst and b.playtime <=30 and b.vidnetduration <= 1  then 1 else 0 end)*0.5 else (case when a.cellid = b.cellidst and b.playtime <=30 and b.vidnetduration <= 1  then 1 else 0 end) end) as stfail, \
						  0 as dronst, \
						  sum(case when b.apppkgnm='com.appgate.gorealra' then a.largepc*1.5 else a.largepc end) as largepc, \
						  sum(case when b.apppkgnm='com.appgate.gorealra' then a.smallpc else a.smallpc end) as smallpc \
						from (select \
						        a.playsessionid, a.cellid, a.logstarttime, a.logtype,a.ntype,a.wfrxbytes,a.cellrxbytes, \
						      CASE WHEN (case when a.logtype=6 then 1 else 0 end)::FLOAT / CASE WHEN playtime = 0 THEN 1 ELSE playtime END * 300 >= 1 THEN 1 ELSE 0 END  largepc,  \
						      CASE WHEN (case when a.logtype=6 then 1 else 0 end)::FLOAT / CASE WHEN playtime = 0 THEN 1 ELSE playtime END * 300 < 1 THEN 1 ELSE 0 END   smallpc  \
						      from ( \
						        SELECT k.playsessionid, k.cellid, k.logstarttime, k.logtype, k.ntype,k.wfrxbytes, k.cellrxbytes,  sum(k.playtime) OVER (PARTITION BY playsessionid, k.cellid ORDER BY playsessionid, k.cellid, ttm ROWS UNBOUNDED PRECEDING) AS playtime \
						        FROM vidsession_log k, cellid_ntype m \
						        WHERE m.ntype <> '0' and k.cellid = '"+fullid+"' AND left(k.cellid, 5) IN ('45005', '45006', '45008') AND k.cellid = m.cellid AND m.ntype = 'LTE' \
						      ) a  ) a , vidsession b, cellinfo c \
						where 1=1  \
						and c.fullid = '"+fullid+"'  \
						and a.playsessionid = b.playsessionid and b.playservicemode in (2,3)  \
						and b.vidnetstarttime > extract(epoch from timestamp '2015-01-01 15:00:00')  \
						and b.apppkgnm in ('com.appgate.gorealra')  \
						and a.cellid = c.fullid and (a.cellid like '45008%' or a.cellid like '45005%' or a.cellid like '45006%')  \
						and c.lat > -200 \
						and not (b.playtime >= 1800 and b.pausecnt >= 100)  \
						group by a.playsessionid " , 
					 function(err, result){
					// done()
					if(err){
						return console.error('['+keynm+'] error running query', err);
					}
					// console.log('result length is ', result.rows);
					result.rows.forEach(function(d){
						geojson.detail.push({'fullid':d.fullid, 'playsessionid':d.playsessionid, 'androidid':d.androidid, 'days':d.days, 'dow':d.dow, 'pkg':d.pkg, 
							'model':d.model, 'osver':d.osver, 'stfail':d.stfail, 'dronst':d.dronst, 'largepc':d.largepc, 'smallpc':d.smallpc, 'rxbytes':d.rxbytes })
					});					
					// console.log(geojson)
					var vvv = JSON.stringify(geojson);
					redis.set(keynm, JSON.stringify(geojson));
					// redis.expire(keynm, 3600*7*24);
					client.end();
					return res.json(JSON.parse(vvv));
				});
			});
		}
	});		
}

exports.map_fullid_indicator = function(req, res){
	var geojson = {'detail':[]};
	var fullid = req.query.fullid;
	// var scope = req.query('scope', '0,0,0,0');
	var keynm = TAG + "map_fullid_indicator_"+fullid;
	console.log('map_fullid_indicator[' + keynm + ']');
	redis.get(keynm, function(err, data){
		if(data){
			console.log('['+keynm+'] memcached is not null');
			return res.json(JSON.parse(data));
		}else{
			pg.connect(pgConStr, function(err, client, don){
				client.query("SELECT \
						  hh.fullid, min(COALESCE(avgrsrp,0)) as avgrsrp, min(COALESCE(avgrssnr,0)) as avgrssnr,  \
						  sum(case when COALESCE(t.badsesscnt, 0)=0 then 0 else COALESCE(t.sesscnt, 0)::float/a.maxs*COALESCE(t.badsesscnt, 0)::float/COALESCE(t.badsesscnt, 0)/8 end)- avg(COALESCE(t.sesscnt, 0)::float/a.maxs)*avg(case when COALESCE(t.sesscnt, 0)=0 then 0 else COALESCE(t.badsesscnt, 0)::float/COALESCE(t.sesscnt, 0) end) as tci  \
						FROM (select  \
						  d.fullid, min(d.lat) as lat , min(d.lng) as lng,  \
						  max(d.sesscnt) as maxs,  \
						  sum(d.sesscnt) as sums  \
						from lteidux_badness_3hr d where d.fullid ='"+fullid+"' group by d.fullid ) a left join vidcell v on a.fullid=v.cellid, (SELECT  \
						  t.fullid,  \
						  hh.todow  \
						FROM (select distinct trunc(todow::int/3,0) as todow from copy_hh24) hh, lteidux_badness_3hr t  \
						  where 1=1 and t.fullid = '"+fullid+"' \
						group by t.fullid ,hh.todow) hh LEFT JOIN lteidux_badness_3hr t  \
						    ON hh.todow = t.todow AND hh.fullid = t.fullid  \
						WHERE 1 = 1  and a.fullid = hh.fullid  and hh.fullid = '"+fullid+"' \
						  group by hh.fullid  \
						ORDER BY hh.fullid" , 
					 function(err, result){
					// done()
					if(err){
						return console.error('['+keynm+'] error running query', err);
					}
					// console.log('result length is ', result.rows);
					result.rows.forEach(function(d){
						geojson.detail.push({'fullid':d.fullid, 'avgrsrp':d.avgrsrp, 'avgrssnr':d.avgrssnr, 'tci':d.tci })
					});					
					// console.log(geojson)
					var vvv = JSON.stringify(geojson);
					redis.set(keynm, JSON.stringify(geojson));
					// redis.expire(keynm, 3600*7*24);
					client.end();
					return res.json(JSON.parse(vvv));
				});
			});
		}
	});		
}

exports.map_fullid_nearcell = function(req, res){
	var geojson = {'type':'FeatureCollection', 'features':[],"properties":{ "description":"Airplug, 2015 inc" }}
	var fullid = req.query.fullid;
	// var scope = req.query('scope', '0,0,0,0');
	var tablepx ='';
	if(req.param('t','')=='hp'){
		tablepx = 'test.'
	}
	var keynm = TAG + "map_fullid_nearcell_"+fullid+ "_"+tablepx;
	console.log('map_fullid_nearcell[' + keynm + ']');
	redis.get(keynm, function(err, data){
		if(data){
			console.log('['+keynm+'] memcached is not null');
			return res.json(JSON.parse(data));
		}else{
			pg.connect(pgConStr, function(err, client, don){
				client.query("SELECT \
					  l.lat, \
					  l.lng, min(l.fullid) as id, min(a.addr) as addr, \
					  split_part(l.fullid, '_', 1) as optrcom, sum(l.sesscnt) as sesscnt, \
					  sum(l.pausecnt) :: FLOAT / CASE WHEN sum(l.playtime) = 0 THEN 1 ELSE sum(l.playtime) END * 3600  AS pausecnt, \
					  sum(l.stfail) :: FLOAT / CASE WHEN sum(l.sesscnt) = 0 THEN 1 ELSE sum(l.sesscnt) END  AS stfail, \
					  sum(l.cellrxbytes) :: FLOAT * 8 / CASE WHEN sum(l.cellduration) = 0 THEN 1 ELSE sum(l.cellduration) END / 1000000 AS tp, \
					  sum(l.cellrxbytes) / 1024 / 1024 :: FLOAT  AS rxbytes, \
					  sum(l.pausetime) :: FLOAT / CASE WHEN sum(playtime) = 0 THEN 1 ELSE sum(l.playtime) END * 3600  AS pausetime, \
					  sum(l.usrcnt) AS usrcnt, max(f.factor) as recentness, \
					  (case when (sum(b.stfail)+sum(b.dronst)+sum(b.largepc)+sum(b.smallpc))=0 then  0 else ((sum(b.stfail)+sum(b.dronst)+sum(b.largepc))::float/(sum(b.stfail)+sum(b.dronst)+sum(b.largepc)+sum(b.smallpc))) end)*100*(((sum(b.usrcnt)/10)^2*(sum(b.sesscnt)/15)^2)/((1+(sum(b.usrcnt)/10)^2)*(1+(sum(b.sesscnt)/15)^2))) as badnesswor, \
					  max(f.factor)*(case when (sum(b.stfail)+sum(b.dronst)+sum(b.largepc)+sum(b.smallpc))=0 then  0 else ((sum(b.stfail)+sum(b.dronst)+sum(b.largepc))::float/(sum(b.stfail)+sum(b.dronst)+sum(b.largepc)+sum(b.smallpc))) end)*100*(((sum(b.usrcnt)/10)^2*(sum(b.sesscnt)/15)^2)/((1+(sum(b.usrcnt)/10)^2)*(1+(sum(b.sesscnt)/15)^2))) as badness \
					FROM lteidux l, lteidux_badness b , (select distinct lat||''||lng, addr, lat, lng  from ktwfloc_addr) a , \
					  (select fullid, avr, rc as factor from ( \
					select \
					  fullid, \
					  avg(badness) as avr , \
					  ((sum(DATE_PART('day', '20150101'::timestamp-todow::timestamp )::int*badness)/case when sum(badness)=0 then 1 else sum(badness) end))/DATE_PART('day', min('20150101')::timestamp-'20150709'::timestamp) as rc \
					from lteidux_recentness \
					where 1=1 and fullid = '"+fullid+"' \
					group by fullid ) f ) f,  (select lat, lng from cellinfo where fullid = '"+fullid+"') x \
					WHERE 1 = 1 and l.lat=b.lat and l.lng=b.lng and l.fullid=b.fullid   and l.fullid=f.fullid \
					and l.lat = a.lat and l.lng = a.lng \
					and split_part(l.fullid, '_', 1) = split_part('"+fullid+"', '_', 1)  and l.lat > (x.lat - 0.005) and l.lat < (x.lat+0.005) and l.lng > (x.lng - 0.005) and l.lng < (x.lng + 0.005) \
					GROUP BY l.lat, l.lng, split_part(l.fullid, '_', 1) \
					order by badness desc" , 
					 function(err, result){
					// done()
					if(err){
						return console.error('['+keynm+'] error running query', err);
					}
					// console.log('result length is ', result.rows);
					result.rows.forEach(function(d){
						geojson.features.push({'geometry':{'type':'Point', 'coordinates':[parseFloat(d.lng), parseFloat(d.lat)]}, 
							'type':'Feature','properties':{'optrcom':getPlmnid(d.optrcom), 'id':d.id ,'addr':d.addr,'badness':parseFloat(d.badness),'pausecnt':parseFloat(d.pausecnt),'stfail':parseFloat(d.stfail),'tp':parseFloat(d.tp),'rxbytes':parseFloat(d.rxbytes),'pausetime':parseFloat(d.pausetime),'usrcnt':parseFloat(d.usrcnt),'sesscnt':parseFloat(d.sesscnt) } });	
					});					
					// console.log(geojson)
					var vvv = JSON.stringify(geojson);
					redis.set(keynm, JSON.stringify(geojson));
					// redis.expire(keynm, 3600*7*24);
					client.end();
					return res.json(JSON.parse(vvv));
				}); 
			});
		}
	});

}


exports.map_fullid_movement = function(req, res){
	var geojson = {'detail':[]};
	var fullid = req.query.fullid;
	var tablepx ='';
	if(req.param('t','')=='hp'){
		tablepx = 'test.'
	}

	var keynm = TAG + "map_fullid_movement_"+fullid;
	console.log('map_fullid_movement[' + keynm + ']');
	redis.get(keynm, function(err, data){
		if(data){
			console.log('['+keynm+'] memcached is not null');
			return res.json(JSON.parse(data));
		}else{
			pg.connect(pgConStr, function(err, client, don){
				client.query("select y.gubun, y.cellid, y.addr, y.lat, y.lng, round((count*movecnt*factor)/100) as count, badness, subway  from \
				(select fullid, lat, lng from cellinfo where fullid='"+fullid+"' ) o, \
				(select b.fullid, (case when (sum(b.stfail)+sum(b.dronst)+sum(b.largepc)+sum(b.smallpc))=0 then  0 else ((sum(b.stfail)+sum(b.dronst)+sum(b.largepc))::float/(sum(b.stfail)+sum(b.dronst)+sum(b.largepc)+sum(b.smallpc))) end)*100*(((sum(b.usrcnt)/10)^2*(sum(b.sesscnt)/15)^2)/((1+(sum(b.usrcnt)/10)^2)*(1+(sum(b.sesscnt)/15)^2))) as badness from lteidux_badness b  where 1=1 and b.fullid='"+fullid+"' group by b.fullid) b , \
				(select b.fullid, (case when (sum(b.stfail)+sum(b.dronst)+sum(b.largepc)+sum(b.smallpc))=0 then  0 else ((sum(b.stfail)+sum(b.dronst)+sum(b.largepc))::float/(sum(b.stfail)+sum(b.dronst)+sum(b.largepc)+sum(b.smallpc))) end)*100*(((sum(b.usrcnt)/10)^2*(sum(b.sesscnt)/15)^2)/((1+(sum(b.usrcnt)/10)^2)*(1+(sum(b.sesscnt)/15)^2))) as movecnt from lteidux a, lteidux_badness b where a.fullid=b.fullid and b.fullid='"+fullid+"' group by b.fullid) c, \
				(select fullid, rc as factor from ( select fullid,  avg(badness) as avr, ((sum(DATE_PART('day', '20150101'::timestamp- todow::timestamp )::int*badness)/case when sum(badness)=0 then 1 else sum(badness) end))/DATE_PART('day', min('20150101')::timestamp-'20150709'::timestamp) as rc from lteidux_recentness  where 1=1 and fullid='"+fullid+"' group by fullid ) f ) f, \
				(select x.gubun, x.pcellid as cellid, min(COALESCE(NULLIF(a.addr,''),'none')) as addr, min(c.lat) as lat, min(c.lng) as lng , count(playsessionid), min(COALESCE(NULLIF(s.linen||'호선-('||s.stid1||'~'||s.stid2||')','not'), 'none') )  as subway from ( \
				  select * from ( \
				    SELECT \
				      'PREV'::text as gubun, \
				      playsessionid, \
				      ttm, \
				      cellid, \
				      lag(cellid, 1) \
				      OVER ( \
				        partition by playsessionid ORDER BY ttm) AS pcellid, \
				      CASE WHEN lag(ntype, 1) OVER (partition by playsessionid ORDER BY ttm ) <> '0' \
				        THEN 1 \
				      ELSE 0 END as rn, \
				      CASE WHEN lag(ntype, 0) OVER (partition by playsessionid ORDER BY ttm ) <> '0' \
				        THEN 1 \
				      ELSE 0 END as rn2 \
				    FROM vidsession_log  l \
				    WHERE 1=1  and exists (select 'e' from vidsession_log o where o.playsessionid=l.playsessionid and o.cellid ='"+fullid+"') \
				  ) a where a.rn = 1 and a.rn2=1 and a.cellid <> a.pcellid and a.cellid = '"+fullid+"' \
				union all \
				  select * from ( \
				    SELECT \
				      'NEXT'::text as gubun, \
				      playsessionid, \
				      ttm, \
				      cellid, \
				      lead(cellid, 1) \
				      OVER ( \
				        partition by playsessionid ORDER BY ttm) AS pcellid, \
				      CASE WHEN lead(ntype, 1) OVER (partition by playsessionid ORDER BY ttm ) <> '0' \
				        THEN 1 \
				      ELSE 0 END as rn, \
				      CASE WHEN lead(ntype, 0) OVER (partition by playsessionid ORDER BY ttm ) <> '0' \
				        THEN 1 \
				      ELSE 0 END as rn2 \
				    FROM vidsession_log  l \
				    WHERE 1=1  and exists (select 'e' from vidsession_log o where o.playsessionid=l.playsessionid and o.cellid ='"+fullid+"') \
				  ) a where a.rn = 1 and a.rn2=1 and a.cellid <> a.pcellid and a.cellid = '"+fullid+"' \
				) x, cellinfo c left join ktwfloc_addr a on c.lat = a.lat and c.lng=a.lng left join subcells s on c.fullid = s.cellid  where x.pcellid=c.fullid group by x.gubun, x.pcellid order by 1,3 desc ) y \
				where 1=1 \
				and b.fullid = y.cellid and b.badness > 0" , 
					 function(err, result){
					// done()
					if(err){
						return console.error('['+keynm+'] error running query', err);
					}
					// console.log('result length is ', result.rows);
					result.rows.forEach(function(d){
						// geojson.detail.push({'gubun':d.gubun, 'cellid':d.cellid ,'lat':d.lat ,'lng':d.lng ,'addr':d.addr ,'count':d.count });	
						geojson.detail.push({'gubun':d.gubun, 'cellid':d.cellid ,'lat':d.lat ,'lng':d.lng ,'addr':d.addr ,'count':d.count,'badness':d.badness,'subway':d.subway});	
					});					
					// console.log(geojson)
					var vvv = JSON.stringify(geojson);
					redis.set(keynm, JSON.stringify(geojson));
					// redis.expire(keynm, 3600*7*24);
					client.end();
					return res.json(JSON.parse(vvv));
				}); 
			});
		}
	});

}

exports.map_fullid_badness_movement = function(req, res){
	var geojson = {'detail':[]};
	var fullid = req.query.fullid;
	var tablepx ='';
	if(req.param('t','')=='hp'){
		tablepx = 'test.'
	}

	var keynm = TAG + "map_fullid_badness_movement_"+fullid;
	console.log('map_fullid_badness_movement [' + keynm + ']');
	redis.get(keynm, function(err, data){
		if(data){
			console.log('['+keynm+'] memcached is not null');
			return res.json(JSON.parse(data));
		}else{
			pg.connect(pgConStr, function(err, client, don){
				client.query("select y.gubun, y.cellid, y.addr, y.lat, y.lng, round(case when movecnt*factor=0 then 0 else count/(movecnt*factor) end*100) as count, badness, subway  from \
						(select fullid, lat, lng from cellinfo where fullid='"+fullid+"' ) o, \
						(select b.fullid, (case when (sum(b.stfail)+sum(b.dronst)+sum(b.largepc)+sum(b.smallpc))=0 then  0 else ((sum(b.stfail)+sum(b.dronst)+sum(b.largepc))::float/(sum(b.stfail)+sum(b.dronst)+sum(b.largepc)+sum(b.smallpc))) end)*100*(((sum(b.usrcnt)/10)^2*(sum(b.sesscnt)/15)^2)/((1+(sum(b.usrcnt)/10)^2)*(1+(sum(b.sesscnt)/15)^2))) as badness from lteidux_badness b  where 1=1 and b.fullid='"+fullid+"'  group by b.fullid) b , \
						(select b.fullid, min(a.sesscnt)*(case when (sum(b.stfail)+sum(b.dronst)+sum(b.largepc)+sum(b.smallpc))=0 then  0 else ((sum(b.stfail)+sum(b.dronst)+sum(b.largepc))::float/(sum(b.stfail)+sum(b.dronst)+sum(b.largepc)+sum(b.smallpc))) end)*100*(((sum(b.usrcnt)/10)^2*(sum(b.sesscnt)/15)^2)/((1+(sum(b.usrcnt)/10)^2)*(1+(sum(b.sesscnt)/15)^2)))/100 as movecnt from lteidux a, lteidux_badness b where a.fullid=b.fullid and b.fullid='"+fullid+"' group by b.fullid) c, \
						(select fullid, rc as factor from ( select fullid,  avg(badness) as avr, ((sum(DATE_PART('day', '20150101'::timestamp-todow::timestamp )::int*badness)/case when sum(badness)=0 then 1 else sum(badness) end))/DATE_PART('day', min('20150101')::timestamp-'20150709'::timestamp) as rc from lteidux_recentness  where 1=1 and fullid='"+fullid+"' group by fullid ) f ) f, \
						(select x.gubun, x.pcellid as cellid, min(COALESCE(a.addr,'')) as addr, min(c.lat) as lat, min(c.lng) as lng , count(playsessionid), min(COALESCE(s.linen||'호선-('||s.stid1||'~'||s.stid2||')','not') )  as subway from ( \
						  select * from ( \
						    SELECT \
						      'PREV'::text as gubun, playsessionid, ttm, cellid, lag(cellid, 1) \
						      OVER ( partition by playsessionid ORDER BY ttm) AS pcellid, \
						      CASE WHEN lag(ntype, 1) OVER (partition by playsessionid ORDER BY ttm ) <> '0' \
						        THEN 1 \
						      ELSE 0 END as rn, \
						      CASE WHEN lag(ntype, 0) OVER (partition by playsessionid ORDER BY ttm ) <> '0' \
						        THEN 1 \
						      ELSE 0 END as rn2 \
						    FROM vidsession_log  l \
						    WHERE 1=1  and exists (select 'e' from vidsession_log o where o.playsessionid=l.playsessionid and o.cellid ='"+fullid+"') \
						  ) a where a.rn = 1 and a.rn2=1 and a.cellid <> a.pcellid and a.cellid = '"+fullid+"' \
						) x, cellinfo c left join ktwfloc_addr a on c.lat = a.lat and c.lng=a.lng left join subcells s on c.fullid = s.cellid  where x.pcellid=c.fullid group by x.gubun, x.pcellid order by 1,3 desc ) y \
						where 1=1 \
						and b.badness > 0" , 
					 function(err, result){
					// done()
					if(err){
						return console.error('['+keynm+'] error running query', err);
					}
					// console.log('result length is ', result.rows);
					result.rows.forEach(function(d){
						geojson.detail.push({'gubun':d.gubun, 'cellid':d.cellid ,'lat':d.lat ,'lng':d.lng ,'addr':d.addr ,'count':d.count,'badness':d.badness,'subway':d.subway});	
					});					
					// console.log(geojson)
					var vvv = JSON.stringify(geojson);
					redis.set(keynm, JSON.stringify(geojson));
					// redis.expire(keynm, 3600*7*24);
					client.end();
					return res.json(JSON.parse(vvv));
				}); 
			});
		}
	});

}


exports.heat_cell_list = function(req, res){
	var geojson = {'wf':[], 'cell':[], 'lte':[]};
	var fullid = req.query.fullid;
	var tablepx ='';
	if(req.param('t','')=='hp'){
		tablepx = 'test.'
	}
	var keynm = TAG + "heat_cell_list_"+fullid;
	console.log('heat_cell_list[' + keynm + ']');
	redis.get(keynm, function(err, data){
		if(data){
			console.log('['+keynm+'] memcached is not null');
			return res.json(JSON.parse(data));
		}else{
			pg.connect(pgConStr, function(err, client, don){
				client.query("SELECT \
						  l.lat, \
						  l.lng, \
						  l.plmnid as optrcom, \
						  sum(l.sesscnt) as sesscnt, \
						  sum(l.pausecnt) :: FLOAT / CASE WHEN sum(l.playtime) = 0 THEN 1 ELSE sum(l.playtime) END * 3600  AS pausecnt, \
						  sum(l.stfail) :: FLOAT / CASE WHEN sum(l.sesscnt) = 0 THEN 1 ELSE sum(l.sesscnt) END  AS stfail, \
						  sum(l.cellrxbytes) :: FLOAT * 8 / CASE WHEN sum(l.cellduration) = 0 THEN 1 ELSE sum(l.cellduration) END / 1000000 AS tp, \
						  sum(l.cellrxbytes) / 1024 / 1024 / 254 :: FLOAT  AS rxbytes, \
						  sum(l.pausetime) :: FLOAT / CASE WHEN sum(playtime) = 0 THEN 1 ELSE sum(l.playtime) END * 3600  AS pausetime, \
						  sum(l.usrcnt) AS usrcnt, \
						  (sum(b.stfail)+sum(b.dronst)+sum(b.largepc))::float/ \
						      case when (sum(b.stfail)+sum(b.dronst)+sum(b.largepc)+sum(b.smallpc))*100*(((sum(b.usrcnt)/2)^2*(sum(b.sesscnt)/5)^2)/((1+(sum(b.usrcnt)/2)^2)*(1+(sum(b.sesscnt)/5)^2))) = 0 then 1 else \
						    (sum(b.stfail)+sum(b.dronst)+sum(b.largepc)+sum(b.smallpc))*100*(((sum(b.usrcnt)/2)^2*(sum(b.sesscnt)/5)^2)/((1+(sum(b.usrcnt)/2)^2)*(1+(sum(b.sesscnt)/5)^2))) end as badness \
						FROM lgapux l, lgapux_badness b,  (select lat, lng from cellinfo where fullid = '"+fullid+"') x  \
						WHERE 1 = 1 and l.lat=b.lat and l.lng=b.lng \
						and l.plmnid = split_part('"+fullid+"', '_', 1) \
					  and l.lat > (x.lat - 0.05) and l.lat < (x.lat+0.05) and l.lng > (x.lng - 0.05) and l.lng < (x.lng + 0.05) \
						GROUP BY l.lat, l.lng, l.plmnid having (sum(b.stfail)+sum(b.dronst)+sum(b.largepc))::float/case when (sum(b.stfail)+sum(b.dronst)+sum(b.largepc)+sum(b.smallpc))*100*(((sum(b.usrcnt)/2)^2*(sum(b.sesscnt)/5)^2)/((1+(sum(b.usrcnt)/2)^2)*(1+(sum(b.sesscnt)/5)^2))) = 0 then 1 else (sum(b.stfail)+sum(b.dronst)+sum(b.largepc)+sum(b.smallpc))*100*(((sum(b.usrcnt)/2)^2*(sum(b.sesscnt)/5)^2)/((1+(sum(b.usrcnt)/2)^2)*(1+(sum(b.sesscnt)/5)^2))) end > 0" , function(err, result){
					// done()
					if(err){
						return console.error('['+keynm+'] error running query', err);
					}
					// // console.log('result length is ', result.rows);
					// var i=0;
					result.rows.forEach(function(d){						
							geojson.cell.push({'lat':d.lat, 'lng':d.lng, 'optrcom':getPlmnid(d.optrcom),  'pausecnt':d.pausecnt, 'pausetime':d.pausetime,'stfail':d.stfail, 'usrcnt':d.usrcnt ,'tp':parseFloat(d.tp),'rxbytes':parseFloat(d.rxbytes),'badness':parseFloat(d.badness) })
					});					
					// console.log(geojson)
					var vvv = JSON.stringify(geojson);
					redis.set(keynm, JSON.stringify(geojson));
					// redis.expire(keynm, 3600*7*24);
					client.end();
					return res.json(JSON.parse(vvv));
				});
			});
		}
	});

}



exports.wifiloc_cell_list = function(req, res){
	var geojson = {'wf':[], 'cell':[], 'lte':[]};
	var fullid = req.query.fullid;
	var tablepx ='';
	if(req.param('t','')=='hp'){
		tablepx = 'test.'
	}
	var keynm = TAG + "wifiloc_cell_list_"+fullid;
	console.log('wifiloc_cell_list [' + keynm + ']');
	redis.get(keynm, function(err, data){
		if(data){
			console.log('['+keynm+'] memcached is not null');
			return res.json(JSON.parse(data));
		}else{
			pg.connect(pgConStr, function(err, client, don){
				client.query("SELECT \
				  l.lat, \
				  l.lng, \
				  l.plmnid as optrcom, \
				  min(w.bssid) as bssid , min(w.locname) as locname, min(w.addr) as addr, min(w.stair) as stair,  \
				  sum(l.sesscnt) as sesscnt, \
				  sum(l.pausecnt) :: FLOAT / CASE WHEN sum(l.playtime) = 0 THEN 1 ELSE sum(l.playtime) END * 3600  AS pausecnt, \
				  sum(l.stfail) :: FLOAT / CASE WHEN sum(l.sesscnt) = 0 THEN 1 ELSE sum(l.sesscnt) END  AS stfail, \
				  sum(l.cellrxbytes) :: FLOAT * 8 / CASE WHEN sum(l.cellduration) = 0 THEN 1 ELSE sum(l.cellduration) END / 1000000 AS tp, \
				  sum(l.cellrxbytes) / 1024 / 1024 / 254 :: FLOAT  AS rxbytes, \
				  sum(l.pausetime) :: FLOAT / CASE WHEN sum(playtime) = 0 THEN 1 ELSE sum(l.playtime) END * 3600  AS pausetime, \
				  sum(l.usrcnt) AS usrcnt, \
				  (sum(b.stfail)+sum(b.dronst)+sum(b.largepc))::float/ \
				      case when (sum(b.stfail)+sum(b.dronst)+sum(b.largepc)+sum(b.smallpc))*100*(((sum(b.usrcnt)/2)^2*(sum(b.sesscnt)/5)^2)/((1+(sum(b.usrcnt)/2)^2)*(1+(sum(b.sesscnt)/5)^2))) = 0 then 1 else \
				    (sum(b.stfail)+sum(b.dronst)+sum(b.largepc)+sum(b.smallpc))*100*(((sum(b.usrcnt)/2)^2*(sum(b.sesscnt)/5)^2)/((1+(sum(b.usrcnt)/2)^2)*(1+(sum(b.sesscnt)/5)^2))) end as badness \
				FROM lgapux l, lgapux_badness b, wifiloc w , (select lat, lng from cellinfo where fullid = '"+fullid+"') x \
				WHERE 1 = 1 and l.lat=b.lat and l.lng=b.lng \
				and l.plmnid = split_part('"+fullid+"', '_', 1) \
				and l.lat > (x.lat - 0.005) and l.lat < (x.lat+0.005) and l.lng > (x.lng - 0.005) and l.lng < (x.lng + 0.005) \
				  and w.bssid = l.bssid  \
				GROUP BY l.lat, l.lng, l.plmnid \
				having (sum(b.stfail)+sum(b.dronst)+sum(b.largepc))::float/ \
				case when (sum(b.stfail)+sum(b.dronst)+sum(b.largepc)+sum(b.smallpc))*100*(((sum(b.usrcnt)/2)^2*(sum(b.sesscnt)/5)^2)/((1+(sum(b.usrcnt)/2)^2)*(1+(sum(b.sesscnt)/5)^2))) = 0 then 1 else \
				(sum(b.stfail)+sum(b.dronst)+sum(b.largepc)+sum(b.smallpc))*100*(((sum(b.usrcnt)/2)^2*(sum(b.sesscnt)/5)^2)/((1+(sum(b.usrcnt)/2)^2)*(1+(sum(b.sesscnt)/5)^2))) end > 0" , function(err, result){
					// done()
					if(err){
						return console.error('['+keynm+'] error running query', err);
					}
					// // console.log('result length is ', result.rows);
					// var i=0;
					result.rows.forEach(function(d){						
							geojson.cell.push({'lat':d.lat, 'lng':d.lng, 'bssid':d.bssid,  'ssid':d.ssid, 'locname':d.locname,'stair':d.stair })
					});					
					// console.log(geojson)
					var vvv = JSON.stringify(geojson);
					redis.set(keynm, JSON.stringify(geojson));
					// redis.expire(keynm, 3600*7*24);
					client.end();
					return res.json(JSON.parse(vvv));
				});
			});
		}
	});

}






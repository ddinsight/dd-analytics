var express = require('express');
var path = require('path');
var pg = require('pg');
var pgConStr =  'postgres://USERNAME:PASSOWRD@POSTGRESERVER:PORT/DATABASENAME';

var redis = require('redis').createClient();
redis.on('error', function (err) {
  console.log('Error ' + err);
});



exports.list_map_cell_list = function(req, res){
	var geojson = {'type':'FeatureCollection', 'features':[],"properties":{ "description":"Airplug, 2015 inc" }}
	var ne = req.param('ne', 0.0);
	var sw = req.param('sw', 0.0);

	pg.connect(pgConStr, function(err, client, don){
		if(err){
			return console.error('error fetching client from pool', err);
		}
		var keynm = "list_map_cell_list_"+ne+"_"+sw;
		redis.get(keynm, function(err, reply){

			if(reply && reply!=null){
				res.json(JSON.parse(reply));
			}else{
				client.query("SELECT \
					  l.lat, \
					  l.lng, \
					  sum(l.pausecnt) :: FLOAT / CASE WHEN sum(l.playtime) = 0 THEN 1 ELSE sum(l.playtime) END * 3600  AS pausecnt, \
					  sum(l.stfail) :: FLOAT / CASE WHEN sum(l.sesscnt) = 0 THEN 1 ELSE sum(l.sesscnt) END  AS stfail, \
					  sum(l.cellrxbytes) :: FLOAT * 8 / CASE WHEN sum(l.cellduration) = 0 THEN 1 ELSE sum(l.cellduration) END / 1000000 AS tp, \
					  sum(l.cellrxbytes)/1024/1024/DATE_PART('day','2015-01-01'::timestamp-now()):: FLOAT  AS rxbytes, \
					  sum(l.pausetime) :: FLOAT / CASE WHEN sum(playtime) = 0 THEN 1 ELSE sum(l.playtime) END * 3600  AS pausetime, \
					  sum(l.usrcnt) AS usrcnt, \
					  case when (sum(b.stfail)+sum(b.dronst)+sum(b.largepc)+sum(b.smallpc))=0 then 0 else (sum(b.stfail)+sum(b.dronst)+sum(b.largepc))::float/(sum(b.stfail)+sum(b.dronst)+sum(b.largepc)+sum(b.smallpc))*100*(((sum(b.usrcnt)/2)^2*(sum(b.sesscnt)/2)^2)/((1+(sum(b.usrcnt)/2)^2)*(1+(sum(b.sesscnt)/2)^2))) end as badness \
					FROM cellidux l, cellidux_badness b \
					WHERE 1 = 1 and l.lat=b.lat and l.lng=b.lng and l.fullid=b.fullid \
					      AND l.lat < $1 AND l.lat > $2 AND l.lng < $3 AND l.lng > $4 \
					GROUP BY l.lat, l.lng" ,[ne.split(',')[0], sw.split(',')[0], ne.split(',')[1], sw.split(',')[1] ], function(err, result){
					// done()
					if(err){
						return console.error(keys+'=>'+'error running query', err);
					}
					// console.log('result length is ', result.rows);
					var i=0;
					result.rows.forEach(function(d){

						geojson.features.push({'geometry':{'type':'Point', 'coordinates':[parseFloat(result.rows[i].lng), parseFloat(result.rows[i].lat)]}, 
							'type':'Feature','properties':{'pausecnt':parseFloat(result.rows[i].pausecnt),'pausetime':parseFloat(result.rows[i].pausetime),'stfail':parseFloat(result.rows[i].stfail),'tp':parseFloat(result.rows[i].tp),'rxbytes':parseFloat(result.rows[i].rxbytes),'usrcnt':parseInt(result.rows[i].usrcnt),'badness':parseFloat(result.rows[i].badness)  } });	
						i++;
					});
					// console.log(geojson)
					var vvv = JSON.stringify(geojson);
					redis.set(keynm, JSON.stringify(geojson));
					client.end();
					res.json(JSON.parse(vvv));
				});
			}
		});
	});
}



exports.list_map_wf_list = function(req, res){
	var geojson = {'type':'FeatureCollection', 'features':[],"properties":{"fields":{
         "pc":{
            "lookup":{
               "1":"Poor",
               "3":"Below average",
               "2":"Average",
               "4":"Good",
               "5":"Excellent",
            },
            "name":"Pause count"
         }
      }, "description":"Airplug, 2015 inc" }}
	var ne = req.param('ne', 0.0);
	var sw = req.param('sw', 0.0);

	pg.connect(pgConStr, function(err, client, don){
		if(err){
			return console.error('error fetching client from pool', err);
		}
		var keynm = "list_map_wf_list_"+ne+"_"+sw;
		redis.get(keynm, function(err, reply){

			if(reply && reply!=null){
				res.json(JSON.parse(reply));
			}else{
				client.query(" SELECT \
			    l.lat, \
			    l.lng, \
			    sum(l.pausecnt) :: FLOAT / CASE WHEN sum(l.playtime) = 0 THEN 1 ELSE sum(l.playtime) END * 3600  AS pausecnt, \
			    sum(l.stfail) :: FLOAT / CASE WHEN sum(l.sesscnt) = 0 THEN 1 ELSE sum(l.sesscnt) END AS stfail, \
			    sum(l.wfrxbytes) :: FLOAT * 8 / CASE WHEN sum(l.wfduration) = 0 THEN 1 ELSE sum(l.wfduration) END / 1000000 AS tp, \
			    sum(l.wfrxbytes)/1024/1024/DATE_PART('day','2015-01-01'::timestamp-now())::FLOAT  AS rxbytes, \
			    sum(l.pausetime) :: FLOAT / CASE WHEN sum(l.playtime) = 0 THEN 1 ELSE sum(l.playtime) END * 3600 AS pausetime, \
			    sum(l.usrcnt)  AS usrcnt, \
			    case when (sum(b.stfail)+sum(b.dronst)+sum(b.largepc)+sum(b.smallpc))=0 then 0 else (sum(b.stfail)+sum(b.dronst)+sum(b.largepc))::float/(sum(b.stfail)+sum(b.dronst)+sum(b.largepc)+sum(b.smallpc))*100*(((sum(b.usrcnt)/2)^2*(sum(b.sesscnt)/2)^2)/((1+(sum(b.usrcnt)/2)^2)*(1+(sum(b.sesscnt)/2)^2))) end as badness \
			  FROM bssidux l, bssidux_badness b \
			  WHERE 1 = 1 and l.lat=b.lat and l.lng=b.lng and l.bssid=b.bssid \
			  and l.lat < $1 AND l.lat > $2 AND l.lng < $3 AND l.lng > $4 \
			  GROUP BY l.lat, l.lng" ,[ne.split(',')[0], sw.split(',')[0], ne.split(',')[1], sw.split(',')[1] ], function(err, result){

					if(err){
						return console.error(keys+'=>'+'error running query', err);
					}
					// console.log('result length is ', result.rows);
					var i=0;
					result.rows.forEach(function(d){

						geojson.features.push({'geometry':{'type':'Point', 'coordinates':[parseFloat(result.rows[i].lng), parseFloat(result.rows[i].lat)]}, 
							'type':'Feature','properties':{'pausecnt':parseFloat(result.rows[i].pausecnt),'pausetime':parseFloat(result.rows[i].pausetime), 'stfail':parseFloat(result.rows[i].stfail), 'tp':parseFloat(result.rows[i].tp),'rxbytes':parseFloat(result.rows[i].rxbytes),'usrcnt':parseInt(result.rows[i].usrcnt) ,'badness':parseFloat(result.rows[i].badness) } });	
						i++;
					});					
					// console.log(geojson)
					var vvv = JSON.stringify(geojson);
					redis.set(keynm, JSON.stringify(geojson));
					client.end();
					res.json(JSON.parse(vvv));
				});
			}
		});
	});
}

exports.map_cellwf_detail = function(req, res){
	var geojson = {'type':'FeatureCollection', 'features':[],"properties":{ "description":"Airplug, 2015 inc" }}
	var ne = req.param('ne', 0.0);
	var sw = req.param('sw', 0.0);

	pg.connect(pgConStr, function(err, client, don){
		if(err){
			return console.error('error fetching client from pool', err);
		}
		var keynm = "map_cellwf_detail_"+ne+"_"+sw;
		redis.get(keynm, function(err, reply){

			if(reply && reply!=null){
				res.json(JSON.parse(reply));
			}else{
				client.query("select c.lat, c.lng, 'cell' as typ, c.fullid as id,  sum(c.pausecnt)::float/case when sum(c.playtime)=0 then 1 else sum(c.playtime) end*3600 as pausecnt, \
							sum(c.stfail)::float/case when sum(c.sesscnt)=0 then 1 else sum(c.sesscnt)end as stfail,  \
							sum(c.cellrxbytes)::float*8/case when sum(c.cellduration)=0 then 1 else sum(c.cellduration) end/1000000 as tp, sum(c.cellrxbytes)/1024/1024/DATE_PART('day','2015-01-01'::timestamp-now())::float as rxbytes,  \
							sum(c.pausetime)::float/case when sum(c.playtime)=0 then 1 else sum(c.playtime) end*3600 as pausetime, sum(c.usrcnt) as usrcnt, sum(c.sesscnt) as sesscnt, \
							case when (sum(b.stfail)+sum(b.dronst)+sum(b.largepc)+sum(b.smallpc))=0 then 0 else (sum(b.stfail)+sum(b.dronst)+sum(b.largepc))::float/(sum(b.stfail)+sum(b.dronst)+sum(b.largepc)+sum(b.smallpc))*100*(((sum(b.usrcnt)/2)^2*(sum(b.sesscnt)/2)^2)/((1+(sum(b.usrcnt)/2)^2)*(1+(sum(b.sesscnt)/2)^2))) end as badness \
							from cellidux c, cellidux_badness b  where 1=1 and c.lat = b.lat and c.lng = b.lng  \
							AND c.lat < $1 AND c.lat > $2 AND c.lng < $3 AND c.lng > $4 \
							group by c.lat, c.lng, c.fullid  \
							union  \
							select c.lat, c.lng, 'wf' as typ, c.bssid as id, sum(c.pausecnt)::float/case when sum(c.playtime)=0 then 1 else sum(c.playtime) end*3600 as pausecnt,  \
							sum(c.stfail)::float/case when sum(c.sesscnt)=0 then 1 else sum(c.sesscnt)end as stfail,  \
							sum(c.wfrxbytes)::float*8/case when sum(c.wfduration)=0 then 1 else sum(c.wfduration) end/1000000 as tp, sum(c.wfrxbytes)/1024/1024/DATE_PART('day','2015-01-01'::timestamp-now())::float as rxbytes,  \
							sum(c.pausetime)::float/case when sum(c.playtime)=0 then 1 else sum(c.playtime) end*3600 as pausetime, sum(c.usrcnt) as usrcnt, sum(c.sesscnt) as sesscnt , \
							case when (sum(b.stfail)+sum(b.dronst)+sum(b.largepc)+sum(b.smallpc))=0 then 0 else (sum(b.stfail)+sum(b.dronst)+sum(b.largepc))::float/(sum(b.stfail)+sum(b.dronst)+sum(b.largepc)+sum(b.smallpc))*100*(((sum(b.usrcnt)/2)^2*(sum(b.sesscnt)/2)^2)/((1+(sum(b.usrcnt)/2)^2)*(1+(sum(b.sesscnt)/2)^2))) end as badness \
							from bssidux c, bssidux_badness b where 1=1 and c.lat=b.lat and c.lng=b.lng   \
							AND c.lat < $5 AND c.lat > $6 AND c.lng < $7 AND c.lng > $8 \
							group by c.lat, c.lng, c.bssid" ,[ne.split(',')[0], sw.split(',')[0], ne.split(',')[1], sw.split(',')[1], ne.split(',')[0], sw.split(',')[0], ne.split(',')[1], sw.split(',')[1]], function(err, result){
					// done()
					if(err){
						return console.error(keys+'=>'+'error running query', err);
					}
					// console.log('result length is ', result.rows);
					var i=0;
					result.rows.forEach(function(d){

						geojson.features.push({'geometry':{'type':'Point', 'coordinates':[parseFloat(result.rows[i].lng), parseFloat(result.rows[i].lat)]}, 
							'type':'Feature','properties':{'type':result.rows[i].typ, 'id':result.rows[i].id, 'pausecnt':parseFloat(result.rows[i].pausecnt),'stfail':parseFloat(result.rows[i].stfail),'pausetime':parseFloat(result.rows[i].pausetime),'tp':parseFloat(result.rows[i].tp),'rxbytes':parseFloat(result.rows[i].rxbytes),'usrcnt':parseFloat(result.rows[i].usrcnt),'sesscnt':parseFloat(result.rows[i].sesscnt),'badness':parseFloat(result.rows[i].badness) } });	
						i++;
					});					
					// console.log(geojson)
					var vvv = JSON.stringify(geojson);
					redis.set(keynm, JSON.stringify(geojson));
					client.end();
					res.json(JSON.parse(vvv));
				});
			}
		});
	});

}

exports.table_cellwf_list = function(req, res){
	var geojson = {'wf':[], 'cell':[]};
	var ne = req.param('ne', 0.0);
	var sw = req.param('sw', 0.0);

	pg.connect(pgConStr, function(err, client, don){
		if(err){
			return console.error('error fetching client from pool', err);
		}
		var keys = "table_cellwf_list_"+ne+"_"+sw;
		redis.get(keys, function(err, reply){
			// console.error('redis err' , err);
			console.log('redis reply ', reply);
			if(reply && reply!=null){
				res.json(JSON.parse(reply));
			}else{
				// console.log([ ne.split(',')[0], sw.split(',')[0], ne.split(',')[1], sw.split(',')[1] ]);
				client.query("select \
					x.ids, x.lat, x.lng, x.typ, COALESCE(a.addr, '-') as addr, pausecnt, pausetime, stfail, usrcnt, tp, rxbytes, badness \
					from ( \
					select * from (select c.fullid as ids, c.lat, c.lng, 'cell'::text as typ, sum(c.usrcnt) as usrcnt, sum(c.pausecnt)::float/case when sum(c.playtime)=0 then 1 else sum(c.playtime) end*3600 as pausecnt, \
					sum(c.stfail)::float/case when sum(c.sesscnt)=0 then 1 else sum(c.sesscnt)end as stfail, \
					sum(c.cellrxbytes)::float*8/case when sum(c.cellduration)=0 then 1 else sum(c.cellduration) end/1000000 as tp, sum(c.cellrxbytes)/1024/1024/DATE_PART('day','2015-01-01'::timestamp-now())::float as rxbytes, \
					sum(c.pausetime)::float/case when sum(c.playtime)=0 then 1 else sum(c.playtime) end*3600 as pausetime, \
					case when (sum(b.stfail)+sum(b.dronst)+sum(b.largepc)+sum(b.smallpc))=0 then 0 else (sum(b.stfail)+sum(b.dronst)+sum(b.largepc))::float/(sum(b.stfail)+sum(b.dronst)+sum(b.largepc)+sum(b.smallpc))*100*(((sum(b.usrcnt)/2)^2*(sum(b.sesscnt)/2)^2)/((1+(sum(b.usrcnt)/2)^2)*(1+(sum(b.sesscnt)/2)^2))) end as badness \
					from cellidux c, cellidux_badness b  where 1=1 and c.lat = b.lat and c.lng = b.lng and c.fullid=b.fullid \
					AND c.lat < $1 AND c.lat > $2 AND c.lng < $3 AND c.lng > $4 \
					group by c.fullid, c.lat, c.lng ) a \
					union \
					select * from (select c.bssid as ids, c.lat, c.lng, 'wf'::text as typ, sum(c.usrcnt) as usrcnt, sum(c.pausecnt)::float/case when sum(c.playtime)=0 then 1 else sum(c.playtime) end*3600 as pausecnt, \
					sum(c.stfail)::float/case when sum(c.sesscnt)=0 then 1 else sum(c.sesscnt)end as stfail, \
					sum(c.wfrxbytes)::float*8/case when sum(c.wfduration)=0 then 1 else sum(c.wfduration) end/1000000 as tp, sum(c.wfrxbytes)/1024/1024/DATE_PART('day','2015-01-01'::timestamp-now())::float as rxbytes, \
					sum(c.pausetime)::float/case when sum(c.playtime)=0 then 1 else sum(c.playtime) end*3600 as pausetime, \
					case when (sum(b.stfail)+sum(b.dronst)+sum(b.largepc)+sum(b.smallpc))=0 then 0 else (sum(b.stfail)+sum(b.dronst)+sum(b.largepc))::float/(sum(b.stfail)+sum(b.dronst)+sum(b.largepc)+sum(b.smallpc))*100*(((sum(b.usrcnt)/2)^2*(sum(b.sesscnt)/2)^2)/((1+(sum(b.usrcnt)/2)^2)*(1+(sum(b.sesscnt)/2)^2))) end as badness \
					from bssidux c, bssidux_badness b where 1=1 and c.lat=b.lat and c.lng=b.lng and c.bssid=b.bssid\
					AND c.lat < $5 AND c.lat > $6 AND c.lng < $7 AND c.lng > $8 \
					group by c.bssid, c.lat, c.lng ) b \
					) x left join (select distinct(lat||''||lng), lat, lng, addr from ktwfloc_addr) a on x.lat = a.lat and x.lng = a.lng " ,
				[ ne.split(',')[0], sw.split(',')[0], ne.split(',')[1], sw.split(',')[1], ne.split(',')[0], sw.split(',')[0], ne.split(',')[1], sw.split(',')[1] ], function(err, result){
					// done()
					if(err){
						return console.error(keys+'=>'+'error running query', err);
					}
					// console.log('result length is ', result.rows);
					var i=0;
					result.rows.forEach(function(d){
						if(result.rows[i].typ == 'cell'){
							geojson.cell.push({'id':result.rows[i].ids,'lat':result.rows[i].lat,'lng':result.rows[i].lng, 'addr':result.rows[i].addr, 'pausecnt':result.rows[i].pausecnt, 'pausetime':result.rows[i].pausetime,'stfail':result.rows[i].stfail, 'usrcnt':result.rows[i].usrcnt,'tp':parseFloat(result.rows[i].tp),'rxbytes':parseFloat(result.rows[i].rxbytes),'badness':parseFloat(result.rows[i].badness) })
						}else if (result.rows[i].typ == 'wf'){
							geojson.wf.push({'id':result.rows[i].ids, 'lat':result.rows[i].lat,'lng':result.rows[i].lng, 'addr':result.rows[i].addr, 'pausecnt':result.rows[i].pausecnt, 'pausetime':result.rows[i].pausetime,'stfail':result.rows[i].stfail, 'usrcnt':result.rows[i].usrcnt,'tp':parseFloat(result.rows[i].tp),'rxbytes':parseFloat(result.rows[i].rxbytes),'badness':parseFloat(result.rows[i].badness) })
						}
						i++;
					});					
					// console.log(geojson)
					var vvv = JSON.stringify(geojson);
					redis.set(keys, JSON.stringify(geojson));
					client.end();
					res.json(JSON.parse(vvv));
				});
			}
		});
	});

}



exports.chart_cellwf_list = function(req, res){
	var geojson = {'wf':[], 'cell':[]};
	var ne = req.param('ne', 0.0);
	var sw = req.param('sw', 0.0);

	pg.connect(pgConStr, function(err, client, don){
		if(err){
			return console.error('error fetching client from pool', err);
		}
		var keys = "chart_cellwf_list_"+ne+"_"+sw;
		redis.get(keys, function(err, reply){
			// console.error('redis err' , err);
			console.log('redis reply ', reply);
			if(reply && reply!=null){
				res.json(JSON.parse(reply));
			}else{
				// console.log([ ne.split(',')[0], sw.split(',')[0], ne.split(',')[1], sw.split(',')[1] ]);
				client.query("select 'cell' as typ, a.todow, COALESCE(b.usrcnt, 0) as usrcnt, COALESCE(b.pausecnt, 0) as pausecnt , COALESCE(b.pausetime, 0) as pausetime, COALESCE(b.stfail,0) as stfail, COALESCE(b.tp,0) as tp, COALESCE(b.rxbytes,0) as rxbytes, COALESCE(b.badness, 0) as badness from sktdemo_todow_master a left join ( \
					select c.todow, sum(c.usrcnt) as usrcnt, sum(c.pausecnt)::float/case when sum(c.playtime)=0 then 1 else sum(c.playtime) end*3600 as pausecnt,  \
					sum(c.stfail)::float/case when sum(c.sesscnt)=0 then 1 else sum(c.sesscnt)end as stfail,  \
					sum(c.cellrxbytes)::float*8/case when sum(c.cellduration)=0 then 1 else sum(c.cellduration) end/1000000 as tp, sum(c.cellrxbytes)/1024/1024/date_part('day','2015-01-01'::timestamp-now())::float as rxbytes,  \
					sum(c.pausetime)::float/case when sum(c.playtime)=0 then 1 else sum(c.playtime) end*3600 as pausetime, \
					case when (sum(b.stfail)+sum(b.dronst)+sum(b.largepc)+sum(b.smallpc))=0 then 0 else (sum(b.stfail)+sum(b.dronst)+sum(b.largepc))::float/(sum(b.stfail)+sum(b.dronst)+sum(b.largepc)+sum(b.smallpc))*100*(((sum(b.usrcnt)/2)^2*(sum(b.sesscnt)/2)^2)/((1+(sum(b.usrcnt)/2)^2)*(1+(sum(b.sesscnt)/2)^2))) end as badness \
					from cellidux_todow c, cellidux_badness_todow b  where 1=1 and c.lat = b.lat and c.lng = b.lng and c.fullid=b.fullid and c.todow=b.todow \
					AND c.lat < $1 AND c.lat > $2 AND c.lng < $3 AND c.lng > $4 \
					group by c.todow order by 1 ) b on a.todow = b.todow \
					union ALL select 'wf' as typ, a.todow, COALESCE(b.usrcnt, 0) as usrcnt, COALESCE(b.pausecnt, 0) as pausecnt, COALESCE(b.pausetime, 0) as pausetime, COALESCE(b.stfail,0) as stfail, COALESCE(b.tp,0) as tp, COALESCE(b.rxbytes,0) as rxbytes, COALESCE(b.badness, 0) as badness from sktdemo_todow_master a left join (  \
					select c.todow, sum(c.usrcnt) as usrcnt, sum(c.pausecnt)::float/case when sum(c.playtime)=0 then 1 else sum(c.playtime) end*3600 as pausecnt,  \
					sum(c.stfail)::float/case when sum(c.sesscnt)=0 then 1 else sum(c.sesscnt)end as stfail,  \
					sum(c.wfrxbytes)::float*8/case when sum(c.wfduration)=0 then 1 else sum(c.wfduration) end/1000000 as tp, sum(c.wfrxbytes)/1024/1024/DATE_PART('day','2015-01-01'::timestamp-now())::float as rxbytes,  \
					sum(c.pausetime)::float/case when sum(c.playtime)=0 then 1 else sum(c.playtime) end*3600 as pausetime ,\
					case when (sum(b.stfail)+sum(b.dronst)+sum(b.largepc)+sum(b.smallpc))=0 then 0 else (sum(b.stfail)+sum(b.dronst)+sum(b.largepc))::float/(sum(b.stfail)+sum(b.dronst)+sum(b.largepc)+sum(b.smallpc))*100*(((sum(b.usrcnt)/2)^2*(sum(b.sesscnt)/2)^2)/((1+(sum(b.usrcnt)/2)^2)*(1+(sum(b.sesscnt)/2)^2))) end as badness \
					from bssidux_todow c, bssidux_badness_todow b where 1=1 and c.lat=b.lat and c.lng=b.lng and c.bssid=b.bssid and c.todow=b.todow \
					AND c.lat < $5 AND c.lat > $6 AND c.lng < $7 AND c.lng > $8 \
					group by c.todow order by 1 ) b on a.todow = b.todow " ,
				[ ne.split(',')[0], sw.split(',')[0], ne.split(',')[1], sw.split(',')[1], ne.split(',')[0], sw.split(',')[0], ne.split(',')[1], sw.split(',')[1] ], function(err, result){
					// done()
					if(err){
						return console.error(keys+'=>'+'error running query', err);
					}
					// console.log('result length is ', result.rows);
					var i=0;
					result.rows.forEach(function(d){
						if(result.rows[i].typ == 'cell'){
							geojson.cell.push({'todow':result.rows[i].todow, 'pausecnt':result.rows[i].pausecnt, 'pausetime':result.rows[i].pausetime,'stfail':result.rows[i].stfail, 'usrcnt':result.rows[i].usrcnt ,'tp':parseFloat(result.rows[i].tp),'rxbytes':parseFloat(result.rows[i].rxbytes),'badness':parseFloat(result.rows[i].badness) })
						}else if (result.rows[i].typ == 'wf'){
							geojson.wf.push({'todow':result.rows[i].todow, 'pausecnt':result.rows[i].pausecnt, 'pausetime':result.rows[i].pausetime,'stfail':result.rows[i].stfail, 'usrcnt':result.rows[i].usrcnt ,'tp':parseFloat(result.rows[i].tp),'rxbytes':parseFloat(result.rows[i].rxbytes),'badness':parseFloat(result.rows[i].badness) })
						}
						i++;
					});					
					// console.log(geojson)
					var vvv = JSON.stringify(geojson);
					redis.set(keys, JSON.stringify(geojson));
					client.end();
					res.json(JSON.parse(vvv));
				});
			}
		});
	});

}




exports.treemap_cellwf_list = function(req, res){
	var geojson = {'wf':[], 'cell':[]};
	var ne = req.param('ne', 0.0);
	var sw = req.param('sw', 0.0);

	pg.connect(pgConStr, function(err, client, don){
		if(err){
			return console.error('error fetching client from pool', err);
		}
		var keys = "treemap_cellwf_list"+ne+"_"+sw;
		redis.get(keys, function(err, reply){
			// console.error('redis err' , err);
			console.log('redis reply ', reply);
			if(reply && reply!=null){
				res.json(JSON.parse(reply));
			}else{
				// console.log([ ne.split(',')[0], sw.split(',')[0], ne.split(',')[1], sw.split(',')[1] ]);
				client.query("select 'cell' as typ, c.brand, c.model, sum(c.usrcnt) as usrcnt, sum(c.pausecnt)::float/case when sum(c.playtime)=0 then 1 else sum(c.playtime) end*3600 as pausecnt, \
					sum(c.stfail)::float/case when sum(c.sesscnt)=0 then 1 else sum(c.sesscnt)end as stfail, \
					sum(c.cellrxbytes)::float*8/case when sum(c.cellduration)=0 then 1 else sum(c.cellduration) end/1000000 as tp, sum(c.cellrxbytes)/1024/1024/DATE_PART('day','2015-01-01'::timestamp-now())::float as rxbytes, \
					sum(c.pausetime)::float/case when sum(c.playtime)=0 then 1 else sum(c.playtime) end*3600 as pausetime, \
					case when (sum(b.stfail)+sum(b.dronst)+sum(b.largepc)+sum(b.smallpc))=0 then 0 else (sum(b.stfail)+sum(b.dronst)+sum(b.largepc))::float/(sum(b.stfail)+sum(b.dronst)+sum(b.largepc)+sum(b.smallpc))*100*(((sum(b.usrcnt)/2)^2*(sum(b.sesscnt)/2)^2)/((1+(sum(b.usrcnt)/2)^2)*(1+(sum(b.sesscnt)/2)^2))) end as badness \
					from cellidux_dev c, cellidux_badness_dev b \
					where 1=1 and c.lat = b.lat and c.lng = b.lng and b.brand=c.brand and b.model=c.model \
					AND c.lat < $1 AND c.lat > $2 AND c.lng < $3 AND c.lng > $4 \
					group by c.brand, c.model \
					union all \
					select 'wf' as typ, c.brand, c.model, sum(c.usrcnt) as usrcnt, sum(c.pausecnt)::float/case when sum(c.playtime)=0 then 1 else sum(c.playtime) end*3600 as pausecnt, \
					sum(c.stfail)::float/case when sum(c.sesscnt)=0 then 1 else sum(c.sesscnt)end as stfail, \
					sum(c.wfrxbytes)::float*8/case when sum(c.wfduration)=0 then 1 else sum(c.wfduration) end/1000000 as tp, sum(c.wfrxbytes)/1024/1024/DATE_PART('day','2015-01-01'::timestamp-now())::float as rxbytes, \
					sum(c.pausetime)::float/case when sum(c.playtime)=0 then 1 else sum(c.playtime) end*3600 as pausetime, \
					case when (sum(b.stfail)+sum(b.dronst)+sum(b.largepc)+sum(b.smallpc))=0 then 0 else (sum(b.stfail)+sum(b.dronst)+sum(b.largepc))::float/(sum(b.stfail)+sum(b.dronst)+sum(b.largepc)+sum(b.smallpc))*100*(((sum(b.usrcnt)/2)^2*(sum(b.sesscnt)/2)^2)/((1+(sum(b.usrcnt)/2)^2)*(1+(sum(b.sesscnt)/2)^2))) end as badness \
					from bssidux_dev c, bssidux_badness_dev b \
					where 1=1 and c.lat=b.lat and c.lng=b.lng and b.brand=c.brand and b.model=c.model \
					AND c.lat < $5 AND c.lat > $6 AND c.lng < $7 AND c.lng > $8 \
					group by c.brand, c.model" ,
				[ ne.split(',')[0], sw.split(',')[0], ne.split(',')[1], sw.split(',')[1], ne.split(',')[0], sw.split(',')[0], ne.split(',')[1], sw.split(',')[1] ], function(err, result){
					// done()
					if(err){
						return console.error(keys+'=>'+'error running query', err);
					}
					// console.log('result length is ', result.rows);
					var i=0;
					result.rows.forEach(function(d){
						if(result.rows[i].typ == 'cell'){
							geojson.cell.push({'brand':result.rows[i].brand, 'model':result.rows[i].model, 'pausecnt':parseFloat(result.rows[i].pausecnt), 'pausetime':parseFloat(result.rows[i].pausetime),'stfail':parseFloat(result.rows[i].stfail), 'usrcnt':parseFloat(result.rows[i].usrcnt),'tp':parseFloat(result.rows[i].tp),'rxbytes':parseFloat(result.rows[i].rxbytes),'badness':parseFloat(result.rows[i].badness) })
						}else if (result.rows[i].typ == 'wf'){
							geojson.wf.push({'brand':result.rows[i].brand, 'model':result.rows[i].model, 'pausecnt':parseFloat(result.rows[i].pausecnt), 'pausetime':parseFloat(result.rows[i].pausetime),'stfail':parseFloat(result.rows[i].stfail), 'usrcnt':parseFloat(result.rows[i].usrcnt),'tp':parseFloat(result.rows[i].tp),'rxbytes':parseFloat(result.rows[i].rxbytes),'badness':parseFloat(result.rows[i].badness) })
						}
						i++;
					});					
					// console.log(geojson)
					var vvv = JSON.stringify(geojson);
					redis.set(keys, JSON.stringify(geojson));
					client.end();
					res.json(JSON.parse(vvv));
				});
			}
		});
	});

}








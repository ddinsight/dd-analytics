var express = require('express');
var path = require('path');
var pg = require('pg');
var pgConStr =  'postgres://USERNAME:PASSOWRD@POSTGRESERVER:PORT/DATABASENAME';

var redis = require('redis').createClient();
redis.on('error', function (err) {
  console.log('Error ' + err);
});


var TAG = 'caction_'

var getPlmnid = function(optrcom){
	return (optrcom=='45008'?'KT':(optrcom=='45005'?'SKT':optrcom=='45006'?'LGT':'000000'));
}



exports.map_cell_list = function(req, res){
	var geojson = {'type':'FeatureCollection', 'features':[],"properties":{ "description":"Airplug, 2015 inc" }}
	var ne = req.param('ne', 0.0);
	var sw = req.param('sw', 0.0);
	var poor = req.param('poor', 20);
	// var scope = req.param('scope', '0,0,0,0');
	console.log('map_cell_list');

	pg.connect(pgConStr, function(err, client, don){
		if(err){
			return console.error('error fetching client from pool', err);
		}
		var keynm = TAG + "map_cell_list_"+ne+"_"+sw+'_'+poor;
		redis.get(keynm, function(err, reply){

			if(reply && reply!=null){
				res.json(JSON.parse(reply));
			}else{
				client.query("select \
						  x.lat, x.lng, x.optrcom, nvl(a.addr, '-') as addr, id, sesscnt, pausecnt, pausetime, stfail, usrcnt, tp, rxbytes, badness \
						  from ( \
						    SELECT \
						      l.lat, \
						      l.lng, min(l.fullid) as id, \
						      split_part(l.fullid, '_', 1) as optrcom, sum(l.sesscnt) as sesscnt, \
						      sum(l.pausecnt) :: FLOAT / CASE WHEN sum(l.playtime) = 0 THEN 1 ELSE sum(l.playtime) END * 3600  AS pausecnt, \
						      sum(l.stfail) :: FLOAT / CASE WHEN sum(l.sesscnt) = 0 THEN 1 ELSE sum(l.sesscnt) END  AS stfail, \
						      sum(l.cellrxbytes) :: FLOAT * 8 / CASE WHEN sum(l.cellduration) = 0 THEN 1 ELSE sum(l.cellduration) END / 1000000 AS tp, \
						      sum(l.cellrxbytes) / 1024 / 1024 / 254 :: FLOAT  AS rxbytes, \
						      sum(l.pausetime) :: FLOAT / CASE WHEN sum(playtime) = 0 THEN 1 ELSE sum(l.playtime) END * 3600  AS pausetime, \
						      sum(l.usrcnt) AS usrcnt, \
						      case when (sum(b.stfail)+sum(b.dronst)+sum(b.largepc)+sum(b.smallpc))=0 then 0 else (sum(b.stfail)+sum(b.dronst)+sum(b.largepc))::float/(sum(b.stfail)+sum(b.dronst)+sum(b.largepc)+sum(b.smallpc))*100*(((sum(b.usrcnt)/2)^2*(sum(b.sesscnt)/5)^2)/((1+(sum(b.usrcnt)/2)^2)*(1+(sum(b.sesscnt)/5)^2))) end as badness \
						    FROM cellidux l, cellidux_badness b \
						    WHERE 1 = 1 and l.lat=b.lat and l.lng=b.lng and l.fullid=b.fullid \
						    AND l.lat < $1 AND l.lat > $2 AND l.lng < $3 AND l.lng > $4 \
						    GROUP BY l.lat, l.lng, split_part(l.fullid, '_', 1) \
						) x left join (select distinct(lat||lng), lat, lng, addr from ktwfloc_addr) a on x.lat = a.lat and x.lng = a.lng" ,[ne.split(',')[0], sw.split(',')[0], ne.split(',')[1], sw.split(',')[1] ], 
					 function(err, result){
					// done()
					if(err){
						return console.error('error running query', err);
					}
					console.log('result length is ', result.rows);
					result.rows.forEach(function(d){
						geojson.features.push({'geometry':{'type':'Point', 'coordinates':[parseFloat(d.lng), parseFloat(d.lat)]}, 
							'type':'Feature','properties':{'optrcom':getPlmnid(d.optrcom), 'id':d.id ,'addr':d.addr,'badness':parseFloat(d.badness),'usrcnt':parseFloat(d.usrcnt),'sesscnt':parseFloat(d.sesscnt) ,'pausecnt':parseFloat(d.pausecnt),'rxbytes':parseFloat(d.rxbytes),'pausetime':parseFloat(d.pausetime),'stfail':parseFloat(d.stfail) ,'tp':parseFloat(d.tp)    } });	
					});					
					// console.log(geojson)
					var vvv = JSON.stringify(geojson);
					redis.set(keynm, JSON.stringify(geojson));
					client.end();
					res.json(JSON.parse(vvv));
				});
			} // end of reply 
		});
	});
}

exports.map_lte_list = function(req, res){
	var geojson = {'type':'FeatureCollection', 'features':[],"properties":{ "description":"Airplug, 2015 inc" }}
	var ne = req.param('ne', 0.0);
	var sw = req.param('sw', 0.0);
	var poor = req.param('poor', 20);
	// var scope = req.param('scope', '0,0,0,0');
	console.log('map_lte_list');

	pg.connect(pgConStr, function(err, client, don){
		if(err){
			return console.error('error fetching client from pool', err);
		}
		var keynm = TAG + "map_lte_list_"+ne+"_"+sw+'_'+poor;
		redis.get(keynm, function(err, reply){

			if(reply && reply!=null){
				res.json(JSON.parse(reply));
			}else{
				client.query("select \
						  x.lat, x.lng, x.optrcom, nvl(a.addr, '-') as addr, id, sesscnt, pausecnt, pausetime, stfail, usrcnt, tp, rxbytes, badness \
						  from ( \
						    SELECT \
						      l.lat, \
						      l.lng, min(l.fullid) as id, \
						      split_part(l.fullid, '_', 1) as optrcom, sum(l.sesscnt) as sesscnt, \
						      sum(l.pausecnt) :: FLOAT / CASE WHEN sum(l.playtime) = 0 THEN 1 ELSE sum(l.playtime) END * 3600  AS pausecnt, \
						      sum(l.stfail) :: FLOAT / CASE WHEN sum(l.sesscnt) = 0 THEN 1 ELSE sum(l.sesscnt) END  AS stfail, \
						      sum(l.cellrxbytes) :: FLOAT * 8 / CASE WHEN sum(l.cellduration) = 0 THEN 1 ELSE sum(l.cellduration) END / 1000000 AS tp, \
						      sum(l.cellrxbytes) / 1024 / 1024 / 254 :: FLOAT  AS rxbytes, \
						      sum(l.pausetime) :: FLOAT / CASE WHEN sum(playtime) = 0 THEN 1 ELSE sum(l.playtime) END * 3600  AS pausetime, \
						      sum(l.usrcnt) AS usrcnt, \
						      case when (sum(b.stfail)+sum(b.dronst)+sum(b.largepc)+sum(b.smallpc))=0 then 0 else (sum(b.stfail)+sum(b.dronst)+sum(b.largepc))::float/(sum(b.stfail)+sum(b.dronst)+sum(b.largepc)+sum(b.smallpc))*100*(((sum(b.usrcnt)/2)^2*(sum(b.sesscnt)/5)^2)/((1+(sum(b.usrcnt)/2)^2)*(1+(sum(b.sesscnt)/5)^2))) end as badness \
						    FROM lteidux l, lteidux_badness b \
						    WHERE 1 = 1 and l.lat=b.lat and l.lng=b.lng and l.fullid=b.fullid \
						    AND l.lat < $1 AND l.lat > $2 AND l.lng < $3 AND l.lng > $4 \
						    GROUP BY l.lat, l.lng, split_part(l.fullid, '_', 1) \
						) x left join (select distinct(lat||lng), lat, lng, addr from ktwfloc_addr) a on x.lat = a.lat and x.lng = a.lng" ,[ne.split(',')[0], sw.split(',')[0], ne.split(',')[1], sw.split(',')[1] ], 
					 function(err, result){
					// done()
					if(err){
						return console.error('error running query', err);
					}
					console.log('result length is ', result.rows);
					result.rows.forEach(function(d){
						geojson.features.push({'geometry':{'type':'Point', 'coordinates':[parseFloat(d.lng), parseFloat(d.lat)]}, 
							'type':'Feature','properties':{'optrcom':getPlmnid(d.optrcom), 'id':d.id ,'addr':d.addr,'badness':parseFloat(d.badness),'usrcnt':parseFloat(d.usrcnt),'sesscnt':parseFloat(d.sesscnt) ,'pausecnt':parseFloat(d.pausecnt),'rxbytes':parseFloat(d.rxbytes),'pausetime':parseFloat(d.pausetime),'stfail':parseFloat(d.stfail) ,'tp':parseFloat(d.tp)    } });	
					});					
					// console.log(geojson)
					var vvv = JSON.stringify(geojson);
					redis.set(keynm, JSON.stringify(geojson));
					client.end();
					res.json(JSON.parse(vvv));
				});
			} // end of reply 
		});
	});
}

exports.map_wf_list = function(req, res){
	var geojson = {'type':'FeatureCollection', 'features':[],"properties":{ "description":"Airplug, 2015 inc" }}
	var ne = req.param('ne', 0.0);
	var sw = req.param('sw', 0.0);
	var poor = req.param('poor', 20);
	// var scope = req.param('scope', '0,0,0,0');

	pg.connect(pgConStr, function(err, client, don){
		if(err){
			return console.error('error fetching client from pool', err);
		}
		var keynm = TAG + "map_wf_list_"+ne+"_"+sw+'_'+poor;
		redis.get(keynm, function(err, reply){

			if(reply && reply!=null){
				res.json(JSON.parse(reply));
			}else{
				client.query("select \
						  x.lat, x.lng, x.optrcom, nvl(a.addr, '-') as addr, id, sesscnt, pausecnt, pausetime, stfail, usrcnt, tp, rxbytes, badness \
						  from ( \
						    SELECT \
						      l.lat, \
						      l.lng, a.optrcom as optrcom, \
						      sum(l.sesscnt) as sesscnt, min(l.bssid) as id, \
						      sum(l.pausecnt) :: FLOAT / CASE WHEN sum(l.playtime) = 0 THEN 1 ELSE sum(l.playtime) END * 3600  AS pausecnt, \
						      sum(l.stfail) :: FLOAT / CASE WHEN sum(l.sesscnt) = 0 THEN 1 ELSE sum(l.sesscnt) END  AS stfail, \
						      sum(l.wfrxbytes) :: FLOAT * 8 / CASE WHEN sum(l.wfduration) = 0 THEN 1 ELSE sum(l.wfduration) END / 1000000 AS tp, \
						      sum(l.wfrxbytes) / 1024 / 1024 / 254 :: FLOAT  AS rxbytes, \
						      sum(l.pausetime) :: FLOAT / CASE WHEN sum(playtime) = 0 THEN 1 ELSE sum(l.playtime) END * 3600  AS pausetime, \
						      sum(l.usrcnt) AS usrcnt, \
						      case when (sum(b.stfail)+sum(b.dronst)+sum(b.largepc)+sum(b.smallpc))=0 then 0 else (sum(b.stfail)+sum(b.dronst)+sum(b.largepc))::float/(sum(b.stfail)+sum(b.dronst)+sum(b.largepc)+sum(b.smallpc))*100*(((sum(b.usrcnt)/2)^2*(sum(b.sesscnt)/5)^2)/((1+(sum(b.usrcnt)/2)^2)*(1+(sum(b.sesscnt)/5)^2))) end as badness \
						    FROM apinfo a, bssidux l, bssidux_badness b \
						    WHERE 1 = 1 and l.lat=b.lat and l.lng=b.lng and l.bssid=b.bssid and l.bssid = a.bssid \
						    AND l.lat < $1 AND l.lat > $2 AND l.lng < $3 AND l.lng > $4 \
						    GROUP BY l.lat, l.lng, a.optrcom  \
						) x left join (select distinct(lat||lng), lat, lng, addr from ktwfloc_addr) a on x.lat = a.lat and x.lng = a.lng" ,[ne.split(',')[0], sw.split(',')[0], ne.split(',')[1], sw.split(',')[1]], function(err, result){
					// done()
					if(err){
						return console.error('error running query', err);
					}
					result.rows.forEach(function(d){
						geojson.features.push({'geometry':{'type':'Point', 'coordinates':[parseFloat(d.lng), parseFloat(d.lat)]}, 
							'type':'Feature','properties':{'optrcom':d.optrcom, 'id':d.id ,'addr':d.addr,'badness':parseFloat(d.badness),'usrcnt':parseFloat(d.usrcnt),'sesscnt':parseFloat(d.sesscnt) ,'pausecnt':parseFloat(d.pausecnt),'rxbytes':parseFloat(d.rxbytes),'pausetime':parseFloat(d.pausetime),'stfail':parseFloat(d.stfail) ,'tp':parseFloat(d.tp)    } });	
					});
					var vvv = JSON.stringify(geojson);
					redis.set(keynm, JSON.stringify(geojson));
					client.end();
					res.json(JSON.parse(vvv));
				});
			}
		});
	});
}
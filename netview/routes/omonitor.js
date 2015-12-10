var express = require('express');
var path = require('path');
var pg = require('pg');
var mysql      = require('mysql');
var pgConStr =  'postgres://USERNAME:PASSOWRD@POSTGRESERVER:PORT/DATABASENAME';

var redis = require('redis').createClient();
redis.on('error', function (err) {
  console.log('Error ' + err);
});


var TAG = "omonitor_"

var getPlmnid = function(optrcom){
	// return (optrcom=='KT'?'45008':(optrcom=='SKT'?'45005':optrcom=='LGT'?'45006':'000000'));
	return (optrcom=='45008'?'KT':(optrcom=='45005'?'SKT':optrcom=='45006'?'LGT':'000000'));
}

exports.map_cell_name_list = function(req, res){
	var geojson = {'type':'FeatureCollection', 'features':[],"properties":{ "description":"Airplug, 2015 inc" }}
	var nm = req.param('nm', 0.0);
	// var sw = req.param('sw', 0.0);
	// var optrcom = req.param('optrcom', 'KT');
	// var plmnid = getPlmnid(optrcom);

	pg.connect(pgConStr, function(err, client, don){
		if(err){
			return console.error('error fetching client from pool', err);
		}
		var keynm = TAG+"list_map_cell_name_list_"+nm;
		redis.get(keynm, function(err, reply){

			if(reply && reply!=null){
				res.json(JSON.parse(reply));
			}else{
				client.query("SELECT \
						  l.lat, \
						  l.lng, min(l.fullid) as id, min(a.addr) as addr, \
						  split_part(l.fullid, '_', 1) as optrcom, sum(l.sesscnt) as sesscnt, \
						  CASE WHEN sum(l.playtime) = 0 THEN 0 ELSE  sum(l.pausecnt) :: FLOAT / sum(l.playtime) * 3600  END AS pausecnt, \
						  CASE WHEN sum(l.sesscnt) = 0 THEN 0 ELSE sum(l.stfail) :: FLOAT / sum(l.sesscnt) END  AS stfail, \
						  sum(l.cellrxbytes) :: FLOAT * 8 / CASE WHEN sum(l.cellduration) = 0 THEN 1 ELSE sum(l.cellduration) END / 1000000 AS tp, \
						  sum(l.cellrxbytes) / 1024 / 1024 / 254 :: FLOAT  AS rxbytes, \
						  CASE WHEN sum(playtime) = 0 THEN 0 ELSE  sum(l.pausetime) :: FLOAT / sum(l.playtime) * 3600 end AS pausetime, \
						  sum(l.usrcnt) AS usrcnt, \
						  case when (sum(b.stfail)+sum(b.dronst)+sum(b.largepc)+sum(b.smallpc))=0 then 0 else (sum(b.stfail)+sum(b.dronst)+sum(b.largepc))::float/(sum(b.stfail)+sum(b.dronst)+sum(b.largepc)+sum(b.smallpc))*100 * (((sum(b.usrcnt)/2)^2*(sum(b.sesscnt)/5)^2)/((1+(sum(b.usrcnt)/2)^2)*(1+(sum(b.sesscnt)/5)^2))) end as badness \
						FROM cellidux l, cellidux_badness b , (select distinct lat||''||lng, addr, lat, lng  from ktwfloc_addr) a \
						WHERE 1 = 1 and l.lat=b.lat and l.lng=b.lng and l.fullid=b.fullid \
						  and l.lat = a.lat and l.lng = a.lng \
						AND a.addr like '%"+nm+"%' \
						GROUP BY l.lat, l.lng, split_part(l.fullid, '_', 1)  having sum(l.pausetime) <= sum(l.playtime) and sum(l.usrcnt) > 0" ,[], function(err, result){
					if(err){
						return console.error('error running query', err);
					}
					// var i=0;
					result.rows.forEach(function(d){

						geojson.features.push({'geometry':{'type':'Point', 'coordinates':[parseFloat(d.lng), parseFloat(d.lat)]}, 
							'type':'Feature','properties':{'optrcom':getPlmnid(d.optrcom),'id':d.id, 'addr':d.addr,'pausecnt':parseFloat(d.pausecnt),'pausetime':parseFloat(d.pausetime),'stfail':parseFloat(d.stfail),'tp':parseFloat(d.tp)>13?13:parseFloat(d.tp),'rxbytes':parseFloat(d.rxbytes),'usrcnt':parseInt(d.usrcnt),'sesscnt':parseInt(d.sesscnt),'badness':parseFloat(d.badness)  } });	
						// i++;
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


exports.map_cell_list = function(req, res){
	var geojson = {'type':'FeatureCollection', 'features':[],"properties":{ "description":"Airplug, 2015 inc" }}
	var ne = req.param('ne', 0.0);
	var sw = req.param('sw', 0.0);
	// var optrcom = req.param('optrcom', 'KT');
	// var plmnid = getPlmnid(optrcom);

	pg.connect(pgConStr, function(err, client, don){
		if(err){
			return console.error('error fetching client from pool', err);
		}
		var keynm = TAG+"list_map_cell_list_"+ne+"_"+sw+"_";
		redis.get(keynm, function(err, reply){

			if(reply && reply!=null){
				res.json(JSON.parse(reply));
			}else{
				client.query("select \
						  x.lat, x.lng, x.optrcom, COALESCE(a.addr, '-') as addr, id, sesscnt, pausecnt, pausetime, stfail, usrcnt, tp, rxbytes, badness \
						  from ( \
								SELECT \
								  l.lat, \
								  l.lng, min(l.fullid) as id, \
								  split_part(l.fullid, '_', 1) as optrcom, sum(l.sesscnt) as sesscnt, \
								  CASE WHEN sum(l.playtime) = 0 THEN 0 ELSE  sum(l.pausecnt) :: FLOAT / sum(l.playtime) * 3600  END AS pausecnt, \
								  CASE WHEN sum(l.sesscnt) = 0 THEN 0 ELSE sum(l.stfail) :: FLOAT / sum(l.sesscnt) END  AS stfail, \
								  sum(l.cellrxbytes) :: FLOAT * 8 / CASE WHEN sum(l.cellduration) = 0 THEN 1 ELSE sum(l.cellduration) END / 1000000 AS tp, \
								  sum(l.cellrxbytes) / 1024 / 1024 / 254 :: FLOAT  AS rxbytes, \
								  CASE WHEN sum(playtime) = 0 THEN 0 ELSE  sum(l.pausetime) :: FLOAT / sum(l.playtime) * 3600 end AS pausetime, \
								  sum(l.usrcnt) AS usrcnt, \
								  case when (sum(b.stfail)+sum(b.dronst)+sum(b.largepc)+sum(b.smallpc))=0 then 0 else (sum(b.stfail)+sum(b.dronst)+sum(b.largepc))::float/(sum(b.stfail)+sum(b.dronst)+sum(b.largepc)+sum(b.smallpc))*100 * (((sum(b.usrcnt)/2)^2*(sum(b.sesscnt)/5)^2)/((1+(sum(b.usrcnt)/2)^2)*(1+(sum(b.sesscnt)/5)^2))) end as badness \
								FROM cellidux l, cellidux_badness b \
								WHERE 1 = 1 and l.lat=b.lat and l.lng=b.lng and l.fullid=b.fullid \
								AND l.lat < $1 AND l.lat > $2 AND l.lng < $3 AND l.lng > $4 \
								GROUP BY l.lat, l.lng, split_part(l.fullid, '_', 1)  having sum(l.pausetime) <= sum(l.playtime) and sum(l.usrcnt) > 0 \
						) x left join (select distinct(lat||''||lng), lat, lng, addr from ktwfloc_addr) a on x.lat = a.lat and x.lng = a.lng " ,[ne.split(',')[0], sw.split(',')[0], ne.split(',')[1], sw.split(',')[1] ], function(err, result){
					if(err){
						return console.error('error running query', err);
					}
					// var i=0;
					result.rows.forEach(function(d){

						geojson.features.push({'geometry':{'type':'Point', 'coordinates':[parseFloat(d.lng), parseFloat(d.lat)]}, 
							'type':'Feature','properties':{'optrcom':getPlmnid(d.optrcom),'id':d.id, 'addr':d.addr,'pausecnt':parseFloat(d.pausecnt),'pausetime':parseFloat(d.pausetime),'stfail':parseFloat(d.stfail),'tp':parseFloat(d.tp)>13?13:parseFloat(d.tp),'rxbytes':parseFloat(d.rxbytes),'usrcnt':parseInt(d.usrcnt),'sesscnt':parseInt(d.sesscnt),'badness':parseFloat(d.badness)  } });	
						// i++;
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

exports.map_lte_name_list = function(req, res){
	var geojson = {'type':'FeatureCollection', 'features':[],"properties":{ "description":"Airplug, 2015 inc" }}
	var nm = req.param('nm', 0.0);

	pg.connect(pgConStr, function(err, client, don){
		if(err){
			return console.error('error fetching client from pool', err);
		}
		var keynm = TAG+"list_map_lte_name_list_"+nm;
		redis.get(keynm, function(err, reply){

			if(reply && reply!=null){
				res.json(JSON.parse(reply));
			}else{
				client.query("SELECT \
						  l.lat, \
						  l.lng, min(l.fullid) as id, min(a.addr) as addr, \
						  split_part(l.fullid, '_', 1) as optrcom, sum(l.sesscnt) as sesscnt, \
						  CASE WHEN sum(l.playtime) = 0 THEN 0 ELSE  sum(l.pausecnt) :: FLOAT / sum(l.playtime) * 3600  END AS pausecnt, \
						  CASE WHEN sum(l.sesscnt) = 0 THEN 0 ELSE sum(l.stfail) :: FLOAT / sum(l.sesscnt) END  AS stfail, \
						  sum(l.cellrxbytes) :: FLOAT * 8 / CASE WHEN sum(l.cellduration) = 0 THEN 1 ELSE sum(l.cellduration) END / 1000000 AS tp, \
						  sum(l.cellrxbytes) / 1024 / 1024 / 254 :: FLOAT  AS rxbytes, \
						  CASE WHEN sum(playtime) = 0 THEN 0 ELSE  sum(l.pausetime) :: FLOAT / sum(l.playtime) * 3600 end AS pausetime, \
						  sum(l.usrcnt) AS usrcnt, \
						  case when (sum(b.stfail)+sum(b.dronst)+sum(b.largepc)+sum(b.smallpc))=0 then 0 else (sum(b.stfail)+sum(b.dronst)+sum(b.largepc))::float/(sum(b.stfail)+sum(b.dronst)+sum(b.largepc)+sum(b.smallpc))*100 * (((sum(b.usrcnt)/2)^2*(sum(b.sesscnt)/5)^2)/((1+(sum(b.usrcnt)/2)^2)*(1+(sum(b.sesscnt)/5)^2))) end as badness \
						FROM lteidux l, lteidux_badness b , (select distinct lat||''||lng, addr, lat, lng  from ktwfloc_addr) a \
						WHERE 1 = 1 and l.lat=b.lat and l.lng=b.lng and l.fullid=b.fullid \
						  and l.lat = a.lat and l.lng = a.lng \
						AND a.addr like '%"+nm+"%' \
						GROUP BY l.lat, l.lng, split_part(l.fullid, '_', 1) having sum(l.pausetime) <= sum(l.playtime) and sum(l.usrcnt) > 0" ,[], function(err, result){
					if(err){
						return console.error('error running query', err);
					}
					// var i=0;
					result.rows.forEach(function(d){

						geojson.features.push({'geometry':{'type':'Point', 'coordinates':[parseFloat(d.lng), parseFloat(d.lat)]}, 
							'type':'Feature','properties':{'optrcom':getPlmnid(d.optrcom),'id':d.id, 'addr':d.addr,'pausecnt':parseFloat(d.pausecnt),'pausetime':parseFloat(d.pausetime),'stfail':parseFloat(d.stfail),'tp':parseFloat(d.tp)>13?13:parseFloat(d.tp),'rxbytes':parseFloat(d.rxbytes),'usrcnt':parseInt(d.usrcnt),'sesscnt':parseInt(d.sesscnt),'badness':parseFloat(d.badness)  } });	
						// i++;
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

exports.map_lte_list = function(req, res){
	var geojson = {'type':'FeatureCollection', 'features':[],"properties":{ "description":"Airplug, 2015 inc" }}
	var ne = req.param('ne', 0.0);
	var sw = req.param('sw', 0.0);
	// var optrcom = req.param('optrcom', 'KT');
	// var plmnid = getPlmnid(optrcom);

	pg.connect(pgConStr, function(err, client, don){
		if(err){
			return console.error('error fetching client from pool', err);
		}
		var keynm = TAG+"list_map_lte_list_"+ne+"_"+sw+"_";
		redis.get(keynm, function(err, reply){

			if(reply && reply!=null){
				res.json(JSON.parse(reply));
			}else{
				client.query("select \
						  x.lat, x.lng, x.optrcom, COALESCE(a.addr, '-') as addr, id, sesscnt, pausecnt, pausetime, stfail, usrcnt, tp, rxbytes, badness \
						  from ( \
								SELECT \
								  l.lat, \
								  l.lng, min(l.fullid) as id, \
								  split_part(l.fullid, '_', 1) as optrcom, sum(l.sesscnt) as sesscnt, \
								  CASE WHEN sum(l.playtime) = 0 THEN 0 ELSE  sum(l.pausecnt) :: FLOAT / sum(l.playtime) * 3600  END AS pausecnt, \
								  CASE WHEN sum(l.sesscnt) = 0 THEN 0 ELSE sum(l.stfail) :: FLOAT / sum(l.sesscnt) END  AS stfail, \
								  sum(l.cellrxbytes) :: FLOAT * 8 / CASE WHEN sum(l.cellduration) = 0 THEN 1 ELSE sum(l.cellduration) END / 1000000 AS tp, \
								  sum(l.cellrxbytes) / 1024 / 1024 / 254 :: FLOAT  AS rxbytes, \
								  CASE WHEN sum(playtime) = 0 THEN 0 ELSE  sum(l.pausetime) :: FLOAT / sum(l.playtime) * 3600 end AS pausetime, \
								  sum(l.usrcnt) AS usrcnt, \
								  case when (sum(b.stfail)+sum(b.dronst)+sum(b.largepc)+sum(b.smallpc))=0 then 0 else (sum(b.stfail)+sum(b.dronst)+sum(b.largepc))::float/(sum(b.stfail)+sum(b.dronst)+sum(b.largepc)+sum(b.smallpc))*100 * (((sum(b.usrcnt)/2)^2*(sum(b.sesscnt)/5)^2)/((1+(sum(b.usrcnt)/2)^2)*(1+(sum(b.sesscnt)/5)^2))) end as badness \
								FROM lteidux l, lteidux_badness b \
								WHERE 1 = 1 and l.lat=b.lat and l.lng=b.lng and l.fullid=b.fullid \
								AND l.lat < $1 AND l.lat > $2 AND l.lng < $3 AND l.lng > $4 \
								GROUP BY l.lat, l.lng, split_part(l.fullid, '_', 1)  having sum(l.pausetime) <= sum(l.playtime) and sum(l.usrcnt) > 0 \
						) x left join (select distinct(lat||''||lng), lat, lng, addr from ktwfloc_addr) a on x.lat = a.lat and x.lng = a.lng " ,[ne.split(',')[0], sw.split(',')[0], ne.split(',')[1], sw.split(',')[1] ], function(err, result){
					if(err){
						return console.error('error running query', err);
					}
					// var i=0;
					result.rows.forEach(function(d){

						geojson.features.push({'geometry':{'type':'Point', 'coordinates':[parseFloat(d.lng), parseFloat(d.lat)]}, 
							'type':'Feature','properties':{'optrcom':getPlmnid(d.optrcom),'id':d.id, 'addr':d.addr,'pausecnt':parseFloat(d.pausecnt),'pausetime':parseFloat(d.pausetime),'stfail':parseFloat(d.stfail),'tp':parseFloat(d.tp)>13?13:parseFloat(d.tp),'rxbytes':parseFloat(d.rxbytes),'usrcnt':parseInt(d.usrcnt),'sesscnt':parseInt(d.sesscnt),'badness':parseFloat(d.badness)  } });	
						// i++;
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


exports.map_wf_name_list = function(req, res){
	var geojson = {'type':'FeatureCollection', 'features':[],"properties":{ "description":"Airplug, 2015 inc" }}
	var nm = req.param('nm', 0.0);

	pg.connect(pgConStr, function(err, client, don){
		if(err){
			return console.error('error fetching client from pool', err);
		}
		var keynm = TAG+"list_map_wf_name_list_"+nm;
		redis.get(keynm, function(err, reply){

			if(reply && reply!=null){
				res.json(JSON.parse(reply));
			}else{
				client.query(" SELECT \
						  l.lat, l.lng,  a.optrcom, min(a.bssid) as id, sum(l.sesscnt) as sesscnt, min(k.addr) as addr , \
						  CASE WHEN sum(l.playtime) = 0 THEN 0 ELSE  sum(l.pausecnt) :: FLOAT / sum(l.playtime) * 3600  END AS pausecnt, \
						  CASE WHEN sum(l.sesscnt) = 0 THEN 0 ELSE sum(l.stfail) :: FLOAT / sum(l.sesscnt) END  AS stfail, \
						  sum(l.wfrxbytes) :: FLOAT * 8 / CASE WHEN sum(l.wfduration) = 0 THEN 1 ELSE sum(l.wfduration) END / 1000000 AS tp, \
						  sum(l.wfrxbytes) / 1024 / 1024 / 111 :: FLOAT  AS rxbytes, \
						  CASE WHEN sum(playtime) = 0 THEN 0 ELSE  sum(l.pausetime) :: FLOAT / sum(l.playtime) * 3600 end AS pausetime, \
						  sum(l.usrcnt)  AS usrcnt, \
						  case when (sum(b.stfail)+sum(b.dronst)+sum(b.largepc)+sum(b.smallpc))=0 then 0 else (sum(b.stfail)+sum(b.dronst)+sum(b.largepc))::float/(sum(b.stfail)+sum(b.dronst)+sum(b.largepc)+sum(b.smallpc))*100 * (((sum(b.usrcnt)/2)^2*(sum(b.sesscnt)/5)^2)/((1+(sum(b.usrcnt)/2)^2)*(1+(sum(b.sesscnt)/5)^2))) end as badness \
						FROM bssidux l, bssidux_badness b , apinfo a ,(select distinct lat||''||lng, addr, lat, lng  from ktwfloc_addr) k \
						WHERE 1 = 1 and l.lat=b.lat and l.lng=b.lng and l.bssid=b.bssid and a.bssid = l.bssid and l.lat=k.lat and l.lng=k.lng \
						and k.addr like '%"+nm+"%' \
						GROUP BY l.lat, l.lng,a.optrcom  having sum(l.pausetime) <= sum(l.playtime) and sum(l.usrcnt) > 0" ,[], function(err, result){

					if(err){
						return console.error('error running query', err);
					}
					result.rows.forEach(function(d){

						geojson.features.push({'geometry':{'type':'Point', 'coordinates':[parseFloat(d.lng), parseFloat(d.lat)]}, 
							'type':'Feature','properties':{'optrcom':d.optrcom, 'id':d.id, 'addr':d.addr, 'pausecnt':parseFloat(d.pausecnt),'pausetime':parseFloat(d.pausetime), 'stfail':parseFloat(d.stfail), 'tp':parseFloat(d.tp),'rxbytes':parseFloat(d.rxbytes),'usrcnt':parseInt(d.usrcnt) ,'sesscnt':parseInt(d.sesscnt),'badness':parseFloat(d.badness) } });	
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

exports.map_wf_list = function(req, res){
	var geojson = {'type':'FeatureCollection', 'features':[],"properties":{ "description":"Airplug, 2015 inc" }}
	var ne = req.param('ne', 0.0);
	var sw = req.param('sw', 0.0);
	// var optrcom = req.param('optrcom', 'KT');
	// var plmnid = (optrcom=='KT'?'45008':(optrcom=='SKT'?'45005':optrcom=='LGT'?'45006':'000000'));

	pg.connect(pgConStr, function(err, client, don){
		if(err){
			return console.error('error fetching client from pool', err);
		}
		var keynm = TAG+"list_map_wf_list_"+ne+"_"+sw+"_";
		redis.get(keynm, function(err, reply){

			if(reply && reply!=null){
				res.json(JSON.parse(reply));
			}else{
				client.query("select  \
							x.lat, x.lng, x.optrcom, COALESCE(a.addr, '-') as addr, id, x.sesscnt, pausecnt, pausetime, stfail, usrcnt, tp, rxbytes, badness  \
							from (  \
							 SELECT \
							  l.lat, \
							  l.lng, \
							  a.optrcom, min(a.bssid) as id, sum(l.sesscnt) as sesscnt, \
							  CASE WHEN sum(l.playtime) = 0 THEN 0 ELSE  sum(l.pausecnt) :: FLOAT / sum(l.playtime) * 3600  END AS pausecnt, \
							  CASE WHEN sum(l.sesscnt) = 0 THEN 0 ELSE sum(l.stfail) :: FLOAT / sum(l.sesscnt) END  AS stfail, \
							  sum(l.wfrxbytes) :: FLOAT * 8 / CASE WHEN sum(l.wfduration) = 0 THEN 1 ELSE sum(l.wfduration) END / 1000000 AS tp, \
							  sum(l.wfrxbytes) / 1024 / 1024 / 111 :: FLOAT  AS rxbytes, \
							  CASE WHEN sum(playtime) = 0 THEN 0 ELSE  sum(l.pausetime) :: FLOAT / sum(l.playtime) * 3600 end AS pausetime, \
							  sum(l.usrcnt)  AS usrcnt, \
							  case when (sum(b.stfail)+sum(b.dronst)+sum(b.largepc)+sum(b.smallpc))=0 then 0 else (sum(b.stfail)+sum(b.dronst)+sum(b.largepc))::float/(sum(b.stfail)+sum(b.dronst)+sum(b.largepc)+sum(b.smallpc))*100 * (((sum(b.usrcnt)/2)^2*(sum(b.sesscnt)/5)^2)/((1+(sum(b.usrcnt)/2)^2)*(1+(sum(b.sesscnt)/5)^2))) end as badness \
							FROM bssidux l, bssidux_badness b , apinfo a \
							WHERE 1 = 1 and l.lat=b.lat and l.lng=b.lng and l.bssid=b.bssid and a.bssid = l.bssid \
							and l.lat < $1 AND l.lat > $2 AND l.lng < $3 AND l.lng > $4 \
							GROUP BY l.lat, l.lng,a.optrcom   having sum(l.pausetime) <= sum(l.playtime) and sum(l.usrcnt) > 0\
							) x left join (select distinct(lat||''||lng), lat, lng, addr from ktwfloc_addr) a on x.lat = a.lat and x.lng = a.lng" ,[ne.split(',')[0], sw.split(',')[0], ne.split(',')[1], sw.split(',')[1] ], function(err, result){

					if(err){
						return console.error('error running query', err);
					}
					result.rows.forEach(function(d){

						geojson.features.push({'geometry':{'type':'Point', 'coordinates':[parseFloat(d.lng), parseFloat(d.lat)]}, 
							'type':'Feature','properties':{'optrcom':d.optrcom, 'id':d.id, 'addr':d.addr, 'pausecnt':parseFloat(d.pausecnt),'pausetime':parseFloat(d.pausetime), 'stfail':parseFloat(d.stfail), 'tp':parseFloat(d.tp),'rxbytes':parseFloat(d.rxbytes),'usrcnt':parseInt(d.usrcnt) ,'sesscnt':parseInt(d.sesscnt),'badness':parseFloat(d.badness) } });	
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

exports.map_cell_detail = function(req, res){
	var geojson = {'type':'FeatureCollection', 'features':[],"properties":{ "description":"Airplug, 2015 inc" }}
	var ne = req.param('ne', 0.0);
	var sw = req.param('sw', 0.0);
	// var optrcom = req.param('optrcom', 'KT');
	// var keynm = TAG+"list_map_wf_list_"+ne+"_"+sw+"_";
	// var plmnid = getPlmnid(optrcom);

	pg.connect(pgConStr, function(err, client, don){
		if(err){
			return console.error('error fetching client from pool', err);
		}
		var keynm = TAG+"map_cell_detail_"+ne+"_"+sw+"_";
		redis.get(keynm, function(err, reply){

			if(reply && reply!=null){
				res.json(JSON.parse(reply));
			}else{
				client.query("select c.lat, c.lng, split_part(c.fullid, '_', 1)  as optrcom, c.fullid as id,  \
					    case when sum(c.playtime)=0 then 0 else sum(c.pausecnt)::float/sum(c.playtime)*3600  end as pausecnt, \
							CASE WHEN sum(l.sesscnt) = 0 THEN 0 ELSE sum(l.stfail) :: FLOAT / sum(l.sesscnt) END  AS stfail, \
							case when sum(c.cellduration)=0 then 0 else sum(c.cellrxbytes)::float*8/sum(c.cellduration) end/1000000 as tp, sum(c.cellrxbytes)/1024/1024/111::float as rxbytes,  \
							case when sum(c.playtime)=0 then 0 else sum(c.pausetime)::float/sum(c.playtime)*3600 end as pausetime, \
							sum(c.usrcnt) as usrcnt, sum(c.sesscnt) as sesscnt, \
							case when (sum(b.stfail)+sum(b.dronst)+sum(b.largepc)+sum(b.smallpc))=0 then 0 else (sum(b.stfail)+sum(b.dronst)+sum(b.largepc))::float/(sum(b.stfail)+sum(b.dronst)+sum(b.largepc)+sum(b.smallpc))*100 * (((sum(b.usrcnt)/2)^2*(sum(b.sesscnt)/5)^2)/((1+(sum(b.usrcnt)/2)^2)*(1+(sum(b.sesscnt)/5)^2))) end as badness \
							from cellidux c, cellidux_badness b  where 1=1 and c.lat = b.lat and c.lng = b.lng  \
							AND c.lat < $1 AND c.lat > $2 AND c.lng < $3 AND c.lng > $4 \
							group by c.lat, c.lng, split_part(c.fullid, '_', 1), c.fullid  having sum(c.pausetime) <= sum(c.playtime) ",[ ne.split(',')[0], sw.split(',')[0], ne.split(',')[1], sw.split(',')[1]], function(err, result){
					// done()
					if(err){
						return console.error('error running query', err);
					}
					// console.log('result length is ', result.rows);
					var i=0;
					result.rows.forEach(function(d){

						geojson.features.push({'geometry':{'type':'Point', 'coordinates':[parseFloat(d.lng), parseFloat(d.lat)]}, 
							'type':'Feature','properties':{'optrcom':getPlmnid(d.optrcom), 'id':d.id, 'pausecnt':parseFloat(d.pausecnt),'stfail':parseFloat(d.stfail),'pausetime':parseFloat(d.pausetime),'tp':parseFloat(d.tp),'rxbytes':parseFloat(d.rxbytes),'usrcnt':parseFloat(d.usrcnt),'sesscnt':parseFloat(d.sesscnt),'badness':parseFloat(d.badness) } });	
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

exports.map_lte_detail = function(req, res){
	var geojson = {'type':'FeatureCollection', 'features':[],"properties":{ "description":"Airplug, 2015 inc" }}
	var ne = req.param('ne', 0.0);
	var sw = req.param('sw', 0.0);
	// var optrcom = req.param('optrcom', 'KT');
	// var keynm = TAG+"list_map_wf_list_"+ne+"_"+sw+"_";
	// var plmnid = getPlmnid(optrcom);

	pg.connect(pgConStr, function(err, client, don){
		if(err){
			return console.error('error fetching client from pool', err);
		}
		var keynm = TAG+"map_lte_detail_"+ne+"_"+sw+"_";
		redis.get(keynm, function(err, reply){

			if(reply && reply!=null){
				res.json(JSON.parse(reply));
			}else{
				client.query("select c.lat, c.lng, split_part(c.fullid, '_', 1)  as optrcom, c.fullid as id,  case when sum(c.playtime)=0 then 0 else sum(c.pausecnt)::float/sum(c.playtime) end*3600 as pausecnt, \
							case when sum(c.sesscnt)=0 then 0 else sum(c.stfail)::float/sum(c.sesscnt) end as stfail,  \
							case when sum(c.cellduration)=0 then 0 else sum(c.cellrxbytes)::float*8/sum(c.cellduration) end/1000000 as tp, sum(c.cellrxbytes)/1024/1024/111::float as rxbytes,  \
							case when sum(c.playtime)=0 then 0 else sum(c.pausetime)::float/sum(c.playtime) end*3600 as pausetime, sum(c.usrcnt) as usrcnt, sum(c.sesscnt) as sesscnt, \
							case when (sum(b.stfail)+sum(b.dronst)+sum(b.largepc)+sum(b.smallpc))=0 then 0 else (sum(b.stfail)+sum(b.dronst)+sum(b.largepc))::float/(sum(b.stfail)+sum(b.dronst)+sum(b.largepc)+sum(b.smallpc))*100 * (((sum(b.usrcnt)/2)^2*(sum(b.sesscnt)/5)^2)/((1+(sum(b.usrcnt)/2)^2)*(1+(sum(b.sesscnt)/5)^2))) end as badness \
							from lteidux c, lteidux_badness b  where 1=1 and c.lat = b.lat and c.lng = b.lng  \
							AND c.lat < $1 AND c.lat > $2 AND c.lng < $3 AND c.lng > $4 \
							group by c.lat, c.lng, split_part(c.fullid, '_', 1), c.fullid  having sum(c.pausetime) <= sum(c.playtime) ",[ ne.split(',')[0], sw.split(',')[0], ne.split(',')[1], sw.split(',')[1]], function(err, result){
					// done()
					if(err){
						return console.error('error running query', err);
					}
					// console.log('result length is ', result.rows);
					var i=0;
					result.rows.forEach(function(d){

						geojson.features.push({'geometry':{'type':'Point', 'coordinates':[parseFloat(d.lng), parseFloat(d.lat)]}, 
							'type':'Feature','properties':{'optrcom':getPlmnid(d.optrcom), 'id':d.id, 'pausecnt':parseFloat(d.pausecnt),'stfail':parseFloat(d.stfail),'pausetime':parseFloat(d.pausetime),'tp':parseFloat(d.tp),'rxbytes':parseFloat(d.rxbytes),'usrcnt':parseFloat(d.usrcnt),'sesscnt':parseFloat(d.sesscnt),'badness':parseFloat(d.badness) } });	
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


exports.map_wf_detail = function(req, res){
	var geojson = {'type':'FeatureCollection', 'features':[],"properties":{ "description":"Airplug, 2015 inc" }}
	var ne = req.param('ne', 0.0);
	var sw = req.param('sw', 0.0);
	// var optrcom = req.param('optrcom', 'KT');
	// var keynm = TAG+"map_wf_detail_"+ne+"_"+sw+"_"+optrcom;

	pg.connect(pgConStr, function(err, client, don){
		if(err){
			return console.error('error fetching client from pool', err);
		}
		var keynm = TAG+"map_wf_detail_"+ne+"_"+sw+"_";
		redis.get(keynm, function(err, reply){

			if(reply && reply!=null){
				res.json(JSON.parse(reply));
			}else{
				client.query("select c.lat, c.lng, a.optrcom , c.bssid as id, case when sum(c.playtime)=0 then 0 else sum(c.pausecnt)::float/sum(c.playtime) end*3600 as pausecnt,  \
							case when sum(c.sesscnt)=0 then 0 else sum(c.stfail)::float/sum(c.sesscnt) end as stfail,  \
							case when sum(c.wfduration)=0 then 0 else sum(c.wfrxbytes)::float*8/sum(c.wfduration)/1000000 end as tp, \
							sum(c.wfrxbytes)/1024/1024/datediff('day','2015-01-01',sysdate)::float as rxbytes,  \
							case when sum(c.playtime)=0 then 0 else sum(c.pausetime)::float/sum(c.playtime) end*3600 as pausetime, sum(c.usrcnt) as usrcnt, sum(c.sesscnt) as sesscnt , \
							case when (sum(b.stfail)+sum(b.dronst)+sum(b.largepc)+sum(b.smallpc))=0 then 0 else (sum(b.stfail)+sum(b.dronst)+sum(b.largepc))::float/(sum(b.stfail)+sum(b.dronst)+sum(b.largepc)+sum(b.smallpc))*100 * (((sum(b.usrcnt)/2)^2*(sum(b.sesscnt)/5)^2)/((1+(sum(b.usrcnt)/2)^2)*(1+(sum(b.sesscnt)/5)^2))) end as badness \
							from bssidux c, bssidux_badness b, apinfo a where 1=1 and c.lat=b.lat and c.lng=b.lng  and a.bssid=c.bssid \
							AND c.lat < $1 AND c.lat > $2 AND c.lng < $3 AND c.lng > $4 \
							group by c.lat, c.lng, a.optrcom, c.bssid having sum(c.pausetime) <= sum(c.playtime) " ,[ne.split(',')[0], sw.split(',')[0], ne.split(',')[1], sw.split(',')[1] ], function(err, result){
					if(err){
						return console.error('error running query', err);
					}
					var i=0;
					result.rows.forEach(function(d){
						geojson.features.push({'geometry':{'type':'Point', 'coordinates':[parseFloat(d.lng), parseFloat(d.lat)]}, 
							'type':'Feature','properties':{'type':d.optrcom, 'id':d.id, 'pausecnt':parseFloat(d.pausecnt),'stfail':parseFloat(d.stfail),'pausetime':parseFloat(d.pausetime),'tp':parseFloat(d.tp),'rxbytes':parseFloat(d.rxbytes),'usrcnt':parseFloat(d.usrcnt),'sesscnt':parseFloat(d.sesscnt),'badness':parseFloat(d.badness) } });	
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


exports.bubble_cell_list = function(req, res){
	var geojson = {'wf':[], 'cell':[]};
	var ne = req.param('ne', 0.0);
	var sw = req.param('sw', 0.0);
	// var optrcom = req.param('optrcom', 'KT');
	// var plmnid = getPlmnid(optrcom);

	pg.connect(pgConStr, function(err, client, don){
		if(err){
			return console.error('error fetching client from pool', err);
		}
		var keys = TAG+"bubble_cell_list_"+ne+"_"+sw+"_";
		redis.get(keys, function(err, reply){
			// console.error('redis err' , err);
			console.log('redis reply ', reply);
			if(reply && reply!=null){
				res.json(JSON.parse(reply));
			}else{
				// console.log([ ne.split(',')[0], sw.split(',')[0], ne.split(',')[1], sw.split(',')[1] ]);
				client.query("select 'DoW' as type, b.optrcom, a.todow  as gubun, COALESCE(b.usrcnt, 0) as usrcnt, COALESCE(b.pausecnt, 0) as pausecnt , COALESCE(b.pausetime, 0) as pausetime, COALESCE(b.stfail,0) as stfail, COALESCE(b.tp,0) as tp, COALESCE(b.rxbytes,0) as rxbytes, COALESCE(b.badness, 0) as badness from sktdemo_dow_master a left join (\
							select split_part(c.fullid, '_', 1)  as optrcom, c.todow, sum(c.usrcnt) as usrcnt, case when sum(c.playtime)=0 then 0 else sum(c.pausecnt)::float/sum(c.playtime) end*3600 as pausecnt,\
							case when sum(c.sesscnt)=0 then 0 else sum(c.stfail)::float/sum(c.sesscnt) end as stfail,\
							case when sum(c.cellduration)=0 then 0 else sum(c.cellrxbytes)::float*8/sum(c.cellduration) end/1000000 as tp, sum(c.cellrxbytes)/1024/1024/111::float as rxbytes,\
							case when sum(c.playtime)=0 then 0 else sum(c.pausetime)::float/sum(c.playtime) end*3600 as pausetime,\
							case when (sum(b.stfail)+sum(b.dronst)+sum(b.largepc)+sum(b.smallpc))=0 then 0 else (sum(b.stfail)+sum(b.dronst)+sum(b.largepc))::float/(sum(b.stfail)+sum(b.dronst)+sum(b.largepc)+sum(b.smallpc))*100 * (((sum(b.usrcnt)/2)^2*(sum(b.sesscnt)/5)^2)/((1+(sum(b.usrcnt)/2)^2)*(1+(sum(b.sesscnt)/5)^2))) end as badness \
							from cellidux_dow c, cellidux_badness_dow b  where 1=1 and c.lat = b.lat and c.lng = b.lng and c.fullid=b.fullid and c.todow=b.todow\
							AND c.lat < $1 AND c.lat > $2 AND c.lng < $3 AND c.lng > $4\
							group by split_part(c.fullid, '_', 1), c.todow  having sum(c.pausetime) <= sum(c.playtime) order by 1 ) b on a.todow = b.todow\
							union all\
							select 'ToD' as type, b.optrcom, a.todow  as gubun, COALESCE(b.usrcnt, 0) as usrcnt, COALESCE(b.pausecnt, 0) as pausecnt , COALESCE(b.pausetime, 0) as pausetime, COALESCE(b.stfail,0) as stfail, COALESCE(b.tp,0) as tp, COALESCE(b.rxbytes,0) as rxbytes, COALESCE(b.badness, 0) as badness from sktdemo_todow_master a left join (\
							select split_part(c.fullid, '_', 1)  as optrcom, c.todow, sum(c.usrcnt) as usrcnt, case when sum(c.playtime)=0 then 0 else sum(c.pausecnt)::float/sum(c.playtime) end*3600 as pausecnt,\
							case when sum(c.sesscnt)=0 then 0 else sum(c.stfail)::float/sum(c.sesscnt) end as stfail,\
							case when sum(c.cellduration)=0 then 0 else sum(c.cellrxbytes)::float*8/sum(c.cellduration) end/1000000 as tp, sum(c.cellrxbytes)/1024/1024/111::float as rxbytes,\
							case when sum(c.playtime)=0 then 0 else sum(c.pausetime)::float/sum(c.playtime) end*3600 as pausetime,\
							case when (sum(b.stfail)+sum(b.dronst)+sum(b.largepc)+sum(b.smallpc))=0 then 0 else (sum(b.stfail)+sum(b.dronst)+sum(b.largepc))::float/(sum(b.stfail)+sum(b.dronst)+sum(b.largepc)+sum(b.smallpc))*100 * (((sum(b.usrcnt)/2)^2*(sum(b.sesscnt)/5)^2)/((1+(sum(b.usrcnt)/2)^2)*(1+(sum(b.sesscnt)/5)^2))) end as badness \
							from cellidux_todow c, cellidux_badness_todow b  where 1=1 and c.lat = b.lat and c.lng = b.lng and c.fullid=b.fullid and c.todow=b.todow\
							AND c.lat < $1 AND c.lat > $2 AND c.lng < $3 AND c.lng > $4\
							group by split_part(c.fullid, '_', 1), c.todow  having sum(c.pausetime) <= sum(c.playtime) order by 1 ) b on a.todow = b.todow\
							union ALL\
							select 'Model' as type, split_part(c.fullid, '_', 1)  as optrcom, c.model, sum(c.usrcnt) as usrcnt, case when sum(c.playtime)=0 then 0 else sum(c.pausecnt)::float/sum(c.playtime) end*3600 as pausecnt,\
							case when sum(c.sesscnt)=0 then 0 else sum(c.stfail)::float/sum(c.sesscnt) end as stfail,\
							case when sum(c.cellduration)=0 then 0 else sum(c.cellrxbytes)::float*8/sum(c.cellduration) end/1000000 as tp, sum(c.cellrxbytes)/1024/1024/111::float as rxbytes,\
							case when sum(c.playtime)=0 then 0 else sum(c.pausetime)::float/sum(c.playtime) end*3600 as pausetime,\
							case when (sum(b.stfail)+sum(b.dronst)+sum(b.largepc)+sum(b.smallpc))=0 then 0 else (sum(b.stfail)+sum(b.dronst)+sum(b.largepc))::float/(sum(b.stfail)+sum(b.dronst)+sum(b.largepc)+sum(b.smallpc))*100 * (((sum(b.usrcnt)/2)^2*(sum(b.sesscnt)/5)^2)/((1+(sum(b.usrcnt)/2)^2)*(1+(sum(b.sesscnt)/5)^2))) end as badness \
							from cellidux_dev c, cellidux_badness_dev b\
							where 1=1 and c.lat = b.lat and c.lng = b.lng and b.brand=c.brand and b.model=c.model\
							AND c.lat < $1 AND c.lat > $2 AND c.lng < $3 AND c.lng > $4	\
							group by split_part(c.fullid, '_', 1), c.model having sum(c.pausetime) <= sum(c.playtime) \
							union ALL\
							select 'OS',split_part(c.fullid, '_', 1)  as optrcom, c.osver, sum(c.usrcnt) as usrcnt, case when sum(c.playtime)=0 then 0 else sum(c.pausecnt)::float/sum(c.playtime) end*3600 as pausecnt,\
							case when sum(c.sesscnt)=0 then 0 else sum(c.stfail)::float/sum(c.sesscnt) end as stfail,\
							case when sum(c.cellduration)=0 then 0 else sum(c.cellrxbytes)::float*8/sum(c.cellduration) end/1000000 as tp, sum(c.cellrxbytes)/1024/1024/111::float as rxbytes,\
							case when sum(c.playtime)=0 then 0 else sum(c.pausetime)::float/sum(c.playtime) end*3600 as pausetime,\
							case when (sum(b.stfail)+sum(b.dronst)+sum(b.largepc)+sum(b.smallpc))=0 then 0 else (sum(b.stfail)+sum(b.dronst)+sum(b.largepc))::float/(sum(b.stfail)+sum(b.dronst)+sum(b.largepc)+sum(b.smallpc))*100 * (((sum(b.usrcnt)/2)^2*(sum(b.sesscnt)/5)^2)/((1+(sum(b.usrcnt)/2)^2)*(1+(sum(b.sesscnt)/5)^2))) end as badness \
							from cellidux_os c, cellidux_badness_os b\
							where 1=1 and c.lat = b.lat and c.lng = b.lng and b.osver=c.osver\
							AND c.lat < $1 AND c.lat > $2 AND c.lng < $3 AND c.lng > $4\
							group by split_part(c.fullid, '_', 1), c.osver having sum(c.pausetime) <= sum(c.playtime) \
							union ALL\
							select 'IDs',split_part(c.fullid, '_', 1)  as optrcom, c.fullid, sum(c.usrcnt) as usrcnt, case when sum(c.playtime)=0 then 0 else sum(c.pausecnt)::float/sum(c.playtime) end*3600 as pausecnt,\
							case when sum(c.sesscnt)=0 then 0 else sum(c.stfail)::float/sum(c.sesscnt) end as stfail,\
							case when sum(c.cellduration)=0 then 0 else sum(c.cellrxbytes)::float*8/sum(c.cellduration) end/1000000 as tp, sum(c.cellrxbytes)/1024/1024/111::float as rxbytes,\
							case when sum(c.playtime)=0 then 0 else sum(c.pausetime)::float/sum(c.playtime) end*3600 as pausetime,\
							case when (sum(b.stfail)+sum(b.dronst)+sum(b.largepc)+sum(b.smallpc))=0 then 0 else (sum(b.stfail)+sum(b.dronst)+sum(b.largepc))::float/(sum(b.stfail)+sum(b.dronst)+sum(b.largepc)+sum(b.smallpc))*100 * (((sum(b.usrcnt)/2)^2*(sum(b.sesscnt)/5)^2)/((1+(sum(b.usrcnt)/2)^2)*(1+(sum(b.sesscnt)/5)^2))) end as badness \
							from cellidux_os c, cellidux_badness_os b\
							where 1=1 and c.lat = b.lat and c.lng = b.lng and b.osver=c.osver\
							AND c.lat < $1 AND c.lat > $2 AND c.lng < $3 AND c.lng > $4\
							group by split_part(c.fullid, '_', 1), c.fullid having sum(c.pausetime) <= sum(c.playtime) " ,
				[ ne.split(',')[0], sw.split(',')[0], ne.split(',')[1], sw.split(',')[1] ], function(err, result){
					if(err){
						return console.error('error running query', err);
					}
					result.rows.forEach(function(d){
							geojson.cell.push({'type':d.type, 'optrcom':getPlmnid(d.optrcom), 'gubun':d.gubun, 'pausecnt':d.pausecnt, 'pausetime':d.pausetime,'stfail':d.stfail, 'usrcnt':d.usrcnt ,'tp':parseFloat(d.tp),'rxbytes':parseFloat(d.rxbytes),'badness':parseFloat(d.badness) })
					});					
					var vvv = JSON.stringify(geojson);
					redis.set(keys, JSON.stringify(geojson));
					client.end();
					res.json(JSON.parse(vvv));
				});
			}
		});
	});
}

exports.bubble_lte_list = function(req, res){
	var geojson = {'wf':[], 'cell':[], 'lte':[]};
	var ne = req.param('ne', 0.0);
	var sw = req.param('sw', 0.0);
	// var optrcom = req.param('optrcom', 'KT');
	// var plmnid = getPlmnid(optrcom);

	pg.connect(pgConStr, function(err, client, don){
		if(err){
			return console.error('error fetching client from pool', err);
		}
		var keys = TAG+"bubble_lte_list_"+ne+"_"+sw+"_";
		redis.get(keys, function(err, reply){
			// console.error('redis err' , err);
			console.log('redis reply ', reply);
			if(reply && reply!=null){
				res.json(JSON.parse(reply));
			}else{
				// console.log([ ne.split(',')[0], sw.split(',')[0], ne.split(',')[1], sw.split(',')[1] ]);
				client.query("select 'DoW' as type, b.optrcom, a.todow  as gubun, COALESCE(b.usrcnt, 0) as usrcnt, COALESCE(b.pausecnt, 0) as pausecnt , COALESCE(b.pausetime, 0) as pausetime, COALESCE(b.stfail,0) as stfail, COALESCE(b.tp,0) as tp, COALESCE(b.rxbytes,0) as rxbytes, COALESCE(b.badness, 0) as badness from sktdemo_dow_master a left join (\
							select split_part(c.fullid, '_', 1)  as optrcom, c.todow, sum(c.usrcnt) as usrcnt, case when sum(c.playtime)=0 then 0 else sum(c.pausecnt)::float/sum(c.playtime) end*3600 as pausecnt,\
							case when sum(c.sesscnt)=0 then 0 else sum(c.stfail)::float/sum(c.sesscnt) end as stfail,\
							case when sum(c.cellduration)=0 then 0 else sum(c.cellrxbytes)::float*8/sum(c.cellduration) end/1000000 as tp, sum(c.cellrxbytes)/1024/1024/111::float as rxbytes,\
							case when sum(c.playtime)=0 then 0 else sum(c.pausetime)::float/sum(c.playtime) end*3600 as pausetime,\
							case when (sum(b.stfail)+sum(b.dronst)+sum(b.largepc)+sum(b.smallpc))=0 then 0 else (sum(b.stfail)+sum(b.dronst)+sum(b.largepc))::float/(sum(b.stfail)+sum(b.dronst)+sum(b.largepc)+sum(b.smallpc))*100 * (((sum(b.usrcnt)/2)^2*(sum(b.sesscnt)/5)^2)/((1+(sum(b.usrcnt)/2)^2)*(1+(sum(b.sesscnt)/5)^2))) end as badness \
							from lteidux_dow c, lteidux_badness_dow b  where 1=1 and c.lat = b.lat and c.lng = b.lng and c.fullid=b.fullid and c.todow=b.todow\
							AND c.lat < $1 AND c.lat > $2 AND c.lng < $3 AND c.lng > $4\
							group by split_part(c.fullid, '_', 1), c.todow  having sum(c.pausetime) <= sum(c.playtime) order by 1 ) b on a.todow = b.todow\
							union all\
							select 'ToD' as type, b.optrcom, a.todow  as gubun, COALESCE(b.usrcnt, 0) as usrcnt, COALESCE(b.pausecnt, 0) as pausecnt , COALESCE(b.pausetime, 0) as pausetime, COALESCE(b.stfail,0) as stfail, COALESCE(b.tp,0) as tp, COALESCE(b.rxbytes,0) as rxbytes, COALESCE(b.badness, 0) as badness from sktdemo_todow_master a left join (\
							select split_part(c.fullid, '_', 1)  as optrcom, c.todow, sum(c.usrcnt) as usrcnt, case when sum(c.playtime)=0 then 0 else sum(c.pausecnt)::float/sum(c.playtime) end*3600 as pausecnt,\
							case when sum(c.sesscnt)=0 then 0 else sum(c.stfail)::float/sum(c.sesscnt) end as stfail,\
							case when sum(c.cellduration)=0 then 0 else sum(c.cellrxbytes)::float*8/sum(c.cellduration) end/1000000 as tp, sum(c.cellrxbytes)/1024/1024/111::float as rxbytes,\
							case when sum(c.playtime)=0 then 0 else sum(c.pausetime)::float/sum(c.playtime) end*3600 as pausetime,\
							case when (sum(b.stfail)+sum(b.dronst)+sum(b.largepc)+sum(b.smallpc))=0 then 0 else (sum(b.stfail)+sum(b.dronst)+sum(b.largepc))::float/(sum(b.stfail)+sum(b.dronst)+sum(b.largepc)+sum(b.smallpc))*100 * (((sum(b.usrcnt)/2)^2*(sum(b.sesscnt)/5)^2)/((1+(sum(b.usrcnt)/2)^2)*(1+(sum(b.sesscnt)/5)^2))) end as badness\
							from lteidux_todow c, lteidux_badness_todow b  where 1=1 and c.lat = b.lat and c.lng = b.lng and c.fullid=b.fullid and c.todow=b.todow\
							AND c.lat < $1 AND c.lat > $2 AND c.lng < $3 AND c.lng > $4\
							group by split_part(c.fullid, '_', 1), c.todow  having sum(c.pausetime) <= sum(c.playtime) order by 1 ) b on a.todow = b.todow\
							union ALL\
							select 'Model' as type, split_part(c.fullid, '_', 1)  as optrcom, c.model, sum(c.usrcnt) as usrcnt, case when sum(c.playtime)=0 then 0 else sum(c.pausecnt)::float/sum(c.playtime) end*3600 as pausecnt,\
							case when sum(c.sesscnt)=0 then 0 else sum(c.stfail)::float/sum(c.sesscnt) end as stfail,\
							case when sum(c.cellduration)=0 then 0 else sum(c.cellrxbytes)::float*8/sum(c.cellduration) end/1000000 as tp, sum(c.cellrxbytes)/1024/1024/111::float as rxbytes,\
							case when sum(c.playtime)=0 then 0 else sum(c.pausetime)::float/sum(c.playtime) end*3600 as pausetime,\
							case when (sum(b.stfail)+sum(b.dronst)+sum(b.largepc)+sum(b.smallpc))=0 then 0 else (sum(b.stfail)+sum(b.dronst)+sum(b.largepc))::float/(sum(b.stfail)+sum(b.dronst)+sum(b.largepc)+sum(b.smallpc))*100 * (((sum(b.usrcnt)/2)^2*(sum(b.sesscnt)/5)^2)/((1+(sum(b.usrcnt)/2)^2)*(1+(sum(b.sesscnt)/5)^2))) end as badness\
							from lteidux_dev c, lteidux_badness_dev b\
							where 1=1 and c.lat = b.lat and c.lng = b.lng and b.brand=c.brand and b.model=c.model\
							AND c.lat < $1 AND c.lat > $2 AND c.lng < $3 AND c.lng > $4	\
							group by split_part(c.fullid, '_', 1), c.model having sum(c.pausetime) <= sum(c.playtime) \
							union ALL\
							select 'OS',split_part(c.fullid, '_', 1)  as optrcom, c.osver, sum(c.usrcnt) as usrcnt, case when sum(c.playtime)=0 then 0 else sum(c.pausecnt)::float/sum(c.playtime) end*3600 as pausecnt,\
							case when sum(c.sesscnt)=0 then 0 else sum(c.stfail)::float/sum(c.sesscnt) end as stfail,\
							case when sum(c.cellduration)=0 then 0 else sum(c.cellrxbytes)::float*8/sum(c.cellduration) end/1000000 as tp, sum(c.cellrxbytes)/1024/1024/111::float as rxbytes,\
							case when sum(c.playtime)=0 then 0 else sum(c.pausetime)::float/sum(c.playtime) end*3600 as pausetime,\
							case when (sum(b.stfail)+sum(b.dronst)+sum(b.largepc)+sum(b.smallpc))=0 then 0 else (sum(b.stfail)+sum(b.dronst)+sum(b.largepc))::float/(sum(b.stfail)+sum(b.dronst)+sum(b.largepc)+sum(b.smallpc))*100 * (((sum(b.usrcnt)/2)^2*(sum(b.sesscnt)/5)^2)/((1+(sum(b.usrcnt)/2)^2)*(1+(sum(b.sesscnt)/5)^2))) end as badness\
							from lteidux_os c, lteidux_badness_os b\
							where 1=1 and c.lat = b.lat and c.lng = b.lng and b.osver=c.osver\
							AND c.lat < $1 AND c.lat > $2 AND c.lng < $3 AND c.lng > $4\
							group by split_part(c.fullid, '_', 1), c.osver having sum(c.pausetime) <= sum(c.playtime) \
							union ALL\
							select 'IDs',split_part(c.fullid, '_', 1)  as optrcom, c.fullid, sum(c.usrcnt) as usrcnt, case when sum(c.playtime)=0 then 0 else sum(c.pausecnt)::float/sum(c.playtime) end*3600 as pausecnt,\
							case when sum(c.sesscnt)=0 then 0 else sum(c.stfail)::float/sum(c.sesscnt) end as stfail,\
							case when sum(c.cellduration)=0 then 0 else sum(c.cellrxbytes)::float*8/sum(c.cellduration) end/1000000 as tp, sum(c.cellrxbytes)/1024/1024/111::float as rxbytes,\
							case when sum(c.playtime)=0 then 0 else sum(c.pausetime)::float/sum(c.playtime) end*3600 as pausetime,\
							case when (sum(b.stfail)+sum(b.dronst)+sum(b.largepc)+sum(b.smallpc))=0 then 0 else (sum(b.stfail)+sum(b.dronst)+sum(b.largepc))::float/(sum(b.stfail)+sum(b.dronst)+sum(b.largepc)+sum(b.smallpc))*100 * (((sum(b.usrcnt)/2)^2*(sum(b.sesscnt)/5)^2)/((1+(sum(b.usrcnt)/2)^2)*(1+(sum(b.sesscnt)/5)^2))) end as badness\
							from lteidux_os c, lteidux_badness_os b\
							where 1=1 and c.lat = b.lat and c.lng = b.lng and b.osver=c.osver\
							AND c.lat < $1 AND c.lat > $2 AND c.lng < $3 AND c.lng > $4\
							group by split_part(c.fullid, '_', 1), c.fullid having sum(c.pausetime) <= sum(c.playtime) " ,
				[ ne.split(',')[0], sw.split(',')[0], ne.split(',')[1], sw.split(',')[1] ], function(err, result){
					if(err){
						return console.error('error running query', err);
					}
					result.rows.forEach(function(d){
							geojson.lte.push({'type':d.type, 'optrcom':getPlmnid(d.optrcom), 'gubun':d.gubun, 'pausecnt':d.pausecnt, 'pausetime':d.pausetime,'stfail':d.stfail, 'usrcnt':d.usrcnt ,'tp':parseFloat(d.tp),'rxbytes':parseFloat(d.rxbytes),'badness':parseFloat(d.badness) })
					});					
					var vvv = JSON.stringify(geojson);
					redis.set(keys, JSON.stringify(geojson));
					client.end();
					res.json(JSON.parse(vvv));
				});
			}
		});
	});
}


exports.bubble_wf_list = function(req, res){
	var geojson = {'wf':[], 'cell':[]};
	var ne = req.param('ne', 0.0);
	var sw = req.param('sw', 0.0);
	var optrcom = req.param('optrcom', 'KT');
	// var plmnid = getPlmnid(optrcom);

	pg.connect(pgConStr, function(err, client, don){
		if(err){
			return console.error('error fetching client from pool', err);
		}
		var keys = TAG+"bubble_wf_list_"+ne+"_"+sw+"_"+optrcom;
		redis.get(keys, function(err, reply){
			// console.error('redis err' , err);
			console.log('redis reply ', reply);
			if(reply && reply!=null){
				res.json(JSON.parse(reply));
			}else{
				// console.log([ ne.split(',')[0], sw.split(',')[0], ne.split(',')[1], sw.split(',')[1] ]);
				client.query("select 'ToD' as type, b.optrcom, a.todow as gubun, COALESCE(b.usrcnt, 0) as usrcnt, COALESCE(b.pausecnt, 0) as pausecnt, COALESCE(b.pausetime, 0) as pausetime, COALESCE(b.stfail,0) as stfail, COALESCE(b.tp,0) as tp, COALESCE(b.rxbytes,0) as rxbytes, COALESCE(b.badness, 0) as badness from sktdemo_todow_master a left join ( \
					select a.optrcom, c.todow, sum(c.usrcnt) as usrcnt, case when sum(c.playtime)=0 then 0 else sum(c.pausecnt)::float/sum(c.playtime) end*3600 as pausecnt,  \
					case when sum(c.sesscnt)=0 then 0 else sum(c.stfail)::float/sum(c.sesscnt) end as stfail,  \
					case when sum(c.wfduration)=0 then 1 else sum(c.wfrxbytes)::float*8/sum(c.wfduration)/1000000 end as tp, sum(c.wfrxbytes)/1024/1024/111::float as rxbytes,  \
					case when sum(c.playtime)=0 then 0 else sum(c.pausetime)::float/sum(c.playtime) end*3600 as pausetime ,\
					case when (sum(b.stfail)+sum(b.dronst)+sum(b.largepc)+sum(b.smallpc))=0 then 0 else (sum(b.stfail)+sum(b.dronst)+sum(b.largepc))::float/(sum(b.stfail)+sum(b.dronst)+sum(b.largepc)+sum(b.smallpc))*100 * (((sum(b.usrcnt)/2)^2*(sum(b.sesscnt)/5)^2)/((1+(sum(b.usrcnt)/2)^2)*(1+(sum(b.sesscnt)/5)^2))) end as badness \
					from bssidux_todow c, bssidux_badness_todow b, apinfo a where 1=1 and c.lat=b.lat and c.lng=b.lng and c.bssid=b.bssid and c.todow=b.todow and a.bssid=c.bssid  \
					AND c.lat < $1 AND c.lat > $2 AND c.lng < $3 AND c.lng > $4					\
					group by a.optrcom, c.todow  having sum(c.pausetime) <= sum(c.playtime) order by 1 ) b on a.todow = b.todow\
					union ALL\
					select 'Model',  a.optrcom, c.model, sum(c.usrcnt) as usrcnt, case when sum(c.playtime)=0 then 0 else sum(c.pausecnt)::float/sum(c.playtime) end*3600 as pausecnt,\
					case when sum(c.sesscnt)=0 then 0 else sum(c.stfail)::float/sum(c.sesscnt) end as stfail,\
					case when sum(c.wfduration)=0 then 1 else sum(c.wfrxbytes)::float*8/sum(c.wfduration)/1000000 end as tp, sum(c.wfrxbytes)/1024/1024/111::float as rxbytes,\
					case when sum(c.playtime)=0 then 0 else sum(c.pausetime)::float/sum(c.playtime) end*3600 as pausetime,\
					case when (sum(b.stfail)+sum(b.dronst)+sum(b.largepc)+sum(b.smallpc))=0 then 0 else (sum(b.stfail)+sum(b.dronst)+sum(b.largepc))::float/(sum(b.stfail)+sum(b.dronst)+sum(b.largepc)+sum(b.smallpc))*100 * (((sum(b.usrcnt)/2)^2*(sum(b.sesscnt)/5)^2)/((1+(sum(b.usrcnt)/2)^2)*(1+(sum(b.sesscnt)/5)^2))) end as badness\
					from bssidux_dev c, bssidux_badness_dev b, apinfo a\
					where 1=1 and c.lat=b.lat and c.lng=b.lng and b.brand=c.brand and b.model=c.model and a.bssid=c.bssid \
					AND c.lat < $1 AND c.lat > $2 AND c.lng < $3 AND c.lng > $4\
					group by a.optrcom, c.model having sum(c.pausetime) <= sum(c.playtime) \
					union all\
					select 'DoW', b.optrcom, a.todow, COALESCE(b.usrcnt, 0) as usrcnt, COALESCE(b.pausecnt, 0) as pausecnt, COALESCE(b.pausetime, 0) as pausetime, COALESCE(b.stfail,0) as stfail, COALESCE(b.tp,0) as tp, COALESCE(b.rxbytes,0) as rxbytes, COALESCE(b.badness, 0) as badness from sktdemo_dow_master a left join (\
					select a.optrcom, c.todow, sum(c.usrcnt) as usrcnt, case when sum(c.playtime)=0 then 0 else sum(c.pausecnt)::float/sum(c.playtime) end*3600 as pausecnt, \
					case when sum(c.sesscnt)=0 then 0 else sum(c.stfail)::float/sum(c.sesscnt) end as stfail, \
					case when sum(c.wfduration)=0 then 1 else sum(c.wfrxbytes)::float*8/sum(c.wfduration)/1000000 end as tp, sum(c.wfrxbytes)/1024/1024/111::float as rxbytes, \
					case when sum(c.playtime)=0 then 0 else sum(c.pausetime)::float/sum(c.playtime) end*3600 as pausetime ,\
					case when (sum(b.stfail)+sum(b.dronst)+sum(b.largepc)+sum(b.smallpc))=0 then 0 else (sum(b.stfail)+sum(b.dronst)+sum(b.largepc))::float/(sum(b.stfail)+sum(b.dronst)+sum(b.largepc)+sum(b.smallpc))*100 * (((sum(b.usrcnt)/2)^2*(sum(b.sesscnt)/5)^2)/((1+(sum(b.usrcnt)/2)^2)*(1+(sum(b.sesscnt)/5)^2))) end as badness\
					from bssidux_dow c, bssidux_badness_dow b, apinfo a where 1=1 and c.lat=b.lat and c.lng=b.lng and c.bssid=b.bssid and c.todow=b.todow and a.bssid=c.bssid \
					AND c.lat < $1 AND c.lat > $2 AND c.lng < $3 AND c.lng > $4\
					group by a.optrcom, c.todow  having sum(c.pausetime) <= sum(c.playtime) order by 1 ) b on a.todow = b.todow\
					union ALL \
					select 'OS', a.optrcom, c.osver, sum(c.usrcnt) as usrcnt, case when sum(c.playtime)=0 then 0 else sum(c.pausecnt)::float/sum(c.playtime) end*3600 as pausecnt,\
					case when sum(c.sesscnt)=0 then 0 else sum(c.stfail)::float/sum(c.sesscnt) end as stfail,\
					case when sum(c.wfduration)=0 then 1 else sum(c.wfrxbytes)::float*8/sum(c.wfduration)/1000000 end as tp, sum(c.wfrxbytes)/1024/1024/111::float as rxbytes,\
					case when sum(c.playtime)=0 then 0 else sum(c.pausetime)::float/sum(c.playtime) end*3600 as pausetime,\
					case when (sum(b.stfail)+sum(b.dronst)+sum(b.largepc)+sum(b.smallpc))=0 then 0 else (sum(b.stfail)+sum(b.dronst)+sum(b.largepc))::float/(sum(b.stfail)+sum(b.dronst)+sum(b.largepc)+sum(b.smallpc))*100 * (((sum(b.usrcnt)/2)^2*(sum(b.sesscnt)/5)^2)/((1+(sum(b.usrcnt)/2)^2)*(1+(sum(b.sesscnt)/5)^2))) end as badness\
					from bssidux_os c, bssidux_badness_os b, apinfo a\
					where 1=1 and c.lat=b.lat and c.lng=b.lng and b.osver=c.osver  and a.bssid=c.bssid\
					AND c.lat < $1 AND c.lat > $2 AND c.lng < $3 AND c.lng > $4\
					group by a.optrcom, c.osver having sum(c.pausetime) <= sum(c.playtime) \
					union ALL\
					select 'IDs', a.optrcom, c.bssid, sum(c.usrcnt) as usrcnt, case when sum(c.playtime)=0 then 0 else sum(c.pausecnt)::float/sum(c.playtime) end*3600 as pausecnt,\
					case when sum(c.sesscnt)=0 then 0 else sum(c.stfail)::float/sum(c.sesscnt) end as stfail,\
					case when sum(c.wfduration)=0 then 1 else sum(c.wfrxbytes)::float*8/sum(c.wfduration)/1000000 end as tp, sum(c.wfrxbytes)/1024/1024/111::float as rxbytes,\
					case when sum(c.playtime)=0 then 0 else sum(c.pausetime)::float/sum(c.playtime) end*3600 as pausetime,\
					case when (sum(b.stfail)+sum(b.dronst)+sum(b.largepc)+sum(b.smallpc))=0 then 0 else (sum(b.stfail)+sum(b.dronst)+sum(b.largepc))::float/(sum(b.stfail)+sum(b.dronst)+sum(b.largepc)+sum(b.smallpc))*100 * (((sum(b.usrcnt)/2)^2*(sum(b.sesscnt)/5)^2)/((1+(sum(b.usrcnt)/2)^2)*(1+(sum(b.sesscnt)/5)^2))) end as badness\
					from bssidux_os c, bssidux_badness_os b, apinfo a\
					where 1=1 and c.lat=b.lat and c.lng=b.lng and b.osver=c.osver  and a.bssid=c.bssid\
					AND c.lat < $1 AND c.lat > $2 AND c.lng < $3 AND c.lng > $4\
					group by a.optrcom, c.bssid having sum(c.pausetime) <= sum(c.playtime) " ,
				[ ne.split(',')[0], sw.split(',')[0], ne.split(',')[1], sw.split(',')[1] ], function(err, result){
					// done()
					if(err){
						return console.error('error running query', err);
					}
					// console.log('result length is ', result.rows);
					// var i=0;
					result.rows.forEach(function(d){						
							geojson.wf.push({'type':d.type, 'optrcom':d.optrcom, 'gubun':d.gubun, 'pausecnt':d.pausecnt, 'pausetime':d.pausetime,'stfail':d.stfail, 'usrcnt':d.usrcnt ,'tp':parseFloat(d.tp),'rxbytes':parseFloat(d.rxbytes),'badness':parseFloat(d.badness) })
						
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


exports.chart_cell_list = function(req, res){
	var geojson = {'wf':[], 'cell':[]};
	var ne = req.param('ne', 0.0);
	var sw = req.param('sw', 0.0);
	// var optrcom = req.param('optrcom', 'KT');
	// var plmnid = getPlmnid(optrcom);

	pg.connect(pgConStr, function(err, client, don){
		if(err){
			return console.error('error fetching client from pool', err);
		}
		var keys = TAG+"chart_cellwf_list_"+ne+"_"+sw+"_";
		redis.get(keys, function(err, reply){
			// console.error('redis err' , err);
			console.log('redis reply ', reply);
			if(reply && reply!=null){
				res.json(JSON.parse(reply));
			}else{
				// console.log([ ne.split(',')[0], sw.split(',')[0], ne.split(',')[1], sw.split(',')[1] ]);
				client.query("select b.optrcom, a.todow, COALESCE(b.usrcnt, 0) as usrcnt, COALESCE(b.pausecnt, 0) as pausecnt , COALESCE(b.pausetime, 0) as pausetime, COALESCE(b.stfail,0) as stfail, COALESCE(b.tp,0) as tp, COALESCE(b.rxbytes,0) as rxbytes, COALESCE(b.badness, 0) as badness from sktdemo_todow_master a left join ( \
					select split_part(c.fullid, '_', 1)  as optrcom, c.todow, sum(c.usrcnt) as usrcnt, case when sum(c.playtime)=0 then 0 else sum(c.pausecnt)::float/sum(c.playtime) end*3600 as pausecnt,  \
					case when sum(c.sesscnt)=0 then 0 else sum(c.stfail)::float/sum(c.sesscnt) end as stfail,  \
					case when sum(c.cellduration)=0 then 0 else sum(c.cellrxbytes)::float*8/sum(c.cellduration) end/1000000 as tp, sum(c.cellrxbytes)/1024/1024/111::float as rxbytes,  \
					case when sum(c.playtime)=0 then 0 else sum(c.pausetime)::float/sum(c.playtime) end*3600 as pausetime, \
					case when (sum(b.stfail)+sum(b.dronst)+sum(b.largepc)+sum(b.smallpc))=0 then 0 else (sum(b.stfail)+sum(b.dronst)+sum(b.largepc))::float/(sum(b.stfail)+sum(b.dronst)+sum(b.largepc)+sum(b.smallpc))*100 * (((sum(b.usrcnt)/2)^2*(sum(b.sesscnt)/5)^2)/((1+(sum(b.usrcnt)/2)^2)*(1+(sum(b.sesscnt)/5)^2))) end as badness \
					from cellidux_todow c, cellidux_badness_todow b  where 1=1 and c.lat = b.lat and c.lng = b.lng and c.fullid=b.fullid and c.todow=b.todow \
					AND c.lat < $1 AND c.lat > $2 AND c.lng < $3 AND c.lng > $4  \
					group by split_part(c.fullid, '_', 1), c.todow  having sum(c.pausetime) <= sum(c.playtime) order by 1 ) b on a.todow = b.todow " ,
				[ ne.split(',')[0], sw.split(',')[0], ne.split(',')[1], sw.split(',')[1] ], function(err, result){
					if(err){
						return console.error('error running query', err);
					}
					result.rows.forEach(function(d){
							geojson.cell.push({'optrcom':getPlmnid(d.optrcom), 'todow':d.todow, 'pausecnt':d.pausecnt, 'pausetime':d.pausetime,'stfail':d.stfail, 'usrcnt':d.usrcnt ,'tp':parseFloat(d.tp),'rxbytes':parseFloat(d.rxbytes),'badness':parseFloat(d.badness) })
					});					
					var vvv = JSON.stringify(geojson);
					redis.set(keys, JSON.stringify(geojson));
					client.end();
					res.json(JSON.parse(vvv));
				});
			}
		});
	});
}

exports.chart_lte_list = function(req, res){
	var geojson = {'wf':[], 'cell':[], 'lte':[]};
	var ne = req.param('ne', 0.0);
	var sw = req.param('sw', 0.0);
	// var optrcom = req.param('optrcom', 'KT');
	// var plmnid = getPlmnid(optrcom);

	pg.connect(pgConStr, function(err, client, don){
		if(err){
			return console.error('error fetching client from pool', err);
		}
		var keys = TAG+"chart_lte_list_"+ne+"_"+sw+"_";
		redis.get(keys, function(err, reply){
			// console.error('redis err' , err);
			console.log('redis reply ', reply);
			if(reply && reply!=null){
				res.json(JSON.parse(reply));
			}else{
				// console.log([ ne.split(',')[0], sw.split(',')[0], ne.split(',')[1], sw.split(',')[1] ]);
				client.query("select b.optrcom, a.todow, COALESCE(b.usrcnt, 0) as usrcnt, COALESCE(b.pausecnt, 0) as pausecnt , COALESCE(b.pausetime, 0) as pausetime, COALESCE(b.stfail,0) as stfail, COALESCE(b.tp,0) as tp, COALESCE(b.rxbytes,0) as rxbytes, COALESCE(b.badness, 0) as badness from sktdemo_todow_master a left join ( \
					select split_part(c.fullid, '_', 1)  as optrcom, c.todow, sum(c.usrcnt) as usrcnt, case when sum(c.playtime)=0 then 0 else sum(c.pausecnt)::float/sum(c.playtime) end*3600 as pausecnt,  \
					case when sum(c.sesscnt)=0 then 0 else sum(c.stfail)::float/sum(c.sesscnt) end as stfail,  \
					case when sum(c.cellduration)=0 then 0 else sum(c.cellrxbytes)::float*8/sum(c.cellduration) end/1000000 as tp, sum(c.cellrxbytes)/1024/1024/111::float as rxbytes,  \
					case when sum(c.playtime)=0 then 0 else sum(c.pausetime)::float/sum(c.playtime) end*3600 as pausetime, \
					case when (sum(b.stfail)+sum(b.dronst)+sum(b.largepc)+sum(b.smallpc))=0 then 0 else (sum(b.stfail)+sum(b.dronst)+sum(b.largepc))::float/(sum(b.stfail)+sum(b.dronst)+sum(b.largepc)+sum(b.smallpc))*100 * (((sum(b.usrcnt)/2)^2*(sum(b.sesscnt)/5)^2)/((1+(sum(b.usrcnt)/2)^2)*(1+(sum(b.sesscnt)/5)^2))) end as badness \
					from lteidux_todow c, lteidux_badness_todow b  where 1=1 and c.lat = b.lat and c.lng = b.lng and c.fullid=b.fullid and c.todow=b.todow \
					AND c.lat < $1 AND c.lat > $2 AND c.lng < $3 AND c.lng > $4  \
					group by split_part(c.fullid, '_', 1), c.todow  having sum(c.pausetime) <= sum(c.playtime) order by 1 ) b on a.todow = b.todow " ,
				[ ne.split(',')[0], sw.split(',')[0], ne.split(',')[1], sw.split(',')[1] ], function(err, result){
					if(err){
						return console.error('error running query', err);
					}
					result.rows.forEach(function(d){
							geojson.lte.push({'optrcom':getPlmnid(d.optrcom), 'todow':d.todow, 'pausecnt':d.pausecnt, 'pausetime':d.pausetime,'stfail':d.stfail, 'usrcnt':d.usrcnt ,'tp':parseFloat(d.tp),'rxbytes':parseFloat(d.rxbytes),'badness':parseFloat(d.badness) })
					});					
					var vvv = JSON.stringify(geojson);
					redis.set(keys, JSON.stringify(geojson));
					client.end();
					res.json(JSON.parse(vvv));
				});
			}
		});
	});
}

exports.chart_wf_list = function(req, res){
	var geojson = {'wf':[], 'cell':[]};
	var ne = req.param('ne', 0.0);
	var sw = req.param('sw', 0.0);
	var optrcom = req.param('optrcom', 'KT');
	// var plmnid = getPlmnid(optrcom);

	pg.connect(pgConStr, function(err, client, don){
		if(err){
			return console.error('error fetching client from pool', err);
		}
		var keys = TAG+"chart_wf_list_"+ne+"_"+sw+"_"+optrcom;
		redis.get(keys, function(err, reply){
			// console.error('redis err' , err);
			console.log('redis reply ', reply);
			if(reply && reply!=null){
				res.json(JSON.parse(reply));
			}else{
				// console.log([ ne.split(',')[0], sw.split(',')[0], ne.split(',')[1], sw.split(',')[1] ]);
				client.query("select b.optrcom, a.todow, COALESCE(b.usrcnt, 0) as usrcnt, COALESCE(b.pausecnt, 0) as pausecnt, COALESCE(b.pausetime, 0) as pausetime, COALESCE(b.stfail,0) as stfail, COALESCE(b.tp,0) as tp, COALESCE(b.rxbytes,0) as rxbytes, COALESCE(b.badness, 0) as badness from sktdemo_todow_master a left join (  \
					select a.optrcom, c.todow, sum(c.usrcnt) as usrcnt, case when sum(c.playtime)=0 then 0 else sum(c.pausecnt)::float/sum(c.playtime) end*3600 as pausecnt,  \
					case when sum(c.sesscnt)=0 then 0 else sum(c.stfail)::float/sum(c.sesscnt) end as stfail,  \
					case when sum(c.wfduration)=0 then 1 else sum(c.wfrxbytes)::float*8/sum(c.wfduration)/1000000 end as tp, sum(c.wfrxbytes)/1024/1024/111::float as rxbytes,  \
					case when sum(c.playtime)=0 then 0 else sum(c.pausetime)::float/sum(c.playtime) end*3600 as pausetime ,\
					case when (sum(b.stfail)+sum(b.dronst)+sum(b.largepc)+sum(b.smallpc))=0 then 0 else (sum(b.stfail)+sum(b.dronst)+sum(b.largepc))::float/(sum(b.stfail)+sum(b.dronst)+sum(b.largepc)+sum(b.smallpc))*100 * (((sum(b.usrcnt)/2)^2*(sum(b.sesscnt)/5)^2)/((1+(sum(b.usrcnt)/2)^2)*(1+(sum(b.sesscnt)/5)^2))) end as badness \
					from bssidux_todow c, bssidux_badness_todow b, apinfo a where 1=1 and c.lat=b.lat and c.lng=b.lng and c.bssid=b.bssid and c.todow=b.todow and a.bssid=c.bssid  \
					AND c.lat < $1 AND c.lat > $2 AND c.lng < $3 AND c.lng > $4 \
					group by a.optrcom, c.todow  having sum(c.pausetime) <= sum(c.playtime) order by 1 ) b on a.todow = b.todow " ,
				[ ne.split(',')[0], sw.split(',')[0], ne.split(',')[1], sw.split(',')[1] ], function(err, result){
					// done()
					if(err){
						return console.error('error running query', err);
					}
					// console.log('result length is ', result.rows);
					// var i=0;
					result.rows.forEach(function(d){						
							geojson.wf.push({'optrcom':d.optrcom, 'todow':d.todow, 'pausecnt':d.pausecnt, 'pausetime':d.pausetime,'stfail':d.stfail, 'usrcnt':d.usrcnt ,'tp':parseFloat(d.tp),'rxbytes':parseFloat(d.rxbytes),'badness':parseFloat(d.badness) })
						
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


exports.treemap_cell_list = function(req, res){
	var geojson = {'wf':[], 'cell':[]};
	var ne = req.param('ne', 0.0);
	var sw = req.param('sw', 0.0);
	// var optrcom = req.param('optrcom', 'KT');
	// var plmnid = getPlmnid(optrcom);

	pg.connect(pgConStr, function(err, client, don){
		if(err){
			return console.error('error fetching client from pool', err);
		}
		var keys = TAG+"treemap_cell_list"+ne+"_"+sw+"_";
		redis.get(keys, function(err, reply){
			// console.error('redis err' , err);
			console.log('redis reply ', reply);
			if(reply && reply!=null){
				res.json(JSON.parse(reply));
			}else{
				// console.log([ ne.split(',')[0], sw.split(',')[0], ne.split(',')[1], sw.split(',')[1] ]);
				client.query("select split_part(c.fullid, '_', 1)  as optrcom, c.brand, c.model, sum(c.usrcnt) as usrcnt, case when sum(c.playtime)=0 then 0 else sum(c.pausecnt)::float/sum(c.playtime) end*3600 as pausecnt, \
					case when sum(c.sesscnt)=0 then 0 else sum(c.stfail)::float/sum(c.sesscnt) end as stfail, \
					case when sum(c.cellduration)=0 then 0 else sum(c.cellrxbytes)::float*8/sum(c.cellduration) end/1000000 as tp, sum(c.cellrxbytes)/1024/1024/111::float as rxbytes, \
					case when sum(c.playtime)=0 then 0 else sum(c.pausetime)::float/sum(c.playtime) end*3600 as pausetime, \
					case when (sum(b.stfail)+sum(b.dronst)+sum(b.largepc)+sum(b.smallpc))=0 then 0 else (sum(b.stfail)+sum(b.dronst)+sum(b.largepc))::float/(sum(b.stfail)+sum(b.dronst)+sum(b.largepc)+sum(b.smallpc))*100 * (((sum(b.usrcnt)/2)^2*(sum(b.sesscnt)/5)^2)/((1+(sum(b.usrcnt)/2)^2)*(1+(sum(b.sesscnt)/5)^2))) end as badness \
					from cellidux_dev c, cellidux_badness_dev b \
					where 1=1 and c.lat = b.lat and c.lng = b.lng and b.brand=c.brand and b.model=c.model \
					AND c.lat < $1 AND c.lat > $2 AND c.lng < $3 AND c.lng > $4  \
					group by split_part(c.fullid, '_', 1), c.brand, c.model  having sum(c.pausetime) <= sum(c.playtime) " ,
				[ ne.split(',')[0], sw.split(',')[0], ne.split(',')[1], sw.split(',')[1] ], function(err, result){
					// done()
					if(err){
						return console.error('error running query', err);
					}
					// console.log('result length is ', result.rows);
					// var i=0;
					result.rows.forEach(function(d){
						// if(result.rows[i].typ == 'cell'){
						geojson.cell.push({'optrcom':getPlmnid(d.optrcom), 'brand':d.brand, 'model':d.model, 'pausecnt':parseFloat(d.pausecnt), 'pausetime':parseFloat(d.pausetime),'stfail':parseFloat(d.stfail), 'usrcnt':parseFloat(d.usrcnt),'tp':parseFloat(d.tp),'rxbytes':parseFloat(d.rxbytes),'badness':parseFloat(d.badness) })
						// }else if (result.rows[i].typ == 'wf'){
						// 	geojson.wf.push({'brand':result.rows[i].brand, 'model':result.rows[i].model, 'pausecnt':parseFloat(result.rows[i].pausecnt), 'pausetime':parseFloat(result.rows[i].pausetime),'stfail':parseFloat(result.rows[i].stfail), 'usrcnt':parseFloat(result.rows[i].usrcnt),'tp':parseFloat(result.rows[i].tp),'rxbytes':parseFloat(result.rows[i].rxbytes),'badness':parseFloat(result.rows[i].badness) })
						// }
						// i++;
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


exports.treemap_lte_list = function(req, res){
	var geojson = {'wf':[], 'cell':[], 'lte':[]};
	var ne = req.param('ne', 0.0);
	var sw = req.param('sw', 0.0);
	// var optrcom = req.param('optrcom', 'KT');
	// var plmnid = getPlmnid(optrcom);

	pg.connect(pgConStr, function(err, client, don){
		if(err){
			return console.error('error fetching client from pool', err);
		}
		var keys = TAG+"treemap_cell_list"+ne+"_"+sw+"_";
		redis.get(keys, function(err, reply){
			// console.error('redis err' , err);
			console.log('redis reply ', reply);
			if(reply && reply!=null){
				res.json(JSON.parse(reply));
			}else{
				// console.log([ ne.split(',')[0], sw.split(',')[0], ne.split(',')[1], sw.split(',')[1] ]);
				client.query("select split_part(c.fullid, '_', 1)  as optrcom, c.brand, c.model, sum(c.usrcnt) as usrcnt, case when sum(c.playtime)=0 then 0 else sum(c.pausecnt)::float/sum(c.playtime) end*3600 as pausecnt, \
					case when sum(c.sesscnt)=0 then 0 else sum(c.stfail)::float/sum(c.sesscnt) end as stfail, \
					case when sum(c.cellduration)=0 then 0 else sum(c.cellrxbytes)::float*8/sum(c.cellduration) end/1000000 as tp, sum(c.cellrxbytes)/1024/1024/111::float as rxbytes, \
					case when sum(c.playtime)=0 then 0 else sum(c.pausetime)::float/sum(c.playtime) end*3600 as pausetime, \
					case when (sum(b.stfail)+sum(b.dronst)+sum(b.largepc)+sum(b.smallpc))=0 then 0 else (sum(b.stfail)+sum(b.dronst)+sum(b.largepc))::float/(sum(b.stfail)+sum(b.dronst)+sum(b.largepc)+sum(b.smallpc))*100 * (((sum(b.usrcnt)/2)^2*(sum(b.sesscnt)/5)^2)/((1+(sum(b.usrcnt)/2)^2)*(1+(sum(b.sesscnt)/5)^2))) end as badness \
					from lteidux_dev c, lteidux_badness_dev b \
					where 1=1 and c.lat = b.lat and c.lng = b.lng and b.brand=c.brand and b.model=c.model \
					AND c.lat < $1 AND c.lat > $2 AND c.lng < $3 AND c.lng > $4  \
					group by split_part(c.fullid, '_', 1), c.brand, c.model  having sum(c.pausetime) <= sum(c.playtime) " ,
				[ ne.split(',')[0], sw.split(',')[0], ne.split(',')[1], sw.split(',')[1] ], function(err, result){
					// done()
					if(err){
						return console.error('error running query', err);
					}
					// console.log('result length is ', result.rows);
					// var i=0;
					result.rows.forEach(function(d){
						// if(result.rows[i].typ == 'cell'){
						geojson.lte.push({'optrcom':getPlmnid(d.optrcom), 'brand':d.brand, 'model':d.model, 'pausecnt':parseFloat(d.pausecnt), 'pausetime':parseFloat(d.pausetime),'stfail':parseFloat(d.stfail), 'usrcnt':parseFloat(d.usrcnt),'tp':parseFloat(d.tp),'rxbytes':parseFloat(d.rxbytes),'badness':parseFloat(d.badness) })
						// }else if (result.rows[i].typ == 'wf'){
						// 	geojson.wf.push({'brand':result.rows[i].brand, 'model':result.rows[i].model, 'pausecnt':parseFloat(result.rows[i].pausecnt), 'pausetime':parseFloat(result.rows[i].pausetime),'stfail':parseFloat(result.rows[i].stfail), 'usrcnt':parseFloat(result.rows[i].usrcnt),'tp':parseFloat(result.rows[i].tp),'rxbytes':parseFloat(result.rows[i].rxbytes),'badness':parseFloat(result.rows[i].badness) })
						// }
						// i++;
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



exports.treemap_wf_list = function(req, res){
	var geojson = {'wf':[], 'cell':[]};
	var ne = req.param('ne', 0.0);
	var sw = req.param('sw', 0.0);
	// var optrcom = req.param('optrcom', 'KT');
	// var plmnid = getPlmnid(optrcom);
	
	pg.connect(pgConStr, function(err, client, don){
		if(err){
			return console.error('error fetching client from pool', err);
		}
		var keys = TAG+"treemap_wf_list"+ne+"_"+sw+"_";
		redis.get(keys, function(err, reply){
			// console.error('redis err' , err);
			console.log('redis reply ', reply);
			if(reply && reply!=null){
				res.json(JSON.parse(reply));
			}else{
				// console.log([ ne.split(',')[0], sw.split(',')[0], ne.split(',')[1], sw.split(',')[1] ]);
				client.query("select a.optrcom, c.brand, c.model, sum(c.usrcnt) as usrcnt, case when sum(c.playtime)=0 then 0 else sum(c.pausecnt)::float/sum(c.playtime) end*3600 as pausecnt, \
					case when sum(c.sesscnt)=0 then 0 else sum(c.stfail)::float/sum(c.sesscnt) end as stfail, \
					case when sum(c.wfduration)=0 then 1 else sum(c.wfrxbytes)::float*8/sum(c.wfduration)/1000000 end as tp, sum(c.wfrxbytes)/1024/1024/111::float as rxbytes, \
					case when sum(c.playtime)=0 then 0 else sum(c.pausetime)::float/sum(c.playtime) end*3600 as pausetime, \
					case when (sum(b.stfail)+sum(b.dronst)+sum(b.largepc)+sum(b.smallpc))=0 then 0 else (sum(b.stfail)+sum(b.dronst)+sum(b.largepc))::float/(sum(b.stfail)+sum(b.dronst)+sum(b.largepc)+sum(b.smallpc))*100 * (((sum(b.usrcnt)/2)^2*(sum(b.sesscnt)/5)^2)/((1+(sum(b.usrcnt)/2)^2)*(1+(sum(b.sesscnt)/5)^2))) end as badness \
					from bssidux_dev c, bssidux_badness_dev b, apinfo a \
					where 1=1 and c.lat=b.lat and c.lng=b.lng and b.brand=c.brand and b.model=c.model and a.bssid=c.bssid  \
					AND c.lat < $1 AND c.lat > $2 AND c.lng < $3 AND c.lng > $4 \
					group by a.optrcom, c.brand, c.model having sum(c.pausetime) <= sum(c.playtime) " ,
				[ ne.split(',')[0], sw.split(',')[0], ne.split(',')[1], sw.split(',')[1] ], function(err, result){

					if(err){
						return console.error('error running query', err);
					}
					// var i=0;
					result.rows.forEach(function(d){
						// if(result.rows[i].typ == 'cell'){
						// 	geojson.cell.push({'brand':result.rows[i].brand, 'model':result.rows[i].model, 'pausecnt':parseFloat(result.rows[i].pausecnt), 'pausetime':parseFloat(result.rows[i].pausetime),'stfail':parseFloat(result.rows[i].stfail), 'usrcnt':parseFloat(result.rows[i].usrcnt),'tp':parseFloat(result.rows[i].tp),'rxbytes':parseFloat(result.rows[i].rxbytes),'badness':parseFloat(result.rows[i].badness) })
						// }else if (result.rows[i].typ == 'wf'){
						geojson.wf.push({'optrcom':d.optrcom, 'brand':d.brand, 'model':d.model, 'pausecnt':parseFloat(d.pausecnt), 'pausetime':parseFloat(d.pausetime),'stfail':parseFloat(d.stfail), 'usrcnt':parseFloat(d.usrcnt),'tp':parseFloat(d.tp),'rxbytes':parseFloat(d.rxbytes),'badness':parseFloat(d.badness) })
						// }
						// i++;
					});					

					var vvv = JSON.stringify(geojson);
					redis.set(keys, JSON.stringify(geojson));
					client.end();
					res.json(JSON.parse(vvv));
				});
			}
		});
	});

}


exports.radar_cell_list = function(req, res){
	var geojson = {'wf':[], 'cell':[]};
	var ne = req.param('ne', 0.0);
	var sw = req.param('sw', 0.0);
	// var optrcom = req.param('optrcom', 'KT');
	// var plmnid = getPlmnid(optrcom);

	pg.connect(pgConStr, function(err, client, don){
		if(err){
			return console.error('error fetching client from pool', err);
		}
		var keys = TAG+"radar_cell_list_"+ne+"_"+sw+"_";
		redis.get(keys, function(err, reply){
			// console.error('redis err' , err);
			console.log('redis reply ', reply);
			if(reply && reply!=null){
				res.json(JSON.parse(reply));
			}else{
				// console.log([ ne.split(',')[0], sw.split(',')[0], ne.split(',')[1], sw.split(',')[1] ]);
				client.query("select b.optrcom, a.todow, COALESCE(b.usrcnt, 0) as usrcnt, COALESCE(b.pausecnt, 0) as pausecnt , COALESCE(b.pausetime, 0) as pausetime, COALESCE(b.stfail,0) as stfail, COALESCE(b.tp,0) as tp, COALESCE(b.rxbytes,0) as rxbytes, COALESCE(b.badness, 0) as badness from sktdemo_dow_master a left join ( \
							select split_part(c.fullid, '_', 1)  as optrcom, c.todow, sum(c.usrcnt) as usrcnt, case when sum(c.playtime)=0 then 0 else sum(c.pausecnt)::float/sum(c.playtime) end*3600 as pausecnt,   \
							case when sum(c.sesscnt)=0 then 0 else sum(c.stfail)::float/sum(c.sesscnt) end as stfail,   \
							case when sum(c.cellduration)=0 then 0 else sum(c.cellrxbytes)::float*8/sum(c.cellduration) end/1000000 as tp, sum(c.cellrxbytes)/1024/1024/111::float as rxbytes,   \
							case when sum(c.playtime)=0 then 0 else sum(c.pausetime)::float/sum(c.playtime) end*3600 as pausetime,  \
							case when (sum(b.stfail)+sum(b.dronst)+sum(b.largepc)+sum(b.smallpc))=0 then 0 else (sum(b.stfail)+sum(b.dronst)+sum(b.largepc))::float/(sum(b.stfail)+sum(b.dronst)+sum(b.largepc)+sum(b.smallpc))*100 * (((sum(b.usrcnt)/2)^2*(sum(b.sesscnt)/5)^2)/((1+(sum(b.usrcnt)/2)^2)*(1+(sum(b.sesscnt)/5)^2))) end as badness  \
							from cellidux_dow c, cellidux_badness_dow b  where 1=1 and c.lat = b.lat and c.lng = b.lng and c.fullid=b.fullid and c.todow=b.todow  \
							AND c.lat < $1 AND c.lat > $2 AND c.lng < $3 AND c.lng > $4   \
							group by split_part(c.fullid, '_', 1), c.todow  having sum(c.pausetime) <= sum(c.playtime) order by 1 ) b on a.todow = b.todow" ,
				[ ne.split(',')[0], sw.split(',')[0], ne.split(',')[1], sw.split(',')[1] ], function(err, result){
					if(err){
						return console.error('error running query', err);
					}
					result.rows.forEach(function(d){
							geojson.cell.push({'optrcom':getPlmnid(d.optrcom), 'todow':d.todow, 'pausecnt':d.pausecnt, 'pausetime':d.pausetime,'stfail':d.stfail, 'usrcnt':d.usrcnt ,'tp':parseFloat(d.tp),'rxbytes':parseFloat(d.rxbytes),'badness':parseFloat(d.badness) })
					});					
					var vvv = JSON.stringify(geojson);
					redis.set(keys, JSON.stringify(geojson));
					client.end();
					res.json(JSON.parse(vvv));
				});
			}
		});
	});
}


exports.radar_lte_list = function(req, res){
	var geojson = {'wf':[], 'cell':[], 'lte':[]};
	var ne = req.param('ne', 0.0);
	var sw = req.param('sw', 0.0);
	// var optrcom = req.param('optrcom', 'KT');
	// var plmnid = getPlmnid(optrcom);

	pg.connect(pgConStr, function(err, client, don){
		if(err){
			return console.error('error fetching client from pool', err);
		}
		var keys = TAG+"radar_lte_list_"+ne+"_"+sw+"_";
		redis.get(keys, function(err, reply){
			// console.error('redis err' , err);
			console.log('redis reply ', reply);
			if(reply && reply!=null){
				res.json(JSON.parse(reply));
			}else{
				// console.log([ ne.split(',')[0], sw.split(',')[0], ne.split(',')[1], sw.split(',')[1] ]);
				client.query("select b.optrcom, a.todow, COALESCE(b.usrcnt, 0) as usrcnt, COALESCE(b.pausecnt, 0) as pausecnt , COALESCE(b.pausetime, 0) as pausetime, COALESCE(b.stfail,0) as stfail, COALESCE(b.tp,0) as tp, COALESCE(b.rxbytes,0) as rxbytes, COALESCE(b.badness, 0) as badness from sktdemo_dow_master a left join ( \
							select split_part(c.fullid, '_', 1)  as optrcom, c.todow, sum(c.usrcnt) as usrcnt, case when sum(c.playtime)=0 then 0 else sum(c.pausecnt)::float/sum(c.playtime) end*3600 as pausecnt,   \
							case when sum(c.sesscnt)=0 then 0 else sum(c.stfail)::float/sum(c.sesscnt) end as stfail,   \
							case when sum(c.cellduration)=0 then 0 else sum(c.cellrxbytes)::float*8/sum(c.cellduration) end/1000000 as tp, sum(c.cellrxbytes)/1024/1024/111::float as rxbytes,   \
							case when sum(c.playtime)=0 then 0 else sum(c.pausetime)::float/sum(c.playtime) end*3600 as pausetime,  \
							case when (sum(b.stfail)+sum(b.dronst)+sum(b.largepc)+sum(b.smallpc))=0 then 0 else (sum(b.stfail)+sum(b.dronst)+sum(b.largepc))::float/(sum(b.stfail)+sum(b.dronst)+sum(b.largepc)+sum(b.smallpc))*100 * (((sum(b.usrcnt)/2)^2*(sum(b.sesscnt)/5)^2)/((1+(sum(b.usrcnt)/2)^2)*(1+(sum(b.sesscnt)/5)^2))) end as badness  \
							from lteidux_dow c, lteidux_badness_dow b  where 1=1 and c.lat = b.lat and c.lng = b.lng and c.fullid=b.fullid and c.todow=b.todow  \
							AND c.lat < $1 AND c.lat > $2 AND c.lng < $3 AND c.lng > $4   \
							group by split_part(c.fullid, '_', 1), c.todow  having sum(c.pausetime) <= sum(c.playtime) order by 1 ) b on a.todow = b.todow" ,
				[ ne.split(',')[0], sw.split(',')[0], ne.split(',')[1], sw.split(',')[1] ], function(err, result){
					if(err){
						return console.error('error running query', err);
					}
					result.rows.forEach(function(d){
							geojson.lte.push({'optrcom':getPlmnid(d.optrcom), 'todow':d.todow, 'pausecnt':d.pausecnt, 'pausetime':d.pausetime,'stfail':d.stfail, 'usrcnt':d.usrcnt ,'tp':parseFloat(d.tp),'rxbytes':parseFloat(d.rxbytes),'badness':parseFloat(d.badness) })
					});					
					var vvv = JSON.stringify(geojson);
					redis.set(keys, JSON.stringify(geojson));
					client.end();
					res.json(JSON.parse(vvv));
				});
			}
		});
	});
}



exports.radar_wf_list = function(req, res){
	var geojson = {'wf':[], 'cell':[]};
	var ne = req.param('ne', 0.0);
	var sw = req.param('sw', 0.0);
	var optrcom = req.param('optrcom', 'KT');
	// var plmnid = getPlmnid(optrcom);

	pg.connect(pgConStr, function(err, client, don){
		if(err){
			return console.error('error fetching client from pool', err);
		}
		var keys = TAG+"radar_wf_list_"+ne+"_"+sw+"_"+optrcom;
		redis.get(keys, function(err, reply){
			// console.error('redis err' , err);
			console.log('redis reply ', reply);
			if(reply && reply!=null){
				res.json(JSON.parse(reply));
			}else{
				// console.log([ ne.split(',')[0], sw.split(',')[0], ne.split(',')[1], sw.split(',')[1] ]);
				client.query(" select b.optrcom, a.todow, COALESCE(b.usrcnt, 0) as usrcnt, COALESCE(b.pausecnt, 0) as pausecnt, COALESCE(b.pausetime, 0) as pausetime, COALESCE(b.stfail,0) as stfail, COALESCE(b.tp,0) as tp, COALESCE(b.rxbytes,0) as rxbytes, COALESCE(b.badness, 0) as badness from sktdemo_dow_master a left join (  \
					select a.optrcom, c.todow, sum(c.usrcnt) as usrcnt, case when sum(c.playtime)=0 then 0 else sum(c.pausecnt)::float/sum(c.playtime) end*3600 as pausecnt,  \
					case when sum(c.sesscnt)=0 then 0 else sum(c.stfail)::float/sum(c.sesscnt) end as stfail,  \
					case when sum(c.wfduration)=0 then 1 else sum(c.wfrxbytes)::float*8/sum(c.wfduration)/1000000 end as tp, sum(c.wfrxbytes)/1024/1024/111::float as rxbytes,  \
					case when sum(c.playtime)=0 then 0 else sum(c.pausetime)::float/sum(c.playtime) end*3600 as pausetime ,\
					case when (sum(b.stfail)+sum(b.dronst)+sum(b.largepc)+sum(b.smallpc))=0 then 0 else (sum(b.stfail)+sum(b.dronst)+sum(b.largepc))::float/(sum(b.stfail)+sum(b.dronst)+sum(b.largepc)+sum(b.smallpc))*100 * (((sum(b.usrcnt)/2)^2*(sum(b.sesscnt)/5)^2)/((1+(sum(b.usrcnt)/2)^2)*(1+(sum(b.sesscnt)/5)^2))) end as badness \
					from bssidux_dow c, bssidux_badness_dow b, apinfo a where 1=1 and c.lat=b.lat and c.lng=b.lng and c.bssid=b.bssid and c.todow=b.todow and a.bssid=c.bssid  \
					AND c.lat < $1 AND c.lat > $2 AND c.lng < $3 AND c.lng > $4 \
					group by a.optrcom, c.todow  having sum(c.pausetime) <= sum(c.playtime) order by 1 ) b on a.todow = b.todow  " ,
				[ ne.split(',')[0], sw.split(',')[0], ne.split(',')[1], sw.split(',')[1] ], function(err, result){
					// done()
					if(err){
						return console.error('error running query', err);
					}
					// console.log('result length is ', result.rows);
					// var i=0;
					result.rows.forEach(function(d){						
							geojson.wf.push({'optrcom':d.optrcom, 'todow':d.todow, 'pausecnt':d.pausecnt, 'pausetime':d.pausetime,'stfail':d.stfail, 'usrcnt':d.usrcnt ,'tp':parseFloat(d.tp),'rxbytes':parseFloat(d.rxbytes),'badness':parseFloat(d.badness) })
						
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



exports.pie_cell_list = function(req, res){
	var geojson = {'wf':[], 'cell':[]};
	var ne = req.param('ne', 0.0);
	var sw = req.param('sw', 0.0);
	// var optrcom = req.param('optrcom', 'KT');
	// var plmnid = getPlmnid(optrcom);

	pg.connect(pgConStr, function(err, client, don){
		if(err){
			return console.error('error fetching client from pool', err);
		}
		var keys = TAG+"pie_cell_list_"+ne+"_"+sw+"_";
		redis.get(keys, function(err, reply){
			// console.error('redis err' , err);
			console.log('redis reply ', reply);
			if(reply && reply!=null){
				res.json(JSON.parse(reply));
			}else{
				// console.log([ ne.split(',')[0], sw.split(',')[0], ne.split(',')[1], sw.split(',')[1] ]);
				client.query("select split_part(c.fullid, '_', 1)  as optrcom, c.osver, sum(c.usrcnt) as usrcnt, case when sum(c.playtime)=0 then 0 else sum(c.pausecnt)::float/sum(c.playtime) end*3600 as pausecnt, \
						case when sum(c.sesscnt)=0 then 0 else sum(c.stfail)::float/sum(c.sesscnt) end as stfail, \
						case when sum(c.cellduration)=0 then 0 else sum(c.cellrxbytes)::float*8/sum(c.cellduration) end/1000000 as tp, sum(c.cellrxbytes)/1024/1024/111::float as rxbytes, \
						case when sum(c.playtime)=0 then 0 else sum(c.pausetime)::float/sum(c.playtime) end*3600 as pausetime, \
						case when (sum(b.stfail)+sum(b.dronst)+sum(b.largepc)+sum(b.smallpc))=0 then 0 else (sum(b.stfail)+sum(b.dronst)+sum(b.largepc))::float/(sum(b.stfail)+sum(b.dronst)+sum(b.largepc)+sum(b.smallpc))*100 * (((sum(b.usrcnt)/2)^2*(sum(b.sesscnt)/5)^2)/((1+(sum(b.usrcnt)/2)^2)*(1+(sum(b.sesscnt)/5)^2))) end as badness \
						from cellidux_os c, cellidux_badness_os b \
						where 1=1 and c.lat = b.lat and c.lng = b.lng and b.osver=c.osver \
						AND c.lat < $1 AND c.lat > $2 AND c.lng < $3 AND c.lng > $4 \
						group by split_part(c.fullid, '_', 1), c.osver having sum(c.pausetime) <= sum(c.playtime) " ,
				[ ne.split(',')[0], sw.split(',')[0], ne.split(',')[1], sw.split(',')[1] ], function(err, result){
					if(err){
						return console.error('error running query', err);
					}
					result.rows.forEach(function(d){
							geojson.cell.push({'optrcom':getPlmnid(d.optrcom), 'osver':d.osver, 'pausecnt':d.pausecnt, 'pausetime':d.pausetime,'stfail':d.stfail, 'usrcnt':d.usrcnt ,'tp':parseFloat(d.tp),'rxbytes':parseFloat(d.rxbytes),'badness':parseFloat(d.badness) })
					});					
					var vvv = JSON.stringify(geojson);
					redis.set(keys, JSON.stringify(geojson));
					client.end();
					res.json(JSON.parse(vvv));
				});
			}
		});
	});
}


exports.pie_lte_list = function(req, res){
	var geojson = {'wf':[], 'cell':[], 'lte':[]};
	var ne = req.param('ne', 0.0);
	var sw = req.param('sw', 0.0);
	// var optrcom = req.param('optrcom', 'KT');
	// var plmnid = getPlmnid(optrcom);

	pg.connect(pgConStr, function(err, client, don){
		if(err){
			return console.error('error fetching client from pool', err);
		}
		var keys = TAG+"pie_lte_list_"+ne+"_"+sw+"_";
		redis.get(keys, function(err, reply){
			// console.error('redis err' , err);
			console.log('redis reply ', reply);
			if(reply && reply!=null){
				res.json(JSON.parse(reply));
			}else{
				// console.log([ ne.split(',')[0], sw.split(',')[0], ne.split(',')[1], sw.split(',')[1] ]);
				client.query("select split_part(c.fullid, '_', 1)  as optrcom, c.osver, sum(c.usrcnt) as usrcnt, case when sum(c.playtime)=0 then 0 else sum(c.pausecnt)::float/sum(c.playtime) end*3600 as pausecnt, \
						case when sum(c.sesscnt)=0 then 0 else sum(c.stfail)::float/sum(c.sesscnt) end as stfail, \
						case when sum(c.cellduration)=0 then 0 else sum(c.cellrxbytes)::float*8/sum(c.cellduration) end/1000000 as tp, sum(c.cellrxbytes)/1024/1024/111::float as rxbytes, \
						case when sum(c.playtime)=0 then 0 else sum(c.pausetime)::float/sum(c.playtime) end*3600 as pausetime, \
						case when (sum(b.stfail)+sum(b.dronst)+sum(b.largepc)+sum(b.smallpc))=0 then 0 else (sum(b.stfail)+sum(b.dronst)+sum(b.largepc))::float/(sum(b.stfail)+sum(b.dronst)+sum(b.largepc)+sum(b.smallpc))*100 * (((sum(b.usrcnt)/2)^2*(sum(b.sesscnt)/5)^2)/((1+(sum(b.usrcnt)/2)^2)*(1+(sum(b.sesscnt)/5)^2))) end as badness \
						from lteidux_os c, lteidux_badness_os b \
						where 1=1 and c.lat = b.lat and c.lng = b.lng and b.osver=c.osver \
						AND c.lat < $1 AND c.lat > $2 AND c.lng < $3 AND c.lng > $4 \
						group by split_part(c.fullid, '_', 1), c.osver having sum(c.pausetime) <= sum(c.playtime) " ,
				[ ne.split(',')[0], sw.split(',')[0], ne.split(',')[1], sw.split(',')[1] ], function(err, result){
					if(err){
						return console.error('error running query', err);
					}
					result.rows.forEach(function(d){
							geojson.lte.push({'optrcom':getPlmnid(d.optrcom), 'osver':d.osver, 'pausecnt':d.pausecnt, 'pausetime':d.pausetime,'stfail':d.stfail, 'usrcnt':d.usrcnt ,'tp':parseFloat(d.tp),'rxbytes':parseFloat(d.rxbytes),'badness':parseFloat(d.badness) })
					});					
					var vvv = JSON.stringify(geojson);
					redis.set(keys, JSON.stringify(geojson));
					client.end();
					res.json(JSON.parse(vvv));
				});
			}
		});
	});
}


exports.pie_wf_list = function(req, res){
	var geojson = {'wf':[], 'cell':[]};
	var ne = req.param('ne', 0.0);
	var sw = req.param('sw', 0.0);
	var optrcom = req.param('optrcom', 'KT');
	// var plmnid = getPlmnid(optrcom);

	pg.connect(pgConStr, function(err, client, don){
		if(err){
			return console.error('error fetching client from pool', err);
		}
		var keys = TAG+"pie_wf_list_"+ne+"_"+sw+"_"+optrcom;
		redis.get(keys, function(err, reply){
			// console.error('redis err' , err);
			console.log('redis reply ', reply);
			if(reply && reply!=null){
				res.json(JSON.parse(reply));
			}else{
				// console.log([ ne.split(',')[0], sw.split(',')[0], ne.split(',')[1], sw.split(',')[1] ]);
				client.query("select a.optrcom, c.osver, sum(c.usrcnt) as usrcnt, case when sum(c.playtime)=0 then 0 else sum(c.pausecnt)::float/sum(c.playtime) end*3600 as pausecnt, \
					case when sum(c.sesscnt)=0 then 0 else sum(c.stfail)::float/sum(c.sesscnt) end as stfail, \
					case when sum(c.wfduration)=0 then 1 else sum(c.wfrxbytes)::float*8/sum(c.wfduration)/1000000 end as tp, sum(c.wfrxbytes)/1024/1024/111::float as rxbytes, \
					case when sum(c.playtime)=0 then 0 else sum(c.pausetime)::float/sum(c.playtime) end*3600 as pausetime, \
					case when (sum(b.stfail)+sum(b.dronst)+sum(b.largepc)+sum(b.smallpc))=0 then 0 else (sum(b.stfail)+sum(b.dronst)+sum(b.largepc))::float/(sum(b.stfail)+sum(b.dronst)+sum(b.largepc)+sum(b.smallpc))*100 * (((sum(b.usrcnt)/2)^2*(sum(b.sesscnt)/5)^2)/((1+(sum(b.usrcnt)/2)^2)*(1+(sum(b.sesscnt)/5)^2))) end as badness \
					from bssidux_os c, bssidux_badness_os b, apinfo a \
					where 1=1 and c.lat=b.lat and c.lng=b.lng and b.osver=c.osver  and a.bssid=c.bssid \
					AND c.lat < $1 AND c.lat > $2 AND c.lng < $3 AND c.lng > $4	\
					group by a.optrcom, c.osver   having sum(c.pausetime) <= sum(c.playtime) " ,
				[ ne.split(',')[0], sw.split(',')[0], ne.split(',')[1], sw.split(',')[1] ], function(err, result){
					// done()
					if(err){
						return console.error('error running query', err);
					}
					// console.log('result length is ', result.rows);
					// var i=0;
					result.rows.forEach(function(d){						
							geojson.wf.push({'optrcom':d.optrcom, 'osver':d.osver, 'pausecnt':d.pausecnt, 'pausetime':d.pausetime,'stfail':d.stfail, 'usrcnt':d.usrcnt ,'tp':parseFloat(d.tp),'rxbytes':parseFloat(d.rxbytes),'badness':parseFloat(d.badness) })
						
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




exports.heat_cell_list = function(req, res){
	var geojson = {'wf':[], 'cell':[], 'lte':[]};
	var ne = req.param('ne', 0.0);
	var sw = req.param('sw', 0.0);
	var optrcom = req.param('optrcom', 'KT');
	// var plmnid = getPlmnid(optrcom);

	pg.connect(pgConStr, function(err, client, don){
		if(err){
			return console.error('error fetching client from pool', err);
		}
		var keys = TAG+"heat_wf_list_"+ne+"_"+sw+"_"+optrcom;
		redis.get(keys, function(err, reply){
			// console.error('redis err' , err);
			console.log('redis reply ', reply);
			if(reply && reply!=null){
				res.json(JSON.parse(reply));
			}else{
				// console.log([ ne.split(',')[0], sw.split(',')[0], ne.split(',')[1], sw.split(',')[1] ]);
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
						FROM lgapux l, lgapux_badness b \
						WHERE 1 = 1 and l.lat=b.lat and l.lng=b.lng \
						AND l.lat < $1 AND l.lat > $2 AND l.lng < $3 AND l.lng > $4 \
						GROUP BY l.lat, l.lng, l.plmnid " ,
				[ ne.split(',')[0], sw.split(',')[0], ne.split(',')[1], sw.split(',')[1] ], function(err, result){
					// done()
					if(err){
						return console.error('error running query', err);
					}
					// console.log('result length is ', result.rows);
					// var i=0;
					result.rows.forEach(function(d){						
							geojson.cell.push({'lat':d.lat, 'lng':d.lng, 'optrcom':getPlmnid(d.optrcom),  'pausecnt':d.pausecnt, 'pausetime':d.pausetime,'stfail':d.stfail, 'usrcnt':d.usrcnt ,'tp':parseFloat(d.tp),'rxbytes':parseFloat(d.rxbytes),'badness':parseFloat(d.badness) })
							// geojson.cell.push({'lat':d.lat, 'lng':d.lng, 'pausecnt':d.pausecnt, 'pausetime':d.pausetime,'stfail':d.stfail, 'usrcnt':d.usrcnt ,'tp':parseFloat(d.tp),'rxbytes':parseFloat(0),'badness':parseFloat(1) })
						
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



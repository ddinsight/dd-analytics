var express = require('express');
var path = require('path');
var pg = require('pg');
var pgConStr =  'postgres://USERNAME:PASSOWRD@POSTGRESERVER:PORT/DATABASENAME';

var redis = require('redis').createClient();
redis.on('error', function (err) {
  console.log('Error ' + err);
});



var TAG = 'haction_'

exports.map_cell_list = function(req, res){
	var geojson = {'type':'FeatureCollection', 'features':[],"properties":{ "description":"Airplug, 2015 inc" }}
	var ne = req.param('ne', 0.0);
	var sw = req.param('sw', 0.0);
	var poor = req.param('poor', 20);
	var scope = req.param('scope', '0,0,0,0');

	pg.connect(pgConStr, function(err, client, don){
		if(err){
			return console.error('error fetching client from pool', err);
		}
		var keynm = TAG + "map_cell_list_"+ne+"_"+sw+'_'+scope;
		redis.get(keynm, function(err, reply){

			if(reply && reply!=null){
				res.json(JSON.parse(reply));
			}else{
				client.query("select \
					'cell'::text as typ, x.lat, x.lng, fullid as id, COALESCE(a.addr,'-') as addr, modelvr, (stfail+dronst+largepc)::float/(stfail+dronst+largepc+smallpc)*100*weight as badness, usrcnt, sesscnt \
					from ( \
					SELECT \
					  c.lat, \
					  c.lng, \
					  c.fullid, \
					  sum(c.usrcnt)  AS usrcnt, \
					  sum(c.sesscnt) AS sesscnt, \
					  sum(c.stfail)  AS stfail, \
					  sum(c.dronst)  AS dronst, \
					  sum(c.largepc) AS largepc, \
					  sum(c.smallpc) AS smallpc, \
					  (pow(sum(c.usrcnt) / 2, 2) :: FLOAT * pow(sum(c.sesscnt) / 2, 2) :: FLOAT) / \
					  ((1 + pow(sum(c.usrcnt) / 2, 2) :: FLOAT) * (1 + pow(sum(c.sesscnt) / 2, 2) :: FLOAT)) AS weight, \
					  COALESCE(min(mv.modelvr),1) as modelvr \
					FROM sktdemo_cell_badness c left join (select lat, lng, fullid, count(distinct model)::float/sum(usrcnt) as modelvr from sktdemo_cell_badness_dev where 1=1 \
								and lat < $1 AND lat > $2 AND lng < $3 AND lng > $4 \
								and (stfail+dronst+largepc)::float/(stfail+dronst+largepc+smallpc)*100 > $9 \
								group by lat,lng, fullid) mv on c.lat=mv.lat and c.lng=mv.lng and c.fullid=mv.fullid \
					  where 1=1  and c.lat >0 \
					  AND c.lat < $5 AND c.lat > $6 AND c.lng < $7 AND c.lng > $8 \
					GROUP BY c.lat, c.lng, c.fullid \
					) x left join (select distinct(lat||''||lng), lat, lng, addr from ktwfloc_addr) a on x.lat = a.lat and x.lng = a.lng \
					where (stfail+dronst+largepc)::float/(stfail+dronst+largepc+smallpc)*100 > 0" ,[ne.split(',')[0], sw.split(',')[0], ne.split(',')[1], sw.split(',')[1],ne.split(',')[0], sw.split(',')[0], ne.split(',')[1], sw.split(',')[1], poor ], 
					 function(err, result){
					// done()
					if(err){
						return console.error('error running query', err);
					}
					// console.log('result length is ', result.rows);
					var i=0;
					result.rows.forEach(function(d){
						geojson.features.push({'geometry':{'type':'Point', 'coordinates':[parseFloat(result.rows[i].lng), parseFloat(result.rows[i].lat)]}, 
							'type':'Feature','properties':{'type':result.rows[i].typ, 'id':result.rows[i].id ,'addr':result.rows[i].addr,'badness':parseFloat(result.rows[i].badness),'modelvr':parseFloat(result.rows[i].modelvr),'usrcnt':parseFloat(result.rows[i].usrcnt),'sesscnt':parseFloat(result.rows[i].sesscnt) } });	
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



exports.map_wf_list = function(req, res){
	var geojson = {'type':'FeatureCollection', 'features':[],"properties":{ "description":"Airplug, 2015 inc" }}
	var ne = req.param('ne', 0.0);
	var sw = req.param('sw', 0.0);
	var poor = req.param('poor', 20);
	var scope = req.param('scope', '0,0,0,0');

	pg.connect(pgConStr, function(err, client, don){
		if(err){
			return console.error('error fetching client from pool', err);
		}
		var keynm = TAG + "map_wf_list_"+ne+"_"+sw+'_'+scope;
		redis.get(keynm, function(err, reply){

			if(reply && reply!=null){
				res.json(JSON.parse(reply));
			}else{
				client.query("select \
					  'wf'::text as typ, x.lat, x.lng, bssid as id, COALESCE(a.addr,'-') as addr,modelvr, (stfail+dronst+largepc)::float/(stfail+dronst+largepc+smallpc)*100*weight as badness, usrcnt, sesscnt \
					from ( \
					  SELECT \
					    c.lat, \
					    c.lng, \
					    c.bssid, \
					    sum(c.usrcnt)  AS usrcnt, \
					    sum(c.sesscnt) AS sesscnt, \
					    sum(c.stfail)  AS stfail, \
					    sum(c.dronst)  AS dronst, \
					    sum(c.largepc) AS largepc, \
					    sum(c.smallpc) AS smallpc, \
					    (pow(sum(usrcnt) / 2, 2) :: FLOAT * pow(sum(sesscnt) / 2, 2) :: FLOAT) / \
					    ((1 + pow(sum(usrcnt) / 2, 2) :: FLOAT) * (1 + pow(sum(sesscnt) / 2, 2) :: FLOAT)) AS weight, \
					    COALESCE(min(mv.modelvr),1) as modelvr \
					  FROM sktdemo_wf_badness c left join (select lat, lng, bssid, count(distinct model)::float/sum(usrcnt) as modelvr from sktdemo_wf_badness_dev where 1=1 \
					      and lat < $1 AND lat > $2 AND lng < $3 AND lng > $4 \
					      and (stfail+dronst+largepc)::float/(stfail+dronst+largepc+smallpc)*100 > $9 \
					      group by lat,lng, bssid) mv on c.lat=mv.lat and c.lng=mv.lng and c.bssid=mv.bssid \
					    where 1=1 and c.lat >0 and c.bssid not in ('00:00:00:00:00:00') \
					    and c.lat < $5 AND c.lat > $6 AND c.lng < $7 AND c.lng > $8 \
					  GROUP BY c.lat, c.lng, c.bssid \
					) x left join (select distinct(lat||''||lng), lat, lng, addr from ktwfloc_addr) a on x.lat = a.lat and x.lng = a.lng \
					 where (stfail+dronst+largepc)::float/(stfail+dronst+largepc+smallpc)*100 > 0" ,[ne.split(',')[0], sw.split(',')[0], ne.split(',')[1], sw.split(',')[1],ne.split(',')[0], sw.split(',')[0], ne.split(',')[1], sw.split(',')[1], poor], function(err, result){
					// done()
					if(err){
						return console.error('error running query', err);
					}
					// console.log('result length is ', result.rows);
					var i=0;
					result.rows.forEach(function(d){
						geojson.features.push({'geometry':{'type':'Point', 'coordinates':[parseFloat(result.rows[i].lng), parseFloat(result.rows[i].lat)]}, 
							'type':'Feature','properties':{'type':result.rows[i].typ, 'id':result.rows[i].id ,'addr':result.rows[i].addr,'modelvr':parseFloat(result.rows[i].modelvr),'badness':parseFloat(result.rows[i].badness),'usrcnt':parseFloat(result.rows[i].usrcnt),'sesscnt':parseFloat(result.rows[i].sesscnt) } });	
						i++;
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



exports.chart_cellwf_list = function(req, res){
	var geojson = {'wf':[], 'cell':[]};
	var ne = req.param('ne', 0.0);
	var sw = req.param('sw', 0.0);
	var poor = req.param('poor', '20,20');
	var scope = req.param('scope', '0,0,0,0:0,0,0,0');

	pg.connect(pgConStr, function(err, client, don){
		if(err){
			return console.error('error fetching client from pool', err);
		}
		var keys = TAG + "chart_cellwf_list_"+ne+"_"+sw+'_'+scope;
		redis.get(keys, function(err, reply){
			// console.error('redis err' , err);
			console.log('redis reply ', reply);
			if(reply && reply!=null){
				res.json(JSON.parse(reply));
			}else{
				console.log([ ne.split(',')[0], sw.split(',')[0], ne.split(',')[1], sw.split(',')[1], poor ]);
				client.query("SELECT \
					'cell'::text typ, \
					todow, \
					count(*) as cnt \
					FROM sktdemo_cell_badness_todow c \
					where 1=1 \
					and (stfail+dronst+largepc)::float/(stfail+dronst+largepc+smallpc)*100 >= $9 \
					and c.lat < $1 AND c.lat > $2 AND c.lng < $3 AND c.lng > $4 \
					GROUP BY todow \
					union all \
					SELECT \
					'wf' typ, \
					todow, \
					count(*) as cnt \
					FROM sktdemo_wf_badness_todow c \
					where 1=1 \
					and (stfail+dronst+largepc)::float/(stfail+dronst+largepc+smallpc)*100 >= $10 \
					and c.lat < $5 AND c.lat > $6 AND c.lng < $7 AND c.lng > $8 \
					GROUP BY todow order by 1,2", 
				[ ne.split(',')[0], sw.split(',')[0], ne.split(',')[1], sw.split(',')[1], ne.split(',')[0], sw.split(',')[0], ne.split(',')[1], sw.split(',')[1] , poor.split(',')[0], poor.split(',')[1] ], function(err, result){
					// done()
					if(err){
						return console.error('error running query', err);
					}
					// console.log('result length is ', result.rows);
					var i=0;
					result.rows.forEach(function(d){
						if(result.rows[i].typ== 'cell'){
							geojson.cell.push({'todow':result.rows[i].todow, 'badness':result.rows[i].cnt })
						}else if (result.rows[i].typ == 'wf'){
							geojson.wf.push({'todow':result.rows[i].todow, 'badness':result.rows[i].cnt })
						}
						i++;
					});					
					console.log(geojson)
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
	var poor = req.param('poor', '20,20');
	var scope = req.param('scope', '0,0,0,0:0,0,0,0');

	pg.connect(pgConStr, function(err, client, don){
		if(err){
			return console.error('error fetching client from pool', err);
		}
		var keys = TAG + "treemap_cellwf_list_"+ne+"_"+sw+'_'+scope;
		redis.get(keys, function(err, reply){
			// console.error('redis err' , err);
			console.log('redis reply ', reply);
			if(reply && reply!=null){
				res.json(JSON.parse(reply));
			}else{
				console.log([ ne.split(',')[0], sw.split(',')[0], ne.split(',')[1], sw.split(',')[1], poor]);
				client.query("select\
					  'cell'::text as typ, brand, model, usrcnt, (stfail+dronst+largepc)::float/(stfail+dronst+largepc+smallpc)*100 as badness\
					from (\
					  SELECT\
					    brand, model,\
					    sum(usrcnt)  AS usrcnt,\
					    sum(sesscnt) AS sesscnt,\
					    sum(stfail)  AS stfail,\
					    sum(dronst)  AS dronst,\
					    sum(largepc) AS largepc,\
					    sum(smallpc) AS smallpc,\
					    (pow(sum(usrcnt) / 2, 2) :: FLOAT * pow(sum(sesscnt) / 2, 2) :: FLOAT) /\
					    ((1 + pow(sum(usrcnt) / 2, 2) :: FLOAT) * (1 + pow(sum(sesscnt) / 2, 2) :: FLOAT)) AS weight\
					  FROM sktdemo_cell_badness_dev\
					    where 1=1 \
					    AND lat < $1 AND lat > $2 AND lng < $3 AND lng > $4\
					  GROUP BY brand, model\
					) x where (stfail+dronst+largepc)::float/(stfail+dronst+largepc+smallpc)*100 >= $9 \
					UNION\
					select\
					  'wf'::text as typ, brand, model, usrcnt, (stfail+dronst+largepc)::float/(stfail+dronst+largepc+smallpc)*100 as badness\
					from (\
					  SELECT\
					    brand, model,\
					    sum(usrcnt)  AS usrcnt,\
					    sum(sesscnt) AS sesscnt,\
					    sum(stfail)  AS stfail,\
					    sum(dronst)  AS dronst,\
					    sum(largepc) AS largepc,\
					    sum(smallpc) AS smallpc,\
					    (pow(sum(usrcnt) / 2, 2) :: FLOAT * pow(sum(sesscnt) / 2, 2) :: FLOAT) /\
					    ((1 + pow(sum(usrcnt) / 2, 2) :: FLOAT) * (1 + pow(sum(sesscnt) / 2, 2) :: FLOAT)) AS weight\
					  FROM sktdemo_wf_badness_dev\
					    where 1=1 \
					    AND lat < $5 AND lat > $6 AND lng < $7 AND lng > $8\
					  GROUP BY brand, model\
					) x  where (stfail+dronst+largepc)::float/(stfail+dronst+largepc+smallpc)*100 >= $10 " ,
				[ ne.split(',')[0], sw.split(',')[0], ne.split(',')[1], sw.split(',')[1], ne.split(',')[0], sw.split(',')[0], ne.split(',')[1], sw.split(',')[1] , poor.split(',')[0],poor.split(',')[1] ], function(err, result){
					// done()
					if(err){
						return console.error('error running query', err);
					}
					// console.log('result length is ', result.rows);
					var i=0;
					result.rows.forEach(function(d){
						if(result.rows[i].typ== 'cell'){
							geojson.cell.push({'brand':result.rows[i].brand, 'model':result.rows[i].model, 'badness':result.rows[i].badness, 'usrcnt':result.rows[i].usrcnt })
						}else if (result.rows[i].typ == 'wf'){
							geojson.wf.push({'brand':result.rows[i].brand, 'model':result.rows[i].model,  'badness':result.rows[i].badness, 'usrcnt':result.rows[i].usrcnt })
						}
						i++;
					});					
					console.log(geojson)
					var vvv = JSON.stringify(geojson);
					redis.set(keys, JSON.stringify(geojson));
					client.end();
					res.json(JSON.parse(vvv));
				});
			}
		});
	});
}



exports.map_cell_info = function(req, res){
	var geojson = {'info':[]}
	var id = req.param('id', '');
	// var ne = req.param('ne', 0.0);
	// var sw = req.param('sw', 0.0);
	// var poor = req.param('poor', 20);
	// var scope = req.param('scope', '0,0,0,0');

	pg.connect(pgConStr, function(err, client, don){
		if(err){
			return console.error('error fetching client from pool', err);
		}
		var keynm = TAG + "map_cell_info_"+id;
		redis.get(keynm, function(err, reply){

			if(reply && reply!=null){
				res.json(JSON.parse(reply));
			}else{
				client.query("SELECT \
						  brand, model, \
						  sum(usrcnt) as badness \
						FROM sktdemo_cell_badness_dev \
						  where 1=1 \
						  and fullid = $1 \
						GROUP BY brand, model order by 3 desc limit 2" ,[id], 
			 function(err, result){
					if(err){
						return console.error('error running query', err);
					}
					result.rows.forEach(function(d, i){
						geojson.info.push({'brand':d['brand'], 'model':d['model'], 'badness':d['badness']})	;
					});					
					console.log(geojson)
					var vvv = JSON.stringify(geojson);
					redis.set(keynm, JSON.stringify(geojson));
					client.end();
					res.json(JSON.parse(vvv));
				});
			}
		});
	});
}


exports.map_wf_info = function(req, res){
	var geojson = {'info':[]}
	var id = req.param('id', '');

	pg.connect(pgConStr, function(err, client, don){
		if(err){
			return console.error('error fetching client from pool', err);
		}
		var keynm = TAG + "map_wf_info_"+id;
		redis.get(keynm, function(err, reply){

			if(reply && reply!=null){
				res.json(JSON.parse(reply));
			}else{
				client.query("SELECT \
						  brand, model, \
						  sum(usrcnt) as badness \
						FROM sktdemo_wf_badness_dev \
						  where 1=1 \
						  and bssid = $1 \
						GROUP BY brand, model order by 3 desc limit 2" ,[id], 
			 function(err, result){
					if(err){
						return console.error('error running query', err);
					}
					result.rows.forEach(function(d, i){
						geojson.info.push({'brand':d['brand'], 'model':d['model'], 'badness':parseFloat(d['badness']) })	;
					});
					console.log(geojson)
					var vvv = JSON.stringify(geojson);
					redis.set(keynm, JSON.stringify(geojson));
					client.end();
					res.json(JSON.parse(vvv));
				});
			}
		});
	});
}

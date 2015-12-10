var express = require('express');
var path = require('path');
var pg = require('pg');
var mysql      = require('mysql');
var pgConStr =  'postgres://USERNAME:PASSOWRD@POSTGRESERVER:PORT/DATABASENAME';

var redis = require('redis').createClient();
redis.on('error', function (err) {
  console.log('Error ' + err);
});

var TAG = 'oaction_'

var getPlmnid = function(optrcom){
	// return (optrcom=='KT'?'45008':(optrcom=='SKT'?'45005':optrcom=='LGT'?'45006':'000000'));
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
				console.log('redis reply not null!');
				res.json(JSON.parse(reply));
			}else{
				client.query("select \
					optrcom, x.lat, x.lng, fullid as id, COALESCE(a.addr,'-') as addr, modelvr, case when (stfail+dronst+largepc+smallpc)=0 then 0 else (stfail+dronst+largepc)::float/(stfail+dronst+largepc+smallpc)*100*weight end as badness, usrcnt, sesscnt \
					from ( \
					SELECT \
					  c.lat, \
					  c.lng, \
					  c.fullid, \
					  min(split_part(c.fullid, '_', 1))  as optrcom, \
					  sum(c.usrcnt)  AS usrcnt, \
					  sum(c.sesscnt) AS sesscnt, \
					  sum(c.stfail)  AS stfail, \
					  sum(c.dronst)  AS dronst, \
					  sum(c.largepc) AS largepc, \
					  sum(c.smallpc) AS smallpc, \
					  (pow(sum(c.usrcnt) / 2, 2) :: FLOAT * pow(sum(c.sesscnt) / 2, 2) :: FLOAT) / \
					  ((1 + pow(sum(c.usrcnt) / 2, 2) :: FLOAT) * (1 + pow(sum(c.sesscnt) / 2, 2) :: FLOAT)) AS weight, \
					  COALESCE(min(mv.modelvr),1) as modelvr \
					FROM cellidux_badness c left join (select lat, lng, fullid, count(distinct model)::float/sum(usrcnt) as modelvr from cellidux_badness_dev where 1=1 \
					      and lat < $1 AND lat > $2 AND lng < $3 AND lng > $4 \
					      and case when (stfail+dronst+largepc+smallpc)=0  then 0 else (stfail+dronst+largepc)::float/(stfail+dronst+largepc+smallpc)*100 end > $5 \
					      group by lat,lng, fullid) mv on c.lat=mv.lat and c.lng=mv.lng and c.fullid=mv.fullid \
					  where 1=1  and c.lat >0 \
					  and c.lat<$1 and c.lat>$2 and c.lng<$3 and c.lng>$4 \
					GROUP BY c.lat, c.lng, c.fullid \
					) x left join (select distinct(lat||''||lng), lat, lng, addr from ktwfloc_addr) a on x.lat = a.lat and x.lng = a.lng \
					where case when (stfail+dronst+largepc+smallpc)=0 then 0 else (stfail+dronst+largepc)::float/(stfail+dronst+largepc+smallpc)*100 end > 0" ,[ne.split(',')[0], sw.split(',')[0], ne.split(',')[1], sw.split(',')[1], poor ], 
					 function(err, result){
					// done()
					if(err){
						return console.error('error running query', err);
					}
					// console.log('result length is ', result.rows);
					result.rows.forEach(function(d){
						geojson.features.push({'geometry':{'type':'Point', 'coordinates':[parseFloat(d.lng), parseFloat(d.lat)]}, 
							'type':'Feature','properties':{'optrcom':getPlmnid(d.optrcom), 'id':d.id ,'addr':d.addr,'badness':parseFloat(d.badness),'modelvr':parseFloat(d.modelvr),'usrcnt':parseFloat(d.usrcnt),'sesscnt':parseFloat(d.sesscnt) } });	
					});					
					// // console.log(geojson)
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
				console.log('redis reply not null!');
				res.json(JSON.parse(reply));
			}else{
				client.query("select \
					optrcom, x.lat, x.lng, fullid as id, COALESCE(a.addr,'-') as addr, modelvr, case when (stfail+dronst+largepc+smallpc)=0 then 0 else (stfail+dronst+largepc)::float/(stfail+dronst+largepc+smallpc)*100*weight end as badness, usrcnt, sesscnt \
					from ( \
					SELECT \
					  c.lat, \
					  c.lng, \
					  c.fullid, \
					  min(split_part(c.fullid, '_', 1))  as optrcom, \
					  sum(c.usrcnt)  AS usrcnt, \
					  sum(c.sesscnt) AS sesscnt, \
					  sum(c.stfail)  AS stfail, \
					  sum(c.dronst)  AS dronst, \
					  sum(c.largepc) AS largepc, \
					  sum(c.smallpc) AS smallpc, \
					  (pow(sum(c.usrcnt) / 2, 2) :: FLOAT * pow(sum(c.sesscnt) / 2, 2) :: FLOAT) / \
					  ((1 + pow(sum(c.usrcnt) / 2, 2) :: FLOAT) * (1 + pow(sum(c.sesscnt) / 2, 2) :: FLOAT)) AS weight, \
					  COALESCE(min(mv.modelvr),1) as modelvr \
					FROM lteidux_badness c left join (select lat, lng, fullid, count(distinct model)::float/sum(usrcnt) as modelvr from lteidux_badness_dev where 1=1 \
					      and lat < $1 AND lat > $2 AND lng < $3 AND lng > $4 \
					      and case when (stfail+dronst+largepc+smallpc)=0  then 0 else (stfail+dronst+largepc)::float/(stfail+dronst+largepc+smallpc)*100 end > $5 \
					      group by lat,lng, fullid) mv on c.lat=mv.lat and c.lng=mv.lng and c.fullid=mv.fullid \
					  where 1=1  and c.lat >0 \
					  and c.lat<$1 and c.lat>$2 and c.lng<$3 and c.lng>$4 \
					GROUP BY c.lat, c.lng, c.fullid \
					) x left join (select distinct(lat||''||lng), lat, lng, addr from ktwfloc_addr) a on x.lat = a.lat and x.lng = a.lng \
					where case when (stfail+dronst+largepc+smallpc)=0 then 0 else (stfail+dronst+largepc)::float/(stfail+dronst+largepc+smallpc)*100 end > 0" ,[ne.split(',')[0], sw.split(',')[0], ne.split(',')[1], sw.split(',')[1], poor ], 
					 function(err, result){
					// done()
					if(err){
						return console.error('error running query', err);
					}
					// console.log('result length is ', result.rows);
					result.rows.forEach(function(d){
						geojson.features.push({'geometry':{'type':'Point', 'coordinates':[parseFloat(d.lng), parseFloat(d.lat)]}, 
							'type':'Feature','properties':{'optrcom':getPlmnid(d.optrcom), 'id':d.id ,'addr':d.addr,'badness':parseFloat(d.badness),'modelvr':parseFloat(d.modelvr),'usrcnt':parseFloat(d.usrcnt),'sesscnt':parseFloat(d.sesscnt) } });	
					});					
					// // console.log(geojson)
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
				console.log('redis reply not null!');
				res.json(JSON.parse(reply));
			}else{
				client.query("select \
					optrcom, x.lat, x.lng, bssid as id, COALESCE(a.addr,'-') as addr,modelvr, case when (stfail+dronst+largepc+smallpc)=0 then 0 else (stfail+dronst+largepc)::float/(stfail+dronst+largepc+smallpc)*100*weight end as badness, usrcnt, sesscnt \
					from ( \
					SELECT \
					  c.lat, \
					  c.lng, \
					  c.bssid, \
					  min(a.optrcom) as optrcom, \
					  sum(c.usrcnt)  AS usrcnt, \
					  sum(c.sesscnt) AS sesscnt, \
					  sum(c.stfail)  AS stfail, \
					  sum(c.dronst)  AS dronst, \
					  sum(c.largepc) AS largepc, \
					  sum(c.smallpc) AS smallpc, \
					  (pow(sum(usrcnt) / 2, 2) :: FLOAT * pow(sum(sesscnt) / 2, 2) :: FLOAT) / \
					  ((1 + pow(sum(usrcnt) / 2, 2) :: FLOAT) * (1 + pow(sum(sesscnt) / 2, 2) :: FLOAT)) AS weight, \
					  COALESCE(min(mv.modelvr),1) as modelvr \
					FROM apinfo a, bssidux_badness c left join (select lat, lng, bssid, count(distinct model)::float/sum(usrcnt) as modelvr from bssidux_badness_dev where 1=1 \
					    and lat<$1 and lat>$2 and lng<$3 and lng>$4 \
					    and case when (stfail+dronst+largepc+smallpc)=0  then 0 else (stfail+dronst+largepc)::float/(stfail+dronst+largepc+smallpc)*100 end > $5 \
					    group by lat,lng, bssid) mv on c.lat=mv.lat and c.lng=mv.lng and c.bssid=mv.bssid \
					  where 1=1 and c.lat >0 and c.bssid not in ('00:00:00:00:00:00')  and a.bssid=c.bssid \
					  and c.lat<$1 and c.lat>$2 and c.lng<$3 and c.lng>$4 \
					GROUP BY c.lat, c.lng, c.bssid \
					) x left join (select distinct(lat||''||lng), lat, lng, addr from ktwfloc_addr) a on x.lat = a.lat and x.lng = a.lng \
					where case when (stfail+dronst+largepc+smallpc)=0 then 0 else (stfail+dronst+largepc)::float/(stfail+dronst+largepc+smallpc)*100 end > 0" ,[ne.split(',')[0], sw.split(',')[0], ne.split(',')[1], sw.split(',')[1], poor], function(err, result){
					// done()
					if(err){
						return console.error('error running query', err);
					}
					result.rows.forEach(function(d){
						geojson.features.push({'geometry':{'type':'Point', 'coordinates':[parseFloat(d.lng), parseFloat(d.lat)]}, 
							'type':'Feature','properties':{'optrcom':d.optrcom, 'id':d.id ,'addr':d.addr,'modelvr':parseFloat(d.modelvr),'badness':parseFloat(d.badness),'usrcnt':parseFloat(d.usrcnt),'sesscnt':parseFloat(d.sesscnt) } });	
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

exports.chart_cell_list = function(req, res){
	var geojson = {'wf':[], 'cell':[]};
	var ne = req.param('ne', 0.0);
	var sw = req.param('sw', 0.0);
	var poor = req.param('poor', '20');
	// var scope = req.param('scope', '0,0,0,0:0,0,0,0');

	pg.connect(pgConStr, function(err, client, don){
		if(err){
			return console.error('error fetching client from pool', err);
		}
		var keys = TAG + "chart_cell_list_"+ne+"_"+sw+'_'+poor;
		redis.get(keys, function(err, reply){
			// console.error('redis err' , err);
			// console.log('redis reply ', reply);
			if(reply && reply!=null){
				console.log('redis reply not null!');
				res.json(JSON.parse(reply));
			}else{
				client.query("SELECT \
					split_part(c.fullid, '_', 1) as optrcom, \
					todow, \
					count(*) as cnt \
					FROM cellidux_badness_todow c \
					where 1=1 \
					and (stfail+dronst+largepc)::float/(stfail+dronst+largepc+smallpc)*100 >= $5 \
					and c.lat<$1 and c.lat>$2 and c.lng<$3 and c.lng>$4 \
					GROUP BY split_part(c.fullid, '_', 1), todow", 
				[ ne.split(',')[0], sw.split(',')[0], ne.split(',')[1], sw.split(',')[1], poor], function(err, result){
					if(err){
						return console.error('error running query', err);
					}
					result.rows.forEach(function(d){
						geojson.cell.push({'optrcom':getPlmnid(d.optrcom), 'todow':d.todow, 'badness':d.cnt })
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

exports.chart_lte_list = function(req, res){
	var geojson = {'wf':[], 'cell':[], 'lte':[]};
	var ne = req.param('ne', 0.0);
	var sw = req.param('sw', 0.0);
	var poor = req.param('poor', '20');
	// var scope = req.param('scope', '0,0,0,0:0,0,0,0');

	pg.connect(pgConStr, function(err, client, don){
		if(err){
			return console.error('error fetching client from pool', err);
		}
		var keys = TAG + "chart_lte_list_"+ne+"_"+sw+'_'+poor;
		redis.get(keys, function(err, reply){
			// console.error('redis err' , err);
			// console.log('redis reply ', reply);
			if(reply && reply!=null){
				console.log('redis reply not null!');
				res.json(JSON.parse(reply));
			}else{
				client.query("SELECT \
					split_part(c.fullid, '_', 1) as optrcom, \
					todow, \
					count(*) as cnt \
					FROM lteidux_badness_todow c \
					where 1=1 \
					and case when (stfail+dronst+largepc+smallpc)=0  then 0 else (stfail+dronst+largepc)::float/(stfail+dronst+largepc+smallpc)*100 end >= $5 \
					and c.lat<$1 and c.lat>$2 and c.lng<$3 and c.lng>$4 \
					GROUP BY split_part(c.fullid, '_', 1), todow", 
				[ ne.split(',')[0], sw.split(',')[0], ne.split(',')[1], sw.split(',')[1], poor], function(err, result){
					if(err){
						return console.error('error running query', err);
					}
					result.rows.forEach(function(d){
						geojson.lte.push({'optrcom':getPlmnid(d.optrcom), 'todow':d.todow, 'badness':d.cnt })
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

exports.chart_wf_list = function(req, res){
	var geojson = {'wf':[], 'cell':[]};
	var ne = req.param('ne', 0.0);
	var sw = req.param('sw', 0.0);
	var poor = req.param('poor', '20');
	// var scope = req.param('scope', '0,0,0,0:0,0,0,0');

	pg.connect(pgConStr, function(err, client, don){
		if(err){
			return console.error('error fetching client from pool', err);
		}
		var keys = TAG + "chart_wf_list_"+ne+"_"+sw+'_'+poor;
		redis.get(keys, function(err, reply){
			// console.error('redis err' , err);
			// console.log('redis reply ', reply);
			if(reply && reply!=null){
				console.log('redis reply not null!');
				res.json(JSON.parse(reply));
			}else{
				client.query("SELECT \
					a.optrcom, \
					todow, \
					count(*) as cnt \
					FROM bssidux_badness_todow c, apinfo a \
					where 1=1  and a.bssid=c.bssid \
					and case when (stfail+dronst+largepc+smallpc)=0  then 0 else (stfail+dronst+largepc)::float/(stfail+dronst+largepc+smallpc)*100 end >= $5 \
					and c.lat<$1 and c.lat>$2 and c.lng<$3 and c.lng>$4 \
					GROUP BY a.optrcom, todow order by 1,2", 
					[ ne.split(',')[0], sw.split(',')[0], ne.split(',')[1], sw.split(',')[1], poor ], function(err, result){
					// done()
					if(err){
						return console.error('error running query', err);
					}
					result.rows.forEach(function(d){
						geojson.wf.push({'optrcom':d.optrcom, 'todow':d.todow, 'badness':d.cnt })
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
	var poor = req.param('poor', '20');
	// var scope = req.param('scope', '0,0,0,0:0,0,0,0');

	pg.connect(pgConStr, function(err, client, don){
		if(err){
			return console.error('error fetching client from pool', err);
		}
		var keys = TAG + "treemap_cell_list_"+ne+"_"+sw+'_'+poor;
		redis.get(keys, function(err, reply){
			// console.error('redis err' , err);
			// console.log('redis reply ', reply);
			if(reply && reply!=null){
				console.log('redis reply not null!');
				res.json(JSON.parse(reply));
			}else{
				console.log([ ne.split(',')[0], sw.split(',')[0], ne.split(',')[1], sw.split(',')[1], poor]);
				client.query("select \
					  optrcom, brand, model, usrcnt, case when (stfail+dronst+largepc+smallpc)=0 then 0 else (stfail+dronst+largepc)::float/(stfail+dronst+largepc+smallpc)*100*weight end as badness \
					from ( \
					  SELECT \
					    split_part(fullid, '_', 1) as optrcom, \
					    brand, model, \
					    sum(usrcnt)  AS usrcnt, \
					    sum(sesscnt) AS sesscnt, \
					    sum(stfail)  AS stfail, \
					    sum(dronst)  AS dronst, \
					    sum(largepc) AS largepc, \
					    sum(smallpc) AS smallpc, \
					    (pow(sum(usrcnt) / 2, 2) :: FLOAT * pow(sum(sesscnt) / 2, 2) :: FLOAT) / \
					    ((1 + pow(sum(usrcnt) / 2, 2) :: FLOAT) * (1 + pow(sum(sesscnt) / 2, 2) :: FLOAT)) AS weight \
					  FROM cellidux_badness_dev \
					    where 1=1 \
					    AND lat<$1 and lat>$2 and lng<$3 and lng>$4 \
					  GROUP BY split_part(fullid, '_', 1), brand, model \
					) x where case when (stfail+dronst+largepc+smallpc)=0  then 0 else (stfail+dronst+largepc)::float/(stfail+dronst+largepc+smallpc)*100 end >= $5" ,
				[ ne.split(',')[0], sw.split(',')[0], ne.split(',')[1], sw.split(',')[1], poor ], function(err, result){
					// done()
					if(err){
						return console.error('error running query', err);
					}
					result.rows.forEach(function(d){
						geojson.cell.push({'optrcom':getPlmnid(d.optrcom), 'brand':d.brand, 'model':d.model, 'badness':d.badness, 'usrcnt':d.usrcnt })
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
	var poor = req.param('poor', '20');
	// var scope = req.param('scope', '0,0,0,0:0,0,0,0');

	pg.connect(pgConStr, function(err, client, don){
		if(err){
			return console.error('error fetching client from pool', err);
		}
		var keys = TAG + "treemap_lte_list_"+ne+"_"+sw+'_'+poor;
		redis.get(keys, function(err, reply){
			// console.error('redis err' , err);
			// console.log('redis reply ', reply);
			if(reply && reply!=null){
				console.log('redis reply not null!');
				res.json(JSON.parse(reply));
			}else{
				console.log([ ne.split(',')[0], sw.split(',')[0], ne.split(',')[1], sw.split(',')[1], poor]);
				client.query("select \
					  optrcom, brand, model, usrcnt, case when (stfail+dronst+largepc+smallpc)=0 then 0 else (stfail+dronst+largepc)::float/(stfail+dronst+largepc+smallpc)*100*weight end as badness \
					from ( \
					  SELECT \
					    split_part(fullid, '_', 1) as optrcom, \
					    brand, model, \
					    sum(usrcnt)  AS usrcnt, \
					    sum(sesscnt) AS sesscnt, \
					    sum(stfail)  AS stfail, \
					    sum(dronst)  AS dronst, \
					    sum(largepc) AS largepc, \
					    sum(smallpc) AS smallpc, \
					    (pow(sum(usrcnt) / 2, 2) :: FLOAT * pow(sum(sesscnt) / 2, 2) :: FLOAT) / \
					    ((1 + pow(sum(usrcnt) / 2, 2) :: FLOAT) * (1 + pow(sum(sesscnt) / 2, 2) :: FLOAT)) AS weight \
					  FROM cellidux_badness_dev \
					    where 1=1 \
					    AND lat<$1 and lat>$2 and lng<$3 and lng>$4 \
					  GROUP BY split_part(fullid, '_', 1), brand, model \
					) x where case when (stfail+dronst+largepc+smallpc)=0  then 0 else (stfail+dronst+largepc)::float/(stfail+dronst+largepc+smallpc)*100 end >= $5" ,
				[ ne.split(',')[0], sw.split(',')[0], ne.split(',')[1], sw.split(',')[1], poor ], function(err, result){
					// done()
					if(err){
						return console.error('error running query', err);
					}
					result.rows.forEach(function(d){
						geojson.lte.push({'optrcom':getPlmnid(d.optrcom), 'brand':d.brand, 'model':d.model, 'badness':d.badness, 'usrcnt':d.usrcnt })
					});					
					// // console.log(geojson)
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
	var poor = req.param('poor', '20');
	// var scope = req.param('scope', '0,0,0,0:0,0,0,0');

	pg.connect(pgConStr, function(err, client, don){
		if(err){
			return console.error('error fetching client from pool', err);
		}
		var keys = TAG + "treemap_wf_list_"+ne+"_"+sw+'_'+poor;
		redis.get(keys, function(err, reply){
			// console.error('redis err' , err);
			// console.log('redis reply ', reply);
			if(reply && reply!=null){
				console.log('redis reply not null!');
				res.json(JSON.parse(reply));
			}else{
				console.log([ ne.split(',')[0], sw.split(',')[0], ne.split(',')[1], sw.split(',')[1], poor]);
				client.query(" select \
					  optrcom, brand, model, usrcnt, case when (stfail+dronst+largepc+smallpc)=0 then 0 else (stfail+dronst+largepc)::float/(stfail+dronst+largepc+smallpc)*100*weight end as badness \
					from ( \
					  SELECT \
					    a.optrcom, brand, model, \
					    sum(usrcnt)  AS usrcnt, \
					    sum(sesscnt) AS sesscnt, \
					    sum(stfail)  AS stfail, \
					    sum(dronst)  AS dronst, \
					    sum(largepc) AS largepc, \
					    sum(smallpc) AS smallpc, \
					    (pow(sum(usrcnt) / 2, 2) :: FLOAT * pow(sum(sesscnt) / 2, 2) :: FLOAT) / \
					    ((1 + pow(sum(usrcnt) / 2, 2) :: FLOAT) * (1 + pow(sum(sesscnt) / 2, 2) :: FLOAT)) AS weight \
					  FROM bssidux_badness_dev d, apinfo a \
					    where 1=1  and a.bssid =d.bssid \
					    AND d.lat<$1 and d.lat>$2 and d.lng<$3 and d.lng>$4 \
					  GROUP BY a.optrcom, brand, model \
					) x  where case when (stfail+dronst+largepc+smallpc)=0  then 0 else (stfail+dronst+largepc)::float/(stfail+dronst+largepc+smallpc)*100 end >= $5 " ,
				[ ne.split(',')[0], sw.split(',')[0], ne.split(',')[1], sw.split(',')[1],  poor ], function(err, result){
					// done()
					if(err){
						return console.error('error running query', err);
					}
					result.rows.forEach(function(d){
						geojson.wf.push({'optrcom':d.optrcom, 'brand':d.brand, 'model':d.model,  'badness':d.badness, 'usrcnt':d.usrcnt })
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


exports.map_cell_info = function(req, res){
	var geojson = {'info':[]}
	var id = req.param('id', '');

	pg.connect(pgConStr, function(err, client, don){
		if(err){
			return console.error('error fetching client from pool', err);
		}
		var keynm = TAG + "map_cell_info_"+id;
		redis.get(keynm, function(err, reply){

			if(reply && reply!=null){
				console.log('redis reply not null!');
				res.json(JSON.parse(reply));
			}else{
				client.query("SELECT \
						  brand, model, \
						  sum(usrcnt) as badness \
						FROM cellidux_badness_dev \
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

exports.map_lte_info = function(req, res){
	var geojson = {'info':[]}
	var id = req.param('id', '');

	pg.connect(pgConStr, function(err, client, don){
		if(err){
			return console.error('error fetching client from pool', err);
		}
		var keynm = TAG + "map_lte_info_"+id;
		redis.get(keynm, function(err, reply){

			if(reply && reply!=null){
				console.log('redis reply not null!');
				res.json(JSON.parse(reply));
			}else{
				client.query("SELECT \
						  brand, model, \
						  sum(usrcnt) as badness \
						FROM lteidux_badness_dev \
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
				console.log('redis reply not null!');
				res.json(JSON.parse(reply));
			}else{
				client.query("SELECT \
						  brand, model, \
						  sum(usrcnt) as badness \
						FROM bssidux_badness_dev \
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

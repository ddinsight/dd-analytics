var express = require('express');
var path = require('path');
var pg = require('pg');
var pgConStr =  'postgres://USERNAME:PASSOWRD@POSTGRESERVER:PORT/DATABASENAME';

var redis = require('redis').createClient();
redis.on('error', function (err) {
  console.log('Error ' + err);
});


var TAG = 'contour_'


exports.map_cell_list = function(req, res){
	var geojson = [];
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
		console.log(keynm);
		redis.get(keynm, function(err, reply){

			if(reply && reply!=null){
				res.json(JSON.parse(reply));
			}else{
				client.query("select trunc(lat, 2) as lat, trunc(lng,2) as lng, \
							max(acc)::float/5000*100 as acc \
							from cellinfo where plmnid in ('45005','45006','45008') and lat>0  \
							group by trunc(lat,2), trunc(lng,2)" ,[ ], 
					 function(err, result){
						// done()
						if(err){
							return console.error('error running query', err);
						}
						// console.log('result length is ', result.rows);
						result.rows.forEach(function(d){
							geojson.push([parseFloat(d.lat), parseFloat(d.lng),parseFloat(d.acc)]);					
						});
						var vvv = JSON.stringify(geojson);
						redis.set(keynm, JSON.stringify(geojson));
						client.end();
						res.json(JSON.parse(vvv));
				});
			} // end of reply 
		});
	});
}


// exports.map_cell_list = function(req, res){
// 	var geojson = [];
// 	var ne = req.param('ne', 0.0);
// 	var sw = req.param('sw', 0.0);
// 	var poor = req.param('poor', 20);
// 	// var scope = req.param('scope', '0,0,0,0');
// 	console.log('map_cell_list');

// 	pg.connect(pgConStr, function(err, client, don){
// 		if(err){
// 			return console.error('error fetching client from pool', err);
// 		}
// 		var keynm = TAG + "map_cell_list_"+ne+"_"+sw+'_'+poor;
// 		console.log(keynm);
// 		redis.get(keynm, function(err, reply){

// 			if(reply && reply!=null){
// 				res.json(JSON.parse(reply));
// 			}else{
// 				client.query("select trunc(lat, 2) as lat, trunc(lng,2) as lng, \
// 							avg(acc)::float/5000*100 as acc \
// 							from cellinfo where plmnid in ('45005','45006','45008') and lat>0  AND lat < $1 AND lat > $2 AND lng < $3 AND lng > $4  \
// 							group by trunc(lat,2), trunc(lng,2)" ,[ne.split(',')[0], sw.split(',')[0], ne.split(',')[1], sw.split(',')[1] ], 
// 					 function(err, result){
// 						// done()
// 						if(err){
// 							return console.error('error running query', err);
// 						}
// 						// console.log('result length is ', result.rows);
// 						result.rows.forEach(function(d){
// 							geojson.push([parseFloat(d.lat), parseFloat(d.lng),parseFloat(d.acc)]);					
// 						});
// 						var vvv = JSON.stringify(geojson);
// 						redis.set(keynm, JSON.stringify(geojson));
// 						client.end();
// 						res.json(JSON.parse(vvv));
// 				});
// 			} // end of reply 
// 		});
// 	});
// }

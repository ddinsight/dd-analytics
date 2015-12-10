var express = require('express');
var path = require('path');
var pg = require('pg');
var pgConStr =  'postgres://USERNAME:PASSOWRD@POSTGRESERVER:PORT/DATABASENAME';

var redis = require('redis').createClient();
redis.on('error', function (err) {
  console.log('Error ' + err);
});

exports.list_mapdata = function(req, res){
	var geojson = {'type':'FeatureCollection', 'features':[],"properties":{
      "fields":{
         "5065":{
            "lookup":{
               "1":"Pedestrian",
               "3":"Motorcycle",
               "2":"Bicycle",
               "4":"Car"
            },
            "name":"Accident type"
         },
         "5055":{
            "name":"Date"
         },
         "5074":{
            "lookup":{
               "1":"Fatal",
               "3":"Serious injuries",
               "2":"Very serious injuries",
               "5":"No injuries",
               "4":"Minor injuries",
               "6":"Not recorded"
            },
            "name":"Injuries"
         }
      },
      "attribution":"",
      "description":""
   }}
	function getRandomInt(min, max) {
	    return Math.floor(Math.random() * (max - min + 1)) + min;
	}
	pg.connect(pgConStr, function(err, client, don){
		if(err){
			return console.error('error fetching client from pool', err);
		}
		redis.get("list_mapdata", function(err, reply){
			// console.error('redis err' , err);
			console.log('redis reply ', reply);
			if(reply && reply!=null){
				res.json(JSON.parse(reply));
			}else{
				client.query("select lat, lng from cellinfo where plmnid='45008' and lat > 0 limit 1000" ,[], function(err, result){
					// done()
					if(err){
						return console.error('error running query', err);
					}
					console.log('result length is ', result.rows);
					var i=0;
					result.rows.forEach(function(d){

						geojson.features.push({'geometry':{'type':'Point', 'coordinates':[parseFloat(result.rows[i].lng), parseFloat(result.rows[i].lat)]}, 
							'type':'Feature','properties':{'5065':getRandomInt(1,4).toString(), '5055':'2013-01-02','5074':getRandomInt(1,6).toString()} });	
						i++;
					});					
					// console.log(geojson)
					var vvv = JSON.stringify(geojson);
					redis.set("list_mapdata", JSON.stringify(geojson));
					client.end();
					res.json(JSON.parse(vvv));
				});
			}
		});
	});
}


exports.list_daumdata = function(req, res){
	var geojson = {'type':'FeatureCollection', 'features':[],"properties":{}};
	var ne = req.param('ne', 0.0);
	var sw = req.param('sw', 0.0);

	pg.connect(pgConStr, function(err, client, don){
		if(err){
			return console.error('error fetching client from pool', err);
		}
		redis.get("list_daumdata_"+ne+"_"+sw, function(err, reply){
			// console.error('redis err' , err);
			console.log('redis reply ', reply);
			if(reply && reply!=null){
				res.json(JSON.parse(reply));
			}else{
				console.log([ ne.split(',')[0], sw.split(',')[0], ne.split(',')[1], sw.split(',')[1] ]);
				client.query("select c.lat, c.lng, c.install, c.bssid, COALESCE(a.addr, c.bssid) as info from ktwfloc c left join ktwfloc_addr a on c.lat=a.lat and c.lng=a.lng where  c.lat < $1 and c.lat > $2 and c.lng < $3 and c.lng > $4" ,[ ne.split(',')[0], sw.split(',')[0], ne.split(',')[1], sw.split(',')[1] ], function(err, result){
					// done()
					if(err){
						return console.error('error running query', err);
					}
					console.log('result length is ', result.rows);
					var i=0;
					result.rows.forEach(function(d){
						geojson.features.push({'geometry':{'type':'Point', 'coordinates':[parseFloat(result.rows[i].lng), parseFloat(result.rows[i].lat)]},'type':'Feature', 'properties':{'bssid':result.rows[i].bssid, 'install':result.rows[i].install,'info':result.rows[i].info } });	
						i++;
					});					
					// console.log(geojson)
					var vvv = JSON.stringify(geojson);
					redis.set("list_daumdata_"+ne+"_"+sw, JSON.stringify(geojson));
					client.end();
					res.json(JSON.parse(vvv));
				});
			}
		});
	});
}



exports.wfcompanydata = function(req, res){
	var geojson = [];
	var ne = req.param('ne', 0.0);
	var sw = req.param('sw', 0.0);

	pg.connect(pgConStr, function(err, client, don){
		if(err){
			return console.error('error fetching client from pool', err);
		}
		redis.get("wfcompanydata_"+ne+"_"+sw, function(err, reply){
			// console.error('redis err' , err);
			console.log('redis reply ', reply);
			if(reply && reply!=null){
				res.json(JSON.parse(reply));
			}else{
				console.log([ ne.split(',')[0], sw.split(',')[0], ne.split(',')[1], sw.split(',')[1] ]);
				client.query(" select m.company, count(c.bssid) as cnt \
						from KTLmst m, ktwfloc c where 1=1 and c.install ='R' \
						and lat < $1 and lat > $2 and lng < $3 and lng > $4 \
						and c.bssid like m.oui||'%' and m.company <> 'unknown' \
						group by m.company " ,[ ne.split(',')[0], sw.split(',')[0], ne.split(',')[1], sw.split(',')[1] ], function(err, result){
					// done()
					if(err){
						return console.error('error running query', err);
					}
					console.log('result length is ', result.rows);
					var i=0;
					result.rows.forEach(function(d){
						geojson.push([result.rows[i].company, parseFloat(result.rows[i].cnt)] );	
						i++;
					});					
					// console.log(geojson)
					var vvv = JSON.stringify(geojson);
					redis.set("wfcompanydata_"+ne+"_"+sw, JSON.stringify(geojson));
					client.end();
					res.json(JSON.parse(vvv));
				});
			}
		});
	});
}



exports.cellwfdata = function(req, res){
	var geojson = {'cellsum':[], 'wfsum':[]};
	var ne = req.param('ne', 0.0);
	var sw = req.param('sw', 0.0);

	pg.connect(pgConStr, function(err, client, don){
		if(err){
			return console.error('error fetching client from pool', err);
		}
		redis.get("cellwfdata_"+ne+"_"+sw, function(err, reply){
			// console.error('redis err' , err);
			console.log('redis reply ', reply);
			if(reply && reply!=null){
				res.json(JSON.parse(reply));
			}else{
				console.log([ ne.split(',')[0], sw.split(',')[0], ne.split(',')[1], sw.split(',')[1] ]);
				client.query(" select mon,  sum(a.wfsum) as wfsum, sum(a.cellsum) as cellsum \
					from ktlcnt a, ktwfloc l where 1=1 \
					  and l.bssid = a.bssid \
					and lat < $1 and lat > $2 and lng < $3 and lng > $4 \
					group by mon" ,[ ne.split(',')[0], sw.split(',')[0], ne.split(',')[1], sw.split(',')[1] ], function(err, result){
					// done()
					if(err){
						return console.error('error running query', err);
					}
					console.log('result length is ', result.rows);
					var i=0;
					result.rows.forEach(function(d){
						geojson.cellsum.push( parseFloat(result.rows[i].cellsum) );	
						geojson.wfsum.push( parseFloat(result.rows[i].wfsum) );
						i++;
					});					
					// console.log(geojson)
					var vvv = JSON.stringify(geojson);
					redis.set("cellwfdata_"+ne+"_"+sw, JSON.stringify(geojson));
					client.end();
					res.json(JSON.parse(vvv));
				});
			}
		});
	});
}




exports.list_top10 = function(req, res){
	var geojson = {'typeA':[], 'typeR':[], 'typeD':[]};
	var ne = req.param('ne', 0.0);
	var sw = req.param('sw', 0.0);

	pg.connect(pgConStr, function(err, client, don){
		if(err){
			return console.error('error fetching client from pool', err);
		}
		redis.get("list_top10_"+ne+"_"+sw, function(err, reply){
			// console.error('redis err' , err);
			console.log('redis reply ', reply);
			if(reply && reply!=null){
				res.json(JSON.parse(reply));
			}else{
				console.log([ ne.split(',')[0], sw.split(',')[0], ne.split(',')[1], sw.split(',')[1] ]);
				client.query(" select * from (select 'A'::text as typ, i.ssid, c.bssid, COALESCE(d.addr,'-') as addr \
					from apinfo i, ktwfloc c left join ktwfloc_addr d on c.lat=d.lat and c.lng=d.lng \
					where 1=1 and install='A' and i.bssid=c.bssid and c.lat < $1 and c.lat > $2 and c.lng < $3 and c.lng > $4 order by ordr desc limit 10 ) a \
					union all \
					select * from (select 'R'::text as typ, i.ssid, c.bssid, COALESCE(d.addr,'-') as addr \
					from apinfo i, ktwfloc c left join ktwfloc_addr d on c.lat=d.lat and c.lng=d.lng \
					where 1=1 and install='R' and i.bssid=c.bssid and c.lat < $5 and c.lat > $6 and c.lng < $7 and c.lng > $8 order by ordr desc limit 10 ) b \
					union all \
					select * from ( select 'D'::text as typ, i.ssid, c.bssid, COALESCE(d.addr,'-') as addr \
					from apinfo i, ktwfloc c left join ktwfloc_addr d on c.lat=d.lat and c.lng=d.lng \
					where 1=1 and install='D' and i.bssid=c.bssid and c.lat < $9 and c.lat > $10 and c.lng < $11 and c.lng > $12 order by ordr desc limit 10 ) c " ,[ ne.split(',')[0], sw.split(',')[0], ne.split(',')[1], sw.split(',')[1], ne.split(',')[0], sw.split(',')[0], ne.split(',')[1], sw.split(',')[1], ne.split(',')[0], sw.split(',')[0], ne.split(',')[1], sw.split(',')[1] 
				], function(err, result){
					// done()
					if(err){
						return console.error('error running query', err);
					}
					console.log('result length is ', result.rows);
					var i=0;
					result.rows.forEach(function(d){
						if(result.rows[i].typ == 'A'){
							geojson.typeA.push({'ssid':result.rows[i].ssid, 'bssid':result.rows[i].bssid, 'addr':result.rows[i].addr})
						}else if (result.rows[i].typ == 'R'){
							geojson.typeR.push({'ssid':result.rows[i].ssid, 'bssid':result.rows[i].bssid, 'addr':result.rows[i].addr})
						}else if (result.rows[i].typ == 'D'){
							geojson.typeD.push({'ssid':result.rows[i].ssid, 'bssid':result.rows[i].bssid, 'addr':result.rows[i].addr})
						}
						// geojson.wfsum.push( parseFloat(result.rows[i].wfsum) );
						i++;
					});					
					// console.log(geojson)
					var vvv = JSON.stringify(geojson);
					redis.set("list_top10_"+ne+"_"+sw, JSON.stringify(geojson));
					client.end();
					res.json(JSON.parse(vvv));
				});
			}
		});
	});
}



exports.list_resultTrend = function(req, res){
	var geojson = {'wifitpavg':[], 'e303':[], 'zerocon':[]};
	var ne = req.param('ne', 0.0);
	var sw = req.param('sw', 0.0);

	pg.connect(pgConStr, function(err, client, don){
		if(err){
			return console.error('error fetching client from pool', err);
		}
		redis.get("list_resultTrend_"+ne+"_"+sw, function(err, reply){
			// console.error('redis err' , err);
			console.log('redis reply ', reply);
			if(reply && reply!=null){
				res.json(JSON.parse(reply));
			}else{
				console.log([ ne.split(',')[0], sw.split(',')[0], ne.split(',')[1], sw.split(',')[1] ]);
				client.query(" select \
				  mon, avg(wifitp) as wifitpavg, avg(e303) as e303, sum(case when conncnt=0 then 1 else 0 end) as zerocon \
				from ktwfloc l, ktlcnt c where l.bssid = c.bssid \
				and l.lat < $1 and l.lat > $2 and l.lng < $3 and l.lng > $4 \
				group by mon" ,[ ne.split(',')[0], sw.split(',')[0], ne.split(',')[1], sw.split(',')[1] ], function(err, result){
					// done()
					if(err){
						return console.error('error running query', err);
					}
					console.log('result length is ', result.rows);
					var i=0;
					result.rows.forEach(function(d){
						geojson.wifitpavg.push(parseFloat(result.rows[i].wifitpavg));
						geojson.e303.push(parseFloat(result.rows[i].e303));
						geojson.zerocon.push(parseFloat(result.rows[i].zerocon));
						i++;
					});					
					// console.log(geojson)
					var vvv = JSON.stringify(geojson);
					redis.set("list_resultTrend_"+ne+"_"+sw, JSON.stringify(geojson));
					client.end();
					res.json(JSON.parse(vvv));
				});
			}
		});
	});
}


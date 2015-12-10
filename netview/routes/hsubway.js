var express = require('express');
var path = require('path');
var pg = require('pg');
var mysql      = require('mysql');
var pgConStr =  'postgres://USERNAME:PASSOWRD@POSTGRESERVER:PORT/DATABASENAME';

var redis = require('redis').createClient();
redis.on('error', function (err) {
  console.log('Error ' + err);
});

var TAG = 'hsubway_'


exports.heat_list = function(req, res){
	var geojson = {'type':'FeatureCollection', 'features':[],"properties":{ "description":"Airplug, 2015 inc" }}
	var ne = req.param('ne', 0.0);
	var sw = req.param('sw', 0.0);
	var nt = req.param('nt', 'CELL'); // CELL,WIFI or CELL or WIFI
	var opcom = req.param('opcom', 'KT'); // KT,SKT or KT or SKT

	var ntarr = nt.indexOf(',')!=-1?nt.split(','):[nt];
	var opcomarr = nt.indexOf(',')!=-1?opcom.split(','):[opcom];
	// ntarr = ntarr.map(function(d) { return "'" + d + "'";});
	// opcomarr = opcomarr.map(function(d) { return "'" + d + "'";});
	console.log(ntarr.join(","));
	console.log(opcomarr.join(","));
	pg.connect(pgConStr, function(err, client, don){
		if(err){
			return console.error('error fetching client from pool', err);
		}
		var keynm = TAG + "heat_cell_list_"+ne+"_"+sw + "_" + nt + "_" + opcom;
		redis.get(keynm, function(err, reply){

			if(reply && reply!=null){
				res.json(JSON.parse(reply));
			}else{
				client.query("select split_part(s.hh06, '-',2) as hr, \
					  g.lat, g.lng, g.stid, \
					  sum(s.cellcnt) as cellcnt, \
					  sum(s.pscnt) as pscnt, \
					  sum(s.logcnt) as logcnt, \
					  sum(s.pltime) as pltime, \
					  sum(s.pausecnt) as pausecnt, \
					  sum(s.rxbytes) as rxbytes, \
					  sum(s.rxduration) as rxduration, \
					  sum(s.stpscnt) as stpscnt, \
					  sum(s.stfail) as stfail \
					from test.geosub g,test.subqoe s \
					where 1=1 \
					and g.stid=s.stid  \
					and nt in ($1) and opcom in ($2) \
					group by split_part(s.hh06, '-',2),g.lat, g.lng, g.stid \
					order by 1 " ,[ntarr.join(","), opcomarr.join(",")], 
					 function(err, result){
					// done()
					if(err){
						return console.error('error running query', err);
					}
					// console.log('result length is ', result.rows);
					var i=0;
					result.rows.forEach(function(d){
						// console.log(d);
						geojson.features.push({'geometry':{'type':'Point', 'coordinates':[parseFloat(d.lng), parseFloat(d.lat)]}, 
							'type':'Feature','properties':{'stid':d.stid,'hr':d.hr,
									'cellcnt':parseFloat(d.cellcnt),
									'pscnt':parseFloat(d.pscnt),
									'logcnt':parseFloat(d.logcnt),
									'pltime':parseFloat(d.pltime) ,
									'pausecnt':parseFloat(d.pausecnt), 
									'rxbytes':parseFloat(d.rxbytes) ,
									'rxduration':parseFloat(d.rxduration), 
									'stpscnt':parseFloat(d.stpscnt) ,
									'stfail':parseFloat(d.stfail) ,
						}});	
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
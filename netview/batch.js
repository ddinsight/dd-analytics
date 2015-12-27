var http = require('http');
var request = require('sync-request');

SVRADDR = 'http://example.com:1234; 

function getJsonfromUrl(url, callback){
	http.get(url, function(res){
	    var body = '';

	    res.on('data', function(chunk){
	        body += chunk;
	    });

	    res.on('end', function(){
	        var fbResponse = JSON.parse(body);
	        // console.log(fbResponse);
	        console.log('in callback');
	        callback(fbResponse);
	    });
	}).on('error', function(e){
	      console.log("Got an error: ", e);
	});

}

function getJsonFromUrlSync(url, callback){
	try{
		var res = request('GET', url, {
		  'headers': {
		    'Content-Type': 'application/json; charset=utf-8;',
		    'timeout':60000,
		    'retry': 3,
		    'retryDelay':30000
		  }
		});
		callback( JSON.parse(res.getBody()) );
	}catch(err){
		console.log('err is '  + err);
		setTimeout(function(){
			console.log('after setTimeout function---->');
			getJsonFromUrlSync(url, callback);
		}, 30000);
	}
	
	// request('GET', url).done(function (res) {
	//   callback(JSON.parse(res.getBody()));
	// });

}


function orealList(){
	var url = SVRADDR + '/api/v1.8/oreal/map/lte/newfactor/list?recent=0.7&sw=37.197518%2C126.182098&ne=37.959357%2C127.922058';
	getJsonFromUrlSync(url, orealParser);

}

function orealParser(data){
	console.log('-- orealParser --');
	// console.log(data.features);
	data.features.forEach(function(d, i){
		// if(i < 11){
			console.log(d.properties['id']);
			movement(d.properties['id']);
			nearcell(d.properties['id']);
			heat(d.properties['id']);
			wifiloc(d.properties['id']);
			detail(d.properties['id']);
			indicator(d.properties['id']);	
		// }
	});
}

function log(d){ console.log(d); }

function movement(fullid){
	var url = SVRADDR + '/api/v1.8/oreal/map/fullid/badness/movement?fullid=' + fullid;
	getJsonFromUrlSync(url, log);
}

function nearcell(fullid){
	var url = SVRADDR + '/api/v1.8/oreal/map/fullid/nearcell?fullid=' + fullid;
	getJsonFromUrlSync(url, log);
}
function heat(fullid){
	var url = SVRADDR + '/api/v1.8/oreal/heat/cell/list?fullid=' + fullid;
	getJsonFromUrlSync(url, log);
}
function wifiloc(fullid){
	var url = SVRADDR + '/api/v1.8/oreal/wifiloc/cell/list?fullid=' + fullid;
	getJsonFromUrlSync(url, log);
}
function detail(fullid){
	var url = SVRADDR + '/api/v1.8/oreal/map/fullid/detail?fullid=' + fullid;
	getJsonFromUrlSync(url, log);
}
function indicator(fullid){
	var url = SVRADDR + '/api/v1.8/oreal/map/fullid/indicator?fullid=' + fullid;
	getJsonFromUrlSync(url, log);
}

orealList();





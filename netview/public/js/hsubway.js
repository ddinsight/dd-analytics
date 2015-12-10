// var map = L.map('map', {
// 	center: [48, -3],
// 	zoom: 5,
// 	zoomControl: false
// });

// var CartoDB_DarkMatterNoLabels = L.tileLayer('http://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}.png', {
// 	attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="http://cartodb.com/attributions">CartoDB</a>',
// 	subdomains: 'abcd',
// 	maxZoom: 19
// });
// $('#slider').slider({value: 60,
//                animate:"slow",
//                orientation: "horizontal"
//              });
var cfg = {
  "radius": .005,
  "maxOpacity": 1, 
  "scaleRadius": true, 
  "useLocalExtrema": false,
  latField:'lat',
  lngField:'lng',
  valueField: 'value'
};

var heatmapLayer = new HeatmapOverlay(cfg);


var center = [37.56539874977264,126.99637413024901];
// var osmUrl = 'http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png',
var osmUrl = 'http://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}.png',
    osmAttrib = '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; <a href="http://cartodb.com/attributions">CartoDB</a>',
    osm = L.tileLayer(osmUrl, {maxZoom: 18, attribution: osmAttrib});

var railmap = new L.TileLayer('http://{s}.tiles.openrailwaymap.org/standard/{z}/{x}/{y}.png',
{
	attribution: 'openrailwaymap',
	minZoom: 2,
	maxZoom: 19,
	tileSize: 256
});

var map1 = new L.Map('map1', {layers: [_.clone(osm), heatmapLayer], center: new L.LatLng(center[0], center[1]), zoom: 11, zoomControl:true });
map1.doubleClickZoom.disable();
map1.scrollWheelZoom.disable();



var map2 = new L.Map('map2', {layers: [_.clone(osm)], center: new L.LatLng(center[0], center[1]), zoom: 11, zoomControl:true });
map2.doubleClickZoom.disable();
map2.scrollWheelZoom.disable();

map1.on('moveend', follow).on('zoomend', follow);
map2.on('moveend', follow).on('zoomend', follow);	
var quiet = false;

function follow(e) {
  if (quiet) return;
  quiet = true;
  if (e.target === map1) sync(map2, e);
  if (e.target === map2) sync(map1, e);
  quiet = false;
}

function sync(map, e) {
  map.setView(e.target.getCenter(), e.target.getZoom(), {
      animate: false,
      reset: true
  });
}



var currentWeek = 0;
var currentHour = 0;
// heatmapLayer.addTo(map1);

$.getJSON('/api/v1.4/hsubway/heat/list?nt=CELL&opcom=KT', function(rawData){
	console.log(rawData.features);
	var ndata = d3.nest()
		// .key(function(d){ return d.properties.wk; })
		.key(function(d){ return d.properties.hr; })
		.entries(rawData.features);
	console.log(ndata);

	var minmax = d3.extent(rawData.features, function(d){ return d.properties.pausecnt;});
	console.log(minmax);
	var ranges =[];
	for(var i=1;i<16;i++) ranges.push(i);
	var normal = d3.scale.quantize().domain(minmax).range(ranges);
	console.log('----------------');
	console.log(normal(300));

	var nextTime = 2,
		intervalCounter = 20,
		data = {
			min:0,
			max:15,
			data:[]
		};


	var stop = setInterval(function(){
		if(intervalCounter == 20){
			intervalCounter = 0;
			getAnotherTime();			
		}else{
			intervalCounter++;
		}
		var newData = [];
		for(var j=0;j<data.data.length;j++){
			var point = data.data[j];
			if(point.value >= 15){
				point.fresh = false;
			}
			if(point.fresh){
				point.value = point.value + 1.2;				
			}else{
				point.value = point.value - .4;
			}	
			
			if(point.value > 0){
				newData.push(data.data[j]);
			}
		}
		data.data = newData;
		heatmapLayer.setData(data);
		console.log(data);

	},200);

	function getAnotherTime(){
		console.log('getAnotherTime[' +nextTime+ ']');
		if(nextTime > 24){
			clearInterval(stop);
		}
		var timeCounter = 0;
		var currentData = ndata.filter(function(d){ return parseInt(d.key) == nextTime; });
		// console.log(currentData[0]);
		try{
			currentData[0].values.forEach(function(d,i){
				data.data.push({'lat':parseFloat(d.geometry.coordinates[1]),'lng':parseFloat(d.geometry.coordinates[0]),'value':normal(d.properties['pausecnt']), 'fresh':true})
				// data.data.push({'lat':parseFloat(d.geometry.coordinates[1]),'lng':parseFloat(d.geometry.coordinates[0]),'value':0, 'fresh':true})
			});
		}catch(e){
			clearInterval(stop);
		}
		
		nextTime++;
	}

});





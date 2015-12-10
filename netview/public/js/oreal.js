function crypt_cellid(cellid){
  return cellid.split('_')[0] + '_****' + String(cellid.split('_')[1]).slice(4)  + '_' + cellid.split('_')[2]; 
}
// console.log('45006_51057152_24915' +'/' + crypt_cellid('45006_51057152_24915'));


// ------------------------------------------------------------------------
// Default Setting 
// ------------------------------------------------------------------------

var scripts = document.getElementsByTagName('script');
var myScript = scripts[ scripts.length - 1 ];

var queryString = myScript.src.replace(/^[^\?]+\??/,'');


function parseQuery ( query ) {
   var Params = new Object ();
   if ( ! query ) return Params; // return empty object
   var Pairs = query.split(/[;&]/);
   for ( var i = 0; i < Pairs.length; i++ ) {
      var KeyVal = Pairs[i].split('=');
      if ( ! KeyVal || KeyVal.length != 2 ) continue;
      var key = unescape( KeyVal[0] );
      var val = unescape( KeyVal[1] );
      val = val.replace(/\+/g, ' ');
      Params[key] = val;
   }
   return Params;
}
var params = parseQuery( queryString );
console.log(params.t);
Highcharts.theme.colors = [  "#7798BF", "#f45b5b","#aaeeee", "#ff0066", "#eeaaee", "#55BF3B", "#DF5353", "#7798BF", "#aaeeee","#2b908f", "#90ee7e"];

// L.mapbox.accessToken = 'pk.eyJ1Ijoiamlob29uaSIsImEiOiI5X0NHNWswIn0.xgBuGcqZetZBwmr0VZuSWw';
// var cmap = L.mapbox.map('cmap', 'mapbox.streets', {maxZoom:18}).setView([37.49800253054263,127.02608766689583], 12);
// var tmap = L.mapbox.map('tmap', 'mapbox.streets', {maxZoom:18}).setView([37.49800253054263,127.02608766689583], 12);
var cmap = L.map('cmap', {
						crs: L.Proj.CRS.TMS.Daum,
						continuousWorld: true,
						worldCopyJump: false,
						zoomControl: true
					}).setView([37.49800253054263,127.02608766689583], 4),
		tmap = L.map('tmap', {
						crs: L.Proj.CRS.TMS.Daum,
						continuousWorld: true,
						worldCopyJump: false,
						zoomControl: true
					}).setView([37.49800253054263,127.02608766689583], 4)

var baseLayers1 = {
	'<h6>Street</h6>': L.Proj.TileLayer.TMS.provider('DaumMap.Street').addTo(cmap),
	'<h6>Satellite</h6>' : L.Proj.TileLayer.TMS.provider('DaumMap.Satellite')
};

var overlayLayers1 = {
	'<h6>Hybrid</h6>' : L.Proj.TileLayer.TMS.provider('DaumMap.Hybrid'),
	// 'Physical Layers' : L.Proj.TileLayer.TMS.provider('DaumMap.Physical')
};


var baseLayers2 = {
	'<h6>Street</h6>': L.Proj.TileLayer.TMS.provider('DaumMap.Street'),
	'<h6>Satellite</h6>' : L.Proj.TileLayer.TMS.provider('DaumMap.Satellite').addTo(tmap)
};

var overlayLayers2 = {
	'<h6>Hybrid</h6>' : L.Proj.TileLayer.TMS.provider('DaumMap.Hybrid'),
	// 'Physical Layers' : L.Proj.TileLayer.TMS.provider('DaumMap.Physical')
};

L.Proj.TileLayer.TMS.provider('DaumMap.Street').addTo(cmap);
L.control.layers(baseLayers1, overlayLayers1, {collapsed: false}).addTo(cmap);
L.Proj.TileLayer.TMS.provider('DaumMap.Street').addTo(tmap);
L.control.layers(baseLayers2, overlayLayers2, {collapsed: false}).addTo(tmap);

cmap.scrollWheelZoom.disable();
tmap.scrollWheelZoom.disable();

cmap.on('moveend', follow).on('zoomend', follow);
tmap.on('moveend', follow).on('zoomend', follow);	
// console.log(tmap);
function follow(e) {
  if (quiet) return;
  quiet = true;
  if (e.target === cmap) sync(tmap, e);
  if (e.target === tmap) sync(cmap, e);
  quiet = false;
}

function sync(map, e) {
  map.setView(e.target.getCenter(), e.target.getZoom(), {
      animate: false,
      reset: true
  });
}
var dragging = false;

cmap.on('dragend', function(e) {
	if(dragging){
		return;
	}
	dragging = true;
  setTimeout(function(){
  	console.log('tmap-dragend');
	},500);
});

tmap.on('dragend', function(e) {
	if(dragging){
		return;
	}
	dragging = true;
	setTimeout(function(){
		console.log('tmap-dragend');
	},500);
});
// ------------------------------------------------------------------------
// For Menu
// ------------------------------------------------------------------------

var quiet = false;


// 37.55138234931889, 127.0107078552246
var networks = [
  {'name':'LTE','key':'lte'},
  // {'name':'Celluar','key':'cell'}
];
networks.forEach(function(k){
  $('#networkmenus').append('<li><a href="#" onclick="_ch(\''+k.key+'\');">'+k.name+'</a></li>')
});
var ntype = networks[0];

var movements = [
  {'name':'Prev Bad traffic','key':'badness'},
  {'name':'All Bad traffic','key':'all'},
];
movements.forEach(function(k){
  $('#movementmenus').append('<li><a href="#" onclick="_movech(\''+k.key+'\');">'+k.name+'</a></li>')
});
var movement = movements[0];


var factors = [
  {'name':'Very short-term','key':'dwfactor'},
  {'name':'Short-term','key':'wfactor'},
  {'name':'Full range','key':'wofactor'}
];
factors.forEach(function(k){
  $('#factormenus').append('<li><a href="#" onclick="_fch(\''+k.key+'\');">'+k.name+'</a></li>')
});
var nfactor = factors[0];

var timezones = [
	{'name':'0H-24H','key':'rxbytes'},
  {'name':'3H~','key':'t01'},
  {'name':'9H~','key':'t02'},
  {'name':'15H~','key':'t03'},
  {'name':'21H~','key':'t04'},
];
timezones.forEach(function(k){
  $('#timezonemenus').append('<li><a href="#" onclick="_timech(\''+k.key+'\');">'+k.name+'</a></li>')
});
var timezone = timezones[0];


var comparegroups = [
  {'name':'LG U+', 'key':'lgt','names':['LG U+'], 'values':['LGT']},
  {'name':'Korea Telecom', 'key':'kt','names':['KT'], 'values':['KT']},
  {'name':'SK Telecom', 'key':'skt','names':['SKT'], 'values':['SKT']},
];
comparegroups.forEach(function(k){
  $('#optrcommenus').append('<li><a href="#" onclick="_gr(\''+k.key+'\');">'+k.name+'</a></li>')
});
var group = comparegroups[0];
if(localStorage.getItem("oreal_group")){
  group = comparegroups.filter(function(d){return d.key == localStorage.getItem("oreal_group")})[0];
}else{
  group = comparegroups[0];
}

var biases = [
  {'name':'~1','key':1},
	{'name':'~0.7','key':0.7},
  {'name':'~0.5','key':0.5},
  {'name':'~0.3','key':0.3},
];
biases.forEach(function(k){
  $('#biasmenus').append('<li><a href="#" onclick="_biasch(\''+k.key+'\');">'+k.name+'</a></li>')
});
var bias = biases[0];


$('#curnetwork').html(ntype.name); 
$('#curgroup').html(group.name);
$('#curfactor').html(nfactor.name);
$('#curmovement').html(movement.name);
$('#curtimezone').html(timezone.name);
$('#curbias').html(bias.name);

function _ch(kk){
  ntype = networks.filter(function(d){ return d.key == kk; })[0]
  $('#curnetwork').html(ntype.name); 
  paintMap();
	
}

function _fch(kk){
  nfactor = factors.filter(function(d){ return d.key == kk; })[0]
  $('#curfactor').html(nfactor.name); 
  paintMap();	
}

function _timech(kk){
  timezone = timezones.filter(function(d){ return d.key == kk; })[0]
  $('#curtimezone').html(timezone.name); 
  paintMap();	
}

function _biasch(kk){
  bias = biases.filter(function(d){ return d.key == kk; })[0]
  $('#curbias').html(bias.name); 
  paintMap();	
}

function _gr(kk){
  group = comparegroups.filter(function(d){ return d.key == kk; })[0];
  localStorage.setItem("oreal_group", group.key);
  $('#curgroup').html(group.name); 
  paintMap();
	
}

function _movech(kk){
  movement = movements.filter(function(d){ return d.key == kk; })[0]
  $('#curmovement').html(movement.name); 
}


var areas = [
  {"center": {"lat":37.52443079581378 ,"lng":126.96916580200195 ,"zoom":4 }, "name":"서울", "boundaries":{"ne":{"lat":37.9593578107923, "lng":127.92205810546875}, "sw":{"lat":37.19751842118354,"lng":126.18209838867186}}},
	// {"center": {"lat":35.14658217841792 ,"lng":129.05193328857422 ,"zoom":6 }, "name":"부산", "boundaries":{"ne":{"lat":35.28648191701513, "lng":129.24323789062498}, "sw":{"lat":34.949489967541254,"lng":128.78112546386717}}},
	// {"center": {"lat":37.481669473029186,"lng":126.66824340820314 ,"zoom":6 }, "name":"인천", "boundaries":{"ne":{"lat":37.6612592529608,  "lng":126.76969939687092}, "sw":{"lat":37.33439921181131, "lng":126.3075869701131}}},
 //  {"center": {"lat":37.32894564456342 ,"lng":127.91999816894531 ,"zoom":6 }, "name":"원주", "boundaries":{"ne":{"lat":37.44278587362785, "lng":128.05786756591795}, "sw":{"lat":37.27905632743658, "lng":127.86148695068357}}},
 //  {"center": {"lat":35.14517852220056 ,"lng":126.8646240234375  ,"zoom":6 }, "name":"광주", "boundaries":{"ne":{"lat":35.289155727862166,"lng":127.01313642578123}, "sw":{"lat":34.952174861742954,"lng":126.62037519531248}}},
 //  {"center": {"lat":35.82769553808818 ,"lng":127.13790893554688 ,"zoom":6 }, "name":"전주", "boundaries":{"ne":{"lat":36.08942535003392, "lng":127.22874311523435}, "sw":{"lat":35.755794801592934,"lng":126.8359818847656}}},
 //  {"center": {"lat":35.542283716477264,"lng":129.3083953857422  ,"zoom":6 }, "name":"울산", "boundaries":{"ne":{"lat":35.74276090770887, "lng":129.49633026754407}, "sw":{"lat":35.407670973781705,"lng":129.10356903707532}}},
 //  {"center": {"lat":35.85663965115521 ,"lng":128.57248306274414 ,"zoom":6 }, "name":"대구", "boundaries":{"ne":{"lat":36.039809841293156,"lng":128.8110580507472},  "sw":{"lat":35.705969666916374,"lng":128.41829682027844}}},
 //  {"center": {"lat":36.33517895655434 ,"lng":127.40209579467772 ,"zoom":6 }, "name":"대전", "boundaries":{"ne":{"lat":36.54454603222065, "lng":127.54419708883313}, "sw":{"lat":36.212850099635745,"lng":127.15143585836438}}},
 //  {"center": {"lat":36.806948220671735,"lng":127.13241577148436 ,"zoom":6 }, "name":"천안", "boundaries":{"ne":{"lat":36.97417995822917, "lng":127.29288483297375}, "sw":{"lat":36.644329632117284,"lng":126.900123602505}}},
 //  {"center": {"lat":33.38386623304054 ,"lng":126.51168823242189 ,"zoom":4 }, "name":"제주", "boundaries":{"ne":{"lat":33.67006843120305, "lng":127.13996887207031}, "sw":{"lat":33.09671883650731, "lng":125.88340759277342}}}
]

areas.forEach(function(d){
  $('#areas').append('<li><a href="#" onclick="_loc('+d['center']['lat']+','+d['center']['lng']+','+d['center']['zoom']+')">'+d['name']+'</a></li>');
});
var _area = areas[0];
$('#curArea').html(_area.name);

ST = {
	set : function(key, value){
		localStorage.setItem(key, JSON.stringify(value));
	},
	get : function(key){
		return JSON.parse(localStorage.getItem(key));
	}
}

// var dragging = false;
function _loc(lat, lng, zoom){
  _area = areas.filter(function(d){ return d['center']['lat']==lat && d['center']['lng']==lng;})[0];
  $('#curArea').html(_area.name);
  cmap.setView([lat,lng], zoom);
  setTimeout(function(){
    paintMap();

  },500);
}


// ------------------------------------------------------------------------
// For Body
// ------------------------------------------------------------------------


var markersref = {'c1':{}, 'c2':{}};
var tmarkersref = {'c1':{}, 'c2':{}};
var quantscale = {'cell':[25,50,75,100], 'lte':[25,50,75,100], 'colors':['#a6d96a','#ffffbf','#fdae61','#d7191c'], 'names':['Good','Fair','Poor','Very Poor']};

function initDashboard(){
  var cyhtml1='', cyhtml2='';
  quantscale.colors.forEach(function(d,i){
    cyhtml1 += '<td style="font-size:22px;"><span style="color:#'+d+';" id="dashc1_'+quantscale.names[i].replace(' ','')+'">-</span></td>';
    cyhtml2 += '<td style="font-size:22px;"><span style="color:#'+d+';" id="dashc2_'+quantscale.names[i].replace(' ','')+'">-</span></td>';
  });
  $("#cmaplegend").html(cyhtml1); $("#tmaplegend").html(cyhtml2);
}

initDashboard();
// function paintMap(url, type){
function paintMap(){

	dragging = true;
	$('#loading').css('display', 'block');

	nearcell.forEach(function(d){ cmap.removeLayer(d); tmap.removeLayer(d); });
	movementcell.forEach(function(d){ cmap.removeLayer(d); tmap.removeLayer(d); });
	detailheats.forEach(function(d){ cmap.removeLayer(d); tmap.removeLayer(d);});
	wifilocs.forEach(function(d){ cmap.removeLayer(d); tmap.removeLayer(d);});

	dragging = true;
	var mapGeostruc = {
			"type":"FeatureCollection", "features":[], 
			"properties":{
				"fields":{
					"category":{"name":"badcategory","lookup":{"1":"Poor","2":"Fair","3":"Good","4":"Very Good","5":"Excellent"}}
				}, "attribution":"Airplug 2015 Inc."
			}
		}  ,
    metadata = mapGeostruc.properties,
    categoryField = 'badcategory', //This is the fieldname for marker category (used in the pie and legend)
    iconField = 'badcategory', //This is the fieldame for marker icon
    rmax = 30; //Maximum radius for cluster pies
  // console.log('metadata===>');
  // console.log(metadata);
	function defineFeature(feature, latlng) {
	  var categoryVal = feature.properties[categoryField],
	    iconVal = feature.properties[categoryField];
	    var myClass = 'marker category-'+categoryVal+' icon-'+iconVal;
	    var myIcon = L.divIcon({
	        className: myClass,
	        iconSize:null
	    });
	    return L.marker(latlng, {icon: myIcon});
	}

	function defineFeaturePopup(feature, layer) {
	  var props = feature.properties;
	  var subwaytxt = props['subway'] && props['subway']!='not' ? ' [' + props['subway'] +']' : '';
		var infocontent = '<table class="table table-striped table-hover text-center"><thead style="color:#fff;"><tr><td>ID</td><td>Badness</td><td>Sessions</td><td>Users</td><td>Traffic(Hr)</td><td>Addr</td><td>Recent</td><td>TCI</td></tr></thead><tbody><tr><td class="success" style="cursor:pointer;text-decoration: underline;" onclick="paintTable(\''+props['id']+'\', '+Math.round(props['tci']*100)/100+')">'+crypt_cellid(props['id'])+'('+getcid(props['id'])+')'+'</td><td class="danger">'+Math.round(props['badness']*100)/100+' %</td><td class="warning">'+props['sesscnt']+'</td><td class="info">'+props['usrcnt']+'('+props['badusrrate']+'%)</td><td class="success">'+Math.round(parseFloat(props['rxbytes'])*10)/10+'</td><td class="danger">'+props['addr'] +subwaytxt+'</td><td class="warning">'+(_.isNaN(props['recentness'])?'-':props['recentness'])+'/'+(_.isNaN(props['rrecentness'])?'-':props['rrecentness'])+'</td><td class="info">'+(_.isNaN(props['tci'])?'-':Math.round(props['tci']*100)/100 )+'</td></tr></tbody></table>';
	  layer.bindPopup(infocontent,{offset: L.point(1,-2), maxWidth: 700});
	}

	function defineClusterIcon(cluster) {

    var children = cluster.getAllChildMarkers(),
        n = children.length, //Get number of markers in cluster
        strokeWidth = 1, //Set clusterpie stroke width
        r = rmax-2*strokeWidth-(n<10?12:n<100?8:n<1000?4:0), //Calculate clusterpie radius...
        iconDim = (r+strokeWidth)*2, //...and divIcon dimensions (leaflet really want to know the size)
        data = d3.nest() //Build a dataset for the pie chart
          .key(function(d) { return d.feature.properties[categoryField]; })
          .entries(children, d3.map),
        //bake some svg markup
        html = bakeThePie({data: data,
                            valueFunc: function(d){ return d.values.length;  }, 
                            legendFunc: function(d){ 
                            	var ccc = 0, ooo=0;;
                            	d.forEach(function(o){
                          			ccc += o.values.filter(function(a){return a.feature.properties.tci >= 0.3; }).length;
                          			ooo += o.values.length;
                            	});
                            	return ccc/ooo*100;
                            }, 
                            strokeWidth: 1,
                            outerRadius: r,
                            innerRadius: r-10,
                            pieClass: 'cluster-pie',
                            pieLabel: n,
                            pieLabelClass: 'marker-cluster-pie-label',
                            pathClassFunc: function(d){return "category-"+d.data.key;},
                            pathTitleFunc: function(d){return console.log(''); metadata.fields[categoryField].lookup[d.data.key];}
                          }),
        //Create a new divIcon and assign the svg markup to the html property
        myIcon = new L.DivIcon({
            html: html,
            className: 'marker-cluster', 
            iconSize: new L.Point(iconDim, iconDim)
        });
    return myIcon;
	}

	/*function that generates a svg markup for the pie chart*/
	function bakeThePie(options) {
	    /*data and valueFunc are required*/
	    if (!options.data || !options.valueFunc) {
	        return '';
	    }
	    var data = options.data,
	        valueFunc = options.valueFunc,
	        legendFunc = options.legendFunc,
	        r = options.outerRadius?options.outerRadius:28, //Default outer radius = 28px
	        rInner = options.innerRadius?options.innerRadius:r-10, //Default inner radius = r-10
	        strokeWidth = options.strokeWidth?options.strokeWidth:1, //Default stroke is 1
	        pathClassFunc = options.pathClassFunc?options.pathClassFunc:function(){return '';}, //Class for each path
	        pathTitleFunc = options.pathTitleFunc?options.pathTitleFunc:function(){return '';}, //Title for each path
	        pieClass = options.pieClass?options.pieClass:'marker-cluster-pie', //Class for the whole pie
	        pieLabel = options.pieLabel?options.pieLabel:d3.sum(data,valueFunc), //Label for the whole pie
	        // pieLabel = legendFunc?legendFunc:options.pieLabel, 
	        pieLabelClass = options.pieLabelClass?options.pieLabelClass:'marker-cluster-pie-label',//Class for the pie label
	        
	        origo = (r+strokeWidth), //Center coordinate
	        w = origo*2, //width and height of the svg element
	        h = w,
	        donut = d3.layout.pie(),
	        arc = d3.svg.arc().innerRadius(rInner).outerRadius(r);
	        
	    //Create an svg element
	    var svg = document.createElementNS(d3.ns.prefix.svg, 'svg');
	    //Create the pie chart
	    var vis = d3.select(svg)
	        .data([data])
	        .attr('class', pieClass)
	        .attr('width', w)
	        .attr('height', h);
	        
	    var arcs = vis.selectAll('g.arc')
	        .data(donut.value(valueFunc))
	        .enter().append('svg:g')
	        .attr('class', 'arc')
	        .attr('transform', 'translate(' + origo + ',' + origo + ')');
	    
	    arcs.append('svg:path')
	        .attr('class', pathClassFunc)
	        .attr('stroke-width', strokeWidth)
	        .attr('d', arc)
	        .append('svg:title')
	          .text(pathTitleFunc);

			if(legendFunc(data)	> 1 ){
				vis.append('circle')
						.attr('r', rInner)
						.attr('cx', origo)
						.attr('cy', origo)
						.attr('fill', '#4d4d4d');							
		    vis.append('text')
		        .attr('x',origo)
		        .attr('y',origo)
		        .attr('class', pieLabelClass)
		        .attr('text-anchor', 'middle')
		        .attr('dy','.3em')
		        .attr('fill', 'white')
		        .text(pieLabel);						
			}else{
		    vis.append('text')
		        .attr('x',origo)
		        .attr('y',origo)
		        .attr('class', pieLabelClass)
		        .attr('text-anchor', 'middle')
		        .attr('dy','.3em')
		        .text(pieLabel);					
			}

	    return serializeXmlNode(svg);
	}

	/*Helper function*/
	function serializeXmlNode(xmlNode) {
	    if (typeof window.XMLSerializer != "undefined") {
	        return (new window.XMLSerializer()).serializeToString(xmlNode);
	    } else if (typeof xmlNode.xml != "undefined") {
	        return xmlNode.xml;
	    }
	    return "";
	}
	

	var data = [];
	var sigma = {'badness':[1,2,3], 'traffic':[0.1,0.4,1.5]};

	url = '/api/v1.8/oreal/map/'+ntype.key+'/newfactor/list';
// var url = '/api/v1.8/oreal/map/'+ntype.key+'/'+nfactor.key+'/list'
	var recentky = nfactor.key=='wfactor'?0.4:nfactor.key=='dwfactor'?0.7:0.0;
	console.log('paintMap recent is ' + recentky);
	$.getJSON(url, {'t':params.t, 'recent':recentky, 'sw' : Math.floor(_area.boundaries.sw.lat*1000000)/1000000+','+Math.floor(_area.boundaries.sw.lng*1000000)/1000000, 'ne' : Math.floor(_area.boundaries.ne.lat*1000000)/1000000+','+Math.floor(_area.boundaries.ne.lng*1000000)/1000000 }).done(function(data){
			// Badness 
			group.values.forEach(function(g, i){
				// get data from server 
				var cellpts = data.features;

				// var vscale = d3.scale.linear().domain([0,100]).range(d3.extent(cellpts.filter(function(d){ return g==d.properties.optrcom; }).map(function(d){return parseFloat(d.properties.badness); })));
				// quantscale[ntype.key] = [Math.ceil(vscale(15)),Math.ceil(vscale(40)),Math.ceil(vscale(60)),Math.ceil(vscale(100))];
				// console.log('------Badness|quantscale[ntype.key]---------')
				// console.log(quantscale[ntype.key]);

				// var cellpts.filter(function(d){ return g==d.properties.optrcom; }).map(function(d){return parseFloat(d.properties.badness); })
				var trarr = cellpts.filter(function(d){ return g==d.properties.optrcom;}).map(function(d){ return _.isNaN(parseFloat(d.properties.badness))?0.0:parseFloat(d.properties.badness); }),
				    trstdev = d3.deviation(trarr),
				    trmax = d3.max(trarr);
				quantscale[ntype.key] = [sigma['badness'][0]*trstdev, sigma['badness'][1]*trstdev, sigma['badness'][2]*trstdev, trmax+10];

				var cellgeojson = _.clone(mapGeostruc),
						cellscale = d3.scale.threshold().domain(quantscale[ntype.key]).range(['1','2','3','4']);
						
	  		if(!_.isUndefined(markersref['c'+(i+1)].cluster) && !_.isUndefined(markersref['c'+(i+1)].markers))
	  			markersref['c'+(i+1)].cluster.removeLayer(markersref['c'+(i+1)].markers);
				// var map = cmap;

				cellgeojson.features = cellpts.filter(function(d){ return g==d.properties.optrcom; }).filter(function(d){ return parseFloat(d.properties.bias)<=parseFloat(bias.key);}).map(function(d){ return {"geometry":{"type":"Point","coordinates":[d.geometry.coordinates[0],d.geometry.coordinates[1]]},"type":"Feature","properties":{"badcategory":cellscale(d.properties.badness),"badness":d.properties.badness,"modelvr":d.properties.modelvr,"usrcnt":d.properties.usrcnt,"sesscnt":d.properties.sesscnt,"rxbytes":d.properties[timezone.key],"id":d.properties.id,"addr":d.properties.addr,"subway":d.properties.subway,"recentness":Math.round(d.properties.recentness*100)/100,"rrecentness":Math.round(d.properties.precentness*100)/100,"badusrrate":Math.round(d.properties.badusr*100)/100,"tci":d.properties.tci}} })

				var gg = d3.nest()
					.key(function(d){ return d.properties.badcategory; })
					.rollup(function(d){
						return d3.sum(d, function(g){ return 1; })
					}).entries(cellgeojson.features);
        paintCnt(0, gg);  

		    var markers = L.geoJson(cellgeojson, {
						pointToLayer: defineFeature,
						onEachFeature: defineFeaturePopup
		    });			
				var markerclusters = L.markerClusterGroup({
					  maxClusterRadius: 2*rmax,
					      iconCreateFunction: defineClusterIcon //this is where the magic happens
					  });
				markerclusters.addTo(cmap);
		    markerclusters.addLayer(markers);
		    markersref['c'+(i+1)].cluster = markerclusters;
		    markersref['c'+(i+1)].markers = markers;
		    cmap.attributionControl.addAttribution(metadata.attribution);

			});
			// Traffic 
			group.values.forEach(function(g, i){
				// get data from server 
				var cellpts = data.features;

				// var vscale = d3.scale.linear().domain([0,100]).range(d3.extent(cellpts.filter(function(d){ return g==d.properties.optrcom; }).map(function(d){return _.isNaN(parseFloat(d.properties[timezone.key]))?0.0:parseFloat(d.properties[timezone.key]); })));
				// quantscale[ntype.key] = [Math.ceil(vscale(0.5)),Math.ceil(vscale(1)),Math.ceil(vscale(20)),Math.ceil(vscale(100))];
				var trarr = cellpts.filter(function(d){ return g==d.properties.optrcom;}).map(function(d){ return _.isNaN(parseFloat(d.properties[timezone.key]))?0.0:parseFloat(d.properties[timezone.key]); }),
				    trstdev = d3.deviation(trarr),
				    trmax = d3.max(trarr);


				console.log('------traffic|quantscale[ntype.key]---------' + timezone.key);
				console.log(trstdev);
				console.log(trmax);
				quantscale[ntype.key] = [sigma['traffic'][0]*trstdev, sigma['traffic'][1]*trstdev, sigma['traffic'][2]*trstdev, trmax+10];

				var cellgeojson = _.clone(mapGeostruc),
						cellscale = d3.scale.threshold().domain(quantscale[ntype.key]).range(['1','2','3','4']);

	  		if(!_.isUndefined(tmarkersref['c'+(i+1)].cluster) && !_.isUndefined(tmarkersref['c'+(i+1)].markers))
	  			tmarkersref['c'+(i+1)].cluster.removeLayer(tmarkersref['c'+(i+1)].markers);
				
				// var map = tmap;
				cellgeojson.features = cellpts.filter(function(d){ return g==d.properties.optrcom; }).filter(function(d){ return parseFloat(d.properties.bias)<=parseFloat(bias.key);}).map(function(d){ return {"geometry":{"type":"Point","coordinates":[d.geometry.coordinates[0],d.geometry.coordinates[1]]},"type":"Feature","properties":{"badcategory":cellscale(d.properties[timezone.key]),"badness":d.properties.badness,"modelvr":d.properties.modelvr,"usrcnt":d.properties.usrcnt,"sesscnt":d.properties.sesscnt,"rxbytes":d.properties[timezone.key],"id":d.properties.id,"addr":d.properties.addr,"subway":d.properties.subway,"recentness":Math.round(d.properties.recentness*100)/100,"rrecentness":Math.round(d.properties.precentness*100)/100,"badusrrate":Math.round(d.properties.badusr*100)/100,"tci":d.properties.tci }} })

				var gg = d3.nest()
					.key(function(d){ return d.properties.badcategory; })
					.rollup(function(d){
						return d3.sum(d, function(g){ return 1; })
					}).entries(cellgeojson.features);
        paintCnt(1, gg);

		    var markers = L.geoJson(cellgeojson, {
						pointToLayer: defineFeature,
						onEachFeature: defineFeaturePopup
		    });			
				var markerclusters = L.markerClusterGroup({
					  maxClusterRadius: 2*rmax,
					      iconCreateFunction: defineClusterIcon //this is where the magic happens
					  });
				markerclusters.addTo(tmap);
		    markerclusters.addLayer(markers);
		    tmarkersref['c'+(i+1)].cluster = markerclusters;
		    tmarkersref['c'+(i+1)].markers = markers;
		    tmap.attributionControl.addAttribution(metadata.attribution);

			});
	    setTimeout(function(){ dragging = false; $('#loading').css('display', 'none');}, 500);
	});
	
}

function paintCnt(type, data){
  function acquire(key){
    var aa = data.filter(function(d){ return d.key == key; })[0];
    return _.isUndefined(aa)?0:aa['values'];
  }
  quantscale.colors.forEach(function(d,i){
    $('#dashc'+(type+1)+'_'+quantscale.names[i].replace(' ','')).html('<span style="color:'+d+';">' + acquire(i+1) + '</span>');
  });
  // $('#c'+(type+1)+'action').html(parseInt(acquire('3')) + parseInt(acquire('4')));

}



var nearcell = [];
function paintNearCell(fullid){
	$('#loading').css('display', 'block');
	// console.log('--------paintNearCell----------');
	// console.log(fullid);	
	// console.log('--------paintNearCell----------');
	nearcell.forEach(function(d){
		cmap.removeLayer(d);
	});
	var greenIcon = new L.icon({iconUrl: '/assets/images/green_pin.png', iconSize:[10,10]});
	$.getJSON('/api/v1.8/oreal/map/fullid/nearcell', {'t':params.t, 'fullid' : fullid }).done(function(data){

		data.features.forEach(function(d){
			var props = d.properties;
			var infocontent = '<table class="table table-striped table-hover text-center"><thead style="color:#fff;"><tr><td>ID</td><td>Badness</td><td>Sessions</td><td>Users</td><td>Addr</td></tr></thead><tbody><tr><td class="success">'+props['id']+'('+getcid(props['id'])+')'+'</td><td class="danger">'+Math.round(props['badness']*100)/100+' %</td><td class="warning">'+props['sesscnt']+'</td><td class="info">'+props['usrcnt']+'</td><td class="success" >'+props['addr']+'</td></tr></tbody></table>';
			var imaker = L.marker([d.geometry.coordinates[1], d.geometry.coordinates[0]], {icon: greenIcon});
			imaker.addTo(cmap).bindPopup(infocontent,{offset: L.point(1,-2), maxWidth: 500});			
			nearcell.push(imaker);
			$('#loading').css('display', 'none');
		});
	});
}

var movementcell = [];
function paintMovement(fullid){
	$('#loading').css('display', 'block');
	console.log('--------paintMovement----------');
	console.log(fullid);	
	console.log('--------paintMovement----------');
	movementcell.forEach(function(d){
		cmap.removeLayer(d);
	});
	// var greenIcon = new L.icon({iconUrl: '/assets/images/blue_pin.png', iconSize:[10,10]});

	$.getJSON('/api/v1.8/oreal/map/fullid/'+movement.key+'/movement', {'fullid' : fullid }).done(function(data){

		paintMovementRadar(data.detail);
		var prevdt = data.detail.filter(function(d){ return d.gubun == 'PREV'});
		var nextdt = data.detail.filter(function(d){ return d.gubun == 'NEXT'});

		var prevPinSize = d3.scale.threshold().domain(d3.extent(prevdt, function(d){ return d.count; })).range([20,30,50,70,90]);
		var nextPinSize = d3.scale.threshold().domain(d3.extent(nextdt, function(d){ return d.count; })).range([20,30,50,70,90]);

		data.detail.forEach(function(d){
			var props = d;
			var subwaytxt = props['subway'] && props['subway']!='not' ? ' [' + props['subway'] +']' : '';
			var infocontent = '<table class="table table-striped table-hover text-center"><thead style="color:#fff;"><tr><td>ID</td><td>Addr</td><td>MoveCount</td></tr></thead><tbody><tr><td class="success">'+crypt_cellid(props['cellid'])+'</td><td class="danger">'+props['addr']+ subwaytxt +'</td><td class="warning">'+props['count']+'%</td></tr></tbody></table>';
			var pinName = d.gubun=='PREV'?'/assets/images/prev.png':'/assets/images/next.png';
			if(subwaytxt.length > 5){
				pinName = d.gubun=='PREV'?'/assets/images/prev_train.png':'/assets/images/next_train.png';
			}
			// console.log(d.count + ':' + pinSize(d.count));
			var pinSize = d.gubun=='PREV'?prevPinSize:nextPinSize;
			var imaker = L.marker([d.lat, d.lng], {icon: new L.icon({iconUrl: pinName , iconSize:[pinSize(d.count),pinSize(d.count)]})});
			imaker.addTo(cmap).bindPopup(infocontent,{offset: L.point(1,-2), maxWidth: 400});			
			movementcell.push(imaker);
			$('#loading').css('display', 'none');
		});		
	});
}

function paintMovementRadar(data){
	// console.log(data);
	var rrdata = [];
	var prevdata = data.filter(function(d){ return d.gubun=='PREV';}).map(function(d){ return [d.cellid, d.count]; })
	var nextdata = data.filter(function(d){ return d.gubun=='NEXT';}).map(function(d){ return [d.cellid, d.count]; })
	var nndata = data.map(function(d){ return [d.cellid, d.count]; })
	// var categories = nndata.map(function(d){ return d[0]; });
	// var rdata = nndata.map(function(d){ return d[1]; });
	// paintRadar('movement', rdata, categories);
	console.log('------- paintMovementRadar -------');
	console.log(nndata);
	console.log('------- paintMovementRadar -------');
	paintRadar('MovementCell',[{
	    name: 'Previous Cell',
	    data: nndata.map(function(d){ return parseInt(d[1]); }),
	    pointPlacement: 'on'
	}], nndata.map(function(d){ return d[0]; }));

}
// st fail 0 인 세션 확인 필요 
function paintTable(fullid, tci){
	$('#loading').css('display', 'block');
	$('#fullidnm').html(" loading... ");
	$('#tcindicator').html("");
	$('#rsrqindicator').html("");
	console.log('--------paintTable----------');
	console.log(fullid);
	console.log('--------paintTable----------');



	paintMovement(fullid);
	paintNearCell(fullid);
	paintHeat(fullid);
	paintWifiLoc(fullid);


	$.getJSON('/api/v1.8/oreal/map/fullid/detail', {'fullid' : fullid }).done(function(data){
		$('#detailinfo').html("");
		$('#fullidnm').html(crypt_cellid(fullid));

		var ndata = data.detail.filter(function(d){
			return d['stfail']>0 || d['dronst']>0 || d['largepc']>0;
		});

		var tod_data = d3.nest()
			.key(function(d){ return d.days.split(' ')[1]; })
			.rollup(function(d){ return d.length; })
			.entries(ndata)
			.map(function(d){ return [d.key, d.values]; });

		var fulltime = {};
		for(var k=0;k<24;k++){
			fulltime[k<10?"0"+k:""+k]=0;
		}
		for(var j=0;j<tod_data.length;j++){
			fulltime[tod_data[j][0]] = tod_data[j][1];
		}
		var pfulltime = [];
		Object.keys(fulltime).map(function(k){
			pfulltime.push([k, fulltime[k]]);
		});

		var tod_data2 = d3.nest()
			.key(function(d){ return d.days.split(' ')[1]; })
			.rollup(function(d){ return d.length; })
			.entries(data.detail)
			.map(function(d){ return [d.key, d.values]; });

		var fulltime2 = {};
		for(var k=0;k<24;k++){
			fulltime2[k<10?"0"+k:""+k]=0;
		}
		for(var j=0;j<tod_data2.length;j++){
			fulltime2[tod_data2[j][0]] = tod_data2[j][1];
		}
		var fulltime22 = [];
		var afulltime = [];
		Object.keys(fulltime2).map(function(k){
			fulltime22.push([k, fulltime2[k]-fulltime[k]]);
			afulltime.push([k, fulltime2[k]]);
		});

		paintBar('ToD', fulltime22, pfulltime);

		$.getJSON('/api/v1.8/oreal/map/fullid/indicator', {'fullid' : fullid }).done(function(data1){
			var dddI = data1.detail;
			$('#tcindicator').html('TCI : '+ Math.round(dddI[0].tci*100)/100 );
			$('#rsrqindicator').html('RSRP/RSNR : ' +  Math.round(dddI[0].avgrsrp*100)/100 + '/' + Math.round(dddI[0].avgrssnr*100)/100);
		});
		

		var daily_data = d3.nest()
			.key(function(d){ return d.days.split(' ')[0]; })
			.rollup(function(d){ return d.length; })
			.entries(data.detail)
			.map(function(d){ return [d.key, d.values]; })

	// console.log(daily_data);
		var tttt = daily_data.map(function(d){ return moment(d[0], "YYYYMMDD"); });
		var minD = moment(new Date(2015, 0, 1));
		// var maxD = moment(new Date(2015, 6, 9));
		// var minD = moment.min(tttt);
    // var maxD = moment();
		var maxD = moment(new Date(2015, 9, 1));
		var fullday = {};
		var dlen = maxD.diff(minD,'days', true);

		for(var i=0;i<dlen-1;i++){
			fullday[minD.format('YYYYMMDD')] = 0;
			minD.add(1,'days');
			// var key1 = minD.add(1,'days').format('YYYYMMDD');
			// fullday[key1] = 0;
		}
		var pfullday = _.clone(fullday);
// console.log(fullday);		
// console.log(pfullday);		

		for(var j=0;j<daily_data.length;j++){
			// console.log(daily_data[j][0] + fullday[daily_data[j][0]]);
			fullday[daily_data[j][0]] = daily_data[j][1];
		}
		var fullday2 = [];
		Object.keys(fullday).map(function(k){
			// console.log(k);
			fullday2.push([k, fullday[k]]);
		});
// console.log(fullday2);

		var daily_problem = d3.nest()
			.key(function(d){ return d.days.split(' ')[0]; })
			.rollup(function(d){ return d.length; })
			.entries(ndata)
			.map(function(d){ return [d.key, d.values]; })


		for(var j=0;j<daily_problem.length;j++){
			pfullday[daily_problem[j][0]] = daily_problem[j][1];
		}
		var pfullday2 = [];
		Object.keys(pfullday).map(function(k){
			// console.log(k);
			pfullday2.push([k, pfullday[k]]);
		});	

		paintBar('Problem', undefined, pfullday2);
		paintBar('Traffic', fullday2, pfullday2);
		paintModel('model', ndata, data, 'Model');
		paintModel('osver', ndata,data, 'OS');
		paintPie('pkg', ndata, 'App Package');
		
		var dow_problem = d3.nest()
			.key(function(d){ return d.dow; })
			.rollup(function(d){ return d.length; })
			.entries(ndata)
			.map(function(d){ return [d.key, d.values]; })

    var list = ["MON","TUE","WED","THU","FRI","SAT","SUN"];
    dow_problem.sort(function(a, b){ return list.indexOf(a[0]) > list.indexOf(b[0]); });
    list.forEach(function(d,i){
      var r1 = dow_problem.filter(function(r){ return r[0] == d;})[0];
      if(_.isUndefined(r1) || r1[0]!=d){
        dow_problem.splice(i,0, [d,0]);
      }
    });
    console.log('---------dow_problem-----------');
    console.log(dow_problem);
		console.log('---------dow_problem-----------');

    paintRadar('DoW',[{
		    name: 'Badness',
		    data: dow_problem.map(function(d){ return d[1]; }),
		    pointPlacement: 'on'
		}], ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']);

		ndata.forEach(function(d){
			$('#detailinfo').append('<tr><td>'+d['playsessionid']+'</td><td>'+d['androidid']+'</td><td>'+d['days']+'</td><td>'+d['pkg']+'</td><td>'+d['model']+'-'+d['osver']+
				'</td><td>'+d['stfail']+'</td><td>'+d['largepc']+'</td><td>'+Math.round(parseFloat(d['rxbytes'])*100)/100+'</td></tr>');
		});
		$('#loading').css('display', 'none');
	});	
}
var detailheats = [];
var heatmapc1;
var radius = 10;
var gradient = {0.4:'blue', 0.65:'lime', 1:'red'};
// var gradient = {
// 		0.1:'rgba(252,251,253,0)',
//     0.2:'rgba(239,237,245,0.5)',
//     0.3:'rgba(218,218,235,1)',
//     0.4:'rgba(188,189,220,1)',
//     0.5:'rgba(158,202,225,1)',
//     0.6:'rgba(158,154,200,1)',
//     0.7:'rgba(128,125,186 ,1)',
//     0.8:'rgba(106,81,163  ,1)',
//     0.0:'rgba(84,39,143   ,1)',
//     1.0:'rgba(63,0,125   ,1)'
// }
// var heatmaps = [];
function paintHeat(fullid){
	$('#loading').css('display', 'block');
	console.log('--------paintHeat----------');
	console.log(fullid);
	console.log('--------paintHeat----------');

	detailheats.forEach(function(d){ cmap.removeLayer(d); });
  var bounds = cmap.getBounds(),
      sw = bounds.getSouthWest(),
      ne = bounds.getNorthEast();

  var cellwfurl = '/api/v1.8/oreal/heat/cell/list'
  $.getJSON(cellwfurl, {'fullid' :fullid }).done(function(data){
     var rdata = data['cell'];
     // console.log(rdata);
     var norm10 = d3.scale.log().domain(d3.extent(rdata, function(d){ return d['pausecnt']; })).range([0,100]);
     var addressPoints = rdata.map(function(d){ return [parseFloat(d['lat']),parseFloat(d['lng']), 1 ] });  	
     // var addressPoints = rdata.filter(function(d){ return d['optrcom']==group.values[0]; }).map(function(d){ return [d['lat'],d['lng'], parseFloat(norm10(d['badness']) ) ] });  	
     // console.log(addressPoints);
     heatmapc1 =  L.heatLayer(addressPoints, {maxZoom: 18, gradient:gradient, radius:radius}).addTo(cmap);
     detailheats.push(heatmapc1);
     $('#loading').css('display', 'none');

  });

} // end of heatofDetail method 

var wifilocs = [];
function paintWifiLoc(fullid){
	$('#loading').css('display', 'block');
	console.log('--------paintWifiLoc----------');
	console.log(fullid);
	console.log('--------paintWifiLoc----------');

	wifilocs.forEach(function(d){ cmap.removeLayer(d); });
  var bounds = cmap.getBounds(),
      sw = bounds.getSouthWest(),
      ne = bounds.getNorthEast();

  var cellwfurl = '/api/v1.8/oreal/wifiloc/cell/list'
  $.getJSON(cellwfurl, {'fullid' :fullid }).done(function(data){
     var rdata = data['cell'];
     console.log(rdata);
     rdata.forEach(function(d){
     	var marker = L.marker([d.lat, d.lng]).bindLabel(d.locname + ' ' + d.stair, { noHide: true }).addTo(cmap);
     	wifilocs.push(marker);
     });
     
     $('#loading').css('display', 'none');

  });
}
function paintRadar(title, series ,categories){

  $('#'+title+'distibution').highcharts({
      chart: {
          polar: true,
          type: 'line'
      },

      title: {
          text: title,
          x: -80
      },

      pane: {
          size: '80%'
      },

      xAxis: {
          categories: categories,
          tickmarkPlacement: 'on',
          lineWidth: 0
      },

      yAxis: {
          gridLineInterpolation: 'polygon',
          lineWidth: 0,
          min: 0
      },

      tooltip: {
          shared: true,
          pointFormat: '<span style="color:{series.color}">{series.name}: <b>{point.y:,.0f}</b><br/>'
      },

      legend: {
          align: 'right',
          verticalAlign: 'top',
          y: 70,
          layout: 'vertical'
      },

      series: series

  });
}

function paintBar(title, data, data2){
	Highcharts.setOptions(Highcharts.theme);
	if(data){
		data = data.sort(function(a,b){
	    if( a[0] > b[0] ) return 1;
	    if( a[0] < b[0] ) return -1;
	    return 0;
	  });

	}
	if(data2){
		data2 = data2.sort(function(a,b){
	    if( a[0] > b[0] ) return 1;
	    if( a[0] < b[0] ) return -1;
	    return 0;
	  });		
	}
	var series = [];
  
  if(data){
		series.push({
	      name: 'Total',
	      data: data,
	      dataLabels: {
	          enabled: true,
	          rotation: 0,
	          color: '#FFFFFF',
	          align: 'right',
	          format: '{point.y:.3f}', // one decimal
	          y: 10, // 10 pixels down from the top
	          style: {
	              fontSize: '10px',
	              fontFamily: 'Verdana, sans-serif'
	          }
	      }
	  });		
	}
	if(data2){
	  	series.push({
	          name: 'Bad',
	          data: data2,
	          dataLabels: {
	              enabled: true,
	              rotation: 0,
	              color: '#FFFFFF',
	              align: 'right',
	              format: '{point.y:.3f}', // one decimal
	              y: 10, // 10 pixels down from the top
	              style: {
	                  fontSize: '10px',
	                  fontFamily: 'Verdana, sans-serif'
	              }
	          }
	      });
	  }
	var options = {
      chart: {
          type: 'column'
      },
      title: {
          text: title
      },
      subtitle: {
          text: 'Source: <a href="http://www.airplug.com">Airplug</a>'
      },
      xAxis: {
          type: 'category',
          labels: {
              rotation: -45,
              style: {
                  fontSize: '13px',
                  fontFamily: 'Verdana, sans-serif'
              }
          }
      },
      yAxis: {
          min: 0,
          title: {
              text: 'count'
          }
      },
      plotOptions: {
          series: {
              stacking: 'normal'
          }
      },
      legend: {
          layout: 'vertical',
          align: 'right',
          verticalAlign: 'top',
          x: -40,
          y: 80,
          floating: true,
          borderWidth: 1,
          backgroundColor: ((Highcharts.theme && Highcharts.theme.legendBackgroundColor) || '#FFFFFF'),
          shadow: true
      },
      tooltip: {
          pointFormat: '<b>{point.y:.3f} </b> count'
      },
      series: series 
  }
	$('#'+title+'distibution').highcharts(options);
}

// 10개 세션 이상인 것만 문제세션/전체세션 갯수로 파이차트 그리기 
function paintModel(type, pdata, adata, title){
// console.log(adata);
// console.log('------paintModel-------');
	var aadata = d3.nest()
		.key(function(d){ return d[type]; })
		.rollup(function(d){ return d.length;})
		.entries(adata.detail)

	var nndata = d3.nest()
		.key(function(d){ return d[type]; })
		.rollup(function(d){ return d.length; })
		.entries(pdata);


	// console.log(aadata);	
	// console.log(nndata);	
	function _find(model){
		// console.log('----paintModel _find ---------');
		var rr = nndata.filter(function(d){ return d.key==model; });
		// console.log(rr[0]);
		return _.isUndefined(rr[0])?0:rr[0]['values'];
	}
	
	var data = aadata.map(function(d){ return [d.key, _find(d.key)/d.values ]; })
	console.log('------paintModel-------');
	console.log(data);
	console.log('------paintModel-------');
	data = data.sort(function(a,b){
    if( a[0] > b[0] ) return 1;
    if( a[0] < b[0] ) return -1;
    return 0;
  });

	$('#'+type+'distribution').highcharts({
        chart: {
            plotBackgroundColor: null,
            plotBorderWidth: null,
            plotShadow: false
        },
        title: {
            text: title
        },
        tooltip: {
            pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
        },
        plotOptions: {
            pie: {
                allowPointSelect: true,
                cursor: 'pointer',
                dataLabels: {
                    enabled: true,
                    format: '<b>{point.name}</b>: {point.percentage:.1f} %',
                    style: {
                        color: (Highcharts.theme && Highcharts.theme.contrastTextColor) || 'black'
                    }
                }
            }
        },
        series: [{
            type: 'pie',
            name: 'Browser share',
            data: data
        }]
    });
}
function paintPie(type, _data, title){
// console.log(_data);
	var nndata = d3.nest()
		.key(function(d){ return d[type]; })
		.rollup(function(d){ return d.length; })
		.entries(_data);
	// console.log(nndata);
	var data = nndata.map(function(d){ return [d.key, d.values]; })
	// console.log(data);
	data = data.sort(function(a,b){
    if( a[0] > b[0] ) return 1;
    if( a[0] < b[0] ) return -1;
    return 0;
  });

	$('#'+type+'distribution').highcharts({
        chart: {
            plotBackgroundColor: null,
            plotBorderWidth: null,
            plotShadow: false
        },
        title: {
            text: title
        },
        tooltip: {
            pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
        },
        plotOptions: {
            pie: {
                allowPointSelect: true,
                cursor: 'pointer',
                dataLabels: {
                    enabled: true,
                    format: '<b>{point.name}</b>: {point.percentage:.1f} %',
                    style: {
                        color: (Highcharts.theme && Highcharts.theme.contrastTextColor) || 'black'
                    }
                }
            }
        },
        series: [{
            type: 'pie',
            name: 'Browser share',
            data: data
        }]
    });
}




paintMap();

// getcid('45006_50908677_8302');



function getcid(fullid){

	var bandlist = {"00":{"KT":"L","LGT":"H","SKT":"H"},
	"01":{"KT":"L","LGT":"H","SKT":"H"},
	"02":{"KT":"L","LGT":"H","SKT":"H"},
	"03":{"KT":"H","LGT":"H","SKT":"L"},
	"04":{"KT":"H","LGT":"H","SKT":"L"},
	"05":{"KT":"H","LGT":"H","SKT":"L"},
	"06":{"KT":"H","LGT":"L","SKT":"L"},
	"07":{"KT":"H","LGT":"L","SKT":"L"},
	"08":{"KT":"H","LGT":"L","SKT":"L"},
	"09":{"KT":"L","LGT":"L","SKT":"L"},
	"0a":{"KT":"L","LGT":"L","SKT":"L"},
	"0b":{"KT":"L","LGT":"L","SKT":"L"},
	"0c":{"KT":"H","LGT":"H","SKT":"L"},
	"0d":{"KT":"H","LGT":"H","SKT":"L"},
	"0e":{"KT":"H","LGT":"H","SKT":"L"},
	"0f":{"KT":"H","LGT":"H","SKT":"H"},
	"10":{"KT":"L","LGT":"H","SKT":"H"},
	"11":{"KT":"L","LGT":"H","SKT":"H"},
	"12":{"KT":"U","LGT":"L","SKT":"U"},
	"13":{"KT":"L","LGT":"L","SKT":"H"},
	"14":{"KT":"H","LGT":"L","SKT":"H"},
	"15":{"KT":"H","LGT":"L","SKT":"H"},
	"16":{"KT":"H","LGT":"L","SKT":"U"},
	"17":{"KT":"U","LGT":"L","SKT":"H"},
	"18":{"KT":"L","LGT":"L","SKT":"H"},
	"19":{"KT":"U","LGT":"L","SKT":"H"},
	"1a":{"KT":"L","LGT":"L","SKT":"H"},
	"1b":{"KT":"U","LGT":"L","SKT":"H"},
	"1c":{"KT":"H","LGT":"L","SKT":"H"},
	"1d":{"KT":"U","LGT":"L","SKT":"H"},
	"1e":{"KT":"U","LGT":"H","SKT":"H"},
	"1f":{"KT":"H","LGT":"H","SKT":"H"},
	"20":{"KT":"L","LGT":"H","SKT":"H"},
	"21":{"KT":"L","LGT":"H","SKT":"H"},
	"22":{"KT":"U","LGT":"H","SKT":"H"},
	"23":{"KT":"L","LGT":"H","SKT":"H"},
	"24":{"KT":"H","LGT":"U","SKT":"H"},
	"25":{"KT":"H","LGT":"U","SKT":"H"},
	"26":{"KT":"U","LGT":"U","SKT":"H"},
	"27":{"KT":"U","LGT":"H","SKT":"L"},
	"28":{"KT":"L","LGT":"U","SKT":"L"},
	"29":{"KT":"L","LGT":"U","SKT":"L"},
	"2a":{"KT":"U","LGT":"U","SKT":"U"},
	"2b":{"KT":"U","LGT":"H","SKT":"L"},
	"2c":{"KT":"H","LGT":"U","SKT":"L"},
	"2d":{"KT":"H","LGT":"U","SKT":"L"},
	"2e":{"KT":"U","LGT":"U","SKT":"U"},
	"2f":{"KT":"U","LGT":"H","SKT":"L"},
	"30":{"KT":"L","LGT":"U","SKT":"L"},
	"31":{"KT":"U","LGT":"U","SKT":"L"},
	"32":{"KT":"U","LGT":"U","SKT":"U"},
	"33":{"KT":"U","LGT":"U","SKT":"H"},
	"34":{"KT":"H","LGT":"U","SKT":"H"},
	"35":{"KT":"H","LGT":"U","SKT":"H"},
	"36":{"KT":"U","LGT":"U","SKT":"U"},
	"37":{"KT":"H","LGT":"U","SKT":"H"},
	"38":{"KT":"U","LGT":"U","SKT":"H"},
	"39":{"KT":"U","LGT":"U","SKT":"U"},
	"3a":{"KT":"U","LGT":"U","SKT":"U"},
	"3b":{"KT":"U","LGT":"U","SKT":"H"},
	"3c":{"KT":"H","LGT":"U","SKT":"H"},
	"3d":{"KT":"U","LGT":"U","SKT":"H"},
	"3e":{"KT":"U","LGT":"U","SKT":"U"},
	"3f":{"KT":"U","LGT":"H","SKT":"H"},
	"40":{"KT":"L","LGT":"U","SKT":"H"},
	"41":{"KT":"L","LGT":"U","SKT":"H"},
	"42":{"KT":"U","LGT":"U","SKT":"U"},
	"43":{"KT":"U","LGT":"H","SKT":"H"},
	"44":{"KT":"H","LGT":"U","SKT":"H"},
	"45":{"KT":"H","LGT":"U","SKT":"H"},
	"46":{"KT":"H","LGT":"U","SKT":"H"},
	"47":{"KT":"H","LGT":"U","SKT":"H"},
	"48":{"KT":"L","LGT":"U","SKT":"H"},
	"49":{"KT":"L","LGT":"U","SKT":"H"},
	"4a":{"KT":"U","LGT":"U","SKT":"H"},
	"4b":{"KT":"U","LGT":"U","SKT":"L"},
	"4c":{"KT":"H","LGT":"U","SKT":"L"},
	"4d":{"KT":"H","LGT":"U","SKT":"U"},
	"4e":{"KT":"U","LGT":"U","SKT":"U"},
	"4f":{"KT":"U","LGT":"U","SKT":"L"},
	"50":{"KT":"L","LGT":"U","SKT":"L"},
	"51":{"KT":"L","LGT":"U","SKT":"L"},
	"52":{"KT":"U","LGT":"U","SKT":"U"},
	"53":{"KT":"U","LGT":"U","SKT":"L"},
	"54":{"KT":"U","LGT":"U","SKT":"L"},
	"55":{"KT":"U","LGT":"U","SKT":"U"},
	"56":{"KT":"U","LGT":"U","SKT":"U"},
	"57":{"KT":"U","LGT":"U","SKT":"H"},
	"58":{"KT":"U","LGT":"U","SKT":"H"},
	"59":{"KT":"U","LGT":"U","SKT":"U"},
	"5a":{"KT":"U","LGT":"U","SKT":"U"},
	"5b":{"KT":"U","LGT":"U","SKT":"H"},
	"5c":{"KT":"U","LGT":"U","SKT":"H"},
	"5d":{"KT":"U","LGT":"U","SKT":"U"},
	"5e":{"KT":"U","LGT":"U","SKT":"U"},
	"5f":{"KT":"U","LGT":"U","SKT":"H"},
	"60":{"KT":"L","LGT":"H","SKT":"H"},
	"61":{"KT":"L","LGT":"U","SKT":"H"},
	"62":{"KT":"U","LGT":"U","SKT":"U"},
	"63":{"KT":"U","LGT":"U","SKT":"H"},
	"64":{"KT":"H","LGT":"U","SKT":"H"},
	"65":{"KT":"H","LGT":"U","SKT":"H"},
	"66":{"KT":"U","LGT":"U","SKT":"U"},
	"67":{"KT":"U","LGT":"U","SKT":"H"},
	"68":{"KT":"L","LGT":"U","SKT":"H"},
	"69":{"KT":"L","LGT":"U","SKT":"H"},
	"6a":{"KT":"U","LGT":"U","SKT":"U"},
	"6b":{"KT":"U","LGT":"U","SKT":"H"},
	"6c":{"KT":"H","LGT":"U","SKT":"H"},
	"6d":{"KT":"H","LGT":"U","SKT":"U"},
	"6e":{"KT":"U","LGT":"U","SKT":"U"},
	"6f":{"KT":"U","LGT":"U","SKT":"L"},
	"70":{"KT":"L","LGT":"U","SKT":"L"},
	"71":{"KT":"L","LGT":"U","SKT":"L"},
	"72":{"KT":"U","LGT":"U","SKT":"U"},
	"73":{"KT":"U","LGT":"U","SKT":"L"},
	"74":{"KT":"H","LGT":"U","SKT":"L"},
	"75":{"KT":"U","LGT":"U","SKT":"L"},
	"76":{"KT":"U","LGT":"U","SKT":"U"},
	"77":{"KT":"U","LGT":"U","SKT":"L"},
	"78":{"KT":"U","LGT":"U","SKT":"L"},
	"79":{"KT":"U","LGT":"U","SKT":"U"},
	"7a":{"KT":"U","LGT":"U","SKT":"U"},
	"7b":{"KT":"U","LGT":"U","SKT":"H"},
	"7c":{"KT":"U","LGT":"U","SKT":"H"},
	"7d":{"KT":"U","LGT":"U","SKT":"U"},
	"7e":{"KT":"U","LGT":"U","SKT":"U"},
	"7f":{"KT":"U","LGT":"U","SKT":"H"},
	"80":{"KT":"L","LGT":"U","SKT":"H"},
	"81":{"KT":"L","LGT":"U","SKT":"H"},
	"82":{"KT":"L","LGT":"U","SKT":"U"},
	"83":{"KT":"U","LGT":"U","SKT":"H"},
	"84":{"KT":"H","LGT":"H","SKT":"H"},
	"85":{"KT":"H","LGT":"U","SKT":"H"},
	"86":{"KT":"U","LGT":"U","SKT":"U"},
	"87":{"KT":"U","LGT":"U","SKT":"H"},
	"88":{"KT":"L","LGT":"U","SKT":"H"},
	"89":{"KT":"L","LGT":"U","SKT":"H"},
	"8a":{"KT":"U","LGT":"U","SKT":"U"},
	"8b":{"KT":"U","LGT":"U","SKT":"H"},
	"8c":{"KT":"H","LGT":"U","SKT":"H"},
	"8d":{"KT":"H","LGT":"U","SKT":"U"},
	"8e":{"KT":"H","LGT":"U","SKT":"U"},
	"8f":{"KT":"U","LGT":"U","SKT":"H"},
	"90":{"KT":"L","LGT":"U","SKT":"U"},
	"91":{"KT":"L","LGT":"U","SKT":"U"},
	"92":{"KT":"U","LGT":"U","SKT":"U"},
	"93":{"KT":"U","LGT":"U","SKT":"U"},
	"94":{"KT":"U","LGT":"U","SKT":"U"},
	"95":{"KT":"U","LGT":"U","SKT":"U"},
	"96":{"KT":"U","LGT":"U","SKT":"U"},
	"97":{"KT":"U","LGT":"U","SKT":"U"},
	"98":{"KT":"U","LGT":"U","SKT":"U"},
	"99":{"KT":"U","LGT":"U","SKT":"U"},
	"9a":{"KT":"U","LGT":"U","SKT":"L"},
	"9b":{"KT":"U","LGT":"U","SKT":"U"},
	"9c":{"KT":"U","LGT":"U","SKT":"U"},
	"9d":{"KT":"U","LGT":"U","SKT":"U"},
	"9e":{"KT":"U","LGT":"U","SKT":"L"},
	"9f":{"KT":"U","LGT":"U","SKT":"U"},
	"a0":{"KT":"L","LGT":"U","SKT":"H"},
	"a1":{"KT":"L","LGT":"U","SKT":"H"},
	"a2":{"KT":"L","LGT":"U","SKT":"H"},
	"a3":{"KT":"U","LGT":"U","SKT":"H"},
	"a4":{"KT":"H","LGT":"U","SKT":"H"},
	"a5":{"KT":"H","LGT":"U","SKT":"H"},
	"a6":{"KT":"U","LGT":"U","SKT":"H"},
	"a7":{"KT":"U","LGT":"U","SKT":"H"},
	"a8":{"KT":"L","LGT":"U","SKT":"U"},
	"a9":{"KT":"L","LGT":"U","SKT":"H"},
	"aa":{"KT":"L","LGT":"U","SKT":"H"},
	"ab":{"KT":"L","LGT":"U","SKT":"U"},
	"ac":{"KT":"H","LGT":"U","SKT":"U"},
	"ad":{"KT":"H","LGT":"U","SKT":"U"},
	"ae":{"KT":"H","LGT":"U","SKT":"H"},
	"af":{"KT":"U","LGT":"U","SKT":"U"},
	"b0":{"KT":"L","LGT":"U","SKT":"U"},
	"b1":{"KT":"L","LGT":"U","SKT":"U"},
	"b2":{"KT":"U","LGT":"U","SKT":"H"},
	"b3":{"KT":"U","LGT":"U","SKT":"U"},
	"b4":{"KT":"H","LGT":"U","SKT":"U"},
	"b5":{"KT":"U","LGT":"U","SKT":"U"},
	"b6":{"KT":"U","LGT":"U","SKT":"H"},
	"b7":{"KT":"U","LGT":"U","SKT":"U"},
	"b8":{"KT":"U","LGT":"U","SKT":"U"},
	"b9":{"KT":"U","LGT":"U","SKT":"U"},
	"ba":{"KT":"U","LGT":"U","SKT":"U"},
	"bb":{"KT":"U","LGT":"U","SKT":"U"},
	"bc":{"KT":"U","LGT":"U","SKT":"U"},
	"bd":{"KT":"U","LGT":"U","SKT":"U"},
	"be":{"KT":"U","LGT":"U","SKT":"L"},
	"bf":{"KT":"U","LGT":"U","SKT":"L"},
	"c0":{"KT":"L","LGT":"U","SKT":"U"},
	"c1":{"KT":"L","LGT":"H","SKT":"U"},
	"c2":{"KT":"U","LGT":"U","SKT":"L"},
	"c3":{"KT":"U","LGT":"U","SKT":"H"},
	"c4":{"KT":"H","LGT":"U","SKT":"U"},
	"c5":{"KT":"H","LGT":"U","SKT":"H"},
	"c6":{"KT":"U","LGT":"U","SKT":"H"},
	"c7":{"KT":"U","LGT":"U","SKT":"H"},
	"c8":{"KT":"L","LGT":"U","SKT":"H"},
	"c9":{"KT":"L","LGT":"U","SKT":"H"},
	"ca":{"KT":"U","LGT":"U","SKT":"U"},
	"cb":{"KT":"U","LGT":"U","SKT":"U"},
	"cc":{"KT":"H","LGT":"U","SKT":"U"},
	"cd":{"KT":"H","LGT":"U","SKT":"U"},
	"ce":{"KT":"U","LGT":"U","SKT":"U"},
	"cf":{"KT":"U","LGT":"U","SKT":"U"},
	"d0":{"KT":"L","LGT":"U","SKT":"U"},
	"d1":{"KT":"L","LGT":"U","SKT":"U"},
	"d2":{"KT":"U","LGT":"U","SKT":"U"},
	"d3":{"KT":"U","LGT":"U","SKT":"U"},
	"d4":{"KT":"U","LGT":"U","SKT":"U"},
	"d5":{"KT":"H","LGT":"U","SKT":"U"},
	"d6":{"KT":"U","LGT":"U","SKT":"U"},
	"d7":{"KT":"U","LGT":"U","SKT":"U"},
	"d8":{"KT":"U","LGT":"U","SKT":"U"},
	"d9":{"KT":"U","LGT":"U","SKT":"U"},
	"da":{"KT":"U","LGT":"U","SKT":"U"},
	"db":{"KT":"U","LGT":"U","SKT":"U"},
	"dc":{"KT":"U","LGT":"U","SKT":"U"},
	"dd":{"KT":"U","LGT":"U","SKT":"U"},
	"de":{"KT":"U","LGT":"U","SKT":"U"},
	"df":{"KT":"U","LGT":"U","SKT":"U"},
	"e0":{"KT":"L","LGT":"U","SKT":"L"},
	"e1":{"KT":"L","LGT":"U","SKT":"L"},
	"e2":{"KT":"L","LGT":"U","SKT":"U"},
	"e3":{"KT":"U","LGT":"U","SKT":"U"},
	"e4":{"KT":"H","LGT":"U","SKT":"L"},
	"e5":{"KT":"H","LGT":"U","SKT":"L"},
	"e6":{"KT":"U","LGT":"U","SKT":"U"},
	"e7":{"KT":"U","LGT":"U","SKT":"U"},
	"e8":{"KT":"L","LGT":"U","SKT":"H"},
	"e9":{"KT":"L","LGT":"U","SKT":"H"},
	"ea":{"KT":"U","LGT":"U","SKT":"U"},
	"eb":{"KT":"U","LGT":"U","SKT":"U"},
	"ec":{"KT":"H","LGT":"U","SKT":"U"},
	"ed":{"KT":"H","LGT":"U","SKT":"U"},
	"ee":{"KT":"U","LGT":"U","SKT":"U"},
	"ef":{"KT":"U","LGT":"U","SKT":"U"},
	"f0":{"KT":"L","LGT":"U","SKT":"U"},
	"f1":{"KT":"L","LGT":"U","SKT":"U"},
	"f2":{"KT":"L","LGT":"U","SKT":"U"},
	"f3":{"KT":"U","LGT":"U","SKT":"U"},
	"f4":{"KT":"H","LGT":"U","SKT":"H"},
	"f5":{"KT":"H","LGT":"U","SKT":"U"},
	"f6":{"KT":"H","LGT":"U","SKT":"U"},
	"f7":{"KT":"U","LGT":"U","SKT":"U"},
	"f8":{"KT":"L","LGT":"U","SKT":"U"},
	"f9":{"KT":"U","LGT":"U","SKT":"U"},
	"fa":{"KT":"L","LGT":"U","SKT":"U"},
	"fb":{"KT":"U","LGT":"U","SKT":"H"},
	"fc":{"KT":"U","LGT":"U","SKT":"U"},
	"fd":{"KT":"U","LGT":"U","SKT":"U"},
	"fe":{"KT":"U","LGT":"U","SKT":"U"},
	"ff":{"KT":"U","LGT":"U","SKT":"L"}};
	var cid = fullid.split('_')[1];
	var hexcid = cid.toString(16);

	// console.log(hexcid.slice(-2));
	// console.log(bandlist[hexcid.slice(-2)][group.values[0]]);

	return bandlist[hexcid.slice(-2)][group.values[0]];
}


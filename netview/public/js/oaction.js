function crypt_cellid(cellid){
  return cellid.split('_')[0] + '_****' + String(cellid.split('_')[1]).slice(4)  + '_' + cellid.split('_')[2]; 
}

// L.mapbox.accessToken = 'pk.eyJ1Ijoiamlob29uaSIsImEiOiI5X0NHNWswIn0.xgBuGcqZetZBwmr0VZuSWw';
// var cmap = L.mapbox.map('cmap', 'mapbox.streets', {maxZoom:18}).setView([37.49800253054263,127.02608766689583], 13);
// var wmap = L.mapbox.map('wmap', 'mapbox.streets', {maxZoom:18}).setView([37.49800253054263,127.02608766689583], 13);
var cmap = L.map('cmap', {
						crs: L.Proj.CRS.TMS.Daum,
						continuousWorld: true,
						worldCopyJump: false,
						zoomControl: true
					}).setView([37.49800253054263,127.02608766689583], 4),
		wmap = L.map('wmap', {
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
	'<h6>Street</h6>': L.Proj.TileLayer.TMS.provider('DaumMap.Street').addTo(cmap),
	'<h6>Satellite</h6>' : L.Proj.TileLayer.TMS.provider('DaumMap.Satellite')
};

var overlayLayers2 = {
	'<h6>Hybrid</h6>' : L.Proj.TileLayer.TMS.provider('DaumMap.Hybrid'),
	// 'Physical Layers' : L.Proj.TileLayer.TMS.provider('DaumMap.Physical')
};

L.Proj.TileLayer.TMS.provider('DaumMap.Street').addTo(cmap);
L.control.layers(baseLayers1, overlayLayers1, {collapsed: false}).addTo(cmap);
L.Proj.TileLayer.TMS.provider('DaumMap.Street').addTo(wmap);
L.control.layers(baseLayers2, overlayLayers2, {collapsed: false}).addTo(wmap);

cmap.scrollWheelZoom.disable();
wmap.scrollWheelZoom.disable();

cmap.on('moveend', follow).on('zoomend', follow);
wmap.on('moveend', follow).on('zoomend', follow);	
var quiet = false;

// 37.55138234931889, 127.0107078552246
var networks = [
  {'name':'LTE','key':'lte'},
  {'name':'Celluar','key':'cell'},
  {'name':'Wi-Fi','key':'wf'},
];
networks.forEach(function(k){
  $('#networkmenus').append('<li><a href="#" onclick="_ch(\''+k.key+'\');">'+k.name+'</a></li>')
});
var ntype = networks[0];

var areas = [
  {"center": {"lat":37.52443079581378 ,"lng":126.96916580200195 ,"zoom":13 }, "name":"서울", "boundaries":{"ne":{"lat":37.71825739488253, "lng":127.2447561401367 }, "sw":{"lat":37.39164755045284,"lng":126.78264371337889}}},
  // {"center": {"lat":35.14658217841792 ,"lng":129.05193328857422 ,"zoom":13 }, "name":"부산", "boundaries":{"ne":{"lat":35.28648191701513, "lng":129.24323789062498}, "sw":{"lat":34.949489967541254,"lng":128.78112546386717}}},
  // {"center": {"lat":37.481669473029186,"lng":126.66824340820314 ,"zoom":13 }, "name":"인천", "boundaries":{"ne":{"lat":37.6612592529608,  "lng":126.76969939687092}, "sw":{"lat":37.33439921181131, "lng":126.3075869701131}}},
  // {"center": {"lat":37.32894564456342 ,"lng":127.91999816894531 ,"zoom":13 }, "name":"원주", "boundaries":{"ne":{"lat":37.44278587362785, "lng":128.05786756591795}, "sw":{"lat":37.27905632743658, "lng":127.86148695068357}}},
  // {"center": {"lat":35.14517852220056 ,"lng":126.8646240234375  ,"zoom":13 }, "name":"광주", "boundaries":{"ne":{"lat":35.289155727862166,"lng":127.01313642578123}, "sw":{"lat":34.952174861742954,"lng":126.62037519531248}}},
  // {"center": {"lat":35.82769553808818 ,"lng":127.13790893554688 ,"zoom":13 }, "name":"전주", "boundaries":{"ne":{"lat":36.08942535003392, "lng":127.22874311523435}, "sw":{"lat":35.755794801592934,"lng":126.8359818847656}}},
  // {"center": {"lat":35.542283716477264,"lng":129.3083953857422  ,"zoom":13 }, "name":"울산", "boundaries":{"ne":{"lat":35.74276090770887, "lng":129.49633026754407}, "sw":{"lat":35.407670973781705,"lng":129.10356903707532}}},
  // {"center": {"lat":35.85663965115521 ,"lng":128.57248306274414 ,"zoom":13 }, "name":"대구", "boundaries":{"ne":{"lat":36.039809841293156,"lng":128.8110580507472},  "sw":{"lat":35.705969666916374,"lng":128.41829682027844}}},
  // {"center": {"lat":36.33517895655434 ,"lng":127.40209579467772 ,"zoom":13 }, "name":"대전", "boundaries":{"ne":{"lat":36.54454603222065, "lng":127.54419708883313}, "sw":{"lat":36.212850099635745,"lng":127.15143585836438}}},
  // {"center": {"lat":36.806948220671735,"lng":127.13241577148436 ,"zoom":13 }, "name":"천안", "boundaries":{"ne":{"lat":36.97417995822917, "lng":127.29288483297375}, "sw":{"lat":36.644329632117284,"lng":126.900123602505}}},
  // {"center": {"lat":33.38386623304054 ,"lng":126.51168823242189 ,"zoom":11 }, "name":"제주", "boundaries":{"ne":{"lat":33.67006843120305, "lng":127.13996887207031}, "sw":{"lat":33.09671883650731, "lng":125.88340759277342}}}
]

areas.forEach(function(d){
  $('#areas').append('<li><a href="#" onclick="_loc('+d['center']['lat']+','+d['center']['lng']+','+d['center']['zoom']+')">'+d['name']+'</a></li>');
});

var _area = areas[0];
$('#curarea').html(_area.name);

function _loc(lat, lng, zoom){
  _area = areas.filter(function(d){ return d['center']['lat']==lat && d['center']['lng']==lng;})[0];
  $('#curarea').html(_area.name);
  cmap.setView([lat,lng], zoom);
  setTimeout(function(){
    paintMap('/api/v1.6/oaction/map/'+ntype.key+'/list', ntype.key);
  },500);
}


var comparegroups = [
  {'name':'LG U+ vs SK Telecom', 'key':'lgt_skt','names':['LG U+','SKT'], 'values':['LGT','SKT'], 'colors':['#e78ac3','#ff7f00'], 'wincnt':[0,0]},
  {'name':'LG U+ vs Korea Telecom', 'key':'lgt_kt','names':['LG U+','KT'], 'values':['LGT','KT'], 'colors':['#e78ac3','#984ea3'], 'wincnt':[0,0]},
  {'name':'SK Telecom vs Korea Telecom', 'key':'skt_kt','names':['SKT', 'KT'], 'values':['SKT','KT'], 'colors':['#ff7f00','#984ea3'], 'wincnt':[0,0]},
];
comparegroups.forEach(function(k){
  $('#optrcommenus').append('<li><a href="#" onclick="_gr(\''+k.key+'\');">'+k.name+'</a></li>')
});
var group = comparegroups[0];
$('#curnetwork').html(ntype.name); 
// var group = comparegroups[0];
if(localStorage.getItem("omonitor_group")){
  group = comparegroups.filter(function(d){return d.key == localStorage.getItem("omonitor_group")})[0];
}else{
  group = comparegroups[0];
}
$('#curgroup').html(group.name);

function _ch(kk){
  ntype = networks.filter(function(d){ return d.key == kk; })[0]
  $('#curnetwork').html(ntype.name); 
  paintMap('/api/v1.6/oaction/map/'+ntype.key+'/list', ntype);
	initChart();
	initDevicemap();
}

function _gr(kk){
  group = comparegroups.filter(function(d){ return d.key == kk; })[0];
  $('#curgroup').html(group.name); 
  localStorage.setItem("omonitor_group", group.key);
  initDashboard();
  paintMap('/api/v1.6/oaction/map/'+ntype.key+'/list', ntype);
	initChart();
	initDevicemap();
}

ST = {
	set : function(key, value){
		localStorage.setItem(key, JSON.stringify(value));
	},
	get : function(key){
		return JSON.parse(localStorage.getItem(key));
	}
}

function follow(e) {
  if (quiet) return;
  quiet = true;
  if (e.target === cmap) sync(wmap, e);
  if (e.target === wmap) sync(cmap, e);
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
  var bounds = cmap.getBounds(),
      sw = bounds.getSouthWest(),
      ne = bounds.getNorthEast();

  // console.log('dragend[' + Math.floor(sw.lat*1000000)/1000000 +',' + Math.floor(sw.lng*1000000)/1000000 +',' + Math.floor(ne.lat*1000000)/1000000 +',' + Math.floor(ne.lng*1000000)/1000000 +']'  );
  setTimeout(function(){
		paintMap('/api/v1.6/oaction/map/'+ntype.key+'/list', ntype);
		initDashboard();
		initChart();
		initDevicemap();
	},500);
});

wmap.on('dragend', function(e) {
	if(dragging){
		return;
	}
	dragging = true;
  var bounds = wmap.getBounds(),
      sw = bounds.getSouthWest(),
      ne = bounds.getNorthEast();

  // console.log('dragend[' + Math.floor(sw.lat*1000000)/1000000 +',' + Math.floor(sw.lng*1000000)/1000000 +',' + Math.floor(ne.lat*1000000)/1000000 +',' + Math.floor(ne.lng*1000000)/1000000 +']'  );

	setTimeout(function(){
		paintMap('/api/v1.6/oaction/map/'+ntype.key+'/list', ntype.key);
		initDashboard();
		initChart();
		initDevicemap();
	},500);
});
var markersref = {'c1':{}, 'c2':{}},
		quantscale = {'cell':[5,15,25,50], 'wf':[10,25,50,100],'lte':[5,15,25,50], 'colors':['#a6d96a','#ffffbf','#fdae61','#d7191c'], 'names':['Good','Fair','Poor','Very Poor']};


// if(ST.get('quantscale')){
// 	quantscale = ST.get('quantscale');
// }else{
// 	ST.set('quantscale',quantscale);	
// }

function listDevice(props_id){
	var type = props_id.indexOf('450')>-1?'cell':'wf';
	var id = props_id.indexOf('450')>-1?props_id:props_id.replace(/\-/g,':');
	id = id.replace('ofdevs','');
	$.getJSON('/api/v1.6/oaction/map/'+ntype.key+'/info', {'id':id}).done(function(data){
		var devlst = data.info.map(function(d){ return d['brand']+'-'+d['model']+'('+ Math.round(d['badness']*100)/100 +')'}).join(' , ');
		$('#'+props_id).html(devlst);
	});
}

function initDashboard(){
	$("[id^=quanlegend]").each(function(){
		var xxhtml = '';
		console.log(quantscale);
		quantscale.colors.forEach(function(d,i){
			xxhtml += '<td style="font-size:16px;"><span style="color:'+d+';">'+quantscale.names[i]+'</span></td>';
		});
		$(this).html(xxhtml);
	});
	$('#c1name').html('&nbsp;' + group.names[0]);
	$('#c2name').html('&nbsp;' + group.names[1]);
	$('#c1action').html('');$('#c2action').html('');
	// <td style="font-size:16px;"><span style="color:#ffffbf;" id="pvF">20</span></td>
	var c1yyhtml = '', c2yyhtml='';
	quantscale.colors.forEach(function(d,i){
		c1yyhtml += '<td style="font-size:16px;"><span style="color:#'+d+';" id="dashc1_'+quantscale.names[i].replace(' ','')+'">20</span></td>';
		c2yyhtml += '<td style="font-size:16px;"><span style="color:#'+d+';" id="dashc2_'+quantscale.names[i].replace(' ','')+'">20</span></td>';
	})
	$("#quanc1").html(c1yyhtml); $("#quanc2").html(c2yyhtml);

	$('#tbltitlec1').html('&nbsp;'+group.values[0] + ' Badness Top-10 Stations');
	$('#tbltitlec2').html('&nbsp;'+group.values[1] + ' Badness Top-10 Stations');
	
	$('#charttitlec1').html('&nbsp; '+group.values[0]+' Analysis by Time in This Area');
	$('#charttitlec2').html('&nbsp; '+group.values[1]+' Analysis by Time in This Area');

	$('#treemaptitlec1').html('&nbsp; '+group.values[0]+' Analysis by Device in This Area');
  $('#treemaptitlec2').html('&nbsp; '+group.values[1]+' Analysis by Device in This Area');

}

initDashboard();

function paintMap(url, type){
	$('#loading').css('display', 'block');
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
		var infocontent = '<table class="table table-striped table-hover text-center"><thead style="color:#fff;"><tr><td>ID</td><td>Badness</td><td>Sessions</td><td>Devices</td><td>Model Variance</td></tr></thead><tbody><tr><td class="success">'+crypt_cellid(props['id'])+'</td><td class="danger">'+Math.round(props['badness']*100)/100+' %</td><td class="warning">'+props['sesscnt']+'</td><td class="info">'+props['usrcnt']+'</td><td class="success"><a href="#" onclick="listDevice(\''+props['id'].replace(/\:/g,'-')+'ofdevs\')">'+Math.round(props['modelvr']*100)/100+'</a></td></tr><tr class="danger"><td colspan="5" id="'+props['id'].replace(/\:/g,'-')+'ofdevs"></td></tr></tbody></table>';
	  layer.bindPopup(infocontent,{offset: L.point(1,-2), maxWidth: 500});
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
	                            // legendFunc: function(d){ return d.values.filter(function(v){ return v.feature.properties.badcategory > 2; }).length;  }, // d.values.feature.properties.badcategory=='3' && d.values.feature.properties.badcategory=='4'? },
	                            strokeWidth: 1,
	                            outerRadius: r,
	                            innerRadius: r-10,
	                            pieClass: 'cluster-pie',
	                            pieLabel: n,
	                            pieLabelClass: 'marker-cluster-pie-label',
	                            pathClassFunc: function(d){return "category-"+d.data.key;},
	                            pathTitleFunc: function(d){return console.log(d.data.key); metadata.fields[categoryField].lookup[d.data.key];}
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
	        // legendFunc = options.legendFunc,
	        r = options.outerRadius?options.outerRadius:28, //Default outer radius = 28px
	        rInner = options.innerRadius?options.innerRadius:r-10, //Default inner radius = r-10
	        strokeWidth = options.strokeWidth?options.strokeWidth:1, //Default stroke is 1
	        pathClassFunc = options.pathClassFunc?options.pathClassFunc:function(){return '';}, //Class for each path
	        pathTitleFunc = options.pathTitleFunc?options.pathTitleFunc:function(){return '';}, //Title for each path
	        pieClass = options.pieClass?options.pieClass:'marker-cluster-pie', //Class for the whole pie
	        pieLabel = options.pieLabel?options.pieLabel:d3.sum(data,valueFunc), //Label for the whole pie
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
	                
	    vis.append('text')
	        .attr('x',origo)
	        .attr('y',origo)
	        .attr('class', pieLabelClass)
	        .attr('text-anchor', 'middle')
	        .attr('dy','.3em')
	        .text(pieLabel);
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

	// var markerclusters;

	var data = [];
	// var maplisturl = "/api/v1.3/haction/map/cellwf/list";
	var bounds = cmap.getBounds(),
      sw = bounds.getSouthWest(),
      ne = bounds.getNorthEast();
// console.log(ntype.key);
	$.getJSON(url, {'sw' : Math.floor(sw.lat*1000000)/1000000+','+Math.floor(sw.lng*1000000)/1000000, 'ne' : Math.floor(ne.lat*1000000)/1000000+','+Math.floor(ne.lng*1000000)/1000000
  ,'poor': quantscale[ntype.key][quantscale[ntype.key].length-2], 'scope':quantscale[ntype.key].join(',') }).done(function(data){
// console.log(data);
  		// clear previous makrer and cluster

  		
			var cellpts = data.features,
					cellgeojson = _.clone(mapGeostruc),
					cellscale = d3.scale.threshold().domain(quantscale[ntype.key]).range(['1','2','3','4']);

			group.values.forEach(function(g, i){

	  		if(!_.isUndefined(markersref['c'+(i+1)].cluster) && !_.isUndefined(markersref['c'+(i+1)].markers))
	  			markersref['c'+(i+1)].cluster.removeLayer(markersref['c'+(i+1)].markers);
				var map = (i == 0?cmap:wmap);
// console.log(g);
				cellgeojson.features = cellpts.filter(function(d){ return g==d.properties.optrcom; }).map(function(d){ return {"geometry":{"type":"Point","coordinates":[d.geometry.coordinates[0],d.geometry.coordinates[1]]},"type":"Feature","properties":{"badcategory":cellscale(d.properties.badness),"badness":d.properties.badness,"modelvr":d.properties.modelvr,"usrcnt":d.properties.usrcnt,"sesscnt":d.properties.sesscnt,"id":d.properties.id,"addr":d.properties.addr}} })
				var gg = d3.nest()
					.key(function(d){ return d.properties.badcategory; })
					.rollup(function(d){
						return d3.sum(d, function(g){ return 1; })
					}).entries(cellgeojson.features);

				paintCnt(i, gg);
				paintTable(i, cellgeojson.features);

		    var markers = L.geoJson(cellgeojson, {
						pointToLayer: defineFeature,
						onEachFeature: defineFeaturePopup
		    });			
				var markerclusters = L.markerClusterGroup({
					  maxClusterRadius: 2*rmax,
					      iconCreateFunction: defineClusterIcon //this is where the magic happens
					  });
				markerclusters.addTo(map);
		    markerclusters.addLayer(markers);
		    markersref.cluster = markerclusters;
		    markersref.markers = markers;
		    map.attributionControl.addAttribution(metadata.attribution);
			});


	    setTimeout(function(){ dragging = false; $('#loading').css('display', 'none');}, 500);

	});
	
}

paintMap('/api/v1.6/oaction/map/'+ntype.key+'/list', ntype.key);
initChart();
initDevicemap();


function paintCnt(type, data){
	function acquire(key){
		var aa = data.filter(function(d){ return d.key == key; })[0];
		return _.isUndefined(aa)?0:aa['values'];
	}
	quantscale.colors.forEach(function(d,i){
		$('#dashc'+(type+1)+'_'+quantscale.names[i].replace(' ','')).html('<span style="color:'+d+';">' + acquire(i+1) + '</span>');
	});
	$('#c'+(type+1)+'action').html(parseInt(acquire('3')) + parseInt(acquire('4')));
	// $('#'+type+'cnt').html('<span style="color:#a6d96a;">'+acquire('1')+'</span> / <span style="color:#ffffbf;">'+acquire('2')+'</span> / <span style="color:#fdae61;">'+acquire('3')+'</span> / <span style="color:#d7191c;">'+acquire('4')+'</span>');
	// $('#arsof'+type).html(parseInt(acquire('3'))+parseInt(acquire('4')))

}

function paintTable(type, data){
	console.log('--------paintTable----------');
	console.log(type);
	console.log(data);
	console.log('--------paintTable----------');
	var comparator = function(s,k){
    var a = parseFloat(s.properties.badness,2)
       ,b = parseFloat(k.properties.badness,2);
    return a < b ? 1 : a > b ? -1 : a >= b ? 0 : NaN;
  };    

	var desc_data = data.sort(comparator);
	// console.log(JSON.stringify(desc_data.map(function(d){ return d.properties.badness; })));

	$('#tblbodyc'+(type+1)).html("");
	for(var i=0;i<10;i++){
		var d = desc_data[i];
		$('#tblbodyc'+(type+1)).append('<tr onclick="_find(\''+type+'\','+d.geometry.coordinates[1]+','+d.geometry.coordinates[0]+')" style="cursor:pointer"><td>'+crypt_cellid(d.properties['id'])+'</td><td>'+Math.round(d.properties['badness']*100)/100+'%</td><td>'+d.properties['addr']+'</td></tr>');
	}
}

function _find(type, lat, lng){
	var map = type=='cell'?cmap:wmap,
			zoom = 17;
	map.setView([lat,lng], zoom);
}
function initChart(){
  var bounds = cmap.getBounds(),
        sw = bounds.getSouthWest(),
        ne = bounds.getNorthEast();

  var cellwfurl = '/api/v1.6/oaction/chart/'+ntype.key+'/list'
  $.getJSON(cellwfurl, {'sw' : Math.floor(sw.lat*1000000)/1000000+','+Math.floor(sw.lng*1000000)/1000000, 'ne' : Math.floor(ne.lat*1000000)/1000000+','+Math.floor(ne.lng*1000000)/1000000
     ,'poor': quantscale[ntype.key][quantscale[ntype.key].length-2] }).done(function(data){
console.log(ntype.key);      	
      // var wfdata = data.wf.map(function(d){return [d['todow'], Math.round(d['badness']*100)/100];});
      var c1data = data[ntype.key].filter(function(d){ return d['optrcom']==group.values[0]; }).map(function(d){return [d['todow'], Math.round(d['badness']*100)/100]; }),
      		c2data = data[ntype.key].filter(function(d){ return d['optrcom']==group.values[1]; }).map(function(d){return [d['todow'], Math.round(d['badness']*100)/100]; });
// console.log(data);      	
//       		console.log(c1data);
//       		console.log(c2data);
      drawTimeslot('c1',c1data);
      drawTimeslot('c2',c2data);

  });

}
function drawTimeslot(type, data){    
  data = data.sort(function(a,b){
    if( a[0] > b[0] ) return 1;
    if( a[0] < b[0] ) return -1;
    return 0;
  });
  // console.log(JSON.stringify(data));
  $('#chartbody'+type).highcharts({
      chart: {
          type: 'column'
      },
      title: {
          text: 'Occurrence of Poor-QoE Stations by ToD'
      },
      subtitle: {
          text: ''
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
      legend: {
          enabled: false
      },
      tooltip: {
          pointFormat: '<b>{point.y:.0f}</b>'
      },
      series: [{
          name: 'Population',
          data: data,
          dataLabels: {
              enabled: true,
              rotation: 0,
              color: '#FFFFFF',
              align: 'right',
              format: '{point.y:.0f}', // one decimal
              y: 10, // 10 pixels down from the top
              style: {
                  fontSize: '10px',
                  fontFamily: 'Verdana, sans-serif'
              }
          }
      }]
  });
}

// initDevicemap();

function initDevicemap(){
  var bounds = cmap.getBounds(),
      sw = bounds.getSouthWest(),
      ne = bounds.getNorthEast();

  var cellwfurl = '/api/v1.6/oaction/treemap/'+ntype.key+'/list'
  $.getJSON(cellwfurl, {'sw' : Math.floor(sw.lat*1000000)/1000000+','+Math.floor(sw.lng*1000000)/1000000, 'ne' : Math.floor(ne.lat*1000000)/1000000+','+Math.floor(ne.lng*1000000)/1000000
     ,'poor': quantscale[ntype.key][quantscale[ntype.key].length-2] }).done(function(data){
console.log(ntype.key);      	
      // var wfdata = data.wf.map(function(d){return { 'brand':}; });
      // var celldata = data.cell.map(function(d){return [d['todow'], d['badness']]; });
      // var wfnest = d3.nest()
      // 	.key(function(d){ return d['brand'];})
      // 	.key(function(d){ return d['model'];})
      // 	.entries(data.wf);
      var c1nest = d3.nest()
      	.key(function(d){ return d['brand'];})
      	.key(function(d){ return d['model'];})
      	.entries(data[ntype.key].filter(function(d){ return d['optrcom']==group.values[0];}));
      var c2nest = d3.nest()
      	.key(function(d){ return d['brand'];})
      	.key(function(d){ return d['model'];})
      	.entries(data[ntype.key].filter(function(d){ return d['optrcom']==group.values[1];}));
// console.log(data);      	
// console.log(c1nest);
// console.log(c2nest);
      drawTreemap('c1',c1nest);
      drawTreemap('c2',c2nest);
      // console.log(JSON.stringify(cellnest));
      // console.log(JSON.stringify(wfnest));


  });
}
// drawTreemap('','')

function drawTreemap(type, data){	
	var points = [],
		brand_p,
		brand_val,
		brand_i,
		model_p,
		model_i,
		cause_p,
		cause_i,
		cause_name = 'usrcnt';
	brand_i = 0;
	// console.log(JSON.stringify(data));
	// for (var brand in data) {
	for(var i=0;i<data.length;i++){
		var brand = data[i];
		// console.log('brand ---->');
		// console.log(brand);
		brand_val = 0;
		brand_p = {
			id: "id_" + brand_i,
			name: brand['key'],
			color: Highcharts.getOptions().colors[brand_i]
		};
		model_i = 0;
		// for (var model in brand['values']) {
		for (var j=0;j<brand['values'].length;j++) {
			var model = brand['values'][j];
			model_p = {
				id: brand_p.id + "_" + model_i,
				name: model['key'],
				parent: brand_p.id
			};
			points.push(model_p);
			cause_i = 0;
			// for (var cause in model['values']) {
			for (var k=0;k<model['values'].length;k++) {
				var cause = model['values'][k];
				cause_p = {
					id: model_p.id + "_" + cause_i,
					name: cause_name,
					parent: model_p.id,
					value: Math.round(+cause[cause_name]*100)/100
				};
				brand_val += cause_p.value;
				points.push(cause_p);
				cause_i++;
			}
			model_i++;
		}
		brand_p.value = Math.round(brand_val / model_i);
		points.push(brand_p);
		brand_i++;
	}
	// console.log(JSON.stringify(points));
	var chart = new Highcharts.Chart({
		chart: {
			renderTo: 'treemapbody'+type
		},
		series: [{
			type: "treemap",
			layoutAlgorithm: 'squarified',
			allowDrillToNode: true,
			dataLabels: {
				enabled: false
			},
			levelIsConstant: false,
			levels: [{
				level: 1,
				dataLabels: {
					enabled: true,
					shadow:false,
					style: {
	          fontSize: '22px',
	          fontWeight: 'bold',
	          textShadow: "0 0 2px contrast, 0 0 1px contrast"
          }
				},
				borderWidth: 3
			}],
			data: points
		}],
		subtitle: {
			text: ''
		},
		title: {
			text: 'Occurrence of Poor-QoE Users by Model'
		}
	});
}

function _mv(lat, lng, zoom){
	cmap.setView([lat,lng], zoom);
	setTimeout(function(){
		// paintMap(cmap, '/api/v1.3/haction/map/cell/list', 'cell');
		// paintMap(wmap, '/api/v1.3/haction/map/wf/list', 'wf');
		paintMap('/api/v1.6/oaction/map/'+ntype.key+'/list', ntype.key);
		initChart();
		initDevicemap();
	},500);
}



// var scopecolor = [{'n':'Good', 'c':'#a6d96a'},{'n':'Fair', 'c':'#ffffbf'},{'n':'Poor', 'c':'#fdae61'},{'n':'Very Poor', 'c':'#d7191c'}];

// function mkcntstatic(){
// 	$('[id^=scopeof]').each(function(){
// 		var me = $(this);
// 		me.html(function(){
// 			var aa = [], i =0;
// 			scopecolor.forEach(function(d,i){
// 				var bb = quantscale[me.attr("id").replace('scopeof','')][i];
// 				// console.log(bb);
// 				aa.push( '<span style="color:' + d.c + ';">'+d.n+'('+(_.isUndefined(bb)?100:bb)+')</span>'  );
// 			})
// 			var aaa = aa.join('<span> / </span>') + '&nbsp;<span id="pencil"><a href="#"><i class="fa fa-edit"/></a></span>' + '<div class="edit-input"><input type="text" class="edit-input-text" /><a href="#" id="save" style="padding-left:5px;"><i class="fa fa-save"></a></div>';
// 			return aaa;
// 		});
// 	});

// 	$('.edit-input-text').each(function(){
// 		$(this).mask('(99/99/99)', {placeholder: "(__/__/__)"})
// 	})

// 	// $('[id^=scopeof]').dblclick(function(e){
// 	$('[id^=scopeof] [id^=pencil]').click(function(e){
// 		var me = $(this).parent();
// 		me.find('span').hide();
// 		me.find('.edit-input-text').val('(' + quantscale[me.attr("id").replace('scopeof','')].join('/')+ ')')
// 		me.find('.edit-input').show()
// 		me.find('.edit-input-text').show().focus();	
// 		// console.log(me.attr("id") + ':' + quantscale[me.attr("id").replace('scopeof','')].join('/') );
// 		// me.find('input[type="text"]').val('(' + quantscale[me.attr("id").replace('scopeof','')].join('/')+ ')')
		
// 	});

// 	$('[id^=scopeof] [id^=save]').click(function(){
// 	// $('[id^=scopeof] input[type="text"]').focusout(function(){
// 		dragging = true;
// 		var dad = $(this).parent().parent();
// 		quantscale[dad.attr("id").replace('scopeof','')] = dad.find('input[type="text"]').val().replace('(','').replace(')','').split('/');
// 		ST.set('quantscale',quantscale);	

// 		dad.find('span').show();
// 		$(this).hide();
// 		mkcntstatic();

// 		setTimeout(function(){
// 			paintMap(cmap, '/api/v1.3/haction/map/cell/list', 'cell');
// 			paintMap(wmap, '/api/v1.3/haction/map/wf/list', 'wf');
// 			initChart();
// 			initDevicemap();
// 		},500);

// 	});
// } // end of mkcntstatic

// mkcntstatic();


// paintChart();
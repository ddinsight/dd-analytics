function crypt_cellid(cellid){
  return cellid.split('_')[0] + '_****' + String(cellid.split('_')[1]).slice(4)  + '_' + cellid.split('_')[2]; 
}

function crypt_bssid(bssid){
	return bssid.split(':')[0] + ':' + '**' +':'+ bssid.split(':')[2] +':'
		+ bssid.split(':')[3] +':'+ '**' +':'+ bssid.split(':')[5];
}

function crypt(id){
	if(id.indexOf(':')>0) return crypt_bssid(id);
	else return crypt_cellid(id);
}

var cmap = L.map('cmap', {
	crs: L.Proj.CRS.TMS.Daum,
	continuousWorld: true,
	worldCopyJump: false,
	zoomControl: true
}).setView([37.49800253054263,127.02608766689583], 8);
cmap.scrollWheelZoom.disable();

var baseLayers = {
	'<h6>Street</h6>': L.Proj.TileLayer.TMS.provider('DaumMap.Street').addTo(cmap),
	'<h6>Satellite</h6>' : L.Proj.TileLayer.TMS.provider('DaumMap.Satellite')
};

var overlayLayers = {
	'<h6>Hybrid</h6>' : L.Proj.TileLayer.TMS.provider('DaumMap.Hybrid')
};

L.Proj.TileLayer.TMS.provider('DaumMap.Street').addTo(cmap);
// L.Proj.TileLayer.TMS.provider('DaumMap.Hybrid').addTo(cmap);
L.control.layers(baseLayers, overlayLayers, {collapsed: false}).addTo(cmap);


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
	},500);
});


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
$('#curnetwork').html(ntype.name); 


function _ch(kk){
  ntype = networks.filter(function(d){ return d.key == kk; })[0]
  $('#curnetwork').html(ntype.name); 
  paintMap('/api/v1.6/oaction/map/'+ntype.key+'/list', ntype);
}

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
  {'name':'LG U+', 'key':'lgt'},
  {'name':'SK Telecom', 'key':'skt'},
  {'name':'Korea Telecom', 'key':'kt'},
	{'name':'All', 'key':'all'},
];
comparegroups.forEach(function(k){
  $('#optrcommenus').append('<li><a href="#" onclick="_gr(\''+k.key+'\');">'+k.name+'</a></li>')
});
var group = comparegroups[0];
$('#curgroup').html(group.name);

paintMap('/api/v1.6/oaction/map/'+ntype.key+'/list', ntype.key);

var markersref = {},
		quantscale = {'default':[1,3], 'colors':['#ff7f00','#984ea3','#e78ac3'], 'names':['SKT','KT','LGT']};

function _gr(kk){
  group = comparegroups.filter(function(d){ return d.key == kk; })[0];
  $('#curgroup').html(group.name); 
  if(group.key=='skt'){
  	$('#c1value').addClass('underline-text');$('#c2value').removeClass('underline-text');$('#c3value').removeClass('underline-text');
  }else if(group.key=='kt'){
  	$('#c1value').removeClass('underline-text');$('#c2value').addClass('underline-text');$('#c3value').removeClass('underline-text');
  }else if(group.key=='lgt'){
  	$('#c1value').removeClass('underline-text');$('#c2value').removeClass('underline-text');$('#c3value').addClass('underline-text');
  }else {
  	$('#c1value').removeClass('underline-text');$('#c2value').removeClass('underline-text');$('#c3value').removeClass('underline-text');
  }
  paintMap('/api/v1.6/oaction/map/'+ntype.key+'/list', ntype);
}
function getBadCategory(name){
	return name=='SKT'?5:name=='KT'?6:name=='LGT'?7:7;
}
function format2(nStr) {
	nStr += '';
	x = nStr.split('.');
	x1 = x[0];
	x2 = x.length > 1 ? '.' + x[1] : '';
	var rgx = /(\d+)(\d{3})/;
	while (rgx.test(x1)) {
	x1 = x1.replace(rgx, '$1' + ',' + '$2');
	}
	return x1 + x2;
}
function paintMap(url, type){
	$('#loading').css('display', 'block');
	$('#c1value').html('-');
	$('#c2value').html('-');
	$('#c3value').html('-');

	dragging = true;
	var mapGeostruc = {
			"type":"FeatureCollection", "features":[], 
			"properties":{
				"fields":{
					"category":{"name":"badcategory","lookup":{"5":"SK Telecom","6":"Korea Telcom","7":"LGU+"}}
				}, "attribution":"Airplug 2015 Inc."
			}
		}  ,
    metadata = mapGeostruc.properties,
    categoryField = 'badcategory', //This is the fieldname for marker category (used in the pie and legend)
    iconField = 'badcategory', //This is the fieldame for marker icon
    rmax = 40; //Maximum radius for cluster pies
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
		var infocontent = '<table class="table table-striped table-hover text-center"><thead style="color:#fff;"><tr><td>ID</td><td>Badness</td><td>Sessions</td><td>Devices</td></tr></thead><tbody><tr><td class="success">'+crypt(props['id'])+'</td><td class="danger">'+Math.round(props['badness']*100)/100+' %</td><td class="warning">'+props['sesscnt']+'</td><td class="info">'+props['usrcnt']+'</td></tr></tbody></table>';
	  layer.bindPopup(infocontent,{offset: L.point(1,-2), maxWidth: 500});
	}

	function defineClusterIcon(cluster) {
		var legendFunc = group.key=='all'? null : function(d){
			// console.log(d);
			var tot = {'skt':0,'kt':0,'lgt':0};
			d.forEach(function(item){
				if(item.key=="5") tot.skt = item.values.length;
				else if(item.key=="6") tot.kt = item.values.length;
				else if(item.key=="7") tot.lgt = item.values.length;
			});
			var rrr = parseInt(tot[group.key])/(parseInt(tot.skt)+parseInt(tot.kt)+parseInt(tot.lgt))*100;

			return Math.round(rrr) + '%';
		};

		var pieLabelClassFnc = group.key=='all'? function(d){
			return "marker-cluster-pie-label";
		} :  function(d){
			// console.log("marker-cluster-pie-label-"+getBadCategory(group.key.toUpperCase()));
			return "marker-cluster-pie-label-"+getBadCategory(group.key.toUpperCase()); 
		};

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
                            // valueFunc: valueFnc, 
                            // legendFunc: function(d){ return d.values.filter(function(v){ return v.feature.properties.badcategory > 2; }).length;  }, // d.values.feature.properties.badcategory=='3' && d.values.feature.properties.badcategory=='4'? },
                            legendFunc: legendFunc , 
                            strokeWidth: 1,
                            outerRadius: r,
                            innerRadius: r-14,
                            pieClass: 'cluster-pie',
                            pieLabel: n,
                            pieLabelClass: pieLabelClassFnc, // 'marker-cluster-pie-label',
                            pathClassFunc: function(d){return "category-"+d.data.key;},
                            pathTitleFunc: function(d){return metadata.fields['category'].lookup[d.data.key];}
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
	    // console.log(options.data);

	    var data = options.data,
	        valueFunc = options.valueFunc,
	        legendFunc = options.legendFunc,
	        r = options.outerRadius?options.outerRadius:28, //Default outer radius = 28px
	        rInner = options.innerRadius?options.innerRadius:r-10, //Default inner radius = r-10
	        strokeWidth = options.strokeWidth?options.strokeWidth:1, //Default stroke is 1
	        pathClassFunc = options.pathClassFunc?options.pathClassFunc:function(){return '';}, //Class for each path
	        pathTitleFunc = options.pathTitleFunc?options.pathTitleFunc:function(){return '';}, //Title for each path
	        pieClass = options.pieClass?options.pieClass:'marker-cluster-pie', //Class for the whole pie
	        pieLabel = legendFunc?legendFunc:options.pieLabel, 
	        pieLabelClass = options.pieLabelClass?options.pieLabelClass:'marker-cluster-pie-label',//Class for the pie label
	        
	        origo = (r+strokeWidth), //Center coordinate
	        w = origo*2.1, //width and height of the svg element
	        h = w,
	        donut = d3.layout.pie(),
	        arc = d3.svg.arc().innerRadius(rInner).outerRadius(r);
// console.log(pieLabel);	        
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


			if(typeof(pieLabel) == "function"){
				var aaa = pieLabel(data);
				// console.log(parseInt(aaa.replace('%','')) + ' and ' + _TTT[group.key]);
				if(parseInt(aaa.replace('%','')) < _TTT[group.key]){
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
				        .attr('fill', 'white')
				        .attr('dy','.3em')
				        	.text(pieLabel);									
						// vis.append('rect')
						// 		.attr('rx',1)
						// 		.attr('ry',1)
						// 		.attr('x',origo-12)
						// 		.attr('y',origo+8)
						// 		.attr('width', 25)
						// 		.attr('height', 6)
						// 		.attr('fill', 'blue')
				}
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

	// var data = [];
	var bounds = cmap.getBounds(),
      sw = bounds.getSouthWest(),
      ne = bounds.getNorthEast();
	$.getJSON(url, {'sw' : Math.floor(sw.lat*1000000)/1000000+','+Math.floor(sw.lng*1000000)/1000000, 'ne' : Math.floor(ne.lat*1000000)/1000000+','+Math.floor(ne.lng*1000000)/1000000 }).done(function(data){


 		var cellpts = data.features,
				cellgeojson = _.clone(mapGeostruc);

  		if(!_.isUndefined(markersref.cluster) && !_.isUndefined(markersref.markers))
  			markersref.cluster.removeLayer(markersref.markers);

			var map = cmap;
// console.log(cellpts);
			cellgeojson.features = cellpts.map(function(d){ 
				return {"geometry":{"type":"Point","coordinates":[d.geometry.coordinates[0],d.geometry.coordinates[1]]},"type":"Feature","properties":{"badcategory":getBadCategory(d.properties.optrcom),"badness":d.properties.badness,"pausecnt":d.properties.pausecnt,"pausetime":d.properties.pausetime, "stfail":d.properties.stfail,"rxbytes":d.properties.rxbytes, "duration":d.properties.duration, "optrcom":d.properties.optrcom,"usrcnt":d.properties.usrcnt,"sesscnt":d.properties.sesscnt,"id":d.properties.id,"addr":d.properties.addr}};
			})
			var gg = d3.nest()
				.key(function(d){ return d.properties.badcategory; })
				.rollup(function(d){
					return d3.sum(d, function(g){ return 1; })
				}).entries(cellgeojson.features);

			paintCnt(gg); 
			// paintTable(i, cellgeojson.features);

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


	    setTimeout(function(){ dragging = false; $('#loading').css('display', 'none');}, 500);
 		 	
  });

}
var _TTT = {'skt':0, 'kt':0, 'lgt':0}

function paintCnt(data){
	// console.log(data);
	var ToT = {'skt':0, 'kt':0, 'lgt':0};
	data.forEach(function(d){
		if(d.key == "5"){
			ToT.skt = d.values;
		}else if(d.key == "6"){
			ToT.kt = d.values;
		}else if(d.key == "7"){
			ToT.lgt = d.values;
		}
		_TTT.skt = Math.round(parseInt(ToT.skt)/(parseInt(ToT.skt)+parseInt(ToT.kt)+parseInt(ToT.lgt))*100);
		_TTT.kt  = Math.round(parseInt(ToT.kt )/(parseInt(ToT.skt)+parseInt(ToT.kt)+parseInt(ToT.lgt))*100);
		_TTT.lgt = Math.round(parseInt(ToT.lgt)/(parseInt(ToT.skt)+parseInt(ToT.kt)+parseInt(ToT.lgt))*100);

		// var rrr = parseInt(tot[group.key])/(parseInt(tot.skt)+parseInt(tot.kt)+parseInt(tot.lgt))*100;
		$('#c1value').html(format2(ToT.skt) + ' (' + Math.round(parseInt(ToT.skt)/(parseInt(ToT.skt)+parseInt(ToT.kt)+parseInt(ToT.lgt))*100) + '%)');
		$('#c2value').html(format2(ToT.kt ) + ' (' + Math.round(parseInt(ToT.kt )/(parseInt(ToT.skt)+parseInt(ToT.kt)+parseInt(ToT.lgt))*100) + '%)');
		$('#c3value').html(format2(ToT.lgt) + ' (' + Math.round(parseInt(ToT.lgt)/(parseInt(ToT.skt)+parseInt(ToT.kt)+parseInt(ToT.lgt))*100) + '%)');
	});
}


function _mv(lat, lng, zoom){
	cmap.setView([lat,lng], zoom);
	setTimeout(function(){
		paintMap('/api/v1.6/oaction/map/'+ntype.key+'/list', ntype.key);
	},500);
}


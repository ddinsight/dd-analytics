
// Create the Google Map…
var map = new google.maps.Map(d3.select("#cmap").node(), {
// var map = new google.maps.Map(document.getElementById('map'), {
		zoom : 12,
		center : new google.maps.LatLng(37.49800253054263,127.02608766689583),
		mapTypeId : google.maps.MapTypeId.ROADMAP
	});


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


function paintMap(){
	var url = '/api/v2.0/contour/map/cell/list';
	// var bounds = map.getBounds();
	// console.log(map);
	// console.log(bounds);
 //  var sw = bounds.getSouthWest(),
 //      ne = bounds.getNorthEast();

	$.getJSON(url, {'sw' : Math.floor(areas[0]['boundaries']['sw']['lat']*1000000)/1000000+','+Math.floor(areas[0]['boundaries']['sw']['lng']*1000000)/1000000, 'ne' : Math.floor(areas[0]['boundaries']['ne']['lat']*1000000)/1000000+','+Math.floor(areas[0]['boundaries']['ne']['lng']*1000000)/1000000 }).done(function(data){
 		console.log(data);
 		// var cellpts = data;				
 		var overlay = new google.maps.OverlayView();
 		// Add the container when the overlay is added to the map.
		overlay.onAdd = function () {
	
			// Add the section that will contain the markers of the data points
			var layer = d3.select(this.getPanes().overlayLayer).append("div")
				.attr("class", "stations");
			
			// Add the section that will contain the contour plot
			var cont_layer = d3.select(this.getPanes().overlayLayer).append("div")
					.attr("class","contour").append("svg:svg");
			
			// Add a group to the SVG object; groups can be affected by the opacity
			var cont_group = cont_layer.append("g").attr("opacity",0.3);
			
			// Implement the overlay.draw method
			overlay.draw = function () {
				var projection = this.getProjection(),
				padding = 1;
				
				//___Add the data markers
				
				// Draw each marker as a separate SVG element as in Mike Bostock's example for d3 and Google Maps
				// var marker = layer.selectAll("svg")
				// 	.data(d3.entries(data))
				// 	.each(transform) // update existing markers
				// 	.enter().append("svg:svg")
				// 	.each(transform)
				// 	.attr("class", "marker");
				
				// Add a circle.
				// marker.append("svg:circle")
				// .attr("r", 1.5)
				// .attr("cx", padding)
				// .attr("cy", padding);
				
				// Add a label.
				// marker.append("svg:text")
				// .attr("x", padding - 6)
				// .attr("y", padding + 6)
				// .attr("dy", ".31em")
				// .text(function (d) {
				// 	return (d.value[2].toFixed(2));//"("+d.value[0].toString()+", "+d.value[1].toString()+"): "+
				// });
				
				
				//___Add the contour plot
				
				// The data is provided as an array of [lat, lon, value] arrays and it need to be mapped to a grid.
				// Determine the min and max latitudes and longitudes
				var maxY = data[0][0];
				var minY = data[0][0];
				var maxX = data[0][1];
				var minX = data[0][1];
				var spacingX = 0.01;
				var spacingY = 0.01;
				data.forEach(function(val){
					maxX=maxX>val[1]?maxX:val[1];
					minX=minX<val[1]?minX:val[1];
					maxY=maxY>val[0]?maxY:val[0];
					minY=minY<val[0]?minY:val[0];
				});
				console.log("Mx = "+maxX+"  mx = "+minX+"  My = "+maxY+"  my = "+minY + " => " +(maxX-minX)/spacingX+":"+(maxY-minY)/spacingY);
				
				// Create a properly dimensioned array
				// console.log(parseInt(((maxX-minX)/spacingX).toFixed())+1)
				var grid=new Array(parseInt(((maxX-minX)/spacingX).toFixed())+1);
				console.log(grid);
				for (var i=0;i<grid.length;i++)
					grid[i] = Array(parseInt(((maxY-minY)/spacingY).toFixed())+1);
				console.log(grid);
				// Fill the grid with the values from the data array
				data.forEach(function(val){grid[parseInt(((val[1]-minX)/spacingX).toFixed())][parseInt(((val[0]-minY)/spacingY).toFixed())]=val[2];});
				
				//Add a "cliff edge" to force contour lines to close along the border.			
				var cliff = -100;
				grid.push(d3.range(grid[0].length).map(function() { return cliff; }));
				grid.unshift(d3.range(grid[0].length).map(function() { return cliff; }));
				grid.forEach(function(nd) {
				  nd.push(cliff);
				  nd.unshift(cliff);
				});
				
				// determine the size of the SVG
				var c2 = projection.fromLatLngToDivPixel(new google.maps.LatLng(minY, maxX));
				var c1 = projection.fromLatLngToDivPixel(new google.maps.LatLng(maxY, minX));
				
				var svgHeight = 8000; // c2.y - c1.y;  
				var svgWidth = 8000;  // c2.x - c1.x;
				var padX = -4000;
				var padY = -4000;
				
				console.log(svgHeight,svgWidth);
				
				// set the size of the SVG contour layer
				cont_layer
					.attr("width",svgWidth)
					.attr("height",svgHeight)
					.style("position","absolute")
					.style("top",padX)
					.style("left",padY);
				
				// conrec.js requires two arrays that represent the row and column coordinates. 
				// In this case these are an array of latitudes and one of longitudes
				var latpy = new Array();
				var lonpx = new Array();
				
				// Adding the cliff implies extending the latitude and longitude arrays beyound the minimum and maximum
				for (var i = 0; i < grid[0].length; i++)
					latpy[i] = minY + 0.01 * (i-1);
				
				for (var i = grid.length-1; i>=0; i--)
					lonpx[i] = minX + 0.01 * (i-1);
				
				// define the colours to be used and the corresponding limits
				var colours = ['#000099','#0000FF','#3399FF','#00CCFF','#00CC00','#66FF00','#FFFF00','#CC0000','#FF6633'],
					zs = [-0.1, 20.0, 50.0, 75.0, 90.0, 95.0, 98.0, 99.0, 99.9, 100.1];
				
				// create a Conrec object and compute the contour
				var c = new Conrec();
				c.contour(grid, 0, lonpx.length-1, 0, latpy.length-1, lonpx, latpy, zs.length, zs);
				
				// draw the contour plot following Jason Davies example for conrec.js and d3
				var cont = cont_group.selectAll("path").data(c.contourList())
					// update existing paths
					.style("fill",function(d) { 
						return colours[zs.indexOf(d.level)-1];
					})
					.style("stroke","black")
					.attr("d",d3.svg.line()
						// the paths are given in lat and long coordinates that need to be changed into pixel coordinates
						.x(function(d) { return (projection.fromLatLngToDivPixel(new google.maps.LatLng(d.y, d.x))).x - padX; })
						.y(function(d) { return (projection.fromLatLngToDivPixel(new google.maps.LatLng(d.y, d.x))).y - padY; })
						)
					.enter().append("svg:path")
					.style("fill",function(d) { 
					return colours[zs.indexOf(d.level)-1];
					})
					.style("stroke","black")
					.attr("d",d3.svg.line()
						// the paths are given in lat and long coordinates that need to be changed into pixel coordinates
						.x(function(d) { return (projection.fromLatLngToDivPixel(new google.maps.LatLng(d.y, d.x))).x - padX; })
						.y(function(d) { return (projection.fromLatLngToDivPixel(new google.maps.LatLng(d.y, d.x))).y - padY; })
					);
				
				// function for transforming the data marker
				function transform(d) {
					d = new google.maps.LatLng(d.value[0], d.value[1]);
					d = projection.fromLatLngToDivPixel(d);
					return d3.select(this)
					.style("left", (d.x - padding) + "px")
					.style("top", (d.y - padding) + "px");
				}
			};
		};
		
		// Bind our overlay to the map…
		overlay.setMap(map);
	});

}

paintMap();





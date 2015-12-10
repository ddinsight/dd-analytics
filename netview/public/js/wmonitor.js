
// $(function(){
function crypt_bssid(bssid){
	return bssid.split(':')[0] + ':' + '**' +':'+ bssid.split(':')[2] +':'
		+ bssid.split(':')[3] +':'+ '**' +':'+ bssid.split(':')[5];
}

var areas = [
  {"center": {"lat":37.49800253054263 ,"lng":127.02608766689583 ,"zoom":4 }, "name":"서울", "boundaries":{"ne":{"lat":37.71825739488253, "lng":127.2447561401367 }, "sw":{"lat":37.39164755045284,"lng":126.78264371337889}}},
  // {"center": {"lat":35.13691400539978 ,"lng":129.10558819770813 ,"zoom":4 }, "name":"부산", "boundaries":{"ne":{"lat":35.28648191701513, "lng":129.24323789062498}, "sw":{"lat":34.949489967541254,"lng":128.78112546386717}}},
  // {"center": {"lat":37.39510168313089, "lng":126.64955377578735 ,"zoom":4 }, "name":"인천", "boundaries":{"ne":{"lat":37.6612592529608,  "lng":126.76969939687092}, "sw":{"lat":37.33439921181131, "lng":126.3075869701131}}},
  // {"center": {"lat":35.15860876510268 ,"lng":126.87667250633238 ,"zoom":4 }, "name":"광주", "boundaries":{"ne":{"lat":35.289155727862166,"lng":127.01313642578123}, "sw":{"lat":34.952174861742954,"lng":126.62037519531248}}},
  // {"center": {"lat":35.81530757124276 ,"lng":127.14586973190306 ,"zoom":4 }, "name":"전주", "boundaries":{"ne":{"lat":36.08942535003392, "lng":127.22874311523435}, "sw":{"lat":35.755794801592934,"lng":126.8359818847656}}},
  // {"center": {"lat":35.54283369902713, "lng":129.34885382652283 ,"zoom":4 }, "name":"울산", "boundaries":{"ne":{"lat":35.74276090770887, "lng":129.49633026754407}, "sw":{"lat":35.407670973781705,"lng":129.10356903707532}}},
  // {"center": {"lat":35.86639547185584 ,"lng":128.60615015029907 ,"zoom":4 }, "name":"대구", "boundaries":{"ne":{"lat":36.039809841293156,"lng":128.8110580507472},  "sw":{"lat":35.705969666916374,"lng":128.41829682027844}}},
  // {"center": {"lat":36.33192920688755 ,"lng":127.40209579467772 ,"zoom":4 }, "name":"대전", "boundaries":{"ne":{"lat":36.54454603222065, "lng":127.54419708883313}, "sw":{"lat":36.212850099635745,"lng":127.15143585836438}}},
  // {"center": {"lat":33.50196783091423 ,"lng":126.53814554214476 ,"zoom":4 }, "name":"제주", "boundaries":{"ne":{"lat":33.67006843120305, "lng":127.13996887207031}, "sw":{"lat":33.09671883650731, "lng":125.88340759277342}}}
]

areas.forEach(function(d){
  $('#areas').append('<li><a href="#" onclick="_loc('+d['center']['lat']+','+d['center']['lng']+','+d['center']['zoom']+')">'+d['name']+'</a></li>');
});

var _area = areas[0];
$('#curarea').html(_area.name);

function _loc(lat, lng, zoom){
  console.log('start _loc!!!' + lat +',' +lng );
  
  _area = areas.filter(function(d){ return d['center']['lat']==lat && d['center']['lng']==lng;})[0];
  $('#curArea').html(_area.name);
  map.setCenter(new daum.maps.LatLng(lat,lng));
  setTimeout(function(){
    paint();
  },500);
}



// 마커를 클릭했을 때 해당 장소의 상세정보를 보여줄 커스텀오버레이입니다
var placeOverlay = new daum.maps.CustomOverlay({zIndex:1}), 
	markers = [], // 마커를 담을 배열입니다
	currCategory = ''; // 현재 선택된 카테고리를 가지고 있을 변수입니다
	
var mapTypeControl = new daum.maps.MapTypeControl();    
var mapContainer = document.getElementById('map'), // 지도를 표시할 div 
	mapOption = {
		center: new daum.maps.LatLng(37.49800253054263,127.02608766689583), // 지도의 중심좌표
		level: 5 // 지도의 확대 레벨
	};  

// 지도를 생성합니다    
var map = new daum.maps.Map(mapContainer, mapOption); 
map.addControl(mapTypeControl, daum.maps.ControlPosition.TOPRIGHT);
var zoomControl = new daum.maps.ZoomControl();
map.addControl(zoomControl, daum.maps.ControlPosition.RIGHT);
map.setZoomable(false); 
// 주소-좌표 변환 객체를 생성합니다
var geocoder = new daum.maps.services.Geocoder();
// 장소 검색 객체를 생성합니다
var ps = new daum.maps.services.Places(map); 

// 지도에 idle 이벤트를 등록합니다
daum.maps.event.addListener(map, 'idle', searchPlaces);

// 각 카테고리에 클릭 이벤트를 등록합니다
addCategoryClickEvent();

// 카테고리 검색을 요청하는 함수입니다
function searchPlaces() {
	if (!currCategory) {
		return;
	}
	
	ps.categorySearch(currCategory, placesSearchCB, {useMapBounds:true}); 
}

// 장소검색이 완료됐을 때 호출되는 콜백함수 입니다
function placesSearchCB( status, data, pagination ) {
	if (status === daum.maps.services.Status.OK) {

		// 정상적으로 검색이 완료됐으면 지도에 마커를 표출합니다
		displayPlaces(data.places);
	} 
}

// 지도에 마커를 표출하는 함수입니다
function displayPlaces(places) {

	// 몇번째 카테고리가 선택되어 있는지 얻어옵니다
	// 이 순서는 스프라이트 이미지에서의 위치를 계산하는데 사용됩니다
	var order = document.getElementById(currCategory).getAttribute('data-order');

	// 지도에 표시되고 있는 마커를 제거합니다
	removeMarker();

	for ( var i=0; i<places.length; i++ ) {

			// 마커를 생성하고 지도에 표시합니다
			var marker = addMarker(new daum.maps.LatLng(places[i].latitude, places[i].longitude), order);

			// 마커와 검색결과 항목을 클릭 했을 때
			// 장소정보를 표출하도록 클릭 이벤트를 등록합니다
			(function(marker, place) {
				daum.maps.event.addListener(marker, 'click', function() {
					displayPlaceInfo(place);
				});
			})(marker, places[i]);
	}
}

// 마커를 생성하고 지도 위에 마커를 표시하는 함수입니다
function addMarker(position, order) {
	var imageSrc = 'http://i1.daumcdn.net/localimg/localimages/07/mapapidoc/places_category.png', // 마커 이미지 url, 스프라이트 이미지를 씁니다
		imageSize = new daum.maps.Size(27, 28),  // 마커 이미지의 크기
		imgOptions =  {
			spriteSize : new daum.maps.Size(72, 208), // 스프라이트 이미지의 크기
			spriteOrigin : new daum.maps.Point(46, (order*36)), // 스프라이트 이미지 중 사용할 영역의 좌상단 좌표
			offset: new daum.maps.Point(11, 28) // 마커 좌표에 일치시킬 이미지 내에서의 좌표
		},
		markerImage = new daum.maps.MarkerImage(imageSrc, imageSize, imgOptions),
			marker = new daum.maps.Marker({
			position: position, // 마커의 위치
			image: markerImage 
		});

	marker.setMap(map); // 지도 위에 마커를 표출합니다
	markers.push(marker);  // 배열에 생성된 마커를 추가합니다

	return marker;
}

// 지도 위에 표시되고 있는 마커를 모두 제거합니다
function removeMarker() {
	for ( var i = 0; i < markers.length; i++ ) {
		markers[i].setMap(null);
	}   
	markers = [];
}

// 클릭한 마커에 대한 장소 상세정보를 커스텀 오보레이로 표시하는 함수입니다
function displayPlaceInfo (place) {
	var content = '<div class="placeinfo_wrap">' + 
				'   <div class="placeinfo">' +
				'       <a class="title" href="' + place.placeUrl + '" target="_blank" title="' + place.title + '">' + place.title + '</a>';   

	if (place.newAddress) {
		content += '        <span title="' + place.newAddress + '">' + place.newAddress + '</span>' +
					'      <span class="jibun" title="' + place.address + '">(지번 : ' + place.address + ')</span>';
	}  else {
		content += '        <span title="' + place.address + '">' + place.address + '</span>';
	}                
	 
	content += '        <span class="tel">' + place.phone + '</span>' + 
					'   </div>' + 
					'   <div class="after"></div>' +
					'</div>';

	placeOverlay.setContent(content);
	placeOverlay.setPosition(new daum.maps.LatLng(place.latitude, place.longitude));
	placeOverlay.setMap(map);  
}


// 각 카테고리에 클릭 이벤트를 등록합니다
function addCategoryClickEvent() {
	var category = document.getElementById('category'),
		children = category.children;

	for (var i=0; i<children.length; i++) {
		children[i].onclick = onClickCategory;
	}
}

// 카테고리를 클릭했을 때 호출되는 함수입니다
function onClickCategory() {
	var id = this.id,
		className = this.className;

	if (className === 'on') {
		currCategory = '';
		changeCategoryClass();
		removeMarker();
		placeOverlay.setMap(null);
	} else {
		currCategory = id;
		changeCategoryClass(this);
		searchPlaces();
	}
}

// 클릭된 카테고리에만 클릭된 스타일을 적용하는 함수입니다
function changeCategoryClass(el) {
	var category = document.getElementById('category'),
		children = category.children,
		i;

	for ( i=0; i<children.length; i++ ) {
		children[i].className = '';
	}

	if (el) {
		el.className = 'on';
	} 
}
searchAddrFromCoords(map.getCenter(), displayCenterInfo);

function searchAddrFromCoords(coords, callback) {
	// 좌표로 주소 정보를 요청합니다
	geocoder.coord2addr(coords, callback);         
}

// 지도 좌측상단에 지도 중심좌표에 대한 주소정보를 표출하는 함수입니다
function displayCenterInfo(status, result) {
	if (status === daum.maps.services.Status.OK) {
		$('#area').html(result[0].fullName);
		// var infoDiv = document.getElementById('centerAddr');
		// infoDiv.innerHTML = result[0].fullName;
	}    
}

var bmarkerimg = 'assets/images/red-wifi-link-md.png',
	gmarkerimg = 'assets/images/blue-wifi-link-md.png',
	rmarkerimg = 'assets/images/orange-wifi-link-md.png',
	imageSize = new daum.maps.Size(27,23);        
var acnt = 0, rcnt = 0, dcnt = 0;    
var loop1 = true, loop2=true, loop3=true;
paint();

daum.maps.event.addListener(map, 'center_changed', function() {
	if(loop3) setTimeout(function(){paint();}, 500 );
});
function paint(){
	$('#loading').css('display', 'block');
	console.log('paint : ' + loop1 + ':' + loop2 + ':' + loop3);
	if(!loop3) return;
	searchAddrFromCoords(map.getCenter(), displayCenterInfo);
	acnt = 0, rcnt = 0, dcnt = 0;
	loop1 = false, loop2=false, loop3=false;
	var bounds = map.getBounds(),
		sw = bounds.getSouthWest(),
		ne = bounds.getNorthEast();
	var imageSrc = "http://i1.daumcdn.net/localimg/localimages/07/mapapidoc/markerStar.png";     
	var maplisturl = "/api/v1.0/map/daum";
	$.getJSON(maplisturl, {
		'sw' : Math.floor(sw.getLat()*1000000)/1000000+','+Math.floor(sw.getLng()*1000000)/1000000, 'ne' : Math.floor(ne.getLat()*1000000)/1000000+','+Math.floor(ne.getLng()*1000000)/1000000
	}).done(function(data){
		// console.log(data);
		var positions = data.features;
		for(var i=0;i<positions.length;i++){
			// console.log(positions[i].properties);
			if(positions[i].properties.install == 'A'){
				imageSrc = bmarkerimg;
				acnt++; $('#addapcount').html(acnt);
			}else if(positions[i].properties.install == 'D'){
				imageSrc = rmarkerimg;
				rcnt++; $('#repairapcount').html(rcnt);
			}else if(positions[i].properties.install == 'R'){
				imageSrc = gmarkerimg;
				dcnt++; $('#removeapcount').html(dcnt);
			}
			var markerImage = new daum.maps.MarkerImage(imageSrc, imageSize); 
			var marker = new daum.maps.Marker({
				map: map, // 마커를 표시할 지도
				clickable: true,
				position: new daum.maps.LatLng(positions[i].geometry.coordinates[1], positions[i].geometry.coordinates[0]), // 마커를 표시할 위치
				title : positions[i].properties.info + ' / ' + positions[i].properties.bssid, // 마커의 타이틀, 마커에 마우스를 올리면 타이틀이 표시됩니다
				image : markerImage // 마커 이미지 
			});                    
		}
		loop1 = true;
	});

	var wfcompanyurl = "/api/v1.0/chart/wfcompany";
	$.getJSON(wfcompanyurl, {
		'sw' : Math.floor(sw.getLat()*1000000)/1000000+','+Math.floor(sw.getLng()*1000000)/1000000, 'ne' : Math.floor(ne.getLat()*1000000)/1000000+','+Math.floor(ne.getLng()*1000000)/1000000
	}).done(function(data){

		$('#container').highcharts({
			chart: {
				plotBackgroundColor: null,
				plotBorderWidth: null,
				plotShadow: false
			},
			title: {
				text: 'Makers of Repair-needed APs in this area'
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
				name: 'Manufactures share',
				data: data
			}]
		});
		loop2 = true;
	});

var cellwfurl = '/api/v1.0/chart/cellwf'
$.getJSON(cellwfurl, {
	'sw' : Math.floor(sw.getLat()*1000000)/1000000+','+Math.floor(sw.getLng()*1000000)/1000000, 'ne' : Math.floor(ne.getLat()*1000000)/1000000+','+Math.floor(ne.getLng()*1000000)/1000000
}).done(function(data){
// console.log(data);
	$('#container1').highcharts({
		chart: {
			type: 'column'
		},
		title: {
			text: 'Celluar VS Wifi Traffic'
		},
		xAxis: {
			categories: ['201501', '201502', '201503']
		},
		yAxis: {
			min: 0,
			title: {
				text: 'Celluar vs Wifi Traffic'
			}
		},
		tooltip: {
			pointFormat: '<span style="color:{series.color}">{series.name}</span>: <b>{point.y}</b> ({point.percentage:.0f}%)<br/>',
			shared: true
		},
		plotOptions: {
			column: {
				stacking: 'percent'
			}
		},
		series: [{
			name: 'celluar',
			data: data.cellsum
		}, {
			name: 'wifi',
			data: data.wfsum
		}]
	});
	
});


var cellwfurl = '/api/v1.0/table/top10'
$.getJSON(cellwfurl, {
	'sw' : Math.floor(sw.getLat()*1000000)/1000000+','+Math.floor(sw.getLng()*1000000)/1000000, 'ne' : Math.floor(ne.getLat()*1000000)/1000000+','+Math.floor(ne.getLng()*1000000)/1000000
}).done(function(data){
	$('#addaplist').html("");$('#repairaplist').html("");$('#removeaplist').html("");
	data.typeA.forEach(function(d){
		$('#addaplist').append("<tr><td>"+(d['ssid'])+"</td><td>"+crypt_bssid(d['bssid'])+"</td><td>"+d['addr']+"</td></tr>");
	});
	data.typeR.forEach(function(d){
		$('#repairaplist').append("<tr><td>"+(d['ssid'])+"</td><td>"+crypt_bssid(d['bssid'])+"</td><td>"+d['addr']+"</td></tr>");
	});
	data.typeD.forEach(function(d){
		$('#removeaplist').append("<tr><td>"+(d['ssid'])+"</td><td>"+crypt_bssid(d['bssid'])+"</td><td>"+d['addr']+"</td></tr>");
	});
	setTimeout(function(){ loop3 = true;  $('#loading').css('display', 'none');}, 500);
});

var resulttrendurl = '/api/v1.0/chart/resultTrend'
$.getJSON(resulttrendurl, {
	'sw' : Math.floor(sw.getLat()*1000000)/1000000+','+Math.floor(sw.getLng()*1000000)/1000000, 'ne' : Math.floor(ne.getLat()*1000000)/1000000+','+Math.floor(ne.getLng()*1000000)/1000000
}).done(function(data){
	// console.log(data);

	$('#container4').highcharts({
		title: {
			text: 'Wifi Traffic Trend',
			x: -20 //center
		},
		subtitle: {
			text: 'Source: Airplug',
			x: -20
		},
		xAxis: {
			categories: ['201501', '201502', '201503']
		},
		yAxis: {
			title: {
				text: 'TP'
			},
			plotLines: [{
				value: 0,
				width: 1,
				color: '#808080'
			}], min: 0
		},
		tooltip: {
			valueSuffix: 'MB'
		},
		legend: {
			layout: 'vertical',
			align: 'right',
			verticalAlign: 'middle',
			borderWidth: 0
		},
		series: [{
			name: 'Wifi TP',
			data: data.wifitpavg
		}]
	});
// });
$('#container5').highcharts({
		title: {
			text: 'Connection/Errros Trend',
			x: -20 //center
		},
		subtitle: {
			text: 'Source: Airplug',
			x: -20
		},
		xAxis: {
			categories: ['201501', '201502', '201503']
		},
		yAxis: {
			title: {
				text: 'TP'
			},
			plotLines: [{
				value: 0,
				width: 1,
				color: '#808080'
			}], min: 0
		},
		tooltip: {
			valueSuffix: 'Count'
		},
		legend: {
			layout: 'vertical',
			align: 'right',
			verticalAlign: 'middle',
			borderWidth: 0
		},
		series: [{
			name: 'AP count',
			data: data.e303
		}]
	});
// });

$('#container6').highcharts({
		title: {
			text: 'Zero Connect Trend',
			x: -20 //center
		},
		subtitle: {
			text: 'Source: Airplug',
			x: -20
		},
		xAxis: {
			categories: ['201501', '201502', '201503']
		},
		yAxis: {
			title: {
				text: 'TP'
			},
			plotLines: [{
				value: 0,
				width: 1,
				color: '#808080'
			}], min: 0
		},
		tooltip: {
			valueSuffix: 'Count'
		},
		legend: {
			layout: 'vertical',
			align: 'right',
			verticalAlign: 'middle',
			borderWidth: 0
		},
		series: [{
			name: 'AP count',
			data: data.zerocon
		}]
	});
});
	
} // end of paint

	

// });
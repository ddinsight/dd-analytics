function crypt_cellid(cellid){
  return cellid.split('_')[0] + '_****' + String(cellid.split('_')[1]).slice(4)  + '_' + cellid.split('_')[2]; 
}

function crypt_bssid(bssid){
  return bssid.split(':')[0] + ':' + '**' +':'+ bssid.split(':')[2] +':'
    + bssid.split(':')[3] +':'+ '**' +':'+ bssid.split(':')[5];
}


var keys = [
  {'name':'Badness KPI', 'unit':'%', 'key':'badness', 'orderby':'asc'},
  {'name':'Pause Count', 'unit':'Counts per hour', 'key':'pausecnt', 'orderby':'asc'},
  {'name':'Pause Time', 'unit':'Minutes per hour', 'key':'pausetime', 'orderby':'asc'},
  {'name':'Start Fail', 'unit':'Counts per session', 'key':'stfail', 'orderby':'asc'},
  {'name':'Network Speed', 'unit':'Mbps', 'key':'tp', 'orderby':'desc'},
  {'name':'Network Usage', 'unit':'MB per day', 'key':'rxbytes', 'orderby':'desc'},
]
keys.forEach(function(k){
  $('#keymenus').append('<li><a href="#" onclick="_mv(\''+k.key+'\');">'+k.name+'</a></li>')
});
var keyfactor = keys[0];
$('#curkey').html(keyfactor.name + "&nbsp;[" + keyfactor.unit+ "]"); 
$('[id=keyfactor_nm]').each(function(){
  // console.log('1');
  $(this).html(keyfactor.name)
});

var areas = [
  {"center": {"lat":37.52347778483829 ,"lng":127.00924873352051 ,"zoom":13 }, "name":"서울", "boundaries":{"ne":{"lat":37.71825739488253, "lng":127.2447561401367 }, "sw":{"lat":37.39164755045284,"lng":126.78264371337889}}},
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
  map.setView([lat,lng], zoom);
  setTimeout(function(){
    paintmap();
  },500);
}


// $('#keyfactor_nm').html(keyfactor.name);
var mainLayers = [];
var map, focusmap;
var geojson;
var center = [37.52347778483829,127.00924873352051];
var osmUrl = 'http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png',
// var osmUrl = 'http://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png',
    osmAttrib = '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; <a href="http://cartodb.com/attributions">CartoDB</a>',
    osm = L.tileLayer(osmUrl, {maxZoom: 18, attribution: osmAttrib});

map = new L.Map('map', {layers: [osm], center: new L.LatLng(center[0], center[1]), zoom: 13, zoomControl:false });
map.doubleClickZoom.disable();
map.scrollWheelZoom.disable();
map.on('dragend', function(e) {
    var bounds = map.getBounds(),
        sw = bounds.getSouthWest(),
        ne = bounds.getNorthEast();

    console.log('dragend[' + Math.floor(sw.lat*1000000)/1000000 +',' + Math.floor(sw.lng*1000000)/1000000 +',' + Math.floor(ne.lat*1000000)/1000000 +',' + Math.floor(ne.lng*1000000)/1000000 +']'  );
    paintmap();

});
var loop1 = false;
var detailmarkers = {'cell':[],'wf':[]};

function paintmap(){
  $('#loading').css('display', 'block');
  if(loop1) return;
  loop1 = true;
  console.log('paintmap key is ' + keyfactor.key);
  // clear previous layer
  mainLayers.forEach(function(layer){ map.removeLayer(layer); });
  var options = {
      radius : 30,
      opacity: .6,
      duration: 200,
      lng: function(d){
        return d[0];
      },
      lat: function(d){
        return d[1];
      },
      value: function(data){
        var m = d3.sum(data.map(function(d){ return d.o[2]; }));   
        // console.log(m);
        return m;       
      },
      orderbydesc: false,
      valueFloor: 0,
      valueCeil: undefined,
      clickfn:function(d){ 
        focusmap.setCenter(new daum.maps.LatLng( d[0].o[1],d[0].o[0] ) ); 
        searchAddrFromCoords(focusmap.getCenter(), displayCenterInfo);
        detailToFocus();
        initTable();
        initChart();
        initDevicemap();
      }
  };
  // markerclusters.addTo(map);
  function detailToFocus(){
    $('#loading').css('display', 'block');
    console.log('detailToFocus start [' + keyfactor.key);
    console.log(focusmap.getBounds());
    // clear daum map markers 
    detailmarkers.cell.forEach(function(d){ d['marker'].setMap(null); });
    detailmarkers.wf.forEach(function(d){ d['marker'].setMap(null); }); 

    var bounds = focusmap.getBounds(),
        sw = bounds.getSouthWest(),
        ne = bounds.getNorthEast();
    $.getJSON('/api/v1.1/skt/map/cellwf/detail', {'sw' : Math.floor(sw.getLat()*1000000)/1000000+','+Math.floor(sw.getLng()*1000000)/1000000, 'ne' : Math.floor(ne.getLat()*1000000)/1000000+','+Math.floor(ne.getLng()*1000000)/1000000
     }).done(function(data){
        // console.log(data);
        var positions = data.features;
        var wfpos = positions.filter(function(d){ 
          return (d.properties.type == 'wf')              
        }), 
        wfcoords = wfpos.map(function(d){
          return d.geometry.coordinates;
        }),
        cellpos = positions.filter(function(d){ 
          return (d.properties.type == 'cell')              
        }),
        cellcoords = cellpos.map(function(d){
          return d.geometry.coordinates;
        });
        var cellColor;
        if(keyfactor.orderby == 'asc'){
          cellColor = d3.scale.threshold().range(['white','FF8080','red']);  
        }else{
          cellColor = d3.scale.threshold().range(['red','FF8080','white']);
        }
        cellColor.domain(d3.extent(cellpos, function(d){
          return d.properties[keyfactor.key];
        }))
        var celldata = wfpos.map(function(d){
          return d.properties[keyfactor.key];
        })
           ,wfdata = cellpos.map(function(d){
          return d.properties[keyfactor.key];
        });
        var cellmax = d3.max(celldata)
           ,cellmean = d3.mean(celldata)
           ,wfmax = d3.max(wfdata)
           ,wfmean = d3.mean(wfdata);

        $("#dcelldesc").html( Math.round(cellmean*100)/100 + " for "  + Math.round(celldata.length) + ' stations');   
        $("#dwfdesc").html(   Math.round(wfmean*100)/100 + " for "  + Math.round(wfdata.length) + ' stations');
        // $("#dcelldesc").html( Math.round(celldata.length,2) + " &nbsp;/&nbsp; " + Math.round(cellmean,2) + " &nbsp;/&nbsp; "  + Math.round(cellmax,2));   
        // $("#dwfdesc").html(   Math.round(wfdata.length,2) + " &nbsp;/&nbsp; " + Math.round(wfmean,2) + " &nbsp;/&nbsp; "  + Math.round(wfmax,2));   

        cellpos.forEach(function(c){
          // console.log(cellColor(c.properties.pausecnt));
          var sss = isSkippedPt('cell',keyfactor.key, c.properties[keyfactor.key], c.properties['usrcnt']);
          // if(cellColor(c.properties[keyfactor.key]) == '#ffffff'){
          if(!sss){
            return; 
          }
          var infocontent = '<table class="table table-striped table-hover text-center"><thead><tr><td>ID</td><td>'+keyfactor.name+'</td><td>Sessions</td><td>Devices</td></tr></thead><tbody><tr><td class="success">'+crypt_cellid(c.properties['id'])+'</td><td class="danger">'+Math.round(c.properties[keyfactor.key],4)+'</td><td class="warning">'+c.properties['sesscnt']+'</td><td class="info">'+c.properties['usrcnt']+'</td></tr></tbody></table>';
          // console.log('<i class="fa fa-signal" style="color:'+cellColor(c.properties.pausecnt)+'"></i>');
          var mapCustomOverlay = new daum.maps.CustomOverlay({
            position:  new daum.maps.LatLng(c.geometry.coordinates[1], c.geometry.coordinates[0]),
            map : focusmap,
            clickable : true,            
            content: '<a href="#" onclick="infowindow(\'cell\', '+c.geometry.coordinates[1]+','+c.geometry.coordinates[0]+');"><i class="fa fa-signal" style="color:'+cellColor(c.properties[keyfactor.key])+';opacity:0.7"></i></a>',
            xAnchor: 0, // 커스텀 오버레이의 x축 위치입니다. 1에 가까울수록 왼쪽에 위치합니다. 기본값은 0.5 입니다
            yAnchor: 0 // 커스텀 오버레이의 y축 위치입니다. 1에 가까울수록 위쪽에 위치합니다. 기본값은 0.5 입니다
          });

          detailmarkers.cell.push({'marker':mapCustomOverlay, 'info':infocontent});
          // mapCustomOverlay.setMap(focusmap);
        });
        if(keyfactor.orderby == 'asc'){
          wfColor = d3.scale.threshold().range(['white','#8080FF','blue']);
        }else{
          wfColor = d3.scale.threshold().range(['blue','#8080FF','white']);  
        }

        wfColor.domain(d3.extent(wfpos, function(d){
          return d.properties[keyfactor.key];
        }));
        
        // 커스텀 오버레이를 생성합니다
        wfpos.forEach(function(c){
          var sss = isSkippedPt('wf',keyfactor.key, c.properties[keyfactor.key], c.properties['usrcnt']);
          // if(wfColor(c.properties[keyfactor.key]) == '#ffffff'){
          if(!sss){
            return; 
          }
          // console.log('<i class="fa fa-signal" style="color:'+cellColor(c.properties.pausecnt)+'"></i>');
          var infocontent = '<table class="table table-striped table-hover text-center"><thead><tr><td>ID</td><td>'+keyfactor.name+'</td><td>Sessions</td><td>Devices</td></tr></thead><tbody><tr><td class="success">'+crypt_bssid(c.properties['id'])+'</td><td class="danger">'+Math.round(c.properties[keyfactor.key],4)+'</td><td class="warning">'+c.properties['sesscnt']+'</td><td class="info">'+c.properties['usrcnt']+'</td></tr></tbody></table>';
          // console.log(infocontent);
          var mapCustomOverlay = new daum.maps.CustomOverlay({
            position:  new daum.maps.LatLng(c.geometry.coordinates[1], c.geometry.coordinates[0]),
            map : focusmap,
            clickable : true,
            // content: '<img src="http://i1.daumcdn.net/localimg/localimages/07/mapapidoc/place_thumb.png" alt="">',
            content: '<a href="#" onclick="infowindow(\'wf\', '+c.geometry.coordinates[1]+','+c.geometry.coordinates[0]+');"><i class="fa fa-wifi" style="color:'+wfColor(c.properties[keyfactor.key])+';opacity:0.7"></i></a>',
            // content: '<div><i class="fa fa-signal"></i></div>',
            xAnchor: 0.5, // 커스텀 오버레이의 x축 위치입니다. 1에 가까울수록 왼쪽에 위치합니다. 기본값은 0.5 입니다
            yAnchor: 0 // 커스텀 오버레이의 y축 위치입니다. 1에 가까울수록 위쪽에 위치합니다. 기본값은 0.5 입니다
          });
          detailmarkers.wf.push({'marker':mapCustomOverlay, 'info':infocontent});
        });
        $('#loading').css('display', 'none');
     });
  }



  var latFn = d3.random.normal(center[0], 1);
  var longFn = d3.random.normal(center[1], 1);

  var url_cell = "/api/v1.1/skt/map/cell/list",
      bounds = map.getBounds(),
      sw = bounds.getSouthWest(),
      ne = bounds.getNorthEast();

  var url_wf = "/api/v1.1/skt/map/wf/list";
  if(keyfactor.orderby == 'desc'){ options.orderbydesc =  true; }else{options.orderbydesc =  false;}

  var hexLayer2 = L.hexbinLayer(options).addTo(map);
  if(keyfactor.orderby == 'asc'){
    hexLayer2.colorScale().range(['white','blue']);  
  }else{
    // hexLayer2.colorScale().range(['blue','white']);  
    hexLayer2.colorScale().range(['white','red']);  
  }
  
  $.getJSON(url_wf, {'sw' : Math.floor(sw.lat*1000000)/1000000+','+Math.floor(sw.lng*1000000)/1000000, 'ne' : Math.floor(ne.lat*1000000)/1000000+','+Math.floor(ne.lng*1000000)/1000000
  }).done(function(data){
    // console.log(data);
    var ddd = [];
    var positions = data.features;
    var max = 0, sum = 0;
    for(var i=0;i<positions.length;i++){
      // max = parseFloat(positions[i].properties[keyfactor.key]) > max ? parseFloat(positions[i].properties[keyfactor.key]) : max;
      // sum = sum + parseFloat(positions[i].properties[keyfactor.key]);
      var sss = isSkippedPt('wf',keyfactor.key, positions[i].properties[keyfactor.key], positions[i].properties['usrcnt']);
      if(sss){        
        // if(keyfactor.key == 'rxbytes')
        //   console.log(positions[i].properties[keyfactor.key]);
        ddd.push([positions[i].geometry.coordinates[0], positions[i].geometry.coordinates[1], positions[i].properties[keyfactor.key]])  
      }      
    }

    var mean = d3.mean(ddd, function(d){return parseFloat(d[2]);}) 
       ,max = d3.max(ddd,function(d){return parseFloat(d[2]);});
    // <h4><span id="mcellnum">21</span>/<span id="mcellsum">21</span>/<span id="mcellmax">21</span></h4>
    // $("#mwfdesc").html( Math.round(positions.length) + " &nbsp;/&nbsp; " + Math.round(mean*100)/100 + " &nbsp;/&nbsp; "  + Math.round(max*100)/100);
    $("#mwfdesc").html( Math.round(mean*100)/100 + ' for ' + Math.round(positions.length) + ' stations');

    hexLayer2.data(ddd);
    setTimeout(function(){loop1=false; $('#loading').css('display', 'none'); }, 500);
  });
  mainLayers.push(hexLayer2);
  // if(keyfactor.orderby == 'desc'){ options.orderbydesc =  true; }else{options.orderbydesc =  false;}
  var hexLayer = L.hexbinLayer(options).addTo(map)
  if(keyfactor.orderby == 'asc'){
    hexLayer.colorScale().range(['white','red']);
  }else{
    // hexLayer.colorScale().range(['red','white']);
    hexLayer.colorScale().range(['white','blue']);
  }
  

  $.getJSON(url_cell, {'sw' : Math.floor(sw.lat*1000000)/1000000+','+Math.floor(sw.lng*1000000)/1000000, 'ne' : Math.floor(ne.lat*1000000)/1000000+','+Math.floor(ne.lng*1000000)/1000000
  }).done(function(data){
    // console.log(data);
    var ddd = [];
    var positions = data.features;
    var max = 0, sum = 0;
    for(var i=0;i<positions.length;i++){
      var sss = isSkippedPt('wf',keyfactor.key, positions[i].properties[keyfactor.key], positions[i].properties['usrcnt']);
      if(sss){
        ddd.push([positions[i].geometry.coordinates[0], positions[i].geometry.coordinates[1], positions[i].properties[keyfactor.key]]);
      }
    }
    var mean = d3.mean(ddd, function(d){return parseFloat(d[2]);})
       ,max = d3.max(ddd,function(d){return parseFloat(d[2]);});
    $("#mcelldesc").html( Math.round(mean*100)/100 + ' for ' + Math.round(positions.length) + ' stations');
    // $("#mcelldesc").html( Math.round(positions.length) + " &nbsp;/&nbsp; " + Math.round(mean*100)/100 + " &nbsp;/&nbsp; "  + Math.round(max*100)/100);
    hexLayer.data(ddd);
    setTimeout(function(){loop1=false; $('#loading').css('display', 'none');}, 500);
  });
  mainLayers.push(hexLayer);
  
}

function isSkippedPt(type, key, value, usrcnt){
  if(type == 'cell'){
    if(key == 'pausecnt'){
      return value/usrcnt < 150;
    }else if(key == 'pausetime'){
      return value < 1000;
    }else if(key == 'tp'){
      return value < 100;
    }
  }else if(type == 'wf'){
    if(key == 'pausecnt'){
      return value/usrcnt < 150;
    }else if(key == 'pausetime'){
      return value < 1000;
    }else if(key == 'tp'){
      return value < 1000;
    }
  }
  return true;
}

function way(lat, lng){
  focusmap.setCenter(new daum.maps.LatLng( lat,lng ) ); 
}

function initTable(){
  $('#loading').css('display', 'block');
  var bounds = focusmap.getBounds(),
        sw = bounds.getSouthWest(),
        ne = bounds.getNorthEast();

  var cellwfurl = '/api/v1.1/skt/table/cellwf/list'
  $.getJSON(cellwfurl, {'sw' : Math.floor(sw.getLat()*1000000)/1000000+','+Math.floor(sw.getLng()*1000000)/1000000, 'ne' : Math.floor(ne.getLat()*1000000)/1000000+','+Math.floor(ne.getLng()*1000000)/1000000
     }).done(function(data){
      $('#badcelllist').html("");$('#badwflist').html("");
      var comparator = function(s,k){
        var a = parseFloat(s[keyfactor.key],2)
           ,b = parseFloat(k[keyfactor.key],2);
        return a < b ? 1 : a > b ? -1 : a >= b ? 0 : NaN;
      };        
      var desc_cell;
      if(keyfactor.key == 'tp'){
        desc_cell = data.cell;
      }else{
        desc_cell = data.cell.sort(comparator);
      } 
      var ii=0;
      desc_cell.forEach(function(d){
        var sss = isSkippedPt('cell',keyfactor.key, d[keyfactor.key], d['usrcnt']);
        if(!sss || ii > 10){
          return;
        }
        $('#badcelllist').append("<tr><td>"+crypt_cellid(d['id'])+"</td><td>"+d['usrcnt']+"</td><td>"+Math.round(d[keyfactor.key],2)+"</td><td>"+d['addr']+"</td></tr>");
        ii++;
      });
      var jj=0;
      var desc_wf;
      if(keyfactor.key == 'tp'){
        desc_wf = data.wf;
      }else{
        desc_wf = data.wf.sort(comparator);
      }  
       
      desc_wf.forEach(function(d){
        var sss = isSkippedPt('wf',keyfactor.key, d[keyfactor.key], d['usrcnt']);
        if(!sss || jj >10){
          return;
        }
        $('#badwflist').append("<tr><td>"+crypt_bssid(d['id'])+"</td><td>"+d['usrcnt']+"</td><td>"+Math.round(d[keyfactor.key],2)+"</td><td>"+d['addr']+"</td></tr>");
        jj++;
      });
      $('#loading').css('display', 'none');
      // setTimeout(function(){ loop3 = true; }, 500);
  });
}

function infowindow(type, lat,lng){
  // console.log('infowindow['+type + ']');
  // console.log(detailmarkers[type]);
  var nPos = new daum.maps.LatLng(lat, lng);
  var iwContent = detailmarkers[type].filter(function(d){ return Math.abs(d.marker.getPosition().getLat()-nPos.getLat())<0.0000001 && Math.abs(d.marker.getPosition().getLng()-nPos.getLng())<0.0000001; })[0]['info'];
  // console.log(iwContent);
  var iwRemoveable = true;
  var infowindow = new daum.maps.InfoWindow({
      map: focusmap, // 인포윈도우가 표시될 지도
      position : nPos, 
      content : iwContent,
      removable : iwRemoveable
  });
}

var geocoder;
// function initfocusmap(){
  // 마커를 클릭했을 때 해당 장소의 상세정보를 보여줄 커스텀오버레이입니다
var placeOverlay = new daum.maps.CustomOverlay({zIndex:1}), 
    markers = [], // 마커를 담을 배열입니다
    currCategory = ''; // 현재 선택된 카테고리를 가지고 있을 변수입니다
    
var mapTypeControl = new daum.maps.MapTypeControl();    
var mapContainer = document.getElementById('focusmap'), // 지도를 표시할 div 
    mapOption = {
        center: new daum.maps.LatLng(37.49800253054263,127.02608766689583), // 지도의 중심좌표
        level: 4 // 지도의 확대 레벨
    };  

// 지도를 생성합니다    
focusmap = new daum.maps.Map(mapContainer, mapOption); 
focusmap.addControl(mapTypeControl, daum.maps.ControlPosition.TOPRIGHT);
var zoomControl = new daum.maps.ZoomControl();
focusmap.addControl(zoomControl, daum.maps.ControlPosition.RIGHT);
focusmap.setZoomable(false); 
// 주소-좌표 변환 객체를 생성합니다
geocoder = new daum.maps.services.Geocoder();
// 장소 검색 객체를 생성합니다
var ps = new daum.maps.services.Places(focusmap); 

// 지도에 idle 이벤트를 등록합니다
daum.maps.event.addListener(focusmap, 'idle', searchPlaces);

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

  marker.setMap(focusmap); // 지도 위에 마커를 표출합니다
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
              '<div class="placeinfo">' +
              '<a class="title" href="' + place.placeUrl + '" target="_blank" title="' + place.title + '">' + place.title + '</a>';   

  if (place.newAddress) {
      content += '<span title="' + place.newAddress + '">' + place.newAddress + '</span>' +
                '<span class="jibun" title="' + place.address + '">(지번 : ' + place.address + ')</span>';
  }  else {
      content += '<span title="' + place.address + '">' + place.address + '</span>';
  }                
 
  content += '<span class="tel">' + place.phone + '</span>' + 
            '</div>' + 
            '<div class="after"></div>' +
            '</div>';

  placeOverlay.setContent(content);
  placeOverlay.setPosition(new daum.maps.LatLng(place.latitude, place.longitude));
  placeOverlay.setMap(focusmap);  
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
searchAddrFromCoords(focusmap.getCenter(), displayCenterInfo);

// }

function searchAddrFromCoords(coords, callback) {
  // 좌표로 주소 정보를 요청합니다
  geocoder.coord2addr(coords, callback);         
}

// 지도 좌측상단에 지도 중심좌표에 대한 주소정보를 표출하는 함수입니다
function displayCenterInfo(status, result) {
  if (status === daum.maps.services.Status.OK) {
    $('#area').html(result[0].fullName);
 }    
}
paintmap();
// initfocusmap();



function paintchart1(data){    
  data = data.sort(function(a,b){
    if( a[0] > b[0] ) return 1;
    if( a[0] < b[0] ) return -1;
    return 0;
  });
  // console.log(JSON.stringify(data));
  $('#wifiuxtr').highcharts({
      chart: {
          type: 'column'
      },
      title: {
          text: keyfactor.name + ' by Time-of-Day'
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
              text: keyfactor.unit
          }
      },
      legend: {
          enabled: false
      },
      tooltip: {
          pointFormat: '<b>{point.y:.3f} </b>' + keyfactor.unit
      },
      series: [{
          name: 'Population',
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
      }]
  });
}
function paintchart2(data){
  data = data.sort(function(a,b){
    if( a[0] > b[0] ) return 1;
    if( a[0] < b[0] ) return -1;
    return 0;
  });
  // console.log(JSON.stringify(data));
 $('#celluxtr').highcharts({
      chart: {
          type: 'column'
      },
      title: {
          text: keyfactor.name + ' by Time-of-Day'
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
              text: keyfactor.unit
          }
      },
      legend: {
          enabled: false
      },
      tooltip: {
          pointFormat: '<b>{point.y:.3f} </b>' + keyfactor.unit
      },
      series: [{
          name: 'Population',
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
      }]
  });
}

function initChart(){
  $('#loading').css('display', 'block');
  var bounds = focusmap.getBounds(),
        sw = bounds.getSouthWest(),
        ne = bounds.getNorthEast();

  var cellwfurl = '/api/v1.1/skt/chart/cellwf/list'
  $.getJSON(cellwfurl, {'sw' : Math.floor(sw.getLat()*1000000)/1000000+','+Math.floor(sw.getLng()*1000000)/1000000, 'ne' : Math.floor(ne.getLat()*1000000)/1000000+','+Math.floor(ne.getLng()*1000000)/1000000
     }).done(function(data){

      var wfdata = data.wf.map(function(d){return [d['todow'], d[keyfactor.key]];});
      var celldata = data.cell.map(function(d){return [d['todow'], d[keyfactor.key]]; });
      // console.log(wfdata);
      // console.log(celldata);
      paintchart1(wfdata);
      paintchart2(celldata);
      $('#loading').css('display', 'none');
  });

}

function _mv(kk){

  keyfactor = keys.filter(function(d){ return d.key == kk; })[0]
    $('#curkey').html(keyfactor.name + "&nbsp;[" + keyfactor.unit+ "]"); 
      $('[id=keyfactor_nm]').each(function(){
        // console.log('1');
        $(this).html(keyfactor.name)
      });
    
  paintmap();

}


function initDevicemap(){
  $('#loading').css('display', 'block');
  var bounds = focusmap.getBounds(),
      sw = bounds.getSouthWest(),
      ne = bounds.getNorthEast();

  var cellwfurl = '/api/v1.1/skt/treemap/cellwf/list'
  $.getJSON(cellwfurl, {'sw' : Math.floor(sw.getLat()*1000000)/1000000+','+Math.floor(sw.getLng()*1000000)/1000000, 'ne' : Math.floor(ne.getLat()*1000000)/1000000+','+Math.floor(ne.getLng()*1000000)/1000000
     }).done(function(data){

      // var wfdata = data.wf.map(function(d){return { 'brand':}; });
      // var celldata = data.cell.map(function(d){return [d['todow'], d['badness']]; });
      var wfnest = d3.nest()
        .key(function(d){ return d['brand'];})
        .key(function(d){ return d['model'];})
        .entries(data.wf);
      var cellnest = d3.nest()
        .key(function(d){ return d['brand'];})
        .key(function(d){ return d['model'];})
        .entries(data.cell);

      drawTreemap('cell',cellnest);
      drawTreemap('wf',wfnest);
      $('#loading').css('display', 'none');
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
    cause_name = keyfactor.key;
  brand_i = 0;
  if(type == 'cell')
    console.log(JSON.stringify(data));
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
          value: +parseFloat(cause[cause_name])
        };
        brand_val += parseFloat(cause_p.value);
        points.push(cause_p);
        cause_i++;
      }
      model_i++;
    }
    brand_p.value = Math.round(parseFloat(brand_val / model_i)*100)/100;
    points.push(brand_p);
    brand_i++;
  }
  console.log(JSON.stringify(points));
  var chart = new Highcharts.Chart({
    chart: {
      renderTo: type+'treemap'
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
      text: 'Distribution of Poor-QoE Session by Device'
    }
  });
}

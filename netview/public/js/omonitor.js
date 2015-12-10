function crypt_cellid(cellid){
  return cellid.split('_')[0] + '_****' + String(cellid.split('_')[1]).slice(4)  + '_' + cellid.split('_')[2]; 
}

// $(function(){
var keys = [
  {'name':'Badness', 'unit':'%', 'key':'badness', 'orderby':'asc'},
  {'name':'Pause Count', 'unit':'Counts per hour', 'key':'pausecnt', 'orderby':'asc'},
  {'name':'Pause Time', 'unit':'Minutes per hour', 'key':'pausetime', 'orderby':'asc'},
  {'name':'Start Fail', 'unit':'Counts per session', 'key':'stfail', 'orderby':'asc'},
  {'name':'Network Speed', 'unit':'Mbps', 'key':'tp', 'orderby':'desc'},
  // {'name':'Network Usage', 'unit':'MB per day', 'key':'rxbytes', 'orderby':'desc'},
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
var keyidx = keys.map(function(e){ return e.key;}).indexOf(keyfactor.key)+7;
// var keyidx = keys.indexOf(function(d){ return d.key == keyfactor.key}) + 7;
// console.log('keyidx is ' + keyidx);

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

var comparegroups = [
  {'name':'LG U+ vs SK Telecom', 'key':'lgt_skt','names':['LG U+','SK Telecom'], 'values':['LGT','SKT'], 'colors':['#e78ac3','#ff7f00'], 'wincnt':[0,0]},
  {'name':'LG U+ vs Korea Telecom', 'key':'lgt_kt','names':['LG U+','Korea Telecom'], 'values':['LGT','KT'], 'colors':['#e78ac3','#984ea3'], 'wincnt':[0,0]},
  {'name':'SK Telecom vs Korea Telecom', 'key':'skt_kt','names':['SK Telecom', 'Korea Telecom'], 'values':['SKT','KT'], 'colors':['#ff7f00','#984ea3'], 'wincnt':[0,0]},
];
comparegroups.forEach(function(k){
  $('#optrcommenus').append('<li><a href="#" onclick="_gr(\''+k.key+'\');">'+k.name+'</a></li>')
});
var group = comparegroups[0];
if(localStorage.getItem("omonitor_group")){
  group = comparegroups.filter(function(d){return d.key == localStorage.getItem("omonitor_group")})[0];
}else{
  group = comparegroups[0];
}
$('#curgroup').html(group.name); 

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



var _CALC_LIMIT = ntype.key=='cell' || ntype.key=='lte' ? 0 : 0;
var mainLayers = [];
var map, focusmap;
var geojson;
// var center = [37.49800253054263,127.02608766689583]; // 강남 중심 
// var center = [37.572583279707466,126.99289108493576]; // 강북 중심 
// var center = [37.531101531765394,127.00281143188475]; // 한강 중심 
var center = [_area.center.lat, _area.center.lng];
// _loc(37.572583279707466,126.99289108493576,13)
var osmUrl = 'http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png',
// var osmUrl = 'http://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png',
    osmAttrib = '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; <a href="http://cartodb.com/attributions">CartoDB</a>',
    osm = L.tileLayer(osmUrl, {maxZoom: 18, attribution: osmAttrib});

map = new L.Map('map', {layers: [osm], center: new L.LatLng(center[0], center[1]), zoom: _area.center.zoom, zoomControl:false });
map.doubleClickZoom.disable();
map.scrollWheelZoom.disable();
// map.on('dragend', function(e) {
//     var bounds = map.getBohttp://localhost:3333/omonitor#unds(),
//         sw = bounds.getSouthWest(),
//         ne = bounds.getNorthEast();

//     console.log('dragend[' + Math.floor(sw.lat*1000000)/1000000 +',' + Math.floor(sw.lng*1000000)/1000000 +',' + Math.floor(ne.lat*1000000)/1000000 +',' + Math.floor(ne.lng*1000000)/1000000 +']'  );
//     paintMap();

// });
var loop1 = false;
var detailmarkers = {'c1':[],'c2':[]};
var detailheats = {'c1':[],'c2':[]};
// var detailmarkers = [];

function initDashpanel(){
  $('#dashpanel').html("");
  // console.log('initDashpanel');
  group.values.forEach(function(d,i){
    $('#dashpanel').append('<div class="col-lg-4"><div style="background-color:'+group.colors[i]+';" class="alert alert-dismissible text-center"><h4 style="color:#fff">'+group.names[i]+'</h4><h3><span style="color:#fff" id="m'+d+'desc">&nbsp;</h3></div></div>');
  });
  // group.values.forEach(function(d,i){
  $('#dashpanel').append('<div class="col-lg-4"><div id="wincolor" style="background-color:'+group.colors[0]+';" class="alert alert-dismissible text-center"><h4 style="color:#fff"><span id="area"></span> Metric </h4><h3><span style="color:#fff" id="wintext">&nbsp;</h3></div></div>');
  // });

  $('#bubblec1').html('<i class="fa fa-beer"></i>&nbsp; '+group.values[0]+' Comprehensive Metric');
  $('#bubblec2').html('<i class="fa fa-coffee"></i>&nbsp; '+group.values[1]+' Comprehensive Metric');
  $('#trendc1').html('<i class="fa fa-beer"></i>&nbsp; '+group.values[0]+' Metric Trend by ToD');
  $('#trendc2').html('<i class="fa fa-coffee"></i>&nbsp; '+group.values[1]+' Metric Trend by ToD');
  $('#tablec1').html('<i class="fa fa-beer"></i>&nbsp; '+group.values[0]+' Metric Top-10 Stations ');
  $('#tablec2').html('<i class="fa fa-coffee"></i>&nbsp; '+group.values[1]+' Metric Top-10 Stations ');
  $('#treemapc1').html('<i class="fa fa-beer"></i>&nbsp; '+group.values[0]+' Metric Analysis by Device');
  $('#treemapc2').html('<i class="fa fa-coffee"></i>&nbsp; '+group.values[1]+' Metric Analysis by Device');
  $('#radarc1').html('<i class="fa fa-beer"></i>&nbsp; '+group.values[0]+' Metric Trend by DoW');
  $('#radarc2').html('<i class="fa fa-coffee"></i>&nbsp; '+group.values[1]+' Metric Trend by DoW');
  $('#piec1').html('<i class="fa fa-beer"></i>&nbsp; '+group.values[0]+' Metric Analysis by OS');
  $('#piec2').html('<i class="fa fa-coffee"></i>&nbsp; '+group.values[1]+' Metric Analysis by OS');

  // $('#trendc1').html('<i class="fa fa-beer"></i>&nbsp; '+group.values[0]+' ' + keyfactor.name+' Trend');
  // $('#trendc2').html('<i class="fa fa-coffee"></i>&nbsp; '+group.values[1]+' ' + keyfactor.name+' Trend');
  // $('#tablec1').html('<i class="fa fa-beer"></i>&nbsp; '+group.values[0]+' ' + keyfactor.name+' Top 10 ');
  // $('#tablec2').html('<i class="fa fa-coffee"></i>&nbsp; '+group.values[1]+' ' + keyfactor.name+' Top 10 ');
  // $('#treemapc1').html('<i class="fa fa-beer"></i>&nbsp; '+group.values[0]+' ' + keyfactor.name+' Analysis by Device in This Area');
  // $('#treemapc2').html('<i class="fa fa-coffee"></i>&nbsp; '+group.values[1]+' ' + keyfactor.name+' Analysis by Device in This Area');

}

initDashpanel();


function pinDetailMarker(type){
  if(type == 'c1'){
    $('[id^=radioc1]').each(function(){ $(this).css('color','#ffffb3')});
    $('[id^=radioc2]').each(function(){ $(this).css('color','#ffffff')});    
  }else if(type == 'c2'){
    $('[id^=radioc1]').each(function(){ $(this).css('color','#ffffff')});
    $('[id^=radioc2]').each(function(){ $(this).css('color','#ffffb3')});    
  }
  detailmarkers.c1.forEach(function(d){ d['marker'].setMap(null); });
  detailmarkers.c2.forEach(function(d){ d['marker'].setMap(null); }); 
  detailmarkers[type].forEach(function(d){ d['marker'].setMap(focusmap); });

  detailheats.c1.forEach(function(d){ d.setMap(null); });
  detailheats.c2.forEach(function(d){ d.setMap(null); }); 
  detailheats[type].forEach(function(d){ d.setMap(focusmap); });

}
function clearDetail(){
  $('#treemapc1list').html("");
  $('#treemapc2list').html("");
  $('#bubblec1list').html("");
  $('#bubblec2list').html("");
  $('#chartc1list').html("");
  $('#chartc2list').html("");
  $('#piec1list').html("");
  $('#piec2list').html("");
}
var heatRadius = 20, heatOpacity = .4;
var curPin = 'c1';
function paintMap(){
  $('#loading').css('display', 'block');
  detailmarkers.c1.forEach(function(d){ d['marker'].setMap(null); });
  detailmarkers.c2.forEach(function(d){ d['marker'].setMap(null); }); 

  detailheats.c1.forEach(function(d){ d.setMap(null); });
  detailheats.c2.forEach(function(d){ d.setMap(null); }); 

  if(loop1) return;
  loop1 = true;
  console.log('paintmap key is ' + keyfactor.key);
  // clear previous layer
  var mapwidth = document.getElementById("map").offsetWidth;
  // console.log(parseInt(mapwidth/53));
  mainLayers.forEach(function(layer){ map.removeLayer(layer); });
  var options = {
      // radius : parseInt(mapwidth/53),
      radius:30,
      opacity: .8,
      duration: 200,
      lng: function(d){
        return d[0];
      },
      lat: function(d){
        return d[1];
      },
      value: function(data){

        var dataC1 = data.filter(function(d){ return d.o[2]==group.values[0];}).filter(function(d){ return d.o[5] > _CALC_LIMIT; }); // ex) SKT
        var dataC2 = data.filter(function(d){ return d.o[2]==group.values[1];}).filter(function(d){ return d.o[5] > _CALC_LIMIT; }); // ex) KT
        var mC1 = d3.mean(dataC1.map(function(d){ return d.o[keyidx]; }));   
        var mC2 = d3.mean(dataC2.map(function(d){ return d.o[keyidx]; }));   
        var mm = _.isNaN(parseFloat(mC1)-parseFloat(mC2)) ? 0 : (parseFloat(mC1)-parseFloat(mC2));
        // console.log(mm);
        return mm;
      },

      alphascale: function(extent, that){
        if(keyfactor.key == 'tp'){
          return d3.scale.quantize().domain([extent[0], extent[1]]).range([options.opacity, options.opacity/4, options.opacity]);  
        }else{
          return d3.scale.quantize().domain([extent[0], extent[1]]).range([options.opacity,options.opacity, options.opacity/4,options.opacity,options.opacity]);  
        }
        
        // return d3.scale.quantize().domain([extent[0], extent[1]]).range([options.opacity,options.opacity, options.opacity/4,options.opacity,options.opacity]);
      },
      callback: function(data){

      },
      orderbydesc: false,
      valueFloor: undefined,
      valueCeil: undefined,
      dblclickfn:function(d){ 
        var cclng = d3.mean(d, function(c){ return c.o[0]; }),
            cclat = d3.mean(d, function(c){ return c.o[1]; });
        focusmap.setCenter(new google.maps.LatLng( cclat,cclng ) ); 

        focusmap.setZoom(16); 
        searchAddrFromCoords(focusmap.getCenter());
        heatOfDetail();
        detailToFocus(d);
        initTable(d);
        initBubble();
        initChart();
        initPie();
        initRadar();
        initDevicemap();
      }
  };
  
  function searchAddrFromCoords(latlng){
    console.log('-----  searchAddrFromCoords ----- ');
    console.log(latlng);
     geocoder.geocode({'latLng': latlng }, function(results, status) {
      if (status == google.maps.GeocoderStatus.OK) {
        if (results[1]) {
          $("#area").html(results[1].formatted_address)

        } else {
          // alert('No results found');
        }
      } else {
        // alert('Geocoder failed due to: ' + status);
      }
    });
  }

  function detailToFocus(detailD){
    clearDetail();
    console.log('detailToFocus start [' + keyfactor.key + ']');
var ka123 = detailD.filter(function(d){ return (d.o[2] == group.values[0]); }).filter(function(d){ console.log( d.o[5]); return parseInt(d.o[5]) > _CALC_LIMIT; });
console.log(ka123);
console.log(_CALC_LIMIT);

    var v1 = Math.round(d3.mean(detailD.filter(function(d){ return (d.o[2] == group.values[0]); }).filter(function(d){ return parseInt(d.o[5]) > _CALC_LIMIT; }), function(d){ return parseFloat(d.o[keyidx]); })*100)/100 ;
    var v2 = Math.round(d3.mean(detailD.filter(function(d){ return (d.o[2] == group.values[1]); }).filter(function(d){ return parseInt(d.o[5]) > _CALC_LIMIT; }), function(d){ return parseFloat(d.o[keyidx]); })*100)/100 ;
    var dC1 = detailD.filter(function(d){ return (d.o[2]==group.values[0]);});
    var dC2 = detailD.filter(function(d){ return (d.o[2]==group.values[1]);});


    var colorC1, colorC2, sizeC1, sizeC2;
    if(keyfactor.orderby == 'asc'){
      console.log(v1 + ":" + v2);
      console.log(v1>v2?group.colors[1]:group.colors[0]);
      $('#wincolor').css('background-color', v1>v2?group.colors[1]:group.colors[0]);
      $('#wintext').html('<label style="cursor:pointer" id="radioc1" onclick="pinDetailMarker(\'c1\')">' + v1 + ' ('+ group.values[0]+')</label> : <label style="cursor:pointer" id="radioc2" onclick="pinDetailMarker(\'c2\')">' +v2 + ' ('+ group.values[1]+')</label>');
      // $('#wintext').html('<a style="cursor:pointer" onclick="pinDetailMarker(\'c1\')">' + group.names[0]+'</a> : <a style="cursor:pointer" onclick="pinDetailMarker(\'c2\')">'+group.names[1]+'</a> = '+v1+' : '+v2);
      colorC1 = d3.scale.quantize().range(['green','yellow','red']).domain(d3.extent(detailD, function(d){ return parseFloat(d.o[keyidx]); }));
      colorC2 = d3.scale.quantize().range(['green','yellow','red']).domain(d3.extent(detailD, function(d){ return parseFloat(d.o[keyidx]); }));
      sizeC1  = d3.scale.quantize().range([12,12,16,18,21]).domain(d3.extent(detailD, function(d){ return parseFloat(d.o[keyidx]); }));
      sizeC2  = d3.scale.quantize().range([12,12,16,18,21]).domain(d3.extent(detailD, function(d){ return parseFloat(d.o[keyidx]); }));

    }else{
      $('#wincolor').css('background-color', v1>v2?group.values[0]:group.values[1]);

      $('#wintext').html('<label style="cursor:pointer" id="radioc1" onclick="pinDetailMarker(\'c1\')">' + v1 + ' ('+ group.values[0]+')</label> : <label style="cursor:pointer" id="radioc2" onclick="pinDetailMarker(\'c2\')">' + v2+ ' ('+ group.values[1]+')</label>');
      colorC1 = d3.scale.quantize().range(['red','yellow','green']).domain(d3.extent(detailD, function(d){ return parseFloat(d.o[keyidx]); }));
      colorC2 = d3.scale.quantize().range(['red','yellow','green']).domain(d3.extent(detailD, function(d){ return parseFloat(d.o[keyidx]); }));
      sizeC1  = d3.scale.quantize().range([21,18,16,12,12]).domain(d3.extent(detailD, function(d){ return parseFloat(d.o[keyidx]); }));
      sizeC2  = d3.scale.quantize().range([21,18,16,12,12]).domain(d3.extent(detailD, function(d){ return parseFloat(d.o[keyidx]); }));
    }
 
    dC1.forEach(function(c){
      // console.log('size is ' + sizeC1(c.properties[keyfactor.key]));
      var infocontent = '<table class="table table-striped table-hover text-center"><thead><tr><td>ID</td><td>'+keyfactor.name+'</td><td>Sessions</td><td>Devices</td></tr></thead><tbody><tr><td class="success">'+crypt_cellid(c.o[4])+'</td><td class="danger">'+Math.round(c.o[keyidx]*100)/100+'</td><td class="warning">'+c.o[6]+'</td><td class="info">'+c.o[5]+'</td></tr></tbody></table>';
      
      var mapCustomOverlay = new google.maps.Marker({
        position: new google.maps.LatLng(c.o[1], c.o[0]),
        map: focusmap,
        // animation: google.maps.Animation.DROP,
        icon: 'assets/images/'+colorC1(c.o[keyidx])+'_pin.png'
      });
      google.maps.event.addListener(mapCustomOverlay, 'click', function(){ infowindow('c1',c.o[1],c.o[0] ); });

      detailmarkers.c1.push({'marker':mapCustomOverlay, 'info':infocontent});
    });    
    dC2.forEach(function(c){
      var infocontent = '<table class="table table-striped table-hover text-center"><thead><tr><td>ID</td><td>'+keyfactor.name+'</td><td>Sessions</td><td>Devices</td></tr></thead><tbody><tr><td class="success">'+crypt_cellid(c.o[4])+'</td><td class="danger">'+Math.round(c.o[keyidx]*100)/100+'</td><td class="warning">'+c.o[6]+'</td><td class="info">'+c.o[5]+'</td></tr></tbody></table>';
      
       var mapCustomOverlay = new google.maps.Marker({
        position: new google.maps.LatLng(c.o[1], c.o[0]),
        map: focusmap,
        // animation: google.maps.Animation.DROP,
        icon: 'assets/images/'+colorC2(c.o[keyidx])+'_pin.png'
      });
      google.maps.event.addListener(mapCustomOverlay, 'click', function(){ infowindow('c2',c.o[1],c.o[0] ); });

      detailmarkers.c2.push({'marker':mapCustomOverlay, 'info':infocontent});
    });
    
    setTimeout(function(){
      // console.log('setTimeout result v1>v2 is ' + v1 + ':' + v2 + '=' + (v1>v2));
      if(keyfactor.orderby == 'asc'){
        if(v2>v1){ curPin = 'c1'; }else{ curPin = 'c2'; }
      }else{
        if(v1>v2){ curPin = 'c1'; }else{ curPin = 'c2'; }  
      }
      
      pinDetailMarker(curPin);
    },400);
     // }); // end of $.getJSON().done()
  } // end of detail func
  var heatmapc1, heatmapc2, gradient = [ 
    'rgba(0, 255, 255, 0)',
    'rgba(0, 255, 255, 1)',
    'rgba(0, 191, 255, 1)',
    'rgba(0, 127, 255, 1)',
    'rgba(0, 63, 255, 1)',
    'rgba(0, 0, 255, 1)',
    'rgba(0, 0, 223, 1)',
    'rgba(0, 0, 191, 1)',
    'rgba(0, 0, 159, 1)',
    'rgba(0, 0, 127, 1)',
    'rgba(63, 0, 91, 1)',
    'rgba(127, 0, 63, 1)',
    'rgba(191, 0, 31, 1)',
    'rgba(255, 0, 0, 1)'
    // 'rgba(252,251,253,0)',
    // 'rgba(239,237,245,0.5)',
    // 'rgba(218,218,235,1)',
    // 'rgba(188,189,220,1)',
    // 'rgba(158,202,225,1)',
    // 'rgba(158,154,200,1)',
    // 'rgba(128,125,186 ,1)',
    // 'rgba(106,81,163  ,1)',
    // 'rgba(84,39,143   ,1)',
    // 'rgba(63,0,125   ,1)',

  ];
  // var heatmaps = [];
  function heatOfDetail(){
    // heatmaps.forEach(function(h){
    //   h.setMap(null);
    // });
    $('#loading').css('display', 'block');
    var bounds = focusmap.getBounds(),
          sw = bounds.getSouthWest(),
          ne = bounds.getNorthEast();

    var cellwfurl = '/api/v1.5/omonitor/heat/cell/list'
    $.getJSON(cellwfurl, {'sw' : Math.floor(sw.lat()*100000)/100000+','+Math.floor(sw.lng()*100000)/100000, 'ne' : Math.floor(ne.lat()*100000)/100000+','+Math.floor(ne.lng()*100000)/100000    
       }).done(function(data){
       var rdata = data['cell'];
       var norm10 = d3.scale.linear().domain(d3.extent(rdata, function(d){ return d[keyfactor.key]; })).range([0,100]);
       var pointArray1 = rdata.filter(function(d){ return d['optrcom']==group.values[0] && parseFloat(d['pausecnt']) > 0; }).map(function(d){ return {'location': new google.maps.LatLng(d['lat'],d['lng']), 'weight':1 }; });
       var pointArray2 = rdata.filter(function(d){ return d['optrcom']==group.values[1] && parseFloat(d['pausecnt']) > 0; }).map(function(d){ return {'location': new google.maps.LatLng(d['lat'],d['lng']), 'weight':1 }; });
       // console.log('--------- heatmap ---------');
       // console.log(pointArray1);
       // console.log(pointArray2);

       var normZoom = d3.scale.linear().domain([16, 21]).range([heatRadius, 50]);
       var normOpa  = d3.scale.linear().domain([16, 21]).range([heatOpacity,.6]);

       heatmapc1 = new google.maps.visualization.HeatmapLayer({
          data: pointArray1,
          radius : heatRadius,
          gradient: gradient,
          opacity : heatOpacity
       });
       google.maps.event.addListener(focusmap, 'zoom_changed', function() {
            if(focusmap.getZoom() >= 16 || focusmap.getZoom() <= 21){
              // console.log(focusmap.getZoom() + '=>' + parseInt(normZoom(focusmap.getZoom())));
              heatmapc1.set('radius',  parseInt(normZoom(focusmap.getZoom())));
              heatmapc1.set('opacity', normOpa(focusmap.getZoom()));
            }
        });
       // heatmapc1.setMap(focusmap);
       heatmapc2 = new google.maps.visualization.HeatmapLayer({
          data: pointArray2,
          radius : heatRadius,
          gradient: gradient,
          opacity : heatOpacity
       });
       google.maps.event.addListener(focusmap, 'zoom_changed', function() {
            if(focusmap.getZoom() >= 16 || focusmap.getZoom() <= 21){
              // console.log(focusmap.getZoom());
              // console.log(focusmap.getZoom() + '=>' + parseInt(normZoom(focusmap.getZoom())));
              heatmapc2.set('radius', parseInt(normZoom(focusmap.getZoom())));
              heatmapc2.set('opacity',normOpa(focusmap.getZoom()));
            }
        });
       // heatmapc2.setMap(focusmap);
       
       detailheats.c1.push(heatmapc1);
       detailheats.c2.push(heatmapc2);
       detailheats[curPin].forEach(function(d){ d.setMap(focusmap); });
       $('#loading').css('display', 'none');
    });

  } // end of heatofDetail method 

  var latFn = d3.random.normal(center[0], 1);
  var longFn = d3.random.normal(center[1], 1);
  var mWindowWinCount = [];
  var url_cell = "/api/v1.5/omonitor/map/"+ntype.key+"/name/list",
      bounds = map.getBounds(),
      sw = bounds.getSouthWest(),
      ne = bounds.getNorthEast();

  // var url_wf = "/api/v1.1/skt/map/wf/list";
  if(keyfactor.orderby == 'desc'){ options.orderbydesc=true; }else{ options.orderbydesc=false; }
  // $.getJSON(url_cell, {'sw' : Math.floor(-999.99*100000)/100000+','+Math.floor(-999.99*100000)/100000, 'ne' : Math.floor(999*100000)/100000+','+Math.floor(999*100000)/100000
  $.getJSON(url_cell, {'nm' : _area.name
  // $.getJSON(url_cell, {'sw' : Math.floor(_area['boundaries']['sw']['lat']*100000)/100000+','+Math.floor(_area['boundaries']['sw']['lng']*100000)/100000, 'ne' : Math.floor(_area['boundaries']['ne']['lat']*100000)/100000+','+Math.floor(_area['boundaries']['ne']['lng']*100000)/100000
  // $.getJSON(url_cell, {'sw' : Math.floor(sw.lat*100000)/100000+','+Math.floor(sw.lng*100000)/100000, 'ne' : Math.floor(ne.lat*100000)/100000+','+Math.floor(ne.lng*100000)/100000
    }).done(function(data){
    // console.log('paintMap(' + data.features.length + ');');
    var ddd = [];
    var positions = data.features;
    var max = 0, sum = 0;
    for(var i=0;i<positions.length;i++){
      // var sss = isSkippedPt(ntype.key ,keyfactor.key, positions[i].properties[keyfactor.key], positions[i].properties['usrcnt']);
      // if(sss){
        ddd.push([positions[i].geometry.coordinates[0], positions[i].geometry.coordinates[1], positions[i].properties['optrcom'], positions[i].properties['addr'], positions[i].properties['id'],positions[i].properties['usrcnt'],positions[i].properties['sesscnt'], positions[i].properties[keys[0].key], positions[i].properties[keys[1].key], positions[i].properties[keys[2].key], positions[i].properties[keys[3].key], positions[i].properties[keys[4].key]]);
      // }
    }
    var mean = d3.mean(ddd, function(d){return parseFloat(d[keyidx]);})
       ,max = d3.max(ddd,function(d){return parseFloat(d[keyidx]);})
       ,sd = d3.deviation(ddd, function(d){return parseFloat(d[keyidx]);})
       ,sdmax = mean + se95(sd, ddd.length);

    var pOptions = _.clone(options);
    pOptions.alphascale = function(extent, that){ return d3.scale.quantize().domain([extent[0], extent[1]]).range([0, 0]); }
    var pHexLayer = L.hexbinLayer(pOptions).addTo(map);
    pHexLayer.data(ddd);
    var pBins = pHexLayer._getBins();
    // console.log(pBins);

    var meanlst = pBins.map(function(dt){ 
      var dt1 = d3.mean(dt.filter(function(d){ return d.o[2]==group.values[0]; }).filter(function(d){ return d.o[5]>_CALC_LIMIT; }).map(function(d){ return d.o[keyidx]; }));
      var dt2 = d3.mean(dt.filter(function(d){ return d.o[2]==group.values[1]; }).filter(function(d){ return d.o[5]>_CALC_LIMIT; }).map(function(d){ return d.o[keyidx]; }));
      return dt1 - dt2;
    });
    var sdmax1 = d3.extent(meanlst)
    var remax = d3.mean([ Math.abs(sdmax1[0]), Math.abs(sdmax1[1]) ]);
    options.valueFloor = -remax;
    options.valueCeil  = remax;
// console.log('options.valueFloor=' + options.valueFloor);
// console.log('options.valueCeil='  + options.valueCeil);
    options.callback = function(color){
      mWindowWinCount.push(color);
    }

    var hexLayer = L.hexbinLayer(options).addTo(map);
    // console.log(keyfactor.orderby);
    if(keyfactor.orderby == 'asc'){
      if(keyfactor.key == 'tp'){
        hexLayer.colorScale(d3.scale.quantize().range([ group.colors[0],'#636363',group.colors[1] ]) );  
      }else{
        hexLayer.colorScale(d3.scale.quantize().range([ group.colors[0],group.colors[0],'#636363',group.colors[1],group.colors[1] ]) );
      }
      // hexLayer.colorScale(d3.scale.quantize().range([ group.colors[0],'#636363',group.colors[1] ]) );
      // hexLayer.colorScale(d3.scale.quantize().range([ group.colors[0],group.colors[0],'#636363',group.colors[1],group.colors[1] ]) );
    }else{
      // hexLayer.colorScale(d3.scale.quantize().range([ group.colors[1],group.colors[1],'#636363',group.colors[0],group.colors[0] ]) );
      if(keyfactor.key == 'tp'){
        hexLayer.colorScale(d3.scale.quantize().range([ group.colors[1],'#636363',group.colors[0] ]) );
      }else{
        hexLayer.colorScale(d3.scale.quantize().range([ group.colors[1],group.colors[1],'#636363',group.colors[0],group.colors[0] ]) );
      }
      
    }
    

    hexLayer.data(ddd);
    // var bins = hexLayer._getBins();
    $('#loading').css('display', 'none');
    setTimeout(function(){
      loop1=false;
      var hexSize = mWindowWinCount.length,
          zeroWin = mWindowWinCount.filter(function(d){ return d.color==group.colors[0] && d.opacity>0}).length,
          zeroLos = mWindowWinCount.filter(function(d){ return d.color==group.colors[1] && d.opacity>0}).length;

      // $('#m'+group.values[0]+'desc').html((zeroWin)+' Problematic Regions');
      // $('#m'+group.values[1]+'desc').html((zeroLos)+' Problematic Regions');
      $('#m'+group.values[0]+'desc').html((zeroWin)+' Wins');
      $('#m'+group.values[1]+'desc').html((zeroLos)+' Wins');
    }, 500);
    mainLayers.push(hexLayer);
  });

}
function se95(p, n) { return Math.sqrt(p*(1+p)/n)*1.64; }; // 1.64:90%, 1.96:95%, 2.58:99% 

function isSkippedPt(type, key, value, usrcnt){
  if(type == 'cell'){
    if(key == 'pausecnt'){
      // return value>=0;
    }else if(key == 'pausetime'){
      return value < 1000;
    }else if(key == 'tp'){
      return value < 100;
    }
  }else if(type == 'wf'){
    if(key == 'pausecnt'){
      // return value>=0;
    }else if(key == 'pausetime'){
      return value < 1000;
    }else if(key == 'tp'){
      return value < 1000;
    }
  }
  return true;
}

function way(lat, lng){
  focusmap.setCenter(new google.maps.LatLng( lat,lng ) ); 
}


function infowindow(type, lat,lng){
  // console.log('infowindow['+type + ']');
  // console.log(detailmarkers[type]);
  var nPos = new google.maps.LatLng(lat, lng);
  var iwContent = detailmarkers[type].filter(function(d){ return Math.abs(d.marker.getPosition().lat()-nPos.lat())<0.0000001 && Math.abs(d.marker.getPosition().lng()-nPos.lng())<0.0000001; })[0]['info'];
  // console.log(iwContent);
  var iwRemoveable = true;
  var infowindow = new google.maps.InfoWindow({
      map: focusmap, // 인포윈도우가 표시될 지도
      position : nPos, 
      content : iwContent,
      // removable : iwRemoveable
  });
}

var geocoder;
// var mapTypeControl = new daum.maps.MapTypeControl();    
var mapContainer = document.getElementById('focusmap'), // 지도를 표시할 div 
    mapOption = {
        center: new google.maps.LatLng(37.49800253054263, 127.02608766689583),
        zoomControl: true,
        zoomControlOptions: {
          style: google.maps.ZoomControlStyle.SMALL
        },
        // disableDefaultUI: true,
        scrollwheel: false,
        zoom: 16 // 지도의 확대 레벨
    };  

// create focusmap of google map 
function focus_initialize(){
  focusmap = new google.maps.Map(mapContainer, mapOption);  
  geocoder = new google.maps.Geocoder();

}

google.maps.event.addDomListener(window, 'load', focus_initialize);


paintMap();
// initfocusmap();


function initTable(detailD){

  // console.log('initTable');
  // console.log(detailD);


  // var bounds = focusmap.getBounds(),
  //       sw = bounds.getSouthWest(),
  //       ne = bounds.getNorthEast();

  // var cellwfurl = '/api/v1.5/omonitor/table/'+ntype.key+'/list'
  // $.getJSON(cellwfurl, {'sw' : Math.floor(sw.getLat()*100000)/100000+','+Math.floor(sw.getLng()*100000)/100000, 'ne' : Math.floor(ne.getLat()*100000)/100000+','+Math.floor(ne.getLng()*100000)/100000
  //    }).done(function(data){
  $('#tablec1list').html("");$('#tablec2list').html("");
  var desc = function(s,k){
    var a = parseFloat(s.o[keyidx],2)
       ,b = parseFloat(k.o[keyidx],2);
    // console.log('desc a[' + s + ']  b[' + k + ']' + keyidx);
    // console.log(s);   
    return a < b ? 1 : a > b ? -1 : a >= b ? 0 : NaN;
  };  
  var asc = function(s,k){
    var a = parseFloat(k.o[keyidx],2)
       ,b = parseFloat(s.o[keyidx],2);
    // console.log('asc a[' + a + ']  b[' + b + ']');   
    return a < b ? 1 : a > b ? -1 : a >= b ? 0 : NaN;
  };       
  // console.log('initTable' + ntype.key + '->');
  // console.log(data[ntype.key]);
  var c1Data = detailD.filter(function(d){ return d.o[2]==group.values[0]; }),
      c2Data = detailD.filter(function(d){ return d.o[2]==group.values[1]; });

  if(keyfactor.key == 'tp'){
    c1Data.sort(asc);c2Data.sort(asc);
  }else{
    c1Data.sort(desc);c2Data.sort(desc);
  }
  // console.log('----------c1Data------------');
  // console.log(c1Data);
  // console.log(c2Data);
  // console.log('----------c1Data------------');
  for(var j=0;j<10;j++){
    // console.log(c2Data[j]);
// ddd.push([positions[i].geometry.coordinates[0], positions[i].geometry.coordinates[1], positions[i].properties['optrcom'], positions[i].properties['addr'], positions[i].properties['id'],positions[i].properties['usrcnt'],positions[i].properties['sesscnt'], positions[i].properties[keys[0].key], positions[i].properties[keys[1].key], positions[i].properties[keys[2].key], positions[i].properties[keys[3].key], positions[i].properties[keys[4].key]]);
    var d1=!_.isUndefined(c1Data[j])?c1Data[j].o : undefined, d2=!_.isUndefined(c2Data[j])?c2Data[j].o : undefined;// onclick="_find(\''+type+'\','+d['lat']+','+d['lng']+')" style="cursor:pointer"
    // console.log(d1);
    if(!_.isUndefined(d1)) $('#tablec1list').append('<tr onclick="_find(\'c1\', '+d1[1]+','+d1[0]+')" style="cursor:pointer"><td>'+crypt_cellid(d1[4])+'</td><td>'+d1[5]+'</td><td>'+Math.round(d1[keyidx]*100)/100+'</td><td>'+d1[3]+'</td></tr>');
    if(!_.isUndefined(d2)) $('#tablec2list').append('<tr onclick="_find(\'c2\', '+d2[1]+','+d2[0]+')" style="cursor:pointer"><td>'+crypt_cellid(d2[4])+'</td><td>'+d2[5]+'</td><td>'+Math.round(d2[keyidx]*100)/100+'</td><td>'+d2[3]+'</td></tr>');
  }      
      
  // });
}

function _find(type, lat, lng){

  pinDetailMarker(type);
  
  var zoom = 3;
  focusmap.setCenter(new google.maps.LatLng( lat,lng ) ); 
}

function paintChart(container, data){
  data = data.sort(function(a,b){
    if( a[0] > b[0] ) return 1;
    if( a[0] < b[0] ) return -1;
    return 0;
  });

  // console.log(data);
  for(var k=0;k<24;k++){
    var d = data[k];
    if(_.isUndefined(d) || parseInt(d[0])!=k){
      data.splice(k,0,[("0"+k).slice(-2),0]);
      // console.log(data);
    }
  }
  // console.log('----------paintChart------------');
  // console.log(data);
  // console.log('----------paintChart------------');
  $('#'+container).highcharts({
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
  var bounds = focusmap.getBounds(),
        sw = bounds.getSouthWest(),
        ne = bounds.getNorthEast();

  var cellwfurl = '/api/v1.5/omonitor/chart/'+ntype.key+'/list'
  $.getJSON(cellwfurl, {'sw' : Math.floor(sw.lat()*100000)/100000+','+Math.floor(sw.lng()*100000)/100000, 'ne' : Math.floor(ne.lat()*100000)/100000+','+Math.floor(ne.lng()*100000)/100000
     }).done(function(data){

      paintChart('trendc1list',data[ntype.key].filter(function(d){ return d.optrcom==group.values[0];}).map(function(d){return [d['todow'],d[keyfactor.key]]}));
      paintChart('trendc2list',data[ntype.key].filter(function(d){ return d.optrcom==group.values[1];}).map(function(d){return [d['todow'],d[keyfactor.key]]}));
  });

}
$('#curkey').html(keyfactor.name + "&nbsp;[" + keyfactor.unit+ "]"); 
$('#curnetwork').html(ntype.name); 
$('#curgroup').html(group.name);
$('#curArea').html(_area.name);

function _mv(kk){
  keyfactor = keys.filter(function(d){ return d.key == kk; })[0];
    $('#curkey').html(keyfactor.name + "&nbsp;[" + keyfactor.unit+ "]"); 
      $('[id=keyfactor_nm]').each(function(){
        // console.log('1');
        $(this).html(keyfactor.name)
      });    
  // keyidx = keys.indexOf(function(d){ return d.key == keyfactor.key}) + 7;    
  keyidx = keys.map(function(e){ return e.key;}).indexOf(keyfactor.key)+7;
  paintMap();
}

function _loc(lat, lng, zoom){
  _area = areas.filter(function(d){ return d['center']['lat']==lat && d['center']['lng']==lng;})[0];
  $('#curArea').html(_area.name);
  map.setView([lat,lng], zoom);
  setTimeout(function(){
    paintMap();
    // paintMap(cmap, '/api/v1.3/haction/map/cell/list', 'cell');
    // paintMap(wmap, '/api/v1.3/haction/map/wf/list', 'wf');
    // initChart();
    // initDevicemap();
  },500);
}

function _ch(kk){
  ntype = networks.filter(function(d){ return d.key == kk; })[0];
  $('#curnetwork').html(ntype.name); 
      // $('[id=keyfactor_nm]').each(function(){
      //   // console.log('1');
      //   $(this).html(keyfactor.name)
      // });
  paintMap();
}

function _gr(kk){
  group = comparegroups.filter(function(d){ return d.key == kk; })[0];
  $('#curgroup').html(group.name); 
  localStorage.setItem("omonitor_group", group.key);
  initDashpanel();    
  paintMap();
}

function initDevicemap(){
  var bounds = focusmap.getBounds(),
      sw = bounds.getSouthWest(),
      ne = bounds.getNorthEast();

  var cellwfurl = '/api/v1.5/omonitor/treemap/'+ntype.key+'/list'
  $.getJSON(cellwfurl, {'sw' : Math.floor(sw.lat()*1000000)/1000000+','+Math.floor(sw.lng()*1000000)/1000000, 'ne' : Math.floor(ne.lat()*1000000)/1000000+','+Math.floor(ne.lng()*1000000)/1000000
     }).done(function(data){
// console.log('------initDevicemap ----')
// console.log(data);

      var c1nest = d3.nest()
        .key(function(d){ return d['brand'];})
        .key(function(d){ return d['model'];})
        .entries(data[ntype.key].filter(function(d){return d.optrcom==group.values[0];}));
      var c2nest = d3.nest()
        .key(function(d){ return d['brand'];})
        .key(function(d){ return d['model'];})
        .entries(data[ntype.key].filter(function(d){return d.optrcom==group.values[1];}));

      drawTreemap(group.values[0],c1nest, 'treemapc1list');
      drawTreemap(group.values[1],c2nest, 'treemapc2list');
  });
}
// drawTreemap('','')

function drawTreemap(type, data, container){ 
  var points = [],
    brand_p,
    brand_val,
    brand_i,
    model_p,
    model_i,
    cause_p,
    cause_i,
    cause_name = keyfactor.key,
    brand_i = 0;
  // if(type == 'cell')
  //   console.log(JSON.stringify(data));
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
  // console.log(JSON.stringify(points));
  var chart = new Highcharts.Chart({
    chart: {
      renderTo: container
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
      text: 'Distribution of QoE by Device'
    }
  });
}



function initPie(){
  $('#loading').css('display', 'block');
  var bounds = focusmap.getBounds(),
        sw = bounds.getSouthWest(),
        ne = bounds.getNorthEast();  
  var cellwfurl = '/api/v1.5/omonitor/pie/'+ntype.key+'/list'
  $.getJSON(cellwfurl, {'sw' : Math.floor(sw.lat()*1000000)/1000000+','+Math.floor(sw.lng()*1000000)/1000000, 'ne' : Math.floor(ne.lat()*1000000)/1000000+','+Math.floor(ne.lng()*1000000)/1000000
     }).done(function(data){
      // console.log('------initDevicemap ----')
      // console.log(data);
        paintPie('piec1list',data[ntype.key].filter(function(d){ return d.optrcom==group.values[0];}).map(function(d){return [d['osver'],d[keyfactor.key]]}));
        paintPie('piec2list',data[ntype.key].filter(function(d){ return d.optrcom==group.values[1];}).map(function(d){return [d['osver'],d[keyfactor.key]]}));
        $('#loading').css('display', 'none');
    });
}


function paintPie(container, data){
  // console.log('--------- paintPie -------------');
  // console.log(data);
  // console.log('--------- paintPie -------------');
  $('#'+container).highcharts({
        chart: {
            plotBackgroundColor: null,
            plotBorderWidth: null,
            plotShadow: false
        },
        title: {
            text: 'Distribution of QoE by OS'
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

function initRadar(){
  $('#loading').css('display', 'block');
  var bounds = focusmap.getBounds(),
        sw = bounds.getSouthWest(),
        ne = bounds.getNorthEast();  
  var cellwfurl = '/api/v1.5/omonitor/radar/'+ntype.key+'/list'
  $.getJSON(cellwfurl, {'sw' : Math.floor(sw.lat()*1000000)/1000000+','+Math.floor(sw.lng()*1000000)/1000000, 'ne' : Math.floor(ne.lat()*1000000)/1000000+','+Math.floor(ne.lng()*1000000)/1000000
   }).done(function(data){
    // console.log('------initRadar ----')
    // console.log(data);
    // function sort_days(days) {
    //     // var day_of_week = new Date().getDay();
    //     var list = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
    //     var sorted_list = list.slice(day_of_week).concat(list.slice(0,day_of_week));
    //     return days.sort(function(a,b) { return sorted_list.indexOf(a) > sorted_list.indexOf(b); });
    // }
    var rrc1 = data[ntype.key].filter(function(d){ return d.optrcom==group.values[0];}).map(function(d){return [d['todow'],d[keyfactor.key]]});
    var rrc2 = data[ntype.key].filter(function(d){ return d.optrcom==group.values[1];}).map(function(d){return [d['todow'],d[keyfactor.key]]});
    var list = ["MON","TUE","WED","THU","FRI","SAT","SUN"];
    rrc1.sort(function(a, b){ return list.indexOf(a[0]) > list.indexOf(b[0]); });
    rrc2.sort(function(a, b){ return list.indexOf(a[0]) > list.indexOf(b[0]); });

    // for(var k=0;k<24;k++){
    // var d = data[k];
    //   if(_.isUndefined(d) || parseInt(d[0])!=k){
    //     data.splice(k,0,[("0"+k).slice(-2),0]);
    //     // console.log(data);
    //   }
    // }
    list.forEach(function(d,i){
      var r1 = rrc1.filter(function(r){ return r[0] == d;})[0];
      if(_.isUndefined(r1) || r1[0]!=d){
        rrc1.splice(i,0, [d,0]);
      }
      var r2 = rrc2.filter(function(r){ return r[0] == d;})[0];
      if(_.isUndefined(r2) || r2[0]!=d){
        rrc2.splice(i,0, [d,0]);
      }

    });
    console.log(rrc1);
    // console.log(rrc2);

    paintRadar('radarc1list',rrc1.map(function(d){ return d[1]; }));
    paintRadar('radarc2list',rrc2.map(function(d){ return d[1]; }));
    $('#loading').css('display', 'none');
  });
}

function paintRadar(container, data){

  $('#'+container).highcharts({
      chart: {
          polar: true,
          type: 'line'
      },

      title: {
          text: 'Distribution of QoE by DoW',
          x: -80
      },

      pane: {
          size: '80%'
      },

      xAxis: {
          categories: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
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

      series: [{
          name: keyfactor.name,
          data: data,
          pointPlacement: 'on'
      }]

  });
}

function initBubble(){
// console.log('------ initBuble start ---------');
// console.log(focusmap);
// console.log(focusmap.getBounds());
  $('#loading').css('display', 'block');
  var bounds = focusmap.getBounds(),
        sw = bounds.getSouthWest(),
        ne = bounds.getNorthEast();  
  var cellwfurl = '/api/v1.5/omonitor/bubble/'+ntype.key+'/list'
  $.getJSON(cellwfurl, {'sw' : Math.floor(sw.lat()*1000000)/1000000+','+Math.floor(sw.lng()*1000000)/1000000, 'ne' : Math.floor(ne.lat()*1000000)/1000000+','+Math.floor(ne.lng()*1000000)/1000000
   }).done(function(data){
    // console.log('------initBubble ----')
    // console.log(data);
    // var rrc1 = data[ntype.key].filter(function(d){ return d.optrcom==group.values[0];}).map(function(d){return {'packageName':d.type, 'className':d.gubun, value: d[keyfactor.key]}; });
    // var rrc2 = data[ntype.key].filter(function(d){ return d.optrcom==group.values[1];}).map(function(d){return {'packageName':d.type, 'className':d.gubun, value: d[keyfactor.key]}; });
    
    var c1nest = d3.nest()
      .key(function(d){ return d['type'];})
      .entries(data[ntype.key].filter(function(d){return d.optrcom==group.values[0];}));

    var c2nest = d3.nest()
      .key(function(d){ return d['type'];})
      .entries(data[ntype.key].filter(function(d){return d.optrcom==group.values[1];}));

    paintBubble('bubblec1list',c1nest);
    paintBubble('bubblec2list',c2nest);
    $('#loading').css('display', 'none');

  });
}


function paintBubble(container, data){
  $('#'+container).html("");
  // data.filter(function(d){ return d.optrcom==group.values[0];}).map(function(d){ return {'packageName':d.type, 'className':d.gubun, value: d[keyfactor.key]} });
  // var classes = [];
  var data1 = data.map(function(p){ 
    var norm10 = d3.scale.linear().domain(d3.extent(p.values, function(d){ return d[keyfactor.key]; })).range([0.1,10]);
    var ddd = p.values.map(function(c){ return {'packageName':p.key, 'className':c.gubun, value: norm10(c[keyfactor.key])}; });
    // console.log(ddd);
    return ddd;
  });
  var classes1 = [];
  data1.forEach(function(d, i){
    d.forEach(function(el){
      classes1.push(el);
    });
    // console.log(classes1);
  });
  // console.log('1-----paintBubble-------');
  // console.log(data);
  // console.log('1-----paintBubble-------');

  // console.log('-----paintBubble-------');
  // console.log(classes1);
  // console.log('-----paintBubble-------');

  var diameter = 500,
      format = d3.format(",d"),
      color = d3.scale.category10();

  var bubble = d3.layout.pack()
    .sort(null)
    .size([diameter, diameter])
    .padding(1.5);


  var svg = d3.select('#'+container).append("svg")
    .attr("width", diameter)
    .attr("height",diameter)
    .attr("class", "bubble");    

  var node = svg.selectAll(".node")
      .data(bubble.nodes({children:classes1})
      .filter(function(d) { return !d.children; }))
      .enter().append("g")
      .attr("class", "node")
      .attr("transform", function(d){ return "translate("+d.x+","+d.y+")";});


  node.append("title")
      // .text(function(d){ return d.className + ":" + format(d.value); });
      .text(function(d){ return d.className; });

  node.append("circle")
      .attr("r", function(d){ return d.r; })
      .style("fill", function(d){ return color(d.packageName); });

  node.append("text")
      .attr("dy",".3em")
      .style("text-anchor","middle")
      .style("fill", "#FFFFFF")
      .style("font-family","Verdana")
      .style("font-size","6")
      .text(function(d){ return !_.isUndefined(d.className) ? d.className.substring(0, d.r/3):''; });
  // .text(function(d){ return d.className.substring(0,d.r/3); });

  var keys = data.map(function(d){ return d.key; });
  // console.log(keys);
  var iLegend = svg.append("g")
      .attr("class","legend")
      .attr("x", diameter - 165)
      .attr("y", 36)
      .attr("height", 130)
      .attr("width", 100);

  iLegend.selectAll("g")
      .data(keys)
      .enter()
      .append("g")
      .each(function(d, i){
          var g = d3.select(this);
          g.append("rect")
          .attr("x", 1)
          .attr("y", i*25)
          .attr("width", 10)
          .attr("height", 10)
          .style("fill", color(d));

          g.append("text")
          .attr("x", 15)
          .attr("y", i*25 + 12)
          .attr("height", 30)
          .attr("width", 100)
          .style("fill", color(d))
          .text(d);
      });
}






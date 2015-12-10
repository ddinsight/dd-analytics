angular.module('Wave.tools.ctrl',[])


//.controller('ModalInstanceCtrl', function($scope, $modalInstance, editedItem){
//    $scope.editedItem = editedItem;
//    $scope.save = function(){
//        $modalInstance.close($scope.editedItem);
//    };
//    $scope.cancel = function(){
//        $scope.editedItem.modalcmd = 'cancel';
//        $modalInstance.close($scope.editedItem);
//
//    };
//    $scope.delete = function(){
//        $scope.editedItem.modalcmd = 'delete';
//        $modalInstance.close($scope.editedItem);
//    };
//})

.controller('ToolsQuerytomapController', ['$log','$window','$timeout', '$location','$scope','$routeParams', '$filter', '$dashboardService', '$toolService',
    function($log, $window, $timeout, $location, $scope, $routeParams, $filter,  $dashboard, $toolService){
    $scope.logout = function(){
        console.log('ChartMakerController logout...');
        if($user.logout()){
            $location.path('/login');
        }
    }
    $log.log('--- start ToolsQuerytomapController ----');
    $scope.menus = [];
    $scope.leftMenus = function(){
        var promise = $dashboard.getMenus();
        promise.then(function(data){
            $scope.menus = JSON.parse(data[0].m1);
            $log.log('----$scope.leftMenus in ToolsQuerytomapController-----');
            $timeout(function(){
                $window.initApp.SmartActions();
                $window.initApp.leftNav();
                $log.log($window.initApp);
            }, 500);
        });
    };
    $scope.leftMenus();
    $scope.leftMove = function(url){
        $log.log('move to >>' + url + '<<');
        if(url != '#'){
            $location.path(url);
        }
        return;
    };

    $scope.querystr = "select lat, lng from apmain.cellinfo where lac = 65534 and lat > 0 and plmnid = '45008' limit 100";
    var zoom = 10, center =  new google.maps.LatLng(37.511999, 127.071897);

    $scope.mapOptions = {
        zoom:zoom,
        center:center,
        scrollwheel:true,
        disableDefaultUI: true,
        mapTypeControl: true,
        mapTypeId: google.maps.MapTypeId.ROADMAP
    }

    // get map from directive
    $scope.mapOptions.onLoad = function(map){
        $scope.map = map;
    }
    var image = '/static/assets/css/green_pin.png';
    $scope.isRendering = false;
    $timeout(function() {
        google.maps.event.addListener($scope.map, 'init', function() {
            if(!$scope.isRendering){
                $scope.isRendering = true;
                try{ $scope.render(); }catch(e){console.log(e);}
            }
        });
    }, 5600);
    $scope.markers = [];

    $scope.render = function(){
        // clear marker
        for(var j=0;j<$scope.markers.length;j++){
            if($scope.markers[j]){
                $scope.markers[j].setMap(null);
            }
        }
        console.log('begin render start ');
//        google.maps.event.addListener($scope.map, 'init', function() {
            if($scope.querystr){
                var pp = $toolService.queryToMap({'querystr':$scope.querystr}, '');
                pp.then(function(data){
                    for(var i=0;i<data.length;i++){
                        var d = data[i];
                        if(d['lat'] && d['lng']){
//                            console.log(d['lat'] + '/' + d['lng']);
                            var pos = new google.maps.LatLng(d.lat, d.lng);
                            var marker = new google.maps.Marker({
                                icon:image, position : pos, map: $scope.map, title: d.lat+','+ d.lng
                            });
                            $scope.markers.push(marker);
                        }
                    }
                })
            }
//        });
        $timeout(function(){ $scope.isRendering = false; },1000);
    };

}])


.controller('ToolsQuerytoMapByPolylineController', ['$log','$window','$timeout', '$location','$scope','$routeParams', '$filter', '$dashboardService', '$toolService',
    function($log, $window, $timeout, $location, $scope, $routeParams, $filter,  $dashboard, $toolService){
    $scope.logout = function(){
        console.log('ToolsQuerytoMapByPolygonController logout...');
        if($user.logout()){
            $location.path('/login');
        }
    }
    $log.log('--- start ToolsQuerytoMapByPolygonController ----');
    $scope.menus = [];
    $scope.leftMenus = function(){
        var promise = $dashboard.getMenus();
        promise.then(function(data){
            $scope.menus = JSON.parse(data[0].m1);
            $log.log('----$scope.leftMenus in ToolsQuerytoMapByPolygonController-----');
            $timeout(function(){
                $window.initApp.SmartActions();
                $window.initApp.leftNav();
                $log.log($window.initApp);
            }, 500);
        });
    };
    $scope.leftMenus();
    $scope.leftMove = function(url){
        $log.log('move to >>' + url + '<<');
        if(url != '#'){
            $location.path(url);
        }
        return;
    };

    $scope.querystr = "select group_concat(concat(c.lat, ',',c.lng ) separator '|') as line from scellord s, cellinfo c where 1=1 and substring(datehr, 1,8) = '20150105' and c.fullid = s.cellid group by id, androidid order by datehr ";
    var zoom = 10, center =  new google.maps.LatLng(37.511999, 127.071897);

    $scope.mapOptions = {
        zoom:zoom,
        center:center,
        scrollwheel:true,
        disableDefaultUI: true,
        mapTypeControl: true,
        mapTypeId: google.maps.MapTypeId.ROADMAP
    }

    // get map from directive
    $scope.mapOptions.onLoad = function(map){
        $scope.map = map;
    }
    var image = '/static/assets/css/green_pin.png';
    $scope.isRendering = false;
    $timeout(function() {
        google.maps.event.addListener($scope.map, 'init', function() {
            if(!$scope.isRendering){
                $scope.isRendering = true;
                try{ $scope.render(); }catch(e){console.log(e);}
            }
        });
    }, 5600);
    $scope.markers = [];
    $scope.clear = function(){

    }
    $scope.render = function(){
        // clear marker
        for(var j=0;j<$scope.markers.length;j++){
            if($scope.markers[j]){
                $scope.markers[j].setMap(null);
            }
        }
        console.log('begin render start ');
        function componentToHex(c) {
            var hex = c.toString(16);
            return hex.length == 1 ? "0" + hex : hex;
        }

        function rgbToHex(r, g, b) {
            return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
        }
        function normalized(observed, arbitrary, value){
            return (arbitrary[1]-arbitrary[0])/(observed[1]-observed[0])*(value-observed[1]) + arbitrary[1];
        }
    //        google.maps.event.addListener($scope.map, 'init', function() {
            if($scope.querystr){
                var pp = $toolService.queryToMap({'querystr':$scope.querystr}, '');
                pp.then(function(data){
                    for(var i=0;i<data.length;i++){
                        var d = data[i];
                        if(d['line'].indexOf('|') != -1){
                            var coordinates = [];
                            var ccc = d['line'].split('|');
                            angular.forEach(ccc, function(c){
                                coordinates.push(new google.maps.LatLng(c.split(',')[0],c.split(',')[1]));
                            });

                            for(var j=0;j<coordinates.length-1;+j++){
                                var numberOfItems = coordinates.length;
                                var rainbow = new Rainbow();
                                rainbow.setNumberRange(1, numberOfItems);
                                rainbow.setSpectrum('orange', 'white');
                                var color = rainbow.colourAt(j);
                                color = '#' + color;
                                //var n = normalized([0, coordinates.length],[0,100], j);
                                //console.log(n);
                                //var color= rgbToHex(255*(255-n)/255, 255*(100-n)/255, 255*(100-n)/255);
                                //console.log(color);
                                //console.log(coordinates[j]);
                                var dpath = new google.maps.Polyline({
                                   path:[coordinates[j], coordinates[j+1]],
                                    geodesic:true, strokeColor:color, strokeWeight:1, map:$scope.map, strokeOpacity:1
                                });
                                $scope.markers.push(dpath);

                            }

                        }else{

                        }

                    }
                })
            }
//        });
        $timeout(function(){ $scope.isRendering = false; },1000);
    };

}])



.controller('SamsungDemoQuerytomapController', ['$log','$window','$timeout','$interval', '$location','$scope','$routeParams', '$filter', '$dashboardService', '$toolService',
    function($log, $window, $timeout, $interval, $location, $scope, $routeParams, $filter,  $dashboard, $toolService){
    $scope.logout = function(){
        console.log('ToolsQuerytoMapByPolygonController logout...');
        if($user.logout()){
            $location.path('/login');
        }
    }
    $log.log('--- start ToolsQuerytoMapByPolygonController ----');
    $scope.menus = [];
    $scope.leftMenus = function(){
        var promise = $dashboard.getMenus();
        promise.then(function(data){
            $scope.menus = JSON.parse(data[0].m1);
            $log.log('----$scope.leftMenus in ToolsQuerytoMapByPolygonController-----');
            $timeout(function(){
                $window.initApp.SmartActions();
                $window.initApp.leftNav();
                $log.log($window.initApp);
            }, 500);
        });
    };
    $scope.leftMenus();
    $scope.leftMove = function(url){
        $log.log('move to >>' + url + '<<');
        if(url != '#'){
            $location.path(url);
        }
        return;
    };

    $scope.params = [
        ['00', '01','02','03','04','05','06','07','08','09','10','11','12','13','14','15','16','17','18','19','20','21','22','23'],
        ['00', '01','02','03','04','05','06','07','08','09','10','11','12','13','14','15','16','17','18','19','20','21','22','23'],
        ['00', '01','02','03','04','05','06','07','08','09','10','11','12','13','14','15','16','17','18','19','20','21','22','23'],
        ['00', '01','02','03','04','05','06','07','08','09','10','11','12','13','14','15','16','17','18','19','20','21','22','23'],
        ['00', '01','02','03','04','05','06','07','08','09','10','11','12','13','14','15','16','17','18','19','20','21','22','23'],
        ['00', '01','02','03','04','05','06','07','08','09','10','11','12','13','14','15','16','17','18','19','20','21','22','23'],
        ['00', '01','02','03','04','05','06','07','08','09','10','11','12','13','14','15','16','17','18','19','20','21','22','23']
    ];

    $scope.querystr = "select group_concat(concat(c.lat, ',',c.lng ) separator '|') as line from scellordtdw s, cellinfo c where 1=1 and c.fullid = s.cellid and substring_index(datehr,'-',-1) = '#h#' and substring_index(datehr,'-',1) = '#w#' group by id, androidid having count(*) > 3 order by ord limit 800";
    var zoom = 11, center =  new google.maps.LatLng(37.511999, 127.071897);

    $scope.mapOptions = {
        zoom:zoom,
        center:center,
        scrollwheel:false,
        disableDefaultUI: false,
        mapTypeControl: true,
        mapTypeId: google.maps.MapTypeId.SATELLITE
    }

    // get map from directive
    $scope.mapOptions.onLoad = function(map){
        $scope.map = map;
    }
    var image = '/static/assets/css/green_pin.png';
    $scope.isRendering = false;
    //$timeout(function() {
    //    google.maps.event.addListener($scope.map, 'init', function() {
    //        if(!$scope.isRendering){
    //            $scope.isRendering = true;
    //            try{ $scope.render(); }catch(e){console.log(e);}
    //        }
    //    });
    //}, 5600);
    $scope.markers = [];
    $scope.ii = 0, $scope.jj = 0;
    $scope.weekhourstr = "";
    $scope.makeDspName = function(i, j) {
        var wkstr = "";
        switch (i) {
            case 0:
                wkstr = "월요일";
                break;
            case 1:
                wkstr = "화요일";
                break;
            case 2:
                wkstr = "수요일";
                break;
            case 3:
                wkstr = "목요일";
                break;
            case 4:
                wkstr = "금요일";
                break;
            case 5:
                wkstr = "토요일";
                break;
            case 6:
                wkstr = "일요일";
                break;
        }
        var hourstr = parseInt($scope.params[i][j]) + "시";
        return wkstr + " " + hourstr;
    }
    $scope.clear = function(){
        // clear marker
        for(var j=0;j<$scope.markers.length;j++){
            if($scope.markers[j]){
                $scope.markers[j].setMap(null);
            }
        }
        $scope.markers.length = 0;
    }

    $scope.render = function(){
        console.log("start render");
        var lPad = function(value){
            return value < 10?"0"+value:value;
        }
        if($scope.querystr){
            //console.log('$scope.ii is ' + $scope.ii + ' and $scope.jj is ' + $scope.jj + " => " + $scope.params[$scope.ii][$scope.jj]);
            var query = $scope.querystr.replace('#h#', lPad($scope.jj)).replace('#w#',($scope.ii+1) );
            console.log(query);
            var pp = $toolService.queryToMap({'querystr':query}, '');
            var ww = angular.copy($scope.ii);
            var hh = angular.copy($scope.jj);

            pp.then(function(data){
                //$scope.markers.length = 0;

                $scope.clear();
                //$scope.i = 0;
                //$scope.sstop = $interval(function(){
                for(var i=0;i<data.length;i++){
                    var d = data[i];
                    if(d['line'].indexOf('|') != -1){
                        var ccc = d['line'].split('|');
                        var coordinates = [];
                        //console.log(ccc);
                        angular.forEach(ccc, function(c){
                            coordinates.push(new google.maps.LatLng(c.split(',')[0],c.split(',')[1]));
                        });

                        for(var j=0;j<coordinates.length-1;+j++){
                            var numberOfItems = coordinates.length;
                            var rainbow = new Rainbow();
                            rainbow.setNumberRange(1, numberOfItems);
                            rainbow.setSpectrum('orange', 'white');
                            var color = rainbow.colourAt(j);
                            color = '#' + color;
                            var line = new google.maps.Polyline({
                                geodesic:true, strokeColor:color, strokeOpacity:0.3, strokeWeight:0.9, map:$scope.map
                            });
                            line.setPath([coordinates[j], coordinates[j+1]]);
                            $scope.markers.push(line);
                        }

                    }
                    $scope.weekhourstr = $scope.makeDspName(ww, hh);
                    //}, i*10);
                }
                $scope.jj++;
                //});
                if($scope.jj > 23){
                    $scope.jj = 0;
                    $scope.ii++;
                }
                //$scope.render();
            });

            //$timeout($scope.render(), 1000*10);
        }
        //$timeout(function(){ $scope.isRendering = false; },1000);
    };

    //$scope.render();
    $interval(function() {
        $scope.render();
    }, 1000*6 );


}])


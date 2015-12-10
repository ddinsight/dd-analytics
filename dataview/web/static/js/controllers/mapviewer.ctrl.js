angular.module('Wave.mapviewer.ctrl',[])

.controller('MapViewerModalInstanceCtrl', function($scope, $modalInstance, editedItem){
    $scope.editedItem = editedItem;
    $scope.save = function(){
        $modalInstance.close($scope.editedItem);
    };
    $scope.cancel = function(){
        $scope.editedItem.modalcmd = 'cancel';
        $modalInstance.close($scope.editedItem);

    };
    $scope.delete = function(){
        $scope.editedItem.modalcmd = 'delete';
        $modalInstance.close($scope.editedItem);
    };
})

.controller('MapViewerListController', ['$timeout','$window','$log','$location', '$scope','$routeParams','$dashboardService','$mapviewer','$appUser',
        function($timeout, $window, $log, $location, $scope, $routeParams, $dashboard, $mapviewer, $user) {

    $scope.user = $user.isLogined().user;

    $scope.menus = [];
    $scope.leftMenus = function(){
        var promise = $dashboard.getMenus();
        promise.then(function(data){
            $scope.menus = JSON.parse(data[0].m1);
            $log.log('----$scope.printMenus-----');
            $timeout(function(){
                $window.initApp.SmartActions();
                $window.initApp.leftNav();
                $log.log($window.initApp);
            }, 300);
        });
    };
    $scope.leftMenus();
    $scope.leftMove = function(url){
        $log.log('move to >>' + url + '<<');
        $location.path(url);
    };

    $scope.tblDatas    = [];
    $scope.templates   = [];
    $scope.printDataSet = function(){
        var promise = $mapviewer.get();
        promise.then(function(data){
            $scope.tblDatas = data;
            $log.log('------ $scope.printDataSet -----');
            $log.log(data);
        });
    };
    $scope.overrideOptions = {
        "iDisplayLength":50
    };
    $scope.tblSorting = [[ 0, "desc" ]];
    $scope.tblColumns = [
        {"sTitle":"ID", "sWidth":"10%"}, {"sTitle":"NAME"}, {"sTitle":"DESCRIPTIONS"}
    ];

    $scope.columnDefs = [
        {"mDataProp":"sqlid", "aTargets":[0]},
        {"mDataProp":"sqlnm", "aTargets":[1], "mRender":function(data, type, row){
            return '<a href="javascript:void(0)" ng-click="moveTo('+row.sqlid+')">'+row.sqlnm+'</a>';
        }},
        {"mDataProp":"sqldesc", "aTargets":[2]}
    ];

    $scope.printDataSet();

    $scope.moveTo = function(sqlid){
        $log.log('move to ' + sqlid);
        $location.path('/mapviewer/view/'+sqlid);
    };

}])

.controller('MapBoardListController', ['$timeout','$window','$log','$location', '$scope','$routeParams','$modal', '$dashboardService','$mapboard','$appUser',
        function($timeout, $window, $log, $location, $scope, $routeParams, $modal, $dashboard, $mapboard, $user) {
$log.log('---MapBoardListController----');
    $scope.user = $user.isLogined().user;
    $scope.editedItem = {};
    $scope.editedItem.mapboard = {};

    $scope.menus = [];
    $scope.leftMenus = function(){
        var promise = $dashboard.getMenus();
        promise.then(function(data){
            $scope.menus = JSON.parse(data[0].m1);
            $log.log('----$scope.printMenus-----');
            $timeout(function(){
                $window.initApp.SmartActions();
                $window.initApp.leftNav();
                $log.log($window.initApp);
            }, 300);
        });
    };
    $scope.leftMenus();
    $scope.leftMove = function(url){
        $log.log('move to >>' + url + '<<');
        $location.path(url);
    };

    $scope.tblDatas    = [];
    $scope.templates   = [];
    $scope.printDataSet = function(){
        var promise = $mapboard.get();
        promise.then(function(data){
            $scope.tblDatas = data;
            $log.log('------ $scope.printDataSet -----');
            $log.log(data);
        });
    };
    $scope.overrideOptions = {
        "iDisplayLength":50
    };
    $scope.tblSorting = [[ 0, "desc" ]];
    $scope.tblColumns = [
        {"sTitle":"ID", "sWidth":"10%"}, {"sTitle":"NAME"}, {"sTitle":"DESCRIPTIONS"}, {"sTitle":"ITEMS", "sWidth":"50%"}
    ];

    $scope.columnDefs = [
        {"mDataProp":"id", "aTargets":[0]},
        {"mDataProp":"title", "aTargets":[1], "mRender":function(data, type, row){
            return '<a href="javascript:void(0)" ng-click="moveTo('+row.id+')">'+row.title+'</a>';
        }},
        {"mDataProp":"desc", "aTargets":[2]},
        {"mDataProp":"items", "aTargets":[3]}
    ];

    $scope.overrideOptions.afterCreationTableCallback = function(element, table){

        $(element).find('tbody').on('click', 'tr', function(){
            console.log('in tobdy:' + $(this).hasClass('DTTT_selected'));
            if($(this).hasClass('DTTT_selected')){

            }else{
                table.$('tr.DTTT_selected').removeClass('DTTT_selected');
                $(this).addClass('DTTT_selected');

                if(table.api(0)) $scope.editedItem.mapboard_id = table.api(0).rows('.DTTT_selected').data()[0].id;
                $log.log($scope.editedItem.mapboard_id);
            }
        });
        $(element).find('tbody').hover(function(){
            $(this).css('cursor','Default');
        });
        //$(element).find('tbody').on('dblclick', 'tr', function(){
        //    console.log('in tobdy:' + $(this).hasClass('DTTT_selected'));
        //    if($(this).hasClass('DTTT_selected')){
        //        if(table.api(0)) $scope.selid = table.api(0).rows('.DTTT_selected').data()[0].selid;
        //        $scope.edit();
        //    }else{
        //        table.$('tr.DTTT_selected').removeClass('DTTT_selected');
        //        $(this).addClass('DTTT_selected');
        //        if(table.api(0)) $scope.selid = table.api(0).rows('.DTTT_selected').data()[0].selid;
        //    }
        //});

    }

    $scope.printDataSet();

    $scope.moveTo = function(boardid){
        $log.log('move to ' + boardid);
        $location.path('/mapboard/view/'+boardid);
    };

    $scope.add = function(){
        $log.log('MapboardList added!!!!');
        //var addDlg;
        //addDlg = $dialogs.create(CONFIG.preparePartialTemplateUrl('mapboard-add'), 'ModalInstanceCtrl', {editedItem:$scope.editedItem}, {key:false, back:'static'});
        //addDlg.result.then(function(editedItem){
        //    $scope.save_mapboard(editedItem);
        //});

        var editDlg = $modal.open({
            templateUrl: CONFIG.preparePartialTemplateUrl('mapboard-add'),
            controller: 'MapViewerModalInstanceCtrl',
            backdrop : 'static',
            //size: 'lg',
            resolve: {
                editedItem: function () {
                    return $scope.editedItem;
                }
            }
        });

        editDlg.result.then(function(editedItem){
            if(!_.isUndefined(editedItem.modalcmd) && editedItem.modalcmd == 'delete'){
                $scope.delete();
            }else if(!_.isUndefined(editedItem.modalcmd) && editedItem.modalcmd == 'cancel'){
                $scope.modalOpended = false;
            }else{
                $scope.editedItem = editedItem;
                $scope.save();
            }
            $scope.modalOpended = false;
        });

    };

    $scope.edit = function(){
        $log.log('MapboardList edited!!!!');
    };
    $scope.cancel = function(){
        $log.log('MapboardList canceled !!!!');
    }
    $scope.delete = function(){
        $log.log('MapboardList deleted!!!!');
        var editDlg = $modal.open({
            templateUrl: CONFIG.preparePartialTemplateUrl('mapboard-delete'),
            controller: 'MapViewerModalInstanceCtrl',
            backdrop : 'static',
            //size: 'lg',
            resolve: {
                editedItem: function () {
                    return $scope.editedItem;
                }
            }
        });

        editDlg.result.then(function(editedItem){
            if(!_.isUndefined(editedItem.modalcmd) && editedItem.modalcmd == 'delete'){
                $scope.editedItem = editedItem;
                //$scope.save();
                //q = {};
                //q.mapboard_id = $scope.editedItem.mapboard_id;
                var p = $mapboard.delete([], '/'+ $scope.editedItem.mapboard_id);
                p.then(function(dt){
                   console.log('------ after delete mapboard -----');
                   console.log(dt);
                   $scope.tblDatas = dt;
                });
            }else if(!_.isUndefined(editedItem.modalcmd) && editedItem.modalcmd == 'cancel'){
                $scope.modalOpended = false;
            }else{

            }
            $scope.modalOpended = false;
        });

        //dlg = $dialogs.confirm('Please Confirm','Do you really want to delete Mapboard and all items in it? ');
        //dlg.result.then(function(btn){
        //    // really delete
        //    q = {};
        //    q.mapboard_id = $scope.mapboard_id;
        //    var p = $mapboard.delete(q, '/'+ $scope.mapboard_id);
        //    p.then(function(dt){
        //
        //        if(dt.length){
        //            //var url = ROUTER.routePath('mapboard_path',{
        //            //    mapboard_id : dt.mapboard_id
        //            //});
        //            //$location.path(url);
        //        }
        //    });
        //},function(btn){
        //// console.log('not delete!!!')
        //});
    };


    $scope.save = function(){
        //console.log('$scope.save_mapboard called in MapboardEmptyCtrl');
        var q = {};
        q.title = $scope.editedItem.mapboard.title;
        q.desc= $scope.editedItem.mapboard.desc;
        q.refresh_intv = $scope.editedItem.mapboard.refresh_intv;
        q.mapboard_id = $scope.mapboard_id;

        var p = $mapboard.add(q,'');
        p.then(function(dt){
            if(dt.length){
                $scope.tblDatas = dt;
                //$('#editModal').modal('hide');
                //var url = ROUTER.routePath('mapboard_path',{
                //    mapboard_id : dt[0].id
                //});
                //$location.path(url);
            }
        });
    }


    //$scope.goMapboard = function(id){
    //    var url = ROUTER.routePath('mapboard_path',{
    //        mapboard_id : id
    //    });
    //    $location.path(url);
    //}

    //$scope.addMapboard = function(){
    //
    //    var addDlg;
    //    addDlg = $dialogs.create(CONFIG.preparePartialTemplateUrl('mapboard-add'), 'MapboardModalInstanceCtrl', {editedItem:$scope.editedItem}, {key:false, back:'static'});
    //    addDlg.result.then(function(editedItem){
    //        $scope.save_mapboard(editedItem);
    //    });
    //
    //}
    //$scope.refreshMapboard = function(){
    //    if($scope.isRendering){
    //        return;
    //    }
    //    $scope.mapboarditem_list = [];
    //    var p2 = $mapboardItem.get([], '/'+$scope.mapboard_id);
    //    p2.then(function(data){
    //        $scope.mapboarditem_list = data;
    //    });
    //}
    //
    //$scope.removeMapboard = function(){
    //    dlg = $dialogs.confirm('Please Confirm','Do you really want to delete Mapboard and all items in it? ');
    //    dlg.result.then(function(btn){
    //        // really delete
    //        q = {};
    //        q.mapboard_id = $scope.mapboard_id;
    //        var p = $mapboard.delete(q, '/'+ $scope.mapboard_id);
    //        p.then(function(dt){
    //            var idx = -1;
    //            if(dt.result == 'success'){
    //                var url = ROUTER.routePath('mapboard_path',{
    //                    mapboard_id : dt.mapboard_id
    //                });
    //                $location.path(url);
    //            }
    //        });
    //    },function(btn){
    //    // console.log('not delete!!!')
    //    });
    //}
}])

.factory('$mapctrlcommon', ['$window','d3Formatter','$timeout', function($window, d3Formatter,$timeout){
    var $scope = {};
    return {
        getRoundfromZooms : function(scope, maptype){
            $scope = scope;
            if(!$scope.map)
                return;
            var zoom = $scope.map.getZoom();
            console.log(maptype);
            if(angular.isDefined(maptype) && maptype=='google-heat-map'){
                if(zoom >= 18) return 7;
                else if(zoom >= 17 && zoom < 18) return 7;
                else if(zoom >= 16 && zoom < 17) return 7;
                else if(zoom >= 15 && zoom < 16) return 6;
                else if(zoom >= 14 && zoom < 15) return 6;
                else if(zoom >= 13 && zoom < 14) return 5;
                else if(zoom >= 12 && zoom < 13) return 4;
                else if(zoom >= 11 && zoom < 12) return 3;
                else if(zoom >= 8 && zoom < 11) return 3;
                else return 0;
            }else{
                if(zoom >= 18) return 6;
                else if(zoom >= 17 && zoom < 18) return 5;
                else if(zoom >= 16 && zoom < 17) return 4;
                else if(zoom >= 15 && zoom < 16) return 3;
                else if(zoom >= 14 && zoom < 15) return 3;
                else if(zoom >= 13 && zoom < 14) return 2;
                else if(zoom >= 12 && zoom < 13) return 2;
                else if(zoom >= 11 && zoom < 12) return 1;
                else if(zoom >= 8 && zoom < 11) return 1;
                else return 0;
            }

        },
        drawLayer : function (scope, obj) {
            $scope = scope; // from controller

            var circlelableptar = [
                {x: -50, y: -50},
                {x: -80, y: -40},
                {x: 0, y: 0},
                {x: -60, y: 20},
            ];

            function normalize(data, t) {
                var _max = 0, _min = 0;
                for (var i = 0; i < data.length; i++) {
                    _max = data[i].y > _max ? data[i].y : _max;
                    _min = data[i].y > _min ? _min : data[i].y;
                }
                for (var i = 0; i < data.length; i++) {
                    data[i].y = ((t[1] - t[0]) / (_max - _min)) * data[i].y + ( t[0] - ((t[1] - t[0]) / (_max - _min)) * _min )
                }
                return data;
            }

            var keys = Object.keys($scope.layers);
            var ishave = false;
            keys.forEach(function (key) {
                if (key == obj.id) ishave = true;
            });
            if (!ishave) $scope.layers[obj.id] = [];
            var zoomlvl = $scope.map.getZoom();
            var projection = $scope.map.getProjection();

            $scope.clearLayer(obj.id);

            if (obj && obj.data && obj.data.length > 0) {
                if (obj.template == 'google-heat-map') {
                    var data = d3Formatter.parse(["x", "x2"], obj.data);
                    var points = [];
                    data.data = normalize(data.data, [0.01, 1]); // normalization
                    data.data.forEach(function (d) {
                        points.push({location: new google.maps.LatLng(d.x, d.x2), weight: d.y})
                    });
                    var gradient = [
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
                    ]
                    heatmap = new google.maps.visualization.HeatmapLayer({
                        gradient: gradient,
                        data: new google.maps.MVCArray(points)
                    });
                    heatmap.setMap($scope.map);
                    $scope.layers[obj.id].push({map: heatmap});

                } else if (obj.template == 'google-circle-map') {
                    var data = d3Formatter.parse(["x", "x2"], obj.data);
                    var points = [];
                    data.original = angular.copy(data.data);
                    _data = normalize(data.data, [1, 50]); // normalization
                    var justpt = 0;
                    for (var i = 0; i < data.data.length; i++) {
                        var d = data.data[i];
                        justpt = justpt + parseInt(d.y);
                    }
                    console.log('justpt------------->');
                    console.log(justpt);
                    $scope.circleCnt++;

                    for (var i = 0; i < _data.length; i++) {
                        var d = _data[i];
                        var radius = 0;
                        if (isNaN(justpt)) {
                            radius = (1000 * d.y / Math.pow(zoomlvl, 4));
                        } else {
                            radius = (500000 * d.y / Math.pow(zoomlvl, 4));
                        }

                        var offsetX = circlelableptar[$scope.circleCnt % 4].x,
                            offsetY = circlelableptar[$scope.circleCnt % 4].y;

                        var populationOptions = {
                            strokeColor: obj.colors,
                            strokeOpacity: 1,
                            strokeWeight: 0.6,
                            fillColor: obj.colors,
                            fillOpacity: 0.22,
                            map: $scope.map,
                            zIndex: 0,
                            clickable: false,
                            center: new google.maps.LatLng(d.x, d.x2),
                            radius: radius
                            // radius: 100000/(zoomlvl*zoomlvl*zoomlvl)
                        };
                        var infobox;
                        var ptlabel = isNaN(parseFloat(data.original[i].y).toFixed(2)) ? data.original[i].y : parseFloat(data.original[i].y).toFixed(2);
                        // offsetX = isNaN(parseFloat(data.original[i].y).toFixed(2) )? 0:offsetX;
                        // offsetY = isNaN(parseFloat(data.original[i].y).toFixed(2) )? 0:offsetY;
                        infobox = new InfoBox({
                            // content: '<div style="border:2px solid black;overflow: hidden;text-overflow: ellipsis;-o-text-overflow: ellipsis;white-space: nowrap;width: 100%;margin-top: 8px;background:'+obj.colors+';color:#FFF;font-family:Arial, Helvetica, sans-serif;font-size:7px;padding: .1em 1em;-webkit-border-radius: 2px;-moz-border-radius: 2px;border-radius: 2px;text-shadow:0 -1px #000000;-webkit-box-shadow: 0 0 8px #000;box-shadow: 0 0 8px #000;">' + d.y + '</div>',
                            content: '<div style="padding:0px 0px 0px 0px;color:' + obj.colors + ';font-family:Arial, Helvetica, sans-serif;font-size:7px;overflow: hidden;text-overflow: ellipsis;-o-text-overflow: ellipsis;">' + ptlabel + '</div>',
                            disableAutoPan: true,
                            maxWidth: 80,
                            pixelOffset: new google.maps.Size(offsetX, offsetY),
                            position: new google.maps.LatLng(d.x, d.x2),
                            zIndex: null,
                            closeBoxURL: "",
                            clickable: false,
                            isHidden: false,
                            pane: "floatPane",
                            boxStyle: {
                                // background: colors[ii],
                                padding: "0px 0px 0px 0px",
                                border: "0px solid white",
                                textAlign: "center",
                                fontSize: "9pt",
                                width: "80px",
                                color: color
                            },
                            enableEventPropagation: false
                        });

                        dotpt = new google.maps.Circle(populationOptions);
                        // infobox.open($scope.map);
                        $scope.layers[obj.id].push({info: infobox, map: dotpt});
                    }
                    ;

                } else if (obj.template == 'google-dot-map') {
                    var data = d3Formatter.parse(["x", "x2"], obj.data);
                    var points = [];
                    // ['#3399FF', '#FF0000', '#ACD13E', '#997ECC', '#00B8E6', '#E68A2E']
                    _data = normalize(data.data, [1, 50]); // normalization
                    var image = '/static/assets/css/green_pin.png'
                     //console.log(JSON.stringify(obj.data));
                     //console.log(JSON.stringify(_data));
                    _data.forEach(function (d) {
                        if (d.y < 10) image = '/static/assets/css/green_pin.png';
                        else if (d.y < 20 && d.y >= 10) image = '/static/assets/css/yellow_pin.png';
                        else if (d.y < 30 && d.y >= 20) image = '/static/assets/css/orange_pin.png';
                        else if (d.y < 40 && d.y >= 30) image = '/static/assets/css/pink_pin.png';
                        else if (d.y < 50) image = '/static/assets/css/red_pin.png';

                        var markerOptions = {
                            position: new google.maps.LatLng(d.x, d.x2),
                            map: $scope.map,
                            clickable: false,
                            icon: image
                        };
                        dotpt = new google.maps.Marker(markerOptions);
                        $scope.layers[obj.id].push({map: dotpt});
                    });
                } else if (obj.template == 'google-label-map') {
                    var data = d3Formatter.parse(["x", "x2"], obj.data);
                    var points = [];
                    _data = data.data;
                    var color = obj.colors;
                    _data.forEach(function (d) {
                        var txt = decodeURIComponent(d.y).toString().length > 3 ? decodeURIComponent(d.y).toString().substring(0, 5) + ".." : decodeURIComponent(d.y) + "";
                        var label = new InfoBox({
                            content: txt,
                            boxStyle: {
                                // background: colors[ii],
                                border: "0px solid black",
                                textAlign: "center",
                                fontSize: "9pt",
                                width: "30px",
                                color: color
                            },
                            zIndex: null,
                            disableAutoPan: true,
                            pixelOffset: new google.maps.Size(0, 0),
                            position: new google.maps.LatLng(d.x, d.x2),
                            closeBoxURL: "",
                            clickable: false,
                            isHidden: false,
                            pane: "floatPane",
                            enableEventPropagation: false
                        });
                        label.open($scope.map);
                        $scope.layers[obj.id].push({info: label});
                    });
                } else if (obj.template == 'google-dynamic-circle-map') {
                    var data = d3Formatter.parse(["x", "x2"], obj.data);
                    console.log('------ google-dynamic-circle-map -------');
                    console.log(data);
                    var colors = [];
                    if ($scope.markersByHour.length > 1) {
                        for (var i = 0; i < $scope.markersByHour.length; i++) {
                            var inns = $scope.markersByHour[i];
                            for (var j = 0; j < inns.length; j++) {
                                inns[j].setMap(null);
                            }
                        }
                    } else {
                        for (var i = 0; i < 60; ++i) {
                            $scope.markersByHour.push([]);
                        }
                    }
                    var nextStore = 0;
                    var prevhour = 0;
                    var hour = 1;
                    var minute = 0;

                    function addStore(coords, hour, minute) {
                        var location = new google.maps.LatLng(coords[0], coords[1]);

                        var outer = new google.maps.Marker({
                            position: location,
                            clickable: false,
                            icon: {
                                path: google.maps.SymbolPath.CIRCLE,
                                fillOpacity: 0.5,
                                fillColor: colors[0],
                                strokeOpacity: 1.0,
                                strokeColor: colors[0],
                                strokeWeight: 1.0,
                                scale: 0,
                            },
                            optimized: false,
                            zIndex: hour,
                            map: $scope.map
                        });

                        var inner = new google.maps.Marker({
                            position: location,
                            clickable: false,
                            icon: {
                                path: google.maps.SymbolPath.CIRCLE,
                                fillOpacity: 1.0,
                                fillColor: colors[0],
                                strokeWeight: 0,
                                scale: 0
                            },
                            optimized: false,
                            zIndex: hour
                        });
                        inner.hour = hour;
                        console.log(hour + ":" + minute);
                        $scope.markersByHour[minute].push(inner);

                        for (var i = 0; i <= 10; i++) {
                            $timeout(setScale(inner, outer, i / 10), i * 60);
                        }
                    }

                    function fillColorArray() {
                        var max = 198;
                        for (var i = 0; i < 44; i++) {
                            if (i < 11) { // red to yellow
                                r = max;
                                g = Math.floor(i * (max / 11));
                                b = 0;
                            } else if (i < 22) { // yellow to green
                                r = Math.floor((22 - i) * (max / 11));
                                g = max;
                                b = 0;
                            } else if (i < 33) { // green to cyan
                                r = 0;
                                g = max;
                                b = Math.floor((i - 22) * (max / 11));
                            } else { // cyan to blue
                                r = 0;
                                g = Math.floor((44 - i) * (max / 11));
                                b = max;
                            }
                            colors[i] = 'rgb(' + r + ',' + g + ',' + b + ')';
                        }
                    }

                    fillColorArray();
                    function setScale(inner, outer, scale) {
                        return function () {
                            if (scale == 1) {
                                outer.setMap(null);
                            } else {
                                var icono = outer.get('icon');
                                icono.strokeOpacity = Math.cos((Math.PI / 2) * scale);
                                icono.fillOpacity = icono.strokeOpacity * 0.5;
                                icono.scale = Math.sin((Math.PI / 2) * scale) * 15;
                                outer.set('icon', icono);

                                var iconi = inner.get('icon');
                                var newScale = (icono.scale < 2.0 ? 0.0 : 2.0);
                                if (iconi.scale != newScale) {
                                    iconi.scale = newScale;
                                    inner.set('icon', iconi);
                                    if (!inner.getMap()) inner.setMap($scope.map);
                                }
                            }
                        }
                    }

                    $scope.hourstr = "00";
                    $scope.minutestr = "00";
                    function nextHour() {
                        console.log('-------------nextHour ------------------' + (nextStore < data.data.length))
                        // while(data.data[nextStore].y <= hour && data.data[nextStore].y2 <= minute){
                        while (nextStore < data.data.length - 1 && parseInt(data.data[nextStore].y) <= prevhour && parseInt(data.data[nextStore].y2) <= minute) {
                            addStore([data.data[nextStore].x, data.data[nextStore].x2], prevhour, minute);
                            nextStore++;
                        }
                        updateColors(hour, minute);
                        // console.log(prevhour + ":" + minute);
                        if (nextStore < data.data.length - 1) {
                            if (prevhour < parseInt(data.data[nextStore].y)) {
                                minute = 0;
                                // prevhour ++;
                                prevhour = parseInt(data.data[nextStore].y);
                                $scope.hourstr = (prevhour < 10 ? '0' + prevhour : prevhour);
                                $scope.minutestr = '00';
                            } else {
                                // minute++;
                                minute = parseInt(data.data[nextStore].y2);
                                $scope.minutestr = minute + '0';
                            }
                            $timeout(function () {
                                nextHour();
                                $scope.isRendering = true;
                            }, 160);
                        } else {
                            $timeout(function () {
                                $scope.isRendering = false;
                            }, 100);
                            console.log('-------------nextHour rendering is false ------------------' + $scope.isRendering)
                        }
                    }

                    function updateColors(hour, minute) {
                        console.log(' --- updateColors ----- ');
                        console.log(minute);
                        var markers = $scope.markersByHour[minute];
                        for (var i = 0, I = markers.length; i < I; ++i) {
                            var inner = markers[i];
                            var age = hour - inner.hour;
                            if (age % 2) {
                                var icon = inner.get('icon');
                                icon.fillColor = colors[age];
                                inner.notify('icon');
                            }
                        }
                    }

                    $timeout(function () {
                        nextHour();
                    }, 1000);
                }

            } else {
                console.log(' ********** Error ********** ');
                console.log(JSON.stringify(obj));
            }
            $timeout(function () {
                $scope.isRendering = false;
                $scope.isLoading = false;
            }, 700);

        }
    }
}])

.controller('MapViewerViewController', ['$log', '$window','$timeout', '$location','$scope','$routeParams', '$filter', '$appDataSet', '$appMenus','$appTemplates','$appQuery', '$appUser', '$appDesc', '$dashboardService', '$chartviewerService', '$mapviewer','$waveurl','d3Formatter','$mapctrlcommon',
    function($log, $window, $timeout, $location, $scope, $routeParams, $filter, $dataset, $menu, $templates, $query, $user, $desc, $dashboard, $chartviewer, $mapviewer, $waveurl, d3Formatter,$mapctrlcommon){
    $scope.datasets    = [];
    $scope.wheremenus = [];
    $scope.selectmenus = [];
    $scope.templates = [];
    $scope.user = $user.isLogined().user;
    $scope.selectedDate = {startDate:'',endDate:''}
    $scope.kek = '1';
    $scope.logout = function(){
        console.log('MapViewerViewController logout...');
        if($user.logout()){
            $location.path('/login');
        }
    }
    $scope.widgetTitle2 = "Metrics & Filters";
    $scope.menus = [];
    $scope.leftMenus = function(){
        var promise = $dashboard.getMenus();
        promise.then(function(data){
            $scope.menus = JSON.parse(data[0].m1);
            $log.log('----$scope.printMenus-----');
            $timeout(function(){
                $window.initApp.SmartActions();
                $window.initApp.leftNav();
                $log.log($window.initApp);
            }, 300);
        });
    };
    $scope.leftMenus();
    $scope.leftMove = function(url){
        $log.log('move to >>' + url + '<<');
        $location.path(url);
    }

    $scope.description = {};
    $scope.printDesc = function(sqlid){
        var promise = $desc.get(sqlid);
        promise.then(function(data){
            data.forEach(function(d){
                $scope.description[d.types] = _.isNull(d.descs) ? '' : d.descs.replace(/,,/g,' or ');
            });
        });
        $log.log($scope.description);
    }

    $scope.printDataSet = function(){
        var promise = $dataset.get();
        promise.then(function(data){
            $scope.datasets = data;
            $log.log("$scope.datasets  length is " + $scope.datasets.length);
        });

    }

    $scope.setSelectedDate = function(date, type){
        function parse(str) {
            if(!/^(\d){8}$/.test(str)) return "invalid date";
            var y = str.substr(0,4),
                m = parseInt(str.substr(4,2) -1),
                d = str.substr(6,2);
            return new Date(y,m,d);
        };
        function zeroLpad(d){
            return d < 10? '0'+d : d;
        }
        function isoString(date){
            return date.getFullYear()+'-'+zeroLpad(parseInt(date.getMonth())+1)+'-'+zeroLpad(parseInt(date.getDate()));
        };
        $log.log('..... start setSelectedDate .....' + date + ':' + type);

        if(type == 1){
            if(date instanceof Date){ // $filter('date')(sdt, 'yyyyMMdd')
                $scope.selectedDate.startDate = $filter('date')(date,'yyyy-MM-dd');
            }else {
                if (date.indexOf("-") < 0)
                    $scope.selectedDate.startDate = isoString(parse(date));
                else
                    $scope.selectedDate.startDate = isoString((new Date(date)));
            }
        }else{
            if(date instanceof Date){
                $scope.selectedDate.endDate = $filter('date')(date,'yyyy-MM-dd');
            }else {
                if (date.indexOf("-") < 0)
                    $scope.selectedDate.endDate = isoString(parse(date));
                else
                    $scope.selectedDate.endDate = isoString((new Date(date)));
            } //$scope.selectedDate.endDate = parse(date);
        }
        $log.log($scope.selectedDate);
    }

    $scope.defaultSelectDate = function(){
        var today = new Date();

        var edday = new Date();
        var stday = new Date(today.setMonth(today.getMonth() - 3));
        console.log(new Date(stday));
        $scope.setSelectedDate(stday, 1);
        $scope.setSelectedDate(edday, 2);
        //$scope.selectedDate.startDate = today.setMonth(today.getMonth() - 3);
        //$scope.selectedDate.endDate = new Date();
    }
    $scope.defaultSelectDate();


    $scope.$watch('selectedDate',function(){
        $log.log('==== startDate Watch =====')
        $log.log($scope.selectedDate.startDate);
        $log.log($scope.selectedDate.endDate);
    });


    $scope.printMenus = function(sqlid){
        $log.log('------------- $scope.printMenus ------------ ');
        $log.log(sqlid);
        var p2 = $chartviewer.getSelectMenu([], '/'+sqlid);
        p2.then(function(datas){
            $scope.selectmenus = datas || [];
        });
        var p3 = $chartviewer.getWhereMenu([], '/'+sqlid);
        p3.then(function(dataw){
            $log.log('------------- $scope.printMenus dataw result ------------ ');
            $log.log(dataw);
            $log.log(dataw[0].json_str);
            var cont;
            cont = dataw[0] && dataw[0].json_str ? dataw[0].json_str.replace(/\\/g,'\\\\') : '[]';
            $log.log(JSON.parse(cont));
            $scope.wheremenus = JSON.parse(cont) || [];
            $timeout(function(){
                $window.pageSetUp();
                // PAGE RELATED SCRIPTS
                $('.tree > ul').attr('role', 'tree').find('ul').attr('role', 'group');
                $('.tree').find('li:has(ul)').addClass('parent_li').attr('role', 'treeitem').find(' > span').attr('title', 'Collapse this branch').on('click', function(e) {
                    var children = $(this).parent('li.parent_li').find(' > ul > li');
                    if (children.is(':visible')) {
                        children.hide('fast');
                        $(this).attr('title', 'Expand this branch').find(' > i').removeClass().addClass('fa fa-lg fa-plus-circle');
                    } else {
                        children.show('fast');
                        $(this).attr('title', 'Collapse this branch').find(' > i').removeClass().addClass('fa fa-lg fa-minus-circle');
                    }
                    e.stopPropagation();
                });
            }, 10);
        });
    }
    $scope.sqlid = $routeParams.sqlid;
    $scope.printMenus($scope.sqlid);
    $scope.printDesc($scope.sqlid);
    $scope.printDataSet();

    // # datatype is  [ {'whid':1, 'colvals':[1,2,3], 'coltype':'', 'operand':''}, {'whid':2, 'colvals':[4,5], 'coltype':'', 'operand':''}, {'whid':3, 'colvals':['20130927','20130930'], 'coltype':'', 'operand':''}]
    //	$scope.selectedSelect = -1;
    $scope.selectedwheres = [];
    $scope.selectedTemplate = {};
    $scope.selectedTemplate.tmplid = -1;
    $scope.isShowColor = false;
    $scope.colorOption = {
        formatResult: function(query){
                var markup = "<div style='background:"+query.color+"'>"+query.color+"</div>"
                return markup;
        },
        formatSelection : function(query){
            $scope.selectedColor = query.color;
            var markup = "<div style='background:"+query.color+"'>"+query.color+"</div>"
            return markup;
            // return query.color;
        },
        id: function(query){return {id: query.tmplid};},
        onLoad: function(select2){
            $scope.select2 = select2;
        },
        escapeMarkup: function(m) { return m; },
        query: function(query){
            var data = [{color:'#3399FF'}, {color:'#FF0000'},{color:'#9900CC'}, {color:'#ACD13E'}, {color:'#997ECC'}, {color:'#00B8E6'}, {color:'#E68A2E'},{color:'#00FFFF'},{color:'#009933'},{color:'#3333FF'},{color:'#FFFFFF'}, {color:'#000000'} , {color:'#FF00FF'} ,{color:'#993333'}, {color:'#FFFF00'}, {color:'#0099FF'}, {color:'#FF5050'} ];
            query.callback({results:data, more:false});
        }
    };


    $scope.printTemplates = function(sqlid, selid){
        $scope.isShowColor = false;
        var promise = $templates.get(sqlid, selid);
        promise.then(function(data){
            $scope.templates = JSON.parse(data[0].tmpls);
        });
    }
    $scope.selectedSelect = 0;


    $scope.setSelectMenus = function(menuid){
        var toggleSelectMenu = function(menuid){
            for(i in $scope.selectmenus){
                if($scope.selectmenus[i].id == menuid){
                    $scope.selectmenus[i].checked = true;
                    $scope.selectedSelect = menuid;
                    angular.forEach($scope.tags, function(tag, idx){
                        $log.log('tag:' + tag + ' idx:' +idx);
                        if(tag.type == 'metric'){
                            $scope.tags.splice(idx, 1);
                        }
                    });
                    $scope.addTag('metric',$scope.selectmenus[i].id, $scope.selectmenus[i].nm);
                }
            }
        }
        toggleSelectMenu(menuid);
        $scope.printTemplates($scope.sqlid, menuid);
    }

    var putWhereChild = function(parent, child){
        var isPexists = false;
        for(i in $scope.selectedwheres){
            if($scope.selectedwheres[i].whid == parent.id){
                isPexists = true;
                if(!$scope.selectedwheres[i].colvals)  $scope.selectedwheres[i].colvals = []
                else{
                    $scope.selectedwheres[i].colvals.push(child.id);
                    $scope.selectedwheres[i].colvals = _.uniq($scope.selectedwheres[i].colvals);
                }
            }
        }
        if(!isPexists) $scope.selectedwheres.push({whid:parent.id, colvals:[child.id], coltype:'', operand:''});
    }

    var delWhereChild = function(parent, child){
        for(i in $scope.selectedwheres){
            if($scope.selectedwheres[i].whid == parent.id){
                $scope.selectedwheres[i].colvals = $scope.selectedwheres[i].colvals.filter(function(i){
                    return i!=child.id;
                })
            }
        }
    }


    $scope.setWhereMenus = function(parent, child){
        for(var i=0;i<$scope.wheremenus.length;i++){
            if(parent.id == $scope.wheremenus[i].id){
                for(j in $scope.wheremenus[i].sub){
                    if(child.id == $scope.wheremenus[i].sub[j].id){
                        $scope.wheremenus[i].sub[j].checked = !$scope.wheremenus[i].sub[j].checked;
                        if($scope.wheremenus[i].sub[j].checked){
                            $scope.addTag('filter', child.id, child.nm);
                        }else{
                            $scope.removeTag(child.id);
                        }
                    }
                }
            }
        }

        for(var i=0;i < $scope.wheremenus.length;i++) {
            for (var j = 0; j < $scope.wheremenus[i].sub.length; j++) {
                if ($scope.wheremenus[i].sub[j].checked)
                    putWhereChild($scope.wheremenus[i], $scope.wheremenus[i].sub[j]);
                else
                    delWhereChild($scope.wheremenus[i], $scope.wheremenus[i].sub[j]);
            }
        }
    } // end of $scope.setWhereMenus = function(parent, child){

    //$scope.setTemplates = function(value){
    //	//$scope.selectedTemplate.tmplid  = value;
    //	console.log('$scope.setTemplates result is ' + $scope.selectedTemplate.tmplid + ':' + value);
    //	if($scope.selectedTemplate.tmplid == 52){
    //		$scope.isShowColor = true;
    //	}else{
    //		$scope.isShowColor = false;
    //	}
    //	return $scope.selectedTemplate.tmplid;
    //}

    $scope.$watch('selectedTemplate', function(){
        if($scope.selectedTemplate.tmplid != -1)
            $scope.showDrawBtn = true;

        if($scope.selectedTemplate.tmplid == 52){
            $scope.isShowColor = true;
        }else{
            $scope.isShowColor = false;
        }
    });


    $scope.changeZoom = function(zoom){
        console.log('$scope.changeMapZoom_googleHeatMap = function(zoom){');
    }

    $scope.tags = [];
    $scope.addTag = function(type, id, name){
        $log.log('addTag : [' + type  + ':' + id + ':' + name + ']');
        $scope.tags.push({'type':type, 'id':id, 'name':name});
    }
    $scope.removeTag = function(id){
        $log.log('removeTag : [' + id + ']');
        angular.forEach($scope.tags, function(tag, idx){
            $log.log('tag:' + tag + ' idx:' +idx);
            if(tag.id == id){
                $scope.tags.splice(idx, 1);
            }
        });
    }


    /************************************************************************************/
    /* for map */
    /************************************************************************************/
    $scope.running = false;

    var zoom = 12, center =  new google.maps.LatLng(37.49123340516455, 127.00850596301275);
    var dmapType = google.maps.MapTypeId.ROADMAP;

    $scope.changeMapType = function(type){
        if(type == 'TERRAIN'){
            $scope.map.setMapTypeId(google.maps.MapTypeId.TERRAIN);
        }else if(type == 'ROADMAP'){
            $scope.map.setMapTypeId(google.maps.MapTypeId.ROADMAP);
        }else if(type == 'SATELLITE'){
            $scope.map.setMapTypeId(google.maps.MapTypeId.SATELLITE);
        }else if(type == 'HYBRID'){
            $scope.map.setMapTypeId(google.maps.MapTypeId.HYBRID);
        }

    }

    $scope.mapOptions = {
        zoom:zoom,
        center:center,
        scrollwheel:false,
        mapTypeControl: true,
        mapTypeControlOptions: {
          style: google.maps.MapTypeControlStyle.DROPDOWN_MENU
        },
        zoomControl: true,
        zoomControlOptions: {
          style: google.maps.ZoomControlStyle.SMALL
        },
        mapTypeId: google.maps.MapTypeId.ROADMAP
    }

    // get map from directive
    $scope.mapOptions.onLoad = function(map){
        $scope.map = map;
        //console.log($scope.map);
    }

    $scope.getMapBounds = function(){
        if($scope.map){
            var bounds = $scope.map.getBounds();
            return bounds.toUrlValue();
        }
    }

    $scope.isRendering = false;
    $scope.template_list = [
        {'tmplid':49    ,'tmplnm':'Heat Map','filepath':'google-heat-map'},
        {'tmplid':50    ,'tmplnm':'Label Map','filepath':'google-label-map'},
        {'tmplid':51    ,'tmplnm':'Marker Map','filepath':'google-marker-map'},
        {'tmplid':52    ,'tmplnm':'Circle Map','filepath':'google-circle-map'},
        {'tmplid':53    ,'tmplnm':'Dot Map','filepath':'google-dot-map'},
        {'tmplid':56    ,'tmplnm':'Dynamic Circle Map','filepath':'google-dynamic-circle-map'}
    ];
    $scope.findTemplate = function(id){

        for(var i=0;i<$scope.template_list.length;i++){
            if($scope.template_list[i].tmplid == id){
                return $scope.template_list[i].filepath;
            }
        }

    }

    $scope.clearLayerAll = function(){
        $scope.mapboarditem_id = 0;
        $log.log('start Clear All Layer!!!! size [' + $scope.mapboarditem_list.length + ']');
        for(var i=0;i<$scope.mapboarditem_list.length;i++){
            $scope.clearLayer($scope.mapboarditem_list[i].id);
        }
        $scope.mapboarditem_list.splice(0,$scope.mapboarditem_list.length);
    };

    $scope.mapboarditem_list = [];
    $scope.mapboarditem_id = 0;

    $scope.drawMap = function(){
        var sdt,edt;
        var today = new Date();

        angular.forEach($scope.tags, function(tag, idx){
            $log.log('tag:' + tag + ' idx:' +idx);
            if(tag.type == 'template'){
                $scope.tags.splice(idx, 1);
            }
        });
        $scope.addTag('template', $scope.selectedTemplate.tmplid, $scope.selectedTemplate.tmplnm + ' '  + (angular.isDefined($scope.selectedColor)?$scope.selectedColor:"") );

        var sdt = $scope.selectedDate.startDate ? new Date($scope.selectedDate.startDate):today.setMonth(today.getMonth() - 3);
        var edt = $scope.selectedDate.endDate ? new Date($scope.selectedDate.endDate):new Date();

        //var promise = $query.get($routeParams.sqlid, $scope.selectedSelect,
        //	$scope.selectedTemplate.tmplid, $scope.selectedwheres,
        //	$filter('date')(sdt, 'yyyyMMdd') , $filter('date')(edt, 'yyyyMMdd') );
        var sqlid =  $routeParams.sqlid,
            selid =  $scope.selectedSelect,
            tmplid = $scope.selectedTemplate.tmplid,
            whvalid = $scope.selectedwheres;
        var sDt = $filter('date')(sdt, 'yyyyMMdd'),
            eDt = $filter('date')(edt, 'yyyyMMdd');
        var executeUrl = '/api/v1.0/mapviewer/execute/sqlid/'+sqlid+'/selid/'+selid+'/tmplid/'+tmplid+'?whvalid=' + JSON.stringify(whvalid) + '&sdt=' + sDt + '&edt='+ eDt;
        $scope.mapboarditem_id ++;
        var description = [];
        //$scope.tags.push({'type':type, 'id':id, 'name':name});
        angular.forEach($scope.tags, function(tag){
            description.push(tag.type + ': ' + tag.name);
        });
        $scope.mapboarditem_list.push({id:'layer_'+$scope.mapboarditem_id, url:executeUrl, colors:$scope.selectedColor, desc:description.join(",")});
    }

    $scope.$watch(function(){
        return JSON.stringify($scope.mapboarditem_list);
    }, function(value){ $timeout(function() {
            $scope.render(value);
        }, 100)
    });

    $scope.curmetrics = [];

    $scope.render = function(){

        $scope.curmetrics.splice(0, $scope.curmetrics.length);
        angular.forEach($scope.mapboarditem_list, function(item){
            $scope.curmetrics.push({'desc':item.desc});
        });
        $scope.circleCnt = 0;
        //console.log('$scope.render ==> ' + JSON.stringify($scope.mapboarditem_list));
        angular.forEach($scope.mapboarditem_list, function(v){
            var dtrx = /tmplid\/(\d)+/g
            // console.log(v);
            //console.log(v.url.match(dtrx)[0].replace('tmplid/',''));
            var tmpl_filepath = $scope.findTemplate(v.url.match(dtrx)[0].replace('tmplid/',''));
            //console.log(tmpl_filepath);
            $scope.isRendering = true;
            if(v.query){
                //console.log('******** if v.query *********');
                //console.log(v);
                var q = {};
                q.query = v.query;
                q.bounds = $scope.getMapBounds();

                q.roundlevel = $mapctrlcommon.getRoundfromZooms($scope,tmpl_filepath);
                q.template = tmpl_filepath;

                var p = $mapviewer.executeDirectQuery(q, '');
                p.then(function(data){
                    var obj = {};
                    obj.data = data.resvalue; // value
                    obj.template = tmpl_filepath; // d3-pie
                    obj.query = data.query;
                    v.query = data.query;
                    obj.id = v.id;
                    obj.title = v.title;
                    obj.colors = v.colors;

                    $mapctrlcommon.drawLayer($scope, obj);
                }, function(error){

                    $timeout(function(){ $scope.isRendering = false; },500);
                });

            }else{
                //console.log('******** else v.query *********');
                //console.log(JSON.stringify(v));
                //console.log(v.title);
                //console.log('v.template is ' + tmpl_filepath);
                var a_url;
                if($scope.isBoundaryPaging)
                    a_url = v.url + '&bounds=' + $scope.getMapBounds() + '&roundlevel=' + $mapctrlcommon.getRoundfromZooms($scope,tmpl_filepath);
                else
                    a_url = v.url;
                console.log('------------ map url --------------');
                console.log($scope.isBoundaryPaging);
                console.log(a_url);
                console.log('------------ map url --------------');
                var p = $mapviewer.execute($waveurl.get(a_url));
                p.then(function(data){
                    var obj = {};
                    obj.id = v.id;
                    obj.title = v.title;
                    obj.data = data.resvalue; // value
                    obj.template = data.template; // d3-pie
                    obj.query = data.query;
                    v.query = data.query;
                    v.template = data.template;

                    obj.colors = v.colors;
                    $mapctrlcommon.drawLayer($scope, obj);
                }, function(error){
                    //console.log(error);
                    $timeout(function(){ $scope.isRendering = false; },500);
                });
            }
            // }
        });
    }

    $scope.layers = [];
    $scope.hours = '';

    $timeout(function() {
        google.maps.event.addListener($scope.map, 'center_changed', function() {
            google.maps.event.addListener($scope.map,"bounds_changed",function() {
                console.log('bounds_changed and center_changed ' + $scope.isRendering);
                if(!$scope.isRendering && $scope.isBoundaryPaging){
                    console.log('map zoom level is ' + $scope.map.getZoom());
                    console.log('map center is ' + $scope.map.getCenter());
                    $scope.isRendering = true;
                    try{ $scope.render(); }catch(e){console.log(e);}
                }
            });
        });

        google.maps.event.addListener($scope.map, 'zoom_changed', function() {
            // console.log('zoom_changed ' + $scope.isRendering);
            if(!$scope.isRendering){
                console.log('map zoom level is ' + $scope.map.getZoom());
                console.log('map center is ' + $scope.map.getCenter());
                $scope.isRendering = true;
                try{ $scope.render(); }catch(e){console.log(e);}
            }
        });
    }, 300);


    $scope.clearLayer = function(id){
        //$scope.mapboarditem_id = 0;
        for(var i=0;i<$scope.layers[id].length;i++){
            if(angular.isDefined($scope.layers[id][i]['map']))
                $scope.layers[id][i]['map'].setMap(null);
            if(angular.isDefined($scope.layers[id][i]['info']))
                $scope.layers[id][i]['info'].setMap(null);
        }
        $scope.layers[id] = [];
    }

    $scope.circleCnt = 0;

    $scope.markersByHour = [];


    $scope.isBoundaryPaging = true;
    $scope.isWetherLayer =  false;
    $scope.isTransitLayer =  false;
    $scope.isTrafficLayer =  false;
    $scope.isPanoramioLayer = false;
    $scope.isStreetViewLayer = false;

    // $timeout(function(){

    var weatherLayer = new google.maps.weather.WeatherLayer({
        temperatureUnits: google.maps.weather.TemperatureUnit.FAHRENHEIT
    });

    $scope.showWetherLayer = function(){
        //console.log('showWetherLayer is ' + $scope.isWetherLayer);
        $scope.isWetherLayer = !$scope.isWetherLayer;

        if($scope.isWetherLayer){
            weatherLayer.setMap($scope.map);
        }else{
            weatherLayer.setMap(null);
        }
    }



    var transitLayer = new google.maps.TransitLayer();
    $scope.showTransitLayer = function(){
        //console.log('showTransitLayer is ' + $scope.isTransitLayer);
        $scope.isTransitLayer = !$scope.isTransitLayer;
        if($scope.isTransitLayer){
            transitLayer.setMap($scope.map);
        }else{
            transitLayer.setMap(null);
        }
    }

    // $scope.isTrafficLayer =  false;
    var trafficLayer = new google.maps.TrafficLayer();
    $scope.showTrafficLayer = function(){
        //console.log('showTrafficLayer is ' + $scope.isTrafficLayer);
        $scope.isTrafficLayer = !$scope.isTrafficLayer;
        if($scope.isTrafficLayer){
            trafficLayer.setMap($scope.map);
        }else{
            trafficLayer.setMap(null);
        }
    }

    // $scope.isStreetViewLayer =  false;


    var panoramioLayer = new google.maps.panoramio.PanoramioLayer();
    // panoramioLayer.setMap(map);
    $scope.showPanoramioLayer = function(){
        $scope.isPanoramioLayer = !$scope.isPanoramioLayer;
            // var photoPanel = document.createElement('ul');
        if($scope.isPanoramioLayer){
            panoramioLayer.setMap($scope.map);

              // $scope.map.controls[google.maps.ControlPosition.RIGHT_TOP].push(photoPanel);

              google.maps.event.addListener(panoramioLayer, 'click', function(photo) {
                var li = document.createElement('li');
                var link = document.createElement('a');
                link.innerHTML = photo.featureDetails.title + ': ' +
                    photo.featureDetails.author;
                link.setAttribute('href', photo.featureDetails.url);
                li.appendChild(link);
                // photoPanel.appendChild(li);
                // photoPanel.style.display = 'block';
              });

        }else{
            // photoPanel.style.display = 'hidden';
            panoramioLayer.setMap(null);
        }
    }

    // }, 500);
    // $timeout(function(){
    // 	$scope.showPanoramioLayer();
    // 	$scope.showTrafficLayer();
    // 	$scope.showTransitLayer();
    // 	$scope.showWetherLayer();


    // }, 1000);

    $scope.isPanoShow = false;
    $scope.streetview = {};
    $scope.streetview.markers = [];
    // left:410px; top: 8px; width: 400px; height: 300px;
    $scope.streetview.pano = document.getElementById('pano');
    $scope.streetview.pano.style.width = '400px';
    $scope.streetview.pano.style.height = '300px';
    $scope.streetview.pano.style.top = '8px';
    $scope.streetview.pano.style.left = '8px';
    $scope.streetview.pano.style.display = 'none';

    $scope.showStreetViewLayer = function(){

        $scope.isStreetViewLayer = !$scope.isStreetViewLayer;
        fenway = center;
        if($scope.isStreetViewLayer){
            $scope.isPanoShow = $scope.isStreetViewLayer;
            var panoramaOptions = {
                position: fenway,
                pov: {
                    heading: 34,
                    pitch: 10
                }
            };


            $scope.streetview.panorama = new  google.maps.StreetViewPanorama(pano,panoramaOptions);
            $scope.streetview.sv = new google.maps.StreetViewService();
            $scope.map.setStreetView($scope.streetview.panorama);
            $scope.streetview.pano.style.display = 'block';

            function processSVData(data, status) {
                if (status == google.maps.StreetViewStatus.OK) {
                    var marker = new google.maps.Marker({
                        position: data.location.latLng,
                        zIndex:999,
                        map: $scope.map,
                        title: data.location.description
                    });
                    $scope.streetview.markers.push(marker);

                    $scope.streetview.panorama.setPano(data.location.pano);
                    $scope.streetview.panorama.setPov({
                        heading: 270,
                        pitch: 0
                    });
                    $scope.streetview.panorama.setVisible(true);

                    google.maps.event.addListener(marker, 'click', function() {

                        var markerPanoID = data.location.pano;
                        // Set the Pano to use the passed panoID
                        $scope.streetview.panorama.setPano(markerPanoID);
                        $scope.streetview.panorama.setPov({
                            heading: 270,
                            pitch: 0
                        });
                        $scope.streetview.panorama.setVisible(true);
                    });
                } else {
                    alert('Street View data not found for this location.');
                }
            }

            google.maps.event.addListener($scope.map, 'click', function(event) {
              $scope.streetview.sv.getPanoramaByLocation(event.latLng, 50, processSVData);
          });

        }else{
            google.maps.event.clearListeners($scope.map, 'click');
            $scope.map.setStreetView(null);
            angular.forEach($scope.streetview.markers, function(marker){
                marker.setMap(null);
            });
            $scope.map.getStreetView().setVisible(false);
            $scope.streetview.pano.style.display = 'none';
        }
    }


}])

.controller('MapBoardViewController', ['$log', '$window','$timeout', '$location','$scope','$routeParams', '$filter', '$appDataSet', '$appMenus','$appTemplates','$appQuery', '$appUser', '$appDesc', '$dashboardService', '$chartviewerService', '$mapviewer','$waveurl','d3Formatter','$mapctrlcommon','$mapboard','$mapboardItem','$modal',
    function($log, $window, $timeout, $location, $scope, $routeParams, $filter, $dataset, $menu, $templates, $query, $user, $desc, $dashboard, $chartviewer, $mapviewer, $waveurl, d3Formatter,$mapctrlcommon,$mapboard, $mapboardItem, $modal){
    $log.log('MapBoardViewController');
    $scope.logout = function(){
        console.log('MapBoardViewController logout...');
        if($user.logout()){
            $location.path('/login');
        }
    }
    $scope.widgetTitle2 = "Metrics & Filters";
    $scope.menus = [];
    $scope.leftMenus = function(){
        var promise = $dashboard.getMenus();
        promise.then(function(data){
            $scope.menus = JSON.parse(data[0].m1);
            $log.log('----$scope.printMenus-----');
            $timeout(function(){
                $window.pageSetUp();
                $window.initApp.SmartActions();
                $window.initApp.leftNav();
                $log.log($window.initApp);
            }, 300);
        });
    };
    $scope.leftMenus();
    $scope.leftMove = function(url){
        $log.log('move to >>' + url + '<<');
        $location.path(url);
    }

    $scope.map = {};
    $scope.mapboard_id = $routeParams.mapboard_id;

    $scope.mapboard_list = [];
    $scope.mapboarditem_list = []; // not refined raw data...
    $scope.mapboarditems = []; // refined data to display in d3 directive
    $scope.editedItem = {};
    $scope.editedItem.mapboard = {};
    var p = $mapboard.get([],'');
    p.then(function(data){
        $scope.mapboard_list = data;
    });

    var pv = $mapboard.view([],'/'+$scope.mapboard_id);
    pv.then(function(data){
        if(data && data.length){
            $scope.mapboard_title = data[0].title;
            $scope.mapboard_desc = data[0].desc;
        }
    });

    var p2 = $mapboardItem.get([], '/'+$scope.mapboard_id);
    p2.then(function(data){
        $scope.mapboarditem_list = data;
    });


    $scope.editedItem.mapboardItem = {};
    $scope.editedItem.mapboardItem.selid = '';
    $scope.editedItem.mapboardItem.sqlid = '';
    $scope.editedItem.mapboardItem.tmplid = '';

    $scope.editedItem.mapboardItem.dateOptions = {
        'year-format': "'yyyy'",
        'starting-day': 1,
        'show-weeks':false
    };
    $scope.editedItem.mapboardItem.format  = 'yyyyMMdd';
    $scope.editedItem.mapboardItem.startDate = {};
    $scope.editedItem.mapboardItem.endDate = {};
    $scope.editedItem.mapboardItem.endDate.opened = false;
    $scope.editedItem.mapboardItem.startDate.opened = false;
    $scope.editedItem.mapboardItem.endDate.value = new Date();
    $scope.editedItem.mapboardItem.startDate.value = new Date();


    $scope.configMapboard = function(){
        $scope.editedItem.mapboardItem.datasetOption = {
            placeholder: "Pick up a Query",
            allowClear: true,
            formatResult: function(query){
                var markup = "<div ='.well'><h5>"+query.sqlid+"."+query.sqlnm+"</h5><p class='pink'>"+query.sqldesc+"</p><code>"+(query.sqlstmt.substring(0,70)+"...")+"</code></div>"
                return markup;
            },
            formatSelection: function(query){
                //console.log(query);
                $scope.editedItem.mapboardItem.sqlid = query.sqlid;
                return query.sqlid + '_' + query.sqlnm;
            },
            id: function(query){return {id: query.sqlid};},
            // dropdownCssClass: "bigdrop",
            query: function (query) {
                //console.log('$scope.editedItem.mapboardItem.datasetOption query started...')
                var p = $mapboard.getQueryListforMap();
                p.then(function(data){
                    //console.log(data);
                    query.callback({results:data, more:false});
                });
            },
            change: function(select2, element){
                element.on("change", function(e){
                    //console.log('change event occurred.... ' + e.val);
                    $scope.editedItem.mapboardItem.sqlid = e.val;
                    $scope.editedItem.mapboardItem.showMenus = true;
                });
            },
            escapeMarkup: function(m){ return m;}
        };


        $scope.editedItem.mapboardItem.selectOption = {
            formatResult: function(query){
                return query.id + " / " + query.nm;
            },
            formatSelection : function(query){
                $scope.editedItem.mapboardItem.selid = query.id;
                $scope.editedItem.mapboardItem.selnm = query.nm;
                return query.id + " / " + query.nm;
            },
            onLoad: function(select2){
                $scope.editedItem.mapboardItem.selectOption.select2 = select2;
            },
            id: function(query){return {id: query.id};},
            escapeMarkup: function(m) { return m; },
            query: function(query){
                var p = $chartviewer.getSelectMenu([], '/'+$scope.editedItem.mapboardItem.sqlid);
                p.then(function(data){
                    //var mm = $scope.editedItem.mapboardItem.remakeData(data);
                    query.callback({results:data, more:false});
                });

            },
            change: function(select2, element){
                element.on("change", function(e){
                    $scope.editedItem.mapboardItem.selid = e.val;
                });
            }
        };

        $scope.editedItem.arrWhereValue = [];
        $scope.editedItem.setWhereValue = function(id){
            $scope.editedItem.arrWhereValue.push(id);
            $scope.editedItem.arrWhereValue = _.uniq($scope.editedItem.arrWhereValue);
        }
        $scope.editedItem.mapboardItem.whereOption = {
            multiple: true,
            formatResult: function(query){
                return query.id + " / " + query.nm;
            },
            formatSelection : function(query){
                $scope.editedItem.setWhereValue(query.id);

                return query.id + " / " + query.nm;
            },
            onLoad: function(select2){
                if(angular.isDefined(select2))
                    $scope.editedItem.mapboardItem.whereOption.select2 = select2;
                return select2;
            },
            query: function(query){
                var p = $chartviewer.getWhereMenu([], '/'+$scope.editedItem.mapboardItem.sqlid);
                p.then(function(data){
                    var result = {results:[]}
                    //console.log(data);
                    try{
                        query.callback(JSON.parse(data["jsonstr"]));
                    }catch(err){
                        console.log(err.mesage);
                    }

                });
            }
        };

        $scope.editedItem.mapboardItem.templateOption = {
            formatResult: function(query){
                    return query.tmplid + "_" + query.tmplnm;
            },
            formatSelection : function(query){
                $scope.editedItem.mapboardItem.tmplid = query.tmplid;
                $scope.editedItem.mapboardItem.tmplnm = query.tmplnm
                return query.tmplid + "_" + query.tmplnm;
            },
            id: function(query){return {id: query.tmplid};},
            onLoad: function(select2){
                $scope.editedItem.mapboardItem.templateOption.select2 = select2;
            },
            escapeMarkup: function(m) { return m; },
            query: function(query){

                var p = $mapboard.getTemplates();
                p.then(function(data){
                    // $scope.template_list = data;
                    query.callback({results:data, more:false});
                });

            }
        }
        $scope.template_list = [
            {'tmplid':49    ,'tmplnm':'Heat Map','filepath':'google-heat-map'},
            {'tmplid':50    ,'tmplnm':'Label Map','filepath':'google-label-map'},
            {'tmplid':51    ,'tmplnm':'Marker Map','filepath':'google-marker-map'},
            {'tmplid':52    ,'tmplnm':'Circle Map','filepath':'google-circle-map'},
            {'tmplid':53    ,'tmplnm':'Dot Map','filepath':'google-dot-map'},
            {'tmplid':56    ,'tmplnm':'Dynamic Circle Map','filepath':'google-dynamic-circle-map'}
        ];
        $scope.findTemplate = function(id){

            for(var i=0;i<$scope.template_list.length;i++){
                if($scope.template_list[i].tmplid == id){
                    return $scope.template_list[i].filepath;
                }
            }

        }
        $scope.editedItem.mapboardItem.colorOption = {
            formatResult: function(query){
                    var markup = "<div style='background:"+query.color+"'>"+query.color+"</div>"
                    return markup;
            },
            formatSelection : function(query){
                $scope.editedItem.mapboardItem.color = query.color;
                var markup = "<div style='background:"+query.color+"'>"+query.color+"</div>"
                return markup;
                // return query.color;
            },
            id: function(query){return {id: query.tmplid};},
            onLoad: function(select2){
                $scope.editedItem.mapboardItem.templateOption.select2 = select2;
            },
            escapeMarkup: function(m) { return m; },
            query: function(query){
                //var data = [{color:'#3399FF'}, {color:'#FF0000'}, {color:'#ACD13E'}, {color:'#997ECC'}, {color:'#00B8E6'}, {color:'#E68A2E'},{color:'#00FFFF'},{color:'#009933'},{color:'#3333FF'},{color:'#FFFFFF'}, {color:'#000000'} , {color:'#FF00FF'} ,{color:'#993333'}, {color:'#FFFF00'}, {color:'#0099FF'}, {color:'#FF5050'} ];
                var data = [{color:'#3399FF'}, {color:'#FF0000'},{color:'#9900CC'}, {color:'#ACD13E'}, {color:'#997ECC'}, {color:'#00B8E6'}, {color:'#E68A2E'},{color:'#00FFFF'},{color:'#009933'},{color:'#3333FF'},{color:'#FFFFFF'}, {color:'#000000'} , {color:'#FF00FF'} ,{color:'#993333'}, {color:'#FFFF00'}, {color:'#0099FF'}, {color:'#FF5050'} ];
                query.callback({results:data, more:false});
            }
        }


        $scope.editedItem.mapboardItem.startDate.open = function($event) {
            //console.log($event)
            $event.preventDefault();
            $event.stopPropagation();
            $scope.editedItem.mapboardItem.startDate.opened = true;
        };
        $scope.editedItem.mapboardItem.endDate.open = function($event) {
            //console.log($event)
            $event.preventDefault();
            $event.stopPropagation();
            $scope.editedItem.mapboardItem.endDate.opened = true;
        };

    }

    $scope.configMapboard();
    $scope.running = false;


    var zoom = 14, center =  new google.maps.LatLng(37.49123340516455, 127.03850596301275);
    var dmapType = google.maps.MapTypeId.ROADMAP;

    $scope.changeMapType = function(type){
        if(type == 'TERRAIN'){
            $scope.map.setMapTypeId(google.maps.MapTypeId.TERRAIN);
        }else if(type == 'ROADMAP'){
            $scope.map.setMapTypeId(google.maps.MapTypeId.ROADMAP);
        }else if(type == 'SATELLITE'){
            $scope.map.setMapTypeId(google.maps.MapTypeId.SATELLITE);
        }else if(type == 'HYBRID'){
            $scope.map.setMapTypeId(google.maps.MapTypeId.HYBRID);
        }

    }

    $scope.mapOptions = {
        zoom:zoom,
        center:center,
        scrollwheel:false,
        mapTypeControl: true,
        mapTypeControlOptions: {
          style: google.maps.MapTypeControlStyle.DROPDOWN_MENU
        },
        zoomControl: true,
        zoomControlOptions: {
          style: google.maps.ZoomControlStyle.SMALL
        },
        mapTypeId: google.maps.MapTypeId.ROADMAP
    }

    // get map from directive
    $scope.mapOptions.onLoad = function(map){
        $scope.map = map;
        //console.log($scope.map);
    }

    $scope.delete = function(item_id){
        //dlg = $dialogs.confirm('Please Confirm','Do you really want to delete this Item?');
        var editDlg = $modal.open({
            templateUrl: CONFIG.preparePartialTemplateUrl('mapboard-delete'),
            controller: 'MapViewerModalInstanceCtrl',
            backdrop : 'static',
            //size: 'lg',
            resolve: {
                editedItem: function () {
                    return $scope.editedItem;
                }
            }
        });

        editDlg.result.then(function(editedItem){
            if(!_.isUndefined(editedItem.modalcmd) && editedItem.modalcmd == 'delete'){
                q = {};
                q.mapboard_id = $scope.mapboard_id;
                q.id = item_id;
                var p = $mapboardItem.delete(q, '/'+$scope.mapboard_id + '/'+item_id);
                p.then(function(dt){
                    //console.log(dt);
                    var idx = -1;
                    if(dt.result == 'success'){
                        var p2 = $mapboardItem.get([], '/'+$scope.mapboard_id);
                        p2.then(function(data){
                            $scope.mapboarditems = [];
                            $scope.mapboarditem_list = data;
                            $scope.clearLayer(item_id);
                        });
                    }
                });
            }else if(!_.isUndefined(editedItem.modalcmd) && editedItem.modalcmd == 'cancel'){
                $scope.modalOpended = false;
            }else{

            }
            $scope.modalOpended = false;
        });

        //dlg.result.then(function(btn){
        //    q = {};
        //    q.mapboard_id = $scope.mapboard_id;
        //    q.id = item_id;
        //    var p = $mapboardItem.delete(q, '/'+$scope.mapboard_id + '/'+item_id);
        //    p.then(function(dt){
        //        //console.log(dt);
        //        var idx = -1;
        //        if(dt.result == 'success'){
        //            var p2 = $mapboardItem.get([], '/'+$scope.mapboard_id);
        //            p2.then(function(data){
        //                //console.log('after delete $mapboardItem.get([]--------');
        //                //console.log(data);
        //                $scope.mapboarditems = [];
        //                $scope.mapboarditem_list = data;
        //                $scope.clearLayer(item_id);
        //            });
        //        }
        //    });
        //},function(btn){
        //    //console.log('not delete!!!')
        //});
    }

    $scope.save = function(){

        var wSelect2 = $scope.editedItem.mapboardItem.whereOption.onLoad();
        var sqlid = $scope.editedItem.mapboardItem.sqlid;
        var selid = $scope.editedItem.mapboardItem.selid; // uselid_lselid
        var tmplid = $scope.editedItem.mapboardItem.tmplid;  // umenuid_lmenuid, umenuid_lmenuid, umenuid_lmenuid
        var color = $scope.editedItem.mapboardItem.color;
        var whereStr = $scope.editedItem.arrWhereValue.join();
        var whereArr = [];
        if(whereStr.indexOf(',') != -1)
            whereArr = whereStr.split(',');
        else
            whereArr = [whereStr];

        var startDate = $scope.editedItem.mapboardItem.startDate.value;
        var endDate = $scope.editedItem.mapboardItem.endDate.value;

        var whids = [];
        angular.forEach(whereArr, function(d){
            if(d.indexOf("_")!=-1){
                var key = d.split("_")[0];
                whids.push(key);
            }
        });
        whids = _.uniq(whids);
        var whvalid = [];
        angular.forEach(whids, function(d){
            whvalid.push({whid:d, coltype:"",operand:"",colvals:[]});
        });

        angular.forEach(whereArr, function(d){
            if(d.indexOf("_")!=-1){
                var key = d.split("_")[0];
                var value = d.split("_")[1];

                angular.forEach(whvalid, function(obj){
                    if(obj.whid == key){
                        obj.colvals.push(value);
                    }
                });
            }
        });

        var sDt = $filter('date')(startDate, 'yyyyMMdd');
        var eDt = $filter('date')(endDate, 'yyyyMMdd');

        var executeUrl = '/api/v1.0/mapviewer/execute/sqlid/'+sqlid+'/selid/'+selid+'/tmplid/'+tmplid+'?whvalid=' + JSON.stringify(whvalid) + '&sdt=' + sDt + '&edt='+ eDt;
        //console.log(executeUrl);

        var q = {};
        q.title = $scope.editedItem.mapboardItem.selnm + ' - ' +  $scope.editedItem.mapboardItem.tmplnm;
        q.url = executeUrl;
        // q.refresh_intv = 100;
        q.mapboard_id = $scope.mapboard_id;
        q.colors = color;

        var p = $mapboardItem.add(q, '/'+ $scope.mapboard_id);
        p.then(function(data){
            if(data.length){
                var p2 = $mapboardItem.get([], '/'+$scope.mapboard_id);
                p2.then(function(data){
                    $scope.mapboarditems = [];
                    $scope.mapboarditem_list = data;
                });
            }
        });

    }

    $scope.getMapBounds = function(){
        if($scope.map){
            var bounds = $scope.map.getBounds();
            return bounds.toUrlValue();
        }
    }

    $scope.isRendering = false;

    $scope.$on('$viewContentLoaded', function() {
        $(".seldate").editable({
            datepicker: {
                todayBtn: 'linked'
            }
        });
        //$window.pageSetup();
    });

    $scope.render = function(){
        $scope.isLoading = true;
        $scope.circleCnt = 0;
        //console.log('$scope.mapboarditem_list.length is '+$scope.mapboarditem_list.length);
        angular.forEach($scope.mapboarditem_list, function(v){
            var dtrx = /tmplid\/(\d)+/g
            // console.log(v);
            console.log(v.url.match(dtrx)[0].replace('tmplid/',''));
            var tmpl_filepath = $scope.findTemplate(v.url.match(dtrx)[0].replace('tmplid/',''));
            v.url = v.url.replace('/api/v1.0/menus/','/api/v1.0/mapviewer/');
            console.log(v.url);
            console.log(tmpl_filepath);
            $scope.isRendering = true;
            if(v.query){
                console.log('******** if v.query *********');
                console.log(v);
                var q = {};
                q.query = v.query;
                q.bounds = $scope.getMapBounds();
                // console.log('v.template is ' + v.template);
                q.roundlevel = $mapctrlcommon.getRoundfromZooms($scope,tmpl_filepath);
                q.template = tmpl_filepath;

                var p = $mapboardItem.executeDirectQuery(q, '/'+$scope.mapboard_id + '/' + v.id);
                p.then(function(data){
                    var obj = {};
                    obj.data = data.resvalue; // value
                    obj.template = tmpl_filepath; // d3-pie
                    obj.query = data.query;
                    v.query = data.query;
                    obj.id = v.id;
                    obj.title = v.title;
                    obj.colors = v.colors;
                    // //console.log(obj);
                    $mapctrlcommon.drawLayer($scope, obj);
                }, function(error){
                    //console.log(error);
                    $timeout(function(){ $scope.isRendering = false; $scope.isLoading = false;},500);
                });

            }else{
                console.log('******** else v.query *********');
                console.log(JSON.stringify(v));
                console.log(v.title);
                console.log('v.template is ' + tmpl_filepath);
                var a_url = v.url + '&bounds=' + $scope.getMapBounds() + '&roundlevel=' + $mapctrlcommon.getRoundfromZooms($scope,tmpl_filepath);
                var p = $mapboardItem.execute($waveurl.get(a_url));
                p.then(function(data){
                    var obj = {};
                    obj.id = v.id;
                    obj.title = v.title;
                    obj.data = data.resvalue; // value
                    obj.template = data.template; // d3-pie
                    obj.query = data.query;
                    v.query = data.query;
                    v.template = data.template;

                    obj.colors = v.colors;
                    $mapctrlcommon.drawLayer($scope, obj);
                }, function(error){
                    //console.log(error);
                    $timeout(function(){ $scope.isRendering = false; $scope.isLoading = false;},500);
                });
            }
            // }
        });
    }

    $scope.$watch('mapboarditem_list', function(value){ $timeout(function() {
        $scope.render(value);
    }, 100)});

    $scope.layers = [];
    $scope.hours = '';
    $timeout(function() {
        google.maps.event.addListener($scope.map, 'center_changed', function() {
            google.maps.event.addListener($scope.map,"bounds_changed",function() {
                // console.log('bounds_changed and center_changed ' + $scope.isRendering);
                if(!$scope.isRendering){
                    console.log('map zoom level is ' + $scope.map.getZoom());
                    console.log('map center is ' + $scope.map.getCenter());
                    $scope.isRendering = true;
                    try{ $scope.render(); }catch(e){console.log(e);}
                }
            });
        });

        google.maps.event.addListener($scope.map, 'zoom_changed', function() {
            // console.log('zoom_changed ' + $scope.isRendering);
            if(!$scope.isRendering){
                console.log('map zoom level is ' + $scope.map.getZoom());
                console.log('map center is ' + $scope.map.getCenter());
                $scope.isRendering = true;
                try{ $scope.render(); }catch(e){console.log(e);}
            }
        });
    }, 300);


    $scope.clearLayer = function(id){
        for(var i=0;i<$scope.layers[id].length;i++){
            if(angular.isDefined($scope.layers[id][i]['map']))
                $scope.layers[id][i]['map'].setMap(null);
            if(angular.isDefined($scope.layers[id][i]['info']))
                $scope.layers[id][i]['info'].setMap(null);
        }
        $scope.layers[id] = [];
    }

    $scope.circleCnt = 0;

    $scope.markersByHour = [];


    $scope.isWetherLayer =  false;
    $scope.isTransitLayer =  false;
    $scope.isTrafficLayer =  false;
    $scope.isPanoramioLayer = false;
    $scope.isStreetViewLayer = false;

    // $timeout(function(){

    var weatherLayer = new google.maps.weather.WeatherLayer({
        temperatureUnits: google.maps.weather.TemperatureUnit.FAHRENHEIT
    });

    $scope.showWetherLayer = function(){
        //console.log('showWetherLayer is ' + $scope.isWetherLayer);
        $scope.isWetherLayer = !$scope.isWetherLayer;

        if($scope.isWetherLayer){
            weatherLayer.setMap($scope.map);
        }else{
            weatherLayer.setMap(null);
        }
    }



    var transitLayer = new google.maps.TransitLayer();
    $scope.showTransitLayer = function(){
        //console.log('showTransitLayer is ' + $scope.isTransitLayer);
        $scope.isTransitLayer = !$scope.isTransitLayer;
        if($scope.isTransitLayer){
            transitLayer.setMap($scope.map);
        }else{
            transitLayer.setMap(null);
        }
    }

    // $scope.isTrafficLayer =  false;
    var trafficLayer = new google.maps.TrafficLayer();
    $scope.showTrafficLayer = function(){
        //console.log('showTrafficLayer is ' + $scope.isTrafficLayer);
        $scope.isTrafficLayer = !$scope.isTrafficLayer;
        if($scope.isTrafficLayer){
            trafficLayer.setMap($scope.map);
        }else{
            trafficLayer.setMap(null);
        }
    }

    // $scope.isStreetViewLayer =  false;


  var panoramioLayer = new google.maps.panoramio.PanoramioLayer();
  // panoramioLayer.setMap(map);
  $scope.showPanoramioLayer = function(){
    $scope.isPanoramioLayer = !$scope.isPanoramioLayer;
        // var photoPanel = document.createElement('ul');
    if($scope.isPanoramioLayer){
        panoramioLayer.setMap($scope.map);

          // $scope.map.controls[google.maps.ControlPosition.RIGHT_TOP].push(photoPanel);

          google.maps.event.addListener(panoramioLayer, 'click', function(photo) {
            var li = document.createElement('li');
            var link = document.createElement('a');
            link.innerHTML = photo.featureDetails.title + ': ' +
                photo.featureDetails.author;
            link.setAttribute('href', photo.featureDetails.url);
            li.appendChild(link);
            // photoPanel.appendChild(li);
            // photoPanel.style.display = 'block';
          });

    }else{
        // photoPanel.style.display = 'hidden';
        panoramioLayer.setMap(null);
    }
  }

// }, 500);
    // $timeout(function(){
    // 	$scope.showPanoramioLayer();
    // 	$scope.showTrafficLayer();
    // 	$scope.showTransitLayer();
    // 	$scope.showWetherLayer();


    // }, 1000);

    $scope.isPanoShow = false;
    $scope.streetview = {};
    $scope.streetview.markers = [];
    // left:410px; top: 8px; width: 400px; height: 300px;
    $scope.streetview.pano = document.getElementById('pano');
    $scope.streetview.pano.style.width = '400px';
    $scope.streetview.pano.style.height = '300px';
    $scope.streetview.pano.style.top = '8px';
    $scope.streetview.pano.style.left = '8px';
    $scope.streetview.pano.style.display = 'none';

    $scope.showStreetViewLayer = function(){

        $scope.isStreetViewLayer = !$scope.isStreetViewLayer;
        fenway = center;
        if($scope.isStreetViewLayer){
            $scope.isPanoShow = $scope.isStreetViewLayer;
            var panoramaOptions = {
                position: fenway,
                pov: {
                    heading: 34,
                    pitch: 10
                }
            };


            $scope.streetview.panorama = new  google.maps.StreetViewPanorama(pano,panoramaOptions);
            $scope.streetview.sv = new google.maps.StreetViewService();
            $scope.map.setStreetView($scope.streetview.panorama);
            $scope.streetview.pano.style.display = 'block';

            function processSVData(data, status) {
                if (status == google.maps.StreetViewStatus.OK) {
                    var marker = new google.maps.Marker({
                        position: data.location.latLng,
                        zIndex:999,
                        map: $scope.map,
                        title: data.location.description
                    });
                    $scope.streetview.markers.push(marker);

                    $scope.streetview.panorama.setPano(data.location.pano);
                    $scope.streetview.panorama.setPov({
                        heading: 270,
                        pitch: 0
                    });
                    $scope.streetview.panorama.setVisible(true);

                    google.maps.event.addListener(marker, 'click', function() {

                        var markerPanoID = data.location.pano;
                        // Set the Pano to use the passed panoID
                        $scope.streetview.panorama.setPano(markerPanoID);
                        $scope.streetview.panorama.setPov({
                            heading: 270,
                            pitch: 0
                        });
                        $scope.streetview.panorama.setVisible(true);
                    });
                } else {
                    alert('Street View data not found for this location.');
                }
            }

            google.maps.event.addListener($scope.map, 'click', function(event) {
              $scope.streetview.sv.getPanoramaByLocation(event.latLng, 50, processSVData);
          });

        }else{
            google.maps.event.clearListeners($scope.map, 'click');
            $scope.map.setStreetView(null);
            angular.forEach($scope.streetview.markers, function(marker){
                marker.setMap(null);
            });
            $scope.map.getStreetView().setVisible(false);
            $scope.streetview.pano.style.display = 'none';
        }
    }

}])

;
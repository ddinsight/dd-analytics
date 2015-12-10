angular.module('Wave.dashboard.ctrl',[])

.controller('DashboardModalInstanceCtrl', function($scope, $modalInstance, data){
    console.log('DashboardModalInstanceCtrl editedItem is below');
    $scope.editedItem = data.editedItem;
    console.log($scope.editedItem)

    $scope.save = function(){
        console.log('DashboardModalInstanceCtrl save');
        $modalInstance.close($scope.editedItem);
    };
    $scope.cancel = function(){
        console.log('DashboardModalInstanceCtrl cancel');
        $modalInstance.dismiss('cancel');
    }; // end of cancel
})

.controller('DashboardEmptyCtrl', ['$location', '$scope','$routeParams','$dialogs','$appDataSet','$appMenus','$appTemplates','$appQuery', '$appUser', '$dashboard','$dashboardItem',
    function($location, $scope, $routeParams, $dialogs, $dataset, $menus, $templates, $query, $user, $dashboard, $dashboardItem) {
    console.log('------- start DashboardEmptyCtrl -------');

    var p = $dashboard.get([],'');
    // var p = $adminselect.get([], '/'+$scope.sqlid);
    p.then(function(data){
        console.log('var p = $dashboard.get([],);---- result is ');
        console.log(data);

        if(data.length){
            console.log(data[0]);
            console.log(data[0].id);
            var dashboard_id = data[0].id;
            var url = ROUTER.routePath('dashboard_path',{
                        dashboard_id : data[0].id
                    });
            console.log(dashboard_id);
            $location.path(url);
        }else{
            $scope.editedItem = {};
                var addDlg;
                addDlg = $dialogs.create(CONFIG.preparePartialTemplateUrl('dashboard-add'), 'DashboardModalInstanceCtrl', {editedItem:$scope.editedItem}, {key:false, back:'static'});
                addDlg.result.then(function(editedItem){
                    console.log('addDlg ... started.....');
                    $scope.save_dashboard(editedItem);
                });
        }
    });

    $scope.save_dashboard = function(editedItem){
        console.log('$scope.save_dashboard called in DashboardEmptyCtrl');
        var q = {};
        q.title = editedItem.dashboard.title;
        q.desc= editedItem.dashboard.desc;
        q.refresh_intv = editedItem.dashboard.refresh_intv;
        q.dashboard_id = $scope.dashboard_id;

        var p = $dashboard.add(q,'');
        p.then(function(dt){
            if(dt.length){
                var url = ROUTER.routePath('dashboard_path',{
                        dashboard_id : dt[0].id
                    });
                $location.path(url);
            }
        });
    }

}])

.controller('DashboardMainCtrl', ['$window', '$interval', '$timeout', '$location','$filter', '$scope','$routeParams','$appDataSet','$appMenus','$appTemplates','$appQuery', '$appUser', '$dashboard','$dashboardItem', '$adminQuery','$adminSelect','$adminWhColumn','$adminWhValue', '$waveurl', '$dialogs',
    function($window, $interval, $timeout, $location, $filter, $scope, $routeParams, $dataset, $menus, $templates, $query, $user, $dashboard, $dashboardItem, $adminquery, $adminselect, $adminwhcolumn, $adminwhvalue, $waveurl, $dialogs) {
    console.log('------- start DashboardMainCtrl -------');

    $scope.logout = function(){
        console.log('DashboardMainCtrl logout...');
        if($user.logout()){
            $location.path('/login');
        }
    }

    $scope.dashboard_id = $routeParams.dashboard_id;

    $scope.dashboard_list = [];
    $scope.dashboarditem_list = []; // not refined raw data...
    $scope.dashboarditems = []; // refined data to display in d3 directive
    $scope.editedItem = {};
    var stopTime;

    $scope.defaultWidgetOptions = {
        grid: 'article',
        widgets: '.jarviswidget',
        localStorage: true,
        deleteSettingsKey: '#deletesettingskey-options',
        settingsKeyLabel: 'Reset settings?',
        deletePositionKey: '#deletepositionkey-options',
        positionKeyLabel: 'Reset position?',
        sortable: true,
        buttonsHidden: false,
        toggleButton: false,
        toggleClass: 'min-10 | plus-10',
        toggleSpeed: 200,
        onToggle: function(){},
        deleteButton: true,
        deleteClass: 'trashcan-10',
        deleteSpeed: 200,
        onDelete: function(){},
        editButton: false,
        editPlaceholder: '.jarviswidget-editbox',
        editClass: 'pencil-10 | edit-clicked',
        editSpeed: 200,
        onEdit: function(){},
        fullscreenButton: true,
        fullscreenClass: 'fullscreen-10 | normalscreen-10',
        fullscreenDiff: 3,
        onFullscreen: function(){},
        customButton: false,
        customClass: 'folder-10 | next-10',
        customStart: function(){},
        customEnd: function(){},
        buttonOrder: '%refresh% %delete% %custom% %edit% %fullscreen% %toggle%',
        opacity: 1.0,
        dragHandle: '> header',
        placeholderClass: 'jarviswidget-placeholder',
        indicator: true,
        indicatorTime: 600,
        ajax: true,
        timestampPlaceholder:'.jarviswidget-timestamp',
        timestampFormat: 'Last update: %m%/%d%/%y% %h%:%i%:%s%',
        refreshButton: true,
        refreshButtonClass: 'refresh-10',
        labelError:'Sorry but there was a error:',
        labelUpdated: 'Last Update:',
        labelRefresh: 'Refresh',
        labelDelete: 'Delete widget:',
        afterLoad: function(){},
        rtl: false
    };


    var p = $dashboard.get([],'');
    p.then(function(data){
        $scope.dashboard_list = data;
    });

    var pv = $dashboard.view([],'/'+$scope.dashboard_id);
    pv.then(function(data){
        if(data && data.length){
            console.log('-----------------------------------');
            console.log($scope.dashboard_id +'=='+ data[0].id);
            if($scope.dashboard_id == data[0].id){
                $scope.dashboard_title = data[0].title;
                $scope.dashboard_desc = data[0].desc;
                $scope.dashboard_refresh_intv = data[0].refresh_intv;
            }else{
                var url = ROUTER.routePath('dashboard_path',{
                            dashboard_id : data[0].id
                        });
                $location.path(url);
            }
        }
    });

    var p2 = $dashboardItem.get([], '/'+$scope.dashboard_id);
    p2.then(function(data){
        console.log('$dashboardItem.get([]--------');
        console.log(data);
        $scope.dashboarditem_list = data;
    });

    $scope.$watch('dashboarditem_list' + ' | json', function(value){
        value = JSON.parse(value);
        angular.forEach(value, function(v){
            console.log(v);
                var p = $dashboardItem.execute($waveurl.get(v.url));
                p.then(function(data){
                    var obj = {};
                    obj.id = v.id;
                    obj.title = v.title;
                    obj.d3Data = data.resvalue; // value
                    obj.template = data.template; // d3-pie
                    obj.widgetOptions = angular.copy($scope.defaultWidgetOptions);
                    obj.widgetOptions.onDelete = function(){
                        // alert('obj.widgetOptions.onDelete ' + $scope.dashboard_id + ':'+ v.id);
                        // console.log('widgetOptions.onDelete');
                        $scope.deleteWidget($scope.dashboard_id, v.id);
                    }
                    obj.widgetOptions.onFullscreen = function(){
                        console.log('obj.widgetOptions.onFullscreen = function(){');
                    }
                    console.log('dashboarditem_list | json ');
                    console.log(obj);
                    $scope.dashboarditems.push(obj);

                }, function(error){
                    console.log(error);
                    var obj = {};
                    obj.id = v.id;
                    obj.title = v.title;
                    obj.title = obj.title.replace(',',', ').replace('/','/ ');
                    obj.d3Data = 'd3-pie'; // value
                    obj.template = [];
                    obj.widgetOptions.onDelete = function(){
                        alert('obj.widgetOptions.onDelete ' + $scope.dashboard_id + ':'+ v.id);
                        // console.log('widgetOptions.onDelete');
                        $scope.deleteWidget($scope.dashboard_id, v.id);
                    }
                    obj.widgetOptions.onFullscreen = function(){
                        console.log('obj.widgetOptions.onFullscreen = function(){');
                    }
                    $scope.dashboarditems.push(obj);
                });
            // }
        });

    });

    $scope.removeDashboard = function(dashboard_id){
        window.alert('This menu is not supported at Alpha version.');
        return;

        dlg = $dialogs.confirm('Please Confirm','Do you really want to delete dashboard and all items in it? ');
        dlg.result.then(function(btn){
            // really delete
            q = {};
            q.dashboard_id = $scope.dashboard_id;
            console.log('dashboard item delete');
            console.log(q);
            var p = $dashboard.delete(q, '/'+ $scope.dashboard_id);
            p.then(function(dt){
                console.log('$scope.removeDashboard = function(dashboard_id){ ====> ');
                console.log(dt);
                var idx = -1;
                if(dt.result == 'success'){
                    var url = ROUTER.routePath('dashboard_path',{
                        dashboard_id : dt.dashboard_id
                    });
                    $location.path(url);
                }
            });
            },function(btn){
                console.log('not delete!!!')
            });
    }

    $scope.deleteWidget = function(dashboard_id, item_id){
        dlg = $dialogs.confirm('Please Confirm','Do you really want to delete this Item?');
        dlg.result.then(function(btn){
            // really delete
            q = {};
            q.dashboard_id = dashboard_id;
            q.id = item_id;
            console.log('dashboard item delete');
            console.log(q);
            var p = $dashboardItem.delete(q, '/'+dashboard_id + '/'+item_id);
            p.then(function(dt){
                console.log(dt);
                var idx = -1;
                if(dt.result == 'success'){
                    var p2 = $dashboardItem.get([], '/'+$scope.dashboard_id);
                    p2.then(function(data){
                        console.log('after delete $dashboardItem.get([]--------');
                        console.log(data);
                        $scope.dashboarditems = [];
                        $scope.dashboarditem_list = data;
                    });
                }
            });
        },function(btn){
            console.log('not delete!!!')
        });
    }


    function updatePanel(){
        var count = 0;
        // $scope.dashboarditems = [];
        console.log('updatePanel dashboarditems length is ' + $scope.dashboarditems.length)


        angular.forEach($scope.dashboarditem_list, function(v){
            console.log('--- updatePanel ----');
            console.log(v);
            var p = $dashboardItem.execute($waveurl.get(v.url));
                p.then(function(data){
                    if(count++ == 0)
                        $scope.dashboarditems = [];
                    var obj = {};
                    obj.id = v.id;
                    obj.title = v.title;
                    obj.d3Data = data.resvalue; // value
                    obj.template = data.template; // d3-pie
                    obj.widgetOptions = angular.copy($scope.defaultWidgetOptions);
                    obj.widgetOptions.onDelete = function(){
                        $scope.deleteWidget($scope.dashboard_id, v.id);
                    }
                    obj.widgetOptions.onFullscreen = function(){
                        console.log('obj.widgetOptions.onFullscreen = function(){');
                    }
                    $scope.dashboarditems.push(obj);
                });
        });
    }
    var intv = 60;

    try{
        intv = Integer.parseInt($scope.dashboard_refresh_intv);
        console.log('refresh_intv is ' + intv);
    }catch(err){
        console.log(err);
        intv = 1200;
    }
    stopTime = $interval(updatePanel, 1000*intv);

    $scope.goDashboard = function(id){
        var url = ROUTER.routePath('dashboard_path',{
                    dashboard_id : id
                });
        $location.path(url);
    }

    $scope.addDashboard = function(){
        window.alert('This menu is not supported at Alpha version.');
        return;

        $scope.editedItem.dashboard = {};
        $scope.editedItem.dashboard.dashboard_id = $scope.dashboard_id;

        var addDlg;
        addDlg = $dialogs.create(CONFIG.preparePartialTemplateUrl('dashboard-add'), 'DashboardModalInstanceCtrl', {editedItem:$scope.editedItem}, {key:false, back:'static'});
        addDlg.result.then(function(editedItem){
            $scope.save_dashboard(editedItem);
        });
    }

    $scope.save_dashboard = function(editedItem){
        console.log('$scope.save_dashboard called in DashboardMainCtrl');
        var q = {};
        q.title = editedItem.dashboard.title;
        q.desc= editedItem.dashboard.desc;
        q.refresh_intv = editedItem.dashboard.refresh_intv;
        q.dashboard_id = $scope.dashboard_id;

        var p = $dashboard.add(q,'');
        p.then(function(dt){
            if(dt.length){
                var url = ROUTER.routePath('dashboard_path',{
                        dashboard_id : dt[0].id
                    });
                $location.path(url);
            }
        });
    }

    $scope.editedItem.dashboardItem = {};

    $scope.addDashboardItem = function(){

        $scope.editedItem.dashboardItem = {};
        console.log('addDashboardItem started...');
        $scope.editedItem.dashboardItem.datasetOption = {
            placeholder: "Pick up a Query",
            allowClear: true,
            formatResult: function(query){
                var markup = "<div ='.well'><h5>"+query.sqlid+"."+query.sqlnm+"</h5><p class='pink'>"+query.sqldesc+"</p><code>"+(query.sqlstmt.substring(0,70)+"...")+"</code></div>"
                return markup;
            },
            formatSelection: function(query){
                console.log(query);
                $scope.editedItem.dashboardItem.sqlid = query.sqlid;
                return query.sqlid + '_' + query.sqlnm;
            },
            id: function(query){return {id: query.sqlid};},
            // dropdownCssClass: "bigdrop",
            query: function (query) {
                console.log('$scope.editedItem.dashboardItem.datasetOption query started...')
                var p = $adminquery.get();
                p.then(function(data){
                    console.log(data);
                    query.callback({results:data, more:false});
                });
            },
            change: function(select2, element){
                element.on("change", function(e){
                    console.log('change event occurred.... ' + e.val);
                    $scope.editedItem.dashboardItem.sqlid = e.val;
                    $scope.editedItem.dashboardItem.showMenus = true;
                });
            },
            escapeMarkup: function(m){ return m;}
        };

        $scope.editedItem.dashboardItem.remakeData = function(dt){
            console.log('remakeData is ' + JSON.stringify(dt));
            var whereobj = {},whatobj  = {}, rwhereobj = {}, rwhatobj = {};

            for(i in dt){
                if(dt[i]["parent"].indexOf('condition') != -1) whereobj = dt[i];
                else whatobj = dt[i];
            }
            var childToObj = function(data){

                if(_.isNull(data["children"]) || _.isUndefined(data["children"]))
                return [];
            // console.log(Object.keys(data).length);
            if(Object.keys(data).length <1)
                return [];

            var rch = [];
                var childs = data["children"].indexOf(',') > 0 ? data["children"].split(','): [data["children"]];
                // console.log(childs);
                for(i=0;i<childs.length;i++){

                    var robj = {};
                    // console.log('childs['+i+']=>' + childs[i]);
                    var parent = childs[i].split('->')[0];
                    robj.id = parent.split(':')[0];
                    robj.text = parent.split(':')[1];
                    robj.tbltype = parent.split(':')[2];
                    robj.tblid = parent.split(':')[3];
                    robj.multiselect = parent.split(':')[4];
                    robj.disabled = true;
                    robj.children = [];
                    // console.log('child is ' + childs[i]);
                    var child = childs[i].split('->')[1].split('#');
                    for(j=0; j<child.length;j++){
                        var aa = {id:robj.id +'_'+child[j].split(':')[0], text:robj.text+'_'+child[j].split(':')[1], tbltype:child[j].split(':')[2], tblid:child[j].split(':')[3], multiselect:child[j].split(':')[4]};
                        // console.log('aa is ' + aa);
                        robj.children.push(aa);
                    }
                    rch.push(robj);
                    // console.log('final robj is ' + JSON.stringify(robj));
                }
                return rch;
            };
            var retval = [childToObj(whereobj), childToObj(whatobj)];
            // console.log(JSON.stringify(retval));

            return retval;
        }

        $scope.editedItem.dashboardItem.selectOption = {
            formatResult: function(query){
                return query.tblid + " / " + query.text;
            },
            formatSelection : function(query){
                $scope.editedItem.dashboardItem.selid = query.tblid;
                $scope.editedItem.dashboardItem.selnm = query.text;
                return query.tblid + " / " + query.text;
            },
            onLoad: function(select2){
                $scope.editedItem.dashboardItem.selectOption.select2 = select2;
            },
            id: function(query){return {id: query.tblid};},
            escapeMarkup: function(m) { return m; },
            query: function(query){
                var p = $menus.get($scope.editedItem.dashboardItem.sqlid);
                p.then(function(data){
                    var mm = $scope.editedItem.dashboardItem.remakeData(data);
                    query.callback({results:mm[1], more:false});
                });

            },
            change: function(select2, element){
                element.on("change", function(e){
                    $scope.editedItem.dashboardItem.selid = e.val;
                });
            }
        };

        $scope.editedItem.dashboardItem.whereOption = {
            multiple: true,
            formatResult: function(query){
                return query.id ;
            },
            formatSelection : function(query){
                console.log(query);
                return query.id ;
            },
            onLoad: function(select2){
                $scope.editedItem.dashboardItem.whereOption.select2 = select2;
            },
            // id: function(query){return {id: query.id};},
            // escapeMarkup: function(m) { return m; },
            query: function(query){
                // console.log(query);
                var p = $menus.get($scope.editedItem.dashboardItem.sqlid);
                p.then(function(data){
                    // var ndata = [];
                    var result = {results:[]}
                    var mm = $scope.editedItem.dashboardItem.remakeData(data);
                    angular.forEach(mm[0], function(m){
                        var obj = {};
                        obj.id = m.id;
                        obj.text = m.text;
                        obj.children = [];
                        obj.disabled = true;
                        angular.forEach(m.children, function(d){
                            if(query.term.length == 0  || (d.id+' / '+d.text).indexOf(query.term) >= 0){
                                // result.results.push(d);
                                // obj.children.push(d);
                                obj.children.push({id:d.id + '/' + d.text, text: d.text});
                            }
                        });
                        result.results.push(obj);
                    });
                    console.log('--- $scope.editedItem.dashboardItem.whereOption ----');
                    console.log(result.results);
                    query.callback(result);
                });
            },
        };

        $scope.editedItem.dashboardItem.templateOption = {
            formatResult: function(query){
                    return query.tmplid + "_" + query.tmplnm;
            },
            formatSelection : function(query){
                $scope.editedItem.dashboardItem.tmplid = query.tmplid;
                return query.tmplid + "_" + query.tmplnm;
            },
            id: function(query){return {id: query.tmplid};},
            onLoad: function(select2){
                $scope.editedItem.dashboardItem.templateOption.select2 = select2;
            },
            escapeMarkup: function(m) { return m; },
            query: function(query){
                var p = $templates.get($scope.editedItem.dashboardItem.sqlid, $scope.editedItem.dashboardItem.selid);
                p.then(function(data){
                    query.callback({results:data, more:false});
                });

            }
        }


        $scope.editedItem.dashboardItem.dateOptions = {
            'year-format': "'yyyy'",
            'starting-day': 1,
            'show-weeks':false
        };
        $scope.editedItem.dashboardItem.format  = 'yyyyMMdd';
        // editedItem.dashboardItem.date_open
        $scope.editedItem.dashboardItem.startDate = {};
        $scope.editedItem.dashboardItem.endDate = {};
        $scope.editedItem.dashboardItem.endDate.opened = false;
        $scope.editedItem.dashboardItem.startDate.opened = false;
        $scope.editedItem.dashboardItem.endDate.value = new Date();
        $scope.editedItem.dashboardItem.startDate.value = new Date();
        $scope.editedItem.dashboardItem.selid = '';
        $scope.editedItem.dashboardItem.sqlid = '';
        $scope.editedItem.dashboardItem.tmplid = '';


        $scope.editedItem.dashboardItem.startDate.open = function($event) {
            console.log($event)
            $event.preventDefault();
            $event.stopPropagation();
            $scope.editedItem.dashboardItem.startDate.opened = true;
        };
        $scope.editedItem.dashboardItem.endDate.open = function($event) {
            console.log($event)
            $event.preventDefault();
            $event.stopPropagation();
            $scope.editedItem.dashboardItem.endDate.opened = true;
        };

        var addItemDlg;
        addItemDlg = $dialogs.create(CONFIG.preparePartialTemplateUrl('dashboard-item-add'), 'DashboardModalInstanceCtrl', {editedItem:$scope.editedItem}, {key:false, back:'static', windowClass:'modal-lg'});
        addItemDlg.result.then(function(editedItem){
            $scope.save_dashboard_item(editedItem);
        });

    }



    $scope.save_dashboard_item = function(editedItem){
        console.log('-------- addItemDlg save_dashboard_item --------- ');


        var sqlid = $scope.editedItem.dashboardItem.sqlid;
        var selid = $scope.editedItem.dashboardItem.selid; // uselid_lselid
        var tmplid = $scope.editedItem.dashboardItem.tmplid;  // umenuid_lmenuid, umenuid_lmenuid, umenuid_lmenuid
        var whereStr = $scope.editedItem.dashboardItem.whereOption.select2.val();  // umenuid_lmenuid, umenuid_lmenuid, umenuid_lmenuid
        var _whereArr = [];
        if(whereStr.indexOf(',') != -1)
            _whereArr = whereStr.split(',');
        else
            _whereArr = [whereStr];

        var startDate = editedItem.dashboardItem.startDate.value;
        var endDate = editedItem.dashboardItem.endDate.value;

        var whids = [];
        var whereArr = [], whereTxt = [];
        angular.forEach(_whereArr, function(d){
            whereArr.push(d.split("/")[0]);
            whereTxt.push(d.split("/")[1]);
        });

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

        var executeUrl = '/api/v1.0/chartviewer/execute/sqlid/'+sqlid+'/selid/'+selid+'/tmplid/'+tmplid+'?whvalid=' + JSON.stringify(whvalid) + '&sdt=' + sDt + '&edt='+ eDt;
        console.log('executeUrl==>');
        console.log(executeUrl);
        console.log($scope.editedItem.dashboardItem.whereOption.select2.val());
        var q = {};
        q.title = $scope.editedItem.dashboardItem.selnm + '/' + whereTxt.join() +'/' + sDt +'/' + eDt;

        q.url = executeUrl;
        q.refresh_intv = 100;
        q.dashboard_id = $scope.dashboard_id;

        var p = $dashboardItem.add(q, '/'+ $scope.dashboard_id);
        p.then(function(data){
            if(data.length){
                var p2 = $dashboardItem.get([], '/'+$scope.dashboard_id);
                p2.then(function(data){
                    $scope.dashboarditems = [];
                    $scope.dashboarditem_list = data;
                });
            }
        });
    }
}])

;
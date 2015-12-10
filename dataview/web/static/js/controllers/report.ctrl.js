angular.module('Wave.report.ctrl',[])

.controller('ReModalInstanceCtrl', function($scope, $modalInstance, data){
    //console.log('ReportModalInstanceCtrl editedItem is below');
    $scope.editedItem = data.editedItem;
    //console.log($scope.editedItem)

    $scope.save = function(){
        //console.log('ReportModalInstanceCtrl save');
        $modalInstance.close($scope.editedItem);
    };
    $scope.cancel = function(){
        //console.log('ReportModalInstanceCtrl cancel');
        $modalInstance.dismiss('cancel');
    }; // end of cancel
})

.controller('ReportListController', ['$window','$timeout','$log','$location', '$scope','$routeParams','$modal', '$appUser','$dashboardService', '$report','$reportItem',
    function($window, $timeout, $log, $location, $scope, $routeParams, $modal, $user, $dashboard, $report, $reportItem) {
    console.log('------- start ReportListController -------');

    $scope.editedItem = {};
    $scope.editedItem.report = {};

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
    $scope.printDataSet = function(){
        var promise = $report.get();
        promise.then(function(data){
            $scope.tblDatas = data;
            $log.log('------ $scope.printDataSet -----');
            $log.log(data);
        });
    };
    $scope.tblDatas    = [];

    $scope.overrideOptions = {
        "iDisplayLength":50
    };
    $scope.tblSorting = [[ 0, "desc" ]];
    $scope.tblColumns = [
        {"sTitle":"ID", "sWidth":"10%"}, {"sTitle":"TITLE"}, {"sTitle":"URI"}, {"sTitle":"DESCRIPTION", "sWidth":"50%"}
    ];

    $scope.columnDefs = [
        {"mDataProp":"id", "aTargets":[0]},
        {"mDataProp":"title", "aTargets":[1], "mRender":function(data, type, row){
            return '<a href="javascript:void(0)" ng-click="moveTo('+row.id+')">'+row.title+'</a>';
        }},
        {"mDataProp":"uri", "aTargets":[2]},
        {"mDataProp":"desc", "aTargets":[3]}
    ];

    $scope.overrideOptions.afterCreationTableCallback = function(element, table){

        $(element).find('tbody').on('click', 'tr', function(){
            console.log('in tobdy:' + $(this).hasClass('DTTT_selected'));
            if($(this).hasClass('DTTT_selected')){

            }else{
                table.$('tr.DTTT_selected').removeClass('DTTT_selected');
                $(this).addClass('DTTT_selected');

                if(table.api(0)) $scope.editedItem.report_id = table.api(0).rows('.DTTT_selected').data()[0].id;
                $log.log($scope.editedItem.report_id);
            }
        });
        $(element).find('tbody').hover(function(){
            $(this).css('cursor','Default');
        });
        $(element).find('tbody').on('dblclick', 'tr', function(){
            console.log('in tobdy:' + $(this).hasClass('DTTT_selected'));
            if($(this).hasClass('DTTT_selected')){
                if(table.api(0)) $scope.editedItem.report_id = table.api(0).rows('.DTTT_selected').data()[0].id;
                $scope.edit();
            }else{
                table.$('tr.DTTT_selected').removeClass('DTTT_selected');
                $(this).addClass('DTTT_selected');
                if(table.api(0)) $scope.editedItem.report_id = table.api(0).rows('.DTTT_selected').data()[0].id;
            }
        });
    }

    $scope.printDataSet();

    $scope.moveTo = function(boardid){
        $log.log('move to ' + boardid);
        $location.path('/report/view/'+boardid);
    };


    $scope.add = function() {
        $log.log('---add----');
        $scope.editedItem.title = '';
        $scope.editedItem.desc = '';
        $scope.editedItem.uri = '';
        $scope.editedItem.refresh_intv = '';
        $scope.editedItem.period_range = '';
        $scope.editedItem.adminid = $scope.user;
        var editDlg = $modal.open({
            templateUrl: CONFIG.preparePartialTemplateUrl('report-add'),
            controller: 'MapViewerModalInstanceCtrl',
            backdrop : 'static',
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
    }

    $scope.save = function(){
        var q = {};
        q.title = $scope.editedItem.title;
        q.desc= $scope.editedItem.desc;
        q.uri= $scope.editedItem.uri;
        q.refresh_intv = $scope.editedItem.refresh_intv;
        q.period_range = $scope.editedItem.period_range;
        q.adminid = $scope.user;

        var p;
        if($scope.editedItem.report_id && $scope.editedItem.report_id > 0){
            q.id = $scope.editedItem.report_id;
            p = $report.edit(q,'/' + $scope.editedItem.report_id);
        }else{
            p = $report.add(q,'');
        }
        p.then(function(dt){
            if(dt.length){
                $scope.tblDatas = dt;
            }
        });
    }

    $scope.edit = function() {
        $log.log('---edit----');

        angular.forEach($scope.tblDatas, function(r){
                if(r.id == $scope.editedItem.report_id){
                    $scope.editedItem.title = r.title;
                    $scope.editedItem.desc = r.desc;
                    $scope.editedItem.uri = r.uri;
                    $scope.editedItem.refresh_intv = r.refresh_intv;
                    $scope.editedItem.period_range = r.period_range;
                    $scope.editedItem.adminid = r.adminid;
                }
            });
        var editDlg = $modal.open({
            templateUrl: CONFIG.preparePartialTemplateUrl('report-add'),
            controller: 'MapViewerModalInstanceCtrl',
            backdrop : 'static',
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
    }

    $scope.delete = function(){
        $log.log('---delete----');
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

                var p = $report.delete([], '/'+ $scope.editedItem.report_id);
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

    };

}])

.controller('ReportViewController', ['$window', '$interval', '$timeout', '$location','$filter', '$scope','$routeParams','$appDataSet','$appMenus','$appTemplates','$appQuery', '$appUser', '$dashboardService', '$adminQuery','$adminSelect','$adminWhColumn','$adminWhValue', '$waveurl','$log', '$report', '$reportItem','$chartviewerService',
    function($window, $interval, $timeout, $location, $filter, $scope, $routeParams, $dataset, $menus, $templates, $query, $user, $dashboard, $adminquery, $adminselect, $adminwhcolumn, $adminwhvalue, $waveurl, $log, $report, $reportItem,$chartviewer) {
    console.log('------- start DashboardMainCtrl -------');
    $scope.report_id = $routeParams.report_id;
    $scope.logout = function(){
        if($user.logout()){
            $location.path('/login');
        }
    }
    $scope.widgetTitle = 'Selection Item';
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

    $scope.editedItem = {};
    $scope.editedItem.reportItem = {};

    //$scope.addDashboardItem = function(){

    $scope.editedItem.reportItem = {};
    //console.log('addDashboardItem started...');
    $scope.editedItem.reportItem.datasetOption = {
        placeholder: "Pick up a Query",
        allowClear: true,
        formatResult: function(query){
            var markup = "<div ='.well'><h5>"+query.sqlid+"."+query.sqlnm+"</h5><p class='pink'>"+query.sqldesc+"</p><code>"+(query.sqlstmt.substring(0,70)+"...")+"</code></div>"
            return markup;
        },
        formatSelection: function(query){
            console.log(query);
            $scope.editedItem.reportItem.sqlid = query.sqlid;
            return query.sqlid + '_' + query.sqlnm;
        },
        id: function(query){return {id: query.sqlid};},
        // dropdownCssClass: "bigdrop",
        query: function (query) {
            console.log('$scope.editedItem.reportItem.datasetOption query started...')
            var p = $adminquery.get();
            p.then(function(data){
                console.log(data);
                query.callback({results:data, more:false});
            });
        },
        change: function(select2, element){
            element.on("change", function(e){
                console.log('change event occurred.... ' + e.val);
                $scope.editedItem.reportItem.sqlid = e.val;
                $scope.editedItem.reportItem.showMenus = true;
            });
        },
        escapeMarkup: function(m){ return m;}
    };

    $scope.editedItem.reportItem.remakeData = function(dt){
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

    $scope.editedItem.reportItem.selectOption = {
        formatResult: function(query){
            return query.id + " / " + query.nm;
        },
        formatSelection : function(query){
            $scope.editedItem.reportItem.selid = query.id;
            $scope.editedItem.reportItem.selnm = query.nm;
            return query.id + " / " + query.nm;
        },
        onLoad: function(select2){
            $scope.editedItem.reportItem.selectOption.select2 = select2;
        },
        id: function(query){return {id: query.id};},
        escapeMarkup: function(m) { return m; },
        query: function(query){
            var p = $chartviewer.getSelectMenu([], '/'+$scope.editedItem.reportItem.sqlid);
            p.then(function(data){
                query.callback({results:data, more:false});
            });

        },
        change: function(select2, element){
            element.on("change", function(e){
                $scope.editedItem.reportItem.selid = e.val;
            });
        }
    };
    $scope.editedItem.arrWhereValue = [];
    $scope.editedItem.setWhereValue = function(id){
        $scope.editedItem.arrWhereValue.push(id);
        $scope.editedItem.arrWhereValue = _.uniq($scope.editedItem.arrWhereValue);
    }
    $scope.editedItem.reportItem.whereOption = {
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
                $scope.editedItem.reportItem.whereOption.select2 = select2;
            return select2;
        },
        query: function(query){
            var p = $chartviewer.getWhereMenu([], '/'+$scope.editedItem.reportItem.sqlid);
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

    //$scope.editedItem.reportItem.whereOption = {
    //    multiple: true,
    //    formatResult: function(query){
    //        return query.id ;
    //    },
    //    formatSelection : function(query){
    //        console.log(query);
    //        return query.id ;
    //    },
    //    onLoad: function(select2){
    //        $scope.editedItem.reportItem.whereOption.select2 = select2;
    //    },
    //    // id: function(query){return {id: query.id};},
    //    // escapeMarkup: function(m) { return m; },
    //    query: function(query){
    //        // console.log(query);
    //        var p = $menus.get($scope.editedItem.reportItem.sqlid);
    //        p.then(function(data){
    //            // var ndata = [];
    //            var result = {results:[]}
    //            var mm = $scope.editedItem.reportItem.remakeData(data);
    //            angular.forEach(mm[0], function(m){
    //                var obj = {};
    //                obj.id = m.id;
    //                obj.text = m.text;
    //                obj.children = [];
    //                obj.disabled = true;
    //                angular.forEach(m.children, function(d){
    //                    if(query.term.length == 0  || (d.id+' / '+d.text).indexOf(query.term) >= 0){
    //                        // result.results.push(d);
    //                        // obj.children.push(d);
    //                        obj.children.push({id:d.id + '/' + d.text, text: d.text});
    //                    }
    //                });
    //                result.results.push(obj);
    //            });
    //            console.log('--- $scope.editedItem.reportItem.whereOption ----');
    //            console.log(result.results);
    //            query.callback(result);
    //        });
    //    },
    //};

    $scope.editedItem.reportItem.templateOption = {
        formatResult: function(query){
            //console.log(query);
            return query.tmplid + "_" + query.tmplnm;
        },
        formatSelection : function(query){
            $scope.editedItem.reportItem.tmplid = query.tmplid;
            return query.tmplid + "_" + query.tmplnm;
        },
        id: function(query){return {id: query.tmplid};},
        onLoad: function(select2){
            $scope.editedItem.reportItem.templateOption.select2 = select2;
        },
        escapeMarkup: function(m) { return m; },
        query: function(query){
            var p = $templates.get($scope.editedItem.reportItem.sqlid, $scope.editedItem.reportItem.selid);
            p.then(function(data){
                var aaa = [];
                console.log('--- $scope.editedItem.reportItem.templateOption ---');
                console.log(data);
                if(data[0].tmpls)
                    aaa = JSON.parse(data[0].tmpls)
                query.callback({results:aaa, more:false});
            });

        }
    }

    $scope.editedItem.reportItem.sizeOption = {
        formatResult: function(query){
                return query.size;
        },
        formatSelection : function(query){
            $scope.editedItem.reportItem.size = query.size;
            return query.size;
        },
        id: function(query){return {id: query.sizeid};},
        onLoad: function(select2){
            $scope.editedItem.reportItem.sizeOption.select2 = select2;
        },
        escapeMarkup: function(m) { return m; },
        query: function(query){
            var data = [{size:"span6"},{size:"span12"}]
            query.callback({results:data, more:false});

        }
    }


    $scope.editedItem.reportItem.dateOptions = {
        'year-format': "'yyyy'",
        'starting-day': 1,
        'show-weeks':false
    };

    $scope.editedItem.reportItem.format  = 'yyyyMMdd';
    // editedItem.dashboardItem.date_open
    $scope.editedItem.reportItem.startDate = {};
    $scope.editedItem.reportItem.endDate = {};
    $scope.editedItem.reportItem.endDate.opened = false;
    $scope.editedItem.reportItem.startDate.opened = false;
    $scope.editedItem.reportItem.endDate.value = new Date();
    $scope.editedItem.reportItem.startDate.value = new Date();
    $scope.editedItem.reportItem.selid = '';
    $scope.editedItem.reportItem.sqlid = '';
    $scope.editedItem.reportItem.tmplid = '';


    $scope.editedItem.reportItem.startDate.open = function($event) {
        console.log($event)
        $event.preventDefault();
        $event.stopPropagation();
        $scope.editedItem.reportItem.startDate.opened = true;
    };
    $scope.editedItem.reportItem.endDate.open = function($event) {
        console.log($event)
        $event.preventDefault();
        $event.stopPropagation();
        $scope.editedItem.reportItem.endDate.opened = true;
    };

        //var addItemDlg;
        //addItemDlg = $dialogs.create(CONFIG.preparePartialTemplateUrl('dashboard-item-add'), 'DashboardModalInstanceCtrl', {editedItem:$scope.editedItem}, {key:false, back:'static', windowClass:'modal-lg'});
        //addItemDlg.result.then(function(editedItem){
        //    $scope.save_report_item(editedItem);
        //});
    
    //}

    $scope.report_item_list = [];

    $scope.save_report_item = function(){
        console.log('-------- addItemDlg save_dashboard_item --------- ');


        var sqlid = $scope.editedItem.reportItem.sqlid;
        var selid = $scope.editedItem.reportItem.selid; // uselid_lselid
        var tmplid = $scope.editedItem.reportItem.tmplid;  // umenuid_lmenuid, umenuid_lmenuid, umenuid_lmenuid
        var whereStr = $scope.editedItem.reportItem.whereOption.select2.val();  // umenuid_lmenuid, umenuid_lmenuid, umenuid_lmenuid

        var _whereArr = [];
        if(whereStr.indexOf(',') != -1)
            _whereArr = whereStr.split(',');
        else
            _whereArr = [whereStr];

        var startDate = $scope.editedItem.reportItem.startDate.value;
        var endDate = $scope.editedItem.reportItem.endDate.value;


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
        console.log($scope.editedItem.reportItem.whereOption.select2.val());
        var q = {};
        q.title = $scope.editedItem.reportItem.selnm;
        q.sqlid = $scope.editedItem.reportItem.sqlid;
        q.selid = $scope.editedItem.reportItem.selid;
        q.tmplid = $scope.editedItem.reportItem.tmplid;
        q.size = $scope.editedItem.reportItem.size;
        q.type = '0'; // 0 : internal <sqlid, selid, tmplid use>, 1 : external <url use>
        q.url = executeUrl;
        q.report_id = $scope.report_id;

        var p = $reportItem.add(q, '/'+ $scope.report_id);
        p.then(function(data){
            if(data.length){
                //var p2 = $reportItem.get([], '/'+$scope.report_id);
                //p2.then(function(data){
                //    $scope.report_item_list = data;
                //});
                $scope.drawD3();
            }
        });
    }


    $scope.$on('$viewContentLoaded', function() {
        $(".seldate").editable({
            datepicker: {
                todayBtn: 'linked'
            }
        });
    });

    $scope.charts = [];

    $scope.delAllWidget = function(){
        $scope.charts.splice(0, $scope.charts.length);
        $('#widget-grid2').removeData('jarvisWidgets');
        $('#widget-grid2').find('.row').find('article').each(function() {
            $(this).empty();
        });
    };

    $scope.defaultWidgetOptions = {
        grid : 'article',
        widgets : '.jarviswidget',
        localStorage : true,
        deleteSettingsKey : '#deletesettingskey-options',
        settingsKeyLabel : 'Reset settings?',
        deletePositionKey : '#deletepositionkey-options',
        positionKeyLabel : 'Reset position?',
        sortable : true,
        buttonsHidden : false,
        // toggle button
        toggleButton : true,
        toggleClass : 'fa fa-minus | fa fa-plus',
        toggleSpeed : 200,
        onToggle : function() {},
        // delete btn
        deleteButton : true,
        deleteClass : 'fa fa-times',
        deleteSpeed : 200,
        onDelete : function() {
            console.log('----------- default Widget Options ---------');
            return true;
        },
        // edit btn
        editButton : true,
        editPlaceholder : '.jarviswidget-editbox',
        editClass : 'fa fa-cog | fa fa-save',
        editSpeed : 200,
        onEdit : function() {},
        // color button
        colorButton : true,
        // full screen
        fullscreenButton : true,
        fullscreenClass : 'fa fa-expand | fa fa-compress',
        fullscreenDiff : 3,
        onFullscreen : function() {},
        // custom btn
        customButton : false,
        customClass : 'folder-10 | next-10',
        customStart : function() {},
        customEnd : function() {},
        // order
        buttonOrder : '%refresh% %custom% %edit% %toggle% %fullscreen% %delete%',
        opacity : 1.0,
        dragHandle : '> header',
        placeholderClass : 'jarviswidget-placeholder',
        indicator : true,
        indicatorTime : 600,
        ajax : false,
        timestampPlaceholder : '.jarviswidget-timestamp',
        timestampFormat : 'Last update: %m%/%d%/%y% %h%:%i%:%s%',
        refreshButton : true,
        refreshButtonClass : 'fa fa-refresh',
        labelError : 'Sorry but there was a error:',
        labelUpdated : 'Last Update:',
        labelRefresh : 'Refresh',
        labelDelete : 'Delete widget:',
        afterLoad : function() {},
        rtl : false, // best not to toggle this!
        onChange : function() {},
        onSave : function() {},
        ajaxnav : $.navAsAjax // declears how the localstorage should be saved (HTML or AJAX page)

    };
    $scope.deleteWidget = function(report_id, item_id){
        q = {};
        q.report_id = report_id;
        q.id = item_id;
        var p = $reportItem.delete(q, '/' + report_id + '/' + item_id);
        p.then(function(data){
            if(data)
                $scope.drawD3();
        });
    }

    $scope.save_order = function(report_id,  item_id, obj){
        console.log('===== $scope.save_order =====');
        console.log(report_id + '/' + item_id + '/' + obj);
        console.log(obj);

        var p = $reportItem.save_order([],'/'+report_id + '/' + item_id + '/' + obj);
        p.then(function(d){
            console.log('$scope.save_order result is ' + d);
        });
    }
    $scope.drawD3 = function(){
        $scope.clearD3();
        var q = {};
        var today = new Date();
        q.sdt = $filter('date')(today.setMonth(today.getMonth() - 2), 'yyyyMMdd');
        q.edt = $filter('date')(new Date(), 'yyyyMMdd');

        var promise = $reportItem.execute([], '/' + $scope.report_id + '?sdt=' + q.sdt + '&edt=' + q.edt );

        promise.then(function(data){

            angular.forEach(data, function(d){
                var chart = {};
                chart.report_id = $scope.report_id;
                chart.id = d.id;
                chart.data = d.resvalue;
                chart.template = d.template;
                chart.size = d.size;
                chart.order = d.order;
                chart.options = angular.copy($scope.defaultWidgetOptions);
                chart.options.onDelete = function(){
                    $scope.deleteWidget($scope.report_id, chart.id);
                }
                chart.title = d.restitle;
                $scope.charts.push(chart);
            });

        });

    };
    $scope.clearD3 = function(){
        $scope.charts = [];
        console.log('---- $scope.clearD3 ----');
        $('#widget-grid2').find('article').each(function(i){
            console.log('#widget-grid2:' + i);
            $(this).html('');
        });
    }
    $scope.drawD3();


}])


.controller('ReportViewerController', ['$window', '$interval', '$timeout', '$location','$filter', '$scope','$routeParams','$log','$appUser', '$report', '$reportItem','$chartviewerService','$dashboardService',
    function($window, $interval, $timeout, $location, $filter, $scope, $routeParams, $log, $user, $report, $reportItem, $chartviewer, $dashboard) {
    console.log('------- start DashboardMainCtrl -------');
    $scope.uri = $routeParams.uri;

    $scope.logout = function(){
        if($user.logout()){
            $location.path('/login');
        }
    }
    $scope.tableTitle1 = "";

    $scope.widgetTitle = 'Selection Item';
    $scope.user = $user.isLogined().user;
    $scope.menus = [];
    $scope.leftMenus = function(){
        var promise = $dashboard.getMenus();
        promise.then(function(data){
            $scope.menus = JSON.parse(data[0].m1);
            $log.log('----$scope.printMenus-----');
            $log.log(data[0].m1);
            var mm = JSON.parse(data[0].m1);
            angular.forEach(mm, function(m){
               if(m.url.indexOf($scope.uri) > -1 ){
                   $scope.tableTitle1  = m.name;
               }
            });
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
    $scope.editedItem = {};
    $scope.charts = [];




    $scope.delAllWidget = function(){
        $scope.charts.splice(0, $scope.charts.length);
        $('#widget-grid2').removeData('jarvisWidgets');
        $('#widget-grid2').find('.row').find('article').each(function() {
            $(this).empty();
        });
    };

    $scope.defaultWidgetOptions = {
        grid : 'article',
        widgets : '.jarviswidget',
        localStorage : true,
        deleteSettingsKey : '#deletesettingskey-options',
        settingsKeyLabel : 'Reset settings?',
        deletePositionKey : '#deletepositionkey-options',
        positionKeyLabel : 'Reset position?',
        sortable : true,
        buttonsHidden : false,
        // toggle button
        toggleButton : true,
        toggleClass : 'fa fa-minus | fa fa-plus',
        toggleSpeed : 200,
        onToggle : function() {},
        // delete btn
        deleteButton : true,
        deleteClass : 'fa fa-times',
        deleteSpeed : 200,
        onDelete : function() {
            console.log('----------- default Widget Options ---------');
            return true;
        },
        // edit btn
        editButton : true,
        editPlaceholder : '.jarviswidget-editbox',
        editClass : 'fa fa-cog | fa fa-save',
        editSpeed : 200,
        onEdit : function() {},
        // color button
        colorButton : true,
        // full screen
        fullscreenButton : true,
        fullscreenClass : 'fa fa-expand | fa fa-compress',
        fullscreenDiff : 3,
        onFullscreen : function() {},
        // custom btn
        customButton : false,
        customClass : 'folder-10 | next-10',
        customStart : function() {},
        customEnd : function() {},
        // order
        buttonOrder : '%refresh% %custom% %edit% %toggle% %fullscreen% %delete%',
        opacity : 1.0,
        dragHandle : '> header',
        placeholderClass : 'jarviswidget-placeholder',
        indicator : true,
        indicatorTime : 600,
        ajax : false,
        timestampPlaceholder : '.jarviswidget-timestamp',
        timestampFormat : 'Last update: %m%/%d%/%y% %h%:%i%:%s%',
        refreshButton : true,
        refreshButtonClass : 'fa fa-refresh',
        labelError : 'Sorry but there was a error:',
        labelUpdated : 'Last Update:',
        labelRefresh : 'Refresh',
        labelDelete : 'Delete widget:',
        afterLoad : function() {},
        rtl : false, // best not to toggle this!
        onChange : function() {},
        onSave : function() {},
        ajaxnav : $.navAsAjax // declears how the localstorage should be saved (HTML or AJAX page)

    };
    $scope.deleteWidget = function(report_id, item_id){
        q = {};
        q.report_id = report_id;
        q.id = item_id;
        var p = $reportItem.delete(q, '/' + report_id + '/' + item_id);
        p.then(function(data){
            if(data)
                $scope.drawD3();
        });
    }
    $scope.selectedDate = {};
    //$scope.defaultSelectDate = function(){
    //    var today = new Date();
    //    $scope.selectedDate.startDate = today.setMonth(today.getMonth() - 3);
    //    $scope.selectedDate.endDate = new Date();
    //}
    //$scope.defaultSelectDate();


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
            if(date.indexOf("-") < 0)
                $scope.selectedDate.startDate = isoString(parse(date));
            else
                $scope.selectedDate.startDate = isoString((new Date(date)));
        }else{
            if(date.indexOf("-") < 0)
                $scope.selectedDate.endDate = isoString(parse(date));
            else
                $scope.selectedDate.endDate = isoString((new Date(date)));
            //$scope.selectedDate.endDate = parse(date);
        }
        $log.log($scope.selectedDate);
    }


    $scope.$watch('selectedDate',function(){
        $log.log('==== startDate Watch =====')
        $log.log($scope.selectedDate.startDate);
        $log.log($scope.selectedDate.endDate);
    });

    $scope.drawD3 = function(){
        $scope.clearD3();
        var q = {'url':$routeParams.uri}
        var today = new Date();

        q.sdt = $filter('date')($scope.selectedDate.startDate, 'yyyyMMdd');
        q.edt = $filter('date')($scope.selectedDate.endDate, 'yyyyMMdd');

        var promise = $reportItem.execute(q, '/0' + '?sdt=' + q.sdt + '&edt=' + q.edt + '&uri=' + $routeParams.uri);
        var bi = 0;
        promise.then(function(data){
//console.log('--------- promise --------');
            console.log(data);
            angular.forEach(data, function(d){
                if(bi++ < 1){
                    $scope.setSelectedDate(d.sdt,1);
                    $scope.setSelectedDate(d.edt,2);
                }
                var chart = {};
                chart.report_id = $scope.report_id;
                chart.id = d.id;
                chart.data = d.resvalue;
                chart.template = d.template;
                chart.size = d.size;
                chart.order = d.order;
                chart.options = angular.copy($scope.defaultWidgetOptions);
                chart.options.onDelete = function(){
                    $scope.deleteWidget($scope.report_id, chart.id);
                }
                chart.title = d.restitle;
                $scope.charts.push(chart);
            });

        });

    };
    $scope.clearD3 = function(){
        $scope.charts = [];
        console.log('---- $scope.clearD3 ----');
        $('#widget-grid2').find('article').each(function(i){
            console.log('#widget-grid2:' + i);
            $(this).html('');
        });
    }
    $scope.drawD3();


}])
;
angular.module('Wave.chartviewer.ctrl',[])

.controller('ChartViewerListController', ['$timeout','$window','$log','$location', '$scope','$routeParams','$dashboardService','$chartviewerService','$appUser',
        function($timeout, $window, $log, $location, $scope, $routeParams, $dashboard, $chartviewer, $user) {

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
        var promise = $chartviewer.get();
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
    $scope.tableTitle1 = "Data Bundle";
    $scope.tableTitle2 = "Bundle List";
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
        $location.path('/chartviewer/view/'+sqlid);
    };

}])

.controller('ChartViewerViewController', ['$log', '$window','$timeout', '$location','$scope','$routeParams', '$filter', '$appDataSet', '$appMenus','$appTemplates','$appQuery', '$appUser', '$appDesc', '$dashboardService', '$chartviewerService',
    function($log, $window, $timeout, $location, $scope, $routeParams, $filter, $dataset, $menu, $templates, $query, $user, $desc, $dashboard, $chartviewer){
    $scope.datasets    = [];
    $scope.wheremenus = [];
    $scope.selectmenus = [];
    $scope.templates = [];
    $scope.d3Data = [];
    $scope.user = $user.isLogined().user;
    $scope.selectedDate = {startDate:'',endDate:''}
    $scope.kek = '1';
    $scope.logout = function(){
        console.log('ChartViewerViewController logout...');
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


    //$scope.setSelectedDate = function(date, type){
    //    $log.log('..... start setSelectedDate .....' + date + ':' + type);
    //
    //    if(type == 1){
    //        $scope.selectedDate.startDate = new Date(date);
    //    }else{
    //        $scope.selectedDate.endDate = new Date(date);
    //    }
    //    $log.log($scope.selectedDate);
    //}


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

    $scope.logout = function(){
        if($user.logout()){
            $location.path('/login');
        }
    };

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
//		$scope.selectedSelect = -1;
    $scope.selectedwheres = [];
    $scope.selectedTemplate = {};
    $scope.selectedTemplate.tmplid = -1;


    $scope.printTemplates = function(sqlid, selid){
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
                    $scope.addTag('select',$scope.selectmenus[i].id, $scope.selectmenus[i].nm);
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
                            $scope.addTag('where', child.id, child.nm);
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

    $scope.setTemplates = function(){
        return $scope.selectedTemplate.tmplid;
    }

    $scope.$watch('selectedTemplate', function(){
        console.log('selectedTemplate watch...');
        if($scope.selectedTemplate.tmplid != -1)
            $scope.showDrawBtn = true;
    });


    $scope.changeZoom = function(zoom){
        console.log('$scope.changeMapZoom_googleHeatMap = function(zoom){');
    }

    $scope.tags = [];
    $scope.addTag = function(type, id, name){
        $log.log('addTag : [' + type  + ':' + id + ':' + name + ']');
        angular.forEach($scope.tags, function(tag, idx){
            if(tag.type == type){
                $scope.tags.splice(idx, 1);
            }
        });
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
        onDelete : function() {},
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
        ajax : true,
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

    $scope.drawD3 = function(){
        var sdt,edt;
        var today = new Date();

        var sdt = $scope.selectedDate.startDate ? new Date($scope.selectedDate.startDate):today.setMonth(today.getMonth() - 3);
        var edt = $scope.selectedDate.endDate ? new Date($scope.selectedDate.endDate):new Date();

        var promise = $query.get($routeParams.sqlid, $scope.selectedSelect,
            $scope.selectedTemplate.tmplid, $scope.selectedwheres,
            $filter('date')(sdt, 'yyyyMMdd') , $filter('date')(edt, 'yyyyMMdd') );

        promise.then(function(data){
            $scope.d3Data = data.resvalue ; // value
            $scope.template = data.template; // d3-pie
            $scope.showDrawD3 = true;
            $scope.showDownloadBtn = true;

            var chart = {};
            chart.data = data.resvalue;
            chart.template = data.template;
            chart.size = "span12";

            $log.log($scope.tags);
            var selarr = [],
                wharr = [];
            angular.forEach($scope.tags, function(tag){
               if(tag.type=='select'){
                   selarr.push(tag.name);
               }else{
                   wharr.push(tag.name);
               }
            });
            chart.options = angular.copy($scope.defaultWidgetOptions);
            chart.title = selarr.join(",");
            chart.filterdesc =  wharr.join(",") + ' / ' + $filter('date')(sdt, 'yyyyMMdd') + '~' + $filter('date')(edt, 'yyyyMMdd');
            $scope.charts.push(chart);
            //$scope.tags.splice(0,$scope.tags.length);
            selarr = [], wharr = [];
        });

    };

    $scope.$on('$routeChangeSuccess', function () {
        //
    });


    $scope.getDnHeader =function(){
        var header = Object.keys($scope.d3Data[0]);
        return header;
    }

    $scope.getDnBody = function(){
        return $scope.d3Data;
    }

    $scope.getDnFilename = function(){
        var today = new Date().getTime();
        return $scope.sqlid + '_' + selid + '_' + today + '.csv';
    }


    $scope.clearDate = function(type){
        if(type == 'start'){
            $scope.selectedDate.startDate = '';
        }else if(type == 'end'){
            $scope.selectedDate.endDate = ''
        }
    }

}])


;
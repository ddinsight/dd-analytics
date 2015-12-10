angular.module('Wave.chartmaker.ctrl',[])


.controller('ModalInstanceCtrl', function($scope, $modalInstance, editedItem){
    $scope.editedItem = editedItem;
    $scope.save = function(){
        $modalInstance.close($scope.editedItem);
    };
    $scope.cancel = function(){
//        console.log('dismiss cancel..called');
//        $modalInstance.dismiss('cancel');
        $scope.editedItem.modalcmd = 'cancel';
        $modalInstance.close($scope.editedItem);

    };
    $scope.delete = function(){
        $scope.editedItem.modalcmd = 'delete';
        $modalInstance.close($scope.editedItem);
    };
})

.controller('ChartMakerController', ['$log','$window','$timeout', '$location','$scope','$routeParams', '$filter', '$dashboardService', '$adminQuery','$appUser', '$adminCommon',
    function($log, $window, $timeout, $location, $scope, $routeParams, $filter,  $dashboard, $adminquery, $user, $admincommon){
        $scope.logout = function(){
            console.log('ChartMakerController logout...');
            if($user.logout()){
                $location.path('/login');
            }
        }
        $log.log('--- start ChartMakerController ----');
        $scope.menus = [];
        $scope.leftMenus = function(){
            var promise = $dashboard.getMenus();
            promise.then(function(data){
                $scope.menus = JSON.parse(data[0].m1);
                $log.log('----$scope.leftMenus in ChartMakerController-----');
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
            if(url != '#'){
                $location.path(url);
            }
            return;
        };
        $scope.tableTitle1 = "Chart Maker";
        $scope.tableTitle2 = "Data List";

        $scope.datasets = [];
        $scope.metrics = [];
        $scope.filters = [];

        $scope.moveTo = function(sqlid){
            $log.log('move to ' + sqlid);
        };

        $scope.sqlid = -1;
}])

.controller('DatasetOfChartMakerController', ['$log','$window','$timeout', '$location','$scope','$routeParams', '$filter', '$sce','$compile', '$modal', '$dashboardService', '$adminQuery','$appUser', '$adminCommon',
    function($log, $window, $timeout, $location, $scope, $routeParams, $filter, $sce, $compile, $modal, $dashboard, $adminquery, $user, $admincommon){
        $scope.alerts = [];
        $scope.addAlert = function(type, msg, button){
            $scope.alerts.push({msg: msg, type:'danger', button: button});
            $timeout(function(){
                $window.pageSetUp();
            },100)
            return $scope.alerts.length-1;
        };

        $scope.closeAlert = function(index){
            $scope.alerts.splice(index,1);
        }
        $scope.$parent.datasets    = [];
        $scope.templates   = [];
        $scope.printDataSet = function(){
            var promise = $adminquery.get();
            promise.then(function(data){
                $scope.$parent.datasets = data;
                $log.log('------ $scope.printDataSet -----');
                $log.log(data);
            });
        };
        $scope.overrideOptions = {};
        $scope.tblSorting = [[ 0, "desc" ]];
        $scope.tableTitle1 = "Data Bundle";
        $scope.tableTitle2 = "Bundle List";
        $scope.tblColumns = [
            {"sTitle":"ID", "sWidth":"5%"}, {"sTitle":"NAME"}, {"sTitle":"DESCRIPTIONS"},{"sTitle":"SQL","sWidth":"40%"}, {"sTitle":"USE","sWidth":"5%"}
        ];

        $scope.columnDefs = [
            {"mDataProp":"sqlid", "aTargets":[0]},
            {"mDataProp":"sqlnm", "aTargets":[1]},
            {"mDataProp":"sqldesc", "aTargets":[2]},
            {"mDataProp":"sqlstmt", "aTargets":[3], "mRender":function(data,type,row){
                var __sqlstmt = ( row.sqlstmt && row.sqlstmt.length > 300 ? row.sqlstmt.substring(0, 299) + '...' : row.sqlstmt);
                __sqlstmt = __sqlstmt.replace(/\"/gi, "");
                return '<p rel="tooltip" data-placement="top" data-html="true" data-original-title="<h4>'+__sqlstmt+'</h4>" class="txt-color-red">'+__sqlstmt+'</p>';
            }},
            {"mDataProp":"useyn", "aTargets":[4]}
        ];
        $scope.overrideOptions.fnDrawCallback = function(){
            $window.pageSetUp();
        }

//        $scope.$parent.sqlid = -1;

        $scope.overrideOptions.afterCreationTableCallback = function(element, table){

            $(element).find('tbody').on('click', 'tr', function(){
                if($(this).hasClass('DTTT_selected')){
                }else{
                    table.$('tr.DTTT_selected').removeClass('DTTT_selected');
                    $(this).addClass('DTTT_selected');
                    $scope.$apply(function(){
                        $scope.$parent.sqlid = table.api(0).rows('.DTTT_selected').data()[0].sqlid;
                    });
                    $log.log('Selected sqlid is ' + $scope.$parent.sqlid);
                }
            });
            $(element).find('tbody').hover(function(){
                $(this).css('cursor','Default');
            });
            $(element).find('tbody').on('dblclick', 'tr', function(){
                if($(this).hasClass('DTTT_selected')){
                    $log.log('========= dblclick ========== DTTT_selected' );
                    $scope.$parent.sqlid = table.api(0).rows('.DTTT_selected').data()[0].sqlid;
                    $scope.edit();
                }else{
                    table.$('tr.DTTT_selected').removeClass('DTTT_selected');
                    $(this).addClass('DTTT_selected');
                    $log.log('========= dblclick ========== not DTTT_selected' );
                    $scope.$apply(function(){
                        $scope.$parent.sqlid = table.api(0).rows('.DTTT_selected').data()[0].sqlid;
                    });
                }
            });
        }

        $scope.printDataSet();

        $scope.moveTo = function(sqlid){
            $log.log('move to ' + sqlid);
//            $location.path('/chartviewer/view/'+sqlid);
        };

        $scope.add = function(){
            $log.log('$scope.add in DatasetOfChartMakerController');
        };
        $scope.editedItem = {};
        $scope.tagsOptions = {
            onLoad: function(select){}
        };
        $scope.editedItem.use_yns = [
            {text:'Use', value:'y'},
            {text:'Not Use', value:'n'},
        ];
        function onCreateEditor(){
            console.log('onCreateEditor start---->');
            $scope.editedItem.editorOptions = {
                lineNumbers: true,
                lineWrapping : true,
                indentWithTabs: true,
                onLoad : function(_editor){
                    if(!_editor) return;
                    $scope.editedItem.editor = _editor;
                    _editor.focus();
                    _doc = _editor.getDoc();
                    _editor.on("change", function(){
                        console.log('----------- onLoad ----------');
                        console.log(_editor.getValue());
                        console.log(_doc.lastLine());
//                        console.log(_editor.save());
                        setTimeout(function() {
                           _editor.refresh();
                        },100);
                        console.log('----------- onLoad ----------');
                    });

                },
                mode: 'text/x-mysql'
            };
            $scope.editedItem.tagsOptions = $scope.tagsOptions;
        };
        var editDlg;
        onCreateEditor();
        $scope.refreshCodemirror = true;
        $scope.modalOpended = false;
        $scope.edit = function(){
            if($scope.modalOpended){
                return;
            }
            $scope.modalOpended = true;
            $log.log('$scope.edit in DatasetOfChartMakerController [' + $scope.$parent.sqlid + ']');
            $scope.testOK = false;
            $scope.test_error = '';
            $scope.test_query = '';
            angular.forEach($scope.$parent.datasets, function(r){
                if(r.sqlid == $scope.$parent.sqlid){
                    $scope.editedItem.sqlid = r.sqlid;
                    $scope.editedItem.sqlnm = r.sqlnm;
                    $scope.editedItem.sqldesc = r.sqldesc;
                    $scope.editedItem.sqlstmt = r.sqlstmt;
                    $scope.editedItem.useyn = r.useyn;
                    $scope.editedItem.showdelbutton = (parseInt(r.selcnt) + parseInt(r.valcnt) + parseInt(r.colcnt)) < 1 ;
                }
            });
            var pu = $adminquery.getUsers([], '/'+ $scope.editedItem.sqlid);
            pu.then(function(uData){
                var tags = [], ntags = [];
                angular.forEach(uData, function(d){
                    console.log(d);
                    tags.push(d.id+'_'+d.opnm+'_'+d.email);
                    if(!_.isNull(d.sqlid)  && !_.isUndefined(d.sqlid)){
                        ntags.push(d.id + '_' + d.opnm + '_' + d.email);
                    }
                });
                $scope.editedItem.allUsers = tags;
                $scope.editedItem.users = ntags.join();
                $scope.editedItem.addUsers = function(templates){
                    if(!_.isUndefined(templates)){
                        $scope.editedItem.users = templates;
                        // console.log('$scope.editedItem.users is >>' + $scope.editedItem.users);
                    }
                }

                var editDlg = $modal.open({
                    templateUrl: CONFIG.preparePartialTemplateUrl('chartmaker-dataset-modal'),
                    controller: 'ModalInstanceCtrl',
                    backdrop : 'static',
                    size: 'lg',
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
            });


        };

        $scope.testOK = 0;
        $scope.editedItem.test_str = function(){
            if($scope.testOK == -1)
                return "Test Connection [Not yet or Error] query is " + $scope.test_query + " and error message is " + $scope.test_error;
            else if($scope.testOK == 1)
                return "Test Connection [Success]";
            else if($scope.testOK == 0)
                return "Ready to Test";
        }
        $scope.test_error = '';
        $scope.test_query = '';
        $scope.$watch('testOK', function(){
            $scope.editedItem.test_str();
        });

        $scope.editedItem.test = function(){
            console.log('------ $socpe.test started ------ ');
            console.log($scope.editedItem.editor);
            $scope.isSqlstmt = true;
            $scope.editedItem2 = {}; // for test q
            $scope.editedItem2.sqlstmt = $scope.editedItem.editor.getValue();
            console.log('before test Connection sqlstmt is ' + $scope.editedItem2.sqlstmt);
            q =  $scope.editedItem2;
            var p = $adminquery.testConnection(q);
            p.then(function(data){
                console.log(data);
                if(data.result == 'success'){
                    $scope.testOK = 1;
                    $scope.test_error = '';
                    $scope.test_query = '';
                }else{
                    $scope.testOK = -1;
                    $scope.test_error = 'error is [' + data.message + ']';
                    $scope.test_query = '  query is [' + data.query + ']';
                }
            });
        }
        $scope.save = function(){
                $scope.editedItem2 = {};
                $scope.isSqlstmt = true;
                $scope.editedItem2.sqlid = $scope.$parent.sqlid;
                $scope.editedItem2.dbtype = 'mysql';
                $scope.editedItem2.useyn = $scope.editedItem.useyn;
                $scope.editedItem2.sqlstmt = $scope.editedItem.editor.getValue();
                $scope.editedItem2.sqlnm = $scope.editedItem.sqlnm;
                $scope.editedItem2.sqldesc = $scope.editedItem.sqldesc;
                $scope.editedItem2.users = $scope.editedItem.users;

                q =  $scope.editedItem2;

                if(_.isUndefined(q.sqlid) || q.sqlid == ''){
                    delete q.sqlid;
                    var p = $adminquery.add(q);
                    p.then(function(data){
                        $scope.$parent.datasets = data;
                    });
                }else{
                    var p = $adminquery.edit(q);
                    p.then(function(data){
                        $scope.$parent.datasets = data;
                    });
                }

        }
        $scope.delete = function(){
            var button = {
                show:true,
                method:$scope.remove,
                text:'delete'
            };
            var aIdx = $scope.addAlert('danger', 'Please Confirm Do you really want to delete this Item?', button);
            console.log($scope.alerts);
        }
        $scope.remove = function(){
            $scope.editedItem.sqlid = $scope.$parent.sqlid;
            q = $scope.editedItem;

            var p = $adminquery.delete(q);
            p.then(function(data){
                $scope.$parent.datasets = data;
            });
            $scope.closeAlert($scope.alerts.length-1);
        }

        $scope.add = function(){
            $scope.$apply(function(){
                $scope.testOK = false;
                $scope.test_error = '';
                $scope.test_query = '';
                $scope.editedItem.sqlid = '';
                $scope.$parent.sqlid = ''
                $scope.editedItem.sqlnm = '';
                $scope.editedItem.sqldesc = '';
                $scope.editedItem.useyn = '';
                $scope.editedItem.sqlstmt = 'select * from ';
            });
            var pu = $adminquery.getUsers([], '/'+ 0);
            pu.then(function(uData){
                var tags = [], ntags = [];
                angular.forEach(uData, function(d){
                    tags.push(d.id+'_'+d.opnm+'_'+d.email);
                    if(!_.isNull(d.sqlid) && !_.isUndefined(d.sqlid)){
                        ntags.push(d.id + '_' + d.opnm + '_' + d.email);
                    }
                });
                $scope.editedItem.allUsers = tags;
                $scope.editedItem.users = ntags.join();
                $scope.editedItem.addUsers = function(templates){
                    if(!_.isUndefined(templates)){
                        $scope.editedItem.users = templates;
                    }
                }
                var editDlg = $modal.open({
                    templateUrl: CONFIG.preparePartialTemplateUrl('chartmaker-dataset-modal'),
                    controller: 'ModalInstanceCtrl',
                    size: 'lg',
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
                });

            });

        }

        $scope.refresh = function(){
            var adminquery_promise = $adminquery.get();
            adminquery_promise.then(function(data){
                // $scope.tblData = data;
                angular.forEach(data, function(d){
                    d.edit = '';
                    d.sqlstmtfl = d.sqlstmt.substring(0,40) + '...';
                });
                $scope.$parent.datasets = data;
            });
        };
}])

.controller('MetricOfChartMakerController', ['$log','$window','$timeout', '$location','$scope','$routeParams', '$filter','$modal', '$dashboardService', '$adminQuery','$adminSelect', '$appUser', '$adminCommon',
    function($log, $window, $timeout, $location, $scope, $routeParams, $filter, $modal, $dashboard, $adminquery,$adminselect, $user, $admincommon){
        $scope.modalOpended = false;
        $scope.alerts = [];
        $scope.addAlert = function(type, msg, button){
            $scope.alerts.push({msg: msg, type:'danger', button: button});
            console.log()
            $timeout(function(){
                $window.runAllForms();
            },100)
            return $scope.alerts.length-1;
        };
        $scope.closeAlert = function(index){
            $scope.alerts.splice(index,1);
        }

        $scope.tblDatas    = [];
        $scope.templates   = [];
        $scope.templatefulllist = {};
        $scope.templatefulllist.excludemap = [];
        $scope.printMetrics = function(sqlid){
            $log.log('---- $scope.printMetrics ---- [' +sqlid+ ']');
            if(sqlid > 0){
                var p = $adminselect.get([], '/'+$scope.$parent.sqlid);
                p.then(function(data){
                    $scope.$parent.metrics = data;
                });
            }
        };

        $scope.$parent.$watch(function(){
//            $log.log('$scope.$parent.$watch(function(){ ==> ' + $scope.$parent.sqlid);
            return $scope.$parent.sqlid;
        } , function(value){
            $log.log('$parent.$watched value is ' + value);
            if(value > -1){
                $scope.printMetrics(value);
                angular.forEach($scope.$parent.datasets, function(d){
                    if(d.sqlid == value){
                        $scope.$parent.currentdataset = d;
                    }
                });
            }
        });
        $scope.editedItem = {};

        function onCreateEditor(){
            console.log('onCreateEditor start---->');
            $scope.editedItem.editorOptions = {
                lineNumbers: true,
                lineWrapping : true,
                indentWithTabs: true,
                onLoad : function(_editor){
                    if(!_editor) return;
                    $scope.editedItem.editor = _editor;
                    _editor.focus();
                    _doc = _editor.getDoc();
                    _editor.on("change", function(){
                        console.log('----------- onLoad ----------');
                        console.log(_editor.getValue());
                        console.log(_doc.lastLine());
//                        console.log(_editor.save());
                        setTimeout(function() {
                           _editor.refresh();
                        },100);
                        console.log('----------- onLoad ----------');
                    });

                },
                mode: 'text/x-mysql'
            };
            $scope.editedItem.tagsOptions = $scope.tagsOptions;
        };
        var editDlg;
        onCreateEditor();

        $scope.refreshCodemirror = true;
        $log.log('------- MetricOfChartMakerController ------ ' + $window.wizard);
        $log.log($scope.$parent.sqlid);
        $scope.printMetrics($scope.$parent.sqlid);

        $scope.overrideOptions = {};
        $scope.tblSorting = [[ 0, "desc" ]];
        $scope.tableTitle1 = "Data Bundle";
        $scope.tableTitle2 = "Bundle List";
        $scope.tblColumns = [
            {"sTitle":"ID", "sWidth":"5%"}, {"sTitle":"NAME","sWidth":"20%"}, {"sTitle":"DESCRIPTIONS","sWidth":"20%"},{"sTitle":"SQL","sWidth":"40%"}
        ];

        $scope.columnDefs = [
            {"mDataProp":"selid", "aTargets":[0]},
            {"mDataProp":"selnm", "aTargets":[1]},
            {"mDataProp":"seldesc", "aTargets":[2]},
            {"mDataProp":"selcols", "aTargets":[3], "mRender":function(data,type,row){
                var grpstr = '', havingstr = '', orderstr = '';
                if (row.grpbystmt && row.grpbystmt.length > 0) grpstr = 'group by ' + row.grpbystmt;
                if (row.havingstmt && row.havingstmt.length > 0) havingstr = 'group by ' + row.havingstmt;
                if (row.orderbystmt && row.orderbystmt.length > 0) orderstr = 'group by ' + row.orderbystmt;

                return 'select ' + row.selcols + ' from ( ... ) x ' + grpstr + ' ' + havingstr + ' ' + orderstr;
            }}
        ];
        $scope.overrideOptions.fnDrawCallback = function(){
            $window.runAllForms();
        }


        $scope.overrideOptions.afterCreationTableCallback = function(element, table){

            $(element).find('tbody').on('click', 'tr', function(){
                console.log('in tobdy:' + $(this).hasClass('DTTT_selected'));
                if($(this).hasClass('DTTT_selected')){

                }else{
                    table.$('tr.DTTT_selected').removeClass('DTTT_selected');
                    $(this).addClass('DTTT_selected');

                    if(table.api(0)) $scope.selid = table.api(0).rows('.DTTT_selected').data()[0].selid;
                    $log.log($scope.selid);
                }
            });
            $(element).find('tbody').hover(function(){
                $(this).css('cursor','Default');
            });
            $(element).find('tbody').on('dblclick', 'tr', function(){
                console.log('in tobdy:' + $(this).hasClass('DTTT_selected'));
                if($(this).hasClass('DTTT_selected')){
                    if(table.api(0)) $scope.selid = table.api(0).rows('.DTTT_selected').data()[0].selid;
                    $scope.edit();
                }else{
                    table.$('tr.DTTT_selected').removeClass('DTTT_selected');
                    $(this).addClass('DTTT_selected');
                    if(table.api(0)) $scope.selid = table.api(0).rows('.DTTT_selected').data()[0].selid;
                }
            });

        }

        $scope.editedItem.tmpTags = {};
        $scope.editedItem.tagsOptions = {
            onLoad : function(tmpTags){
                $scope.editedItem.tmpTags = tmpTags;
            }
        };


        $scope.add = function(){

            $scope.testOK = false;
            $scope.test_error = '';
            $scope.test_query = '';
            var p = $adminselect.getTemplates([], '/'+$scope.$parent.sqlid + '/0');
            // console.log("----------------adminselect.get() ----------------");
            p.then(function(data){
                var tags = [], ntags = [];
                angular.forEach(data, function(d){
                    if(d.tmplnm.toLowerCase().indexOf('map')==-1)
                        $scope.templatefulllist.excludemap.push({'k':d.tmplid+'_'+d.tmplnm.replace(' ',''), 'v':d.filepath});
                    tags.push(d.tmplid+'_'+d.tmplnm.replace(' ',''));
                    if(!_.isNull(d.sqlid))
                        ntags.push(d.tmplid+'_'+d.tmplnm.replace(' ',''));

                });
                $scope.editedItem.templateTags = tags;
                $scope.editedItem.templates = ntags.join();

                $scope.editedItem.tmpTags.tags = $scope.editedItem.templates;
                $scope.editedItem.selid = '';
                $scope.editedItem.selnm = '';
                $scope.editedItem.seldesc = '';
                $scope.editedItem.colstmt = '';
                $scope.editedItem.grpbystmt = '';
                $scope.editedItem.havingstmt = '';
                $scope.editedItem.orderbystmt = '';
                var r = {
                    selcols:'\n',
                    grpbystmt: '\n',
                    havingstmt: '\n',
                    orderbystmt: '\n'
                };
                $scope.editedItem.fullsqlstr = 'select \n' +r.selcols + '\nfrom (\n' + $scope.$parent.currentdataset.sqlstmt + '\n ) airplug'
                  + '\n' + (r.grpbystmt && r.grpbystmt.length>0?    'group by ' + r.grpbystmt:'')
                  + '\n' + (r.havingstmt && r.havingstmt.length>0?  'having   ' + r.havingstmt:'')
                  + '\n' + (r.orderbystmt && r.orderbystmt.length>0?'order by ' + r.orderbystmt:'');
                $log.log('----- query start ---- ');

                $timeout(function(){
                    var word = $scope.editedItem.editor.getDoc();
                    word.markText({line:0,ch:0},{line:1,ch:0},{readOnly:true,className:'bg-color-blueLight'});
                    word.markText({line: r.selcols.split('\n').length+1,ch:0},{line:r.selcols.split('\n').length + 2 + $scope.$parent.currentdataset.sqlstmt.split('\n').length+1,ch:0},{readOnly:true,className:'bg-color-blueLight'});
                    var groupbyline = (r.selcols.split('\n').length + 2 + $scope.$parent.currentdataset.sqlstmt.split('\n').length+1);
                    $log.log('group by line number is ' + groupbyline);
                    word.markText({line:groupbyline,ch:0},{line:groupbyline,ch:9},{readOnly:true,className:'bg-color-blueLight'});
                    var havinglline = groupbyline + r.grpbystmt.split('\n').length
                    word.markText({line:havinglline,ch:0},{line:havinglline,ch:9},{readOnly:true,className:'bg-color-blueLight'});
                    var orderbylline = havinglline + r.havingstmt.split('\n').length
                    word.markText({line:orderbylline,ch:0},{line:orderbylline,ch:9},{readOnly:true,className:'bg-color-blueLight'});

                },1000);
                var editDlg = $modal.open({
                        templateUrl: CONFIG.preparePartialTemplateUrl('chartmaker-metric-modal'),
                        controller: 'ModalInstanceCtrl',
                        size: 'lg',
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
                    });


            });

        }

        $scope.edit = function(){
            if($scope.modalOpended){
                return;
            }
            $scope.modalOpended = true;
            $log.log('--- $scope.edit of MetricsofChartmakerController ----');
            $scope.testOK = false;
            $scope.test_error = '';
            $scope.test_query = '';
            angular.forEach($scope.$parent.metrics, function(r){
                if(r.selid == $scope.selid){
                    $scope.editedItem.selid = r.selid;
                    $scope.editedItem.selnm = r.selnm;
                    $scope.editedItem.seldesc = r.seldesc;
                    $scope.editedItem.selcols = r.selcols;
                    $scope.editedItem.grpbystmt = r.grpbystmt;
                    $scope.editedItem.havingstmt = r.havingstmt;
                    $scope.editedItem.orderbystmt = r.orderbystmt;

                    $scope.editedItem.fullsqlstr = 'select \n' +r.selcols + '\nfrom (\n' + $scope.$parent.currentdataset.sqlstmt + '\n ) airplug'
                      + '\n' + (r.grpbystmt && r.grpbystmt.length>0?    'group by ' + r.grpbystmt:  'group by ')
                      + '\n' + (r.havingstmt && r.havingstmt.length>0?  'having   ' + r.havingstmt: 'having   ')
                      + '\n' + (r.orderbystmt && r.orderbystmt.length>0?'order by ' + r.orderbystmt:'order by ');
                    $log.log('----- query start ---- ');

                    $timeout(function(){
                        var word = $scope.editedItem.editor.getDoc();
                        word.markText({line:0,ch:0},{line:1,ch:0},{readOnly:true,className:'bg-color-blueLight'});
                        word.markText({line: r.selcols.split('\n').length+1,ch:0},{line:r.selcols.split('\n').length + 2 + $scope.$parent.currentdataset.sqlstmt.split('\n').length+1,ch:0},{readOnly:true,className:'bg-color-blueLight'});
                        var groupbyline = (r.selcols.split('\n').length + 2 + $scope.$parent.currentdataset.sqlstmt.split('\n').length+1);
                        $log.log('group by line number is ' + groupbyline);
                        word.markText({line:groupbyline,ch:0},{line:groupbyline,ch:9},{readOnly:true,className:'bg-color-blueLight'});
                        var havinglline = groupbyline + r.grpbystmt.split('\n').length
                        word.markText({line:havinglline,ch:0},{line:havinglline,ch:9},{readOnly:true,className:'bg-color-blueLight'});
                        var orderbylline = havinglline + r.havingstmt.split('\n').length
                        word.markText({line:orderbylline,ch:0},{line:orderbylline,ch:9},{readOnly:true,className:'bg-color-blueLight'});

                    },1000);

                    $log.log($scope.$parent.currentdataset.sqlstmt + ":" + $scope.$parent.currentdataset.sqlstmt.split('\n').length);
                    if(_.isNull(r.havingstmt)) $scope.editedItem.havingstmt = '';
                    else $scope.editedItem.havingstmt = r.havingstmt;

                    if(_.isNull(r.orderbystmt) || _.isUndefined(r.orderbystmt)) $scope.editedItem.orderbystmt = '';
                    else $scope.editedItem.orderbystmt = r.orderbystmt;

                    var p = $adminselect.getTemplates([], '/'+$scope.$parent.sqlid + '/' + r.selid);

                    p.then(function(data){
                        var tags = [], ntags = [];
                        angular.forEach(data, function(d){
                            if(d.tmplnm.toLowerCase().indexOf(' map')==-1)
                                $scope.templatefulllist.excludemap.push({'k':d.tmplid+'_'+d.tmplnm.replace(' ',''), 'v':d.filepath});
                            tags.push(d.tmplid+'_'+d.tmplnm.replace(' ',''));
                            if(!_.isNull(d.sqlid))
                                ntags.push(d.tmplid+'_'+d.tmplnm.replace(' ',''));
                        });

                        $scope.editedItem.templateTags = tags;
                        $scope.editedItem.templates = ntags.join();

                        $scope.showpop = true;
                        $scope.editedItem.tmpTags.tags = $scope.editedItem.templates;

                        var editDlg = $modal.open({
                            templateUrl: CONFIG.preparePartialTemplateUrl('chartmaker-metric-modal'),
                            controller: 'ModalInstanceCtrl',
                            size: 'lg',
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

                    });
                }
            });
        }
        $scope.testOK = 0;
        $scope.editedItem.test_str = function(){
            if($scope.testOK == -1)
                return "Test Connection [Not yet or Error] query is " + $scope.test_query + " and error message is " + $scope.test_error;
            else if($scope.testOK == 1)
                return "Test Connection [Success]";
            else if($scope.testOK == 0)
                return "Ready to Test(Metric)";
        }
        $scope.editedItem.test = function(){
            console.log('------ $socpe.test started ------ ');
            // $scope.isSqlstmt = true;
            $scope.editedItem.selcols = $scope.editedItem.editor.getValue();
            $scope.editedItem.grpbystmt = '';
            $scope.editedItem.havingstmt = '';
            $scope.editedItem.orderbystmt = '';
            $scope.editedItem.sqlid = $scope.$parent.sqlid;
            //var groupbyregex = /^([a(\)\s\n\r)]+(group by))+([\w\(\s\n\r\,\)\(\>\=\<\%\-\'\~])+having/m
            var groupbyregex = /^((group by))+([\w\(\s\n\r\,\)\>\=\<\%\-\'\~\"\_\/])+having/m
            var havingregex = /having([\w\(\s\n\r\,\)\(\>\=\<\%\-\'\~])+order by/m
            var orderbyregex = /^(order by\s)+([\w\,\s\r\n])*/m
            var mainstmt =  $scope.editedItem.selcols.split(') airplug')[0];
            var otherstmt = $scope.editedItem.selcols.split(') airplug')[1];
            var otherstmtstr = [];
            console.log('----- 1 console.log(otherstmtstr); ---- ');
            console.log(otherstmtstr);
            console.log(groupbyregex.exec(otherstmt)[0].replace('group by','').replace('having','').replace(/^\s+|\s+$/g,''));

            if(groupbyregex.exec(otherstmt) && groupbyregex.exec(otherstmt)[0].replace('group by','').replace('having','').replace(/^\s+|\s+$/g,'')){
                otherstmtstr.push(') airplug group by '+ groupbyregex.exec(otherstmt)[0].replace('group by','').replace('having','').replace(/^\s+|\s+$/g,''));
            }
            console.log('----- 2 console.log(otherstmtstr); ---- ');
            console.log(otherstmtstr);
            if(havingregex.exec(otherstmt) && havingregex.exec(otherstmt)[0].replace('having','').replace('order by','').replace(/^\s+|\s+$/g,'')){
                otherstmtstr.push(' having ' + havingregex.exec(otherstmt)[0].replace('having','').replace('order by','').replace(/^\s+|\s+$/g,''));
                console.log('havingregex : ' + havingregex.exec(otherstmt)[0].replace('order by'));
            }
            console.log('----- 3 console.log(otherstmtstr); ---- ');
            console.log(otherstmtstr);
            if(orderbyregex.exec(otherstmt) && orderbyregex.exec(otherstmt)[0].replace('order by','').replace(/^\s+|\s+$/g,'').length > 0){
                otherstmtstr.push(' order by ' + orderbyregex.exec(otherstmt)[0].replace('order by','').replace(/^\s+|\s+$/g,''));
                console.log('orderbyregex : ' + orderbyregex.exec(otherstmt)[0]);
            }
            console.log('----- 4 console.log(otherstmtstr); ---- ');
            console.log(otherstmtstr);
            $scope.editedItem.selcols = mainstmt + otherstmtstr.join("");
            console.log('before test Connection sqlstmt is ' + $scope.editedItem.selcols);
            var q = {};
            q.selcols = $scope.editedItem.selcols;
            q.sqlid = $scope.editedItem.sqlid;
            q.selid = $scope.editedItem.selid;

            $scope.test_error = '';
            $scope.test_query = '';
            var p = $adminselect.testConnection(q, '/' + $scope.editedItem.sqlid);
            p.then(function(data){
                console.log(data);
                if(data.result == 'success'){
                    $scope.testOK = 1;
                    $scope.test_error = '';
                    $scope.test_query = '';
                }else{
                    $scope.testOK = -1;
                    $scope.test_error = 'error is [' + data.message + ']';
                    $scope.test_query = '  query is [' + data.query + ']';
                }
            });
            // }
        }

        $scope.editedItem.addTemplates = function(str){
            $scope.editedItem.templates = str;
            console.log('$scope.addTemplate in controller is ' + $scope.editedItem.templates);
        }


        $scope.save = function(){
            $scope.isSqlstmt = true;
            console.log(' --- save ---- ');
            console.log($scope.editedItem);
            var q = {};
            q.sqlid = $scope.$parent.sqlid;
            q.selid = $scope.editedItem.selid;
            q.selnm = $scope.editedItem.selnm;
            q.seldesc = $scope.editedItem.seldesc;
            q.templates = $scope.editedItem.templates;
            var fullsqlstr = $scope.editedItem.editor.getValue();
            $log.log('------------ fullsqlstr -------');
            $log.log(fullsqlstr);
            //var selectregex = /(^[(select\r)\s]*)([\w\(\s\n\r\,\)\(\>\=\<\%\-\'\~\*\/\.])*(from \()$/m
            var selectregex = /(^[(select\r)\s]*)([\w\s\n\r\,\)\(\>\=\<\%\-\+\/^\'\~\*\/\.ㄱ-ㅎ|ㅏ-ㅣ|가-힣])+(from \()$/m
//            var groupbyregex = /^([a(\)\s\n\r)]+(group by))+(.)*[\r\n(having)$]*/m
//            var havingregex = /(having)+(.)*[(order by)\r\n]*/m
//            var orderbyregex = /^(order by\s)+([\w\,\s\r\n])*/m
            var groupbyregex = /^((group by))+([\w\(\s\n\r\,\)\>\=\<\%\-\'\~\"\_\/])+having/m
            //var groupbyregex = /^([a(\)\s\n\r)]+(group by))+([\w\(\s\n\r\,\)\(\>\=\<\%\-\'\~])+having/m
            var havingregex = /having([\w\(\s\n\r\,\)\(\>\=\<\%\-\'\~])+order by/m
            var orderbyregex = /^(order by\s)+([\w\,\s\r\n])*/m

            q.selcols = selectregex.exec(fullsqlstr);
console.log('selcols:' + q.selcols);
            q.grpbystmt = groupbyregex.exec(fullsqlstr.split(') airplug')[1]);
console.log('grpbystmt:' + q.grpbystmt);
            q.havingstmt = havingregex.exec(fullsqlstr.split(') airplug')[1]);
            q.orderbystmt = orderbyregex.exec(fullsqlstr.split(') airplug')[1]);
//console.log(orderbyregex.exec(fullsqlstr.split(') airplug')[1]));
//console.log(q.selcols[0].replace('select','').replace('from (','').replace(/^\s+|\s+$/g, ''));

            q.selcols = (q.selcols!=null) ? q.selcols[0].replace('select','').replace('from (','').replace(/^\s+|\s+$/g, ''):'';

            q.grpbystmt = (q.grpbystmt!=null) ? q.grpbystmt[0].replace('group by','').replace('having','').replace(/^\s+|\s+$/g, ''):'';
            q.havingstmt = (q.havingstmt!=null) ? q.havingstmt[0].replace(/\n/g,'').replace('having','').replace('order by','').replace(/^\s+|\s+$/g, ''):'';
            q.orderbystmt = (q.orderbystmt!=null) ? q.orderbystmt[0].replace(/\n/g,'').replace('order by','').replace(/^\s+|\s+$/g, ''):'';

            console.log('-----------------  q   ---------------------');
            console.log(q);

            if(angular.isUndefined(q.selid) || q.selid == ''){
                delete q.selid;
                console.log('var p = $adminselect.add( before ');
                var p = $adminselect.add(q, '/'+$scope.$parent.sqlid);
                p.then(function(dt){
                    $scope.$parent.metrics = dt;
                });

            }else{
                console.log('var p = $adminselect.edit( before ');
                var p = $adminselect.edit(q,'/'+$scope.$parent.sqlid);
                p.then(function(dt){
                    $scope.$parent.metrics = dt;
                    console.log('----- edit result dt is -------');
                    console.log($scope.$parent.metrics);
                });
            }
        }

        $scope.delete = function(){
            var button = {
                show:true,
                method:$scope.remove,
                text:'delete'
            };
            var aIdx = $scope.addAlert('danger', 'Please Confirm Do you really want to delete this Item?', button);
            console.log($scope.alerts);
        }
        $scope.remove = function(){
            var q = {};
            q.sqlid = $scope.$parent.sqlid;
            q.selid = $scope.selid;
            console.log('-------- remove -------');
            console.log(q);
            console.log('-------- remove -------');
            var p = $adminselect.delete(q, '/'+$scope.$parent.sqlid);
            p.then(function(data){
                $scope.$parent.metrics = data;
            });
            $scope.closeAlert($scope.alerts.length-1);
        }
}])

.controller('FilterOfChartMakerController', ['$log','$window','$timeout', '$location','$scope','$routeParams', '$filter', '$dashboardService','$adminQuery','$adminSelect','$adminWhColumn','$adminWhValue', '$appUser', '$adminCommon','$modal',
    function($log, $window, $timeout, $location, $scope, $routeParams, $filter, $dashboard, $adminquery, $adminselect, $adminwhcolumn, $adminwhvalue, $user, $admincommon,$modal){
        $scope.alerts = [];
        $scope.addAlert = function(type, msg, button){
            $scope.alerts.push({msg: msg, type:'danger', button: button});
            console.log()
            $timeout(function(){
                $window.pageSetUp();
            },100)
            return $scope.alerts.length-1;
        };

        $scope.closeAlert = function(index){
            $scope.alerts.splice(index,1);
        }

        $scope.tab1 = {'disabled':true, 'active':false}
        $scope.tab2 = {'disabled':true, 'active':false}
        $scope.whid = 0;

        $scope.filterlist = {};
        $scope.filterlist.overrideOptions = {};
        $scope.filterlist.tblSorting = [[ 0, "desc" ]];
        $scope.filterlist.tblColumns = [
            {"sTitle":"ID", "sWidth":"5%"}, {"sTitle":"FILTER NAME"}, {"sTitle":"FILTER"},{"sTitle":"OPERAND"}, {"sTitle":"TYPE"}
        ];

        $scope.filterlist.columnDefs = [
            {"mDataProp":"whid", "aTargets":[0]},
            {"mDataProp":"colnm", "aTargets":[1],"mRender":function(data,type,row){
                return row.colnm;
            }},
            {"mDataProp":"colstr", "aTargets":[2],"mRender":function(data,type,row){
                return row.colstr;
            }},
            {"mDataProp":"operand", "aTargets":[3], "mRender":function(data,type,row){
                var res;
                switch (row.operand) {
                    case '=':
                        res = 'Match';
                        break;
                    case 'in':
                        res = 'Contain';
                        break;
                    case 'not in':
                        res = 'Exclude';
                        break;
                    case '>=':
                        res = 'Greater than';
                        break;
                    case '<=':
                        res = 'Less than';
                        break;
                    case 'REGEXP':
                        res = 'Contain(REGEXP)';
                        break;
                    case 'NOT REGEXP':
                        res = 'Exclude(REGEXP)';
                        break;
                }
                return res;

            }},
            {"mDataProp":"filtertype", "aTargets":[4]}
        ];
        $scope.filterlist.overrideOptions.fnDrawCallback = function(){
            $window.runAllForms();
        }

        $scope.filterlist.data = [];
        $scope.filterlist.overrideOptions.afterCreationTableCallback = function(element, table){

            $(element).find('tbody').on('dblclick', 'tr', function(){
                if($(this).hasClass('DTTT_selected')){
                    $scope.editedItem.whid = table.api(0).rows('.DTTT_selected').data()[0].whid;
                    $scope.edit();
                }else{
                    table.$('tr.DTTT_selected').removeClass('DTTT_selected');
                    $(this).addClass('DTTT_selected');
                    $scope.editedItem.whid = table.api(0).rows('.DTTT_selected').data()[0].whid;

                }
            });
            $(element).find('tbody').hover(function(){
                $(this).css('cursor','Default');
            });
            $(element).find('tbody').on('click', 'tr', function(){
                if($(this).hasClass('DTTT_selected')){
                    $scope.editedItem.whid = table.api(0).rows('.DTTT_selected').data()[0].whid;
                    $scope.whid = $scope.editedItem.whid;
                }else{
                    table.$('tr.DTTT_selected').removeClass('DTTT_selected');
                    $(this).addClass('DTTT_selected');
                    $scope.editedItem.whid = table.api(0).rows('.DTTT_selected').data()[0].whid;
                    $scope.whid = $scope.editedItem.whid;
                }
            });

        }
        $scope.editedItem = {};
        $scope.availablecolumns_disabled = false;
        $scope.edit = function(value){
            angular.forEach($scope.filterlist.data, function(d){
                if(d.whid == $scope.editedItem.whid){
                    $scope.editedItem = d;
                    $scope.editedItem.colstr = d.colstr;
//console.log($scope.editedItem);
                    if($scope.editedItem.filtertype != 'Predefined') {
                        $scope.getRegex($scope.$parent.sqlid, $scope.editedItem.whid);
                    }
                }
            });
            $scope.availablecolumns_disabled = true;

            //$log.log('--------- $scope.edit --------');
            //$log.log($scope.editedItem);
            //$log.log($scope.editedItem);
            if($scope.editedItem.filtertype == 'Predefined'){
                $scope.$apply(function(){ $scope.tab2.dsiabled = true; $scope.tab1.active = true; });
            }else{
                $scope.$apply(function(){ $scope.tab1.dsiabled = true; $scope.tab2.active = true; });
            }
            $scope.$apply(function(){
                $scope.current_state = 1;
            });
            $scope.printFilters($scope.$parent.sqlid);

        }
        $scope.add = function(){

            $scope.availablecolumns_disabled = false;
            $log.log(' ------ $scope.add ------- ');
            $scope.valuelist.data = [];
            $scope.editedItem.colnm = '';
            $scope.editedItem.operand = '';
            $scope.editedItem.colstr = '';
            $scope.$apply(function(){ $scope.current_state = 1; $scope.tab1.dsiabled = false; $scope.tab2.dsiabled = true;  $scope.tab1.active = true; $scope.tab2.active = false; });
            $scope.printFilters($scope.$parent.sqlid);

        }

        $scope.delete = function(){
            var button = {
                show:true,
                method:$scope.remove,
                text:'delete'
            };
            var aIdx = $scope.addAlert('danger', 'Please Confirm Do you really want to delete this Item?', button);
            console.log($scope.alerts);
        }

        $scope.remove = function(){
            // filter delete
            var q = {}
            q.whid = $scope.whid;
            var p = $adminwhcolumn.delete(q,'/'+$scope.$parent.sqlid);
            p.then(function(data){
                $scope.filterlist.data = data;
                $scope.closeAlert($scope.alerts.length-1);
            },function(btn){
                console.log('$adminwhcolumn.delete error !!!! ')
            });
        }
        $scope.quote = function(str) {
            return str.replace(/([.?*+^$[\]\\(){}|-])/g, '\$1');
//            return str;
        };



        $scope.select2Options = {}

        $scope.valuelist = {};
        $scope.valuelist.overrideOptions = {
            'oTableTools' : {
                "aButtons": [
                    {
                        "sExtends": "div",
                        "sButtonText": "Add",
                        "fnClick": function ( nButton, oConfig, oFlash ) {
                            $scope.add_value();
                        }
                    },
                    {
                        "sExtends": "div",
                        "sButtonText": "Edit",
                        "fnClick": function ( nButton, oConfig, oFlash ) {
                            $scope.edit_value();
                        }
                    },
                    {
                        "sExtends": "div",
                        "sButtonText": "Delete",
                        "fnClick": function ( nButton, oConfig, oFlash ) {
                            $scope.delete_value();
                        }
                    }
                ]
            }

        };

        $scope.valuelist.overrideOptions.onLoad = function(table){
            $scope.valuelist.wtable = table;
        }
        $scope.valuelist.tblSorting = [[ 0, "desc" ]];
        $scope.valuelist.tblColumns = [
            {"sTitle":"<input type='checkbox'></input>","sWidth":"10%"}, {"sTitle":"VALUES"}, {"sTitle":"DISPLAY VALUE NAME"}
        ];

        $scope.valuelist.columnDefs = [
            {"mDataProp":"chk", "aTargets":[0], "mRender":function(data,type,row){
                return '<input type="checkbox" ' + (row.chk ? 'disabled="disabled"' : '') + ' id="cr_' + row.valstr + '" ' + (row.chk ? 'checked' : '') + '/>';
            }},
            {"mDataProp":"valstr", "aTargets":[1]},
            {"mDataProp":"valnm", "aTargets":[2]},
        ];

        $scope.valuelist.data = [];
        $scope.current_state = 0;
        $scope.cancel = function(){
            $scope.editedItem = {};
            $scope.current_state = 0;
            $scope.printFilters($scope.$parent.sqlid);
        }


        $scope.editedItem.type = 'Predefined';

        $scope.save = function(type){
            var tab = type==0?'Predefined':'Customezble';
            $log.log('['+ tab + ']---- $scope.save0 ---- whid:[' + $scope.editedItem.whid + ']');

            if($scope.editedItem.colnm == ''){
                var aIdx = $scope.addAlert('danger', 'Please input Filter name!');
                return;
            }
            var q = {
                'colnm':$scope.editedItem.colnm,
                'operand':$scope.editedItem.operand,
                'colstr':$scope.editedItem.colstr.value,
                'coltype' :'varchar',
                'filtertype': tab,
                'sqlid':$scope.$parent.sqlid
            };
            $log.log(q);
            //$log.log($scope.valuelist.wtable.fnGetNodes());
            var vallist = [];
            //if(type == 0){
            //    $('input[type="checkbox"]', $scope.valuelist.wtable.fnGetNodes()).each(function(i){
            //        $log.log(' input[type="checkbox"] row [' + i + '] : '  + $(this).is(':checked'));
            //        if($(this).is(':checked')){
            //            var sData = $scope.valuelist.wtable.fnGetData(i);
            //            var inputed_valnm = $('input:text', $(this).parent().parent()).val();
            //            $log.log(inputed_valnm + '/' + sData.valstr);
            //            if(inputed_valnm.length < 1){
            //                $scope.addAlert('danger', 'Please check "DISPLAY VALUE NAME" field is filled!');
            //                return;
            //            }
            //            vallist.push({'valnm':inputed_valnm, 'valstr':sData.valstr});
            //        }
            //    });
            //    q.vallist = JSON.stringify(vallist);
            //}else{
            //    q.vallist = JSON.stringify([{'valnm':$scope.quote($scope.editedItem.regex), 'valstr':$scope.quote($scope.editedItem.regex)}] );
            //}

            q.whid = angular.isDefined($scope.editedItem.whid)?$scope.editedItem.whid:0;
            var p;
            if(q.whid > 0){
                p = $adminwhcolumn.edit(q, '/'+$scope.$parent.sqlid);
            }else{
                delete q.whid
                p = $adminwhcolumn.add(q, '/'+$scope.$parent.sqlid);
            }
            p.then(function(dt){
                $scope.editedItem.whid = dt.whid;
                $scope.whid = dt.whid;
                $scope.editedItem.colnm = dt.colnm;
                $scope.editedItem.operand = dt.operand;
                $scope.editedItem.colstr = dt.colstr;
                $scope.valuelist.data = dt.data;
                $log.log('----------- save result of customizable ----------');
                $log.log(dt);
                $log.log('----------- save result of customizable ----------');
                if(dt.filtertype.toLowerCase() == 'customizble'){
                    angular.forEach($scope.valuelist.data, function(d){
                       $scope.editedItem.regex = d.valstr;
                    });
                }

            });
        }


        $scope.printFilters = function(sqlid){
            $log.log('printFilters begin ..... ');
            var p = $adminwhcolumn.get([], '/'+ sqlid);
            p.then(function(data){
                angular.forEach(data, function(d){
                    d.edit = '';
                });
                $log.log('--- printFilters result is --- ');
                $log.log(data);
                $scope.filterlist.data = data;
            });
            var p2 = $adminwhcolumn.getAvailableColumns([], '/'+$scope.$parent.sqlid);
            p2.then(function(data){
                $scope.availablecolumns = [];
                angular.forEach(data, function(d){
                    $scope.availablecolumns.push({'text': d.dspnm, 'value': d.value});
                });
                $log.log('--- printFilters availablecolumns result is --- ');
                $log.log($scope.availablecolumns);
                $log.log($scope.editedItem.colstr);
                $log.log('--- printFilters availablecolumns result is ended --- ');
            });
        }

        $scope.getRegex = function(sqlid, whid){
            var p3 = $adminwhcolumn.getRegex([], '/'+sqlid + '/' + whid);
            p3.then(function(data){
                $log.log('--------------- getRegex ---------');
                $log.log(data);
                $log.log('--------------- getRegex ---------');
                $scope.editedItem.regex = data.valstr;
            });
        }
        $scope.editedItem = {'colstr':''};
        $scope.printAvailableValues = function(sqlid, whid, colstr){
            $log.log('----------$scope.printAvailableValues----------- ');
            $log.log(colstr);
            if(angular.isDefined(colstr)){
                var q = {'colstr':colstr};
                var p2 = $adminwhcolumn.getAvailableValues(q, '/'+ sqlid+'/' + (angular.isDefined(whid)?whid:'') );
                p2.then(function(data){
                    $scope.valuelist.data = data;
                    $log.log('----------Result of $scope.printAvailableValues----------- ');
                    $log.log($scope.valuelist.data);
                    $log.log('----------Result of $scope.printAvailableValues----------- ');
//                    if($scope.editedItem.filtertype.toLowerCase() == 'customizble'){
//                        angular.forEach($scope.valuelist.data, function(d){
//                           $scope.editedItem.regex = d.valstr;
//                        });
//                    }
                });
            }
        }

        $scope.printValues = function(sqlid, whid, colstr){
            $log.log('----------$scope.printValues----------- ');
            $log.log(sqlid);
            $log.log(whid);
            $log.log(colstr);
            if(angular.isDefined(colstr)){
                var q = {'colstr':colstr};
                var p2 = $adminwhvalue.get(q, '/'+ sqlid+'/' + (angular.isDefined(whid)?whid:'') );
                p2.then(function(data){
                    $scope.valuelist.data = data;
                    $log.log('----------Result of $scope.printValues----------- ');
                    $log.log($scope.valuelist.data);
                    $log.log('----------Result of $scope.printValues----------- ');

                });
            }
        }

        $scope.$watch(function(){
          return $scope.editedItem.colstr;
        }, function(value){
            if(value != ''){
                $scope.printValues($scope.$parent.sqlid, $scope.editedItem.whid, value);
            }
        });
        $scope.$parent.$watch(function(){
            return $scope.$parent.sqlid;
        } , function(value){
            $log.log('$parent.$watched value is ' + value);
            if(value > -1){
                //////////////////////////////////////////////////
                // clear filter data and valuelist data
                //////////////////////////////////////////////////
                $scope.printFilters(value);
                $scope.valuelist.data = [];
                $scope.editedItem = {};
                $scope.current_state = 0;
                angular.forEach($scope.$parent.datasets, function(d){
                    if(d.sqlid == value){
                        $scope.$parent.currentdataset = d;
                    }
                });
            }
        });


        $scope.add_value = function(){
            $scope.editedItem.valid = '';

            var editDlg = $modal.open({
                templateUrl: CONFIG.preparePartialTemplateUrl('chartmaker-add-value-modal'),
                controller: 'ModalInstanceCtrl',
                size: 'sm',
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
                    $scope.save_value();
                }
            });
        }

        $scope.edit_value = function(){

            $('input[type="checkbox"]', $scope.valuelist.wtable.fnGetNodes()).each(function(i){
                //$log.log(' input[type="checkbox"] row [' + i + '] : '  + $(this).is(':checked'));
                if($(this).is(':checked')){
                    var sData = $scope.valuelist.wtable.fnGetData(i);
                    $log.log('sData.valid valid is '+ sData.valid);
                    $scope.editedItem.valid = sData.valid;
                }
            });
            var editDlg = $modal.open({
                templateUrl: CONFIG.preparePartialTemplateUrl('chartmaker-add-value-modal'),
                controller: 'ModalInstanceCtrl',
                size: 'sm',
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
                    console.log('-------- before save_value() -------');
                    console.log($scope.editedItem);
                    $scope.save_value();
                }
            });
        }

        $scope.save_value = function(){
            var q = {};
            q.sqlid = $scope.$parent.sqlid;
            q.whid = $scope.editedItem.whid;
            q.valid = $scope.editedItem.valid;
            q.valstr = $scope.editedItem.valstr;
            q.valnm = $scope.editedItem.valnm;
            $log.log('--------$scope.save_value() ------ ')
            $log.log(q);
            var pp;
            if(q.valid){
                pp = $adminwhvalue.edit(q, '/' + $scope.$parent.sqlid  + '/' + $scope.whid);
            }else{
                q.valid = 0;
                pp = $adminwhvalue.add(q, '/' + $scope.$parent.sqlid  + '/' + $scope.whid);
            }
            pp.then(function(data){
                $scope.valuelist.data = data;
            });

        }

        $scope.delete_value = function(){
            var valid_lst = [];
            $('input[type="checkbox"]', $scope.valuelist.wtable.fnGetNodes()).each(function(i){
                //$log.log(' input[type="checkbox"] row [' + i + '] : '  + $(this).is(':checked'));
                if($(this).is(':checked')){
                    var sData = $scope.valuelist.wtable.fnGetData(i);
                    $log.log('sData.valid valid is '+ sData.valid);
                    //$scope.editedItem.valid = sData.valid;
                    valid_lst.push(sData.valid)
                }
            });
            $scope.editedItem.removevalidlist = valid_lst;

            var button = {
                show:true,
                method:$scope.remove_value,
                text:'delete'
            };
            var aIdx = $scope.addAlert('danger', 'Please Confirm Do you really want to delete this Item?', button);
            console.log($scope.alerts);
        }

        $scope.remove_value = function(){
            // filter delete
            var q = {}
            //q.whid = $scope.editedItem.whid;
            q.valid = $scope.editedItem.removevalidlist.join();
            $log.log(q);
            var p = $adminwhvalue.delete(q,'/'+$scope.$parent.sqlid + '/' + $scope.whid);
            p.then(function(data){
                $scope.valuelist.data = data;
                $scope.closeAlert($scope.alerts.length-1);
            },function(btn){
                console.log('$adminwhvalue.delete error !!!! ')
            });
        }

}])



;
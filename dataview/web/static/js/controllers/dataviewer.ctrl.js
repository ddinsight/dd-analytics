angular.module('Wave.dataviewer.ctrl',[])

.controller('DataViewerController', ['$location', '$scope','$routeParams','$appUser','$sqlFiddle', '$dashboardService','$log', '$timeout','$window',
    function($location, $scope, $routeParams, $user, $sqlfiddle, $dashboard, $log, $timeout, $window) {
        $scope.user = $user.isLogined().user;
        $scope.tables = [];
        // $scope.editorOptions = {};
        $scope.isSqlstmt = true;
        $scope.editedItem = {};
        $scope.editedItem.query = "";
        $scope.errormsg = "";

        $scope.logout = function(){
            if($user.logout()){
                $location.path('/login');
            }
        }

        $scope.availOptions = {
            datatype : "local",
            height : 'auto',
            rowNum : 50,
            rowList : [30, 50,100],
            viewrecords : true,
            multiselect : false,
            autowidth : true
        };
        $scope.availcolnames = [];
        $scope.availcolmodel = [];
        var tables_p = $sqlfiddle.getTables();

        tables_p.then(function(data){
            $scope.availdata = data;
            if(data){
                var keys = Object.keys(data[0]);
                for(var i=0;i<keys.length;i++){
                    $scope.availcolnames.push(keys[i]);
                    $scope.availcolmodel.push({'name':keys[i], 'index':keys[i]})
                }
            }
        });

        $scope.resultOptions = {
            datatype : "local",
            height : 'auto',
            rowNum : 50,
            rowList : [30, 50,100],
            viewrecords : true,
            multiselect : false,
            autowidth : true
        };

        $scope.resultData = [];


        $scope.editorOptions = {
            onLoad : function(_editor){
                _editor.setSize('99.9%', '400px');
            $scope.editor = _editor;
            },
            operatorChars: /^[*+\-%<>!=]/,
            lineWrapping : true,
            smartIndent: true,
            autofocus: true,
            lineNumbers: true,
            tabMode: 'indent',
            matchBrackets: true,
            mode: 'text/x-mysql'

        };

        $scope.overrideOptions = {
        // define table layout
            "sDom" : "<'row-fluid dt-header'<'span6'f><'span6 hidden-phone'T>r>t<'row-fluid dt-footer'<'span6 visible-desktop'i><'span6'p>>",
            // add paging
            "sPaginationType" : "bootstrap",
            "oLanguage" : {
                "sLengthMenu" : "Showing: _MENU_",
                "sEmptyTable":  "You need to execute query"
            }
        }

        $scope.setTablename = function(tname){
            $scope.editor.setValue($scope.editor.getValue()  + " " + tname);

        }


        // $scope.tblDatas = data;
        $scope.runSQL = function(){
            $scope.tblcolnames = [];
            $scope.tblcolmodel = [];
            $scope.tbldata = [];
            $scope.editedItem.query = $scope.editor.getValue();
            q =  $scope.editedItem;
            var p = $sqlfiddle.executeQuery(q);

                p.then(function(data){
                    if(data.status == 'success'){
                        $scope.errormsg = ""
                        var keys = Object.keys(data.data[0]);
                        for(var i=0;i<keys.length;i++){
                            $scope.tblcolnames.push(keys[i]);
                            $scope.tblcolmodel.push({'name':keys[i], 'index':keys[i]})
                        }
                        $scope.tbldata = data.data;
                        console.log(JSON.stringify($scope.tblDatas));
                    }else if(data.status == 'error'){
                        $scope.errormsg = data.data;
                    }

                });

        }



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


}])




;
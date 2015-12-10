/**
* Created by airplug on 14. 10. 23..
*/
var module = angular.module('Wave.common.directive', [])

.directive('ngDataTable', ['$document', '$compile','$log','$window', function($document, $compile, $log, $window){
    return function(scope, element, attrs){

        $log.log('----- start ngDataTable directive ----');
        var options = {};
        if(attrs.ngDataTable.length>0){
            options = scope.$eval(attrs.ngDataTable);
        }
        options['sDom'] = "<'dt-toolbar'<'col-xs-12 col-sm-6'f><'col-sm-6 col-xs-6 hidden-xs'T>r>"+
                    "t"+
                    "<'dt-toolbar-footer'<'col-sm-6 col-xs-12 hidden-xs'><'col-sm-6 col-xs-12'p>>";
        if(!options.oTableTools){
            options['oTableTools'] = {
                "aButtons": [
                    {
                        "sExtends": "div",
                        "sButtonText": "Add",
                        "fnClick": function ( nButton, oConfig, oFlash ) {
                            scope.add();
                        }
                    },
                    {
                        "sExtends": "div",
                        "sButtonText": "Edit",
                        "fnClick": function ( nButton, oConfig, oFlash ) {
                            scope.edit();
                        }
                    },
                    {
                        "sExtends": "div",
                        "sButtonText": "Delete",
                        "fnClick": function ( nButton, oConfig, oFlash ) {
                            scope.delete();
                        }
                    },
                    "xls"
                ],
                "sSwfPath": "/static/assets/bootstrap/js/plugin/datatables/swf/copy_csv_xls_pdf.swf"
            };
        }

        options['autoWidth'] = true;
        options['preDrawCallback'] = function() {
            if (!scope.respdtables) {
                scope.respdtables = new ResponsiveDatatablesHelper(element, {tablet : 1024,phone : 480 });
            }
        };
        options['rowCallback'] = function(nRow) {
            scope.respdtables.createExpandIcon(nRow);
        };
        options['drawCallback'] = function(oSettings) {
            scope.respdtables.respond();
        };


        var explicitColumns = [];
        element.find('th').each(function(index, elem) {
            explicitColumns.push($(elem).text());
        });

        if (explicitColumns.length > 0)  options["aoColumns"] = explicitColumns;
        else if (attrs.aoColumns)  options["aoColumns"] = scope.$eval(attrs.aoColumns);

        if(attrs.iDisplayLength) options["iDisplayLength"] = scope.$eval(attrs.iDisplayLength);
        else options["iDisplayLength"] = 20;

        if(attrs.aoColumnDefs) options["aoColumnDefs"] = scope.$eval(attrs.aoColumnDefs);
        if(attrs.fnRowCallback) options["fnRowCallback"] = scope.$eval(attrs.fnRowCallback);
        if(attrs.fnDrawCallback) options["fnDrawCallback"] = scope.$eval(attrs.fnDrawCallback);
        if(attrs.fnPreDrawCallback) options["fnPreDrawCallback"] = scope.$eval(attrs.fnPreDrawCallback);
        if(attrs.fnHeaderCallback) options["fnHeaderCallback"] = scope.$eval(attrs.fnHeaderCallback);
        if(attrs.aaSorting) options["aaSorting"] = scope.$eval(attrs.aaSorting);
        options["fnCreatedRow"] = function( nRow, aData, iDataIndex ) {
            $compile(nRow)(scope);
        }

        var initGrid = false;
        var wtable = element.dataTable(options);
        if(options.onLoad){
            options.onLoad(wtable);
        }else{
            scope.wtable = wtable;
        }
        var render = function(){
            $log.log('------------ dataTable render start --------- ['+initGrid +']=' + (scope.$eval(attrs.aaData)).length);
            $log.log(scope.$eval(attrs.aaData));
            if(!initGrid){
                initGrid = true;
            }else{
                if((scope.$eval(attrs.aaData)).length>0){
                    wtable.fnClearTable();
                    wtable.fnAddData(scope.$eval(attrs.aaData));
                }else{
                    wtable.fnClearTable();
                }
            }
            if(options.afterCreationTableCallback){
                options.afterCreationTableCallback(element, scope.wtable);
            }
        }
        scope.$watch(attrs.aaData + ' | json', function(value){
            var value = value || [];
            $log.log('------------ dataTable options --------- ');
            $log.log(options);
            $log.log(value.length);
            $log.log(scope.$eval(attrs.aaData));
            $log.log('------------ dataTable options --------- ');
            if(value && value.length>1){
                initGrid = true;
                render();
            }
        });
    };

}])

.directive('ngConfirmClick', ['$log',  function($log){
  return {
    link: function (scope, element, attr) {
      var msg = attr.ngConfirmClick || "Are you sure?";
      var clickAction = attr.confirmedClick;
      element.bind('click',function (event) {
        if ( window.confirm(msg) ) {
            scope.$eval(clickAction)
        }
      });
    }
  };
}])

.directive('selectTwo', ['$compile','$log', function($compile, $log){
    return function(scope, element, attrs){
        var select2 = {};
        var options = {}
        if(attrs.selectTwo.length > 0){
            options = scope.$eval(attrs.selectTwo);
        }else{
            options = {}
        }
        if(_.isUndefined(options))
            options = {};

        if(options.query){
            select2 = element.select2(options);
            if(options.onLoad){
                options.onLoad(select2, element);
            }
        }else{
            scope.$watch(attrs.aaData+' | json', function(value){

                var value = value || null;
                if(value){
                    options.data = scope.$eval(attrs.aaData);
                    select2 = element.select2(options);
                    if(options.val){
                        select2.val(options.val);
                    }
                    if(options.onLoad){
                        options.onLoad(select2, element);
                    }
                }
            });
        }
    };

}])

.directive('selectTwoTags', ['$compile','$parse','$log', function($compile,$parse,$log){
    return function(scope, element, attrs){
        var options = {}
        if(attrs.selectTwoTags.length > 0){
            options = scope.$eval(attrs.selectTwoTags);
        }else{
            options = {}
        }
        var select2;

        var draw = function(value){
            var value = value || null;
            if(value){
                element.empty();
                options.tags = scope.$eval(attrs.aaData);
                select2 = element.select2(options);
                options.onLoad(select2);

                element.select2("container").find("ul.select2-choices").sortable({
                    containment: 'parent',
                    start: function() { element.select2("onSortStart"); },
                    update: function() { element.select2("onSortEnd"); }
                });
                element.on('change', function(){
                    var invoker = $parse(attrs.defaultFn);
                    invoker(scope, {templates:element.val()})
                });
            }
        }

        scope.$watch(attrs.aaData+' | json', draw);
        scope.$watch(attrs.aeData+' | json', draw);
    };
}])

.directive('popOver2', ['$compile','$parse','$log', function($compile,$parse,$log){
    return function(scope, element, attrs){
        var options = {}
        if(attrs.popOver2.length > 0){
            options = scope.$eval(attrs.popOver2);
        }else{
            options = {}
        }
        var popover;

        scope.$watch(attrs.popData, function(value){
            var value = value || null;
            if(value && value.length>0){
                options['content'] = value;
                popover = element.popover(options);
            }
        });
    };
}])

.directive('chartPreviewWidget', ['$compile','$log', function($compile, $log){
    return {
        restrict: 'EA',
        scope: {
            ngModel: '='
        },
        templateUrl: CONFIG.preparePartialTemplateUrl('chart-preview-widget'),
        link : function(scope, element, attrs){
            var options = {};
            if(!_.isEmpty(scope.ngModel.widgetOptions)){
                options = scope.ngModel.widgetOptions;
            }else{
                options = {};
            }

            if(!_.isEmpty(options)){
                scope.$watch(scope.ngModel.d3Data, function(value){
                    element[0].id = 'daashboard_item' + scope.ngModel.id;
                    element.find('div')[0].id = 'widget_' + scope.ngModel.id;
                    element.jarvisWidgets(options);
                }, true);
            }
        }// end of link
    } // end of return
}])
//
//.directive('loadImg', function($compile,$log,$document,$window){
//    return function(scope,element,attrs){
//        var width = $window.innerWidth;
//        var height = $window.innerHeight;
//        //element.prepend("<style>.loading-indicator {position: absolute;left: "+(width/2)+"px;top: "+(height/2)+"px;}</style>");
//        //element.css("loading-indicator");
//        element.html('<span style="padding-left: 10px;" ng-show="isLoading">Loading...</span>');
//        $compile(element)(scope);
//
//    }
//})

.directive('ngJqGrid', function($compile, $log, $document, $window){
    return function(scope, element, attrs) {
        element.append('<table id="jqgrid"></table>');
        element.append('<div id="pjqgrid"></div>');
        $log.log('----- start ngJqGrid directive ----');
        var options = {};
        if(attrs.ngJqGrid.length>0){
            options = scope.$eval(attrs.ngJqGrid);
        }

        var initGrid = false;

        var jtable = element.find("#jqgrid").jqGrid(options);
        if(options.onLoad){
            options.onLoad(jtable);
        }else{
            scope.jtable = jtable;
        }
        var render = function(){
            $log.log('------------ ngJqGrid render start --------- ['+initGrid +']=' + (scope.$eval(attrs.aaData)).length);
            $log.log(scope.$eval(attrs.aaData));
            if(!initGrid){
                initGrid = true;
            }else{
                if((scope.$eval(attrs.aaData)).length>0){
                    element.find("#jqgrid").jqGrid("GridUnload");
                    jtable = element.find("#jqgrid").jqGrid(options);
                }else{
                    element.find("#jqgrid").jqGrid("GridUnload");
                }
            }
        }
        scope.$watch(attrs.aaData + ' | json', function(value){
            var value = value || [];
            options['data'] = scope.$eval(attrs.aaData);
            options['colNames'] = scope.$eval(attrs.aaColnames);
            options['colModel'] = scope.$eval(attrs.aaColmodel);
            $log.log('------------ ngJqGrid options --------- ');
            $log.log(options);
            //$log.log(value.length);
            //$log.log(scope.$eval(attrs.aaData));
            $log.log('------------ ngJqGrid options --------- ');
            if(value && value.length>1){
                initGrid = true;
                render();
            }
        });
    }
})

.directive('dashboardMenu', ['$location','$log', function($location, $log){
    return {
         restrict: 'E'
        ,replace: true
        ,templateUrl: CONFIG.preparePartialTemplateUrl('dashboard-menu')
        ,link: function(scope, element, attrs){
            console.log('--------- dashboardMenu directive start  ---------');
            scope.move = function(url){
                $log.log(url);
                $location.path(url);
            }
        }
    };
}])


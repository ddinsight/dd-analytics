var module = angular.module('Wave.chartviewer.directive', [])

//////////////////////////////////////////////////////////////////////
// Front  System Directives
//////////////////////////////////////////////////////////////////////

.directive('queryList', ['$location', function($location){
// .directive('queryList', function(){
    return {
         restrict: 'E'
        ,replace: true
        // ,templateUrl: 'aaa.html'
        ,templateUrl: CONFIG.preparePartialTemplateUrl('datasets')
        ,link: function(scope, elem, attrs){
            console.log('directive queryList started...')
            scope.move = function(datasetid){
                // console.log('scope.move');
                var url = ROUTER.routePath('dataset_path',{
                    sqlid : datasetid
                });
                $('#qlModal').modal('hide');
                $location.path(url);
            }
        }
    };
}])

.directive('headerDatasets', ['$location', function($location){
    return {
         restrict: 'E'
        ,replace: true
        // ,templateUrl: 'aaa.html'
        ,templateUrl: CONFIG.preparePartialTemplateUrl('header_datasets')
        ,link: function(scope, elem, attrs){
            console.log('directive queryList started...')
            scope.move = function(datasetid){
                // console.log('scope.move');
                var url = ROUTER.routePath('dataset_path',{
                    sqlid : datasetid
                });
                $('#qlModal').modal('hide');
                $location.path(url);
            }

            scope.previous = function(){
                var url = ROUTER.routePath('datasets_path');
                $location.path(url);
            }
        }
    };
}])


.directive('selectMenu', ['$location', function($location){
    return {
         restrict: 'E'
        ,replace: true
        ,templateUrl: CONFIG.preparePartialTemplateUrl('select-menu')
        , link: function(scope, elem, attrs){
            scope.$watch('selectmenus', function(){
                if(scope.selectmenus.length>0)
                    scope.showSelectMenuInput = true;
                else
                    scope.showSelectMenuInput = false;
            });
            scope.toggles = function(id){
                scope.setSelectMenus(id);
            }
        }
    };
}])

.directive('whereMenu', ['$location', function($location){
    return {
         restrict: 'E'
        ,replace: true
        ,templateUrl: CONFIG.preparePartialTemplateUrl('where-menu')
        , link: function(scope, elem, attrs){
            scope.showWhereMenuInput = false;
            scope.$watch('wheremenus', function(){
                if(scope.wheremenus.length>0)
                    scope.showWhereMenuInput = true;
                else
                    scope.showWhereMenuInput = false;
            })
            scope.togglew = function(parent, child){
                scope.setWhereMenus(parent, child);
            }
        }
    };
}])

.directive('templateMenu', ['$location', function($location){
    return {
         restrict: 'E'
        ,replace: true
        ,templateUrl: CONFIG.preparePartialTemplateUrl('template-menu')
        ,link: function(scope, elem, attrs){
            scope.showTemplateInput = false;
            scope.$watch('templates', function(){
                if(scope.templates.length>0)
                    scope.showTemplateInput = true;
                else
                    scope.showTemplateInput = false;
            })
            scope.togglet = function(tmplid){
                scope.setTemplates(tmplid);
            }
        }
    };
}])

.directive('chartCanvas', ['$compile','$parse','$log', '$timeout','$window', function($compile,$parse,$log,$timeout,$window){
    return function(scope, element, attrs){
        var render = function(idx, chart){
            if(!chart) return;
//console.log(chart);
            var data = 'cdata.d' +idx;
            var widget_height = '400px';
            scope.cdata = scope.cdata || {};
            scope.cdata['d'+idx] = chart.data;
            if(chart.template == 'd3-multi-line-multiples'){
                widget_height = '100%';
            }
            var widget_html =
                '<div class="jarviswidget jarviswidget-color-darken" id="charviewer-id-'+idx+'" data-widget-colorbutton="false"	data-widget-togglebutton="false" data-widget-editbutton="false" data-widget-fullscreenbutton="false">'+
                '	<header>'+
                '		<h2><strong>'+chart.title+'</strong></h2>'+
                '	</header> '+
                '	<div>'+
                '		<div class="jarviswidget-editbox"></div>'+
                '		<div class="widget-body">'+
                '       <h6 class="alert alert-success semi-bold"> Filter is ' + chart.filterdesc + '</h6>' +
                '       <div style="height:'+widget_height+'; overflow-y: scroll;" '+chart.template+' class="'+chart.size+'" data="'+data+'"></div>'+
                '		</div>'+
                '	</div>'+
                '</div>';

            var template = angular.element(widget_html);
            $compile(template)(scope);
            // one article or two article
            if(chart.template.indexOf('multiple') != -1){
                element.html('<article class="col-xs-12 col-sm-12 col-md-12 col-lg-12"></article>');

            }
            element.find('article').each(function(i){
                console.log((idx%2) + ':' + i);
                if(i == (idx%2)) {
                    $(this).append(template);
                }
            });


            $timeout(function(){
                //$('#widget-grid2').jarvisWidgets(chart.options);
                //$compile(element.contents())(scope);
                console.log('##### cdata ######[' +idx+ ']');
                console.log(scope.cdata['d'+idx]);
            }, 100);
        }

        scope.$watch(function(){ return JSON.stringify(scope.charts); } , function(value){
           if(value){
                element.find('article').each(function(i){
                   $(this).html("");
                });
                for(var i=0;i<scope.charts.length;i++){
                    render(i, scope.charts[i]);
                }

           }
        });
    };
}])


.directive('drawButton',function($location){
    return {
         restrict: 'E'
        ,replace: true
        ,template: '<a href="javascript:void(0)" ng-click="toggled()" class="btn btn-primary">Create My Chart</a>'
        ,link: function(scope, elem, attrs){
                scope.showDrawBtn = false;
                scope.toggled = function(){
                    scope.drawD3();
                }
        }
    };
})

.directive('dateMenu',function($location){
    return {
         restrict: 'E'
        ,replace: true
        ,templateUrl: CONFIG.preparePartialTemplateUrl('date-menu')
        ,link: function(scope, elem, attrs){
            scope.showDatePicker = true;
             // Date Range Picker
            elem.find("#from").datepicker({
                defaultDate: "-4w",
                dateFormat:"yy-mm-dd",
                changeMonth: true,
                numberOfMonths: 2,
                prevText: '<i class="fa fa-chevron-left"></i>',
                nextText: '<i class="fa fa-chevron-right"></i>',
                onClose: function (selectedDate) {
                    scope.setSelectedDate(selectedDate, 1);
//                        elem.find("#to").datepicker("option", "minDate", selectedDate);
                }
            });
            elem.find("#to").datepicker({
                defaultDate: "-4w",
                changeMonth: true,
                dateFormat:"yy-mm-dd",
                numberOfMonths: 2,
                prevText: '<i class="fa fa-chevron-left"></i>',
                nextText: '<i class="fa fa-chevron-right"></i>',
                onClose: function (selectedDate) {
                    scope.setSelectedDate(selectedDate, 2);
//                        elem.find("#from").datepicker("option", "maxDate", selectedDate);
                }
            });
        }
    };
})

.directive('tagCloud',function($location){
    return {
         restrict: 'E'
        ,replace: true
        ,scope:{
            setFn: '&'
        }
        ,template: '<div id="tag-cloud"></div>'
        ,link: function(scope, elem, attrs){
            scope.addTag = function(type, id, name){
                // type is 'tag-cloud-select' or 'tag-cloud-where'
                var css = 'label label-info';
                if(type == 'select'){
                    css = 'label label-info';
                }else if(type == 'where'){
                    css = 'label label-success'
                }
                $(elem).append('<span style="padding-right:2px;" class="'+css+'" id="tag_'+id+'">'+name+'</span> ');
            };
            scope.removeTag = function(id){
                angular.forEach(elem.find('span'), function(value, key){
                    var li = angular.element(value);
                    if(li.attr('id') == 'tag_'+id){
                        li.remove();
                    }
                });
            };
            scope.setFn({addTag:scope.addTag,removeTag:scope.removeTag});
        }
    };
})
;

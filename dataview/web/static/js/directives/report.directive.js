var module = angular.module('Wave.report.directive', [])


.directive('widgetCanvas', ['$compile','$parse','$log', '$timeout','$window', function($compile,$parse,$log,$timeout,$window){
    return function(scope, element, attrs){
        var render = function(idx, chart){
            if(!chart) return;
//console.log(chart);
            var data = 'cdata.d' +idx;
            scope.cdata = scope.cdata || {};
            scope.cdata['d'+idx] = chart.data;
            console.log('---- widgetCanvas ------ ');
            console.log(chart.title);
            console.log(scope.cdata['d'+idx]);

            var widget_html =
                '<div class="jarviswidget jarviswidget-color-darken" id="report-id-'+idx+'" data-widget-sortable="false" data-widget-colorbutton="false" data-widget-togglebutton="false" data-widget-editbutton="false" data-widget-fullscreenbutton="false" >'+
                '<header>'+
                '<h2><strong>'+chart.title+'</strong></h2>'+
                '<div class="widget-toolbar smart-form"><label class="input"><i class="icon-append fa fa-question-circle"></i>'+
                '<input type="text" style="width:100px;" id="putorder" placeholder="order" value="'+chart.order+'"/><b class="tooltip tooltip-top-right">Please Input Order of widget on Screen</b>'+
                '</label></div>'+
                '</header> '+
                '<div>'+
                '<div class="jarviswidget-editbox"></div>'+
                '<div class="widget-body" >'+
                '<div style="height:400px; overflow-y: scroll;" '+chart.template+' data="'+data+'"></div>'+
                '</div>'+
                '</div>'+
                '</div>';
            var template = angular.element(widget_html);
            template.find("#putorder").blur(function(){
                //console.log($(this));
                scope.save_order(chart.report_id, chart.id, $(this).val());

            });
            $compile(template)(scope);
            // one article or two article
            if(chart.template == 'd3-multi-line-multiples' || chart.size == 'span12'){
                //element.append('<article class="col-xs-12 col-sm-12 col-md-12 col-lg-12"></article>');
                element.find('article.col-sm-12').each(function(i){
                    $(this).append(template);
                });

            }else{
                element.find('article.col-sm-6').each(function(i){
                    console.log((idx%2) + ':' + i);
                    if(i == (idx%2)) {
                        $(this).append(template);
                    }
                });

            }


            $timeout(function(){
                //$('#widget-grid2').jarvisWidgets(chart.options);
                //$compile(element.contents())(scope);
                console.log(chart.title);
                console.log('##### cdata ######[' +idx+ ']');
                console.log(scope.cdata['d'+idx]);
            }, 100);
        }

        scope.$watch(function(){ return JSON.stringify(scope.charts); } , function(value){
            console.log('--------------------- scope.charts -----------------')
            console.log(scope.charts);
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


.directive('customWidgetCanvas', ['$compile','$parse','$log', '$timeout','$window', function($compile,$parse,$log,$timeout,$window){
    return function(scope, element, attrs){
        var render = function(idx, chart){
            if(!chart) return;
//console.log(chart);
            var data = 'cdata.d' +idx;
            scope.cdata = scope.cdata || {};
            scope.cdata['d'+idx] = chart.data;
            console.log('---- widgetCanvas ------ ');
            console.log(chart.title);
            console.log(scope.cdata['d'+idx]);

            var widget_html =
                '<div class="jarviswidget jarviswidget-color-darken" id="report-id-'+idx+'" data-widget-sortable="false" data-widget-deletebutton="false" data-widget-colorbutton="false" data-widget-togglebutton="false" data-widget-editbutton="false" data-widget-fullscreenbutton="false" >'+
                '<header>'+
                '<h2><strong>'+chart.title+'</strong></h2>'+
                '</header> '+
                '<div>'+
                '<div class="jarviswidget-editbox"></div>'+
                '<div class="widget-body" >'+
                '<div style="height:400px; overflow-y: scroll;" '+chart.template+' data="'+data+'"></div>'+
                '</div>'+
                '</div>'+
                '</div>';
            var template = angular.element(widget_html);
            template.find("#putorder").blur(function(){
                //console.log($(this));
                scope.save_order(chart.report_id, chart.id, $(this).val());

            });
            $compile(template)(scope);
            // one article or two article
            if(chart.template == 'd3-multi-line-multiples' || chart.size == 'span12'){
                //element.append('<article class="col-xs-12 col-sm-12 col-md-12 col-lg-12"></article>');
                element.find('article.col-sm-12').each(function(i){
                    $(this).append(template);
                });

            }else{
                element.find('article.col-sm-6').each(function(i){
                    console.log((idx%2) + ':' + i);
                    if(i == (idx%2)) {
                        $(this).append(template);
                    }
                });

            }


            $timeout(function(){
                //$('#widget-grid2').jarvisWidgets(chart.options);
                //$compile(element.contents())(scope);
                console.log(chart.title);
                console.log('##### cdata ######[' +idx+ ']');
                console.log(scope.cdata['d'+idx]);
            }, 100);
        }

        scope.$watch(function(){ return JSON.stringify(scope.charts); } , function(value){
            console.log('--------------------- scope.charts -----------------')
            console.log(scope.charts);
           if(value){
                //element.find('article').each(function(i){
                //   $(this).html("");
                //});
                for(var i=0;i<scope.charts.length;i++){
                    render(i, scope.charts[i]);
                }

           }
        });
    };
}])

//
//.directive('customWidgetCanvas', ['$compile','$parse','$log', '$timeout','$window', function($compile,$parse,$log,$timeout,$window){
//    return function(scope, element, attrs){
//        var render = function(idx, chart){
//            if(!chart) return;
//
//            var data = 'cdata.d' +idx;
//            scope.cdata = scope.cdata || {};
//            scope.cdata['d'+idx] = chart.data;
//            console.log('---- widgetCanvas ------ ');
//            console.log(chart.title);
//            console.log(scope.cdata['d'+idx]);
//
//            var widget_html =
//                '<div class="jarviswidget jarviswidget-color-darken" id="report-id-'+idx+'" data-widget-sortable="false" data-widget-colorbutton="false" data-widget-togglebutton="false" data-widget-editbutton="false" data-widget-fullscreenbutton="false" >'+
//                '<header>'+
//                '<h2><strong>'+chart.title+'</strong></h2>'+
//                '</header> '+
//                '<div>'+
//                '<div class="jarviswidget-editbox"></div>'+
//                '<div class="widget-body" >'+
//                '<div style="height:400px; overflow-y: scroll;" '+chart.template+' data="'+data+'"></div>'+
//                '</div>'+
//                '</div>'+
//                '</div>';
//
//            var template = angular.element(widget_html);
//
//            $compile(template)(scope);
//            // one article or two article
//            if(chart.template == 'd3-multi-line-multiples' || chart.size == 'span12'){
//                //element.append('<article class="col-xs-12 col-sm-12 col-md-12 col-lg-12"></article>');
//                element.find('article.col-sm-12').each(function(i){
//                    $(this).append(template);
//                });
//
//            }else{
//                element.find('article.col-sm-6').each(function(i){
//                    console.log((idx%2) + ':' + i);
//                    if(i == (idx%2)) {
//                        $(this).append(template);
//                    }
//                });
//
//            }
//
//            $timeout(function(){
//                $('#widget-grid2').jarvisWidgets(chart.options);
//                //$compile(element.contents())(scope);
//                console.log(chart.title);
//                console.log('##### cdata ######[' +idx+ ']');
//                console.log(scope.cdata['d'+idx]);
//            }, 100);
//        }
//
//        scope.$watch(function(){ return JSON.stringify(scope.charts); } , function(value){
//            console.log('--------------------- scope.charts -----------------')
//            console.log(scope.charts);
//           if(value){
//                element.find('article').each(function(i){
//                   $(this).html("");
//                });
//                for(var i=0;i<scope.charts.length;i++){
//                    render(i, scope.charts[i]);
//                }
//
//           }
//        });
//    };
//}])
//

;
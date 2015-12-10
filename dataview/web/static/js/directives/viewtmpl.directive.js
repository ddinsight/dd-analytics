/**
* Created by airplug on 14. 10. 23..
*/
var module = angular.module('Wave.viewtmpl.directive', [])

.directive('htmlTextPanel', ['$window',function($window){
    return function(scope, iElement, iAttrs){
        //angular.element(iElement).prepend('<style type="text/css"> .widget-text{ text-align: center; font-family: "Open Sans", "Helvetica Neue", Helvetica, Arial, sans-serif; background-color:#ec663c;} .widget-text.title1 {color:rgba(255, 255, 255, 0.7); font-size: 76px; font-weight: 700} .widget-text.title2 {color:rgba(255, 255, 255, 0.7); font-size: 35px;} .title {color:rgba(255, 255, 255, 0.7); font-size: 35px;} </style>');
        console.log('---------- htmlTextPanel -------------');
        var data = scope.$eval(iAttrs.data)
        console.log(data);
        var current = data[1].daynm;
        var currentvalue = data[1].value;
        var previousvalue = data[0].value;
        var changerate = Math.round((currentvalue - previousvalue) / previousvalue * 100 ,2);
        var changerate = changerate + ' %';
        var arrow_html = (parseInt(changerate) > 0) ? '<i class="fa fa-arrow-up"></i>':'<i class="fa fa-arrow-down"></i>'

        var htmlstr =
                    '<div class="text-center error-box">'+
                    '    <h2 style="font-size:40px;">'+current+'</h2>'+
                    '    <h2 style="font-size:100px;"><strong>'+currentvalue+'</strong></h2>'+
                    '    <h2 style="font-size:60px;">'+changerate+' '+arrow_html+ '</h2>'+
                    '</div>';
        iElement.html(htmlstr);

    } // end of return
}]) // end of directive


;




var module = angular.module('Wave.dashboard.directive', [])


.directive('dashboardWidget', ['$compile', function($compile){
    return {
        restrict: 'EA',
  scope: {
      ngModel: '='
  },
  templateUrl: CONFIG.preparePartialTemplateUrl('dashboard-widget'),
        link : function(scope, element, attrs){
            var options = {};
            if(!_.isEmpty(scope.ngModel.widgetOptions)){
                options = scope.ngModel.widgetOptions;
            }else{
                options = {};
            }

            console.log('dashboardWidget in directive options is ');
            console.log(scope.ngModel);
            console.log(options);
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

//.directive('dashboardMenu', ['$location','$log', function($location, $log){
//    return {
//         restrict: 'E'
//        ,replace: true
//        ,templateUrl: CONFIG.preparePartialTemplateUrl('dashboard-menu')
//        ,link: function(scope, element, attrs){
//            console.log('--------- dashboardMenu directive start  ---------');
//            scope.move = function(url){
//                $log.log(url);
//                $location.path(url);
//            }
//        }
//    };
//}])
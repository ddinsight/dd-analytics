var module = angular.module('Wave.chartmaker.directive', [])


.directive('adminMenu', ['$location', function($location){
	return {
		 restrict: 'E'
		,replace: true
		,templateUrl: CONFIG.preparePartialTemplateUrl('adminmenu')
		,link: function(scope, elem, attrs){
			console.log('--------- adminMenu directive start  ---------');
			scope.toggles = function(url){
				console.log(url);
				$location.path(url);
			}
		}
	};
}])

.directive('myProfile', ['$location', function($location){
	return {
		 restrict: 'E'
		,replace: false
		,templateUrl: CONFIG.preparePartialTemplateUrl('my-profile')
		,link: function(scope, elem, attrs){
			console.log('--------- adminMenu directive start  ---------');
			scope.toggles = function(url){
				console.log(url);
				$location.path(url);
			}
		}
	};
}])




	;


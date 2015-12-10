var module = angular.module('Wave.mapviewer.directive', [])

    .directive('googleMap', ['$window',function($window){
        return function(scope, iElement, iAttrs){

            var width = iElement[0].offsetWidth;
            angular.element(iElement).prepend('<style type="text/css"> .map-canvas, #map-canvas{width:100%;height:100%; border: 1px solid #333335;margin-bottom:20px;display: block;} </style>');
            angular.element(iElement).prepend('<div class=".map-canvas" id="map-canvas"></div>');
            var map,
                zoom = 10,
                center = new google.maps.LatLng(37.522423877485004, 127.0109950529785);
            var height = $window.innerHeight;
            iElement.height($(window).height());
            var options = {}
            // options = scope.$eval(iAttrs.googleMap);
            console.log(' --------- googleMap in mapboard directive ----------')
            console.log(scope.$eval(iAttrs.googleMap));
            if(iAttrs.googleMap.length > 0){
                options = scope.$eval(iAttrs.googleMap);
            }else{
                options = {
                    zoom:zoom,
                    center:center,
                    scrollwheel:true,
                    disableDefaultUI: true,
                    mapTypeId: google.maps.MapTypeId.ROADMAP
                }
            }

            map = new google.maps.Map(iElement.find('div')[0], options);
            if(options.onLoad){
                options.onLoad(map);
            }
        } // end of return
    }]) // end of directive

;
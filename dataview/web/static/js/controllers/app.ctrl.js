angular.module('Wave.ctrl',[])

.controller('AppCtrl', ['$window', '$location', '$scope', function($window, $location, $scope) {
    $window.isLogining = false;
    $window.$previously_wave_url = '';
    $scope.current_path = '#' + $location.url();
}])

.controller('UserCtrl', ['$window', '$location', '$scope', '$routeParams','$appUser', '$Base64',
    function($window, $location, $scope, $routeParams, $user, $Base64){
        console.log('UserCtrl started....');
        // $scope.user = {};
        // For OTM id
        // $scope.email = 'a1234@airplug.com';
        // $scope.password = '12345';
        if($window.localStorage.email && $window.localStorage.password){
            $scope.email = $window.localStorage.email;
            $scope.password = $window.localStorage.password;
        }
        // For Hoppin ID
        // $scope.email = 'mhb8436@airplug.com';
        // $scope.password = 'dbwj';

        // var prevurl = $routeParams.prevurl;
        // var prevurl = ;
        var prevurl = '/chartviewer/list'
        // console.log('======= prevurl =========');
        // console.log($routeParams.prevurl);
        // console.log('angular.isDefined($routeParams.prevurl) : ' + $window.$previously_wave_url);
        if(angular.isDefined($window.$previously_wave_url) && $window.$previously_wave_url != ''){
            prevurl = 	$window.$previously_wave_url;
        }

        $scope.user = $user.isLogined().user;

        $scope.submit = function(){
            if($scope.email && $scope.password){
                $window.isLogining = true;
                var promise = $user.login($scope.email, $scope.password);
                promise.then(function(data){
                    $scope.user = data;
                    if($scope.user){
                        $window.localStorage.email = $scope.email;
                        $window.localStorage.password = $scope.password;

                        $location.path(prevurl);
                    }
                });
            }
        };

        $scope.logout = function(){
            if($user.logout()){
                $location.path('/login');
            }
        };
}])


.controller('SignupCtrl', ['$window', '$location', '$scope', '$routeParams','$appUser', '$Base64',
    function($window, $location, $scope, $routeParams, $user, $Base64){
        console.log('SignupCtrl started....');
        $scope.editedItem = {};
        $scope.editedItem.message = "Please type in your email and password.";

        $scope.submit = function(){

            if($scope.editedItem.email && $scope.editedItem.password && $scope.editedItem.username){

                var promise = $user.regist($scope.editedItem);
                promise.then(function(data){
                    console.log(data);
                    if (data.status != 200){
                        $scope.editedItem.message = "Already email so Try agian another one"
                    }else{
                        $scope.user = data;
                        if($scope.user){
                            console.log('------------> ' + $scope.user);
                            $location.path('/login');
                        }
                    }
                });
            }
        };

}])


.controller('EmptyController', ['$window', '$location', '$scope', '$routeParams','$appUser', '$Base64','$dashboardService', '$log','$timeout',
    function($window, $location, $scope, $routeParams, $user, $Base64, $dashboard, $log ,$timeout){
    console.log('EmptyCtrl started....');
    $scope.logout = function(){
        console.log('ChartMakerController logout...');
        if($user.logout()){
            $location.path('/login');
        }
    }
    $log.log('--- start ToolsQuerytomapController ----');
    $scope.menus = [];
    $scope.leftMenus = function(){
        var promise = $dashboard.getMenus();
        promise.then(function(data){
            $scope.menus = JSON.parse(data[0].m1);
            $log.log('----$scope.leftMenus in ToolsQuerytomapController-----');
            $timeout(function(){
                $window.initApp.SmartActions();
                $window.initApp.leftNav();
                $log.log($window.initApp);
            }, 500);
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


}])


;
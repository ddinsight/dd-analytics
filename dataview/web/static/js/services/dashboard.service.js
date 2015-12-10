angular.module('Wave.dashboard.service', [])

    //.factory('$dashboardService', function($log, $q, $http, $window, $baseService, $waveurl){
    //    var obj = Object.create($baseService);
    //    var appUrl = $waveurl.get('/api/v1.0/dashboard');
    //    var keyPrefix = 'dashboard-'
    //    obj.set(appUrl, keyPrefix);
    //    $log.log('after creation $dashboard url is ' + obj.getUrl());
    //    obj.getMenus = function(){
    //        var deferred = $q.defer();
    //        $http({method:'GET', url:appUrl + '/menus'})
    //            .success(function(data){
    //                $log.log('$dashboardService getMenus success');
    //                $log.log(data);
    //                deferred.resolve(data);
    //        })
    //        .error(function(data){
    //            $log.log('$dashboardService getMenus fail ');
    //            deferred.resolve(data);
    //        });
    //        return deferred.promise;
    //    };
    //
    //    return obj;
    //
    //})


    .factory('$dashboardItem', function($log, $q, $http, $window, $baseService, $waveurl){
        var obj = Object.create($baseService);
        var appUrl = $waveurl.get('/api/v1.0/dashboard/item');
        var keyPrefix = 'dashboardItem-'
        obj.set(appUrl, keyPrefix);
        $log.log('after creation $dashboard url is ' + obj.getUrl());


        obj.execute = function(url){
          var deferred = $q.defer();
          $http({method:'GET', url:url})
              .success(function(data){
                $log.log('$dashboardItem execute success result is----');
                $log.log(data);
                deferred.resolve(data);
              })
              .error(function(data){
                $log.log('$dashboardItem execute error');
                deferred.resolve(data);
              });
          return deferred.promise;
        }
        return obj;

    })



;
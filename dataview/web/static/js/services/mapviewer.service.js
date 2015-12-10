angular.module('Wave.mapviewer.service', [])

.factory('$mapviewer', ['$q', '$http', '$window', '$baseService','$waveurl', function($q, $http, $window, $baseService, $waveurl){
    var obj = Object.create($baseService);
    var appUrl = $waveurl.get('/api/v1.0/mapviewer');
    var keyPrefix = 'mapboard-'
    obj.set(appUrl, keyPrefix);

    obj.getBoardList = function(q, suffix){
        var method = 'GET';
        var that = this;
        var deferred = $q.defer();
        var url = this.appUrl + '/board/list' + (_.isUndefined(suffix)?'':suffix);

        that.query(q, url, method, function(q, data){
            deferred.resolve(data);
        }, function(q){
            console.log(that.keyPrefix + ' get failure error q is ' + q);
        });

        return deferred.promise;
    }
    obj.getBoardItems = function(q, suffix){
        var method = 'GET';
        var that = this;
        var deferred = $q.defer();
        var url = this.appUrl + '/board/view' + (_.isUndefined(suffix)?'':suffix);

        that.query(q, url, method, function(q, data){
            deferred.resolve(data);
        }, function(q){
            console.log(that.keyPrefix + ' get failure error q is ' + q);
        });

        return deferred.promise;
    }

    obj.getQueryListforMap = function(q, suffix){
        var method = 'GET';
        var that = this;
        var deferred = $q.defer();
        var url = this.appUrl + '/query/list' + (_.isUndefined(suffix)?'':suffix);

        that.query(q, url, method, function(q, data){
            deferred.resolve(data);
        }, function(q){
            console.log(that.keyPrefix + ' get failure error q is ' + q);
        });

        return deferred.promise;
    }

    obj.getTemplates = function(q, suffix){
        var method = 'GET';
        var that = this;
        var deferred = $q.defer();
        var url = this.appUrl + '/templates/list' + (_.isUndefined(suffix)?'':suffix);
        //console.log('$mapboard.getTemplates url is ' + url);

        that.query(q, url, method, function(q, data){
            deferred.resolve(data);
        }, function(q){
            console.log(that.keyPrefix + ' get failure error q is ' + q);
        });

        return deferred.promise;
    }
    obj.execute = function(url){
        var deferred = $q.defer();
        $http({method:'GET', url:url})
            .success(function(data){
                deferred.resolve(data);
            })
            .error(function(data){
                console.log('$mapboardItem execute error');
                deferred.resolve(data);
            });
        return deferred.promise;
    }


    obj.executeDirectQuery = function(q, suffix){
        var method = 'POST';
        var that = this;
        var deferred = $q.defer();
        var url = this.appUrl + '/item/execute' + (_.isUndefined(suffix)?'':suffix);
        //console.log('$mapboard.executeDirectQuery url is ' + url);

        that.query(q, url, method, function(q, data){
            deferred.resolve(data);
        }, function(q){
            console.log(that.keyPrefix + ' get failure error q is ' + q);
        });

        return deferred.promise;
    }

    return obj;

}])


.factory('$mapboard', ['$q', '$http', '$window', '$baseService','$waveurl', function($q, $http, $window, $baseService, $waveurl){
    var obj = Object.create($baseService);
    var appUrl = $waveurl.get('/api/v1.0/mapviewer/board');
    var keyPrefix = 'mapboard-'
    obj.set(appUrl, keyPrefix);
        //console.log('after creation $mapboard url is ' + obj.getUrl());

    obj.getQueryListforMap = function(q, suffix){
      var method = 'GET';
      var that = this;
      var deferred = $q.defer();
      var url = this.appUrl + '/query/list' + (_.isUndefined(suffix)?'':suffix);
      //console.log('$mapboard.getQueryListforMap url is ' + url);

      that.query(q, url, method, function(q, data){
        //console.log(that.keyPrefix + ' get success ');
        //console.log(data);
        //console.log('--------------------------');
        deferred.resolve(data);
      }, function(q){
        //console.log(that.keyPrefix + ' get failure error q is ' + q);
      });

      return deferred.promise;
    }

    obj.getTemplates = function(q, suffix){
      var method = 'GET';
      var that = this;
      var deferred = $q.defer();
      var url = this.appUrl + '/templates/list' + (_.isUndefined(suffix)?'':suffix);
      //console.log('$mapboard.getTemplates url is ' + url);

      that.query(q, url, method, function(q, data){
        //console.log(that.keyPrefix + ' get success ');
        //console.log(data);
        //console.log('--------------------------');
        deferred.resolve(data);
      }, function(q){
        //console.log(that.keyPrefix + ' get failure error q is ' + q);
      });

      return deferred.promise;
    }

    return obj;

    }])


.factory('$mapboardItem', ['$q', '$http', '$window', '$baseService','$waveurl',  function($q, $http, $window, $baseService, $waveurl){
    var obj = Object.create($baseService);
    var appUrl = $waveurl.get('/api/v1.0/mapviewer/board/item');
    var keyPrefix = 'mapboardItem-'
    obj.set(appUrl, keyPrefix);
    //console.log('after creation $mapboardItem url is ' + obj.getUrl());



    obj.execute = function(url){
      var deferred = $q.defer();
      $http({method:'GET', url:url})
          .success(function(data){
            //console.log('$mapboardItem execute success result is----');
            //console.log(data);
            deferred.resolve(data);
          })
          .error(function(data){
            //console.log('$mapboardItem execute error');
            deferred.resolve(data);
          });
      return deferred.promise;
    }


    obj.executeDirectQuery = function(q, suffix){
      var method = 'POST';
      var that = this;
      var deferred = $q.defer();
      var url = this.appUrl + '/execute' + (_.isUndefined(suffix)?'':suffix);
      //console.log('$mapboard.executeDirectQuery url is ' + url);

      that.query(q, url, method, function(q, data){
        //console.log(that.keyPrefix + ' get success ');
        // //console.log(data);
        //console.log('--------------------------');
        deferred.resolve(data);
      }, function(q){
        //console.log(that.keyPrefix + ' get failure error q is ' + q);
      });

      return deferred.promise;
    }


    return obj;

}])

;
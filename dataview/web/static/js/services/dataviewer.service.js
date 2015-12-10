    angular.module('Wave.dataviewer.service', [])

    .factory('$sqlFiddle', ['$q', '$http', '$window', '$baseService','$waveurl', function($q, $http, $window, $baseService, $waveurl){
        var obj = Object.create($baseService);
        var appUrl = $waveurl.get('/api/v1.0/dataviewer');
        var keyPrefix = 'dataviewer-'
        obj.set(appUrl, keyPrefix);
        console.log('after creation $dataviewer url is ' + obj.getUrl());

        obj.getTables = function(q, suffix){
            var method = 'GET';
            var that = this;
            var deferred = $q.defer();
            var url = this.appUrl + '/tables' + (_.isUndefined(suffix)?'':suffix);
            console.log('$baseService url is ' + url);

            that.query(q, url, method, function(q, data){
                console.log(that.keyPrefix + ' get success ');
                console.log(data);
                console.log('--------------------------');
                deferred.resolve(data);
            }, function(q){
                console.log(that.keyPrefix + ' get failure error q is ' + q);
            });

            return deferred.promise;
        }

        obj.getColumns = function(q, suffix){
            var method = 'GET';
            var that = this;
            var deferred = $q.defer();
            var url = this.appUrl + '/table/columns' + (_.isUndefined(suffix)?'':suffix);
            console.log('$baseService url is ' + url);

            that.query(q, url, method, function(q, data){
                console.log(that.keyPrefix + ' get success ');
                console.log(data);
                console.log('--------------------------');
                deferred.resolve(data);
            }, function(q){
                console.log(that.keyPrefix + ' get failure error q is ' + q);
            });

            return deferred.promise;
        }

        obj.executeQuery = function(q, suffix){

      var method = 'POST';
      var that = this;
      var deferred = $q.defer();
      var url = this.appUrl + '/query/execute' + (_.isUndefined(suffix)?'':suffix);

      console.log('$adminQuery test url is ' + url);
      that.query(q, url, method, function(q, data){
        console.log('----- test started ------- ');
        console.log(url);
        console.log(q);
        console.log(that.keyPrefix + ' test success ');
        console.log(data);
        console.log('--------------------------');
        deferred.resolve(data);
      }, function(q){
        console.log(that.keyPrefix + ' test failure error q is ' + JSON.stringify(q));
      })
      return deferred.promise;
    }


    return obj;

    }])
    ;
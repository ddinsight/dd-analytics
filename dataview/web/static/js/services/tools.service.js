angular.module('Wave.tools.service', [])

.factory('$toolService', ['$q', '$http', '$window', '$baseService','$waveurl', function($q, $http, $window, $baseService,$waveurl){
    var obj = Object.create($baseService);
    var appUrl = $waveurl.get('/api/v1.0/tools');
    var keyPrefix = 'tools-querytomap-'
    obj.set(appUrl, keyPrefix);
    console.log('after creation $toolService url is ' + obj.getUrl());

    obj.queryToMap = function(q, suffix){
      var method = 'POST';
      var that = this;
      var deferred = $q.defer();
      var url = this.appUrl + '/querytomap'+ (_.isUndefined(suffix)?'':suffix);
      console.log('$toolService queryToMap');
      console.log(q);

      that.query(q, url, method, function(q, data){
        console.log(that.keyPrefix + ' get success ');
        console.log(data);
        console.log('--------------------------');
        deferred.resolve(data);
      }, function(q){
        console.log(that.keyPrefix + ' get failure error q is ');
        console.log(q);
        console.log('--------------------------');
      });

      return deferred.promise;

    }
    return obj;

}])


;
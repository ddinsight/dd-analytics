  angular.module('Wave.chartmaker.service', [])

	.factory('$adminMenu', ['$q', '$http', '$window', '$baseService','$waveurl', function($q, $http, $window, $baseService,$waveurl){
  	var obj = Object.create($baseService);
  	var appUrl = $waveurl.get('/api/v1.0/chartmaker/menu');
  	var keyPrefix = 'chartmaker-menu-'
  	obj.set(appUrl, keyPrefix);
		console.log('after creation $adminMenu url is ' + obj.getUrl());
  	return obj;

  }])

  .factory('$adminQuery', ['$q', '$http', '$window', '$baseService','$waveurl', function($q, $http, $window, $baseService, $waveurl){
    var obj = Object.create($baseService);
    var appUrl = $waveurl.get('/api/v1.0/chartmaker/query');
    var keyPrefix = 'chartmaker-query-'
    obj.set(appUrl, keyPrefix);

    obj.testConnection = function(q, suffix){

      var method = 'POST';
      var that = this;
      var deferred = $q.defer();
      var url = this.appUrl + '/test' + (_.isUndefined(suffix)?'':suffix);
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

    obj.getUsers = function(q, suffix){
      var method = 'GET';
      var that = this;
      var deferred = $q.defer();
      var url = this.appUrl + '/users/list'+ (_.isUndefined(suffix)?'':suffix);
      console.log('$adminQuery getUsers');

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

    obj.sampleViewTmpl = function(q, suffix){
      var method = 'GET';
      var that = this;
      var deferred = $q.defer();
      var url = this.appUrl + '/viewtmpl/sample'+ (_.isUndefined(suffix)?'':suffix);
      console.log('$adminQuery sampleViewTmpl');

      that.query(q, url, method, function(q, data){
        console.log(that.keyPrefix + ' get success ');
        console.log(data);
        console.log('------------ sampleViewTmpl --------------');
        deferred.resolve(data);
      }, function(q){
        console.log(that.keyPrefix + ' get failure error q is ' + q);
      });
      return deferred.promise;
    }
  	return obj;

  }])

  .factory('$adminSelect', ['$q', '$http', '$window', '$baseService','$waveurl', function($q, $http, $window, $baseService, $waveurl){
  	var obj = Object.create($baseService);
  	var appUrl = $waveurl.get('/api/v1.0/chartmaker/select');
  	var keyPrefix = 'chartmaker-select-'
  	obj.set(appUrl, keyPrefix);
    console.log('after creation $adminSelect url is ' + obj.getUrl());

    obj.getTemplates = function(q, suffix){
        var method = 'GET';
        var that = this;
        var deferred = $q.defer();
        var url = this.appUrl + '/template/list' + (_.isUndefined(suffix)?'':suffix);
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


    obj.getAvailableColumns = function(q, suffix){
      var method = 'GET';
      var that = this;
      var deferred = $q.defer();
      var url = this.appUrl + '/available/columns' + (_.isUndefined(suffix)?'':suffix);
      console.log('$adminSelect getAvailableColumns url is ' + url);

      that.query(q, url, method, function(q, data){
        console.log(that.keyPrefix + ' getAvailableColumns success ');
        console.log(data);
        console.log('--------------------------');
        deferred.resolve(data);
      }, function(q){
        console.log(that.keyPrefix + ' getAvailableColumns failure error q is ' + q);
      });

      return deferred.promise;
    }

    obj.testConnection = function(q, suffix){

      var method = 'POST';
      var that = this;
      var deferred = $q.defer();
      var url = this.appUrl + '/test' + (_.isUndefined(suffix)?'':suffix);
      console.log('$adminSelect test url is ' + url);
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

    obj.execute = function(url){

      var deferred = $q.defer();
      $http({method:'GET', url:url})
          .success(function(data){
            console.log('$adminSelect execute success result is----');
            console.log(data);
            deferred.resolve(data);
          })
          .error(function(data){
            console.log('$adminSelect execute error');
            deferred.resolve(data);
          });
      return deferred.promise;
    }

    return obj;

  }])

  .factory('$adminWhColumn', ['$q','$log', '$http', '$window', '$baseService','$waveurl', function($q, $log, $http, $window, $baseService, $waveurl){
  	var obj = Object.create($baseService);
  	var appUrl = $waveurl.get('/api/v1.0/chartmaker/where/column');
  	var keyPrefix = 'chartmaker-where-column-'
  	obj.set(appUrl, keyPrefix);
    $log.log('after creation $adminWhColumn url is ' + obj.getUrl());

    obj.getAvailableColumns = function(q, suffix){
        var method = 'GET';
        var that = this;
        var deferred = $q.defer();
        var url = this.appUrl + '/available/columns' + (_.isUndefined(suffix)?'':suffix);
        $log.log('$adminWhColumn getAvailableColumns url is ' + url);

        that.query(q, url, method, function(q, data){
            $log.log(that.keyPrefix + ' getAvailableColumns success ');
            $log.log(data);
            $log.log('--------------------------');
            deferred.resolve(data);
        }, function(q){
            $log.log(that.keyPrefix + ' getAvailableColumns failure error q is ' + q);
        });

        return deferred.promise;
    }
    obj.getAvailableValues = function(q, suffix){
        var method = 'POST';
        var that = this;
        var deferred = $q.defer();
        var url = this.appUrl + '/available/values' + (_.isUndefined(suffix)?'':suffix);
        console.log('$adminWhColumn getAvailableColumns url is ' + url);
        console.log(q);

        that.query(q, url, method, function(q, data){
            $log.log(that.keyPrefix + ' getAvailableValues success ');
            $log.log(data);
            $log.log('--------------------------');
            deferred.resolve(data);
        }, function(q){
            $log.log(that.keyPrefix + ' getAvailableValues failure error q is ' + q);
        });

        return deferred.promise;
    }
    obj.getValues = function(q, suffix){
        var method = 'POST';
        var that = this;
        var deferred = $q.defer();
        var url = this.appUrl + '/values' + (_.isUndefined(suffix)?'':suffix);
        console.log('$adminWhColumn getValues url is ' + url);
        console.log(q);

        that.query(q, url, method, function(q, data){
            $log.log(that.keyPrefix + ' getValues success ');
            $log.log(data);
            $log.log('--------------------------');
            deferred.resolve(data);
        }, function(q){
            $log.log(that.keyPrefix + ' getValues failure error q is ' + q);
        });

        return deferred.promise;
    }
    obj.getRegex = function(q, suffix){
        var method = 'POST';
        var that = this;
        var deferred = $q.defer();
        var url = this.appUrl + '/customizable/values' + (_.isUndefined(suffix)?'':suffix);
        console.log('$adminWhColumn getAvailableColumns url is ' + url);
        console.log(q);

        that.query(q, url, method, function(q, data){
            $log.log(that.keyPrefix + ' getAvailableValues success ');
            $log.log(data);
            $log.log('--------------------------');
            deferred.resolve(data);
        }, function(q){
            $log.log(that.keyPrefix + ' getAvailableValues failure error q is ' + q);
        });

        return deferred.promise;
    }
  	return obj;

  }])

  .factory('$adminWhValue', ['$q', '$http', '$window', '$baseService','$waveurl', function($q, $http, $window, $baseService, $waveurl){
  	var obj = Object.create($baseService);
  	var appUrl = $waveurl.get('/api/v1.0/chartmaker/where/value');
  	var keyPrefix = 'chartmaker-where-value-'
  	obj.set(appUrl, keyPrefix);
		console.log('after creation $adminWhValue url is ' + obj.getUrl());
  	return obj;

  }])

  .factory('$adminMenuConfig', ['$q', '$http', '$window', '$baseService','$waveurl', function($q, $http, $window, $baseService, $waveurl){
  	var obj = Object.create($baseService);
  	var appUrl = $waveurl.get('/api/v1.0/chartmaker/menu/config');
  	var keyPrefix = 'chartmaker-menu-config-'
  	obj.set(appUrl, keyPrefix);
		console.log('after creation $adminMenuConfig url is ' + obj.getUrl());
		
		obj.getUsers = function(q, suffix){
			var method = 'GET';
			var that = this;
			var deferred = $q.defer();
			var url = this.appUrl + '/users/list'+ (_.isUndefined(suffix)?'':suffix);
			console.log('$adminMenuConfig getUsers');

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
  	return obj;

  }])

  .factory('$adminCommon', ['$q', '$http', '$window', '$baseService','$waveurl', function($q, $http, $window, $baseService, $waveurl){
    var obj = Object.create($baseService);
    var appUrl = $waveurl.get('/api/v1.0/chartmaker/info');
    var keyPrefix = 'chartmaker-common-table-info-'
    obj.set(appUrl, keyPrefix);
    console.log('after creation $adminCommon url is ' + obj.getUrl());

    obj.getTableInfo = function(q, suffix){
      var method = 'GET';
      var that = this;
      var deferred = $q.defer();
      var url = this.appUrl + '/table/columns'+ (_.isUndefined(suffix)?'':suffix);
      console.log('$adminCommon getTableInfo');

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

    return obj;
  }])

  ;



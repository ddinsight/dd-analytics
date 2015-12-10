angular.module('Wave.report.service', [])

    .factory('$report', function($log, $q, $http, $window, $baseService, $waveurl){
        var obj = Object.create($baseService);
        var appUrl = $waveurl.get('/api/v1.0/report');
        var keyPrefix = 'report-'
        obj.set(appUrl, keyPrefix);
        $log.log('after creation $report url is ' + obj.getUrl());

        return obj;

    })


    .factory('$reportItem', function($log, $q, $http, $window, $baseService, $waveurl){
        var obj = Object.create($baseService);
        var appUrl = $waveurl.get('/api/v1.0/report/item');
        var keyPrefix = 'reportItem-'
        obj.set(appUrl, keyPrefix);
        $log.log('after creation $reportItem url is ' + obj.getUrl());

        obj.save_order = function(q, suffix){
            var method = 'GET';
            var that = this;
            var deferred = $q.defer();
            var url = this.appUrl + '/order' + (_.isUndefined(suffix)?'':suffix);
            //console.log('$mapboard.getTemplates url is ' + url);

            that.query(q, url, method, function(q, data){
                deferred.resolve(data);
            }, function(q){
                console.log(that.keyPrefix + ' get failure error q is ' + q);
            });

            return deferred.promise;
        }

        obj.execute = function(q, suffix){
            var method = 'GET';
            var that = this;
            var deferred = $q.defer();
            var url = this.appUrl + '/exe' + (_.isUndefined(suffix)?'':suffix);
            //console.log('$mapboard.getTemplates url is ' + url);

            that.query(q, url, method, function(q, data){
                deferred.resolve(data);
            }, function(q){
                console.log(that.keyPrefix + ' get failure error q is ' + q);
            });

            return deferred.promise;
        }
        return obj;

    })



;
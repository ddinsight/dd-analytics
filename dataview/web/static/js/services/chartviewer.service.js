angular.module('Wave.chartviewer.service', [])


    .factory('$chartviewerService', ['$q', '$http', '$window', '$waveurl', '$baseService', '$log',
        function($q, $http, $window,$waveurl,$baseService,$log){

        var obj = Object.create($baseService);
        var appUrl = $waveurl.get('/api/v1.0/chartviewer');
        var keyPrefix = 'chartviewer-'
        obj.set(appUrl, keyPrefix);


        obj.getSelectMenu = function(q, suffix){
            var method = 'GET';
            var that = this;
            var deferred = $q.defer();
            var url = this.appUrl + '/menus/select/sqlid' + (_.isUndefined(suffix)?'':suffix);
            that.query(q, url, method, function(q, data){
                deferred.resolve(data);
            }, function(q){
                $log.log(that.keyPrefix + ' getSelectMenu failure error q is ' + q);
            });

            return deferred.promise;
        }
        obj.getWhereMenu = function(q, suffix){
            var method = 'GET';
            var that = this;
            var deferred = $q.defer();
            var url = this.appUrl + '/menus/where/sqlid' + (_.isUndefined(suffix)?'':suffix);
            that.query(q, url, method, function(q, data){
                deferred.resolve(data);
            }, function(q){
                $log.log(that.keyPrefix + ' getWhereMenu failure error q is ' + q);
            });

            return deferred.promise;
        }
        return obj;

    }])

    .factory('$appDataSet', ['$q', '$http', '$window', '$waveurl',
        function($q, $http, $window,$waveurl){
        var callbackToken = 'JSON_CALLBACK';
        var dataSetUrl = $waveurl.get('/api/v1.0/chartviewer/list');
        var keyPrefix = 'dataset-'

        return {
            prefixKey : function(value) {
                console.log('$appDataSet prefixKey1');
                    return keyPrefix + value;
                },

                query: function(cache, onSuccess, onFailure){
                    onSuccess = onSuccess || function() {};
                    onFailure = onFailure || function() {};

                    var that = this;
                    var key = this.prefixKey('all');
                    var url = dataSetUrl;

                    console.log('$appDataSet url  is ' + url);
                    $http({method:'GET', url:url, withCredentials:true})
                        .success(function(data){
                            onSuccess(data);
                        })
                        .error(function(data){
                            onFailure();
                        })
                },

                get: function(){
                    console.log('$appDataSet get started');
                    var retval;
                    var deferred = $q.defer();
                    this.query(false, function(data){
                        console.log('$appDataSet get sucess');
                        // retval = data;
                        deferred.resolve(data);
                        console.log(data.length);
                        console.log("-----------------------");
                    },function(q){
                        console.log('$appDataSet get failure q ' + q);
                    });
                    return deferred.promise;
                }
        }
    }])
    .factory('$appMenus', ['$q', '$http', '$window', '$waveurl',
        function($q, $http, $window,$waveurl){
        var callbackToken = 'JSON_CALLBACK';
        var searchToken = ['{q}']
        var appMenusUrl = $waveurl.get('/api/v1.0/chartviewer/menus/sqlid/'+searchToken[0]);
        var keyPrefix = 'chartviewer-'
        return {

            remakeData : function(data){
                var whereobj = {},
                    whatobj  = {},
                    rwhereobj = {},
                    rwhatobj = {};
                for(i in data){
                    if(data[i]["parent"].indexOf('condition') != -1) whereobj = data[i];
                    else whatobj = data[i];
                }
                var retval = [this.childToObj(whereobj),this.childToObj(whatobj)];
//                console.log(JSON.stringify(retval));
                return retval;
            },

            childToObj : function(data){
                if(_.isNull(data["children"]) || _.isUndefined(data["children"]))
                    return [];
                // console.log(Object.keys(data).length);
                if(Object.keys(data).length <1)
                    return [];
                // console.log(data);
                var rch = [];
                    var childs = data["children"].indexOf(',') > 0 ? data["children"].split(','): [data["children"]];
                    for(i=0;i<childs.length;i++){

                        var robj = {};

                        var parent = childs[i].split('->')[0];
                        robj.id = parent.split(':')[0];
                        robj.nm = parent.split(':')[1];
                        robj.tbltype = parent.split(':')[2];
                        robj.tblid = parent.split(':')[3];
                        robj.multiselect = parent.split(':')[4]
                        robj.sub = [];

                        var child = childs[i].split('->')[1].split('#');
                        for(j=0; j<child.length;j++){
                            var aa = {id:child[j].split(':')[0], nm:child[j].split(':')[1], tbltype:child[j].split(':')[2], tblid:child[j].split(':')[3], multiselect:child[j].split(':')[4]};
                            robj.sub.push(aa);
                        }
                        rch.push(robj);
                    }
                    return rch;
            },


            prefixKey : function(value) {
                return keyPrefix + value;
            },

            query: function(q, cache, onSuccess, onFailure){
                onSuccess = onSuccess || function() {};
                onFailure = onFailure || function() {};

                var that = this;
                var key = that.prefixKey(q.join(','));
                var url = "";
                for(i=0;i<searchToken.length;i++){
                    url += appMenusUrl.replace(searchToken[i], q[i]);
                }

                console.log('$appMenus url  is ' + url);
                $http({method:'GET', url:url})
                    .success(function(data){
                        console.log('$appMenus query is sucess');
                        onSuccess(q, data);
                    })
                    .error(function(data){
                        onFailure(q);
                    })
            },

            get: function(sqlid){
                var that = this;
                var deferred = $q.defer();
                that.query([sqlid], false, function(q, data){
                    deferred.resolve(data);
                }, function(q){
                    console.log(keyPrefix +  'error q is ' + q);
                });
                return deferred.promise;
            }

        }
    }])
    .factory('$appTemplates', ['$q', '$http', '$window','$waveurl',
        function($q, $http, $window,$waveurl){
            var callbackToken = 'JSON_CALLBACK';
            var searchToken = ['{q1}','{q2}'];
            var appMenusUrl = $waveurl.get('/api/v1.0/chartviewer/templates/sqlid/'+searchToken[0]+'/selid/'+searchToken[1]);
            var keyPrefix = 'templates-'

            return {
                prefixKey : function(value) {
                    return keyPrefix + value;
                },

                query: function(q, cache, onSuccess, onFailure){
                    onSuccess = onSuccess || function() {};
                    onFailure = onFailure || function() {};

                    var that = this;
                    var key = this.prefixKey(q.join(','));
                    var url = appMenusUrl;
                    for(i=0;i<searchToken.length;i++){
                        url = url.replace(searchToken[i], q[i]);
                    }

                    $http({method:'GET', url:url})
                        .success(function(data){
                            onSuccess(q, data);
                        })
                        .error(function(data){
                            onFailure(q);
                        })
                },

                get: function(sqlid, selid){
                    var that = this;
                    var deferred = $q.defer();
                    this.query([sqlid, selid], false, function(q, data){
                        console.log(keyPrefix + ' get success ');
                        console.log(data);
                        console.log('--------------------------');
                        deferred.resolve(data);
                    }, function(q){
                        console.log(keyPrefix + ' get failure error q is ' + q);
                    })
                    return deferred.promise;
                }
            }

    }])
	.factory('$appQuery', ['$q', '$http', '$window','$waveurl', 
		function($q, $http, $window,$waveurl){
        var callbackToken = 'JSON_CALLBACK';
        var searchToken = ['{q1}','{q2}','{q3}','{q4}','{q5}','{q6}'];
        var appUrl = $waveurl.get('/api/v1.0/chartviewer/execute/sqlid/'+searchToken[0]+'/selid/'+searchToken[1]+'/tmplid/'+searchToken[2]+'?whvalid=' + searchToken[3] + '&sdt=' + searchToken[4] + '&edt='+ searchToken[5]);
        var keyPrefix = 'execute-'

        return {
            prefixKey : function(value) {
                return keyPrefix + value;
                },

                query: function(q, cache, onSuccess, onFailure){
                    onSuccess = onSuccess || function() {};
                    onFailure = onFailure || function() {};

                    var that = this;
                    var key = this.prefixKey(q.join(','));
                    var url = appUrl;
                    for(i=0;i<searchToken.length;i++){
                        url = url.replace(searchToken[i], q[i]);
                    }

                    $http({method:'GET', url:url})
                        .success(function(data){
                            console.log('http.jsonp(url) result is----');
                            console.log(data);
                            onSuccess(q, data);
                        })
                        .error(function(data){
                            onFailure(q);
                        })
                },

                get: function(sqlid, selid, tmplid, whobj, sdt, edt){
                    var that = this;
                    var deferred = $q.defer();
                    this.query([sqlid, selid, tmplid, JSON.stringify(whobj), sdt, edt], false, function(q, data){
                        deferred.resolve(data);
                    }, function(data){
                        console.log(keyPrefix + ' get error');
                    });
                    return deferred.promise;
                }
        }

    }])

    .factory('$appDesc', ['$q', '$http', '$window','$waveurl',
        function($q, $http, $window,$waveurl){
        var callbackToken = 'JSON_CALLBACK';
        var searchToken = ['{q1}'];
        var appMenusUrl = $waveurl.get('/api/v1.0/chartviewer/description/sqlid/'+searchToken[0]);
        var keyPrefix = 'description-'

        return {
                prefixKey : function(value) {
                    return keyPrefix + value;
                },

                query: function(q, cache, onSuccess, onFailure){
                    onSuccess = onSuccess || function() {};
                    onFailure = onFailure || function() {};

                    var that = this;
                    var key = this.prefixKey(q.join(','));
                    var url = appMenusUrl;
                    for(i=0;i<searchToken.length;i++){
                        url = url.replace(searchToken[i], q[i]);
                    }

                    $http({method:'GET', url:url})
                        .success(function(data){
                            onSuccess(q, data);
                        })
                        .error(function(data){
                            onFailure(q);
                        })
                },

                get: function(sqlid){
                    var that = this;
                    var deferred = $q.defer();
                    this.query([sqlid], false, function(q, data){
                        console.log(keyPrefix + ' get success ');
                        console.log(data);
                        console.log('--------------------------');
                        deferred.resolve(data);
                    }, function(q){
                        console.log(keyPrefix + ' get failure error q is ' + q);
                    })
                    return deferred.promise;
                }
          }

    }])

;
angular.module('Wave.common.service', [])


.config(['$httpProvider', function ($httpProvider) {
    $httpProvider.interceptors.push('$authInterceptor');
    $httpProvider.defaults.useXDomain = true;
    delete $httpProvider.defaults.headers.common['X-Requested-With'];
}])

.factory('$waveurl', function(){
    return {
        get: function(uri){
            //return 'http://localhost:5002' + uri;
            return '' + uri;
        }
    }
})

.factory('$authInterceptor', ['$q', '$window', '$location', '$Base64',function($q, $window, $location, $Base64){
    return {

    request: function(config){
        config.headers = config.headers || {}
        if($window.sessionStorage.token){
//                console.log('$authInterceptor request config.url ' + config.url + ':'+config.url.indexOf('token'));
            if(config.url.indexOf('token') == -1){
                config.headers.Authorization = 'Basic ' + $Base64.encode($window.sessionStorage.token+':unused');
            }
        }
        return config || $q.when(config);
    },

    response: function(response){
        return response || $q.when(response);
    },

    requestError: function(rejection){
    // //console.log('$authInterceptor requestError ------');
        return $q.reject(rejection);
    },

    responseError: function(rejection){
        if(rejection.status == 401){
            $window.sessionStorage.token = '';
            if(angular.isDefined($location.path()) && $location.path().indexOf('login') == -1){
                $window.$previously_wave_url = $location.path();
            }

            $location.url('/login/');
            // //console.log('$location.path() is ' + $location.path());
        }
        return $q.reject(rejection);
    }
};
}])

.factory('$appUser', ['$q', '$http', '$window', '$Base64', '$waveurl',
    function($q, $http, $window, $Base64,$waveurl){
    var callbackToken = 'JSON_CALLBACK';
    var authenticateUrl = $waveurl.get('/api/v1.0/users/token') ;
    var keyPrefix = 'user-';
    var userIdentifyKey = keyPrefix + 'user'
    return {
        prefixKey : function(value) {
            return keyPrefix + value;
        },

        login: function(email, password){

            var user = {email: email, password:password};
            var url = authenticateUrl;
            $http.defaults.headers.common['Authorization'] = 'Basic ' + $Base64.encode(email+':'+password);
        var headers = {'Authorization' : 'Basic ' + $Base64.encode(email+':'+password)};
        var deferred = $q.defer();

            $http({method:'GET', url:url, headers:headers, withCredentials: true})
                    .success(function(data, status, headers, config){
                        $window.sessionStorage.token = data.token;
                        $window.sessionStorage.user = JSON.stringify(user);
                        deferred.resolve(user);
                    })
                    .error(function(data, status, headers, config){
                        //console.log("login error = [" + status + ":" +data + "]");
                        deferred.resolve({email:'',password:''});
                    })
                return deferred.promise;
        },

        regist: function(editedItem){
            var deferred = $q.defer();
            var url = $waveurl.get('/api/v1.0/users/register');
            var q = {'email':editedItem.email, 'username':editedItem.username, 'password':editedItem.password};
            console.log('regist---> ')
            console.log(q);
            var xsrf = _.isUndefined(q) ? '' : $.param(q);
            var headers = {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'}
            $http({method:'POST', data:xsrf, headers:headers, url:url})
              .success(function(data, status, headers, config){
                console.log('success :' + status + ' - ' + data)
                deferred.resolve({'data':data[0], 'status':status});

              })
              .error(function(data, status, headers, config){
                console.log('error :' + status)
                deferred.resolve({'data':{}, 'status':status});
              })
              return deferred.promise;
          },

        isLogined: function(){
            //console.log($window.sessionStorage.user);
            if($window.sessionStorage.user){
                return {
                    value: true,
                    user : JSON.parse($window.sessionStorage.user)
                };
            }else
                return {
                    value:false,
                    user:{}
                };
        },

        logout: function(){
            $window.sessionStorage.user = '';
            $window.sessionStorage.token = '';
            return true;
        }
    };
}])


.factory('$Base64', function() {
    var keyStr = 'ABCDEFGHIJKLMNOP' +
            'QRSTUVWXYZabcdef' +
            'ghijklmnopqrstuv' +
            'wxyz0123456789+/' +
            '=';
    return {
        encode: function (input) {
            var output = "";
            var chr1, chr2, chr3 = "";
            var enc1, enc2, enc3, enc4 = "";
            var i = 0;

            do {
                chr1 = input.charCodeAt(i++);
                chr2 = input.charCodeAt(i++);
                chr3 = input.charCodeAt(i++);

                enc1 = chr1 >> 2;
                enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
                enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
                enc4 = chr3 & 63;

                if (isNaN(chr2)) {
                    enc3 = enc4 = 64;
                } else if (isNaN(chr3)) {
                    enc4 = 64;
                }

                output = output +
                        keyStr.charAt(enc1) +
                        keyStr.charAt(enc2) +
                        keyStr.charAt(enc3) +
                        keyStr.charAt(enc4);
                chr1 = chr2 = chr3 = "";
                enc1 = enc2 = enc3 = enc4 = "";
            } while (i < input.length);

            return output;
        },

        decode: function (input) {
            var output = "";
            var chr1, chr2, chr3 = "";
            var enc1, enc2, enc3, enc4 = "";
            var i = 0;

            // remove all characters that are not A-Z, a-z, 0-9, +, /, or =
            var base64test = /[^A-Za-z0-9\+\/\=]/g;
            if (base64test.exec(input)) {
                alert("There were invalid base64 characters in the input text.\n" +
                        "Valid base64 characters are A-Z, a-z, 0-9, '+', '/',and '='\n" +
                        "Expect errors in decoding.");
            }
            input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");

            do {
                enc1 = keyStr.indexOf(input.charAt(i++));
                enc2 = keyStr.indexOf(input.charAt(i++));
                enc3 = keyStr.indexOf(input.charAt(i++));
                enc4 = keyStr.indexOf(input.charAt(i++));

                chr1 = (enc1 << 2) | (enc2 >> 4);
                chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
                chr3 = ((enc3 & 3) << 6) | enc4;

                output = output + String.fromCharCode(chr1);

                if (enc3 != 64) {
                    output = output + String.fromCharCode(chr2);
                }
                if (enc4 != 64) {
                    output = output + String.fromCharCode(chr3);
                }

                chr1 = chr2 = chr3 = "";
                enc1 = enc2 = enc3 = enc4 = "";

            } while (i < input.length);

            return output;
        }
    };
})


.factory('$baseService', ['$q', '$http', '$window', function($q, $http, $window){

    var callbackToken = 'JSON_CALLBACK';
    this.appUrl = '';
    this.keyPrefix = 'base-service-'

    return {
        set: function(url, prefix){
            this.appUrl = url;
            this.keyPrefix = prefix;
        },
        getUrl: function(){
            return this.appUrl;
        },
        prefixKey : function(value) {
            return this.keyPrefix + value;
        },

        query: function(q, url, method, onSuccess, onFailure){
            onSuccess = onSuccess || function() {};
            onFailure = onFailure || function() {};
            var headers = {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'}
            var xsrf = _.isUndefined(q) ? '' : $.param(q);
            //console.log('------ xsrf in query  -----');
            //console.log(xsrf);
            //console.log('------ xsrf in query  -----');
            $http({method:method, data:xsrf, headers:headers, url:url})
            .success(function(data){
                onSuccess(q, data);
            })
            .error(function(data){
                onFailure(q);
            })
        },

        get: function(q, suffix){
            var method = 'GET';
            var that = this;
            var deferred = $q.defer();
            var url = this.appUrl + '/list' + (_.isUndefined(suffix)?'':suffix);

            that.query(q, url, method, function(q, data){
                deferred.resolve(data);
            }, function(q){
            });

            return deferred.promise;
        },

        view: function(q, suffix){
            var method = 'GET';
            var that = this;
            var deferred = $q.defer();
            var url = this.appUrl + '/view' + (_.isUndefined(suffix)?'':suffix);

            that.query(q, url, method, function(q, data){
                deferred.resolve(data);
            }, function(q){
            });

            return deferred.promise;
        },

        add: function(q,suffix){
            var method = 'POST';
            var that = this;
            var deferred = $q.defer();
            var url = this.appUrl + '/add' + (_.isUndefined(suffix)?'':suffix);
            that.query(q, url, method, function(q, data){
                deferred.resolve(data);
            }, function(q){

            })
            return deferred.promise;
        },

        edit: function(q,suffix){
            var method = 'POST';
            var that = this;
            var deferred = $q.defer();
            var url = this.appUrl + '/edit' + (_.isUndefined(suffix)?'':suffix);

            that.query(q, url, method, function(q, data){
                deferred.resolve(data);
            }, function(q){

            })
            return deferred.promise;
        },

        delete: function(q,suffix){
            var method = 'POST';
            var that = this;
            var deferred = $q.defer();
            var url = this.appUrl + '/delete' + (_.isUndefined(suffix)?'':suffix);

            that.query(q, url, method, function(q, data){
                deferred.resolve(data);
            }, function(q){
            })
            return deferred.promise;
        }
    } // end of return

}])

.factory('$dashboardService', function($log, $q, $http, $window, $baseService, $waveurl){
    var obj = Object.create($baseService);
    var appUrl = $waveurl.get('/api/v1.0/dashboard');
    var keyPrefix = 'dashboard-'
    obj.set(appUrl, keyPrefix);
    $log.log('after creation $dashboard url is ' + obj.getUrl());
    obj.getMenus = function(){
        var deferred = $q.defer();
        $http({method:'GET', url:appUrl + '/menus'})
            .success(function(data){
                $log.log('$dashboardService getMenus success');
                $log.log(data);
                deferred.resolve(data);
        })
        .error(function(data){
            $log.log('$dashboardService getMenus fail ');
            deferred.resolve(data);
        });
        return deferred.promise;
    };

    return obj;

})

;

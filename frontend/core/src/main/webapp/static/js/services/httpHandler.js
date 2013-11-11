/*global angular, urlPrefix */
/*jslint white: true */

( function() {'use strict';

  angular.module('em.services').config(['$httpProvider',
    function($httpProvider) {
      $httpProvider.interceptors.push('httpInterceptor');
    }]);

  function httpInterceptor($location, $q, $rootScope, httpResponseRecover) {

    return {
      request : function(config) {
        return config || $q.when(config);
      },
      requestError : function(rejection) {
        return $q.reject(rejection);
      },
      response : function(response) {
        return response || $q.when(response);
      },
      responseError : function(rejection) {
        return httpResponseRecover.responseError(rejection);
      }
    };
  }


  httpInterceptor.$inject = ['$location', '$q', '$rootScope', 'httpResponseRecover'];
  angular.module('em.services').factory('httpInterceptor', httpInterceptor);

  function httpResponseRecover($injector, $location, $q, errorHandler) {

    /** Services initialized later because of circular dependency problem. */
// https://groups.google.com/d/msg/angular/hlRdr5LD3as/bXnz8GZAzbEJ
var deferred, httpRequest, userAuthenticate, userSessionStorage;

return {
  responseError : function(rejection) {

// // Http 401 will cause a browser to display a login dialog
// // http://stackoverflow.com/questions/86105/how-can-i-supress-the-browsers-authentication-dialog
if (rejection.status === 403) {
  if (this.canRecover()) {
    deferred = $q.defer();
    this.authenticateOnResponseError(rejection, deferred);
    return deferred.promise;
  }
  $location.path('/login');
} else if (rejection.status === 419) {
  if (this.canRecover()) {
    deferred = $q.defer();
    this.authenticateOnResponseError(rejection, deferred);
    return deferred.promise;
  }
  $location.path('/login');
}
errorHandler.setError(rejection.data);
return $q.reject(rejection);
},
canRecover : function() {
  userAuthenticate = userAuthenticate || $injector.get('userAuthenticate');
  return userAuthenticate.authenticateOnResponseError();
},
authenticateOnResponseError : function(rejection, deferred) {
  httpRequest = httpRequest || $injector.get('httpRequest');

  httpRequest.loginAndRetryRequest(rejection).then(function(response) {
    return deferred.resolve(response);
  }, function(response) {
    $location.path('/login');
    return deferred.reject(response);
  });
},
checkActiveUUID : function() {
  userAuthenticate = userAuthenticate || $injector.get('userAuthenticate');
  return userAuthenticate.checkActiveUUIDOnResponseError();
},
retryNullRequest : function(rejection, deferred) {
  var rejectionUrl, rejectionUrlUUID;

  userSessionStorage = userSessionStorage || $injector.get('userSessionStorage');
  httpRequest = httpRequest || $injector.get('httpRequest');

  rejectionUrl = rejection.config.url;
  rejectionUrlUUID = rejectionUrl.replace('null', userSessionStorage.getActiveUUID());
  rejection.config.url = rejectionUrlUUID;

  httpRequest.config(rejection.config).then(function(response) {
    return deferred.resolve(response);
  }, function(response) {
    return deferred.reject(response);
  });
}
};
}


httpResponseRecover.$inject = ['$injector', '$location', '$q', 'errorHandler'];
angular.module('em.services').factory('httpResponseRecover', httpResponseRecover);

angular.module('em.services').factory('httpBasicAuth', ['$http',
  function($http) {
    $http.defaults.headers.common.Authorization = 'Basic ';
    var encoded;

    return {
      setEncodedCredentials : function(userpass) {
        encoded = userpass;
        $http.defaults.headers.common.Authorization = 'Basic ' + encoded;
      },
      getCredentials : function() {
        return encoded;
      },
      clearCredentials : function() {
        $http.defaults.headers.common.Authorization = 'Basic ';
      }
    };
  }]);

angular.module('em.services').factory('httpRequest', ['$http',
  function($http) {
    var httpRequest = {};

    httpRequest.config = function(config) {
      return $http(config).then(function(success) {
        return success;
      }, function(error) {
      });
    };

    httpRequest.get = function(url) {
      return $http({
        method : 'GET',
        url : url,
        cache : true
      }).then(function(success) {
        return success;
      });
    };

    angular.forEach(['delete', 'head', 'jsonp'], function(name) {
      httpRequest[name] = function(url) {
        return $http({
          method : name,
          url : url
        }).then(function(success) {
          return success;
        });
      };
    });

    angular.forEach(['post', 'put'], function(name) {
      httpRequest[name] = function(url, data) {
        return $http[name](url, data).then(function(success) {
          return success;
        });
      };
    });

    return httpRequest;
  }]);
}());

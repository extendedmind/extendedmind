/*global angular, urlPrefix */
'use strict';

angular.module('em.services').config(['$httpProvider',
  function($httpProvider) {
    $httpProvider.interceptors.push('HttpInterceptorService');
  }]);

function HttpInterceptorService($q, ErrorHandlerService) {

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
      ErrorHandlerService.setError(rejection.data);
      return $q.reject(rejection);
    }
  };
}
HttpInterceptorService.$inject = ['$q', 'ErrorHandlerService'];
angular.module('em.services').factory('HttpInterceptorService', HttpInterceptorService);
/*global angular, urlPrefix */
'use strict';

angular.module('em.services').factory('BackendClientService', ['$http', 'UserSessionService',
  function($http, UserSessionService) {

    var BackendClientService = {};

    function getUrlPrefix() {
      // http://stackoverflow.com/a/3390426
      if (typeof urlPrefix !== 'undefined') {
        return urlPrefix;
      }
      return '';
    }

    BackendClientService.config = function(config) {
      UserSessionService.getAuth();

      return $http(config).then(function(success) {
        return success;
      });
    };

    BackendClientService.get = function(url) {
      UserSessionService.getAuth();

      return $http({
        method: 'GET',
        url: getUrlPrefix() + url
      }).then(function(success) {
        return success;
      });
    };

    angular.forEach(['delete', 'head', 'jsonp'], function(name) {
      BackendClientService[name] = function(url) {
        UserSessionService.getAuth();

        return $http({
          method: name,
          url: getUrlPrefix() + url
        }).then(function(success) {
          return success;
        });
      };
    });

    angular.forEach(['post', 'put'], function(name) {
      BackendClientService[name] = function(url, data) {
        UserSessionService.getAuth();

        return $http[name](getUrlPrefix() + url, data).then(function(success) {
          return success;
        });
      };
    });

    return BackendClientService;
  }]);

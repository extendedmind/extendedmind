"use strict";

var emServices = angular.module('em.services', []);

emServices.value('version', '0.1');

emServices.factory('authHttp', ['$http',
function($http) {
  var authHttp = {};

  angular.forEach(['get', 'delete', 'head', 'jsonp'], function(name) {
    authHttp[name] = function(url, config) {
      config = config || {};
      return $http[name](url, config);
    };
  });

  angular.forEach(['post', 'put'], function(name) {
    authHttp[name] = function(url, data, config) {
      config = config || {};
      return $http[name](url, data, config);
    };
  });
  return authHttp;
}]);

'use strict';

emServices.factory('httpHandler', ['$http',
function($http) {
  var httpHandler = {};

  angular.forEach(['get', 'delete', 'head', 'jsonp'], function(name) {
    httpHandler[name] = function(url, config) {
      config = config || {};
      return $http[name](url, config);
    };
  });

  angular.forEach(['post', 'put'], function(name) {
    httpHandler[name] = function(url, data, config) {
      config = config || {};
      return $http[name](url, data, config);
    };
  });
  return httpHandler;
}]);

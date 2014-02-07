'use strict';

function HttpClientService($http) {
  var methods = {};

  methods.get = function(url) {
    return $http({
      method: 'GET',
      url: url
    }).then(function(success) {
      return success;
    });
  };

  angular.forEach(['delete', 'head', 'jsonp'], function(name) {
    methods[name] = function(url) {
      return $http({
        method: name,
        url: url
      }).then(function(success) {
        return success;
      });
    };
  });

  angular.forEach(['post', 'put'], function(name) {
    methods[name] = function(url, data) {
      return $http[name](url, data).then(function(success) {
        return success;
      });
    };
  });

  return methods;
}

HttpClientService['$inject'] = ['$http'];
angular.module('em.services').factory('HttpClientService', HttpClientService);

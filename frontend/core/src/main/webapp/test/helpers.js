"use strict";

var emHelpers = angular.module('em.helpers', []);

emHelpers.factory('helperFactory', ['Base64',
function(Base64) {
  return {
    expectResponse : function(method, url, data, headers, responseData) {
      var parsedAuthorizationHeader = headers.Authorization.split(' ');
      var userNamePass = Base64.decode(parsedAuthorizationHeader[1]);
      var parsedUserNamePass = userNamePass.split(':');
      var userName = parsedUserNamePass[0];

      if (userNamePass === 'timo@ext.md:timopwd') {
        return [200, responseData];
      } else if (userName === 'token') {
        return [200, responseData];
      } else {
        return [403, 'Forbidden'];
      }
    }
  }
}]);

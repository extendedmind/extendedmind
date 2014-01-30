/*global angular, getJSONFixture, sessionStorage */
'use strict';

function UUIDService() {  

  function s4(){
    return Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
  };

  return {
    randomUUID: function() {
      return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
      s4() + '-' + s4() + s4() + s4();
    }
  };
};
angular.module('common').factory('UUIDService', UUIDService);

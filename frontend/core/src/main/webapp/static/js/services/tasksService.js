/*global angular*/

( function() {'use strict';

    angular.module('em.services').factory('tasksRequest', ['httpRequestHandler', 'userSessionStorage',
    function(httpRequestHandler, userSessionStorage) {
      return {
        putTask : function(task, success, error) {
          httpRequestHandler.put('/api/' + userSessionStorage.getUserUUID() + '/task', task, function(putTaskResponse) {
            success(putTaskResponse);
          }, function(putTaskResponse) {
            error(putTaskResponse);
          });
        }
      };
    }]);
  }());

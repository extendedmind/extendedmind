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

    angular.module('em.services').factory('tasksResponse', [
    function() {
      return {
        putTaskContent : function(task, putTaskResponse) {
          angular.forEach(putTaskResponse, function(value, key) {
            task[key] = value;
          });
        }
      };
    }]);

    angular.module('em.services').factory('tasksArray', [
    function() {

      var tasks = [];

      return {
        setTasks : function(tasks) {
          this.tasks = tasks;
        },
        putNewTask : function(task) {
          if (this.tasks.indexOf(task) > -1) {
            return;
          }
          this.tasks.push(task);
        }
      };
    }]);
  }());

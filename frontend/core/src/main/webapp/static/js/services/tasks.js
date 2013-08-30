/*global angular*/

( function() {'use strict';

    angular.module('em.services').factory('tasksRequest', ['httpRequest', 'userSessionStorage',
    function(httpRequest, userSessionStorage) {
      return {
        putTask : function(task, success, error) {
          httpRequest.put('/api/' + userSessionStorage.getUserUUID() + '/task', task, function(putTaskResponse) {
            success(putTaskResponse);
          }, function(putTaskResponse) {
            error(putTaskResponse);
          });
        },
        completeTask : function(task, success, error) {
          httpRequest.get('/api/' + userSessionStorage.getUserUUID() + '/task/' + task.uuid, function(completeTaskResponse) {
            success(completeTaskResponse);
          }, function(completeTaskResponse) {
            error(completeTaskResponse);
          });
        }
      };
    }]);

    angular.module('em.services').factory('tasksResponse', ['itemsResponse',
    function(itemsResponse) {
      return {
        putTaskContent : function(task, putTaskResponse) {
          itemsResponse.putItemContent(task, putTaskResponse);
        }
      };
    }]);

    angular.module('em.services').factory('tasksArray', ['itemsArray',
    function(itemsArray) {
      var tasks;

      return {
        setTasks : function(tasks) {
          this.tasks = tasks;
        },
        getTasks : function() {
          return this.tasks;
        },
        putNewTask : function(task) {
          if (!itemsArray.itemInArray(this.tasks, task.title)) {
            this.tasks.push(task);
          }
        }
      };
    }]);
  }());

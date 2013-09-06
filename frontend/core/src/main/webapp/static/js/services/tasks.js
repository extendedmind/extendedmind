/*global angular*/
/*jslint plusplus: true*/

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
          httpRequest.get('/api/' + userSessionStorage.getUserUUID() + '/task/' + task.uuid + '/complete', function(completeTaskResponse) {
            success(completeTaskResponse);
          }, function(completeTaskResponse) {
            error(completeTaskResponse);
          });
        },
        uncompleteTask : function(task, success, error) {
          httpRequest.get('/api/' + userSessionStorage.getUserUUID() + '/task/' + task.uuid + '/uncomplete', function(uncompleteTaskResponse) {
            success(uncompleteTaskResponse);
          }, function(uncompleteTaskResponse) {
            error(uncompleteTaskResponse);
          });
        }
      };
    }]);

    angular.module('em.services').factory('tasksResponse', ['itemsResponse',
    function(itemsResponse) {
      return {
        putTaskContent : function(task, putTaskResponse) {
          itemsResponse.putItemContent(task, putTaskResponse);
        },
        deleteTaskProperty : function(task, property) {
          itemsResponse.deleteItemProperty(task, property);
        }
      };
    }]);

    angular.module('em.services').factory('tasksArray', ['itemsArray',
    function(itemsArray) {
      var projects, subtasks, tasks;
      projects = [];
      subtasks = [];

      return {
        setTasks : function(tasks) {
          this.tasks = tasks;
        },
        getTasks : function() {
          return this.tasks;
        },
        setProjects : function(tasks) {
          var i = 0;

          while (tasks[i]) {
            if (tasks[i].project) {
              if (!itemsArray.itemInArray(projects, tasks[i].uuid)) {
                projects.push(tasks[i]);
              }
            }
            i++;
          }
        },
        getProjects : function() {
          return projects;
        },
        setSubtasks : function(tasks) {
          var i = 0;

          while (tasks[i]) {
            if (tasks[i].relationships) {
              if (tasks[i].relationships.parentTask) {
                if (!itemsArray.itemInArray(subtasks, tasks[i].uuid)) {
                  subtasks.push(tasks[i]);
                }
              }
            }
            i++;
          }
        },
        getSubtasks : function() {
          return subtasks;
        },
        putNewTask : function(task) {
          if (!itemsArray.itemInArray(this.tasks, task.uuid)) {
            this.tasks.push(task);
          }
        }
      };
    }]);
  }());

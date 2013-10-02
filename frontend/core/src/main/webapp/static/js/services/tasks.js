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
        putExistingTask : function(task, success, error) {
          httpRequest.put('/api/' + userSessionStorage.getUserUUID() + '/task/' + task.uuid, task, function(putExistingTaskResponse) {
            success(putExistingTaskResponse);
          }, function(putExistingTaskResponse) {
            error(putExistingTaskResponse);
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
      tasks = [];
      projects = [];
      subtasks = [];

      return {
        setTasks : function(tasks) {
          var i = 0;

          while (tasks[i]) {
            if (tasks[i].relationships) {
              if (tasks[i].relationships.parentTask) {
                this.setSubtask(tasks[i]);
              }
            }

            if (tasks[i].project) {
              this.setProject(tasks[i]);
            } else {
              this.setTask(tasks[i]);
            }
            i++;
          }
        },
        getTasks : function() {
          return tasks;
        },
        setTask : function(task) {
          if (!itemsArray.itemInArray(tasks, task.uuid)) {
            tasks.push(task);
          }
        },
        setProject : function(task) {
          if (!itemsArray.itemInArray(projects, task.uuid)) {
            projects.push(task);
          }
        },
        getProjects : function() {
          return projects;
        },
        setSubtask : function(task) {
          if (!itemsArray.itemInArray(subtasks, task.uuid)) {
            subtasks.push(task);
          }
        },
        getSubtasks : function() {
          return subtasks;
        },
        putNewTask : function(task) {
          if (!itemsArray.itemInArray(tasks, task.uuid)) {
            tasks.push(task);
            if (task.relationships) {
              if (task.relationships.parentTask) {
                this.setSubtask(task);
              }
            }
          }
        }
      };
    }]);
  }());

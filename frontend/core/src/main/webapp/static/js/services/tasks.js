/*global angular*/
/*jslint eqeq: true plusplus: true*/

( function() {'use strict';

    angular.module('em.services').factory('tasksRequest', ['httpRequest', 'userSessionStorage',
    function(httpRequest, userSessionStorage) {
      return {
        putTask : function(task) {
          return httpRequest.put('/api/' + userSessionStorage.getUserUUID() + '/task', task).then(function(putTaskResponse) {
            return putTaskResponse.data;
          });
        },
        putExistingTask : function(task) {
          return httpRequest.put('/api/' + userSessionStorage.getUserUUID() + '/task/' + task.uuid, task).then(function(putExistingTaskResponse) {
            return putExistingTaskResponse.data;
          });
        },
        deleteTask : function(task) {
          return httpRequest['delete']('/api/' + userSessionStorage.getUserUUID() + '/task/' + task.uuid).then(function(deleteTaskResponse) {
            return deleteTaskResponse.data;
          });
        },
        completeTask : function(task) {
          return httpRequest.post('/api/' + userSessionStorage.getUserUUID() + '/task/' + task.uuid + '/complete').then(function(completeTaskResponse) {
            return completeTaskResponse.data;
          });
        },
        uncompleteTask : function(task) {
          return httpRequest.post('/api/' + userSessionStorage.getUserUUID() + '/task/' + task.uuid + '/uncomplete').then(function(uncompleteTaskResponse) {
            return uncompleteTaskResponse.data;
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
        setTasks : function(tasksResponse) {
          if (tasksResponse != null) {
            var i = 0;

            while (tasksResponse[i]) {
              if (tasksResponse[i].relationships) {
                if (tasksResponse[i].relationships.parentTask) {
                  this.setSubtask(tasksResponse[i]);
                }
              }

              if (tasksResponse[i].project) {
                this.setProject(tasksResponse[i]);
              } else {
                this.setTask(tasksResponse[i]);
              }
              i++;
            }
          } else {
            tasks = [];
          }
        },
        setTask : function(task) {
          if (!itemsArray.itemInArray(tasks, task.uuid)) {
            tasks.push(task);
          }
        },
        removeTask : function(task) {
          itemsArray.removeItemFromArray(tasks, task);

          if (task.relationships) {
            if (task.relationships.parentTask) {
              this.removeSubtask(task);
              this.removeProject(task.relationships.parentTask);
            }
          }
        },
        removeSubtask : function(task) {
          itemsArray.removeItemFromArray(subtasks, task);
        },
        removeProject : function(uuid) {

          if (this.getSubtasksByUuid(uuid).length === 0) {
            var task = this.getProjectByUuid(uuid);
            itemsArray.removeItemFromArray(projects, task);
            this.deleteTaskProperty(task, 'project');
            this.setTask(task);
          }
        },
        getTasks : function() {
          return tasks;
        },
        getProjectByUuid : function(uuid) {
          return itemsArray.getItemByUuid(projects, uuid);
        },
        getSubtaskByUuid : function(uuid) {
          return itemsArray.getItemByUuid(subtasks, uuid);
        },
        getSubtasksByUuid : function(uuid) {
          return itemsArray.getItemsByUuid(subtasks, uuid);
        },
        getTaskByUuid : function(uuid) {
          return itemsArray.getItemByUuid(tasks, uuid);
        },
        deleteTaskProperty : function(task, property) {
          itemsArray.deleteItemProperty(task, property);
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

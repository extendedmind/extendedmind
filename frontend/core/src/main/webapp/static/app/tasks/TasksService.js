/*global angular */
'use strict';

function TasksService(BackendClientService, UserSessionService, ArrayService){
  var tasks = [];
  var deletedTasks = [];
  var completedTasks = [];

  var taskRegex = /\/task/;
  var taskSlashRegex = /\/task\//;
  var completeRegex = /\/complete/;
  var uncompleteRegex = /\/uncomplete/;

  return {
    setTasks: function(tasksResponse) {
      ArrayService.setArrays(tasksResponse, tasks, deletedTasks, completedTasks, 'completed');
    },
    updateTasks: function(tasksResponse) {
      ArrayService.updateArrays(tasksResponse, tasks, deletedTasks, completedTasks, 'completed');
    },
    getTasks: function() {
      return tasks;
    },
    getTaskByUUID: function(uuid) {
      return tasks.findFirstObjectByKeyValue('uuid', uuid);
    },
    saveTask: function(task) {
      if (task.uuid){
        // Existing task
        BackendClientService.put('/api/' + UserSessionService.getActiveUUID() + '/task/' + task.uuid,
                 this.putExistingTaskRegex, task).then(function(result) {
          if (result.data){
            task.modified = result.data.modified;
            ArrayService.updateItem(task, tasks, deletedTasks, completedTasks, 'completed');
          }
        });
      }else{
        // New task
        BackendClientService.put('/api/' + UserSessionService.getActiveUUID() + '/task',
                 this.putNewTaskRegex, task).then(function(result) {
          if (result.data){
            task.uuid = result.data.uuid;
            task.modified = result.data.modified;
            ArrayService.setItem(task, tasks, deletedTasks, completedTasks, 'completed');
          }
        });
      }
    },
    deleteTask: function(task) {
      BackendClientService.delete('/api/' + UserSessionService.getActiveUUID() + '/task/' + task.uuid,
               this.deleteTaskRegex).then(function(result) {
        if (result.data){
          task.deleted = result.data.deleted;
          task.modified = result.data.result.modified;
          ArrayService.updateItem(task, tasks, deletedTasks, completedTasks, 'completed');
        }
      });
    },
    undeleteTask: function(task) {
      BackendClientService.post('/api/' + UserSessionService.getActiveUUID() + '/task/' + task.uuid + '/undelete',
               this.deleteTaskRegex).then(function(result) {
        if (result.data){
          delete task.deleted;
          task.modified = result.data.modified;
          ArrayService.updateItem(task, tasks, deletedTasks, completedTasks, 'completed');
        }
      });
    },
    completeTask: function(task) {
      BackendClientService.post('/api/' + UserSessionService.getActiveUUID() + '/task/' + task.uuid + '/complete',
               this.completeTaskRegex).then(function(result) {
        if (result.data){
          task.completed = result.data.completed;
          task.modified = result.data.result.modified;
          ArrayService.updateItem(task, tasks, deletedTasks, completedTasks, 'completed');
        }
      });
    },
    uncompleteTask: function(task) {
      BackendClientService.post('/api/' + UserSessionService.getActiveUUID() + '/task/' + task.uuid + '/uncomplete',
               this.deleteTaskRegex).then(function(result) {
        if (result.data){
          delete task.completed;
          task.modified = result.data.modified;
          ArrayService.updateItem(task, tasks, deletedTasks, completedTasks, 'completed');
        }
      });
    },
    // Regular expressions for task requests
    putNewTaskRegex :
        new RegExp(BackendClientService.apiPrefixRegex.source +
                   BackendClientService.uuidRegex.source +
                   taskRegex.source),
    putExistingTaskRegex:
        new RegExp(BackendClientService.apiPrefixRegex.source +
                   BackendClientService.uuidRegex.source +
                   taskSlashRegex.source +
                   BackendClientService.uuidRegex.source),
    deleteTaskRegex:
        new RegExp(BackendClientService.apiPrefixRegex.source +
                   BackendClientService.uuidRegex.source +
                   taskSlashRegex.source +
                   BackendClientService.uuidRegex.source),
    undeleteTaskRegex:
        new RegExp(BackendClientService.apiPrefixRegex.source +
                   BackendClientService.uuidRegex.source +
                   taskSlashRegex.source +
                   BackendClientService.uuidRegex.source  +
                   BackendClientService.undeleteRegex.source),
    completeTaskRegex:
        new RegExp(BackendClientService.apiPrefixRegex.source +
                   BackendClientService.uuidRegex.source +
                   taskSlashRegex.source +
                   BackendClientService.uuidRegex.source  +
                   completeRegex.source),
    uncompleteTaskRegex:
        new RegExp(BackendClientService.apiPrefixRegex.source +
                   BackendClientService.uuidRegex.source +
                   taskSlashRegex.source +
                   BackendClientService.uuidRegex.source  +
                   uncompleteRegex.source),
  };
}
  
TasksService.$inject = ['BackendClientService', 'UserSessionService', 'ArrayService'];
angular.module('em.services').factory('TasksService', TasksService);
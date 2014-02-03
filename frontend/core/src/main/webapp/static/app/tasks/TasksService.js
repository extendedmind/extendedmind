/*global angular */
'use strict';

function TasksService(BackendClientService, UserSessionService, ArrayService, ListsService){
  var tasks = [];
  var deletedTasks = [];
  var archivedTasks = [];
  var completedTasks = [];
  var recentlyCompletedTasks = [];
  var otherArrays = [{array: archivedTasks, id: 'archived'},{array: completedTasks, id: 'completed'}];

  var taskRegex = /\/task/;
  var taskSlashRegex = /\/task\//;
  var completeRegex = /\/complete/;
  var uncompleteRegex = /\/uncomplete/;

  // Setup callback to ListsService
  var itemArchiveCallback = function(children, archived){
    if (children){
      for (var i=0, len=children.length; i<len; i++) {
        var activeTask = tasks.findFirstObjectByKeyValue('uuid', children[i].uuid);
        if (activeTask){
          activeTask.archived = archived;
          activeTask.modified = children[i].modified;
          ArrayService.updateItem(activeTask, tasks, deletedTasks, otherArrays);
        }else{
          var deletedTask = deletedTasks.findFirstObjectByKeyValue('uuid', children[i].uuid);
          if (deletedTask){
            deletedTask.archived = archived;
            deletedTask.modified = children[i].modified;
            ArrayService.updateItem(deletedTask, tasks, deletedTasks, otherArrays);
          }else{
            var completedTask = completedTasks.findFirstObjectByKeyValue('uuid', children[i].uuid);
            if (completedTask){
              completedTask.archived = archived;
              completedTask.modified = children[i].modified;
              ArrayService.updateItem(completedTask, tasks, deletedTasks, otherArrays);
            }else{
              var archivedTask = archivedTasks.findFirstObjectByKeyValue('uuid', children[i].uuid);
              if (archivedTask){
                archivedTask.archived = archived;
                archivedTask.modified = children[i].modified;
                ArrayService.updateItem(archivedTask, tasks, deletedTasks, otherArrays);
              }
            }
          }
        }
      }
    }
  };
  ListsService.registerItemArchiveCallback(itemArchiveCallback, 'TasksService');

  function cleanRecentlyCompletedTasks(){
    // Loop through recently completed tasks and delete them from the tasks array
    for (var i=0, len=recentlyCompletedTasks.length; i<len; i++) {
      var recentlyCompletedTaskIndex = tasks.findFirstIndexByKeyValue('uuid', recentlyCompletedTasks[i].uuid);
      if (recentlyCompletedTaskIndex !== undefined){
        tasks.splice(recentlyCompletedTaskIndex, 1);
      }
    }
    recentlyCompletedTasks.length = 0;
  }

  return {
    setTasks: function(tasksResponse) {
      cleanRecentlyCompletedTasks();
      return ArrayService.setArrays(tasksResponse, tasks, deletedTasks, otherArrays);
    },
    updateTasks: function(tasksResponse) {
      cleanRecentlyCompletedTasks();
      return ArrayService.updateArrays(tasksResponse, tasks, deletedTasks, otherArrays);
    },
    getTasks: function() {
      return tasks;
    },
    getCompletedTasks: function() {
      return completedTasks;
    },
    getArchivedTasks: function() {
      return archivedTasks;
    },
    getTaskByUUID: function(uuid) {
      return tasks.findFirstObjectByKeyValue('uuid', uuid);
    },
    saveTask: function(task) {
      cleanRecentlyCompletedTasks();
      if (task.uuid){
        // Existing task
        BackendClientService.put('/api/' + UserSessionService.getActiveUUID() + '/task/' + task.uuid,
                 this.putExistingTaskRegex, task).then(function(result) {
          if (result.data){
            task.modified = result.data.modified;
            ArrayService.updateItem(task, tasks, deletedTasks, otherArrays);
          }
        });
      }else{
        // New task
        BackendClientService.put('/api/' + UserSessionService.getActiveUUID() + '/task',
                 this.putNewTaskRegex, task).then(function(result) {
          if (result.data){
            task.uuid = result.data.uuid;
            task.modified = result.data.modified;
            ArrayService.setItem(task, tasks, deletedTasks, otherArrays);
          }
        });
      }
    },
    deleteTask: function(task) {
      cleanRecentlyCompletedTasks();
      BackendClientService.delete('/api/' + UserSessionService.getActiveUUID() + '/task/' + task.uuid,
               this.deleteTaskRegex).then(function(result) {
        if (result.data){
          task.deleted = result.data.deleted;
          task.modified = result.data.result.modified;
          ArrayService.updateItem(task, tasks, deletedTasks, otherArrays);
        }
      });
    },
    undeleteTask: function(task) {
      cleanRecentlyCompletedTasks();
      BackendClientService.post('/api/' + UserSessionService.getActiveUUID() + '/task/' + task.uuid + '/undelete',
               this.deleteTaskRegex).then(function(result) {
        if (result.data){
          delete task.deleted;
          task.modified = result.data.modified;
          ArrayService.updateItem(task, tasks, deletedTasks, otherArrays);
        }
      });
    },
    completeTask: function(task) {
      cleanRecentlyCompletedTasks();
      BackendClientService.post('/api/' + UserSessionService.getActiveUUID() + '/task/' + task.uuid + '/complete',
               this.completeTaskRegex).then(function(result) {
        if (result.data){
          task.completed = result.data.completed;
          // Don't change modified on complete to prevent
          // task from moving down in the list on uncomplete.
          //task.modified = result.data.result.modified;
          var taskIndex = tasks.findFirstIndexByKeyValue('uuid', task.uuid);
          ArrayService.updateItem(task, tasks, deletedTasks, otherArrays);
          // Put the completed task back to the active tasks array
          // and also the completedTasks array, to prevent completed
          // task from disappearing immediately.
          tasks.splice(taskIndex, 0, task);
          recentlyCompletedTasks.push(task);
        }
      });
    },
    uncompleteTask: function(task) {
      BackendClientService.post('/api/' + UserSessionService.getActiveUUID() + '/task/' + task.uuid + '/uncomplete',
               this.deleteTaskRegex).then(function(result) {
        if (result.data){
          delete task.completed;
          // Don't change modified on uncomplete to prevent
          // task from moving down in the list when clicking on/off.
          //task.modified = result.data.modified;
          cleanRecentlyCompletedTasks();
          ArrayService.updateItem(task, tasks, deletedTasks, otherArrays);
        }
      });
    },
    taskToList: function(task) {
      cleanRecentlyCompletedTasks();
      var index = tasks.findFirstIndexByKeyValue('uuid', task.uuid);
      if (index !== undefined && !task.reminder && !task.repeating && !task.completed) {
        // Save as list and remove from tasks array
        ListsService.saveList(task);
        tasks.splice(index, 1);
      }
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
  
TasksService.$inject = ['BackendClientService', 'UserSessionService', 'ArrayService', 'ListsService'];
angular.module('em.services').factory('TasksService', TasksService);
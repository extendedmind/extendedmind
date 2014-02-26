/*global angular */
'use strict';

function TasksService($q, $rootScope, UUIDService, UserSessionService, BackendClientService, ArrayService, ListsService, TagsService){
  var tasks = {};

  var taskRegex = /\/task/;
  var taskSlashRegex = /\/task\//;
  var completeRegex = /\/complete/;
  var uncompleteRegex = /\/uncomplete/;

  function initializeArrays(ownerUUID){
    if (!tasks[ownerUUID]){
      tasks[ownerUUID] = {
        activeTasks: [],
        deletedTasks: [],
        archivedTasks: [],
        completedTasks: [],
        recentlyCompletedTasks: []
      };
    }
  }

  function getOtherArrays(ownerUUID){
    return [{array: tasks[ownerUUID].archivedTasks, id: 'archived'},
            {array: tasks[ownerUUID].completedTasks, id: 'completed'}];
  }

  function updateTask(task, ownerUUID) {
    return ArrayService.updateItem(task,
              tasks[ownerUUID].activeTasks,
              tasks[ownerUUID].deletedTasks,
              getOtherArrays(ownerUUID));
  }

  function setTask(task, ownerUUID){
    initializeArrays(ownerUUID);
    ArrayService.setItem(task,
      tasks[ownerUUID].activeTasks,
      tasks[ownerUUID].deletedTasks,
      getOtherArrays(ownerUUID));
  }
  
  // Setup callback to ListsService
  var itemArchiveCallback = function(children, archived, ownerUUID){
    if (tasks[ownerUUID] && children){
      for (var i=0, len=children.length; i<len; i++) {
        var activeTask = tasks[ownerUUID].activeTasks.findFirstObjectByKeyValue('uuid', children[i].uuid);
        if (activeTask){
          activeTask.archived = archived;
          activeTask.modified = children[i].modified;
          updateTask(activeTask, ownerUUID);
        }else{
          var deletedTask = tasks[ownerUUID].deletedTasks.findFirstObjectByKeyValue('uuid', children[i].uuid);
          if (deletedTask){
            deletedTask.archived = archived;
            deletedTask.modified = children[i].modified;
            updateTask(deletedTask, ownerUUID);
          }else{
            var completedTask = tasks[ownerUUID].completedTasks.findFirstObjectByKeyValue('uuid', children[i].uuid);
            if (completedTask){
              completedTask.archived = archived;
              completedTask.modified = children[i].modified;
              updateTask(completedTask, ownerUUID);
            }else{
              var archivedTask = tasks[ownerUUID].archivedTasks.findFirstObjectByKeyValue('uuid', children[i].uuid);
              if (archivedTask){
                archivedTask.archived = archived;
                archivedTask.modified = children[i].modified;
                updateTask(archivedTask, ownerUUID);
              }
            }
          }
        }
      }
    }
  };
  ListsService.registerItemArchiveCallback(itemArchiveCallback, 'TasksService');

  function cleanRecentlyCompletedTasks(ownerUUID){
    if (tasks[ownerUUID]){
      // Loop through recently completed tasks and delete them from the activeTasks array
      for (var i=0, len=tasks[ownerUUID].recentlyCompletedTasks.length; i<len; i++) {
        var recentlyCompletedTaskIndex = tasks[ownerUUID].activeTasks.findFirstIndexByKeyValue('uuid', tasks[ownerUUID].recentlyCompletedTasks[i].uuid);
        if (recentlyCompletedTaskIndex !== undefined){
          tasks[ownerUUID].activeTasks.splice(recentlyCompletedTaskIndex, 1);
        }
      }
      tasks[ownerUUID].recentlyCompletedTasks.length = 0;
    }
  }

  function addContextToTasks(tasksResponse, ownerUUID){
    if (tasksResponse){
      for (var i=0, len=tasksResponse.length; i<len; i++) {
        if (tasksResponse[i].relationships && tasksResponse[i].relationships.tags){
          for (var j=0, jlen=tasksResponse[i].relationships.tags.length; j<jlen; j++) {
            var tag = TagsService.getTagByUUID(tasksResponse[i].relationships.tags[j], ownerUUID);
            if (tag && tag.tagType === 'context'){
              tasksResponse[i].relationships.context = tag.uuid;
              return;
            }
          }
        }
      }
    }
  }

  function addListToTasks(tasksResponse){
    if (tasksResponse){
      for (var i=0, len=tasksResponse.length; i<len; i++) {
        if (tasksResponse[i].relationships && tasksResponse[i].relationships.parent){
          tasksResponse[i].relationships.list = tasksResponse[i].relationships.parent;
        }
      }
    }
  }

  function addDateToTasks(tasksResponse){
    if (tasksResponse){
      for (var i=0, len=tasksResponse.length; i<len; i++) {
        if (tasksResponse[i].due){
          tasksResponse[i].date = tasksResponse[i].due;
        }
      }
    }
  }

  function moveContextToTags(task, ownerUUID){
    if (task.relationships && task.relationships.context){
      var context = task.relationships.context;
      if (task.relationships.tags){
        var foundCurrent = false;
        var previousContextIndex;
        for (var i=0, len=task.relationships.tags.length; i<len; i++) {
          var tag = TagsService.getTagByUUID(task.relationships.tags[i], ownerUUID);
          if (tag && tag.tagType === 'context'){
            if (tag.uuid === context){
              foundCurrent = true;
            }else{
              previousContextIndex = i;
            }
          }
        }
        if (previousContextIndex !== undefined){
          // Remove old
          task.relationships.tags.splice(previousContextIndex, 1);
        }
        if (!foundCurrent){
          // Add new
          task.relationships.tags.push(context);
        }
      }else{
        task.relationships.tags = [context];
      }
      delete task.relationships.context;
      return context;
    }
  }

  function moveListToParent(task){
    if (task.relationships && task.relationships.list){
      var list = task.relationships.list;
      task.relationships.parent = list;
      delete task.relationships.list;
      return list;
    }
  }

  function moveDateToDue(task){
    if (task.date){
      task.due = task.date;
      delete task.date;
      return task.due;
    } 
  }

  function processCompletedTask(task, ownerUUID){
    // Don't change modified on complete to prevent
    // task from moving down in the list on uncomplete.
    //task.modified = result.data.result.modified;
    var taskIndex = tasks[ownerUUID].activeTasks.findFirstIndexByKeyValue('uuid', task.uuid);
    updateTask(task, ownerUUID);
    // Put the completed task back to the active tasks[ownerUUID].activeTasks array
    // and also the completedTasks array, to prevent completed
    // task from disappearing immediately.
    tasks[ownerUUID].activeTasks.splice(taskIndex, 0, task);
    tasks[ownerUUID].recentlyCompletedTasks.push(task);
  }

  return {
    setTasks: function(tasksResponse, ownerUUID) {
      initializeArrays(ownerUUID);
      cleanRecentlyCompletedTasks(ownerUUID);
      addContextToTasks(tasksResponse, ownerUUID);
      addListToTasks(tasksResponse);
      addDateToTasks(tasksResponse);
      return ArrayService.setArrays(
          tasksResponse,
          tasks[ownerUUID].activeTasks,
          tasks[ownerUUID].deletedTasks,
          getOtherArrays(ownerUUID));
    },
    updateTasks: function(tasksResponse, ownerUUID) {
      initializeArrays(ownerUUID);
      cleanRecentlyCompletedTasks(ownerUUID);
      return ArrayService.updateArrays(
          tasksResponse,
          tasks[ownerUUID].activeTasks,
          tasks[ownerUUID].deletedTasks,
          getOtherArrays(ownerUUID));
    },
    updateTaskProperties: function(uuid, properties, ownerUUID) {
      return ArrayService.updateItemProperties(
                uuid,
                properties,
                tasks[ownerUUID].activeTasks,
                tasks[ownerUUID].deletedTasks,
                getOtherArrays(ownerUUID));
    },
    getTasks: function(ownerUUID) {
      initializeArrays(ownerUUID);
      return tasks[ownerUUID].activeTasks;
    },
    getCompletedTasks: function(ownerUUID) {
      initializeArrays(ownerUUID);
      return tasks[ownerUUID].completedTasks;
    },
    getArchivedTasks: function(ownerUUID) {
      initializeArrays(ownerUUID);
      return tasks[ownerUUID].archivedTasks;
    },
    getTaskByUUID: function(uuid, ownerUUID) {
      return tasks[ownerUUID].activeTasks.findFirstObjectByKeyValue('uuid', uuid);
    },
    saveTask: function(task, ownerUUID) {
      function updateTransientProperties(context, list, due){
        if (context){
          task.relationships.context = context;
        }
        if (list){
          task.relationships.list = list;
        }
        if (due){
          task.date = due;
        }
      }

      var deferred = $q.defer();
      cleanRecentlyCompletedTasks(ownerUUID);
      var context = moveContextToTags(task, ownerUUID);
      var list = moveListToParent(task);
      var due = moveDateToDue(task);
      if (task.uuid){
        // Existing task
        if (UserSessionService.isOfflineEnabled()){
          // Push to offline buffer
          params = {type: 'task', owner: ownerUUID, uuid: task.uuid};
          BackendClientService.put('/api/' + params.owner + '/task/' + task.uuid,
                   this.putExistingTaskRegex, params, task);
          task.modified = (new Date()).getTime() + 1000000;
          updateTransientProperties(context, list, due);
          updateTask(task, ownerUUID);
          deferred.resolve(task);
        }else{
          // Online
          BackendClientService.putOnline('/api/' + ownerUUID + '/task/' + task.uuid,
                   this.putExistingTaskRegex, task).then(function(result) {
            if (result.data){
              task.modified = result.data.modified;
              updateTransientProperties(context, list, due);
              updateTask(task, ownerUUID);
              deferred.resolve(task);
            }
          });
        }
      }else{
        // New task
        if (UserSessionService.isOfflineEnabled()){
          // Push to offline queue with fake UUID
          var fakeUUID = UUIDService.generateFakeUUID();
          var params = {type: 'task', owner: ownerUUID, fakeUUID: fakeUUID};
          BackendClientService.put('/api/' + params.owner + '/task',
                   this.putNewTaskRegex, params, task);
          task.uuid = fakeUUID;
          // Use a fake modified that is far enough in the to make
          // it to the end of the list
          task.modified = (new Date()).getTime() + 1000000;
          updateTransientProperties(context, list, due);
          setTask(task, ownerUUID);
          deferred.resolve(task);
        } else{
          // Online
          BackendClientService.putOnline('/api/' + ownerUUID + '/task',
                 this.putNewTaskRegex, task).then(function(result) {
            if (result.data){
              task.uuid = result.data.uuid;
              task.modified = result.data.modified;
              updateTransientProperties(context, list, due);
              setTask(task, ownerUUID);
              deferred.resolve(task);
            }
          });
        }
      }
      return deferred.promise;
    },
    deleteTask: function(task, ownerUUID) {
      cleanRecentlyCompletedTasks(ownerUUID);
      if (UserSessionService.isOfflineEnabled()){
        // Offline
        var params = {type: 'task', owner: ownerUUID, uuid: task.uuid,
                      reverse: {
                        method: 'post',
                        url: '/api/' + ownerUUID + '/task/' + task.uuid + '/undelete'
                      }};
        BackendClientService.deleteOffline('/api/' + ownerUUID + '/task/' + task.uuid,
                 this.deleteTaskRegex, params);
        var fakeTimestamp = (new Date()).getTime() + 1000000;
        task.deleted = fakeTimestamp;
        task.modified = fakeTimestamp;
        updateTask(task, ownerUUID);
      }else{
        // Online
        BackendClientService.deleteOnline('/api/' + ownerUUID + '/task/' + task.uuid,
                 this.deleteTaskRegex).then(function(result) {
          if (result.data){
            task.deleted = result.data.deleted;
            task.modified = result.data.result.modified;
            updateTask(task, ownerUUID);
          }
        });
      }
    },
    undeleteTask: function(task, ownerUUID) {
      cleanRecentlyCompletedTasks(ownerUUID);
      if (UserSessionService.isOfflineEnabled()){
        // Offline
        var params = {type: 'task', owner: ownerUUID, uuid: task.uuid};
        BackendClientService.post('/api/' + ownerUUID + '/task/' + task.uuid + '/undelete',
                 this.undeleteTaskRegex, params);
        delete task.deleted;
        updateTask(task, ownerUUID);
      }else{
        // Online
        BackendClientService.postOnline('/api/' + ownerUUID + '/task/' + task.uuid + '/undelete',
                 this.undeleteTaskRegex).then(function(result) {
          if (result.data){
            delete task.deleted;
            task.modified = result.data.modified;
            updateTask(task, ownerUUID);          }
        });
      }
    },
    completeTask: function(task, ownerUUID) {
      cleanRecentlyCompletedTasks(ownerUUID);
      if (UserSessionService.isOfflineEnabled()){
        // Offline
        var params = {type: 'task', owner: ownerUUID, uuid: task.uuid,
                      reverse: {
                        method: 'post',
                        url: '/api/' + ownerUUID + '/task/' + task.uuid + '/uncomplete'
                      }};
        BackendClientService.post('/api/' + ownerUUID + '/task/' + task.uuid + '/complete',
                 this.completeTaskRegex, params);
        task.completed = (new Date()).getTime() + 1000000;
        processCompletedTask(task, ownerUUID);
      }else{
        // Online
        BackendClientService.postOnline('/api/' + ownerUUID + '/task/' + task.uuid + '/complete',
                 this.completeTaskRegex).then(function(result) {
          if (result.data){
            task.completed = result.data.completed;
            processCompletedTask(task, ownerUUID);
          }
        });
      }
    },
    uncompleteTask: function(task, ownerUUID) {
      if (UserSessionService.isOfflineEnabled()){
        var params = {type: 'task', owner: ownerUUID, uuid: task.uuid};
        // Offline
        BackendClientService.post('/api/' + ownerUUID + '/task/' + task.uuid + '/uncomplete',
                 this.uncompleteTaskRegex, params);
        delete task.completed;
        // Don't change modified on uncomplete to prevent
        // task from moving down in the list when clicking on/off.
        //task.modified = result.data.modified;
        cleanRecentlyCompletedTasks(ownerUUID);
        updateTask(task, ownerUUID);
      }else{
        // Online
        BackendClientService.postOnline('/api/' + ownerUUID + '/task/' + task.uuid + '/uncomplete',
                 this.uncompleteTaskRegex).then(function(result) {
          if (result.data){
            delete task.completed;
            // Don't change modified on uncomplete to prevent
            // task from moving down in the list when clicking on/off.
            //task.modified = result.data.modified;
            cleanRecentlyCompletedTasks(ownerUUID);
            updateTask(task, ownerUUID);
          }
        });
      }

    },
    taskToList: function(task, ownerUUID) {
      cleanRecentlyCompletedTasks(ownerUUID);
      var index = tasks[ownerUUID].activeTasks.findFirstIndexByKeyValue('uuid', task.uuid);
      if (index !== undefined && !task.reminder && !task.repeating && !task.completed) {
        // Save as list and remove from the activeTasks array
        ListsService.saveList(task, ownerUUID);
        tasks[ownerUUID].activeTasks.splice(index, 1);
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
  
TasksService.$inject = ['$q', '$rootScope', 'UUIDService', 'UserSessionService', 'BackendClientService', 'ArrayService', 'ListsService', 'TagsService'];
angular.module('em.services').factory('TasksService', TasksService);
/* Copyright 2013-2014 Extended Mind Technologies Oy
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

 /*global angular */
 'use strict';

 function TasksService($q, $rootScope,
                       ArrayService, BackendClientService, ExtendedItemService, ItemLikeService,
                       ListsService, TagsService, UISessionService, UserSessionService, UUIDService) {
  var taskFieldInfos = ItemLikeService.getFieldInfos(
    [ 'due',
      'reminder',
      'repeating',
      {
        name: 'completed',
        isEdited: function(task, ownerUUID){
          if (task.mod && task.mod.completed && !task.trans.completed) return true;
          else if (task.completed && !task.trans.completed) return true;
        },
        resetTrans: function(task){
          if (task.mod && task.mod.completed !== undefined) task.trans.completed = task.mod.completed;
          else task.trans.completed = task.completed !== undefined;
        },
      },
      // TODO:
      // assignee,
      // assigner,
      // visibility,
      ExtendedItemService.getRelationshipsFieldInfo()
    ]
  );

  var tasks = {};
  var taskSlashRegex = /\/task\//;
  var completeRegex = /\/complete/;
  var uncompleteRegex = /\/uncomplete/;

  function initializeArrays(ownerUUID) {
    if (!tasks[ownerUUID]) {
      tasks[ownerUUID] = {
        activeTasks: [],
        deletedTasks: [],
        archivedTasks: []
      };
    }
  }
  UserSessionService.registerNofifyOwnerCallback(initializeArrays, 'TasksService');

  function getOtherArrays(ownerUUID) {
    return [{array: tasks[ownerUUID].archivedTasks, id: 'archived'}];
  }

  function updateTask(task, ownerUUID) {
    ItemLikeService.persistAndReset(task, 'task', ownerUUID, taskFieldInfos);
    return ArrayService.updateItem(task,
                                   tasks[ownerUUID].activeTasks,
                                   tasks[ownerUUID].deletedTasks,
                                   getOtherArrays(ownerUUID));
  }

  function setTask(task, ownerUUID) {
    ItemLikeService.persistAndReset(task, 'task', ownerUUID, taskFieldInfos);
    ArrayService.setItem(task,
                         tasks[ownerUUID].activeTasks,
                         tasks[ownerUUID].deletedTasks,
                         getOtherArrays(ownerUUID));
  }

  // Setup callback to ListsService
  var itemArchiveCallback = function(children, archived, ownerUUID) {
    if (tasks[ownerUUID] && children) {
      for (var i=0, len=children.length; i<len; i++) {
        var activeTask =
          tasks[ownerUUID].activeTasks.findFirstObjectByKeyValue('uuid', children[i].uuid);
        if (activeTask) {
          activeTask.archived = archived;
          activeTask.modified = children[i].modified;
          updateTask(activeTask, ownerUUID);
        } else {
          var deletedTask =
            tasks[ownerUUID].deletedTasks.findFirstObjectByKeyValue('uuid', children[i].uuid);
          if (deletedTask) {
            deletedTask.archived = archived;
            deletedTask.modified = children[i].modified;
            updateTask(deletedTask, ownerUUID);
          } else {
            var archivedTask =
              tasks[ownerUUID].archivedTasks.findFirstObjectByKeyValue('uuid', children[i].uuid);
            if (archivedTask) {
              archivedTask.archived = archived;
              archivedTask.modified = children[i].modified;
              updateTask(archivedTask, ownerUUID);
            }
          }
        }
      }
    }
  };
  ListsService.registerItemArchiveCallback(itemArchiveCallback, 'TasksService');

  // Setup callback for tags
  var tagDeletedCallback = function(deletedTag, ownerUUID, undelete) {
    if (tasks[ownerUUID] && deletedTag) {
      if (!undelete){
        // Remove tags from existing parents
        var modifiedItems = TagsService.removeDeletedTagFromItems(tasks[ownerUUID].activeTasks,
                                                                  deletedTag);
        modifiedItems.concat(TagsService.removeDeletedTagFromItems(tasks[ownerUUID].deletedTasks,
                                                                   deletedTag));
        modifiedItems.concat(TagsService.removeDeletedTagFromItems(tasks[ownerUUID].archivedTasks,
                                                                   deletedTag));
        for (var i=0,len=modifiedItems.length;i<len;i++){
          updateTask(modifiedItems[i], ownerUUID);
        }
      }else{
        // Undelete
        // TODO: Deleted context should not be removed completely but instead put to a task.history
        // object so that here it would be possible to undo a context deletion easily!
      }
    }
  };
  TagsService.registerTagDeletedCallback(tagDeletedCallback, 'TasksService');

  // Setup callback for lists
  var listDeletedCallback = function(deletedList, ownerUUID, undelete) {
    if (tasks[ownerUUID] && deletedList){
      if (!undelete){
        // Remove list from existing parents
        var modifiedItems = ListsService.removeDeletedListFromItems(tasks[ownerUUID].activeTasks,
                                                                    deletedList);
        modifiedItems.concat(ListsService.removeDeletedListFromItems(tasks[ownerUUID].deletedTasks,
                                                                     deletedList));
        modifiedItems.concat(ListsService.removeDeletedListFromItems(tasks[ownerUUID].archivedTasks,
                                                                     deletedList));
        for (var i=0,len=modifiedItems.length;i<len;i++){
          updateTask(modifiedItems[i], ownerUUID);
        }
      }else{
        // TODO: Undelete
      }
    }
  };
  ListsService.registerListDeletedCallback(listDeletedCallback, 'TasksService');

  return {
    setTasks: function(tasksResponse, ownerUUID) {
      ItemLikeService.persistAndReset(tasksResponse, 'task', ownerUUID, taskFieldInfos);
      return ArrayService.setArrays(tasksResponse,
                                    tasks[ownerUUID].activeTasks,
                                    tasks[ownerUUID].deletedTasks,
                                    getOtherArrays(ownerUUID));
    },
    updateTasks: function(tasksResponse, ownerUUID) {
      ItemLikeService.persistAndReset(tasksResponse, 'task', ownerUUID, taskFieldInfos);
      return ArrayService.updateArrays(tasksResponse,
                                       tasks[ownerUUID].activeTasks,
                                       tasks[ownerUUID].deletedTasks,
                                       getOtherArrays(ownerUUID));
    },
    updateTaskProperties: function(uuid, properties, ownerUUID) {
      var taskInfo = this.getTaskInfo(uuid, ownerUUID);
      if (taskInfo){
        ItemLikeService.updateObjectProperties(taskInfo.task, properties);
        updateTask(taskInfo.task, ownerUUID);
        return taskInfo.task;
      }
    },
    getTasks: function(ownerUUID) {
      return tasks[ownerUUID].activeTasks;
    },
    getArchivedTasks: function(ownerUUID) {
      return tasks[ownerUUID].archivedTasks;
    },
    getDeletedTasks: function(ownerUUID) {
      return tasks[ownerUUID].deletedTasks;
    },
    getTaskInfo: function(uuid, ownerUUID) {
      var task = tasks[ownerUUID].activeTasks.findFirstObjectByKeyValue('uuid', uuid, 'trans');
      if (task){
        return {
          type: 'active',
          task: ItemLikeService.resetTrans(task, 'task', ownerUUID, taskFieldInfos)
        };
      }
      task = tasks[ownerUUID].deletedTasks.findFirstObjectByKeyValue('uuid', uuid, 'trans');
      if (task){
        return {
          type: 'deleted',
          task: ItemLikeService.resetTrans(task, 'task', ownerUUID, taskFieldInfos)
        };
      }
      task = tasks[ownerUUID].archivedTasks.findFirstObjectByKeyValue('uuid', uuid, 'trans');
      if (task){
        return {
          type: 'archived',
          task: ItemLikeService.resetTrans(task, 'task', ownerUUID, taskFieldInfos)
        };
      }
    },
    saveTask: function(task, ownerUUID) {
      var deferred = $q.defer();
      if (tasks[ownerUUID].deletedTasks.findFirstObjectByKeyValue('uuid', task.trans.uuid, 'trans')) {
        deferred.reject({type: 'deleted'});
      } else {
        ItemLikeService.save(task, 'task', ownerUUID, taskFieldInfos).then(
          function(result){
            if (result === 'new') setTask(task, ownerUUID);
            else if (result === 'existing') updateTask(task, ownerUUID);
            deferred.resolve(result);
          }, function(failure){
            deferred.reject(failure);
          }
        );
      }
      return deferred.promise;
    },
    getTaskStatus: function(task, ownerUUID) {
      var arrayInfo = ArrayService.getActiveArrayInfo(task,
                                                      tasks[ownerUUID].activeTasks,
                                                      tasks[ownerUUID].deletedTasks,
                                                      getOtherArrays(ownerUUID));

      if (arrayInfo) return arrayInfo.type;
    },
    addTask: function(task, ownerUUID) {
      // Check that task is not deleted before trying to add
      if (this.getTaskStatus(task, ownerUUID) === 'deleted') return;
      setTask(task, ownerUUID);
    },
    removeTask: function(task, ownerUUID) {
      ArrayService.removeFromArrays(task,
                                    tasks[ownerUUID].activeTasks,
                                    tasks[ownerUUID].deletedTasks,
                                    getOtherArrays(ownerUUID));
    },
    deleteTask: function(task, ownerUUID) {
      var deferred = $q.defer();
      if (tasks[ownerUUID].deletedTasks.findFirstObjectByKeyValue('uuid', task.trans.uuid, 'trans')) {
        deferred.resolve('unmodified');
      }else{
        ItemLikeService.processDelete(task, 'task', ownerUUID, taskFieldInfos).then(
          function(){
            updateTask(task, ownerUUID);
            deferred.resolve(task);
          }, function(failure){
            deferred.reject(failure);
          }
        );
      }
      return deferred.promise;
    },
    undeleteTask: function(task, ownerUUID) {
      var deferred = $q.defer();
      if (!tasks[ownerUUID].deletedTasks.findFirstObjectByKeyValue('uuid', task.trans.uuid, 'trans')) {
        deferred.resolve('unmodified');
      }else{
        ItemLikeService.undelete(task, 'task', ownerUUID, taskFieldInfos).then(
          function(){
            updateTask(task, ownerUUID);
            deferred.resolve(task);
          }, function(failure){
            deferred.reject(failure);
          }
        );
      }
      return deferred.promise;
    },
    completeTask: function(task, ownerUUID) {
      var deferred = $q.defer();
      if (tasks[ownerUUID].deletedTasks.findFirstObjectByKeyValue('uuid', task.trans.uuid, 'trans')) {
        deferred.reject({type: 'deleted'});
      } else if (task.trans.completed === true){
        deferred.resolve(task);
      } else {
        if (UserSessionService.isOfflineEnabled()) {
          // Offline
          var params = {type: 'task', owner: ownerUUID, uuid: task.trans.uuid,
          reverse: {
            method: 'post',
            url: '/api/' + ownerUUID + '/task/' + task.uuid + '/uncomplete'
          }, replaceable: true};
          BackendClientService.post('/api/' + ownerUUID + '/task/' + task.trans.uuid + '/complete',
                                    this.completeTaskRegex, params);
          var fakeTimestamp = BackendClientService.generateFakeTimestamp();
          if (!task.mod) task.mod = {};
          ItemLikeService.updateObjectProperties(task.mod,
                                                 {modified: fakeTimestamp, completed: true});
          updateTask(task, ownerUUID);
          deferred.resolve(task);
        } else {
          // Online
          BackendClientService.postOnline('/api/' + ownerUUID + '/task/' + task.trans.uuid + '/complete',
                                          this.completeTaskRegex)
          .then(function(result) {
            task.completed = result.data.completed;
            ItemLikeService.updateObjectProperties(task, result.data.result);
            updateTask(task, ownerUUID);
            deferred.resolve(task);
          });
        }
      }
      return deferred.promise;
    },
    uncompleteTask: function(task, ownerUUID) {
      var deferred = $q.defer();
      if (tasks[ownerUUID].deletedTasks.findFirstObjectByKeyValue('uuid', task.trans.uuid, 'trans')) {
        deferred.reject({type: 'deleted'});
      } else if (!task.trans.completed){
        deferred.resolve(task);
      } else {
        if (UserSessionService.isOfflineEnabled()) {
          // Offline
          var params = {type: 'task', owner: ownerUUID, uuid: task.uuid,
          reverse: {
            method: 'post',
            url: '/api/' + ownerUUID + '/task/' + task.uuid + '/complete'
          },
          replaceable: true};
          BackendClientService.post('/api/' + ownerUUID + '/task/' + task.uuid + '/uncomplete',
                                    this.uncompleteTaskRegex, params);
          var fakeTimestamp = BackendClientService.generateFakeTimestamp();
          if (!task.mod) task.mod = {};
          ItemLikeService.updateObjectProperties(task.mod,
                                                 {modified: fakeTimestamp, completed: false});
          updateTask(task, ownerUUID);
          deferred.resolve(task);
        } else {
          // Online
          BackendClientService.postOnline('/api/' + ownerUUID + '/task/' + task.trans.uuid + '/complete',
                                          this.completeTaskRegex)
          .then(function(result) {
            delete task.completed;
            ItemLikeService.updateObjectProperties(task, result.data.result);
            updateTask(task, ownerUUID);
            deferred.resolve(task);
          });
        }
      }
      return deferred.promise;
    },

    // Regular expressions for task requests
    putNewTaskRegex: ItemLikeService.getPutNewRegex('task'),
    putExistingTaskRegex: ItemLikeService.getPutExistingRegex('task'),
    deleteTaskRegex: ItemLikeService.getDeleteRegex('task'),
    undeleteTaskRegex: ItemLikeService.getUndeleteRegex('task'),
    completeTaskRegex: new RegExp(BackendClientService.apiPrefixRegex.source +
                                  BackendClientService.uuidRegex.source +
                                  taskSlashRegex.source +
                                  BackendClientService.uuidRegex.source +
                                  completeRegex.source),
    uncompleteTaskRegex: new RegExp(BackendClientService.apiPrefixRegex.source +
                                    BackendClientService.uuidRegex.source +
                                    taskSlashRegex.source +
                                    BackendClientService.uuidRegex.source +
                                    uncompleteRegex.source),
  };
}

TasksService['$inject'] = ['$q', '$rootScope',
  'ArrayService', 'BackendClientService', 'ExtendedItemService', 'ItemLikeService',
  'ListsService', 'TagsService', 'UISessionService', 'UserSessionService', 'UUIDService'];
angular.module('em.tasks').factory('TasksService', TasksService);

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
          task.trans.completed = task.completed !== undefined;
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
        var activeTask = tasks[ownerUUID].activeTasks.findFirstObjectByKeyValue('uuid', children[i].uuid);
        if (activeTask) {
          activeTask.archived = archived;
          activeTask.modified = children[i].modified;
          updateTask(activeTask, ownerUUID);
        } else {
          var deletedTask = tasks[ownerUUID].deletedTasks.findFirstObjectByKeyValue('uuid', children[i].uuid);
          if (deletedTask) {
            deletedTask.archived = archived;
            deletedTask.modified = children[i].modified;
            updateTask(deletedTask, ownerUUID);
          } else {
            var archivedTask = tasks[ownerUUID].archivedTasks.findFirstObjectByKeyValue('uuid',
                                                                                        children[i].uuid);
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
        var modifiedItems = TagsService.removeDeletedTagFromItems(tasks[ownerUUID].activeTasks, deletedTag);
        modifiedItems.concat(TagsService.removeDeletedTagFromItems(tasks[ownerUUID].deletedTasks, deletedTag));
        modifiedItems.concat(TagsService.removeDeletedTagFromItems(tasks[ownerUUID].archivedTasks,deletedTag));
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
      if (this.getTaskStatus(task, ownerUUID) === 'deleted') deferred.reject(task);
      else {
        var transientProperties = this.detachTransientProperties(task, ownerUUID);
        if (task.uuid) {
          // Existing task
          if (UserSessionService.isOfflineEnabled()) {
            // Push to offline buffer
            params = {type: 'task', owner: ownerUUID, uuid: task.uuid};
            BackendClientService.put('/api/' + params.owner + '/task/' + task.uuid,
                                     this.putExistingTaskRegex, params, task);
            task.modified = BackendClientService.generateFakeTimestamp();
            ExtendedItemService.attachTransientProperties(task, transientProperties, 'task');
            updateTask(task, ownerUUID);
            deferred.resolve(task);
          } else {
            // Online
            BackendClientService.putOnline('/api/' + ownerUUID + '/task/' + task.uuid,
                                           this.putExistingTaskRegex, task).
            then(function(result) {
              if (result.data) {
                task.modified = result.data.modified;
                ExtendedItemService.attachTransientProperties(task, transientProperties, 'task');
                updateTask(task, ownerUUID);
                deferred.resolve(task);
              }
            });
          }
        } else {
          // New task
          if (UserSessionService.isOfflineEnabled()) {
            // Push to offline queue with fake UUID
            var fakeUUID = UUIDService.generateFakeUUID();
            var params = {type: 'task', owner: ownerUUID, fakeUUID: fakeUUID};
            BackendClientService.put('/api/' + params.owner + '/task',
                                     this.putNewTaskRegex, params, task);
            task.uuid = fakeUUID;
            // Use a fake modified that is far enough in the to make
            // it to the end of the list
            task.created = task.modified = BackendClientService.generateFakeTimestamp();
            ExtendedItemService.attachTransientProperties(task, transientProperties, 'task');
            setTask(task, ownerUUID);
            deferred.resolve(task);
          } else {
            // Online
            BackendClientService.putOnline('/api/' + ownerUUID + '/task',
                                           this.putNewTaskRegex, task).
            then(function(result) {
              if (result.data) {
                task.uuid = result.data.uuid;
                task.created = result.data.created;
                task.modified = result.data.modified;
                ExtendedItemService.attachTransientProperties(task, transientProperties, 'task');
                setTask(task, ownerUUID);
                deferred.resolve(task);
              }
            });
          }
        }
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
      // Check if task has already been deleted
      if (this.getTaskStatus(task, ownerUUID) === 'deleted') return;

      if (UserSessionService.isOfflineEnabled()) {
        // Offline
        var params = {type: 'task', owner: ownerUUID, uuid: task.uuid,
        reverse: {
          method: 'post',
          url: '/api/' + ownerUUID + '/task/' + task.uuid + '/undelete'
        }, replaceable: true};
        BackendClientService.deleteOffline('/api/' + ownerUUID + '/task/' + task.uuid,
                                           this.deleteTaskRegex, params);
        task.deleted = task.modified = BackendClientService.generateFakeTimestamp();
        updateTask(task, ownerUUID);
      } else {
        // Online
        BackendClientService.deleteOnline('/api/' + ownerUUID + '/task/' + task.uuid,
                                          this.deleteTaskRegex)
        .then(function(result) {
          if (result.data) {
            task.deleted = result.data.deleted;
            task.modified = result.data.result.modified;
            updateTask(task, ownerUUID);
          }
        });
      }
    },
    undeleteTask: function(task, ownerUUID) {
      // Check that task is deleted before trying to undelete
      if (this.getTaskStatus(task, ownerUUID) !== 'deleted') return;

      if (UserSessionService.isOfflineEnabled()) {
        // Offline
        var params ={type: 'task', owner: ownerUUID, uuid: task.uuid,
        reverse: {
          method: 'post',
          url: '/api/' + ownerUUID + '/task/' + task.uuid + '/delete'
        },
        replaceable: true};
        BackendClientService.post('/api/' + ownerUUID + '/task/' + task.uuid + '/undelete',
                                  this.undeleteTaskRegex, params);
        delete task.deleted;
        updateTask(task, ownerUUID);
      } else {
        // Online
        BackendClientService.postOnline('/api/' + ownerUUID + '/task/' + task.uuid + '/undelete',
                                        this.undeleteTaskRegex)
        .then(function(result) {
          if (result.data) {
            delete task.deleted;
            task.modified = result.data.modified;
            updateTask(task, ownerUUID);
          }
        });
      }
    },
    completeTask: function(task, ownerUUID) {
      var deferred = $q.defer();
      // Check that task is not deleted before trying to complete
      if (this.getTaskStatus(task, ownerUUID) === 'deleted') return;

      if (UserSessionService.isOfflineEnabled()) {
        // Offline
        var params = {type: 'task', owner: ownerUUID, uuid: task.uuid,
        reverse: {
          method: 'post',
          url: '/api/' + ownerUUID + '/task/' + task.uuid + '/uncomplete'
        }, replaceable: true};
        BackendClientService.post('/api/' + ownerUUID + '/task/' + task.uuid + '/complete',
                                  this.completeTaskRegex, params);
        task.completed = task.modified = BackendClientService.generateFakeTimestamp();
        updateTask(task, ownerUUID);
        deferred.resolve(task);
      } else {
        // Online
        BackendClientService.postOnline('/api/' + ownerUUID + '/task/' + task.uuid + '/complete',
                                        this.completeTaskRegex)
        .then(function(result) {
          if (result.data) {
            task.completed = result.data.completed;
            task.modified = result.data.modified;
          }
          updateTask(task, ownerUUID);
          deferred.resolve(task);
        });
      }
      return deferred.promise;
    },
    uncompleteTask: function(task, ownerUUID) {
      var deferred = $q.defer();
      // Check that task is not deleted before trying to uncomplete
      if (this.getTaskStatus(task, ownerUUID) === 'deleted') return;

      if (UserSessionService.isOfflineEnabled()) {
        var params = {type: 'task', owner: ownerUUID, uuid: task.uuid,
        reverse: {
          method: 'post',
          url: '/api/' + ownerUUID + '/task/' + task.uuid + '/complete'
        },
        replaceable: true};
        // Offline
        BackendClientService.post('/api/' + ownerUUID + '/task/' + task.uuid + '/uncomplete',
                                  this.uncompleteTaskRegex, params);
        delete task.completed;
        task.modified = BackendClientService.generateFakeTimestamp();
        updateTask(task, ownerUUID);
        deferred.resolve(task);
      } else {
        // Online
        BackendClientService.postOnline('/api/' + ownerUUID + '/task/' + task.uuid + '/uncomplete',
                                        this.uncompleteTaskRegex)
        .then(function(result) {
          if (result.data) {
            delete task.completed;
            task.modified = result.data.modified;
            updateTask(task, ownerUUID);
          }
          deferred.resolve(task);
        });
      }
      return deferred.promise;
    },
    addTransientProperties: function(tasksArray, ownerUUID, addExtraTransientPropertyFn) {
      addTransientProperties(tasksArray, ownerUUID, addExtraTransientPropertyFn);
    },
    detachTransientProperties: function(task, ownerUUID) {
      var detachExtraTransientPropertyFunctions = [copyDateToDue, copyTransientDescriptionToPersistent];
      return ExtendedItemService.detachTransientProperties(task, ownerUUID,
                                                           detachExtraTransientPropertyFunctions);
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

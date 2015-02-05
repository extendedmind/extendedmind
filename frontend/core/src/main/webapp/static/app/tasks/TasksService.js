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
                       ArrayService, BackendClientService, DateService, ExtendedItemService, ItemLikeService,
                       ListsService, TagsService, UISessionService, UserSessionService, UUIDService) {

  /*
  * Create a separate 'optimisticComplete' getter/setter which can be used by checkbox ng-bind.
  *
  * this = task.trans
  */
  function optimisticComplete(value) {
    /* jshint validthis: true */
    if (value !== undefined){
      // setter
      if ($rootScope.outerSwiping || $rootScope.innerSwiping || $rootScope.scrolling ||
          $rootScope.contentPartiallyVisible)
      {
        // Make sure we are not in the middle of swiper swipe and/or scroll or that the content is not
        // only partially visible.
        // NOTE:  Better place for this check would be for example in iconCheckboxDirective with
        //        ngModelController.$validators.validNotMoved. See inputModelValidatorDirective for
        //        reference.
        return;
      }
      if (value === true)
        this._complete = Date.now();
      else
        this._complete = Date.now() * -1;
    }else{
      // getter
      if (this._complete > 0 && this.completed === undefined) {
        // Complete action fired less than half a second ago - we are propably in a $digest() loop
        // caused by it.
        return true;
      } else if (this._complete < 0 && this.completed !== undefined) {
        // Task is uncompleted in the UI and its internal status is completed.
        return false;
      }

      // Get value from internal status.
      return this.completed !== undefined;
    }
  }

  var taskFieldInfos = ItemLikeService.getFieldInfos(
    [ 'due',
      'reminder',
      'repeating',
      {
        name: 'completed',
        skipTransport: true,
        isEdited: function(){
          // Changing completed should not save task. Completing is done with separate functions.
          return false;
        },
        resetTrans: function(task){
          if (task.mod && task.mod.hasOwnProperty('completed')){
            if (!task.mod.completed && task.trans.completed !== undefined) delete task.trans.completed;
            else task.trans.completed = task.mod.completed;
          }
          else if (task.completed !== undefined) task.trans.completed = task.completed;
          else if (task.trans.completed !== undefined) delete task.trans.completed;
          task.trans._complete = 0;
          task.trans.optimisticComplete = optimisticComplete;
        }
      },
      // TODO (when implementing this, update the method below for repeating task cloning!:
      // assignee,
      // assigner,
      // visibility,
      ExtendedItemService.getRelationshipsFieldInfo()
    ]
  );

  function getRepeatingTaskInitialValues(task) {
    var initialValues = {
      title: task.trans.title,
      repeating: task.trans.repeating
    };
    var dueDate = new Date(task.trans.due);
    switch(task.trans.repeating){
    case 'daily':
      dueDate.setDate(dueDate.getDate()+1);
      break;
    case 'weekly':
      dueDate.setDate(dueDate.getDate()+7);
      break;
    case 'monthly':
      dueDate.setMonth(dueDate.getMonth()+1);
      break;
    case 'yearly':
      dueDate.setFullYear(dueDate.getFullYear()+1);
      break;
    }
    initialValues.due = DateService.getYYYYMMDD(dueDate);
    if (task.trans.description) initialValues.description = task.trans.description;
    if (task.trans.reminder) initialValues.reminder = task.trans.reminder;
    if (task.trans.list) initialValues.list = task.trans.list;
    if (task.trans.context) initialValues.context = task.trans.context;
    if (task.trans.keywords) initialValues.keywords = task.trans.keywords;
    return initialValues;
  }

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

  function updateTask(task, ownerUUID, oldUUID, propertiesToReset) {
    ItemLikeService.persistAndReset(task, 'task', ownerUUID, taskFieldInfos, oldUUID, propertiesToReset);
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
      var modifiedItems, i;
      if (!undelete){
        // Remove tags from existing parents
        modifiedItems = TagsService.removeDeletedTagFromItems(tasks[ownerUUID].activeTasks,
                                                                  deletedTag);
        modifiedItems.concat(TagsService.removeDeletedTagFromItems(tasks[ownerUUID].deletedTasks,
                                                                   deletedTag));
        modifiedItems.concat(TagsService.removeDeletedTagFromItems(tasks[ownerUUID].archivedTasks,
                                                                   deletedTag));
        for (i=0;i<modifiedItems.length;i++){
          updateTask(modifiedItems[i], ownerUUID);
        }
      }else{
        // Add tag back to items on undelete
        modifiedItems = TagsService.addUndeletedTagToItems(tasks[ownerUUID].activeTasks,
                                                                    deletedTag);
        modifiedItems.concat(TagsService.addUndeletedTagToItems(tasks[ownerUUID].deletedTasks,
                                                                     deletedTag));
        modifiedItems.concat(TagsService.addUndeletedTagToItems(tasks[ownerUUID].archivedTasks,
                                                                     deletedTag));
        for (i=0;i<modifiedItems.length;i++){
          updateTask(modifiedItems[i], ownerUUID);
        }
      }
    }
  };
  TagsService.registerTagDeletedCallback(tagDeletedCallback, 'TasksService');

  // Setup callback for lists
  var listDeletedCallback = function(deletedList, ownerUUID, undelete) {
    if (tasks[ownerUUID] && deletedList){
      var modifiedItems, i;
      if (!undelete){
        // Remove list from existing parents
        modifiedItems = ListsService.removeDeletedListFromItems(tasks[ownerUUID].activeTasks,
                                                                    deletedList);
        modifiedItems.concat(ListsService.removeDeletedListFromItems(tasks[ownerUUID].deletedTasks,
                                                                     deletedList));
        modifiedItems.concat(ListsService.removeDeletedListFromItems(tasks[ownerUUID].archivedTasks,
                                                                     deletedList));
        for (i=0;i<modifiedItems.length;i++){
          updateTask(modifiedItems[i], ownerUUID);
        }
      }else{
        // Add list back to items on undelete
        modifiedItems = ListsService.addUndeletedListToItems(tasks[ownerUUID].activeTasks,
                                                                    deletedList);
        modifiedItems.concat(ListsService.addUndeletedListToItems(tasks[ownerUUID].deletedTasks,
                                                                     deletedList));
        modifiedItems.concat(ListsService.addUndeletedListToItems(tasks[ownerUUID].archivedTasks,
                                                                     deletedList));
        for (i=0;i<modifiedItems.length;i++){
          updateTask(modifiedItems[i], ownerUUID);
        }
      }
    }
  };
  ListsService.registerListDeletedCallback(listDeletedCallback, 'TasksService');

  var listUUIDChangedCallback = function(oldListUUID, newListUUID, ownerUUID) {
    function compareChangedListUUID(task, oldListUUID, newListUUID, ownerUUID) {
      var found = false;
      if (task.mod && task.mod.relationships && task.mod.relationships.parent === oldListUUID){
        task.mod.relationships.parent = newListUUID;
        found = true;
      }
      if (task.relationships && task.relationships.parent === oldListUUID){
        task.relationships.parent = newListUUID;
        found = true;
      }
      if (tasks.hist && task.hist.deletedList === oldListUUID){
        tasks.hist.deletedList = newListUUID;
        found = true;
      }
      if (found){
        updateTask(task, ownerUUID);
      }
    }
    var i;
    for(i=0; i<tasks[ownerUUID].activeTasks.length; i++){
      compareChangedListUUID(tasks[ownerUUID].activeTasks[i], oldListUUID, newListUUID, ownerUUID);
    }
    for(i=0; i<tasks[ownerUUID].deletedTasks.length; i++){
      compareChangedListUUID(tasks[ownerUUID].deletedTasks[i], oldListUUID, newListUUID, ownerUUID);
    }
    for(i=0; i<tasks[ownerUUID].archivedTasks.length; i++){
      compareChangedListUUID(tasks[ownerUUID].archivedTasks[i], oldListUUID, newListUUID, ownerUUID);
    }
  };
  ListsService.registerListUUIDChangedCallback(listUUIDChangedCallback, 'TasksService');

  return {
    getNewTask: function(initialValues, ownerUUID) {
      var newTask = ItemLikeService.getNew(initialValues, 'task', ownerUUID, taskFieldInfos);
      newTask.trans.optimisticComplete = optimisticComplete;
      return newTask;
    },
    prepareConvertTask: function(item) {
      item.trans.optimisticComplete = optimisticComplete;
      return item;
    },
    setTasks: function(tasksResponse, ownerUUID, skipPersist) {
      if (skipPersist){
        ItemLikeService.resetTrans(tasksResponse, 'task', ownerUUID, taskFieldInfos);
      }else{
        ItemLikeService.persistAndReset(tasksResponse, 'task', ownerUUID, taskFieldInfos);
      }
      return ArrayService.setArrays(tasksResponse,
                                    tasks[ownerUUID].activeTasks,
                                    tasks[ownerUUID].deletedTasks,
                                    getOtherArrays(ownerUUID));
    },
    updateTasks: function(tasksResponse, ownerUUID) {
      if (tasksResponse && tasksResponse.length){
        // Go through tasksResponse, and add .mod values if the fields in the current .mod do not match
        // the values in the persistent response
        var updatedTasks = [];
        for (var i=0, len=tasksResponse.length; i<len; i++){
          var taskInfo = this.getTaskInfo(tasksResponse[i].uuid, ownerUUID);
          if (taskInfo){
            var oldMod = taskInfo.task.mod;
            updatedTasks.push(taskInfo.task);
            ItemLikeService.evaluateMod(tasksResponse[i], taskInfo.task, 'task', ownerUUID, taskFieldInfos);
            ItemLikeService.persistAndReset(taskInfo.task, 'task', ownerUUID,
                                            taskFieldInfos, undefined, oldMod);
          }else{
            updatedTasks.push(tasksResponse[i]);
            ItemLikeService.persistAndReset(tasksResponse[i], 'task', ownerUUID, taskFieldInfos);
          }
        }
        return ArrayService.updateArrays(updatedTasks,
                                         tasks[ownerUUID].activeTasks,
                                         tasks[ownerUUID].deletedTasks,
                                         getOtherArrays(ownerUUID));
      }
    },
    updateTaskModProperties: function(uuid, properties, ownerUUID) {
      var taskInfo = this.getTaskInfo(uuid, ownerUUID);
      if (taskInfo){
        if (!properties){
          if (taskInfo.task.mod){
            delete taskInfo.task.mod;
            updateTask(taskInfo.task, ownerUUID);
          }
        }else{
          if (!taskInfo.task.mod) taskInfo.task.mod = {};
          ItemLikeService.updateObjectProperties(taskInfo.task.mod, properties);
          if (properties.uuid){
            // UUID has changed
            updateTask(taskInfo.task, ownerUUID, uuid, properties);
          }else{
            updateTask(taskInfo.task, ownerUUID, undefined, properties);
          }
        }
        return taskInfo.task;
      }
    },
    updateTaskHistProperties: function(uuid, properties, ownerUUID) {
      var taskInfo = this.getTaskInfo(uuid, ownerUUID);
      if (taskInfo){
        if (!properties){
          if (taskInfo.task.hist){
            delete taskInfo.task.hist;
            updateTask(taskInfo.task, ownerUUID);
          }
        }else{
          if (!taskInfo.task.hist) taskInfo.task.hist = {};
          ItemLikeService.updateObjectProperties(taskInfo.task.hist, properties);
          // Last parameter is to prevent unnecessary resetting of trans
          updateTask(taskInfo.task, ownerUUID, undefined, {});
          return taskInfo.task;
        }
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
    getModifiedTasks: function(ownerUUID) {
      return ArrayService.getModifiedItems(tasks[ownerUUID].activeTasks,
                                         tasks[ownerUUID].deletedTasks,
                                         getOtherArrays(ownerUUID));
    },
    getTaskInfo: function(uuid, ownerUUID) {
      var task = tasks[ownerUUID].activeTasks.findFirstObjectByKeyValue('uuid', uuid, 'trans');
      if (task){
        return {
          type: 'active',
          task: task
        };
      }
      task = tasks[ownerUUID].deletedTasks.findFirstObjectByKeyValue('uuid', uuid, 'trans');
      if (task){
        return {
          type: 'deleted',
          task: task
        };
      }
      task = tasks[ownerUUID].archivedTasks.findFirstObjectByKeyValue('uuid', uuid, 'trans');
      if (task){
        return {
          type: 'archived',
          task: task
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
      setTask(task, ownerUUID);
    },
    removeTask: function(uuid, ownerUUID) {
      var taskInfo = this.getTaskInfo(uuid, ownerUUID);
      if (taskInfo) {
        var taskIndex;
        if (taskInfo.type === 'active') {
          taskIndex = tasks[ownerUUID].activeTasks.indexOf(taskInfo.task);
          ItemLikeService.remove(taskInfo.task.trans.uuid);
          tasks[ownerUUID].activeTasks.splice(taskIndex, 1);
        } else if (taskInfo.type === 'deleted') {
          taskIndex = tasks[ownerUUID].deletedTasks.indexOf(taskInfo.task);
          ItemLikeService.remove(taskInfo.task.trans.uuid);
          tasks[ownerUUID].deletedTasks.splice(taskIndex, 1);
        } else if (taskInfo.type === 'archived') {
          taskIndex = tasks[ownerUUID].archivedTasks.indexOf(taskInfo.task);
          ItemLikeService.remove(taskInfo.task.trans.uuid);
          tasks[ownerUUID].archivedTasks.splice(taskIndex, 1);
        }
      }
    },
    isTaskEdited: function(task, ownerUUID) {
      return ItemLikeService.isEdited(task, 'task', ownerUUID, taskFieldInfos);
    },
    resetTask: function(task, ownerUUID) {
      return ItemLikeService.resetTrans(task, 'task', ownerUUID, taskFieldInfos);
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
      } else if (task.trans.completed){
        deferred.resolve(task);
      } else {
        if (UserSessionService.isOfflineEnabled()) {
          // Offline
          var params = {
            type: 'task', owner: ownerUUID, uuid: task.trans.uuid,
            lastReplaceable: true
          };
          var fakeTimestamp = BackendClientService.generateFakeTimestamp();

          // Handle repeating task when a repeating task has not already been generated
          if (task.trans.repeating && !(task.hist && task.hist.generatedUUID)){
            var fakeRepeatingUUID = UUIDService.generateFakeUUID();
            var repeatingTask = this.getNewTask(getRepeatingTaskInitialValues(task));
            ItemLikeService.copyEditedFieldsToMod(repeatingTask, 'task', ownerUUID, taskFieldInfos);
            ItemLikeService.updateObjectProperties(repeatingTask.mod,
              {uuid: fakeRepeatingUUID,
               modified: fakeTimestamp,
               created: fakeTimestamp});
            setTask(repeatingTask, ownerUUID);
            // store information that task has been repeated to the task itself and to the POST call
            if (!task.hist) task.hist = {};
            task.hist.generatedUUID = fakeRepeatingUUID;
            params.generatedFakeUUID = fakeRepeatingUUID;
          }else {
            // completing can be reversed only if a new task has not been generated
            params.reverse = {
              method: 'post',
              url: '/api/' + ownerUUID + '/task/' + task.trans.uuid + '/uncomplete'
            };
          }
          BackendClientService.postOffline('/api/' + ownerUUID + '/task/' + task.trans.uuid + '/complete',
                                    this.completeTaskRegex, params, undefined, fakeTimestamp);
          if (!task.mod) task.mod = {};
          var propertiesToReset = {modified: fakeTimestamp,
                                  completed: BackendClientService.generateFakeTimestamp()};
          ItemLikeService.updateObjectProperties(task.mod, propertiesToReset);
          updateTask(task, ownerUUID, undefined, propertiesToReset);
          deferred.resolve(task);
        } else {
          // Online
          BackendClientService.postOnline('/api/' + ownerUUID + '/task/' + task.trans.uuid + '/complete',
                                          this.completeTaskRegex)
          .then(function(response) {
            task.completed = response.completed;
            var propertiesToReset = {modified: response.result.modified,
                                     completed: response.completed};
            ItemLikeService.updateObjectProperties(task, propertiesToReset);
            updateTask(task, ownerUUID, undefined, propertiesToReset);
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
          var params = {type: 'task', owner: ownerUUID, uuid: task.trans.uuid, lastReplaceable: true};
          var fakeTimestamp = BackendClientService.generateFakeTimestamp();
          BackendClientService.postOffline('/api/' + ownerUUID + '/task/' + task.trans.uuid + '/uncomplete',
                                    this.uncompleteTaskRegex, params, undefined, fakeTimestamp);
          if (!task.mod) task.mod = {};
          var propertiesToReset = {modified: fakeTimestamp, completed: undefined};
          ItemLikeService.updateObjectProperties(task.mod, propertiesToReset);
          updateTask(task, ownerUUID, undefined, propertiesToReset);
          deferred.resolve(task);
        } else {
          // Online
          BackendClientService.postOnline('/api/' + ownerUUID + '/task/' + task.trans.uuid + '/uncomplete',
                                          this.uncompleteTaskRegex)
          .then(function(response) {
            var propertiesToReset = {modified: response.modified, completed: undefined};
            ItemLikeService.updateObjectProperties(task, propertiesToReset);
            // the above doesn't actually remove the property, which is what we want to do here
            delete task.completed;
            updateTask(task, ownerUUID, undefined, propertiesToReset);
            deferred.resolve(task);
          });
        }
      }
      return deferred.promise;
    },
    clearTasks: function() {
      tasks = {};
    },
    changeOwnerUUID: function(oldUUID, newUUID){
      if (tasks[oldUUID]){
        tasks[newUUID] = tasks[oldUUID];
        delete tasks[oldUUID];
        ItemLikeService.persistAndReset(tasks[newUUID].activeTasks, 'task', newUUID, taskFieldInfos);
        ItemLikeService.persistAndReset(tasks[newUUID].archivedTasks, 'task', newUUID, taskFieldInfos);
        ItemLikeService.persistAndReset(tasks[newUUID].deletedTasks, 'task', newUUID, taskFieldInfos);
      }
    },
    taskFieldInfos: taskFieldInfos,
    // Regular expressions for task requests
    putNewTaskRegex: ItemLikeService.getPutNewRegex('task'),
    putExistingTaskRegex: ItemLikeService.getPutExistingRegex('task'),
    deleteTaskRegex: ItemLikeService.getDeleteRegex('task'),
    undeleteTaskRegex: ItemLikeService.getUndeleteRegex('task'),
    completeTaskRegex: new RegExp('^' +
                                  BackendClientService.apiPrefixRegex.source +
                                  BackendClientService.uuidRegex.source +
                                  taskSlashRegex.source +
                                  BackendClientService.uuidRegex.source +
                                  completeRegex.source +
                                  '$'),
    uncompleteTaskRegex: new RegExp('^' +
                                    BackendClientService.apiPrefixRegex.source +
                                    BackendClientService.uuidRegex.source +
                                    taskSlashRegex.source +
                                    BackendClientService.uuidRegex.source +
                                    uncompleteRegex.source +
                                    '$')
  };
}

TasksService['$inject'] = ['$q', '$rootScope',
  'ArrayService', 'BackendClientService', 'DateService', 'ExtendedItemService', 'ItemLikeService',
  'ListsService', 'TagsService', 'UISessionService', 'UserSessionService', 'UUIDService'];
angular.module('em.tasks').factory('TasksService', TasksService);

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
 'use strict';

 function TasksController($rootScope, $scope, $timeout,
                          AnalyticsService, ArrayService, DateService, ItemsService, SwiperService,
                          TasksService, UISessionService) {

  // INITIALIZING
  if (angular.isFunction($scope.registerArrayChangeCallback)) {
    $scope.registerArrayChangeCallback('tasks', ['active', 'archived'], invalidateTasksArrays,
                                       'TasksController');
  }

  var cachedTasksArrays = {};

  function invalidateAllTasks(cachedTasks, ownerUUID) {
    if ($scope.getActiveFeature() === 'tasks') {
      updateActiveAndArchivedTasks(cachedTasks, ownerUUID);
      updateAllTasks(cachedTasks, ownerUUID);
    }
    else {
      cachedTasks['activeAndArchived'] = undefined;
      cachedTasks['all'] = undefined;
    }
  }

  function invalidateListTasks(cachedTasks, listUUID, ownerUUID) {
    if ($scope.getActiveFeature() === 'list') {
      updateActiveAndArchivedTasks(cachedTasks, ownerUUID);
      updateListTasks(cachedTasks, listUUID);
    } else {
      cachedTasks['activeAndArchived'] = undefined;
      delete cachedTasks['list'];
    }
  }

  /*
  * Invalidate cached active tasks arrays.
  *
  * @param {Object} task Changed task.
  */
  function invalidateTasksArrays(tasks, modifiedTask, tasksType, ownerUUID) {

    if (cachedTasksArrays[ownerUUID]) {
      var arrayType;
      if (tasksType === 'active') {
        for (arrayType in cachedTasksArrays[ownerUUID]) {
          if (cachedTasksArrays[ownerUUID].hasOwnProperty(arrayType)) {
            // Every cached tasks array has cached tasks.
            if (arrayType === 'all') {
              invalidateAllTasks(cachedTasksArrays[ownerUUID], ownerUUID);
            }
            else if (arrayType === 'date') {
              var focusActive = $scope.getActiveFeature() === 'focus';

              for (var date in cachedTasksArrays[ownerUUID]['date']) {
                if (cachedTasksArrays[ownerUUID]['date'].hasOwnProperty(date)) {
                  if (focusActive)
                    updateDateTasks(cachedTasksArrays[ownerUUID]['date'], {date: date}, ownerUUID);
                  else
                    delete cachedTasksArrays[ownerUUID]['date'][date];
                }
              }
            } else if (arrayType === 'list') {
              invalidateListTasks(cachedTasksArrays[ownerUUID], cachedTasksArrays[ownerUUID]['list'].uuid,
                                  ownerUUID);
            } else if (arrayType === 'context') {
              // TODO
              if ($scope.getActiveFeature() === 'tasks' && SwiperService.isSlideActive('tasks/context')) {
                updateContextTasks(cachedTasksArrays[ownerUUID]['context'],
                                   cachedTasksArrays[ownerUUID]['context'].id,
                                   ownerUUID);
              } else {
                delete cachedTasksArrays[ownerUUID]['context'];
              }
            }
          }
        }
      } else if (tasksType === 'archived') {
        for (arrayType in cachedTasksArrays[ownerUUID]) {
          if (cachedTasksArrays[ownerUUID].hasOwnProperty(arrayType)) {
            // Every cached tasks array has cached tasks.
            if (arrayType === 'all')
              invalidateAllTasks(cachedTasksArrays[ownerUUID], ownerUUID);
            else if (arrayType === 'list')
              invalidateListTasks(cachedTasksArrays[ownerUUID], cachedTasksArrays[ownerUUID]['list'].uuid,
                                  ownerUUID);
          }
        }
      }
    }
  }

  function updateActiveAndArchivedTasks(cachedTasks, ownerUUID) {
    var activeTasks = TasksService.getTasks(ownerUUID);
    var archivedTasks = TasksService.getArchivedTasks(ownerUUID);
    cachedTasks['activeAndArchived'] = ArrayService.combineAndSortArrays(activeTasks, archivedTasks,
                                                                         'created');
  }

  function updateAllTasks(cachedTasks, ownerUUID) {

    function compareWithFrozenModified(a, b) {
      return $scope.getTaskModified(a) - $scope.getTaskModified(b);
    }

    // Get tasks.
    var activeAndArchivedTasks = cachedTasks['activeAndArchived'];
    cachedTasks['all'] = [];
    // Sort and cache array.
    for (var i = 0; i < activeAndArchivedTasks.length; i++) {
      ArrayService.insertItemToArray(activeAndArchivedTasks[i],
                                     cachedTasks['all'],
                                     compareWithFrozenModified,
                                     true);
    }
  }

  function updateListTasks(cachedTasks, listUUID) {
    var activeAndArchivedTasks = cachedTasks['activeAndArchived'];

    cachedTasks['list'] = {
      array: [],
      uuid: listUUID
    };

    for (var i = activeAndArchivedTasks.length - 1; i >= 0; i--) {
      var task = activeAndArchivedTasks[i];
      if (task.trans.list && task.trans.list.uuid === listUUID) cachedTasks['list'].array.push(task);
    }
  }

  function updateContextTasks(cachedTasks, contextId, ownerUUID) {
    var activeTasks = TasksService.getTasks(ownerUUID), i;

    cachedTasks['context'] = {
      array: [],
      id: contextId
    };

    if (contextId === 'noContext') {
      for (i = activeTasks.length - 1; i >= 0; i--) {
        if (!activeTasks[i].trans.context) cachedTasks['context'].array.push(activeTasks[i]);
      }
    } else {
      for (i = activeTasks.length - 1; i >= 0; i--) {
        var task = activeTasks[i];
        if (task.trans.context && task.trans.context.uuid === contextId)
          cachedTasks['context'].array.push(task);
      }
    }
  }

  /*
  * Show completed on a past date.
  */
  function updatePastDateTasks(allActiveTasks, pastDateTasksArray, pastDateYYYYMMDD) {
    var pastDateMidnight = pastDateYYYYMMDD.yyyymmddToNoonDate().setHours(0, 0, 0, 0);

    for (var i = allActiveTasks.length - 1; i >= 0; i--) {
      var task = allActiveTasks[i];
      if (task.trans.completed && new Date(task.trans.completed).setHours(0, 0, 0, 0) === pastDateMidnight)
        pastDateTasksArray.push(task);
    }
  }

  /*
  * Show tasks without a date.
  */
  function updateNoDateTasks(allActiveTasks, noDateTasksArray) {
    for (var i = 0; i < allActiveTasks.length; i++) {
      if (!allActiveTasks[i].trans.due) noDateTasksArray.push(allActiveTasks[i]);
    }
  }

  function updateTodayTasks(allActiveTasks, todayTasks, todayYYYYMMDD) {
    var todayMidnight = DateService.getTodayDateWithoutTime();

    for (var i = allActiveTasks.length - 1; i >= 0; i--) {
      var task = allActiveTasks[i];
      if (task.trans.due && task.trans.due <= todayYYYYMMDD &&
          !(task.trans.completed && task.trans.completed < todayMidnight))
      {
        // Match overdue and today's tasks, but don't add tasks that were completed before today.
        todayTasks.push(task);
      }
      else if (task.trans.completed && task.trans.completed > todayMidnight) {
        // Add all tasks that were completed today.
        todayTasks.push(task);
      }
    }
  }

  /*
  * Show due tasks and completed on date.
  */
  function updateFutureDateTasks(allActiveTasks, futureDateTasks, futureYYYYMMDD) {
    var futureDateMidnight = futureYYYYMMDD.yyyymmddToNoonDate().setHours(0, 0, 0, 0);

    for (var i = allActiveTasks.length - 1; i >= 0; i--) {
      var task = allActiveTasks[i];
      if (task.trans.due && task.trans.due === futureYYYYMMDD) {
        futureDateTasks.push(task);
      } else if (task.trans.completed &&
                 new Date(task.trans.completed).setHours(0, 0, 0, 0) === futureDateMidnight)
      {
        futureDateTasks.push(task);
      }
    }
  }

  function updateDateTasks(cachedDates, info, ownerUUID) {
    var pastDate;

    if (cachedDates[info.date])
      pastDate = cachedDates[info.date].pastDate;
    else if (info.pastDate)
      pastDate = info.pastDate;

    cachedDates[info.date] = {
      array: [],
      pastDate: pastDate
    };

    if (pastDate) {
      updatePastDateTasks(TasksService.getTasks(ownerUUID), cachedDates[info.date].array, pastDate);
    } else if (info.date === 'noDate') {
      updateNoDateTasks(TasksService.getTasks(ownerUUID), cachedDates[info.date].array);
    } else {
      if (info.date === DateService.getTodayYYYYMMDD()) {
        updateTodayTasks(TasksService.getTasks(ownerUUID), cachedDates[info.date].array, info.date);
      } else {
        updateFutureDateTasks(TasksService.getTasks(ownerUUID), cachedDates[info.date].array, info.date);
      }
    }
  }

  function removeDistantDates(cachedDates, info) {
    if (info.date !== 'noDate') {

      if (cachedDates['noDate']) {
        // Clear 'no date' tasks from cache.
        delete cachedDates['noDate'];
      }

      for (var date in cachedDates) {
        if (cachedDates.hasOwnProperty(date)) {
          var difference = DateService.numberOfDaysBetweenYYYYMMDDs(date, info.date);
          if (difference > 2) {
            // Clear distant dates array from cache.
            delete cachedDates[date];
          }
        }
      }
    }
  }

  $scope.getTasksArray = function(arrayType, info) {
    var ownerUUID = UISessionService.getActiveUUID();
    if (!cachedTasksArrays[ownerUUID]) cachedTasksArrays[ownerUUID] = {};

    switch (arrayType) {

      case 'all':
      if (!cachedTasksArrays[ownerUUID]['activeAndArchived'])
        updateActiveAndArchivedTasks(cachedTasksArrays[ownerUUID], ownerUUID);
      if (!cachedTasksArrays[ownerUUID]['all'])
        updateAllTasks(cachedTasksArrays[ownerUUID], ownerUUID);
      return cachedTasksArrays[ownerUUID]['all'];

      case 'date':
      if (!cachedTasksArrays[ownerUUID]['date'])
        cachedTasksArrays[ownerUUID]['date'] = {};
      if (info.date === null) {
        // Use 'noDate' to identify cached tasks without date instead of null.
        info.date = 'noDate';
      }
      if (!cachedTasksArrays[ownerUUID]['date'][info.date]) {
        updateDateTasks(cachedTasksArrays[ownerUUID]['date'], info, ownerUUID);
        removeDistantDates(cachedTasksArrays[ownerUUID]['date'], info);
      }
      return cachedTasksArrays[ownerUUID]['date'][info.date].array;

      case 'list':
      if (!cachedTasksArrays[ownerUUID]['activeAndArchived'])
        updateActiveAndArchivedTasks(cachedTasksArrays[ownerUUID], ownerUUID);
      if (!cachedTasksArrays[ownerUUID]['list'] ||
          (cachedTasksArrays[ownerUUID]['list'] && cachedTasksArrays[ownerUUID]['list'].uuid !== info.uuid))
      {
        updateListTasks(cachedTasksArrays[ownerUUID], info.uuid, ownerUUID);
      }
      return cachedTasksArrays[ownerUUID]['list'].array;

      case 'context':
      if (!info.id) {
        // Use 'noContext' to identify cached tasks without context instead of undefined.
        info.id = 'noContext';
      }
      if (!cachedTasksArrays[ownerUUID]['context'] ||
          (cachedTasksArrays[ownerUUID]['context'] &&
           cachedTasksArrays[ownerUUID]['context'].id !== info.id))
      {
        updateContextTasks(cachedTasksArrays[ownerUUID], info.id, ownerUUID);
      }
      return cachedTasksArrays[ownerUUID]['context'].array;
    }
  };

  $scope.getNewTask = function(initialValues){
    return TasksService.getNewTask(initialValues, UISessionService.getActiveUUID());
  };

  $scope.repeatTypes = [
  {
    trans: {title: 'daily'}
  },
  {
    trans: {title: 'weekly'}
  },
  {
    trans: {title: 'monthly'}
  },
  {
    trans: {title:'yearly'}
  }
  ];

  $scope.openTaskEditor = function openTaskEditor(task) {
    return $scope.openEditor('task', task);
  };

  /*
  * Every task in this list will not change in lists using ng-repeat.
  * Relates to isTaskVisible filter filter function,
  * and getTaskModifiedOrder and getTaskOrder orderBy filter functions, for example:
  *
  *   <div ng-repeat="task in tasks | filter:isTaskVisible | orderBy:getTaskModifiedOrder"></div>
  *
  */
  var freezedTasksInLists = [];

  $scope.isTaskFrozen = function(task) {
    return freezedTasksInLists.findFirstIndexByKeyValue('task', task) !== undefined;
  };

  $scope.getTaskModified = function(task){
    var frozenTask = freezedTasksInLists.findFirstObjectByKeyValue('task', task);
    if (frozenTask !== undefined){
      return frozenTask.modified; // This is task.trans.modified
    }else {
      return task.trans.modified;
    }
  };

  // lock task in lists
  function freezeTask(task) {

    var taskIndex = freezedTasksInLists.findFirstIndexByKeyValue('task', task);

    if (taskIndex === undefined) {
      freezedTasksInLists.push({
        task: task,
        modified: task.trans.modified
      });
    } else {
      // Freeze some more.
      freezedTasksInLists[taskIndex].needsForce = true;
    }
  }

  // Release locked task in lists.
  function unfreezeTask(task, force) {

    var taskIndex = freezedTasksInLists.findFirstIndexByKeyValue('task', task);


    // Remove found task if we have the force or task does not need force to be unfrozen.
    if (taskIndex !== undefined && (force || !freezedTasksInLists[taskIndex].needsForce)) {
      freezedTasksInLists.splice(taskIndex, 1);
    }
  }

  /*
  * Toggle task complete.
  *
  * Lock task in lists before its deferred complete is settled.
  *
  * Return checkbox checked statuses.
  */
  $scope.toggleCompleteTask = function(task, taskCompletingReadyDeferred) {

    // Don't try to complete a task that hasn't been saved, saveTask will call this again
    // after the task has a uuid
    if (!task.trans.uuid || task.trans.itemType !== 'task') {
      // optimisticComplete already reflects the end value.
      return task.trans.optimisticComplete();
    }

    if (taskCompletingReadyDeferred) {
      taskCompletingReadyDeferred.promise.then(function(task) {
        unfreezeTask(task);
        // Need to delay combining task arrays to prevent immediate disapper
        $scope.combineTasksArrays();
      });
    }

    // Vibrate
    if (navigator.vibrate && !$scope.isVibrationDisabled())
      navigator.vibrate(200);

    freezeTask(task);
    if (task.trans.completed) {
      AnalyticsService.do('uncompleteTask');
      TasksService.uncompleteTask(task, UISessionService.getActiveUUID()).then(function(task) {
        unfreezeTask(task, true);
        $scope.combineTasksArrays();
      }, function() {
        unfreezeTask(task, true);
      });
      return false;
    } else {
      AnalyticsService.do('completeTask');
      TasksService.completeTask(task, UISessionService.getActiveUUID()).then(function(){
        if (!taskCompletingReadyDeferred){
          unfreezeTask(task, true);
          $scope.combineTasksArrays();
        }
      }, function() {
        if (!taskCompletingReadyDeferred){
          unfreezeTask(task, true);
          $scope.combineTasksArrays();
        }
      });
      return true;
    }
  };

  // SAVING

  $scope.saveTask = function(task) {
    var completeOnSave;
    if (task.trans.uuid){
      AnalyticsService.do('saveTask');
    }else{
      AnalyticsService.do('addTask');
      completeOnSave = task.trans.optimisticComplete();
    }

    return TasksService.saveTask(task, UISessionService.getActiveUUID()).then(function(result) {
      if (result === 'new' && completeOnSave){
        $scope.toggleCompleteTask(task);
      }
      return task;
    });
  };

  // (UN)DELETING

  $scope.deleteTask = function(task) {
    if (task.trans.uuid){
      AnalyticsService.do('deleteTask');
      return TasksService.deleteTask(task, UISessionService.getActiveUUID());
    }
  };

  $scope.undeleteTask = function(task) {
    if (task.trans.uuid){
      AnalyticsService.do('undeleteTask');
      TasksService.undeleteTask(task, UISessionService.getActiveUUID());
    }
  };

  // UI

  $scope.getNewTaskWithContext = function(context){
    if (context) return $scope.getNewTask({context: context});
    else return $scope.getNewTask();
  };

  // NAVIGATION

  $scope.context = undefined;

  function refreshFeatureMapHeading(){
    $scope.$evalAsync(function(){
      if ($scope.context)
        $scope.getFeatureMap('tasks').slides.right.heading = '@' + $scope.context.trans.title;
      else
        $scope.getFeatureMap('tasks').slides.right.heading = 'no context';
    });
  }

  $scope.swipeToContext = function(context){
    $scope.context = context;
    SwiperService.swipeTo('tasks/context');
    refreshFeatureMapHeading();
  };

  $scope.swipeToContextsAndReset = function(){
    $scope.context = undefined;
    SwiperService.swipeTo('tasks/contexts');
    refreshFeatureMapHeading();
  };

  $scope.getContextId = function() {
    return $scope.context ? $scope.context.trans.uuid : 'no';
  };

  // ONBOARDING

  function gotoSignUp(){
    $scope.changeFeature('user', undefined, true);
  }

  if (!$scope.onboardingInProgress && $scope.isOnboarded('focusTasks') && $scope.isFakeUser()){
    // Show modal immediately on cold boot
    UISessionService.pushDelayedNotification({
      type: 'signUp',
      gotoFn: gotoSignUp
    });
    $timeout(function() {
      UISessionService.activateDelayedNotifications();
    }, 1000);
  }
}

TasksController['$inject'] = [
'$rootScope', '$scope', '$timeout',
'AnalyticsService', 'ArrayService', 'DateService', 'ItemsService', 'SwiperService', 'TasksService',
'UISessionService'
];
angular.module('em.tasks').controller('TasksController', TasksController);

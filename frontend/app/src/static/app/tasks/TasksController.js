/* Copyright 2013-2017 Extended Mind Technologies Oy
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
 /* global cordova */
 'use strict';

 function TasksController($rootScope, $scope, $timeout,
                          AnalyticsService, ArrayService, DateService, ItemsService, SwiperService,
                          TasksService, UISessionService, UserService, UserSessionService, packaging) {

  // INITIALIZING
  if (angular.isFunction($scope.registerArrayChangeCallback)) {
    $scope.registerArrayChangeCallback('task', ['active', 'archived'], invalidateTasksArrays,
                                       'TasksController');
  }

  var cachedTasksArrays = {};

  $scope.getCachedTasks = function(ownerUUID) {
    if (cachedTasksArrays[ownerUUID])
      return cachedTasksArrays[ownerUUID];
  };

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

  $scope.invalidateDateTasks = function(cachedTasks, ownerUUID) {
    var focusActive = $scope.getActiveFeature() === 'focus';

    for (var date in cachedTasks['date']) {
      if (cachedTasks['date'].hasOwnProperty(date)) {
        if (focusActive)
          updateDateTasks(cachedTasks['date'], {date: date}, ownerUUID);
        else
          delete cachedTasks['date'][date];
      }
    }
  };

  /*
  * Invalidate cached active tasks arrays.
  *
  * @param {Object} task Changed task.
  */
  function invalidateTasksArrays(tasks, modifiedTask, tasksType, ownerUUID) {
    if (cachedTasksArrays[ownerUUID]) {
      var arrayType, listUUID;
      if (tasksType === 'active') {
        for (arrayType in cachedTasksArrays[ownerUUID]) {
          if (cachedTasksArrays[ownerUUID].hasOwnProperty(arrayType)) {
            // Every cached tasks array has cached tasks.
            if (arrayType === 'all') {
              invalidateAllTasks(cachedTasksArrays[ownerUUID], ownerUUID);
            }
            else if (arrayType === 'date') {
              $scope.invalidateDateTasks(cachedTasksArrays[ownerUUID], ownerUUID);
            }
            else if (arrayType === 'list') {
              for (listUUID in cachedTasksArrays[ownerUUID]['list']){
                if (cachedTasksArrays[ownerUUID]['list'] &&
                    cachedTasksArrays[ownerUUID]['list'].hasOwnProperty(listUUID)){
                  invalidateListTasks(cachedTasksArrays[ownerUUID], listUUID, ownerUUID);
                }
              }
            } else if (arrayType === 'context') {
              if ($scope.getActiveFeature() === 'tasks' && SwiperService.isSlideActive('tasks/context')) {

                for (var contextId in cachedTasksArrays[ownerUUID]['context']){
                  if (cachedTasksArrays[ownerUUID]['context'].hasOwnProperty(contextId)){
                    updateContextTasks(cachedTasksArrays[ownerUUID], contextId, ownerUUID);
                  }
                }
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
            if (arrayType === 'all'){
              invalidateAllTasks(cachedTasksArrays[ownerUUID], ownerUUID);
            }else if (arrayType === 'list'){
              for (listUUID in cachedTasksArrays[ownerUUID]['list']){
                if (cachedTasksArrays[ownerUUID]['list'].hasOwnProperty(listUUID)){
                  invalidateListTasks(cachedTasksArrays[ownerUUID], listUUID, ownerUUID);
                }
              }
            }
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

    if (!cachedTasks['list']) cachedTasks['list'] = {};

    cachedTasks['list'][listUUID] = [];

    for (var i = activeAndArchivedTasks.length - 1; i >= 0; i--) {
      var task = activeAndArchivedTasks[i];
      if (task.trans.list && task.trans.list.trans.uuid === listUUID)
        cachedTasks['list'][listUUID].push(task);
    }
  }

  function updateContextTasks(cachedTasks, contextId, ownerUUID) {
    var activeTasks = TasksService.getTasks(ownerUUID), i;

    if (!cachedTasks['context']) cachedTasks['context'] = {};

    cachedTasks['context'][contextId] = [];

    if (contextId === 'noContext') {
      for (i = activeTasks.length - 1; i >= 0; i--) {
        if (!activeTasks[i].trans.context) cachedTasks['context'][contextId].push(activeTasks[i]);
      }
    } else {
      for (i = activeTasks.length - 1; i >= 0; i--) {
        var task = activeTasks[i];
        if (task.trans.context && task.trans.context.trans.uuid === contextId) {
          cachedTasks['context'][contextId].push(task);
        }
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

  var reviewAsked = !!UserSessionService.getUIPreference('reviewAsked');
  var reviewInProgress;

  function attemptToAskForReview(previousCount, cachedDatesArray) {

    function doAskForReview() {
      var marketUrl;
      if (packaging === 'ios-cordova') {
        marketUrl = 'itms://itunes.com/apps/extendedmind';  // TODO: $rootScope
      } else if (packaging === 'android-cordova') {
        marketUrl = 'market://details?id=org.extendedmind'; // TODO: $rootScope
      }

      var gotoMarketFn = function() {
        if (cordova && cordova.InAppBrowser) cordova.InAppBrowser.open(marketUrl, '_system');
      };

      var timeoutTime = $rootScope.LIST_ITEM_LEAVE_ANIMATION_SPEED;
      if (UISessionService.isAllowed('leaveAnimation')) {
        timeoutTime += $rootScope.TOASTER_ANIMATION_SPEED + $rootScope.TOASTER_ANIMATION_TIME;
      } else {
        timeoutTime += $rootScope.CHECKBOX_CHECKING_ANIMATION_TIME;
      }

      reviewInProgress = $timeout(function() {
        var interaction = {
          type: 'confirmationRequired',
          value: {
            messageHeading: 'today cleared',
            messageIngress: 'if you like our app, please write a review',
            messageText: [{
              type: 'text',
              data: 'we hate these as much as anyone and won\'t ever ask you again, promise'
            }],
            confirmAction: gotoMarketFn,
            confirmText: 'review',
            allowCancel: true
          }
        };
        $rootScope.$emit('emInteraction', interaction);
        reviewInProgress = false;
        reviewAsked = true;

        UserSessionService.setUIPreference('reviewAsked', Date.now());
        UserService.saveAccountPreferences();

      }, timeoutTime);
    }

    if (previousCount && packaging.endsWith('cordova') && !$scope.isOnboarding('focus', 'tasks')) {
      var userCreatedTimestamp = UserSessionService.getUserCreated();
      if (userCreatedTimestamp && (Date.now() - userCreatedTimestamp >= 86400000)) {
        // Is user created over 24 hours ago.
        // Check that there is no uncompleted tasks in today slide.
        var askForReviewConditionsMet = true;
        for (var i = 0; i < cachedDatesArray.length; i++) {
          if (!cachedDatesArray[i].trans.completed) {
            askForReviewConditionsMet = false;
            break;
          }
        }

        if (askForReviewConditionsMet && !reviewInProgress) {
          // Ok to ask for app review.
          doAskForReview();
        } else if (!askForReviewConditionsMet && reviewInProgress) {
          // Cancel review in progress if the conditions are not met anymore
          $timeout.cancel(reviewInProgress);
          reviewInProgress = undefined;
        }
      }
    }
  }

  function updateDateTasks(cachedDates, info, ownerUUID) {

    function initializeDateTasksCache() {
      cachedDates[info.date] = {
        array: [],
        pastDate: pastDate
      };
    }

    var pastDate;

    if (cachedDates[info.date])
      pastDate = cachedDates[info.date].pastDate;
    else if (info.pastDate)
      pastDate = info.pastDate;

    if (pastDate) {
      initializeDateTasksCache();
      updatePastDateTasks(TasksService.getTasks(ownerUUID), cachedDates[info.date].array, pastDate);
    } else if (info.date === 'noDate') {
      initializeDateTasksCache();
      updateNoDateTasks(TasksService.getTasks(ownerUUID), cachedDates[info.date].array);
    } else if (info.date === DateService.getTodayYYYYMMDD()) {
      var previousCount;

      if (!reviewAsked && packaging.endsWith('cordova') &&
          cachedDates[info.date] && cachedDates[info.date].array)
      {
        // Keep track of the previous count while the app review has not been asked.
        previousCount = cachedDates[info.date].array.length;
      }
      initializeDateTasksCache();

      updateTodayTasks(TasksService.getTasks(ownerUUID), cachedDates[info.date].array, info.date);
      if (!reviewAsked) attemptToAskForReview(previousCount, cachedDates[info.date].array);
    } else {
      initializeDateTasksCache();
      updateFutureDateTasks(TasksService.getTasks(ownerUUID), cachedDates[info.date].array, info.date);
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
          if (!info.date) {
            return;
          }
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
    var ownerUUID = info && info.owner ? info.owner : UISessionService.getActiveUUID();
    if (!cachedTasksArrays[ownerUUID]) cachedTasksArrays[ownerUUID] = {};

    switch (arrayType) {

      case 'all':
      if ($scope.getActiveFeature() === 'tasks' || (info && info.force)) {
        if (!cachedTasksArrays[ownerUUID]['activeAndArchived'])
          updateActiveAndArchivedTasks(cachedTasksArrays[ownerUUID], ownerUUID);
        if (!cachedTasksArrays[ownerUUID]['all'])
          updateAllTasks(cachedTasksArrays[ownerUUID], ownerUUID);
        return cachedTasksArrays[ownerUUID]['all'];
      }
      break;

      case 'date':
      if ($scope.getActiveFeature() === 'focus') {
        if (!cachedTasksArrays[ownerUUID]['date'])
          cachedTasksArrays[ownerUUID]['date'] = {};
        if (info.date === undefined) {
          // info.date is set to undefined after two consecutive slideChangeStart callbacks. Do nothing.
          return;
        }
        if (info.date === null) {
          // Use 'noDate' to identify cached tasks without date instead of null.
          info.date = 'noDate';
        }
        if (!cachedTasksArrays[ownerUUID]['date'][info.date]) {
          updateDateTasks(cachedTasksArrays[ownerUUID]['date'], info, ownerUUID);
          removeDistantDates(cachedTasksArrays[ownerUUID]['date'], info);
        }
        return cachedTasksArrays[ownerUUID]['date'][info.date].array;
      }
      break;

      case 'list':
      if ($scope.getActiveFeature() === 'list' || $scope.getActiveFeature() === 'listInverse') {
        if (!cachedTasksArrays[ownerUUID]['activeAndArchived'])
          updateActiveAndArchivedTasks(cachedTasksArrays[ownerUUID], ownerUUID);
        if (!cachedTasksArrays[ownerUUID]['list'] || !cachedTasksArrays[ownerUUID]['list'][info.uuid])
        {
          updateListTasks(cachedTasksArrays[ownerUUID], info.uuid, ownerUUID);
        }
        return cachedTasksArrays[ownerUUID]['list'][info.uuid];
      }
      break;

      case 'context':
      if ($scope.getActiveFeature() === 'tasks') {
        if (!info.id) {
          // Use 'noContext' to identify cached tasks without context instead of undefined.
          info.id = 'noContext';
        }
        if (!cachedTasksArrays[ownerUUID]['context'] || !cachedTasksArrays[ownerUUID]['context'][info.id]){
          updateContextTasks(cachedTasksArrays[ownerUUID], info.id, ownerUUID);
        }
        return cachedTasksArrays[ownerUUID]['context'][info.id];
      }
      break;
    }
  };

  $scope.getNewTask = function(initialValues, overrideOwnerUUID){
    var ownerUUID = overrideOwnerUUID ? overrideOwnerUUID : UISessionService.getActiveUUID();
    return TasksService.getNewTask(initialValues, ownerUUID);
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
        // Need to delay unfreezin task to prevent immediate disapper
      });
    }

    // Vibrate
    if (navigator.vibrate && !$scope.isVibrationDisabled())
      navigator.vibrate(200);

    freezeTask(task);
    if (task.trans.completed) {
      AnalyticsService.do('tasks', 'uncomplete_task');
      TasksService.uncompleteTask(task).then(function(task) {
        unfreezeTask(task, true);
      }, function() {
        unfreezeTask(task, true);
      });
      return false;
    } else {
      AnalyticsService.do('tasks', 'complete_task');
      TasksService.completeTask(task).then(function(){
        if (!taskCompletingReadyDeferred){
          unfreezeTask(task, true);
        }
      }, function() {
        if (!taskCompletingReadyDeferred){
          unfreezeTask(task, true);
        }
      });
      return true;
    }
  };

  // SAVING

  $scope.saveTask = function(task) {
    var completeOnSave;
    if (task.trans.uuid){
      AnalyticsService.do('tasks', 'save_task');
    }else{
      AnalyticsService.do('tasks', 'add_task');
      completeOnSave = task.trans.optimisticComplete();
    }

    return TasksService.saveTask(task).then(function(result) {
      if (result === 'new' && completeOnSave){
        $scope.toggleCompleteTask(task);
      }
      return result;
    });
  };

  // (UN)DELETING

  $scope.deleteTask = function(task) {
    if (task.trans.uuid){
      AnalyticsService.do('tasks', 'delete_task');
      return TasksService.deleteTask(task);
    }
  };

  $scope.undeleteTask = function(task) {
    if (task.trans.uuid){
      AnalyticsService.do('tasks', 'undelete_task');
      TasksService.undeleteTask(task);
    }
  };

  // UI

  $scope.getNewTaskWithContext = function(context){
    if (context) return $scope.getNewTask({context: context});
    else return $scope.getNewTask();
  };

  // NAVIGATION

  $scope.context = undefined;
  $scope.childContexts = undefined;

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
    $scope.childContexts = undefined;
    if ($scope.context && !$scope.context.trans.parent){
      // Get all children of the context
      var allContexts = $scope.getTagsArray('contexts');
      if (allContexts){
        var thisContextIndex = allContexts.indexOf($scope.context);
        if (thisContextIndex !== -1){
          for (var i=thisContextIndex+1; i<allContexts.length; i++){
            if (allContexts[i].trans.parent === $scope.context){
              if (!$scope.childContexts) $scope.childContexts = [];
              $scope.childContexts.push(allContexts[i]);
            }else{
              // Break immediately, as all children are in order after the context
              break;
            }
          }
        }
      }
    }
    SwiperService.swipeTo('tasks/context');
    $scope.contextSlideActive = true;
    refreshFeatureMapHeading();
  };

  $scope.swipeToContextsAndReset = function(){
    $scope.context = undefined;
    $scope.childContexts = undefined;
    SwiperService.swipeTo('tasks/contexts');
    refreshFeatureMapHeading();
  };

  $scope.getContextId = function(overrideContext) {
    var context = overrideContext ? overrideContext : $scope.context;
    return context ? context.trans.uuid : 'no';
  };

  $scope.isContextActive = function() {
    return $scope.isFeatureActive('tasks') &&
      $scope.getFeatureMap('tasks').slides.right.activeContext;
  };

  $scope.getActiveContext = function() {
    return $scope.getFeatureMap('tasks').slides.right.activeContext;
  };

  function taskSlideChange(slidePath){
    if (slidePath === 'tasks/context' && $scope.context){
      $scope.getFeatureMap('tasks').slides.right.activeContext = $scope.context;
      $scope.contextSlideActive = true;
      if (!$scope.$$phase && !$rootScope.$$phase) $scope.$digest();
    }else if ($scope.getFeatureMap('tasks').slides.right.activeContext){
      delete $scope.getFeatureMap('tasks').slides.right.activeContext;
      $scope.contextSlideActive = false;
      if (!$scope.$$phase && !$rootScope.$$phase) $scope.$digest();
    }
  }
  SwiperService.registerSlideChangeCallback(taskSlideChange, 'tasks', 'TasksController');


  function featureChangedCallback(name, data/*, state*/) {
    if (name === 'tasks' && data && data.trans.tagType === 'context') {
      $scope.context = data;
      // Set specific active slide for this feature change
      $scope.getFeatureMap('tasks').slides.overrideActiveSlide = 'tasks/context';
    }else if ($scope.getFeatureMap('tasks').slides.right.activeContext){
      delete $scope.getFeatureMap('tasks').slides.right.activeContext;
    }
  };
  UISessionService.registerFeatureChangedCallback(featureChangedCallback, 'TasksController');

  function tasksActive(featureChanged, data) {
    if (!featureChanged && data && data.trans.tagType === 'context') {
      $scope.swipeToContext(data);
    }
  }
  if (angular.isFunction($scope.registerFeatureActivateCallback))
    $scope.registerFeatureActivateCallback(tasksActive, 'tasks', 'TasksController');

  // ONBOARDING

  $scope.openCalendarSettingsAndIncreaseOnboarding = function(){
    $scope.openEditor('user', undefined, 'agendaCalendar').then(function(){
      $scope.increaseOnboardingPhase('focus', 'tasks')
    });
  };

  $scope.openContextEditor = function(context){
    $scope.openEditor('tag', context).then(function(){
      if ($scope.isOnboarding('tasks', 'context')){
        $scope.completeOnboarding('tasks', 'context');
      }
    });
  };

  // KEYBOARD SHORTCUTS

  if (angular.isFunction($scope.registerKeyboardShortcutCallback)){
    $scope.registerKeyboardShortcutCallback(function(){
      if ($scope.isFeatureActive('tasks') && !$scope.isEditorVisible()){
        SwiperService.swipeNext('tasks');
      }else if ($scope.isFeatureActive('focus') &&
                !$scope.isTutorialInProgress() &&
                !$scope.isEditorVisible()){
        SwiperService.swipeNext('focus');
      }
    }, 'right', 'TasksControllerRight');
    $scope.registerKeyboardShortcutCallback(function(){
      if ($scope.isFeatureActive('tasks') && !$scope.isEditorVisible()){
        SwiperService.swipePrevious('tasks');
      }else if ($scope.isFeatureActive('focus') &&
                !$scope.isTutorialInProgress() &&
                !$scope.isEditorVisible()){
        SwiperService.swipePrevious('focus');
      }
    }, 'left', 'TasksControllerLeft');
    $scope.registerKeyboardShortcutCallback(function(){
      $scope.openEditor('task', $scope.getNewTask(), 'title');
    }, 'ctrl-t', 'TasksControllerCtrlT');
  }

}

TasksController['$inject'] = [
'$rootScope', '$scope', '$timeout',
'AnalyticsService', 'ArrayService', 'DateService', 'ItemsService', 'SwiperService', 'TasksService',
'UISessionService', 'UserService', 'UserSessionService', 'packaging'
];
angular.module('em.tasks').controller('TasksController', TasksController);

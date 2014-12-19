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
                          AnalyticsService, DateService, ItemsService, SwiperService, TasksService,
                          UISessionService) {


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

  $scope.closeTaskEditor = function closeTaskEditor() {
    $scope.closeEditor();
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
      return frozenTask.modified;
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
    if (!task.trans.uuid){
      return !task.trans.completed;
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
    var completeOnSave = false;
    if (task.trans.uuid){
      AnalyticsService.do('saveTask');
    }else{
      AnalyticsService.do('addTask');
      if (task.trans.completed){
        completeOnSave = true;
      }
    }

    return TasksService.saveTask(task, UISessionService.getActiveUUID()).then(function(savedTask) {
      if (completeOnSave){
        $scope.toggleCompleteTask(savedTask);
      }
      return savedTask;
    });
  };

  // (UN)DELETING

  $scope.deleteTask = function(task) {
    if (task.trans.uuid){

      UISessionService.pushDelayedNotification({
        type: 'deleted',
        itemType: 'task', // NOTE: Same as task.trans.itemType
        item: task,
        undoFn: $scope.undeleteTask
      });

      $timeout(function() {
        UISessionService.activateDelayedNotifications();
      }, $rootScope.LIST_ITEM_LEAVE_ANIMATION_SPEED);

      AnalyticsService.do('deleteTask');
      TasksService.deleteTask(task, UISessionService.getActiveUUID());
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
    if (context) {
      return {
        trans: {
          context: context.uuid,
          itemType: 'task'
        }
      };
    }
    else return {
      trans: {
        itemType: 'task'
      }
    };
  };

  // NAVIGATION

  $scope.context = undefined;

  function refreshFeatureMapHeading(){
    $scope.$evalAsync(function(){
      if ($scope.context)
        $scope.getFeatureMap('tasks').slides.right.heading = '@' + $scope.context.title;
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
}

TasksController['$inject'] = [
'$rootScope', '$scope', '$timeout',
'AnalyticsService', 'DateService', 'ItemsService', 'SwiperService', 'TasksService', 'UISessionService'
];
angular.module('em.tasks').controller('TasksController', TasksController);

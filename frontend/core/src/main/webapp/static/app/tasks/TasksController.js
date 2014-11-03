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
                          AnalyticsService, DateService, SwiperService, TasksService, UISessionService) {

  $scope.repeatTypes = [
  {title:'daily'},
  {title:'weekly'},
  {title:'monthly'},
  {title:'yearly'}
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
  *   <div ng-repeat="task in tasks | filter:isTaskVisible | orderBy:getTaskModifiedOrder"></div>
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
      return task.modified;
    }
  };

  // lock task in lists
  function freezeTask(task) {

    var taskIndex = freezedTasksInLists.findFirstIndexByKeyValue('task', task);

    if (taskIndex === undefined) {
      freezedTasksInLists.push({
        task: task,
        modified: task.modified
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
    if (!task.uuid){ return !task.transientProperties.completed;}
    if (taskCompletingReadyDeferred) {
      taskCompletingReadyDeferred.promise.then(function(task) {
        unfreezeTask(task);
      });
    }

    // Vibrate
    if (navigator.vibrate && !$scope.isVibrationDisabled())
      navigator.vibrate(200);

    freezeTask(task);

    if (task.completed) {
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
        if (!taskCompletingReadyDeferred) unfreezeTask(task, true);
        $scope.combineTasksArrays();
      }, function() {
        if (!taskCompletingReadyDeferred) unfreezeTask(task, true);
      });
      return true;
    }
  };

  // SAVING

  $scope.saveTask = function(task) {
    if (!task || !task.title || task.title.length === 0) return false;
    var completeOnSave = false;
    if (task.uuid){
      AnalyticsService.do('saveTask');
    }else{
      AnalyticsService.do('addTask');
      if (task.transientProperties && task.transientProperties.completed){
        completeOnSave = true;
      }

      // issue a 500ms lock to prevent leave animation for tasks below this
      // in the list
      UISessionService.lock('leaveAnimation', 500);
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
    if (task.uuid){

      UISessionService.pushDelayedNotification({
        type: 'deleted',
        itemType: 'task', // NOTE: Same as task.transientProperties.itemType
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
    if (task.uuid){
      AnalyticsService.do('undeleteTask');
      TasksService.undeleteTask(task, UISessionService.getActiveUUID());
    }
  };

  // UI

  $scope.getNewTaskWithContext = function(context){
    if (context) {
      return {
        transientProperties: {
          context: context.uuid,
          completed: false,
          itemType: 'task'
        }
      };
    }
    else return {
      transientProperties: {
        completed: false,
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
    UISessionService.lock('leaveAnimation', 500);
    $scope.context = context;
    SwiperService.swipeTo('tasks/context');
    refreshFeatureMapHeading();
  };

  $scope.swipeToContextsAndReset = function(){
    $scope.context = undefined;
    SwiperService.swipeTo('tasks/contexts');
    refreshFeatureMapHeading();
  };
}

TasksController['$inject'] = [
'$rootScope', '$scope', '$timeout',
'AnalyticsService', 'DateService', 'SwiperService', 'TasksService', 'UISessionService'
];
angular.module('em.tasks').controller('TasksController', TasksController);

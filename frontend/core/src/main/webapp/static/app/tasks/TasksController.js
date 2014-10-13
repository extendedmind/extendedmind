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

 function TasksController($rootScope, $scope, $timeout, AnalyticsService, DateService, SwiperService,
                          TasksService, UISessionService) {

  $scope.repeatTypes = ['daily', 'weekly', 'monthly', 'yearly'];

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

  /*
  * Filter completed tasks that are not locked.
  */
  $scope.isTaskVisible = function(task) {
    if (task.completed && !isTaskFrozen(task)) {
      return false;
    }

    return true;
  };

  function isTaskFrozen(task) {
    return freezedTasksInLists.findFirstIndexByKeyValue('task', task) !== undefined;
  }

  // lock task in lists
  function freezeTask(task) {

    var taskIndex = freezedTasksInLists.findFirstIndexByKeyValue('task', task);

    if (taskIndex === undefined) {
      freezedTasksInLists.push({
        task: task
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
  $scope.toggleCompleteTask = function toggleCompleteTask(task, taskCompletingReadyDeferred) {

    // Don't try to complete a task that hasn't been saved, saveTask will call this again
    // after the task has a uuid
    if (!task.uuid){ return !task.transientProperties.completed;}
    if (taskCompletingReadyDeferred) {
      taskCompletingReadyDeferred.promise.then(function(task) {
        unfreezeTask(task);
      });
    }

    freezeTask(task);

    if (task.completed) {
      AnalyticsService.do('uncompleteTask');
      TasksService.uncompleteTask(task, UISessionService.getActiveUUID()).then(function() {
        unfreezeTask(task, true);
      }, function() {
        unfreezeTask(task, true);
      });
      return false;
    } else {
      AnalyticsService.do('completeTask');
      TasksService.completeTask(task, UISessionService.getActiveUUID()).then(function(){
        if (!taskCompletingReadyDeferred) unfreezeTask(task, true);
      }, function() {
        if (!taskCompletingReadyDeferred) unfreezeTask(task, true);
      });
      return true;
    }
  };

  $scope.saveTask = function saveTask(task) {
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

  function undoDelete(task) {
    TasksService.undeleteTask(task, UISessionService.getActiveUUID());
    // FIXME: where task went?
  }

  $scope.deleteTask = function deleteTask(task) {

    UISessionService.pushDelayedNotification({
      type: 'deleted',
      itemType: 'task',
      item: task,
      undoFn: undoDelete
    });

    $timeout(function() {
      UISessionService.activateDelayedNotifications();
    }, $rootScope.LIST_ITEM_LEAVE_ANIMATION_SPEED);

    AnalyticsService.do('deleteTask');
    TasksService.deleteTask(task, UISessionService.getActiveUUID());
  };

  // NAVIGATION

  $scope.context = undefined;
  $scope.deleteContextAndShowContexts = function deleteContextAndShowContexts(context) {
    SwiperService.swipeTo('tasks/contexts');
    $scope.deleteContext(context);
    $scope.context = undefined;
  };

  $scope.swipeToContext = function(context){
    $scope.context = context;
    SwiperService.swipeTo('tasks/context');
    $scope.$evalAsync(function(){
      if ($scope.context)
        $scope.getFeatureMap('tasks').slides.right.heading = '@' + $scope.context.title;
      else
        $scope.getFeatureMap('tasks').slides.right.heading = 'no context';
    });
  };
}

TasksController['$inject'] = ['$rootScope', '$scope', '$timeout', 'AnalyticsService', 'DateService',
  'SwiperService', 'TasksService', 'UISessionService'];
angular.module('em.tasks').controller('TasksController', TasksController);

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

 function TasksController($scope, AnalyticsService, DateService, SwiperService, TasksService, UISessionService) {

  $scope.initializeTask = function initializeTask(task) {
    if (task.transientProperties && task.transientProperties.date) {
      $scope.showDateInput = true;
      $scope.focusDateInput = false;
    }
    else {
      $scope.showDateInput = false;
      $scope.focusDateInput = false;
    }
  };

  $scope.focusDate = function focusDate() {
    $scope.showDateInput = true;
    $scope.focusDateInput = true;
  };

  $scope.hideDate = function hideDate() {
    $scope.showDateInput = false;
    $scope.focusDateInput = false;
  };

  $scope.repeatTypes = ['daily', 'weekly', 'monthly', 'yearly'];

  $scope.editTaskFields = function editTaskFields(task) {
    AnalyticsService.do('editTaskFields');
    TasksService.saveTask(task, UISessionService.getActiveUUID());
  };

  $scope.setTaskDate = function(date, task) {
    if (!task.transientProperties) task.transientProperties = {};
    task.transientProperties.date = DateService.getYYYYMMDD(date);
  };

  $scope.getTaskDate = function(task) {
    if (task.transientProperties && task.transientProperties.date)
      return DateService.getDateTodayOrFromLaterYYYYMMDD(task.transientProperties.date);
  };

  $scope.openTaskEditor = function openTaskEditor(task) {
    freezeTask(task);
    $scope.openEditor('task', task);
  };

  $scope.closeTaskEditor = function closeTaskEditor(task) {
    unfreezeTask(task, true);
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
      TasksService.completeTask(task, UISessionService.getActiveUUID());
      return true;
    }
  };

  $scope.saveTask = function saveTask(task) {
    AnalyticsService.do('saveTask');
    TasksService.saveTask(task, UISessionService.getActiveUUID());
  };

  $scope.resetTask = function resetTask(task) {
    TasksService.resetTask(task, UISessionService.getActiveUUID());
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

    AnalyticsService.do('deleteTask');
    TasksService.deleteTask(task, UISessionService.getActiveUUID());
  };

  $scope.addSubtask = function addSubtask(subtask) {
    if (!subtask.title || subtask.title.length === 0) return false;
    var subtaskToSave = {title: subtask.title};

    if (subtask.transientProperties) {
      subtaskToSave.transientProperties = {};
      if (subtask.transientProperties.date) subtaskToSave.transientProperties.date = subtask.transientProperties.date;
      if (subtask.transientProperties.list) subtaskToSave.transientProperties.list = subtask.transientProperties.list;
      if (subtask.transientProperties.context)
        subtaskToSave.transientProperties.context = subtask.transientProperties.context;
    }
    delete subtask.title;

    TasksService.saveTask(subtaskToSave, UISessionService.getActiveUUID()).then(function(/*subtaskToSave*/) {
      AnalyticsService.do('addTask');
    });
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
  }

  // INFINITE SCROLL

  $scope.recentTasksLimit = $scope.tasks.length;

  $scope.getRecentTasksLimit = function () {
    return $scope.recentTasksLimit;
  };

  $scope.addMoreRecentTasks = function () {
    if ($scope.recentTasksLimit !== $scope.tasks.length) {
      // There is still more to add, add in batches of 25
      if ($scope.recentTasksLimit + 25 < $scope.tasks.length) {
        $scope.recentTasksLimit += 25;
      } else {
        $scope.recentTasksLimit = $scope.tasks.length;
      }
    }
  };

}

TasksController['$inject'] = ['$scope', 'AnalyticsService', 'DateService', 'SwiperService', 'TasksService', 'UISessionService'];
angular.module('em.tasks').controller('TasksController', TasksController);

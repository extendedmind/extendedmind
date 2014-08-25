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
    if (task.due || task.date) {
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

  $scope.editTask = function editTask(task) {
    $scope.editItemInOmnibar(task, 'task');
  };

  $scope.taskChecked = function taskChecked(task) {
    if (task.completed) {
      AnalyticsService.do('uncompleteTask');
      TasksService.uncompleteTask(task, UISessionService.getActiveUUID());
    } else {
      AnalyticsService.do('completeTask');
      TasksService.completeTask(task, UISessionService.getActiveUUID());
    }
  };

  $scope.deleteTask = function deleteTask(task) {
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

  $scope.taskQuickEditDone = function addSubtask(task) {
    AnalyticsService.do('taskQuickEditDone');
    TasksService.saveTask(task, UISessionService.getActiveUUID());
  };

  // Navigation

  $scope.context = undefined;
  $scope.showContextDetails = function showContextDetails(selectedContext) {
    $scope.context = selectedContext;
    $scope.subtask = {transientProperties: {context: $scope.context.uuid}};
    SwiperService.swipeTo('tasks/details');
  };
  $scope.showNoContextDetails = function showNoContextDetails() {
    $scope.context = undefined;
    $scope.subtask = {};
    SwiperService.swipeTo('tasks/details');
  };
  $scope.showNoListTasksDetails = function showNoListTasksDetails() {
    $scope.context = null;
    $scope.subtask = {};
    SwiperService.swipeTo('tasks/details');
  };
  $scope.showNoDateTasksDetails = function showNoDateTasksDetails() {
    $scope.context = 0;
    $scope.subtask = {};
    SwiperService.swipeTo('tasks/details');
  };

  $scope.deleteContextAndShowContexts = function deleteContextAndShowContexts(context) {
    SwiperService.swipeTo('tasks/contexts');
    $scope.deleteContext(context);
    $scope.context = undefined;
  };
}

TasksController['$inject'] = ['$scope', 'AnalyticsService', 'DateService', 'SwiperService', 'TasksService', 'UISessionService'];
angular.module('em.tasks').controller('TasksController', TasksController);

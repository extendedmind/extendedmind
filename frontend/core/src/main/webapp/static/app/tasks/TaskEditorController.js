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

 function TaskEditorController($q, $rootScope, $scope, $timeout, DateService, UISessionService) {

  // INITIALIZING

  if (angular.isFunction($scope.registerFeatureEditorAboutToCloseCallback))
    $scope.registerFeatureEditorAboutToCloseCallback(taskEditorAboutToClose, 'TaskEditorController');

  // We expect there to be a $scope.task via ng-init

  $scope.titlebar.text = $scope.task.title;

  // COMPLETING, SAVING, DELETING

  var completeReadyDeferred;
  $scope.clickCompleteTaskInEdit = function() {
    completeReadyDeferred = $q.defer();
    var completed = $scope.toggleCompleteTask($scope.task, completeReadyDeferred);

    if (!completed) {
      completeReadyDeferred.resolve($scope.task);
      completeReadyDeferred = undefined;
    }
  };

  $scope.saveTaskInEdit = function() {
    $scope.saveNewListToExtendedItem($scope.task, $scope.newList, function(task){
      task.title = $scope.titlebar.text;
      $scope.deferEdit().then(function() {
        $scope.saveTask(task);
        if (completeReadyDeferred){
          completeReadyDeferred.resolve(task);
          completeReadyDeferred = undefined;
        }
      });
    });
  };

  $scope.deleteTaskInEdit = function() {
    $scope.closeTaskEditor();
    $scope.deleteTask($scope.task);
  };

  $scope.endTaskEdit = function() {
    $scope.closeTaskEditor();
    if ($scope.titlebarHasText()) $scope.saveTaskInEdit();
  }

  function taskEditorAboutToClose() {
    $scope.saveTaskInEdit();
  }

  // TITLEBAR

  $scope.taskTitlebarTextKeyDown = function (keydownEvent) {
    $scope.handleBasicTitlebarKeydown(keydownEvent, $scope.task);
    // Return
    if (event.keyCode === 13 && $scope.titlebarHasText()) {
      // Enter in editor saves, no line breaks allowed
      $scope.closeTaskEditor();
      $scope.saveTaskInEdit();
      event.preventDefault();
      event.stopPropagation();
    }
  };

  // CALENDAR

  $scope.openCalendar = function() {
    $scope.calendarOpen = true;
  };

  $scope.getCalendarStartingDate = function(task) {
    if (task.transientProperties && task.transientProperties.date)
      return DateService.getDateTodayOrFromLaterYYYYMMDD(task.transientProperties.date);
  };

  $scope.closeCalendar = function() {
    $scope.calendarOpen = false;
  };

  $scope.closeCalendarAndCall = function(itemAction, item, newItemProperty) {
    $scope.closeCalendar();
    itemAction(item, newItemProperty);
  };

  $scope.setTaskDate = function(task, date) {
    if (!task.transientProperties) task.transientProperties = {};
    task.transientProperties.date = DateService.getYYYYMMDD(date);
  };

  $scope.setDateAndSave = function(date) {
    $scope.setTaskDate($scope.task, date);
    $scope.endTaskEdit();
  };

  $scope.clearTransientDate = function(task) {
    if (task.transientProperties) delete task.transientProperties.date;
  };

}

TaskEditorController['$inject'] = ['$q', '$rootScope', '$scope', '$timeout', 'DateService',
'UISessionService'];
angular.module('em.main').controller('TaskEditorController', TaskEditorController);

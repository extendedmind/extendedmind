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

  function saveTaskInEdit() {
    $scope.task.title = $scope.titlebar.text;
    $scope.deferEdit().then(function() {
      $scope.saveTask($scope.task);
      if (completeReadyDeferred){
        UISessionService.allow('leaveAnimation', 200);
        completeReadyDeferred.resolve($scope.task);
        completeReadyDeferred = undefined;
      }
    });
  }

  $scope.deleteTaskInEdit = function() {
    // Unregister about to close callback, because delete is run after editor is closed
    // and about to close callback would try to save item in between close and delete.
    if (angular.isFunction($scope.unregisterEditorAboutToCloseCallback))
      $scope.unregisterEditorAboutToCloseCallback();

    $scope.closeTaskEditor();
    $scope.deferEdit().then(function(){
      UISessionService.allow('leaveAnimation', 200);
      $scope.deleteTask($scope.task);
    });
  };

  $scope.endTaskEdit = function() {
    $scope.closeTaskEditor();
  };

  function taskEditorAboutToClose() {
    if ($scope.titlebarHasText() && !$scope.task.deleted) saveTaskInEdit();
  }

  // TITLEBAR

  $scope.taskTitlebarTextKeyDown = function (keydownEvent) {
    $scope.handleBasicTitlebarKeydown(keydownEvent, $scope.task);
    // Return
    if (event.keyCode === 13 && $scope.titlebarHasText()) {
      // Enter in editor saves, no line breaks allowed
      $scope.closeTaskEditor();
      saveTaskInEdit();
      event.preventDefault();
      event.stopPropagation();
    }
  };

  // CALENDAR

  $scope.openCalendar = function() {
    $scope.calendarOpen = true;
  };

  $scope.getCalendarStartingDate = function(task) {
    if (task.trans && task.trans.date)
      return DateService.getDateTodayOrFromLaterYYYYMMDD(task.trans.date);
  };

  $scope.closeCalendar = function() {
    $scope.calendarOpen = false;
  };

  $scope.closeCalendarAndCall = function(taskAction, task, taskNewProperty) {
    $scope.closeCalendar();
    taskAction(task, taskNewProperty);
  };

  $scope.setTaskDate = function(task, date) {
    if (!task.trans) task.trans = {};
    task.trans.date = DateService.getYYYYMMDD(date);
  };

  $scope.setDateAndSave = function(date) {
    $scope.setTaskDate($scope.task, date);
    // FIXME: This is not the place to do this! Better would be at saveTaskInEdit but that would require
    //        that we know if the task will actually leave or not!
    UISessionService.allow('leaveAnimation', 1000);
    $scope.endTaskEdit();
  };

  $scope.clearTransientDate = function(task) {
    if (task.trans) delete task.trans.date;
  };

  // CONTEXT PICKER
  $scope.openContextPicker = function() {
    $scope.contextPickerOpen = true;
  };
  $scope.closeContextPicker = function() {
    $scope.contextPickerOpen = false;
  };
  $scope.getContextFromUUID = function(uuid) {
    var context = $scope.contexts.findFirstObjectByKeyValue('uuid', uuid);
    if (context) return context;
  };
  $scope.getContextTitleFromUUID = function(uuid) {
    var context = $scope.contexts.findFirstObjectByKeyValue('uuid', uuid);
    if (context) return context.title;
  };

  $scope.closeContextPickerAndSetContextToTask = function(task, context) {

    function doCloseAndSave() {
      $scope.closeContextPicker();
      if (!task.trans) task.trans = {};
      task.trans.context = context.uuid;
    }

    if (!context.uuid)  // Context is new, save it first. Close context picker on error saving new context.
      $scope.saveContext(context).then(doCloseAndSave, $scope.closeContextPicker);
    else
      doCloseAndSave();
  };

  $scope.closeContextPickerAndClearContextFromTask = function(task, context) {
    $scope.closeContextPicker();
    if (task.trans && task.trans.context === context.uuid)
      delete task.trans.context;
  };

  // REPEATING PICKER
  $scope.openRepeatingPicker = function() {
    $scope.repeatingPickerOpen = true;
  };
  $scope.closeRepeatingPicker = function() {
    $scope.repeatingPickerOpen = false;
  };
  $scope.closeRepeatingPickerAndSetRepeatTypeToTask = function(task, repeatType) {
    $scope.closeRepeatingPicker();
    task.repeating = repeatType.title;
  };
  $scope.closeRepeatingPickerAndClearRepeatTypeFromtask = function(task, repeatType) {
    $scope.closeRepeatingPicker();
    if (task.repeating === repeatType.title)
      delete task.repeating;
  };

  $scope.isTaskTitleClamped = function () {
    return $scope.isTitleClamped() ||
    $scope.calendarOpen || $scope.contextPickerOpen || $scope.repeatingPickerOpen;
  };

  $scope.isTaskFooterHidden = function() {
    return $scope.isTaskTitleClamped();
  };

}

TaskEditorController['$inject'] = ['$q', '$rootScope', '$scope', '$timeout',
  'DateService', 'UISessionService'
];
angular.module('em.main').controller('TaskEditorController', TaskEditorController);

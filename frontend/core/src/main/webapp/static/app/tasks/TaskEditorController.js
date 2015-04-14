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

 function TaskEditorController($q, $rootScope, $scope, $timeout, DateService, SwiperService, TasksService,
                               UISessionService) {

  // INITIALIZING

  if (angular.isFunction($scope.registerFeatureEditorAboutToCloseCallback))
    $scope.registerFeatureEditorAboutToCloseCallback(taskEditorAboutToClose, 'TaskEditorController');

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
    $scope.processDelete($scope.task, $scope.deleteTask, $scope.undeleteTask);
  };

  $scope.isTaskEdited = function() {
    if ($scope.taskTitlebarHasText()) {
      return TasksService.isTaskEdited($scope.task, UISessionService.getActiveUUID());
    }
  };

  $scope.endTaskEdit = function() {
    $scope.closeEditor();
  };

  function taskEditorAboutToClose() {
    if (angular.isFunction($scope.unregisterEditorAboutToCloseCallback))
      $scope.unregisterEditorAboutToCloseCallback('TaskEditorController');

    if ($scope.isTaskEdited() && !$scope.task.trans.deleted) saveTaskInEdit();
    else {
      if (completeReadyDeferred){
        $scope.deferEdit().then(function(){
          UISessionService.allow('leaveAnimation', 200);
          completeReadyDeferred.resolve($scope.task);
          completeReadyDeferred = undefined;
        });
      } else {
        TasksService.resetTask($scope.task, UISessionService.getActiveUUID());
      }
    }
  }

  // TITLEBAR

  $scope.taskTitlebarHasText = function() {
    return $scope.task.trans.title && $scope.task.trans.title.length !== 0;
  };

  $scope.taskTitlebarTextKeyDown = function (keydownEvent) {
    $scope.handleBasicTitlebarKeydown(keydownEvent, $scope.task);
    // Return
    if (event.keyCode === 13) {
      if ($scope.taskTitlebarHasText()) {
        // Enter in editor saves, no line breaks allowed
        $scope.handleTitlebarEnterAction(saveTaskInEdit);
      }
      event.preventDefault();
      event.stopPropagation();
    }
  };

  $scope.setTaskDescriptionFocus = function(focus) {
    $scope.taskDescriptionFocused = focus;
    // FIXME: Maybe some directive with focus, blur event listeners, swiper and drawer.
    SwiperService.setOnlyExternal('taskEditor', focus);
    if (!focus && typeof contentBlurCallback === 'function') contentBlurCallback();
  };

  // UI

  $scope.isTaskPropertyInEdit = function() {
    if ($scope.taskDescriptionFocused) {
      if (typeof hideCallback === 'function') hideCallback(true);
      return true;
    }
    var pickerOpen = $scope.isPickerOpen();
    if (typeof hideCallback === 'function') hideCallback(pickerOpen);
    return pickerOpen;
  };

  $scope.isPickerOpen = function() {
    return $scope.calendarOpen || $scope.contextPickerOpen || $scope.listPickerOpen ||
    $scope.reminderPickerOpen || $scope.repeatingPickerOpen;
  };

  $scope.getPropertyNameInEdit = function() {
    if ($scope.calendarOpen)
      return 'date';
    else if ($scope.contextPickerOpen)
      return 'context';
    else if ($scope.listPickerOpen)
      return 'list';
    else if ($scope.reminderPickerOpen)
      return 'reminder';
    else if ($scope.repeatingPickerOpen)
      return 'repeat';
  };

  // CALENDAR

  $scope.openCalendar = function() {
    $scope.calendarOpen = true;
    if (angular.isFunction($scope.registerPropertyEditDoneCallback))
      $scope.registerPropertyEditDoneCallback($scope.closeCalendar);
  };

  $scope.getCalendarStartingDate = function(task) {
    if (task.trans.due)
      return DateService.getDateTodayOrFromLaterYYYYMMDD(task.trans.due);
  };

  $scope.closeCalendar = function() {
    $scope.calendarOpen = false;
  };

  $scope.closeCalendarAndCall = function(taskAction, task, taskNewProperty) {
    $scope.closeCalendar();
    taskAction(task, taskNewProperty);
  };

  $scope.setTaskDate = function(task, date) {
    task.trans.due = DateService.getYYYYMMDD(date);
  };

  $scope.setDateAndSave = function(date) {
    $scope.setTaskDate($scope.task, date);
    // FIXME: This is not the place to do this! Better would be at saveTaskInEdit but that would require
    //        that we know if the task will actually leave or not!
    UISessionService.allow('leaveAnimation', 1000);
    $scope.processClose($scope.task);
  };

  $scope.clearTransientDate = function(task) {
    if (task.trans.due) delete task.trans.due;
  };

  // REMINDER
  $scope.openReminderPicker = function(task) {
    var hours, minutes;
    if (task.trans.reminder) {
      var reminderDate = new Date(task.trans.reminder);
      var reminderHours = reminderDate.getHours().toString();
      var reminderMinutes = reminderDate.getMinutes().toString();
      hours = reminderHours[1] ? reminderHours : '0' + reminderHours[0];
      minutes = reminderMinutes[1] ? reminderMinutes : '0' + reminderMinutes[0];
    } else {
      hours = 12;
      minutes = '00';
    }
    $scope.reminder = {
      hours: hours,
      minutes: minutes
    };
    console.log($scope.reminder);
    $scope.reminderPickerOpen = true;
  };

  $scope.closeReminderPicker = function() {
    $scope.reminderPickerOpen = false;
  };

  // CONTEXT PICKER
  $scope.openContextPicker = function() {
    $scope.contextPickerOpen = true;
  };
  $scope.closeContextPicker = function() {
    $scope.contextPickerOpen = false;
  };
  $scope.closeContextPickerAndSetContextToTask = function(task, context) {

    function doCloseAndSave() {
      $scope.closeContextPicker();
      task.trans.context = context;
    }

    if (!context.trans.uuid) {
      // Context is new, save it first. Close context picker on error saving new context.
      $scope.saveContext(context).then(doCloseAndSave, $scope.closeContextPicker);
    }
    else {
      doCloseAndSave();
    }
  };

  $scope.closeContextPickerAndClearContextFromTask = function(task, context) {
    $scope.closeContextPicker();
    if (task.trans.context === context){
      task.trans.context = undefined;
    }
  };

  // REPEATING PICKER
  $scope.openRepeatingPicker = function() {
    $scope.repeatingPickerOpen = true;
    if (angular.isFunction($scope.registerPropertyEditDoneCallback))
      $scope.registerPropertyEditDoneCallback($scope.closeRepeatingPicker);
  };
  $scope.closeRepeatingPicker = function() {
    $scope.repeatingPickerOpen = false;
  };
  $scope.closeRepeatingPickerAndSetRepeatTypeToTask = function(task, repeatType) {
    $scope.closeRepeatingPicker();
    task.trans.repeating = repeatType.trans.title;
  };
  $scope.closeRepeatingPickerAndClearRepeatTypeFromtask = function(task, repeatType) {
    $scope.closeRepeatingPicker();
    if (task.trans.repeating === repeatType.trans.title)
      delete task.trans.repeating;
  };

  $scope.isTaskFooterHidden = function(footerHiddenCallback) {
    var footerHidden = $scope.isTaskPropertyInEdit();
    if (typeof footerHiddenCallback === 'function') footerHiddenCallback(footerHidden);
    return footerHidden;
  };

  var hideCallback;
  $scope.registerHideCallback = function(callback) {
    if (!hideCallback)
      hideCallback = callback;
  };

  var contentBlurCallback;
  $scope.registerContentBlurCallback = function(callback) {
    if (!contentBlurCallback)
      contentBlurCallback = callback;
  };

  $scope.$on('$destroy', function() {
    if (angular.isFunction($scope.unregisterPropertyEditDoneCallback)) {
      // Unregister any leftover callback.
      $scope.unregisterPropertyEditDoneCallback();
    }
  });

}

TaskEditorController['$inject'] = ['$q', '$rootScope', '$scope', '$timeout',
'DateService', 'SwiperService', 'TasksService', 'UISessionService'
];
angular.module('em.main').controller('TaskEditorController', TaskEditorController);

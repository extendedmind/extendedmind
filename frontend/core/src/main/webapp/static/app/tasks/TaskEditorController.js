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

 function TaskEditorController($filter, $q, $rootScope, $scope, $timeout, ArrayService, DateService,
                               ReminderService, SwiperService, TasksService, UISessionService,
                               packaging) {

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

  // REMINDERS

  $scope.isRemindersSupported = function() {
    return ReminderService.isRemindersSupported();
  };

  $scope.isRemindersVisible = function(task) {
    return !task.trans.completed;
  };

  $scope.isReminderInThisDevice = function(reminder) {
    return ReminderService.isReminderInThisDevice(reminder);
  };

  $scope.findActiveReminderForThisDevice = function(reminders) {
    return ReminderService.findActiveReminderForThisDevice(reminders);
  };

  $scope.openReminderPicker = function(task, reminder) {
    var reminderDate, hours, minutes;

    if (reminder !== undefined) {
      // Get date from the existing reminder in this device.
      reminderDate = new Date(reminder.notification);
    }
    else {
      // New reminder.
      if (task.trans.due &&
          new Date(task.trans.due).setHours(0, 0, 0, 0) >= new Date().setHours(0, 0, 0, 0))
      {
        // Get date from task due date when it is present or future.
        reminderDate = new Date(task.trans.due);
        // Set hours and minutes to current time and clear seconds.
        reminderDate.setHours(new Date().getHours(), reminderDate.getMinutes(), 0, 0);
      }
      else {
        // Get today date.
        reminderDate = new Date();
        reminderDate.setSeconds(0, 0);  // Clear seconds.
      }
    }

    // TODO:
    //  hours = DateService.padTimeValue(hours)
    //  minutes = DateService.padTimeValue(minutes)
    var reminderHours = reminderDate.getHours().toString();
    var reminderMinutes = reminderDate.getMinutes().toString();
    hours = reminderHours[1] ? reminderHours : '0' + reminderHours[0];
    minutes = reminderMinutes[1] ? reminderMinutes : '0' + reminderMinutes[0];

    $scope.reminder = {
      date: reminderDate,
      hours: {
        limit: 23,
        value: hours
      },
      minutes: {
        limit: 59,
        value: minutes
      },
      error: {}
    };

    $scope.reminderPickerOpen = true;
    if (angular.isFunction($scope.registerPropertyEditDoneCallback))
      $scope.registerPropertyEditDoneCallback(closeReminderPicker, [reminder, task]);
  };

  function compareWithNotificationTime(a, b) {
    return a.notification - b.notification;
  }

  $scope.activeThisDeviceFirstThenByTime = function(reminders) {
    if (!reminders) {
      return;
    }

    // i Order by notification time. Do not add past reminders.
    var sortedReminders = [];
    for (var i = 0; i < reminders.length; i++) {
      if (reminders[i].notification >= Date.now()) {
        ArrayService.insertItemToArray(reminders[i], sortedReminders, compareWithNotificationTime);
      }
    }

    // ii Move reminder of this device to first.
    if (packaging.endsWith('cordova')) {
      var indexOfReminderInThisDevice;
      for (var j = 0; j < sortedReminders.length; j++) {
        if (ReminderService.isReminderInThisDevice(sortedReminders[j])) {
          indexOfReminderInThisDevice = j;
          break;
        }
      }

      if (indexOfReminderInThisDevice !== undefined) {
        sortedReminders.move(indexOfReminderInThisDevice, 0);
      }
    }

    return sortedReminders;
  };

  $scope.getReminderTime = function(reminder, task) {
    var time;
    if (task.trans.due) {
      if (new Date(reminder.notification).setHours(0, 0, 0, 0) !==
          new Date(task.trans.due).setHours(0, 0, 0, 0))
      {
        // Show date of the reminder when task has different due date.
        time = $filter('date')(reminder.notification, 'HH:mm EEE d MMM').toLowerCase();
      }
    }
    if (!time) {
      time = $filter('date')(reminder.notification, 'HH:mm');
    }
    return time;
  };

  $scope.getDeviceName = function(reminder) {
    if (ReminderService.isReminderInThisDevice(reminder)) {
      return 'this device';
    } else if (reminder.packaging === 'ios-cordova') {
      return 'ios';
    } else if (reminder.packaging === 'android-cordova') {
      return 'android';
    }
  };

  function setReminderError(reminder, type) {
    if (reminder.error.timer) {
      $timeout.cancel(reminder.error.timer);
    }
    if (type === 'past')
      reminder.error.message = 'date is in the past';
    else if (type === 'invalid')
      reminder.error.message = 'invalid time';

    reminder.error.active = true;

    reminder.error.timer = $timeout(function() {
      reminder.error.active = false;
    }, 2000);
  }

  function closeReminderPicker(reminder, task) {
    if ($scope.reminder.hours.value !== undefined && $scope.reminder.minutes.value !== undefined) {
      $scope.reminder.date.setHours($scope.reminder.hours.value, $scope.reminder.minutes.value);
      if ($scope.reminder.date > new Date().setSeconds(0, 0)) {
        // Make sure date is set to future.
        $scope.reminderPickerOpen = false;

        if (reminder !== undefined) {
          ReminderService.updateReminder(reminder, $scope.reminder.date);
        } else {
          var reminderToAdd = ReminderService.addReminder($scope.reminder.date, task);
          if (!$scope.task.trans.reminders) {
            $scope.task.trans.reminders = [];
          }
          $scope.task.trans.reminders.push(reminderToAdd);
        }
      } else {
        setReminderError($scope.reminder, 'past');
      }
    } else {
      setReminderError($scope.reminder, 'invalid');
    }
  }

  $scope.clearReminderAndClose = function() {
    $scope.reminderPickerOpen = false;
    $scope.reminder = undefined;
    if ($scope.task.trans.reminders) {
      var reminder = ReminderService.findActiveReminderForThisDevice($scope.task.trans.reminders);
      if (reminder !== undefined) {
        // When task is not completed and reminder is in the future, remove reminder from the task
        if ($scope.task.trans.reminders.length === 1) {
          delete $scope.task.trans.reminders;
        } else {
          $scope.task.trans.reminders.splice($scope.task.trans.reminders.indexOf(reminder), 1);
        }
        ReminderService.removeReminder(reminder);
      }
    }
  };

  $scope.loopTime = function(time, direction) {
    if (time.value === undefined) {
      time.value = 0;
    } else {
      if (direction === 'up') {
        if (time.value === time.limit) {
          time.value = 0;
        } else {
          time.value++;
        }
      } else if (direction === 'down') {
        if (time.value === null || time.value === 0 || (time.value && time.value.toString() === '00')) {
          time.value = time.limit;
        } else {
          time.value--;
        }
      }
    }
    if (time.value < 10) {
      // Pad
      time.value = 0 + time.value.toString();
    }
  };

  $scope.moveDate = function(date, precision, direction) {
    switch (precision) {
      case 'day':
      date.setDate(date.getDate() + (direction === 'up' ? 1 : -1));
      break;
      case 'month':
      date.setMonth(date.getMonth() + (direction === 'up' ? 1 : -1));
      break;
      case 'year':
      date.setFullYear(date.getFullYear() + (direction === 'up' ? 1 : -1));
      break;
    }
  };

  $scope.reminderHourKeyDown = function(e) {
    if(e.which === 9) {
      // TAB, 'Next' in Android numeric keyboard
      e.preventDefault();
      e.target.blur();
    } else if (e.which === 32) {
      // Space
      e.preventDefault();
    } else if (e.which === 188) {
      // Comma
      e.preventDefault();
    } else if (e.which === 189) {
      // Dash
      e.preventDefault();
    } else if (e.which === 190) {
      // Period
      e.preventDefault();
    }
  };

  $scope.isPastDate = function(reminderDate, precision) {
    // NOTE: Should this take time (hours and minutes) into consideration or not
    var date = new Date(reminderDate);
    if (date.setHours(0, 0, 0, 0) < new Date().setHours(0, 0, 0, 0)) {
      switch (precision) {
        case 'day':
        return true;
        case 'month':
        return date.getFullYear() < new Date().getFullYear() || date.getMonth() < new Date().getMonth();
        case 'year':
        return date.getFullYear() < new Date().getFullYear();
      }
    }
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

TaskEditorController['$inject'] = ['$filter', '$q', '$rootScope', '$scope', '$timeout', 'ArrayService',
'DateService', 'ReminderService', 'SwiperService', 'TasksService', 'UISessionService', 'packaging'
];
angular.module('em.main').controller('TaskEditorController', TaskEditorController);

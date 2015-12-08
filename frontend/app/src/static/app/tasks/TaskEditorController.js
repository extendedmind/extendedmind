/* Copyright 2013-2015 Extended Mind Technologies Oy
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
                               UserSessionService, packaging) {

  // INITIALIZING

  if (angular.isFunction($scope.registerFeatureEditorAboutToCloseCallback))
    $scope.registerFeatureEditorAboutToCloseCallback(taskEditorAboutToClose, 'TaskEditorController');

  var calendarOpen, contextPickerOpen, reminderPickerOpen, repeatingPickerOpen;

  // TASK EDITOR FIELD VISIBILITY

  $scope.showTaskEditorComponent = function(componentName, subcomponentName) {
    switch (componentName) {

      case 'advancedFooter':
      if (!subcomponentName) {
        return !$scope.isPropertyInDedicatedEdit();
      } else if (subcomponentName === 'convert') {
        return $scope.showEditorAction('convertToList') || $scope.showEditorAction('convertToNote');
      } else if (subcomponentName === 'navigation') {
        return !$scope.isFooterNavigationHidden();
      }
      break;

      case 'basicFooter':
      if (!subcomponentName) {
        if (!$scope.isPropertyInDedicatedEdit() &&
            ($scope.showTaskEditorComponent('basicFooter', 'later') ||
             $scope.showTaskEditorComponent('basicFooter', 'navigation')))
        {
          return true;
        }
        break;
      } else if (subcomponentName === 'later') {
        return $scope.fullEditor;
      } else if (subcomponentName === 'navigation') {
        return !$scope.isFooterNavigationHidden();
      }
      break;
    }
  };

  $scope.showTaskProperty = function(propertyName){
    switch (propertyName){
      case 'context':
      if ($scope.features.tasks.getStatus('contexts') !== 'disabled' && !$scope.isPropertyInDedicatedEdit() &&
          $scope.fullEditor)
      {
        return true;
      }
      break;
      case 'created':
      return;
      case 'date':
      return !$scope.isPropertyInDedicatedEdit() && $scope.fullEditor;
      case 'list':
      if ($scope.features.lists.getStatus('active') !== 'disabled' && !$scope.isPropertyInDedicatedEdit()) {
        return $scope.fullEditor ? true : ($scope.task.trans.list && !$scope.task.trans.list.trans.deleted);
      }
      break;
      case 'modified':
      return;
      case 'reminders':
      return isRemindersVisible($scope.task) && !$scope.isPropertyInDedicatedEdit() && $scope.fullEditor;
      case 'repeating':
      return $scope.task.trans.due && !$scope.isPropertyInDedicatedEdit() && $scope.fullEditor;
    }
  };

  $scope.showTaskSubEditor = function(subEditorName){
    switch (subEditorName){
      case 'calendar':
      return calendarOpen;
      case 'context':
      return contextPickerOpen;
      case 'reminders':
      return reminderPickerOpen;
      case 'repeating':
      return repeatingPickerOpen;
    }
  };

  $scope.getTaskPropertyInEditHasContainer = function() {
    return calendarOpen || contextPickerOpen || $scope.listPickerOpen || repeatingPickerOpen;
  };

  // COMPLETING, SAVING, DELETING

  var completeReadyDeferred;
  $scope.clickCompleteTaskInEdit = function() {
    if ($scope.readOnly) {
      /*
      // NOTE: Test this with Android when checkbox is disabled in task lists as well.
      event.preventDefault();
      if (angular.isFunction($scope.generateReadOnlyPropertyClickNotification)) {
        $scope.generateReadOnlyPropertyClickNotification('task');
      }
      */
    } else {
      completeReadyDeferred = $q.defer();
      var completed = $scope.toggleCompleteTask($scope.task, completeReadyDeferred);

      if (!completed) {
        completeReadyDeferred.resolve($scope.task);
        completeReadyDeferred = undefined;
      }
    }
  };

  function saveTaskInEdit(exitAppAfterSave) {
    function doSaveTaskInEdit(){
      if (completeReadyDeferred){
        UISessionService.allow('leaveAnimation', 200, $scope.task.trans.uuid);
        completeReadyDeferred.resolve($scope.task);
        completeReadyDeferred = undefined;
      }
      return $scope.saveTask($scope.task);
    }
    if (exitAppAfterSave){
      return doSaveTaskInEdit();
    }else{
      return $scope.deferEdit().then(function() {
        return doSaveTaskInEdit();
      });
    }
  }

  $scope.deleteTaskInEdit = function() {
    $scope.processDelete($scope.task, $scope.deleteTask, $scope.undeleteTask);
  };

  $scope.isTaskEdited = function() {
    if (taskTitlebarHasText()) {
      return TasksService.isTaskEdited($scope.task);
    }
  };

  $scope.endTaskEdit = function() {
    $scope.closeEditor();
  };

  function taskEditorAboutToClose(exitAppAfterSave) {
    if (angular.isFunction($scope.unregisterEditorAboutToCloseCallback))
      $scope.unregisterEditorAboutToCloseCallback('TaskEditorController');

    if ($scope.isTaskEdited() && !$scope.task.trans.deleted) return saveTaskInEdit(exitAppAfterSave);
    else {
      if (completeReadyDeferred){
        $scope.deferEdit().then(function(){
          UISessionService.allow('leaveAnimation', 200, $scope.task.trans.uuid);
          completeReadyDeferred.resolve($scope.task);
          completeReadyDeferred = undefined;
        });
      } else {
        TasksService.resetTask($scope.task);
      }
    }
  }

  // TITLEBAR

  function taskTitlebarHasText() {
    return $scope.task.trans.title && $scope.task.trans.title.length !== 0;
  }

  $scope.taskTitlebarTextKeyDown = function (keydownEvent) {
    $scope.handleBasicTitlebarKeydown(keydownEvent, $scope.task);
    // Return
    if (event.keyCode === 13) {
      if (taskTitlebarHasText()) {
        // Enter in editor saves, no line breaks allowed
        $scope.handleTitlebarEnterAction(saveTaskInEdit);
      }
      event.preventDefault();
      event.stopPropagation();
    }
  };

  // UI

  function isSubEditorOpenInTaskEditor(){
    return calendarOpen || contextPickerOpen || $scope.listPickerOpen || reminderPickerOpen ||
    repeatingPickerOpen;
  }
  $scope.registerIsSubEditorOpenCondition(isSubEditorOpenInTaskEditor);

  $scope.getTaskPropertyNameInEdit = function() {
    var propertyName = $scope.getPropertyNameInEdit();
    if (!propertyName) {
      if (calendarOpen) {
        propertyName = 'date';
      } else if (contextPickerOpen) {
        propertyName = 'context';
      } else if (reminderPickerOpen) {
        propertyName = 'reminder';
      } else if (repeatingPickerOpen) {
        propertyName = 'repeat';
      }
    }
    return propertyName;
  };


  var gotoTitleCallback;
  $scope.gotoTaskTitle = function() {
    if (typeof gotoTitleCallback === 'function') gotoTitleCallback();
    if (!$scope.isFirstSlide('taskEditor')) $scope.swipeToBasic('taskEditor');
  };
  $scope.registerGotoTaskTitleCallback = function(callback) {
    gotoTitleCallback = callback;
  };

  // CALENDAR

  $scope.openCalendar = function() {
    calendarOpen = true;
    if (angular.isFunction($scope.registerSubEditorDoneCallback))
      $scope.registerSubEditorDoneCallback($scope.closeCalendar);
  };

  $scope.getCalendarStartingDate = function(task) {
    if (task.trans.due)
      return DateService.getDateTodayOrFromLaterYYYYMMDD(task.trans.due);
  };

  $scope.closeCalendar = function() {
    calendarOpen = false;
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
    UISessionService.allow('leaveAnimation', 1000, $scope.task.trans.uuid);
    $scope.processClose($scope.task);
  };

  $scope.clearTransientDate = function(task) {
    if (task.trans.due) delete task.trans.due;
  };

  // REMINDERS

  $scope.isRemindersSupported = function() {
    return ReminderService.isRemindersSupported();
  };

  function isRemindersVisible(task) {
    return !task.trans.completed && !task.trans.deleted && $scope.editorType !== 'recurring';
  }

  $scope.isReminderInThisDevice = function(reminder) {
    return ReminderService.isReminderInThisDevice(reminder);
  };

  $scope.findActiveReminderForThisDevice = function(reminders) {
    return ReminderService.findActiveReminderForThisDevice(reminders);
  };

  $scope.openReminderPicker = function(task, reminder) {
    var reminderDate, hoursData, hours, minutes, existing;

    if (reminder !== undefined) {
      // Get date from the existing reminder in this device.
      reminderDate = new Date(reminder.notification);
      existing = true;
    }
    else {
      // New reminder.
      if (task.trans.due &&
          new Date(task.trans.due).setHours(0, 0, 0, 0) >= new Date().setHours(0, 0, 0, 0))
      {
        // Get date from task due date when it is present or future.
        reminderDate = new Date(task.trans.due);
        // Set hours and minutes to current time and clear seconds.
        reminderDate.setHours(new Date().getHours(), new Date().getMinutes(), 0, 0);
      }
      else {
        // Get today date.
        reminderDate = new Date();
        reminderDate.setSeconds(0, 0);  // Clear seconds.
      }
    }

    var reminderHours = reminderDate.getHours();
    var reminderMinutes = reminderDate.getMinutes();

    if (UserSessionService.getUIPreference('hour12')) {
      hours = DateService.toHour12(reminderHours);
      hoursData = {
        bottomLimit: 1,
        limit: 12,
        value: hours,
        beforeMidday: reminderHours < 12,
        hour12: true
      };
    } else {
      hoursData = {
        bottomLimit: 0,
        limit: 23,
        value: DateService.padTimeValue(reminderHours),
        padOneDigit: true
      };
    }

    minutes = DateService.padTimeValue(reminderMinutes);

    $scope.reminder = {
      date: reminderDate,
      hours: hoursData,
      minutes: {
        bottomLimit: 0,
        limit: 59,
        value: minutes
      },
      error: {}
    };

    var initialDate = {
      date: new Date($scope.reminder.date),
      hours: {
        value: hoursData.value,
        beforeMidday: hoursData.beforeMidday
      },
      minutes: minutes
    };

    reminderPickerOpen = true;
    if (angular.isFunction($scope.registerSubEditorDoneCallback)) {
      $scope.registerSubEditorDoneCallback(closeReminderPickerAndSave, [reminder, task]);
    }

    if (angular.isFunction($scope.registerHasSubEditorEditedCallback)) {
      $scope.registerHasSubEditorEditedCallback(isReminderEdited, [initialDate, $scope.reminder, existing]);
    }
  };

  function isReminderEdited(initialData, currentData, existing) {
    function isHoursEdited(initialData, currentData) {
      if (initialData.hours.value != currentData.hours.value ||
          initialData.hours.beforeMidday !== currentData.hours.beforeMidday)
      {
        return true;
      }
    }
    if (existing && initialData.date.getTime() !== currentData.date.getTime() ||
        isHoursEdited(initialData, currentData) || initialData.minutes != currentData.minutes.value)
    {
      return true;
    } else if (!existing) {
      return true;
    }
  }

  $scope.getReminderPickerData = function(reminder, timeUnit) {
    if (timeUnit === 'hour') {
      return {
        limit: reminder.hours.limit,
        bottomLimit: reminder.hours.bottomLimit,
        padOneDigit: reminder.hours.padOneDigit
      };
    } else if (timeUnit === 'minute') {
      return {
        limit: reminder.minutes.limit,
        padOneDigit: true
      };
    }
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
    var reminderDate = DateService.getDateWithoutTime(new Date(reminder.notification));
    var todayDate = DateService.getTodayDateWithoutTime();

    if (task.trans.due) {
      var taskDueDate = DateService.getDateWithoutTime(new Date(task.trans.due));
      if (reminderDate === taskDueDate) {
        time = $scope.formatToLocaleTime(reminder.notification);
      } else {
        time = $scope.formatToLocaleTimeWithDate(reminder.notification);
      }
    } else {
      if (reminderDate === todayDate) {
        time = $scope.formatToLocaleTime(reminder.notification);
      } else {
        time = $scope.formatToLocaleTimeWithDate(reminder.notification);
      }
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

  function closeReminderPickerAndSave(reminder, task) {
    if ($scope.reminder.hours.value !== undefined && $scope.reminder.minutes.value !== undefined) {
      var hours;
      if ($scope.reminder.hours.hour12) {
        // Convert silly 12-hour value into a proper 24-hour value.
        hours = DateService.toHour24($scope.reminder.hours.value, !$scope.reminder.hours.beforeMidday);
      } else {
        hours = $scope.reminder.hours.value;
      }
      $scope.reminder.date.setHours(hours, $scope.reminder.minutes.value);
      if ($scope.reminder.date > new Date().setSeconds(0, 0)) {
        // Make sure date is set to future.
        reminderPickerOpen = false;

        if (reminder !== undefined) {
          ReminderService.updateReminder(reminder, $scope.reminder.date);
        } else {
          var reminderToAdd = ReminderService.addReminder($scope.reminder.date, task);
          if (!$scope.task.trans.reminders) {
            $scope.task.trans.reminders = [];
          }
          $scope.task.trans.reminders.push(reminderToAdd);
        }
        $scope.saveTask(task);
        if (angular.isFunction($scope.unregisterSubEditorDoneCallback)) {
          $scope.unregisterSubEditorDoneCallback();
        }
        if (angular.isFunction($scope.unregisterHasSubEditorEditedCallback)) {
          $scope.unregisterHasSubEditorEditedCallback();
        }
      } else {
        setReminderError($scope.reminder, 'past');
      }
    } else {
      setReminderError($scope.reminder, 'invalid');
    }
  }

  $scope.clearReminderAndClose = function() {
    reminderPickerOpen = false;
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
    if (angular.isFunction($scope.unregisterSubEditorDoneCallback))
      $scope.unregisterSubEditorDoneCallback();

    if (angular.isFunction($scope.unregisterHasSubEditorEditedCallback))
      $scope.unregisterHasSubEditorEditedCallback();
  };

  $scope.loopTime = function(time, direction, timeUnit) {
    if (time.value === undefined) {
      time.value = 0;
    } else {
      if (direction === 'up') {
        if (parseInt(time.value) === time.limit) {  // Unchanged time.value is typeof string.
          if (timeUnit === 'hours' && time.hour12) {
            time.value = 1;
          } else {
            time.value = 0;
          }
        } else {
          time.value++;
          if (timeUnit === 'hours' && time.hour12 && time.value === time.limit) $scope.changeReminderTimePeriod();
        }
      } else if (direction === 'down') {
        if (time.value === null || parseInt(time.value) === time.bottomLimit) {
          time.value = time.limit;
        } else {
          time.value--;
          if (timeUnit === 'hours' && time.hour12 && time.value === time.limit - 1) $scope.changeReminderTimePeriod();
        }
      }
    }

    if (time.value < 10 && (timeUnit === 'minutes' || (timeUnit === 'hours' && !time.hour12))) {
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

  $scope.changeReminderTimePeriod = function() {
    $scope.reminder.hours.beforeMidday = !$scope.reminder.hours.beforeMidday;
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
    contextPickerOpen = true;
  };
  $scope.closeContextPicker = function() {
    contextPickerOpen = false;
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

  $scope.getUnselectedCommonCollectiveContexts = function(task) {
    if ($scope.usePremiumFeatures()){
      var commonCollectiveContexts = $scope.getTagsArray('collectiveContexts', {owner: task.trans.owner});
      if (commonCollectiveContexts.length === 1){
        return commonCollectiveContexts[0].array;
      }
    }
  };

  // REPEATING PICKER
  $scope.openRepeatingPicker = function() {
    repeatingPickerOpen = true;
    if (angular.isFunction($scope.registerSubEditorDoneCallback))
      $scope.registerSubEditorDoneCallback($scope.closeRepeatingPicker);
  };
  $scope.closeRepeatingPicker = function() {
    repeatingPickerOpen = false;
  };
  $scope.closeRepeatingPickerAndSetRepeatTypeToTask = function(task, repeatType) {
    $scope.closeRepeatingPicker();
    task.trans.repeating = repeatType.trans.title;
  };
  $scope.closeRepeatingPickerAndClearRepeatTypeFromTask = function(task, repeatType) {
    $scope.closeRepeatingPicker();
    if (task.trans.repeating === repeatType.trans.title)
      delete task.trans.repeating;
  };

  var showFooterCallbacks = {};
  $scope.registerShowFooterCallback = function(callback, id) {
    if (!showFooterCallbacks[id]) {
      showFooterCallbacks[id] = callback;
    }
  };

  // LATER FOOTER AND DESCRIPTION TEXTAREA INTERPLAY

  var getLaterFooterHeight;
  $scope.registerGetLaterFooterHeight = function(callback) {
    getLaterFooterHeight = callback;
  };

  $scope.doScrollToBottomOnTaskDescriptionResize = function(){
    if ($rootScope.columns === 3 && getLaterFooterHeight){
      return $scope.doScrollToBottomOnTextareaResize(getLaterFooterHeight());
    }else{
      return $scope.doScrollToBottomOnTextareaResize();
    }
  };

  $scope.$watch(function() {
    for (var id in showFooterCallbacks) {
      var showFooter = $scope.showTaskEditorComponent(id);
      if (showFooterCallbacks.hasOwnProperty(id)) showFooterCallbacks[id](showFooter);
    }
  });

  // CLEANUP

  $scope.$on('$destroy', function() {
    if (angular.isFunction($scope.unregisterSubEditorDoneCallback)) {
      // Unregister any leftover callback.
      $scope.unregisterSubEditorDoneCallback();
    }
  });

}

TaskEditorController['$inject'] = ['$filter', '$q', '$rootScope', '$scope', '$timeout', 'ArrayService',
'DateService', 'ReminderService', 'SwiperService', 'TasksService', 'UISessionService', 'UserSessionService',
'packaging'
];
angular.module('em.main').controller('TaskEditorController', TaskEditorController);

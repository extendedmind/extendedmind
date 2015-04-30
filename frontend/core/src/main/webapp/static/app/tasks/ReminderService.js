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

 /* global angular, cordova */
 'use strict';

 function ReminderService(BackendClientService, UISessionService, UUIDService, packaging) {

  function schedule(reminder, item) {
    var reminderToSchedule = {
      id: parseInt(reminder.id),
      title: item.trans.title,
      at: reminder.notification,
      data: {
        itemType: item.trans.itemType,
        itemUUID: item.trans.uuid
      }
    };

    cordova.plugins.notification.local.schedule(reminderToSchedule);
    delete reminder.removed;
    return reminder;
  }

  function unschedule(reminder, timestamp) {
    removeReminder(reminder);
    reminder.removed = timestamp;
    return reminder;
  }

  function removeReminder(reminder) {
    cordova.plugins.notification.local.cancel(parseInt(reminder.id));
  }

  return {
    addReminder: function(date, item) {
      var reminder = {
        id: UUIDService.randomId(),
        title: item.trans.title,
        at: date.getTime(),
        data: {
          itemType: item.trans.itemType,
          itemUUID: item.trans.uuid
        }
      };

      // Add reminder to plugin
      cordova.plugins.notification.local.schedule(reminder);

      // Generate reminder for backend.
      var reminderToSave = {
        packaging: packaging,
        notification: date.getTime(),
        reminderType: 'ln',
        id: reminder.id.toString(),
        device: UISessionService.getDeviceId()
      };

      return reminderToSave;
    },
    updateReminder: function(reminder, date) {
      cordova.plugins.notification.local.update({
        id: parseInt(reminder.id),
        at: date.getTime()
      });
      reminder.notification = date.getTime();

      return reminder;
    },
    removeReminder: function(reminder) {
      removeReminder(reminder);
    },
    scheduleReminder: function(item) {
      if (item.trans.reminders) {
        var reminder = this.findActiveReminderForThisDevice(item.trans.reminders);
        if (reminder !== undefined) {
          return schedule(reminder, item);
        }
      }
    },
    unscheduleReminder: function(item, timestamp) {
      if (item.trans.reminders) {
        var reminder = this.findActiveReminderForThisDevice(item.trans.reminders);
        if (reminder !== undefined) {
          return unschedule(reminder, timestamp);
        }
      }
    },
    removeScheduledReminder: function(item) {
      if (item.trans.reminders) {
        var reminder = this.findActiveReminderForThisDevice(item.trans.reminders);
        if (reminder !== undefined) {
          this.removeReminder(reminder);
        }
      }
    },
    /**
    * @description
    *
    * i.  Unschedule active future reminders on completed or deleted items.
    * ii. Reschedule active future reminders with .removed timestamp on uncompleted and undeleted items.
    *
    * @param {Array} items Items to iterate.
    * @returns {Array} Modified items.
    */
    synchronizeReminders: function(items) {
      var modifiedItems = [];
      for (var i = 0; i < items.length; i++) {
        var item = items[i];
        if (item.trans.reminders) {
          var reminder = this.findActiveReminderForThisDevice(item.trans.reminders);
          if (reminder !== undefined) {
            // Item has active reminder.
            if ((item.trans.completed || item.trans.deleted) && !reminder.removed) {        // i.
              unschedule(reminder, BackendClientService.generateFakeTimestamp());
              modifiedItems.push(item);
            } else if (!item.trans.completed && !item.trans.deleted && reminder.removed) {  // ii.
              schedule(reminder, item);
              modifiedItems.push(item);
            }
          }
        }
      }
      return modifiedItems;
    },
    clearTriggeredReminders: function() {
      cordova.plugins.notification.local.clearAll();
    },
    isReminderInThisDevice: function(reminder) {
      if (reminder.packaging === packaging) {
        if (reminder.packaging === 'ios-cordova') {
          var deviceModel = UISessionService.getDeviceId();
          return reminder.device === deviceModel;
        } else if (reminder.packaging === 'android-cordova') {
          var deviceId = UISessionService.getDeviceId();
          return reminder.device === deviceId;
        }
      }
    },
    isRemindersSupported: function() {
      return packaging.endsWith('cordova') && cordova.plugins && cordova.plugins.notification;
    },
    /*
    * Return not removed future reminder.
    */
    findActiveReminderForThisDevice: function(reminders) {
      for (var i = 0; i < reminders.length; i++) {
        if (this.isReminderInThisDevice(reminders[i]) && reminders[i].notification > Date.now()) {
          return reminders[i];
        }
      }
    }
  };
}
ReminderService['$inject'] = ['BackendClientService', 'UISessionService', 'UUIDService', 'packaging'];
angular.module('em.tasks').factory('ReminderService', ReminderService);

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

 /* global angular, cordova */
 'use strict';

 function ReminderService($rootScope, BackendClientService, UISessionService, UUIDService, packaging) {

  // LOCAL NOTIFICATIONS

  function scheduleLocalNotication(id, item, timestamp){
    var notification = {
      id: parseInt(id),
      title: item.trans.title,
      at: timestamp,
      sound: 'file://' + $rootScope.urlBase +'audio/notification.mp3',
      data: {
        itemType: item.trans.itemType,
        itemUUID: item.trans.uuid
      }
    };
    cordova.plugins.notification.local.schedule(notification);
  }

  function removeLocalNotification(id) {
    cordova.plugins.notification.local.cancel(parseInt(id));
  }

  function updateLocalNotification(id, timestamp) {
    cordova.plugins.notification.local.update({
      id: parseInt(id),
      at: timestamp
    });
  }

  // HELPER METHODS

  function scheduleReminder(reminder, item) {
    scheduleLocalNotication(reminder.id, item, reminder.notification);
    if (reminder.removed) delete reminder.removed;
    return reminder;
  }

  function unscheduleReminder(reminder, timestamp) {
    removeLocalNotification(reminder.id);
    reminder.removed = timestamp;
    return reminder;
  }

  return {
    addReminder: function(date, item) {
      var timestamp = date.getTime();
      var id = UUIDService.randomId();
      scheduleLocalNotication(id, item, timestamp);

      // Generate reminder for backend.
      var reminderToSave = {
        packaging: packaging,
        notification: timestamp,
        reminderType: 'ln',
        id: id.toString(),
        device: UISessionService.getDeviceId()
      };

      return reminderToSave;
    },
    updateReminder: function(reminder, date) {
      var timestamp = date.getTime();
      updateLocalNotification(reminder.id, timestamp);
      reminder.notification = timestamp;
      return reminder;
    },
    removeReminder: function(reminder) {
      removeLocalNotification(reminder.id);
    },
    scheduleReminder: function(item) {
      if (item.trans.reminders) {
        var reminder = this.findActiveReminderForThisDevice(item.trans.reminders);
        if (reminder !== undefined) {
          return scheduleReminder(reminder, item);
        }
      }
    },
    unscheduleReminder: function(item, timestamp) {
      if (item.trans.reminders) {
        var reminder = this.findActiveReminderForThisDevice(item.trans.reminders);
        if (reminder !== undefined) {
          return unscheduleReminder(reminder, timestamp);
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
    hasActiveReminder: function(item) {
      var hasActiveReminder = false;
      if (item.trans.reminders) {
        for (var i = 0; i < item.trans.reminders.length; i++) {
          if (item.trans.reminders[i].notification > Date.now()) {
            hasActiveReminder = true;
            break;
          }
        }
      }
      return hasActiveReminder;
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
              unscheduleReminder(reminder, BackendClientService.generateFakeTimestamp());
              modifiedItems.push({reminder: reminder, item: item});
            } else if (!item.trans.completed && !item.trans.deleted && reminder.removed) {  // ii.
              scheduleReminder(reminder, item);
              modifiedItems.push({reminder: reminder, item: item});
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
    * Return reminder for this device.
    */
    findReminderForThisDevice: function(reminders) {
      if (reminders && reminders.length){
        for (var i = 0; i < reminders.length; i++) {
          if (this.isReminderInThisDevice(reminders[i])) {
            return reminders[i];
          }
        }
      }
    },
    /*
    * Return not removed future reminder for this device.
    */
    findActiveReminderForThisDevice: function(reminders) {
      var reminderForThisDevice = this.findReminderForThisDevice(reminders);
      if (reminderForThisDevice && reminderForThisDevice.notification > Date.now()){
        return reminderForThisDevice;
      }
    },
    setPersistentReminderForThisDevice: function(){
      if (packaging === 'android-cordova') {
        var notification = {
          id: 0,
          title: 'launch extended mind',
          text: 'remove this from app settings',
          ongoing: true,
          led: false,
          sound: false
        };
        cordova.plugins.notification.local.schedule(notification);
      }
    },
    removePersistentReminderForThisDevice: function(){
      if (packaging === 'android-cordova') {
        cordova.plugins.notification.local.cancel(0);
      }
    }
  };
}
ReminderService['$inject'] = ['$rootScope', 'BackendClientService', 'UISessionService', 'UUIDService',
'packaging'];
angular.module('em.tasks').factory('ReminderService', ReminderService);

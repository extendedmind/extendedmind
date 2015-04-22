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

 function ReminderService(UISessionService, packaging) {

  return {
    addReminder: function(date, item) {
      var reminder = {
        id: Math.floor(100000000 + Math.random() * 900000000),  // http://stackoverflow.com/a/3437139
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
        id: reminder.id,
        device: UISessionService.getDeviceId()
      };

      return reminderToSave;
    },
    updateReminder: function(reminder, date) {
      cordova.plugins.notification.local.update({
        id: reminder.id,
        at: date.getTime()
      });
      reminder.notification = date.getTime();

      return reminder;
    },
    removeReminder: function(reminder) {
      cordova.plugins.notification.local.cancel(reminder.id);
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
        if (this.isReminderInThisDevice(reminders[i]) && !reminders[i].DEBUG_markForRemoved &&
            reminders[i].notification > Date.now())
        {
          return reminders[i];
        }
      }
    }
  };
}
ReminderService['$inject'] = ['UISessionService', 'packaging'];
angular.module('em.user').factory('ReminderService', ReminderService);
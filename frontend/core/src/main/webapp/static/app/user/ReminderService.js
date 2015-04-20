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
    addReminder: function(date) {
      console.log(date);
    },
    updateReminder: function(reminder, timestamp) {
      reminder.notification = timestamp;
    },
    removeReminder: function() {
      // TODO
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
    findReminderForThisDevice: function(reminders) {
      for (var i = 0; i < reminders.length; i++) {
        if (this.isReminderInThisDevice(reminders[i])) {
          return reminders[i];
        }
      }
    }
  };
}
ReminderService['$inject'] = ['UISessionService', 'packaging'];
angular.module('em.user').factory('ReminderService', ReminderService);

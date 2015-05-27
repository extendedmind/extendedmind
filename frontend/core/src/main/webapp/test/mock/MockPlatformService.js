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

 /*global angular */
 'use strict';

 function MockPlatformService($location, $rootScope, $routeParams, AuthenticationService, DetectBrowserService,
                              UserSessionService, packaging) {

  var reminders = [];

  function mockCalendar() {
    var calendars = {};

    calendars[window.device.model] = [{
      id: 1,
      name: 'first'
    }];

    UserSessionService.setUIPreference('calendars', calendars);
  }

  function mockReminders() {
    var callbacks = {};
    var queuedClickCallback;

    window.cordova.plugins.notification = {
      local: {
        schedule: function(reminder) {
          reminders.push(reminder);
          localStorage.setItem('reminders', JSON.stringify(reminders));
        },
        update: function(reminder) {
          var reminderIndex = reminders.findFirstIndexByKeyValue('id', reminder.id);
          if (reminderIndex !== undefined) {
            reminders[reminderIndex].at = reminder.at;
            localStorage.setItem('reminders', JSON.stringify(reminders));
          }
        },
        cancel: function(id) {
          var reminderIndex = reminders.findFirstIndexByKeyValue('id', id);
          if (reminderIndex !== undefined) {
            reminders.splice(reminderIndex, 1);
          }
        },
        on: function(type, callback) {
          if (!callbacks[type]) {
            callbacks[type] = [];
          }
          callbacks[type].push(callback);

          if (queuedClickCallback) {
            this.runCallback('click');
          }
        },
        clearAll: function() {
          reminders = [];
          localStorage.removeItem('reminders');
        },
        runCallback: function(type) {
          if (callbacks[type]) {
            if (reminders.length) {
              var lastReminder = reminders.pop();
              for (var i = 0; i < callbacks[type].length; i++) {
                if (lastReminder.data) {
                  // https://github.com/katzer/cordova-plugin-local-notifications/issues/489
                  lastReminder.data = JSON.stringify(lastReminder.data);
                }
                callbacks[type][i](lastReminder);
              }
            }
          } else if (type === 'click') {
            queuedClickCallback = true;
          }
        }
      }
    };

    var storedReminders = localStorage.getItem('reminders');
    if (storedReminders !== null) {
      reminders = JSON.parse(storedReminders);
    } else {
      var itemsResponseData = getJSONFixture('itemsResponse.json');
      if (itemsResponseData.tasks) {
        for (var i = 0; i < itemsResponseData.tasks.length; i++) {
          if (itemsResponseData.tasks[i].reminders) {
            for (var j = 0; j < itemsResponseData.tasks[i].reminders.length; j++) {
              var reminder = {
                id: itemsResponseData.tasks[i].reminders[j].id,
                at: Date.now() + 7200000,
                data: {
                  itemType: 'task',
                  itemUUID: itemsResponseData.tasks[i].uuid
                }
              };
              reminders.push(reminder);
            }
          }
        }
      }
      if (reminders !== undefined) {
        localStorage.setItem('reminders', JSON.stringify(reminders));
      }
    }
    if ($routeParams.reminder) {
      window.cordova.plugins.notification.local.runCallback('click');
    }

  }

  function mockIOS() {
    if (!window.cordova) {
      window.cordova = {};
    }
    if (!window.cordova.plugins) {
      window.cordova.plugins = {};
    }

    /*
    * When Chrome DevTools emulator is on, testing user agent spoofing is enough to detect the device.
    */
    DetectBrowserService.isIos = function() {
      return /iP(hone|od|ad)/.test(navigator.userAgent);
    };

    if (!window.device)
      window.device = {};

    window.device.model = 'iPhone';

    // http://www.darianshimy.com/blog/2013/01/18/javascript-iphone-4-slash-5-detection/
    var iPhone4 = (window.screen.height == (960 / 2));
    var iPhone5 = (window.screen.height == (1136 / 2));
    var iPhone6 = (window.screen.height == (1334 / 2));

    if (iPhone4)
      window.device.model += '4';
    else if (iPhone5)
      window.device.model += '5';
    else if (iPhone6)
      window.device.model += '6';

    if (!window.plugins)
      window.plugins = {};

    var listCalendars = [
    {
      id:1,
      name: 'first'
    },
    {
      id: 2,
      name: 'second'
    }];

    var eventInstances = [{
      calendar_id: 1,
      event_id: 99,
      title: 'yesterday all day event from calendar 1',
      begin: Date.now() - 86400000,
      end: Date.now() - 86400000,
      allDay: true,
      location: 'location location location',
      rrule: true
    },{
      calendar_id: 1,
      event_id: 100,
      title: 'all day event from calendar 1',
      begin: Date.now(),
      end: Date.now(),
      allDay: true,
      location: 'location location location',
      rrule: true
    },{
      calendar_id: 1,
      event_id: 101,
      title: 'past today event from calendar 1',
      begin: Date.now() - 1000000,
      end: Date.now() - 10000
    },{
      calendar_id: 1,
      event_id: 102,
      title: 'future today event from calendar 1',
      begin: Date.now() + 1000000,
      end: Date.now() + 20000000
    }];

    window.plugins.calendar = {
      listCalendars: function(success) {
        return success(listCalendars);
      },
      listEventInstances: function(calendarIds, startDate, endDate, success) {
        var filteredEventInstancesByCalendarIds = [];
        for (var i = 0; i < eventInstances.length; i++) {
          if (calendarIds.indexOf(eventInstances[i].calendar_id) !== -1) {
            filteredEventInstancesByCalendarIds.push(eventInstances[i]);
          }
        }
        return success(filteredEventInstancesByCalendarIds);
      }
    };
  }
  return {
    mockIOS: function() {
      mockIOS();
    },
    setPlatformUIPreferences: function() {
      if (packaging === 'ios-cordova') {
        mockCalendar();
        mockReminders();
      }
    },
  };
}

MockPlatformService['$inject'] = ['$location', '$rootScope', '$routeParams', 'AuthenticationService', 'DetectBrowserService',
'UserSessionService', 'packaging'];
angular.module('em.appTest').factory('MockPlatformService', MockPlatformService);

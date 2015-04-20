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

  function setCalendar() {
    var calendars = {};

    calendars[window.device.model] = [{
      id: 1,
      name: 'first'
    }];

    UserSessionService.setUIPreference('calendars', calendars);
  }

  function setReminders() {
    if (!window.cordova) {
      window.cordova = {};
    }
    if (!window.cordova.plugins) {
      window.cordova.plugins = {};
    }
    window.cordova.plugins.notification = {};
  }

  function mockIOS() {

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
      event_id: 100,
      title: 'first event',
      begin: Date.now(),
      end: Date.now(),
      allDay: true,
      location: 'location location location',
      rrule: true
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
      setReminders();
    },
    setPlatformUIPreferences: function() {
      if (packaging === 'ios-cordova') {
        setCalendar();
      }
    },
  };
}

MockPlatformService['$inject'] = ['$location', '$rootScope', '$routeParams', 'AuthenticationService', 'DetectBrowserService',
'UserSessionService', 'packaging'];
angular.module('em.appTest').factory('MockPlatformService', MockPlatformService);

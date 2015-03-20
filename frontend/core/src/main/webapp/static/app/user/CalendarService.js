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

 /* global angular */
 'use strict';

function CalendarService(UISessionService, UserService, UserSessionService) {

  function updateActiveCalendars(calendars){
    var deviceId = UISessionService.getDeviceId();
    if (deviceId){
      var calendarPreferences = UserSessionService.getUIPreference('calendars');
      if (!calendarPreferences) calendarPreferences = {};
      calendarPreferences[deviceId] = calendars;
      UserSessionService.setUIPreference('calendars', calendarPreferences);
      UserService.saveAccountPreferences();
    }
  }

  function getActiveCalendars(){
    var deviceId = UISessionService.getDeviceId();
    if (deviceId){
      var calendarPreferences = UserSessionService.getUIPreference('calendars');
      if (!calendarPreferences) calendarPreferences = {};
      if (!calendarPreferences[deviceId]) return [];
      else return calendarPreferences[deviceId];
    }
  }

  return {
    getActiveCalendars: getActiveCalendars,
    activateCalendar: function(id, name){
      var activeCalendars = getActiveCalendars();
      for (var i = 0; i < activeCalendars.length; i++) {
        if (activeCalendars[i].id === id) {
          return;
        }
      }
      activeCalendars.push({
        id: id,
        name: name,
      });
      updateActiveCalendars(activeCalendars);
    },
    deactivateCalendar: function(id){
      var activeCalendars = getActiveCalendars();
      for (var i = activeCalendars.length-1; i >= 0; i--) {
        if (activeCalendars[i].id === id) {
          activeCalendars.splice(i, 1);
          updateActiveCalendars(activeCalendars);
          return;
        }
      }
    }
  };
}
CalendarService['$inject'] = ['UISessionService', 'UserService', 'UserSessionService'];
angular.module('em.user').factory('CalendarService', CalendarService);

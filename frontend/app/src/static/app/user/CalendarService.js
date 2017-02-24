/* Copyright 2013-2017 Extended Mind Technologies Oy
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

function CalendarService(UISessionService, UserService, UserSessionService, packaging) {
  var calendarActivationChangedCallbacks = {};

  function setActiveCalendars(calendars){
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

  function executeCalendarActivationChangedCallbacks() {
    for (var id in calendarActivationChangedCallbacks) {
      if (calendarActivationChangedCallbacks.hasOwnProperty(id)) {
        calendarActivationChangedCallbacks[id]();
      }
    }
  }

  // Calendar loading polling

  var calendarLoadedCallback;
  function beginCalendarLoadedPoll(callback){
    calendarLoadedCallback = callback;
    // Start both deviceready polling as well as direct polling as there is no guarantee that
    // deviceready will always fire
    document.addEventListener('deviceready', checkCalendarLoadedRepeated);
    checkCalendarLoadedRepeated();
  }
  function checkCalendarLoadedRepeated(){
    if (isCalendarLoaded()){
      if (calendarLoadedCallback){
        calendarLoadedCallback();
        calendaLoadedCallback = undefined;
        document.removeEventListener('deviceready', checkCalendarLoadedRepeated);
      }
    }else{
      setTimeout(checkCalendarLoadedRepeated, 100);
    }
  }

  function isCalendarLoaded(){
    return window.plugins && window.plugins.calendar &&
           (typeof device !== 'undefined') && device && device.model;
  }

  return {
    isCalendarEnabled: function(){
      return packaging.endsWith('cordova');
    },
    registerCalendarLoadedCallback: function(callback){
      if (this.isCalendarEnabled()){
        if (isCalendarLoaded()) callback();
        else beginCalendarLoadedPoll(callback);
      }
    },
    getActiveCalendars: getActiveCalendars,
    setActiveCalendars: setActiveCalendars,
    activateCalendar: function(id, name){
      var activeCalendars = getActiveCalendars();
      if (activeCalendars){
        for (var i = 0; i < activeCalendars.length; i++) {
          if (activeCalendars[i].id === id) {
            return;
          }
        }
        activeCalendars.push({
          id: id,
          name: name
        });
        setActiveCalendars(activeCalendars);
        executeCalendarActivationChangedCallbacks();
        return true;
      }
    },
    deactivateCalendar: function(id){
      var activeCalendars = getActiveCalendars();
      if (activeCalendars){
        for (var i = activeCalendars.length-1; i >= 0; i--) {
          if (activeCalendars[i].id === id) {
            activeCalendars.splice(i, 1);
            setActiveCalendars(activeCalendars);
            executeCalendarActivationChangedCallbacks();
            return;
          }
        }
        return true;
      }
    },
    registerCalendarActivationChangedCallback: function(callback, id) {
      calendarActivationChangedCallbacks[id] = callback;
    }
  };
}
CalendarService['$inject'] = ['UISessionService', 'UserService', 'UserSessionService', 'packaging'];
angular.module('em.user').factory('CalendarService', CalendarService);

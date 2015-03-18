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

 function UserEditorController($http, $rootScope, $scope, $timeout, AnalyticsService, AuthenticationService,
                               BackendClientService, SwiperService, SynchronizeService, UISessionService,
                               UserService, UserSessionService) {

  if ($scope.mode === 'signUp'){
    $scope.user = {};
  }

  // AGENDA CALENDAR

  function listCalendars() {
    // TODO: get list from cache

    if (window.plugins && window.plugins.calendar) {

      var listCalendarsSuccess = function(calendars) {
        $timeout(function() {
          if (calendars && calendars.length) {
            var i;
            var calendarStates = UserSessionService.getUIPreference('calendars');
            var calendarStatesChanged;
            $scope.calendars = calendars;

            if (calendarStates) {
              // Previous states exists.
              for (i = 0; i < calendars.length; i++) {
                var savedCalendar = calendarStates.findFirstObjectByKeyValue('id', calendars[i].id);
                if (savedCalendar) {
                  $scope.calendars[i].enabled = savedCalendar.enabled;
                } else {
                  calendarStates.push({
                    id: calendars[i].id,
                    name: calendars[i].name
                  });
                  calendarStatesChanged = true;
                }
              }
            } else {
              // New states.
              calendarStates = [];
              for (i = 0; i < calendars.length; i++) {
                calendarStates.push({
                  id: calendars[i].id,
                  name: calendars[i].name
                });
              }
              calendarStatesChanged = true;
            }

            if (calendarStatesChanged) updateCalendars(calendarStates);
          }
          $scope.calendarsLoaded = true;
        }, 0);
      };
      var listCalendarsError = function(/*message*/) {
        // TODO
      };

      window.plugins.calendar.listCalendars(listCalendarsSuccess, listCalendarsError);
    }
  }

  $scope.toggleAgendaCalendar = function() {
    $scope.agendaCalendarEnabled = !$scope.agendaCalendarEnabled;
    UserSessionService.setUIPreference('showAgendaCalendar', $scope.agendaCalendarEnabled);
    UserService.saveAccountPreferences();
    if ($scope.agendaCalendarEnabled) listCalendars();
  };

  function updateCalendars(calendars){
    UserSessionService.setUIPreference('calendars', calendars);
    UserService.saveAccountPreferences();
  }

  $scope.toggleCalendarEnabled = function(id, name, enabled) {
    var calendarStates = UserSessionService.getUIPreference('calendars');
    if (!calendarStates) calendarStates = [];
      var calendarFound;
      for (var i = 0; i < calendarStates.length; i++) {
        if (calendarStates[i].id === id) {
          calendarFound = true;
          calendarStates[i].enabled = enabled;
        }
      }
    if (!calendarFound) {
      calendarStates.push({
        id: id,
        name: name,
        enabled: enabled
      });
    }

    updateCalendars(calendarStates);
  };

  if ($scope.mode === 'agendaCalendar') {
    $scope.agendaCalendarEnabled = UserSessionService.getUIPreference('showAgendaCalendar');
    if ($scope.agendaCalendarEnabled) listCalendars();
    if (!$scope.isOnboarded('agendaCalendar') && angular.isFunction($scope.registerEditorClosedCallback))
      $scope.registerEditorClosedCallback(agendaEditorClosed, 'UserEditorController');
  }
  function agendaEditorClosed() {
    $scope.setOnboarded('agenda', true);

    if (angular.isFunction($scope.unregisterEditorClosedCallback))
      $scope.unregisterEditorClosedCallback(agendaEditorClosed, 'UserEditorController');
  }

  $scope.changePassword = function (oldPassword, newPassword) {
    $scope.userEditOffline = false;
    $scope.changePasswordFailed = false;
    AuthenticationService.putChangePassword(UserSessionService.getEmail(), oldPassword, newPassword)
    .then(function(){
      // Need to relogin with new password
      AuthenticationService.login({username: UserSessionService.getEmail(),
        password: newPassword,
        remember: UserSessionService.isAuthenticateReplaceable()})
      .then(function(){
        $scope.closeEditor();
      });
    }, function(error){
      if (error.type === 'offline') {
        $scope.userEditOffline = true;
      } else if (error.type === 'forbidden') {
        $scope.changePasswordFailed = true;
      }
    });
  };

  // SIGN UP

  var userEditorEmailInputFocusCallbackFunction;
  $scope.registerUserEditorEmailInputCallbacks = function(focus){
    userEditorEmailInputFocusCallbackFunction = focus;
  };

  function userEditorOpened(){
    if ($scope.mode === 'signUp' && userEditorEmailInputFocusCallbackFunction){
      userEditorEmailInputFocusCallbackFunction();
    }
  }
  $scope.registerFeatureEditorOpenedCallback(userEditorOpened);

  $scope.signUpSwiperSlideChanged = function(slidePath/*, activeIndex*/){
    if (userEditorEmailInputFocusCallbackFunction && slidePath === 'signUp/main'){
      userEditorEmailInputFocusCallbackFunction();
    }
  };

  $scope.swipeToDetails = function(mode) {
    $scope.detailsMode = mode;
    if (mode === 'privacy'){
      $http.get('http://ext.md/privacy.html').then(function(privacyResponse){
        $scope.details = {html: privacyResponse.data};
        SwiperService.swipeTo('signUp/details');
        AnalyticsService.visit('privacy');
      });
    }else if (mode === 'terms') {
      $http.get('http://ext.md/terms.html').then(function(termsResponse){
        $scope.details = {html: termsResponse.data};
        SwiperService.swipeTo('signUp/details');
        AnalyticsService.visit('terms');
      });
    }
  };
  $scope.swipeToMain = function() {
    SwiperService.swipeTo('signUp/main');
  };

  $scope.signUp = function() {
    $scope.signupFailed = false;
    $scope.userEditOffline = false;
    $scope.loginFailed = false;
    $scope.signingUp = true;

    // Cohort is a random number between 1 and 128
    var randomCohort = Math.floor(Math.random() * 128) + 1;

    var payload = {email: $scope.user.username,
     password: $scope.user.password,
     cohort: randomCohort};

    AuthenticationService.signUp(payload).then(signUpSuccess, signUpFailed);
  };

  function signUpSuccess(response) {
    // Add sync user to the request queue to prevent problems authenticate response overriding
    // changes in offline queue
    SynchronizeService.synchronizeUser();

    // Register uuid change
    var oldUUID = UserSessionService.getUserUUID();
    SynchronizeService.notifyOwnerUUIDChange(oldUUID, response.uuid);
    UserSessionService.notifyOwnerUUIDChange(oldUUID, response.uuid);
    UISessionService.notifyOwnerUUIDChange(oldUUID, response.uuid);
    AnalyticsService.doWithUuid('signUp', oldUUID, response.uuid);
    if (UserSessionService.isPersistentStorageEnabled()){
      $scope.user.remember = true;
    }
    AuthenticationService.login($scope.user).then(
      function(response) {
        // Start executing all pending requests now
        BackendClientService.executeRequests();
        $scope.closeEditor();
        UISessionService.pushDelayedNotification({
          type: 'fyi',
          text: 'sign up successful'
        });
        $timeout(function() {
          UISessionService.activateDelayedNotifications();
        }, $rootScope.EDITOR_CLOSED_FAILSAFE_TIME);
      },
      function(error) {
        if (error.type === 'offline') {
          $scope.userEditOffline = true;
        } else if (error.type === 'forbidden') {
          $scope.loginFailed = true;
        }
        $scope.signingUp = false;
      }
    );
  }

  function signUpFailed(error) {
    if (error.type === 'offline') {
      $scope.signUpOffline = true;
    } else if (error.type === 'badRequest') {
      $scope.signupFailed = true;
    }
    $scope.signingUp = false;
  }
}

UserEditorController['$inject'] = ['$http', '$rootScope', '$scope', '$timeout', 'AnalyticsService',
'AuthenticationService', 'BackendClientService', 'SwiperService', 'SynchronizeService', 'UISessionService',
'UserService', 'UserSessionService'];
angular.module('em.user').controller('UserEditorController', UserEditorController);

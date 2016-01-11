/* Copyright 2013-2016 Extended Mind Technologies Oy
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

 function UserEditorController($rootScope, $scope, $timeout, AnalyticsService, AuthenticationService,
                               BackendClientService, ContentService, CalendarService, SwiperService,
                               SynchronizeService, UISessionService, UserService, UserSessionService) {

  // AGENDA CALENDAR

  function listCalendars() {

    if (window.plugins && window.plugins.calendar) {

      var listCalendarsSuccess = function(calendars) {
        if (calendars && calendars.length) {

          var activeCalendars = CalendarService.getActiveCalendars();
          var activeCalendarsUpdated = false;
          $scope.calendars = calendars;

          if (activeCalendars && activeCalendars.length) {
            // Previous active calendars exists.
            var i = activeCalendars.length;
            while (i--) {
              var calendarExists = calendars.findFirstObjectByKeyValue('id', activeCalendars[i].id);
              if (!calendarExists) {
                // Remove non-existing calendar.
                activeCalendars.splice(i, 1);
                activeCalendarsUpdated = true;
              }
            }

            for (i = 0; i < calendars.length; i++) {
              var savedActiveCalendar = activeCalendars.findFirstObjectByKeyValue('id', calendars[i].id);

              if (savedActiveCalendar) {
                $scope.calendars[i].enabled = true;
                if (savedActiveCalendar.name !== calendars[i].name) {
                  // Update saved calendar as it has changed
                  savedActiveCalendar.name = calendars[i].name;
                  activeCalendarsUpdated = true;
                }
              }
            }
          }

          if (activeCalendarsUpdated) CalendarService.setActiveCalendars(activeCalendars);
        }
        $scope.calendarsLoaded = true;
        if (!$scope.$$phase && !$rootScope.$$phase) {
          // Update UI
          $scope.$digest();
        }
      };
      var listCalendarsError = function(/*message*/) {
        // TODO
      };

      window.plugins.calendar.listCalendars(listCalendarsSuccess, listCalendarsError);
    }
  }

  $scope.toggleCalendarEnabled = function(id, name, enabled) {
    if (enabled){
      CalendarService.activateCalendar(id, name);
    }else{
      CalendarService.deactivateCalendar(id);
    }
  };

  if ($scope.mode === 'agendaCalendar') {
    listCalendars();
    if ($scope.isTutorialInProgress() && angular.isFunction($scope.registerFeatureEditorAboutToCloseCallback))
    {
      $scope.registerFeatureEditorAboutToCloseCallback(agendaEditorAboutToCloseWhileOnboardingFocusTasks,
                                                       'UserEditorController');
    }
  }

  function agendaEditorAboutToCloseWhileOnboardingFocusTasks() {
    if (angular.isFunction($scope.unregisterEditorAboutToCloseCallback)) {
      $scope.unregisterEditorAboutToCloseCallback('UserEditorController');
    }
    $scope.increaseOnboardingPhase('focus', 'tasks');
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

  $scope.changeEmail = function (newEmail, password) {
    $scope.userEditOffline = false;
    $scope.changeEmailFailed = false;
    $scope.changeEmailLoginFailed = false;
    AuthenticationService.putChangeEmail(UserSessionService.getEmail(), password, newEmail)
    .then(function(){
      // Need to relogin with new email
      AuthenticationService.login({username: newEmail,
        password: password,
        remember: UserSessionService.isAuthenticateReplaceable()})
      .then(function(){
        $scope.closeEditor();
        $timeout(function() {
          $scope.showVerifyEmailModal();
        }, $rootScope.EDITOR_CLOSED_FAILSAFE_TIME);
      }, function(){
        $scope.changeEmailLoginFailed = true;
      });
    }, function(error){
      if (error.type === 'offline') {
        $scope.userEditOffline = true;
      } else if (error.type === 'forbidden') {
        $scope.changeEmailFailed = true;
      }
    });
  };

  // SIGN UP / LOG IN

  var userEditorEmailInputFocusCallbackFunction;
  $scope.registerUserEditorEmailInputCallbacks = function(focus){
    userEditorEmailInputFocusCallbackFunction = focus;
  };

  function userEditorOpened(){
    if (($scope.mode === 'signUp' || $scope.mode === 'logIn') && userEditorEmailInputFocusCallbackFunction){
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
    if (mode === 'privacy' || mode === 'terms'){
      ContentService.getExternalHtml(mode).then(function(response){
        $scope.details = {html: response};
        SwiperService.swipeTo('signUp/details');
        AnalyticsService.visit(mode);
      });
    }
  };
  $scope.swipeToMain = function() {
    SwiperService.swipeTo('signUp/main');
  };

  $scope.signUp = function() {
    $rootScope.firstSyncInProgress = true;
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
    processUUIDChange(oldUUID, response.uuid);
    AnalyticsService.doWithUuid('signUp', oldUUID, response.uuid, true);
    if (UserSessionService.isPersistentStorageEnabled()){
      $scope.user.remember = true;
    }
    AuthenticationService.login($scope.user).then(
      function(/*response*/) {
        // Start executing all pending requests now
        BackendClientService.executeRequests();
        $scope.closeEditor();
        $timeout(function() {
          $scope.showVerifyEmailModal('account created');
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

  function processUUIDChange(oldUUID, newUUID){
    SynchronizeService.notifyOwnerUUIDChange(oldUUID, newUUID);
    UserSessionService.notifyOwnerUUIDChange(oldUUID, newUUID);
    UISessionService.notifyOwnerUUIDChange(oldUUID, newUUID);
  }

  function signUpFailed(error) {
    if (error.type === 'offline') {
      $scope.userEditOffline = true;
    } else if (error.type === 'badRequest') {
      $scope.signupFailed = true;
    }
    $scope.signingUp = false;
  }

  $scope.logIn = function() {
    $rootScope.firstSyncInProgress = true;
    $scope.userEditOffline = false;
    $scope.loginFailed = false;
    $scope.loggingIn = true;
    if (UserSessionService.isPersistentStorageEnabled()){
      $scope.user.remember = true;
    }
    var oldUUID = UserSessionService.getUserUUID();
    AuthenticationService.login($scope.user, processUUIDChange).then(
      function(response){
        // Remove user synchronization from the queue to prevent tutorial from starting again
        // for existing user
        SynchronizeService.clearUserUpdate();

        // Analytics
        AnalyticsService.doWithUuid('innerLogIn', oldUUID, response.userUUID, true);

        // Start executing all pending requests now
        BackendClientService.executeRequests();

        $scope.features.lists.resizeFix = true;
        $scope.features.focus.resizeFix = true;
        $scope.features.list.resizeFix = true;
        $scope.features.listInverse.resizeFix = true;

        $scope.closeEditor();
      },
      function(error){
        if (error.type === 'offline') {
          $scope.userEditOffline = true;
        } else if (error.type === 'badRequest') {
          $scope.loginFailed = true;
        }
        $scope.loggingIn = false;
      }
    );
  };

  // DELETE ACCOUNT

  $scope.deleteAccount = function(password) {
    $scope.deleteAccountFailed = false;
    $scope.userEditOffline = false;
    UserService.deleteAccount($scope.getUserEmail(), password).then(
      function(){
        // Go to login and show modal there
        // On error, emit redirectToEntry
        var deleteAccountInstructionNodes = [{
          type: 'text',
          data: 'if you have second thoughts, log back in immediately to reactivate your account'
        }];
        var deleteAccountModal = {
          messageHeading: 'account marked for deletion',
          messageIngress: 'all of your data will be destroyed within one hour',
          messageText: deleteAccountInstructionNodes,
          confirmText: 'got it'
        };
        $rootScope.$emit('emException', {type: 'redirectToEntry', modal: deleteAccountModal});
      }, function(error){
        if (error.type === 'offline') {
          $scope.userEditOffline = true;
        } else if (error.type === 'forbidden') {
          $scope.deleteAccountFailed = true;
        }
      });
  };
}

UserEditorController['$inject'] = ['$rootScope', '$scope', '$timeout', 'AnalyticsService',
'AuthenticationService', 'BackendClientService', 'ContentService', 'CalendarService', 'SwiperService',
'SynchronizeService', 'UISessionService', 'UserService', 'UserSessionService'];
angular.module('em.user').controller('UserEditorController', UserEditorController);

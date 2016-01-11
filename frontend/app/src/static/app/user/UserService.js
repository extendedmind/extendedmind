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

 function UserService(AuthenticationService, BackendClientService, UISessionService, UserSessionService) {

  var logoutRegex = /logout/;
  var postLogoutRegexp = new RegExp(
    /^/.source +
    BackendClientService.apiPrefixRegex.source +
    logoutRegex.source +
    /$/.source
    ),
  postClearRegexp = new RegExp(
    /^/.source +
    BackendClientService.apiPrefixRegex.source +
    /clear$/.source
    ),
  postResendVerificationRegexp = new RegExp(
    /^/.source +
    BackendClientService.apiPrefixRegex.source +
    /email\/resend$/.source
    ),
  deleteAccountRegexp = new RegExp(
    /^/.source +
    BackendClientService.apiPrefixRegex.source +
    /account$/.source
    );

  return {
    getAccount: function() {
      return BackendClientService.get('/api/account',
        this.getAccountRegex)
      .then(function(response) {
        UserSessionService.setEmail(response.email);
        UserSessionService.setEmailVerified(response.emailVerified);
        UserSessionService.setInboxId(response.inboxId);
        UserSessionService.setHandle(response.handle);
        UserSessionService.setDisplayName(response.displayName);
        UserSessionService.setTransportPreferences(response.preferences);
        UserSessionService.setAccessInformation(response.uuid, response.collectives, response.sharedLists);
        return response;
      });
    },
    saveAccountPreferences: function() {
      var payload = {
        preferences: UserSessionService.getTransportPreferences()
      };

      var displayName = UserSessionService.getDisplayName();
      if (displayName){
        payload.displayName = displayName;
      }
      var handle = UserSessionService.getHandle();
      if (handle){
        payload.handle = handle;
      }

      var params = {
        uuid: UserSessionService.getUserUUID(),
        replaceable: true,
        type: 'user'
      };
      BackendClientService.putOffline('/api/account', this.putAccountRegex, params, payload,
                               BackendClientService.generateFakeTimestamp());
    },
    logout: function() {
      // Bypass queue
      return BackendClientService.postOnline('/api/logout', postLogoutRegexp, undefined, false, true);
    },
    clear: function(user) {
      return BackendClientService.postOnlineWithUsernamePassword(
        '/api/clear',
        this.postClearRegex,
        undefined,
        AuthenticationService.sanitizeEmail(user.username),
        user.password);
    },
    resendVerification: function() {
      return BackendClientService.postOnline(
        '/api/email/resend',
        postResendVerificationRegexp);
    },
    deleteAccount: function(username, password) {
      return BackendClientService.deleteOnlineWithUsernamePassword(
        '/api/account',
        deleteAccountRegexp,
        undefined,
        username,
        password);
    },
    migrateUser: function(){
      /* migrate old onboarded value to 1.8-> values */
      var preferences = UserSessionService.getPreferences();
      if (preferences){
        var needToPersist = false;
        if (!preferences.onboarded || (preferences.onboarded && !angular.isObject(preferences.onboarded))){
          // Old/missing preferences value, migrate to new one
          var value = UISessionService.getOnboardedValue();
          preferences.onboarded = {
            user:value,
            focus:value,
            inbox:value,
            tasks:value,
            notes:value,
            lists:{active: value},
            list:value,
            trash:value,
            settings:value
          };
          needToPersist = true;
        }else {
          // prevent invalid states in onboarding
          if (angular.isObject(preferences.onboarded.focus) &&
              preferences.onboarded.focus.tasks === 2){
            preferences.onboarded.focus.tasks = 1;
            needToPersist = true;
          }
          if (preferences.onboarded.notes === 2){
            preferences.onboarded.notes = 1;
            needToPersist = true;
          }
          if (angular.isObject(preferences.onboarded.lists) &&
              preferences.onboarded.lists.active === 2){
            preferences.onboarded.lists.active = 1;
            needToPersist = true;
          }
        }
        if (preferences.ui){
          if (preferences.ui.hidePlus){
            delete preferences.ui.hidePlus;
            needToPersist = true;
          }
          if (preferences.ui.inboxOnboarded){
            delete preferences.ui.inboxOnboarded;
            needToPersist = true;
          }
          if (preferences.ui.focusTasksOnboarded){
            delete preferences.ui.focusTasksOnboarded;
            needToPersist = true;
          }
          if (preferences.ui.focusNotesOnboarded){
            delete preferences.ui.focusNotesOnboarded;
            needToPersist = true;
          }
          if (preferences.ui.showAgendaCalendar){
            delete preferences.ui.showAgendaCalendar;
            needToPersist = true;
          }
          if (preferences.ui.calendars && angular.isArray(preferences.ui.calendars)){
            // Old calendar preferences value, migrate to new one.
            delete preferences.ui.calendars;
            needToPersist = true;
          }
          if (preferences.ui.notesFirstLists){
            // these were moved to the list.ui field
            delete preferences.ui.notesFirstLists;
            needToPersist = true;
          }
        }
        if (needToPersist){
          UserSessionService.setPreferences(preferences);
          this.saveAccountPreferences();
        }
      }
    },
    // Regular expressions for account requests
    getAccountRegex: new RegExp(/api\/account/.source),
    putAccountRegex: new RegExp(/api\/account/.source),
    postLogoutRegex: postLogoutRegexp,
    postResendVerificationRegex: postResendVerificationRegexp,
    deleteAccountRegex: deleteAccountRegexp,
    putChangePasswordRegex: new RegExp(
      /^/.source +
      BackendClientService.apiPrefixRegex.source +
      /password$/.source),
    postClearRegex: postClearRegexp
  };
}
UserService['$inject'] = ['AuthenticationService', 'BackendClientService', 'UISessionService',
'UserSessionService'];
angular.module('em.user').factory('UserService', UserService);

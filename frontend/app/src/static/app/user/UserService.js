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
 'use strict';

 function UserService(AuthenticationService, BackendClientService, UISessionService, UserSessionService) {

  var postLogoutRegexp = new RegExp(
    '^' +
    BackendClientService.apiv2PrefixRegex.source +
    '/users/log_out$'
    ),
  postClearRegexp = new RegExp(
    '^' +
    BackendClientService.apiv2PrefixRegex.source +
    '/users/destroy_tokens$'
    ),
  postResendVerificationRegexp = new RegExp(
    '^' +
    BackendClientService.apiv2PrefixRegex.source +
    '/users/resend_verification$'
    ),
  deleteAccountRegexp = new RegExp(
    '^' +
    BackendClientService.apiv2PrefixRegex.source +
    '/users/' +
    BackendClientService.uuidRegex.source +
    '$'
  );

  return {
    storeUserAccountResponse: function(response){
      UserSessionService.setEmail(response.email);
      UserSessionService.setEmailVerified(response.emailVerified);
      UserSessionService.setInboxId(response.inboxId);
      UserSessionService.setHandle(response.handle);
      UserSessionService.setDisplayName(response.displayName);
      UserSessionService.setTransportPreferences(response.preferences);
      UserSessionService.setAccessInformation(response.uuid, response.collectives, response.sharedLists);
      return response;
    },
    getAccount: function(overrideUserUUID) {
      var userUUID = overrideUserUUID ? overrideUserUUID : UserSessionService.getUserUUID();
      var thisService = this;
      return BackendClientService.get('/api/v2/users/' + userUUID,
        this.getAccountRegex)
      .then(function(response) {
        return thisService.storeUserAccountResponse(response);
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
      BackendClientService.patchOffline('/api/v2/users/' + params.uuid, this.patchAccountRegex, params, payload,
                               BackendClientService.generateFakeTimestamp());
    },
    logout: function() {
      // Bypass queue
      return BackendClientService.postOnline('/api/v2/users/log_out', postLogoutRegexp, undefined, false, true);
    },
    clear: function(user) {
      return BackendClientService.postOnlineWithUsernamePassword(
        '/api/v2/users/destroy_tokens',
        this.postClearRegex,
        undefined,
        AuthenticationService.sanitizeEmail(user.username),
        user.password);
    },
    resendVerification: function() {
      return BackendClientService.postOnline(
        '/api/v2/users/resend_verification',
        postResendVerificationRegexp);
    },
    deleteAccount: function(username, password) {
      return BackendClientService.deleteOnlineWithUsernamePassword(
        '/api/v2/users/' + UserSessionService.getUserUUID(),
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
    getAccountRegex: new RegExp('^' +
                                BackendClientService.apiv2PrefixRegex.source +
                                '/users/' +
                                BackendClientService.uuidRegex.source +
                                '$'),
    patchAccountRegex: new RegExp('^' +
                                BackendClientService.apiv2PrefixRegex.source +
                                '/users/' +
                                BackendClientService.uuidRegex.source +
                                '$'),
    postLogoutRegex: postLogoutRegexp,
    postResendVerificationRegex: postResendVerificationRegexp,
    deleteAccountRegex: deleteAccountRegexp,
    postClearRegex: postClearRegexp
  };
}
UserService['$inject'] = ['AuthenticationService', 'BackendClientService', 'UISessionService',
'UserSessionService'];
angular.module('em.user').factory('UserService', UserService);

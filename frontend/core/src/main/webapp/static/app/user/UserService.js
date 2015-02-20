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

 function UserService(BackendClientService, UserSessionService) {

  var logoutRegex = /logout/;
  var postLogoutRegexp = new RegExp(
    /^/.source +
    BackendClientService.apiPrefixRegex.source +
    logoutRegex.source +
    /$/.source
    );

  return {
    getAccount: function() {
      return BackendClientService.get('/api/account',
        this.getAccountRegex)
      .then(function(response) {
        UserSessionService.setEmail(response.email);
        UserSessionService.setTransportPreferences(response.preferences);
        return response;
      });
    },
    saveAccountPreferences: function() {
      var payload = {
        preferences: UserSessionService.getTransportPreferences()
      };

      var params = {
        uuid: UserSessionService.getUserUUID(),
        replaceable: true,
        type: 'user'
      };
      BackendClientService.putOffline('/api/account', this.putAccountRegex, params, payload,
                               BackendClientService.generateFakeTimestamp());
    },
    logout: function() {
      return BackendClientService.postOnline('/api/logout', postLogoutRegexp);
    },
    // Regular expressions for account requests
    getAccountRegex: new RegExp(/api\/account/.source),
    putAccountRegex: new RegExp(/api\/account/.source),
    postLogoutRegex: postLogoutRegexp,
    putChangePasswordRegex: new RegExp(
      /^/.source +
      BackendClientService.apiPrefixRegex.source +
      /password$/.source)
  };
}
UserService['$inject'] = ['BackendClientService', 'UserSessionService'];
angular.module('em.user').factory('UserService', UserService);

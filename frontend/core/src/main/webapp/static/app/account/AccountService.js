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

 function AccountService(BackendClientService, UserSessionService) {

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
      .then(function(accountResponse) {
        if (accountResponse.status === 200 && accountResponse.data.email) {
          UserSessionService.setEmail(accountResponse.data.email);
          UserSessionService.setTransportPreferences(accountResponse.data.preferences);
        }
        return accountResponse.data;
      });
    },
    updateAccountPreferences: function() {
      var payload = {
        email: UserSessionService.getEmail(),
        preferences: UserSessionService.getTransportPreferences()
      };
      BackendClientService.putOnline('/api/account', this.putAccountRegex, payload);
    },
    logout: function() {
      return BackendClientService.postOnline('/api/logout', postLogoutRegexp).then(function(logoutResponse) {
        return logoutResponse.data;
      });
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
AccountService['$inject'] = ['BackendClientService', 'UserSessionService'];
angular.module('em.account').factory('AccountService', AccountService);

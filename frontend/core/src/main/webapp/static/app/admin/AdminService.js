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

 function AdminService(BackendClientService) {

  var adminRegex = /admin\//;

  var statisticsRegexp = new RegExp(
    /^/.source +
    BackendClientService.apiPrefixRegex.source +
    /admin$/.source
    );

  var usersRegexp = new RegExp(
    /^/.source +
    BackendClientService.apiPrefixRegex.source +
    adminRegex.source +
    /users$/.source
    );

  var invitesRegexp = new RegExp(
    /^/.source +
    BackendClientService.apiPrefixRegex.source +
    adminRegex.source +
    /invites$/.source
    );

  var inviteRequestsRegexp = new RegExp(
    /^/.source +
    BackendClientService.apiPrefixRegex.source +
    adminRegex.source +
    /invite\/requests$/.source
    );

  var acceptInviteRequestsRegexp = new RegExp(
    /^/.source +
    BackendClientService.apiPrefixRegex.source +
    adminRegex.source +
    /invite\/request\//.source +
    BackendClientService.uuidRegex.source +
    /\/accept$/.source
    );

  var deleteInviteRequestsRegexp = new RegExp(
    /^/.source +
    BackendClientService.apiPrefixRegex.source +
    adminRegex.source +
    /invite\/request\//.source +
    BackendClientService.uuidRegex.source
    );

  return {
    getStatistics: function() {
      return BackendClientService.get('/api/admin',
        statisticsRegexp, true);
    },
    getUsers: function() {
      return BackendClientService.get('/api/admin/users',
        usersRegexp, true);
    },
    getInvites: function() {
      return BackendClientService.get('/api/admin/invites',
        invitesRegexp, true);
    },
    getInviteRequests: function() {
      return BackendClientService.get('/api/admin/invite/requests',
        inviteRequestsRegexp, true);
    },
    acceptInviteRequest: function(inviteRequest) {
      return BackendClientService.postOnline('/api/admin/invite/request/' + inviteRequest.uuid + '/accept',
        acceptInviteRequestsRegexp, {}, true);
    },
    deleteInviteRequest: function(inviteRequest) {
      return BackendClientService.deleteOnline('/api/admin/invite/request/' + inviteRequest.uuid,
        deleteInviteRequestsRegexp, true);
    },

    // Regular expressions for admin requests
    statisticsRegex: statisticsRegexp,
    usersRegex: usersRegexp,
    invitesRegex: invitesRegexp,
    inviteRequestsRegex: inviteRequestsRegexp,
    acceptInviteRequestsRegex: acceptInviteRequestsRegexp,
    deleteInviteRequestsRegex: deleteInviteRequestsRegexp
  };
}
AdminService.$inject = ['BackendClientService'];
angular.module('em.services').factory('AdminService', AdminService);

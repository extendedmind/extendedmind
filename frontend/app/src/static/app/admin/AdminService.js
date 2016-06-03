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

 function AdminService(BackendClientService) {

  var adminRegex = /admin\//;

  var statisticsRegexp = new RegExp(
    /^/.source +
    BackendClientService.apiv2PrefixRegex.source +
    /admin$/.source
    );

  var ownersRegexp = new RegExp(
    /^/.source +
    BackendClientService.apiv2PrefixRegex.source +
    /owners$/.source
    );

  var destroyUserRegexp = new RegExp(
    /^/.source +
    BackendClientService.apiv2PrefixRegex.source +
    adminRegex.source +
    /users\//.source +
    BackendClientService.uuidRegex.source +
    '/destroy_user$'
    );

  return {
    getStatistics: function() {
      return BackendClientService.get('/api/v2/admin',
        statisticsRegexp, true);
    },
    getOwners: function() {
      return BackendClientService.get('/api/v2/owners',
        ownersRegexp, true);
    },
    destroyUser: function(user){
      return BackendClientService.postOnline('/api/v2/admin/users/' + user.uuid + '/destroy_user',
        destroyUserRegexp, true);
    },

    // Regular expressions for admin requests
    statisticsRegex: statisticsRegexp,
    ownersRegexp: ownersRegexp,
    destroyUserRegex: destroyUserRegexp
  };
}
AdminService['$inject'] = ['BackendClientService'];
angular.module('em.admin').factory('AdminService', AdminService);

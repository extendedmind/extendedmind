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

function MockAdminBackendService($httpBackend, AdminService) {

  function mockGetStatistics(){
    $httpBackend.whenGET(AdminService.statisticsRegex).respond(function() {
      var statisticsResponse = getJSONFixture('statisticsResponse.json');
      return [200, statisticsResponse];
    });
  }

  function mockGetUsers(){
    $httpBackend.whenGET(AdminService.usersRegex).respond(function() {
      var usersResponse = getJSONFixture('usersResponse.json');
      return [200, usersResponse];
    });
  }

  function mockDestroyUser(){
    $httpBackend.whenDELETE(AdminService.destroyUserRegex)
      .respond(function() {
        var destroyUserResponse = getJSONFixture('deleteUserResponse.json');
        return [200, destroyUserResponse];
      });
  }

  return {
    mockAdminBackend: function() {
      mockGetStatistics();
      mockGetUsers();
      mockDestroyUser();
    }
  };
}

MockAdminBackendService['$inject'] = ['$httpBackend', 'AdminService'];
angular.module('em.appTest').factory('MockAdminBackendService', MockAdminBackendService);

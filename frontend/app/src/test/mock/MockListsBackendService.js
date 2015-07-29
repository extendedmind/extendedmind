/* Copyright 2013-2015 Extended Mind Technologies Oy
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

 /*global angular, getJSONFixture */
 'use strict';

 function MockListsBackendService($httpBackend, ListsService, UUIDService) {

  function mockPutNewList(expectResponse){
    $httpBackend.whenPUT(ListsService.putNewListRegex)
    .respond(function(method, url, data, headers) {
      var putNewListResponse = getJSONFixture('putListResponse.json');
      putNewListResponse.created = putNewListResponse.modified = (new Date()).getTime();
      putNewListResponse.uuid = UUIDService.randomUUID();
      return expectResponse(method, url, data, headers, putNewListResponse);
    });
  }

  function mockPutExistingList(expectResponse){
    $httpBackend.whenPUT(ListsService.putExistingListRegex)
    .respond(function(method, url, data, headers) {
      var putExistingListResponse = getJSONFixture('putExistingListResponse.json');
      putExistingListResponse.modified = (new Date()).getTime();
      return expectResponse(method, url, data, headers, putExistingListResponse);
    });
  }

  function mockDeleteList(expectResponse){
    $httpBackend.whenDELETE(ListsService.deleteListRegex)
    .respond(function(method, url, data, headers) {
      var deleteListResponse = getJSONFixture('deleteListResponse.json');
      deleteListResponse.result.modified = (new Date()).getTime();
      return expectResponse(method, url, data, headers, deleteListResponse);
    });
  }

  function mockUndeleteList(expectResponse){
    $httpBackend.whenPOST(ListsService.undeleteListRegex)
    .respond(function(method, url, data, headers) {
      var undeleteListResponse = getJSONFixture('undeleteListResponse.json');
      undeleteListResponse.modified = (new Date()).getTime();
      return expectResponse(method, url, data, headers, undeleteListResponse);
    });
  }

  function mockArchiveList(expectResponse){
    $httpBackend.whenPOST(ListsService.archiveListRegex)
    .respond(function(method, url, data, headers) {
      var archiveListResponse = getJSONFixture('archiveListResponse.json');
      archiveListResponse.result.modified = (new Date()).getTime();
      archiveListResponse.archived = Date.now();

      var randomlyOffline = Math.floor((Math.random() * 10) + 1) < 2;
      // There is a 10% change we are offline.
      if (!randomlyOffline) {
        return expectResponse(method, url, data, headers, archiveListResponse);
      } else {
        return [404];
      }
    });
  }

  function mockUnarchiveList(expectResponse){
    $httpBackend.whenPOST(ListsService.unarchiveListRegex)
    .respond(function(method, url, data, headers) {
      var unarchiveListResponse = getJSONFixture('unarchiveListResponse.json');
      unarchiveListResponse.result.modified = (new Date()).getTime();
      return expectResponse(method, url, data, headers, unarchiveListResponse);
    });
  }

  function mockPutNewAgreement(expectResponse) {
    $httpBackend.whenPUT(ListsService.putNewAgreementRegex)
    .respond(function(method, url, data, headers) {
      var putNewAgreementResponse = getJSONFixture('putNewAgreementResponse.json');
      putNewAgreementResponse.created = putNewAgreementResponse.modified = Date.now();
      return expectResponse(method, url, data, headers, putNewAgreementResponse);
    });
  }

  function mockPostChangeAgreementAccess(expectResponse) {
    $httpBackend.whenPOST(ListsService.postChangeAgreementAccessRegex)
    .respond(function(method, url, data, headers) {
      var postChangeAgreementAccessResponse = getJSONFixture('changeAgreementAccessResponse.json');
      postChangeAgreementAccessResponse.modified = Date.now();
      return expectResponse(method, url, data, headers, postChangeAgreementAccessResponse);
    });
  }

  function mockDeleteAgreement(expectResponse) {
    $httpBackend.whenDELETE(ListsService.deleteAgreementRegex)
    .respond(function(method, url, data, headers) {
      var deleteAgreementResponse = getJSONFixture('deleteAgreementResponse.json');
      deleteAgreementResponse.modified =  Date.now();
      return expectResponse(method, url, data, headers, deleteAgreementResponse);
    });
  }

  return {
    mockListsBackend: function(expectResponse) {
      mockPutNewList(expectResponse);
      mockPutExistingList(expectResponse);
      mockDeleteList(expectResponse);
      mockUndeleteList(expectResponse);
      mockArchiveList(expectResponse);
      mockUnarchiveList(expectResponse);
      mockPutNewAgreement(expectResponse);
      mockPostChangeAgreementAccess(expectResponse);
      mockDeleteAgreement(expectResponse);
    }
  };
}

MockListsBackendService['$inject'] = ['$httpBackend', 'ListsService', 'UUIDService'];
angular.module('em.appTest').factory('MockListsBackendService', MockListsBackendService);

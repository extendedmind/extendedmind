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

 /*global angular, getJSONFixture */
 'use strict';

 function MockConvertBackendService($httpBackend, ConvertService) {

  function mockConvertTaskToNote(expectResponse) {
    $httpBackend.whenPOST(ConvertService.convertTaskToNoteRegex)
    .respond(function(method, url, data, headers) {
      var convertTaskToNoteResponse = getJSONFixture('taskToNoteResponse.json');
      convertTaskToNoteResponse.modified = Date.now();
      return expectResponse(method, url, data, headers, convertTaskToNoteResponse);
    });
  }

  function mockConvertTaskToList(expectResponse) {
    $httpBackend.whenPOST(ConvertService.convertTaskToListRegex)
    .respond(function(method, url, data, headers) {
      var convertTaskToListResponse = getJSONFixture('taskToListResponse.json');
      convertTaskToListResponse.modified = Date.now();
      return expectResponse(method, url, data, headers, convertTaskToListResponse);
    });
  }

  function mockConvertNoteToTask(expectResponse) {
    $httpBackend.whenPOST(ConvertService.convertNoteToTaskRegex)
    .respond(function(method, url, data, headers) {
      var convertNoteToTaskResponse = getJSONFixture('noteToTaskResponse.json');
      convertNoteToTaskResponse.modified = Date.now();
      return expectResponse(method, url, data, headers, convertNoteToTaskResponse);
    });
  }

  function mockConvertNoteToList(expectResponse) {
    $httpBackend.whenPOST(ConvertService.convertNoteToListRegex)
    .respond(function(method, url, data, headers) {
      var convertNoteToListResponse = getJSONFixture('noteToListResponse.json');
      convertNoteToListResponse.modified = Date.now();
      return expectResponse(method, url, data, headers, convertNoteToListResponse);
    });
  }

  function mockConvertListToTask(expectResponse) {
    $httpBackend.whenPOST(ConvertService.convertListToTaskRegex)
    .respond(function(method, url, data, headers) {
      var convertListToTaskResponse = getJSONFixture('listToTaskResponse.json');
      convertListToTaskResponse.modified = Date.now();
      return expectResponse(method, url, data, headers, convertListToTaskResponse);
    });
  }

  function mockConvertListToNote(expectResponse) {
    $httpBackend.whenPOST(ConvertService.convertListToNoteRegex)
    .respond(function(method, url, data, headers) {
      var convertListToNoteResponse = getJSONFixture('listToNoteResponse.json');
      convertListToNoteResponse.modified = Date.now();
      return expectResponse(method, url, data, headers, convertListToNoteResponse);
    });
  }

  return {
    mockConvertBackend: function(expectResponse) {
      mockConvertTaskToNote(expectResponse);
      mockConvertTaskToList(expectResponse);
      mockConvertNoteToTask(expectResponse);
      mockConvertNoteToList(expectResponse);
      mockConvertListToTask(expectResponse);
      mockConvertListToNote(expectResponse);
    }
  };
}

MockConvertBackendService.$inject = ['$httpBackend', 'ConvertService'];
angular.module('em.appTest').factory('MockConvertBackendService', MockConvertBackendService);

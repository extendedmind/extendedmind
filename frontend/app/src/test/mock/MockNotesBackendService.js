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

 /*global angular, getJSONFixture */
 'use strict';

 function MockNotesBackendService($httpBackend, NotesService, UUIDService) {

  function mockPutNewNote(expectResponse){
    $httpBackend.whenPUT(NotesService.putNewNoteRegex)
    .respond(function(method, url, data, headers) {
      var putNewNoteResponse = getJSONFixture('putNoteResponse.json');
      putNewNoteResponse.uuid = UUIDService.randomUUID();
      putNewNoteResponse.created = putNewNoteResponse.modified = (new Date()).getTime();
      return expectResponse(method, url, data, headers, putNewNoteResponse);
    });
  }

  function mockPutExistingNote(expectResponse){
    $httpBackend.whenPUT(NotesService.putExistingNoteRegex)
    .respond(function(method, url, data, headers) {
      var putExistingNoteResponse = getJSONFixture('putExistingNoteResponse.json');
      putExistingNoteResponse.modified = (new Date()).getTime();
      return expectResponse(method, url, data, headers, putExistingNoteResponse);
    });
  }

  function mockFavoriteNote(expectResponse){
    $httpBackend.whenPOST(NotesService.favoriteNoteRegex)
    .respond(function(method, url, data, headers) {
      var favoriteNoteResponse = getJSONFixture('favoriteNoteResponse.json');
      favoriteNoteResponse.favorited = (new Date()).getTime();
      favoriteNoteResponse.result.modified = (new Date()).getTime();
      return expectResponse(method, url, data, headers, favoriteNoteResponse);
    });
  }

  function mockUnfavoriteNote(expectResponse){
    $httpBackend.whenPOST(NotesService.unfavoriteNoteRegex)
    .respond(function(method, url, data, headers) {
      var unfavoriteNoteResponse = getJSONFixture('unfavoriteNoteResponse.json');
      unfavoriteNoteResponse.modified = (new Date()).getTime();
      return expectResponse(method, url, data, headers, unfavoriteNoteResponse);
    });
  }

  function mockDeleteNote(expectResponse){
    $httpBackend.whenDELETE(NotesService.deleteNoteRegex)
    .respond(function(method, url, data, headers) {
      var deleteNoteResponse = getJSONFixture('deleteNoteResponse.json');
      deleteNoteResponse.result.modified = (new Date()).getTime();
      return expectResponse(method, url, data, headers, deleteNoteResponse);
    });
  }

  function mockUndeleteNote(expectResponse){
    $httpBackend.whenPOST(NotesService.undeleteNoteRegex)
    .respond(function(method, url, data, headers) {
      var undeleteNoteResponse = getJSONFixture('undeleteNoteResponse.json');
      undeleteNoteResponse.modified = (new Date()).getTime();
      return expectResponse(method, url, data, headers, undeleteNoteResponse);
    });
  }

  function mockPreviewNote(expectResponse){
    $httpBackend.whenPOST(NotesService.previewNoteRegex)
    .respond(function(method, url, data, headers) {
      var previewNoteResponse = getJSONFixture('previewNoteResponse.json');
      previewNoteResponse.previewExpires = Date.now() + 3600000;
      previewNoteResponse.result.modified = (new Date()).getTime();
      return expectResponse(method, url, data, headers, previewNoteResponse);
    });
  }

  function mockPublishNote(expectResponse){
    $httpBackend.whenPOST(NotesService.publishNoteRegex)
    .respond(function(method, url, data, headers) {
      var publishNoteResponse = getJSONFixture('publishNoteResponse.json');
      publishNoteResponse.published = Date.now();
      publishNoteResponse.result.modified = (new Date()).getTime();
      return expectResponse(method, url, data, headers, publishNoteResponse);
    });
  }

  function mockUnpublishNote(expectResponse){
    $httpBackend.whenPOST(NotesService.publishNoteRegex)
    .respond(function(method, url, data, headers) {
      var unpublishNoteResponse = getJSONFixture('unpublishNoteResponse.json');
      unpublishNoteResponse.modified = Date.now();
      return expectResponse(method, url, data, headers, unpublishNoteResponse);
    });
  }

  return {
    mockNotesBackend: function(expectResponse) {
      mockPutNewNote(expectResponse);
      mockPutExistingNote(expectResponse);
      mockFavoriteNote(expectResponse);
      mockUnfavoriteNote(expectResponse);
      mockDeleteNote(expectResponse);
      mockUndeleteNote(expectResponse);
      mockPreviewNote(expectResponse);
      mockPublishNote(expectResponse);
      mockUnpublishNote(expectResponse);
    }
  };
}

MockNotesBackendService['$inject'] = ['$httpBackend', 'NotesService', 'UUIDService'];
angular.module('em.appTest').factory('MockNotesBackendService', MockNotesBackendService);

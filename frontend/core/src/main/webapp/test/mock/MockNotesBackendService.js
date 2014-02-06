/*global angular, getJSONFixture */
'use strict';

function MockNotesBackendService($httpBackend, NotesService, UUIDService) {

  function mockPutNewNote(expectResponse){
    $httpBackend.whenPUT(NotesService.putNewNoteRegex)
      .respond(function(method, url, data, headers) {
        var putNewNoteResponse = getJSONFixture('putNoteResponse.json');
        putNewNoteResponse.uuid = UUIDService.randomUUID();
        putNewNoteResponse.modified = (new Date()).getTime();
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


  return {
    mockNotesBackend: function(expectResponse) {
      mockPutNewNote(expectResponse);
      mockPutExistingNote(expectResponse);
      mockDeleteNote(expectResponse);
      mockUndeleteNote(expectResponse);
    }
  };
}

MockNotesBackendService.$inject = ['$httpBackend', 'NotesService', 'UUIDService'];
angular.module('em.appTest').factory('MockNotesBackendService', MockNotesBackendService);

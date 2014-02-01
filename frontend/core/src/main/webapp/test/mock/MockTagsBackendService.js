/*global angular, getJSONFixture, sessionStorage */
'use strict';

function MockTagsBackendService($httpBackend, TagsService, UUIDService) {  

  function mockPutNewTag(expectResponse){
    $httpBackend.whenPUT(TagsService.putNewTagRegex)
      .respond(function(method, url, data, headers) {
        var putNewTagResponse = getJSONFixture('putTagResponse.json');
        putNewTagResponse.uuid = UUIDService.randomUUID();
        return expectResponse(method, url, data, headers, putNewTagResponse);
      });
  };
  
  function mockPutExistingTag(expectResponse){
    $httpBackend.whenPUT(TagsService.putExistingTagRegex)
      .respond(function(method, url, data, headers) {
        var putExistingTagResponse = getJSONFixture('putExistingTagResponse.json');
        return expectResponse(method, url, data, headers, putExistingTagResponse);
      });
  };

  return {
    mockTagsBackend: function(expectResponse) {
      mockPutNewTag(expectResponse);
      mockPutExistingTag(expectResponse);
    }
  };
};

MockTagsBackendService.$inject = ['$httpBackend', 'TagsService', 'UUIDService'];
angular.module('em.appTest').factory('MockTagsBackendService', MockTagsBackendService);

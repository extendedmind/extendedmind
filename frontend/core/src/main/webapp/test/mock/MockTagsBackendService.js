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

 /*global angular, getJSONFixture, sessionStorage */
'use strict';

function MockTagsBackendService($httpBackend, TagsService, UUIDService) {

  function mockPutNewTag(expectResponse){
    $httpBackend.whenPUT(TagsService.putNewTagRegex)
      .respond(function(method, url, data, headers) {
        var putNewTagResponse = getJSONFixture('putTagResponse.json');
        putNewTagResponse.uuid = UUIDService.randomUUID();
        putNewTagResponse.created = putNewTagResponse.modified = (new Date()).getTime();
        return expectResponse(method, url, data, headers, putNewTagResponse);
      });
  };

  function mockPutExistingTag(expectResponse){
    $httpBackend.whenPUT(TagsService.putExistingTagRegex)
      .respond(function(method, url, data, headers) {
        var putExistingTagResponse = getJSONFixture('putExistingTagResponse.json');
        putExistingTagResponse.modified = (new Date()).getTime();
        return expectResponse(method, url, data, headers, putExistingTagResponse);
      });
  };

  function mockDeleteTag(expectResponse){
    $httpBackend.whenDELETE(TagsService.deleteTagRegex)
      .respond(function(method, url, data, headers) {
        var deleteTagResponse = getJSONFixture('deleteTagResponse.json');
        deleteTagResponse.result.modified = (new Date()).getTime();
        return expectResponse(method, url, data, headers, deleteTagResponse);
      });
  };

  function mockUndeleteTag(expectResponse){
    $httpBackend.whenPOST(TagsService.undeleteTagRegex)
      .respond(function(method, url, data, headers) {
        var undeleteTagResponse = getJSONFixture('undeleteTagResponse.json');
        undeleteTagResponse.modified = (new Date()).getTime();
        return expectResponse(method, url, data, headers, undeleteTagResponse);
      });
  };

  return {
    mockTagsBackend: function(expectResponse) {
      mockPutNewTag(expectResponse);
      mockPutExistingTag(expectResponse);
      mockDeleteTag(expectResponse);
      mockUndeleteTag(expectResponse);
    }
  };
};

MockTagsBackendService['$inject'] = ['$httpBackend', 'TagsService', 'UUIDService'];
angular.module('em.appTest').factory('MockTagsBackendService', MockTagsBackendService);

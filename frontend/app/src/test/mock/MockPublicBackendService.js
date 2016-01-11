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

 /*global angular, getJSONFixture */
 'use strict';

 function MockPublicBackendService($httpBackend, ContentService) {

  function mockGetExtendedMindNote(){
    $httpBackend.whenGET(ContentService.publicExtendedMindNoteRegex)
    .respond(function(method, url, data, headers) {
      var publicItemResponse = getJSONFixture('publicItemResponse.json');
      var rhythmPosition = publicItemResponse.note.content.indexOf('## rhythm')
      if (rhythmPosition > 0){
        var beginningContent = publicItemResponse.note.content.substr(0, rhythmPosition + 11)
        var endContent = publicItemResponse.note.content.substr(
              rhythmPosition+11,
              publicItemResponse.note.content.length-beginningContent.length-1)
        publicItemResponse.note.content = beginningContent +
          '![logo](/static/img/logo-text.png)\n\n[external-link](https://ext.md)\n' + endContent;
      }
      return [200, publicItemResponse];
    });
  }
  return {
    mockPublicBackend: function() {
      mockGetExtendedMindNote();
    }
  };
}

MockPublicBackendService['$inject'] = ['$httpBackend', 'ContentService', 'UUIDService'];
angular.module('em.appTest').factory('MockPublicBackendService', MockPublicBackendService);

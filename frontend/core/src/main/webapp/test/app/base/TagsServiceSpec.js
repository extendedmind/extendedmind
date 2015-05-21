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

describe('TagsService', function() {

  // INJECTS

  var $httpBackend;
  var TagsService, BackendClientService, HttpClientService, UserSessionService;

  // MOCKS

  var now = new Date();
  var putNewTagResponse = getJSONFixture('putTagResponse.json');
  putNewTagResponse.modified = now.getTime();
  var putExistingTagResponse = getJSONFixture('putExistingTagResponse.json');
  putExistingTagResponse.modified = now.getTime();
  var deleteTagResponse = getJSONFixture('deleteTagResponse.json');
  deleteTagResponse.result.modified = now.getTime();
  var undeleteTagResponse = getJSONFixture('undeleteTagResponse.json');
  undeleteTagResponse.modified = now.getTime();

  var testOwnerUUID = '6be16f46-7b35-4b2d-b875-e13d19681e77';

  var MockUUIDService = {
    mockIndex: 0,
    mockFakeUUIDs: ['00000000-0000-4629-8552-96671b730000',
                    '00000000-0000-4629-8552-96671b730001',
                    '00000000-0000-4629-8552-96671b730002',
                    '00000000-0000-4629-8552-96671b730003'],
    s4: function(){
      return Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
    },
    randomUUID: function() {
      return this.s4() + this.s4() + '-' + this.s4() + '-' + this.s4() + '-' +
      this.s4() + '-' + this.s4() + this.s4() + this.s4();
    },
    generateFakeUUID: function() {
      var mockFakeUUID = this.mockFakeUUIDs[this.mockIndex];
      this.mockIndex++;
      return mockFakeUUID;
    },
    isFakeUUID: function(uuid) {
      if (uuid && uuid.startsWith('00000000-0000-'))
        return true;
    },
    getShortIdFromFakeUUID: function(fakeUUID) {
      return fakeUUID.substr(14, 4) + fakeUUID.substr(19, 4) + fakeUUID.substr(24, 12);
    },
  };

  // SETUP / TEARDOWN

  beforeEach(function() {
    module('em.appTest');

    module('common', function($provide){
      $provide.constant('UUIDService', MockUUIDService);
    });

    inject(function (_$httpBackend_, _TagsService_, _BackendClientService_, _HttpClientService_,
                     _UserSessionService_) {
      $httpBackend = _$httpBackend_;
      TagsService = _TagsService_;
      BackendClientService = _BackendClientService_;
      HttpClientService = _HttpClientService_;
      UserSessionService = _UserSessionService_;
      UserSessionService.executeNotifyOwnerCallbacks(testOwnerUUID);

      TagsService.setTags(
        [{
          'uuid': '1208d45b-3b8c-463e-88f3-f7ef19ce87cd',
          'created': 1391066914167,
          'modified': 1391066914167,
          'title': 'home',
          'tagType': 'context'
        }, {
          'uuid': '81daf688-d34d-4551-9a24-564a5861ace9',
          'created': 1391066914032,
          'modified': 1391066914032,
          'title': 'email',
          'tagType': 'context',
          'parent': 'e1bc540a-97fe-4c9f-9a44-ffcd7a8563e8'
        }, {
          'uuid': 'c933e120-90e7-488b-9f15-ea2ee2887e67',
          'created': 1391066914132,
          'modified': 1391066914132,
          'title': 'secret',
          'tagType': 'keyword'
        }], testOwnerUUID);
    });

    var sessionStore = {};
    spyOn(sessionStorage, 'getItem').andCallFake(function(key) {
      return sessionStore[key];
    });
    spyOn(sessionStorage, 'setItem').andCallFake(function(key, value) {
      sessionStore[key] = value + '';
    });
    spyOn(sessionStorage, 'removeItem').andCallFake(function(key) {
      delete sessionStore[key];
    });
    spyOn(sessionStorage, 'clear').andCallFake(function() {
      sessionStore = {};
    });
  });

afterEach(function() {
  $httpBackend.verifyNoOutstandingExpectation();
  $httpBackend.verifyNoOutstandingRequest();
});

  // TESTS

  it('should get tags', function () {
    var tags = TagsService.getTags(testOwnerUUID);
    expect(tags.length)
    .toBe(3);
    // Tags should be in modified order
    expect(tags[0].title).toBe('email');
    expect(tags[1].title).toBe('secret');
    expect(tags[2].title).toBe('home');
  });

  it('should find tag by uuid', function () {
    expect(TagsService.getTagInfo('81daf688-d34d-4551-9a24-564a5861ace9', testOwnerUUID).tag)
    .toBeDefined();
  });

  it('should not find tag by unknown uuid', function () {
    expect(TagsService.getTagInfo('bf726d03-8fee-4614-8b68-f9f885938a50', testOwnerUUID))
    .toBeUndefined();
  });

  it('should save new tag', function () {
    var testTagValues = {id: MockUUIDService.getShortIdFromFakeUUID(MockUUIDService.mockFakeUUIDs[0]),
                         title: 'test tag', tagType: 'keyword'};
    var testTag = TagsService.getNewTag(testTagValues, testOwnerUUID);
    $httpBackend.expectPUT('/api/' + testOwnerUUID + '/tag', testTagValues)
      .respond(200, putNewTagResponse);
    TagsService.saveTag(testTag);
    $httpBackend.flush();
    expect(TagsService.getTagInfo(MockUUIDService.mockFakeUUIDs[0], testOwnerUUID)).toBeDefined();

    // Should go to the end of the array
    var tags = TagsService.getTags(testOwnerUUID);
    expect(tags.length)
      .toBe(4);
    expect(tags[3].trans.uuid)
      .toBe(MockUUIDService.mockFakeUUIDs[0]);
    expect(tags[3].trans.title)
      .toBe('test tag');
    expect(tags[3].mod)
      .toBeDefined();
  });

  it('should update existing tag', function () {
    var secret = TagsService.getTagInfo('c933e120-90e7-488b-9f15-ea2ee2887e67', testOwnerUUID).tag;
    secret.trans.title = 'top secret';
    $httpBackend.expectPUT('/api/' + testOwnerUUID + '/tag/' + secret.uuid,
                           {title: secret.trans.title,
                            tagType: secret.tagType,
                            modified: secret.modified})
    .respond(200, putExistingTagResponse);
    TagsService.saveTag(secret);
    $httpBackend.flush();
    expect(TagsService.getTagInfo(secret.uuid, testOwnerUUID).tag.mod.modified)
      .toBeGreaterThan(secret.modified);

    // Should not change places
    var tags = TagsService.getTags(testOwnerUUID);
    expect(tags.length)
    .toBe(3);
    expect(tags[1].uuid)
    .toBe(secret.uuid);
    expect(tags[1].mod.title)
      .toBe('top secret');
    expect(tags[1].mod)
      .toBeDefined();
  });

  it('should delete and undelete tag', function () {
    var secret = TagsService.getTagInfo('c933e120-90e7-488b-9f15-ea2ee2887e67', testOwnerUUID).tag;
    $httpBackend.expectDELETE('/api/' + testOwnerUUID + '/tag/' + secret.uuid)
    .respond(200, deleteTagResponse);
    TagsService.deleteTag(secret);
    $httpBackend.flush();
    expect(TagsService.getTagInfo(secret.uuid, testOwnerUUID).type)
    .toBe('deleted');

    // There should be just two left
    var tags = TagsService.getTags(testOwnerUUID);
    expect(tags.length)
    .toBe(2);

    // Undelete the tag
    $httpBackend.expectPOST('/api/' + testOwnerUUID + '/tag/' + secret.uuid + '/undelete')
    .respond(200, undeleteTagResponse);
    TagsService.undeleteTag(secret);
    $httpBackend.flush();
    expect(TagsService.getTagInfo(secret.uuid, testOwnerUUID).tag.mod.modified)
      .toBeGreaterThan(secret.modified);

    // There should be three left with the undeleted secret in its old place
    tags = TagsService.getTags(testOwnerUUID);
    expect(tags.length)
    .toBe(3);
    expect(tags[1].uuid)
    .toBe(secret.uuid);
  });
});

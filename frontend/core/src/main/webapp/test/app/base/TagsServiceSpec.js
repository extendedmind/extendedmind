/*global beforeEach, getJSONFixture, module, inject, describe, afterEach, it, expect */
'use strict';

describe('TagService', function() {

  // INJECTS 

  var $httpBackend;
  var TagsService, BackendClientService, HttpBasicAuthenticationService, HttpClientService;

  // TEST DATA

  var now = new Date;
  var putNewTagResponse = getJSONFixture('putTagResponse.json');
  putNewTagResponse.modified = now.getTime();
  var putExistingTagResponse = getJSONFixture('putExistingTagResponse.json');
  putExistingTagResponse.modified = now.getTime();
  var deleteTagResponse = getJSONFixture('deleteTagResponse.json');
  deleteTagResponse.result.modified = now.getTime();
  var undeleteTagResponse = getJSONFixture('undeleteTagResponse.json');
  undeleteTagResponse.modified = now.getTime();

  var MockUserSessionService = {
      getCredentials: function () {
        return '123456789';
      },
      getActiveUUID: function () {
        return '6be16f46-7b35-4b2d-b875-e13d19681e77';
      }
    };
  var testTagData = [{
      'uuid': '1208d45b-3b8c-463e-88f3-f7ef19ce87cd',
      'modified': 1391066914167,
      'title': 'home',
      'tagType': 'context'
    }, {
      'uuid': '81daf688-d34d-4551-9a24-564a5861ace9',
      'modified': 1391066914032,
      'title': 'email',
      'tagType': 'context',
      'parent': 'e1bc540a-97fe-4c9f-9a44-ffcd7a8563e8'
    }, {
      'uuid': 'c933e120-90e7-488b-9f15-ea2ee2887e67',
      'modified': 1391066914132,
      'title': 'secret',
      'tagType': 'keyword'
    }];

  // SETUP / TEARDOWN

  beforeEach(function() {
    module('em.appTest');

    module('em.services', function ($provide){
      $provide.value('UserSessionService', MockUserSessionService);
    });

    inject(function (_$httpBackend_, _TagsService_, _BackendClientService_, _HttpBasicAuthenticationService_, _HttpClientService_) {
      $httpBackend = _$httpBackend_;
      TagsService = _TagsService_;
      BackendClientService = _BackendClientService_;
      HttpBasicAuthenticationService = _HttpBasicAuthenticationService_;
      HttpClientService = _HttpClientService_;
      TagsService.setTags(testTagData);
    });
  });


  afterEach(function() {
     $httpBackend.verifyNoOutstandingExpectation();
     $httpBackend.verifyNoOutstandingRequest();
   });

  // TESTS

  it('should get tags', function () {
    var tags = TagsService.getTags();
    expect(tags.length)
      .toBe(3);
    // Tags should be in modified order
    expect(tags[0].title).toBe('email');
    expect(tags[1].title).toBe('secret');
    expect(tags[2].title).toBe('home');
  });

  it('should find tag by uuid', function () {
    expect(TagsService.getTagByUUID('81daf688-d34d-4551-9a24-564a5861ace9'))
      .toBeDefined();
  });

  it('should not find tag by unknown uuid', function () {
    expect(TagsService.getTagByUUID('bf726d03-8fee-4614-8b68-f9f885938a50'))
      .toBeUndefined();
  });

  it('should save new tag', function () {
    var testTag = {
      'title': 'test tag'
    };
    $httpBackend.expectPUT('/api/' + MockUserSessionService.getActiveUUID() + '/tag', testTag)
       .respond(200, putNewTagResponse);
    TagsService.saveTag(testTag);
    $httpBackend.flush();
    expect(TagsService.getTagByUUID(putNewTagResponse.uuid))
      .toBeDefined();

    // Should go to the end of the array
    var tags = TagsService.getTags();
    expect(tags.length)
      .toBe(4);
    expect(tags[3].uuid)
      .toBe(putNewTagResponse.uuid);
  });

  it('should update existing tag', function () {
    var secret = TagsService.getTagByUUID('c933e120-90e7-488b-9f15-ea2ee2887e67');
    secret.title = 'top secret';
    $httpBackend.expectPUT('/api/' + MockUserSessionService.getActiveUUID() + '/tag/' + secret.uuid, secret)
       .respond(200, putExistingTagResponse);
    TagsService.saveTag(secret);
    $httpBackend.flush();
    expect(TagsService.getTagByUUID(secret.uuid).modified)
      .toBe(putExistingTagResponse.modified);

    // Should move to the end of the array
    var tags = TagsService.getTags();
    expect(tags.length)
      .toBe(3);
    expect(tags[2].uuid)
      .toBe(secret.uuid);
  });

  it('should delete and undelete tag', function () {
    var secret = TagsService.getTagByUUID('c933e120-90e7-488b-9f15-ea2ee2887e67');
    $httpBackend.expectDELETE('/api/' + MockUserSessionService.getActiveUUID() + '/tag/' + secret.uuid)
       .respond(200, deleteTagResponse);
    TagsService.deleteTag(secret);
    $httpBackend.flush();
    expect(TagsService.getTagByUUID(secret.uuid))
      .toBeUndefined();

    // There should be just two left
    var tags = TagsService.getTags();
    expect(tags.length)
      .toBe(2);

    // Undelete the tag
    $httpBackend.expectPOST('/api/' + MockUserSessionService.getActiveUUID() + '/tag/' + secret.uuid + '/undelete')
       .respond(200, undeleteTagResponse);
    TagsService.undeleteTag(secret);
    $httpBackend.flush();
    expect(TagsService.getTagByUUID(secret.uuid).modified)
      .toBe(undeleteTagResponse.modified);

    // There should be three left with the undeleted secret the last
    tags = TagsService.getTags();
    expect(tags.length)
      .toBe(3);
    expect(tags[2].uuid)
      .toBe(secret.uuid);
  });

});

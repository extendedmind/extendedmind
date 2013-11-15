/*global beforeEach, inject, describe, it, expect */
/*jslint white: true */
'use strict';

beforeEach(module('em.app'));

describe('NotesController', function() {
  beforeEach(module('em.services', 'em.mockHelpers'));

  var $controller, $scope, mockHttpBackendResponse, slide;

  beforeEach(inject(function(_$controller_, _$rootScope_, _mockHttpBackendResponse_) {
    mockHttpBackendResponse = _mockHttpBackendResponse_;

    $scope = _$rootScope_.$new();
    $controller = _$controller_('NotesController', {
      $scope : $scope,
      slide : slide
    });
  }));

  it('should return logged user\'s notes', inject(function() {
    expect($scope.items).toBeUndefined();
    $scope.items = mockHttpBackendResponse.getItemsResponse();
    expect($scope.items.notes.length).toBe(3);
  }));
});

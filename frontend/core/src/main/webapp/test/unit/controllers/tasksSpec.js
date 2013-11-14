/*global beforeEach, inject, describe, it, expect */
/*jslint white: true */
'use strict';

beforeEach(module('em.app'));

describe('TasksController', function() {
  beforeEach(module('em.services', 'em.mockHelpers'));

  var $controller, $scope, mockHttpBackendResponse, slide, userTasks;

  beforeEach(inject(function(_$controller_, _$rootScope_, _mockHttpBackendResponse_) {
    mockHttpBackendResponse = _mockHttpBackendResponse_;
    userTasks = mockHttpBackendResponse.getItemsResponse().tasks;

    $scope = _$rootScope_.$new();
    $controller = _$controller_('TasksController', {
      $scope : $scope,
      slide : slide
    });
  }));

  it('should return logged user\'s tasks', inject(function() {
    expect($scope.tasks).toEqual([]);
    $scope.tasks = userTasks;
    expect($scope.tasks.length).toBe(4);
  }));
});

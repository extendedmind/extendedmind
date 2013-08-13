"use strict";

describe('em.controllers', function() {
  beforeEach(module('em.controllers', 'em.mockHelpers'));

  describe('TasksController', function() {
    var $controller, $scope;
    var mockHttpBackendResponse;

    beforeEach(inject(function(_$controller_, _$rootScope_, _mockHttpBackendResponse_) {
      mockHttpBackendResponse = _mockHttpBackendResponse_;

      $scope = _$rootScope_.$new();
      $controller = _$controller_('TasksController', {
        $scope : $scope
      });
    }));

    it('should return logged user\'s notes', function() {
      expect($scope.items).toBe(undefined);
      $scope.items = mockHttpBackendResponse.getItemsResponse();
      expect($scope.items.length).toBe(3);
    });
  });
});

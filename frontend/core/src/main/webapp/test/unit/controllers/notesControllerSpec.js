'use strict';

describe('em.controllers', function() {
  beforeEach(module('em.controllers'));

  describe('NotesController', function() {
    beforeEach(module('em.services', 'em.mockHelpers'));

    var $controller, $scope;
    var mockHttpBackendResponse;

    beforeEach(inject(function(_$controller_, _$rootScope_, _mockHttpBackendResponse_) {
      mockHttpBackendResponse = _mockHttpBackendResponse_;

      $scope = _$rootScope_.$new();
      $controller = _$controller_('NotesController', {
        $scope : $scope
      });
    }));

    it('should return logged user\'s notes', inject(function() {
      expect($scope.items).toBe(undefined);
      $scope.items = mockHttpBackendResponse.getItemsResponse();
      expect($scope.items.length).toBe(3);
    }));
  });
});

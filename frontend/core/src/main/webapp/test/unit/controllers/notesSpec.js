/*global module, beforeEach, inject, describe, afterEach, it, expect*/
/*jslint nomen: true */

( function() {'use strict';
    beforeEach(module('em.app'));

    describe('NotesController', function() {
      beforeEach(module('em.services', 'em.mockHelpers'));

      var $controller, $scope, mockHttpBackendResponse, slideIndex;

      beforeEach(inject(function(_$controller_, _$rootScope_, _mockHttpBackendResponse_) {
        mockHttpBackendResponse = _mockHttpBackendResponse_;

        $scope = _$rootScope_.$new();
        $controller = _$controller_('NotesController', {
          $scope : $scope,
          slideIndex : slideIndex
        });
      }));

      it('should return logged user\'s notes', inject(function() {
        expect($scope.items).toEqual([]);
        $scope.items = mockHttpBackendResponse.getItemsResponse();
        expect($scope.items.notes.length).toBe(3);
      }));
    });
  }());

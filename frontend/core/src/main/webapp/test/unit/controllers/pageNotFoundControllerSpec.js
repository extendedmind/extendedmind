"use strict";

describe('em.controllers', function() {
  beforeEach(module('em.controllers'));

  describe('PageNotFoundController', function() {
    var $controller, $scope;

    beforeEach(inject(function(_$controller_, _$rootScope_) {

      $scope = _$rootScope_.$new();
      $controller = _$controller_('PageNotFoundController', {
        $scope : $scope
      });
    }));
  });
});

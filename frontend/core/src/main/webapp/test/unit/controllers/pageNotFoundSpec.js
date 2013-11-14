/*global beforeEach, inject, describe */
/*jslint white: true */
'use strict';

beforeEach(module('em.app'));

describe('PageNotFoundController', function() {
  var $controller, $scope;

  beforeEach(inject(function(_$controller_, _$rootScope_) {

    $scope = _$rootScope_.$new();
    $controller = _$controller_('PageNotFoundController', {
      $scope : $scope
    });
  }));
});

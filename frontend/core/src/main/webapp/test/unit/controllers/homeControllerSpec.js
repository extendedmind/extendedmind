/*global module, beforeEach, inject, describe, afterEach, it, expect*/
/*jslint nomen: true */

( function() {'use strict';
    // describe('em.controllers', function() {
    beforeEach(module('em.app'));

    describe('HomeController', function() {
      var $controller, $scope;

      beforeEach(inject(function(_$controller_, _$rootScope_) {

        $scope = _$rootScope_.$new();
        $controller = _$controller_('HomeController', {
          $scope : $scope
        });
      }));
    });
    // });
  }());

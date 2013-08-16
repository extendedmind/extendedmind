'use strict';

describe('em.directives', function() {
  beforeEach(module('em.directives'));

  describe('app-version', function() {

    it('should print current version', function() {
      module(function($provide) {
        $provide.value('version', 'TEST_VER');
        return null;
      });
      return inject(function($compile, $rootScope) {
        var element;
        element = $compile('<span app-version></span>')($rootScope);
        return expect(element.text()).toEqual('TEST_VER');
      });
    });
  });
});

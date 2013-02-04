(function() {
  "use strict";

  describe("directives", function() {
    beforeEach(module("em.directives"));
    return describe("app-version", function() {
      return it("should print current version", function() {

    	var test = function($provide) { $provide.value("version", "TEST_VER");}
        module(test);
        inject(function($compile, $rootScope) {
          var element;
          element = $compile("<span app-version></span>")($rootScope);
          return expect(element.text()).toEqual("TEST_VER");
        });
      });
    });
  });

}).call(this);
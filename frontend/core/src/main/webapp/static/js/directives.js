"use strict";

var emDirectives = angular.module('em.directives', []);

emDirectives.directive('appVersion', ['version',
function(version) {
  return function(scope, element, attrs) {
    return element.text(version);
  };
}]);

emDirectives.directive('newItem', function() {
  return {
    restrict : 'EA',
    replace : true,
    transclude : true,
    templateUrl : '/static/partials/newItemTemplate.html',
    link : function(scope, element, attrs) {
      scope.showMe = false;

      scope.toggle = function toggle() {
        scope.showMe = !scope.showMe;
      }
    }
  }
});

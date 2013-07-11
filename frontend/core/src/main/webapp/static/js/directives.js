"use strict";

var emDirectives = angular.module('em.directives', []);

emDirectives.directive('appVersion', ['version',
function(version) {
  return function(scope, element, attrs) {
    return element.text(version);
  };
}]);

emDirectives.directive('itemList', function() {
  return {
    restrict : 'E',
    templateUrl : '/static/partials/newItemTemplate.html'
  }
});

"use strict";

var emDirectives = angular.module('directives', []);

emDirectives.directive('appVersion', ['version',
function(version) {
  return function(scope, elm, attrs) {
    return elm.text(version);
  };
}]);

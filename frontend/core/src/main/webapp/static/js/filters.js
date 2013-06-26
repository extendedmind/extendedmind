"use strict";

var emFilters = angular.module('filters', []);

emFilters.filter('interpolate', ['version',
function(version) {
  return function(text) {
    return String(text).replace(/\%VERSION\%/mg, version);
  };
}]);

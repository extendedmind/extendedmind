"use strict";

var emFilters = angular.module('em.filters', []);

emFilters.filter('interpolate', ['version',
function(version) {
  return function(text) {
    return String(text).replace(/\%VERSION\%/mg, version);
  };
}]);

emFilters.filter('userItems', function() {
  var userItemsFilter = function(items, itemsFilterArgument) {
    var filteredItems = [];
    angular.forEach(items, function(item) {
      if (item.itemType === itemsFilterArgument)
        filteredItems.push(item);
    });
    return filteredItems;
  };
  return userItemsFilter;
});

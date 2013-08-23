/*global angular*/

( function() {'use strict';

    angular.module('em.filters').filter('interpolate', ['version',
    function(version) {
      return function(text) {
        return String(text).replace(/\%VERSION\%/mg, version);
      };
    }]);

    angular.module('em.filters').filter('userItems', [
    function() {
      var userItemsFilter = function(items, itemsFilterArgument) {
        var filteredItems = [];
        angular.forEach(items, function(item) {
          if (item.itemType === itemsFilterArgument) {
            filteredItems.push(item);
          }
        });
        return filteredItems;
      };
      return userItemsFilter;
    }]);
  }());

'use strict';

angular.module('em.filters').filter('itemsFilter', [
  function() {

    var filter = function(items, filterValue) {
      var itemsFilter = {};

      itemsFilter.byListUUID = function(items, uuid) {
        var filteredValues, i;
        filteredValues = [];
        i = 0;

        while (items[i]) {
          if (items[i].relationships) {
            if (items[i].relationships.parent) {
              if (items[i].relationships.parent === uuid) {
                filteredValues.push(items[i]);
              }
            }
          }
          i++;
        }
        return filteredValues;
      };
      itemsFilter.byContextUUID = function(items, uuid) {
        var filteredValues, i;
        filteredValues = [];
        i = 0;

        while (items[i]) {
          if (items[i].relationships && items[i].relationships.tags) {
            for (var j=0, len=items[i].relationships.tags.length; j<len; j++) {
              if (items[i].relationships.tags[j] === uuid){
                filteredValues.push(items[i]);
              }
            }
          }
          i++;
        }
        return filteredValues;
      };

      itemsFilter.unsorted = function(items) {

        var filteredValues, i, sortedTask;
        filteredValues = [];
        i = 0;

        while (items[i]) {
          sortedTask = false;

          if (items[i].relationships) {
            if (items[i].relationships.parent || items[i].relationships.tags) {
              sortedTask = true;
            }
          }
          if (!sortedTask) {
            filteredValues.push(items[i]);
          }
          i++;
        }
        return filteredValues;
      };

      if (filterValue) {
        return itemsFilter[filterValue.name](items, filterValue.filterBy);
      }
      return items;
    };

    return filter;
  }]);
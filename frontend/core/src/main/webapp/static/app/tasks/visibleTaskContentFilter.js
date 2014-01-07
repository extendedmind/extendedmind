/*global angular */
'use strict';

angular.module('em.filters').filter('visibleTaskContent', [
  function() {
    var userItemsFilter = function(task) {
      var filteredValues;
      filteredValues = [];

      if (task.due) {
        filteredValues.push(task.due);
      }
      if (task.link) {
        filteredValues.push(task.link);
      }

      return filteredValues;
    };
    return userItemsFilter;
  }]);

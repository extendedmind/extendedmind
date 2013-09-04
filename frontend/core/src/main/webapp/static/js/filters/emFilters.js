/*global angular*/
/*jslint plusplus: true*/

( function() {'use strict';

    angular.module('em.filters').filter('interpolate', ['version',
    function(version) {
      return function(text) {
        return String(text).replace(/\%VERSION\%/mg, version);
      };
    }]);

    angular.module('em.filters').filter('tagTitle', ['itemsArray', 'tagsArray',
    function(itemsArray, tagsArray) {
      var userItemsFilter = function(taskTags) {
        var filteredValues, i, tag, tags;
        filteredValues = [];

        if (taskTags) {

          i = 0;
          tags = tagsArray.getTags();

          while (taskTags[i]) {
            tag = itemsArray.getItemByUuid(tags, taskTags[i]);
            filteredValues.push(tag);
            i++;
          }
        }

        return filteredValues;
      };
      return userItemsFilter;
    }]);

    angular.module('em.filters').filter('visibleTaskContent', ['itemsArray', 'tagsArray',
    function(itemsArray, tagsArray) {
      var userItemsFilter = function(task) {
        var filteredValues, i, tag, tags;
        filteredValues = [];

        if (task.due) {
          filteredValues.push(task.due);
        }

        return filteredValues;
      };
      return userItemsFilter;
    }]);
  }());

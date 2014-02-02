/*global angular */
'use strict';

angular.module('em.filters').filter('tagTitle', ['TagsService',
  function(TagsService) {
    var userItemsFilter = function(itemTags) {
      var filteredValues, i, tag, tags;
      filteredValues = [];

      if (itemTags) {
        i = 0;
        tags = TagsService.getTags();

        while (itemTags[i]) {
          tag = tags.findFirstObjectByKeyValue('uuid', itemTags[i]);
          filteredValues.push(tag);
          i++;
        }
      }

      return filteredValues;
    };
    return userItemsFilter;
  }]);

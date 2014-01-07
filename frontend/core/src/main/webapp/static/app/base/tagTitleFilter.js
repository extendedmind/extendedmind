/*global angular */
'use strict';

angular.module('em.filters').filter('tagTitle', ['itemsArray', 'TagsService',
  function(itemsArray, TagsService) {
    var userItemsFilter = function(itemTags) {
      var filteredValues, i, tag, tags;
      filteredValues = [];

      if (itemTags) {
        i = 0;
        tags = TagsService.getTags();

        while (itemTags[i]) {
          tag = itemsArray.getItemByUUID(tags, itemTags[i]);
          filteredValues.push(tag);
          i++;
        }
      }

      return filteredValues;
    };
    return userItemsFilter;
  }]);

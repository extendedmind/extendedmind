/* Copyright 2013-2014 Extended Mind Technologies Oy
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
 'use strict';

 function itemsFilter() {

  var filter = function(items, filterValue) {
    var itemsFilter = {};

    itemsFilter.byListUUID = function(items, uuid) {
      var filteredValues = [];

      items.forEach(function(item) {
        if (item.transientProperties && item.transientProperties.list) {
          if (item.transientProperties.list === uuid) filteredValues.push(item);
        }
      });
      return filteredValues;
    };
    itemsFilter.byTagUUID = function(items, uuid) {
      var filteredValues, i;
      filteredValues = [];
      i = 0;

      while (items[i]) {
        if (items[i].relationships && items[i].relationships.tags) {
          for (var j=0, len=items[i].relationships.tags.length; j<len; j++) {
            if (items[i].relationships.tags[j] === uuid) {
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
        if (!items[i].relationships ||
          !items[i].relationships.tags ||
          !items[i].relationships.tags.length > 0)
        {
          filteredValues.push(items[i]);
        }
        i++;
      }
      return filteredValues;
    };

    itemsFilter.noList = function(items) {

      var filteredValues, i, sortedTask;
      filteredValues = [];
      i = 0;

      while (items[i]) {
        sortedTask = false;
        if (!items[i].relationships || !items[i].relationships.parent) {
          filteredValues.push(items[i]);
        }
        i++;
      }
      return filteredValues;
    };
    itemsFilter.noDate = function(items) {

      var filteredValues, i, sortedTask;
      filteredValues = [];
      i = 0;

      while (items[i]) {
        sortedTask = false;
        if (!items[i].due) {
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
}
angular.module('em.main').filter('itemsFilter', itemsFilter);

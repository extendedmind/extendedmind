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
  var itemsFilters = {};

  itemsFilters.byList = function(items, list) {
    var filteredItems = [];
    for (var i = 0, len = items.length; i < len; i++) {
      var item = items[i];

      if (item.trans.list && item.trans.list === list) {
        filteredItems.push(item);
      }
    }
    return filteredItems;
  };

  itemsFilters.byContext = function(items, context) {
    var filteredItems = [];
    for (var i = 0, len = items.length; i < len; i++) {
      var item = items[i];
      if (context && item.trans.context && item.trans.context === context) {
        // Context exists and item is in the context.
        filteredItems.push(item);
      } else if (!context && !item.trans.context) {
        // No context and item has no context.
        filteredItems.push(item);
      }
    }
    return filteredItems;
  };

  itemsFilters.favorited = function(items) {
    var filteredItems = [];
    for (var i = 0, len = items.length; i < len; i++) {
      if (items[i].trans.favorited) {
        filteredItems.push(items[i]);
      }
    }
    return filteredItems;
  };

  itemsFilters.byTagType = function(items, tagType) {
    var filteredItems = [];
    for (var i = 0, len = items.length; i < len; i++) {
      if (items[i].trans.tagType === tagType) {
        filteredItems.push(items[i]);
      }
    }
    return filteredItems;
  };

  return function(items, filterValue) {
    if (filterValue) return itemsFilters[filterValue.name](items, filterValue.filterBy);
  };

}
angular.module('em.main').filter('itemsFilter', itemsFilter);

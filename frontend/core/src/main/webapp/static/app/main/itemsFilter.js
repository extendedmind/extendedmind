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

  itemsFilters.byListUUID = function(items, uuid) {
    var filteredItems = [];
    for (var i = 0, len = items.length; i < len; i++) {
      if (items[i].relationships && items[i].relationships.parent)
        if (items[i].relationships.parent === uuid) filteredItems.push(items[i]);
    }
    return filteredItems;
  };

  itemsFilters.byTagUUID = function(items, uuid) {
    var filteredItems = [];
    for (var i = 0, len = items.length; i < len; i++) {
      var item = items[i];
      if (uuid && item.trans.context && item.trans.context === uuid) {
        // Context exists and item is in the context.
        filteredItems.push(item);
      } else if (!uuid && !item.trans.context) {
        // No context and item has no context.
        filteredItems.push(item);
      }
    }
    return filteredItems;
  };

  itemsFilters.unsorted = function(items) {
    var filteredItems = [];
    for (var i = 0, len = items.length; i < len; i++) {
      if (!items[i].relationships || !items[i].relationships.tags || items[i].relationships.tags.length === 0)
        filteredItems.push(items[i]);
    }
    return filteredItems;
  };

  itemsFilters.favorited = function(items) {
    var filteredItems = [];
    for (var i = 0, len = items.length; i < len; i++) {
      if (items[i].trans.favorite()) {
        filteredItems.push(items[i]);
      }
    }
    return filteredItems;
  };

  itemsFilters.noList = function(items) {
    var filteredItems = [];
    for (var i = 0, len = items.length; i < len; i++) {
      if (!items[i].relationships || !items[i].relationships.parent)
        filteredItems.push(items[i]);
    }
    return filteredItems;
  };
  itemsFilters.noDate = function(items) {
    var filteredItems = [];
    for (var i = 0, len = items.length; i < len; i++) {
      if (!items[i].due) filteredItems.push(items[i]);
    }
    return filteredItems;
  };

  return function(items, filterValue) {
    if (filterValue) return itemsFilters[filterValue.name](items, filterValue.filterBy);
  };

}
angular.module('em.main').filter('itemsFilter', itemsFilter);

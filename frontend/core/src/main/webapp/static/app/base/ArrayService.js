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

 /*global angular */
 'use strict';

/**
* Helper service for array manipulation.
*/
function ArrayService() {

  // Modified from:
  // http://stackoverflow.com/questions/1344500/efficient-way-to-insert-a-number-into-a-sorted-array-of-numbers
  function insertItemToArray(element, array, field, reverse) {
    array.splice(locationOfItemInArray(element, array, field, reverse) + 1, 0, element);
    return array;
  }

  function locationOfItemInArray(element, array, field, reverse, start, end) {
    start = start || 0;
    end = end || array.length;

    var pivot = parseInt(start + (end - start) / 2, 10);
    if (end - start <= 1) {
      if (reverse) {
        return (array[pivot] && (array[pivot][field] < element[field])) ? pivot - 1 : pivot;
      } else {
        return (array[pivot] && (array[pivot][field] > element[field])) ? pivot - 1 : pivot;
      }
    }
    if ((!reverse && array[pivot][field] < element[field]) || (reverse && array[pivot][field] > element[field])) {
      return locationOfItemInArray(element, array, field, reverse, pivot, end);
    } else {
      return locationOfItemInArray(element, array, field, reverse, start, pivot);
    }
  }

  function getFirstMatchingArrayInfoByProperty(item, otherArrays) {
    if (otherArrays) {
      for (var i=0, len=otherArrays.length; i<len; i++) {
        if (item[otherArrays[i].id]) {
          return otherArrays[i];
        }
      }
    }
  }

  function getFirstMatchingArrayInfoByUUID(uuid, otherArrays) {
    if (otherArrays) {
      for (var i=0, len=otherArrays.length; i<len; i++) {
        var itemInOtherArray = otherArrays[i].array.findFirstObjectByKeyValue('uuid', uuid);
        if (itemInOtherArray) {
          return otherArrays[i];
        }
      }
    }
  }

  return {
    // Based on given backend response, sets active array, deleted array
    // and optionally other arrays, which are objects of type {array: [], id: ''}.
    // Returns the latest (biggest) modified value.
    setArrays: function(response, activeArray, deletedArray, otherArrays) {
      // First clear existing arrays..
      activeArray.length = 0;
      deletedArray.length = 0;
      if (otherArrays) {
        for (var i=0, len=otherArrays.length; i<len; i++) {
          otherArrays[i].array.length = 0;
        }
      }
      // ..then loop through response
      if (response) {
        var index = 0;
        var latestModified;
        while (response[index]) {
          var modified = this.setItem(response[index], activeArray, deletedArray, otherArrays);
          if (!latestModified || latestModified < modified) {
            latestModified = modified;
          }
          index++;
        }
        return latestModified;
      }
    },
    // Based on given backend response, updates all given arrays and returns the
    // latest (biggest) modified value.
    updateArrays: function(response, activeArray, deletedArray, otherArrays) {
      if (response) {
        var i = 0;
        var latestModified;
        while (response[i]) {
          var modified = this.updateItem(response[i], activeArray, deletedArray, otherArrays);
          if (!latestModified || latestModified < response[i].modified) {
            latestModified = modified;
          }
          i++;
        }
        return latestModified;
      }
    },
    // item and activeArray are mandatory, rest are optional
    getActiveArrayInfo: function(item, activeArray, deletedArray, otherArrays) {
      if (activeArray.indexOf(item) !== -1) return {type: 'active', array: activeArray};
      else if (deletedArray && deletedArray.indexOf(item) !== -1) return {type: 'deleted', array: deletedArray};
      else if (otherArrays) {
        var otherArrayWithItemInfo = getFirstMatchingArrayInfoByUUID(item.uuid, otherArrays);
        if (otherArrayWithItemInfo) return {type: otherArrayWithItemInfo.id, array: otherArrayWithItemInfo.array};
      }
    },
    // item and activeArray are mandatory, rest are optional
    removeFromArrays: function(item, activeArray, deletedArray, otherArrays) {
      var arrayInfo = this.getActiveArrayInfo(item, activeArray, deletedArray, otherArrays);
      if (arrayInfo) arrayInfo.array.splice(arrayInfo.array.indexOf(item), 1);
    },
    // item and activeArray are mandatory, rest are optional
    setItem: function(item, activeArray, deletedArray, otherArrays) {
      var otherArrayInfo = getFirstMatchingArrayInfoByProperty(item, otherArrays);
      if (deletedArray && item.deleted) {
        insertItemToArray(item, deletedArray, 'deleted');
      } else if (otherArrayInfo) {
        insertItemToArray(item, otherArrayInfo.array, otherArrayInfo.id, otherArrayInfo.reverse);
      } else {
        insertItemToArray(item, activeArray, 'created');
      }
      return item.modified;
    },
    // item and activeArray are mandatory, rest are optional
    updateItem: function(item, activeArray, deletedArray, otherArrays) {
      var activeItemId, deletedItemId, otherArrayItemId;
      var otherArrayInfo = getFirstMatchingArrayInfoByProperty(item, otherArrays);
      var otherArrayWithItemInfo = getFirstMatchingArrayInfoByUUID(item.uuid, otherArrays);

      activeItemId = activeArray.findFirstIndexByKeyValue('uuid', item.uuid);
      if (activeItemId === undefined && deletedArray) {
        deletedItemId = deletedArray.findFirstIndexByKeyValue('uuid', item.uuid);
        if (otherArrayWithItemInfo && deletedItemId === undefined) {
          otherArrayItemId = otherArrayWithItemInfo.array.findFirstIndexByKeyValue('uuid', item.uuid);
        }
      }

      if (activeItemId !== undefined) {
        activeArray.splice(activeItemId, 1);
        if (item.deleted) {
          insertItemToArray(item, deletedArray, 'deleted');
        } else if (otherArrayInfo && item[otherArrayInfo.id]) {
          insertItemToArray(item, otherArrayInfo.array, otherArrayInfo.id, otherArrayInfo.reverse);
        } else {
          insertItemToArray(item, activeArray, 'created');
        }
      } else if (deletedItemId !== undefined) {
        deletedArray.splice(deletedItemId, 1);
        if (!item.deleted) {
          if (otherArrayInfo && item[otherArrayInfo.id]) {
            insertItemToArray(item, otherArrayInfo.array, otherArrayInfo.id, otherArrayInfo.reverse);
          } else {
            insertItemToArray(item, activeArray, 'created');
          }
        } else {
          insertItemToArray(item, deletedArray, 'deleted');
        }
      } else if (otherArrayItemId !== undefined) {
        otherArrayWithItemInfo.array.splice(otherArrayItemId, 1);
        if (item.deleted) {
          insertItemToArray(item, deletedArray, 'deleted');
        } else if (!otherArrayInfo &&
         (!otherArrayWithItemInfo || !item[otherArrayWithItemInfo.id])) {
          // Item does not belong to a new other array, nor anymore to the other array
          // it used to belong to => it is active again.
          insertItemToArray(item, activeArray, 'created');
        } else if (otherArrayInfo && (otherArrayInfo.id !== otherArrayWithItemInfo.id)) {
          // Should be placed in another other array
          insertItemToArray(item, otherArrayInfo.array, otherArrayInfo.id, otherArrayInfo.reverse);
        } else {
          // Just updating modified in current other array
          insertItemToArray(item, otherArrayWithItemInfo.array, otherArrayWithItemInfo.id, otherArrayInfo.reverse);
        }
      } else {
        this.setItem(item, activeArray, deletedArray, otherArrays);
      }

      return item.modified;
    },
    // uuid, properties and activeArray are mandatory, rest are optional
    updateItemProperties: function(uuid, properties, activeArray, deletedArray, otherArrays) {
      var activeItemId = activeArray.findFirstIndexByKeyValue('uuid', uuid);
      function updateProperties(item, properties) {
        for (var property in properties) {
          if (properties.hasOwnProperty(property)) {
            item[property] = properties[property];
          }
        }
      }
      if (activeItemId !== undefined) {
        updateProperties(activeArray[activeItemId], properties);
      } else if (deletedArray) {
        var deletedItemId = deletedArray.findFirstIndexByKeyValue('uuid', uuid);
        if (deletedItemId !== undefined) {
          updateProperties(deletedArray[deletedItemId], properties);
        } else {
          // Try other arrays
          var otherArrayWithItemInfo = getFirstMatchingArrayInfoByUUID(uuid, otherArrays);
          if (otherArrayWithItemInfo) {
            var otherArrayItemId = otherArrayWithItemInfo.array.findFirstIndexByKeyValue('uuid', uuid);
            if (otherArrayItemId !== undefined) {
              updateProperties(otherArrayWithItemInfo.array[otherArrayItemId], properties);
            } else {
              return false;
            }
          } else {
            return false;
          }
        }
      }
      return true;
    },
    combineArrays: function(firstArray, secondArray, id, reverse) {
      function compareById(firstItem, secondItem) {

        if (reverse) {
          if (firstItem[id] > secondItem[id]) {
            return -1;
          } else if (firstItem[id] < secondItem[id]) {
            return 1;
          }
        } else {
          if (firstItem[id] < secondItem[id]) {
            return -1;
          } else if (firstItem[id] > secondItem[id]) {
            return 1;
          }
        }
        return 0;
      }
      if (!firstArray || !firstArray.length) return secondArray;
      if (!secondArray || !secondArray.length) return firstArray;

      var combinedArray = firstArray.concat(secondArray);

      // Sort combined array
      return combinedArray.sort(compareById);
    }
  };
}

angular.module('em.base').factory('ArrayService', ArrayService);

/* Copyright 2013-2016 Extended Mind Technologies Oy
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
function ArrayService($rootScope) {

  function emitChangeEvent(ownerUUID, data, type, item) {
    $rootScope.$emit('arrayChanged',
                     {data: data,
                      type: type,
                      item: item,
                      ownerUUID: ownerUUID});
  }

  // Modified from:
  // http://stackoverflow.com/questions/1344500/efficient-way-to-insert-a-number-into-a-sorted-array-of-numbers
  function insertItemToArray(element, array, field, reverse) {
    array.splice(locationOfItemInArray(element, array, field, reverse) + 1, 0, element);
    return array;
  }

  function locationOfItemInArray(element, array, field, reverse, start, end) {

    function compareNumberTransField(a, b, field) {
      return a.trans[field] - b.trans[field];
    }

    var compareFn = typeof field === 'function' ? field : compareNumberTransField;

    start = start || 0;
    end = end || array.length;

    var pivot = parseInt(start + (end - start) / 2, 10);

    if (end - start <= 1) {
      if (reverse) {
        if (array[pivot] && compareFn(array[pivot], element, field) < 0)
          return pivot - 1;
        else
          return pivot;
      }
      else {
        if (array[pivot] && compareFn(array[pivot], element, field) > 0)
          return pivot - 1;
        else
          return pivot;
      }
    }
    var compareResult = compareFn(array[pivot], element, field);
    if ((!reverse && compareResult < 0) || (reverse && compareResult > 0))
      return locationOfItemInArray(element, array, field, reverse, pivot, end);
    else
      return locationOfItemInArray(element, array, field, reverse, start, pivot);
  }

  function getFirstMatchingArrayInfoByProperty(item, otherArrays) {
    if (otherArrays) {
      for (var i=0, len=otherArrays.length; i<len; i++) {
        if (item.trans[otherArrays[i].id]) {
          return otherArrays[i];
        }
      }
    }
  }

  function getFirstMatchingArrayInfoByUUID(uuid, otherArrays) {
    if (otherArrays) {
      for (var i=0, len=otherArrays.length; i<len; i++) {
        var itemInOtherArray = otherArrays[i].array.findFirstObjectByKeyValue('uuid', uuid, 'trans');
        if (itemInOtherArray) {
          return otherArrays[i];
        }
      }
    }
  }

  function caseInsensitiveTitleCompare(a, b) {
    var aValue = a.trans.title.toLowerCase();
    var bValue = b.trans.title.toLowerCase();
    if (aValue < bValue) {
      return -1;
    } else if (aValue > bValue) {
      return 1;
    }
    return 0;
  }

  function sortAlphabeticallyWithParent(items, parentTransKey) {
    var i;
    var sortedItems = [];
    var childItems = [];

    for (i = 0; i < items.length; i++) {
      var item = items[i];
      if (item.trans[parentTransKey] && !item.trans[parentTransKey].trans.deleted) {
        // Push children into temp.
        childItems.push(item);
      } else {
        // Insert parentless items alphabetically into cache.
        insertItemToArray(item, sortedItems, caseInsensitiveTitleCompare);
      }
    }

    for (i = 0; i < childItems.length; i++) {
      var childList = childItems[i];
      var parentFoundButPositionAmongSiblingsNotFound = false;

      for (var j = 0; j < sortedItems.length; j++) {
        if (childList.trans[parentTransKey].trans.uuid === sortedItems[j].trans.uuid ||
            parentFoundButPositionAmongSiblingsNotFound)
        {
          // Parent found, insert alphabetically under parent.
          if (j === sortedItems.length - 1) {
            // End of array, push to the end of the cache.
            sortedItems.push(childList);
            parentFoundButPositionAmongSiblingsNotFound = false;
            break;
          } else if (!sortedItems[j + 1].trans[parentTransKey]) {
            // Next is parentless, insert here.
            sortedItems.splice(j + 1, 0, childList);
            parentFoundButPositionAmongSiblingsNotFound = false;
            break;
          } else if (childList.trans.title <= sortedItems[j + 1].trans.title) {
            // Alphabetical position among siblings found, insert here.
            sortedItems.splice(j + 1, 0, childList);
            parentFoundButPositionAmongSiblingsNotFound = false;
            break;
          } else {
            // Continue iterating until correct position for the child among siblings is found.
            parentFoundButPositionAmongSiblingsNotFound = true;
            continue;
          }
        }
      }
    }
    return sortedItems;
  }

  return {
    // Based on given backend response, sets active array, deleted array
    // and optionally other arrays, which are objects of type {array: [], id: ''}.
    // Returns the latest (biggest) modified value.
    setArrays: function(ownerUUID, itemType, response, activeArray, deletedArray, otherArrays) {
      // First clear existing arrays..
      var changedArrays = [];
      activeArray.length = 0;
      changedArrays.push({type: 'active', array: activeArray});
      deletedArray.length = 0;
      changedArrays.push({type: 'deleted', array: deletedArray});
      if (otherArrays) {
        for (var i=0, len=otherArrays.length; i<len; i++) {
          otherArrays[i].array.length = 0;
          changedArrays.push({type: otherArrays[i].id, array: otherArrays[i].array});
        }
      }

      // ..then loop through response
      var latestModified;
      if (response) {
        var index = 0;
        while (response[index]) {
          var modified = this.setItem(ownerUUID, itemType, response[index], activeArray,
                                      deletedArray, otherArrays, true);
          if (!latestModified || latestModified < modified) {
            latestModified = modified;
          }
          index++;
        }
      }

      emitChangeEvent(ownerUUID, changedArrays, itemType);
      return latestModified;
    },
    // Based on given backend response, updates all given arrays and returns the
    // latest (biggest) modified value.
    updateArrays: function(ownerUUID, itemType, response, activeArray, deletedArray, otherArrays) {
      if (response) {
        var i = 0;
        var latestModified;
        var skipEmit = response.length > 1;
        while (response[i]) {
          var modified = this.updateItem(ownerUUID, itemType, response[i],
                                         activeArray, deletedArray, otherArrays, skipEmit);
          if (!latestModified || latestModified < response[i].modified) {
            latestModified = modified;
          }
          i++;
        }
        if (skipEmit){
          // Emit change event for all arrays just in case when there are more than one item updated
          var changedArrays = [];
          changedArrays.push({type: 'active', array: activeArray});
          changedArrays.push({type: 'deleted', array: deletedArray});
          if (otherArrays) {
            for (i=0; i<otherArrays.length; i++) {
              changedArrays.push({type: otherArrays[i].id, array: otherArrays[i].array});
            }
          }
          emitChangeEvent(ownerUUID, changedArrays, itemType);
        }
        return latestModified;
      }
    },
    // item and activeArray are mandatory, rest are optional
    getActiveArrayInfo: function(item, activeArray, deletedArray, otherArrays) {
      if (activeArray &&
          activeArray.findFirstIndexByKeyValue('uuid', item.trans.uuid, 'trans') !== undefined)
      {
        return {type: 'active', array: activeArray};
      }else if (deletedArray &&
                deletedArray.findFirstIndexByKeyValue('uuid', item.trans.uuid, 'trans') !== undefined)
      {
        return {type: 'deleted', array: deletedArray};
      }else if (otherArrays) {
        var otherArrayWithItemInfo = getFirstMatchingArrayInfoByUUID(item.trans.uuid, otherArrays);
        if (otherArrayWithItemInfo) {
          return {type: otherArrayWithItemInfo.id, array: otherArrayWithItemInfo.array};
        }
      }
    },
    // item and activeArray are mandatory, rest are optional
    removeFromArrays: function(ownerUUID, item, itemType, activeArray, deletedArray, otherArrays) {
      var arrayInfo = this.getActiveArrayInfo(item, activeArray, deletedArray, otherArrays);
      if (arrayInfo) {
        arrayInfo.array.splice(arrayInfo.array.indexOf(item), 1);
        emitChangeEvent(ownerUUID, {type: arrayInfo.type, array: arrayInfo.array}, itemType, item);
      }
      return arrayInfo;
    },
    /*
    * itemType, item and activeArray are mandatory, rest are optional
    */
    setItem: function(ownerUUID, itemType, item, activeArray, deletedArray, otherArrays, skipChangeEvent) {
      if (ownerUUID && item && item.trans && item.trans.uuid){
        var otherArrayInfo = getFirstMatchingArrayInfoByProperty(item, otherArrays);
        if (deletedArray && item.trans.deleted) {
          insertItemToArray(item, deletedArray, 'deleted');
          if (!skipChangeEvent) {
            emitChangeEvent(ownerUUID, [{type: 'active', array: activeArray},
                            {type: 'deleted', array: deletedArray}],
                            itemType, item);
          }
        } else if (otherArrayInfo) {
          insertItemToArray(item, otherArrayInfo.array, otherArrayInfo.id, otherArrayInfo.reverse);
          if (!skipChangeEvent) {
            emitChangeEvent(ownerUUID, {type: otherArrayInfo.id, array: otherArrayInfo.array},
                            itemType, item);
          }
        } else {
          insertItemToArray(item, activeArray, 'created');
          if (!skipChangeEvent) emitChangeEvent(ownerUUID,
                                                {type: 'active', array: activeArray},
                                                itemType, item);
        }
        return item.modified;
      }
    },
    /*
    * itemType, item and activeArray are mandatory, rest are optional
    */
    updateItem: function(ownerUUID, itemType, item, activeArray, deletedArray, otherArrays, skipChangeEvent) {
      if (ownerUUID && item && item.trans && item.trans.uuid){
        var activeItemId, deletedItemId, otherArrayItemId;
        var otherArrayInfo = getFirstMatchingArrayInfoByProperty(item, otherArrays);
        var otherArrayWithItemInfo = getFirstMatchingArrayInfoByUUID(item.trans.uuid, otherArrays);

        activeItemId = activeArray.findFirstIndexByKeyValue('uuid', item.trans.uuid, 'trans');
        if (activeItemId === undefined && deletedArray) {
          deletedItemId = deletedArray.findFirstIndexByKeyValue('uuid', item.trans.uuid, 'trans');
          if (otherArrayWithItemInfo && deletedItemId === undefined) {
            otherArrayItemId = otherArrayWithItemInfo.array
                               .findFirstIndexByKeyValue('uuid', item.trans.uuid, 'trans');
          }
        }

        if (activeItemId !== undefined) {
          activeArray.splice(activeItemId, 1);
          if (item.trans.deleted) {
            insertItemToArray(item, deletedArray, 'deleted');
            if (!skipChangeEvent) {
              emitChangeEvent(ownerUUID, [{type: 'active', array: activeArray},
                              {type: 'deleted', array: deletedArray}],
                              itemType, item);
            }
          } else if (otherArrayInfo && item.trans[otherArrayInfo.id]) {
            insertItemToArray(item, otherArrayInfo.array, otherArrayInfo.id, otherArrayInfo.reverse);
            if (!skipChangeEvent) {
              emitChangeEvent(ownerUUID,[{type: 'active', array: activeArray},
                              {type: otherArrayInfo.id, array: otherArrayInfo.array}],
                              itemType, item);
            }
          } else {
            insertItemToArray(item, activeArray, 'created');
            if (!skipChangeEvent) emitChangeEvent(ownerUUID, {type: 'active', array: activeArray},
                                                  itemType, item);
          }
        } else if (deletedItemId !== undefined) {
          deletedArray.splice(deletedItemId, 1);
          if (!item.trans.deleted) {
            if (otherArrayInfo && item.trans[otherArrayInfo.id]) {
              insertItemToArray(item, otherArrayInfo.array, otherArrayInfo.id, otherArrayInfo.reverse);
              if (!skipChangeEvent) {
                emitChangeEvent(ownerUUID, [{type: otherArrayInfo.id, array: otherArrayInfo.array},
                                {type: 'deleted', array: deletedArray}],
                                itemType, item);
              }
            } else {
              insertItemToArray(item, activeArray, 'created');
              if (!skipChangeEvent) {
                emitChangeEvent(ownerUUID, [{type: 'active', array: activeArray},
                                {type: 'deleted', array: deletedArray}],
                                itemType, item);
              }
            }
          } else {
            insertItemToArray(item, deletedArray, 'deleted');
            if (!skipChangeEvent) emitChangeEvent(ownerUUID, {type: 'deleted', array: deletedArray},
                                                  itemType, item);
          }
        } else if (otherArrayItemId !== undefined) {
          otherArrayWithItemInfo.array.splice(otherArrayItemId, 1);
          if (item.trans.deleted) {
            insertItemToArray(item, deletedArray, 'deleted');
            if (!skipChangeEvent) {
              emitChangeEvent(ownerUUID, [
                              {type: otherArrayWithItemInfo.id, array: otherArrayWithItemInfo.array},
                              {type: 'deleted', array: deletedArray}],
                              itemType, item);
            }
          } else if (!otherArrayInfo &&
           (!otherArrayWithItemInfo || !item.trans[otherArrayWithItemInfo.id])) {
            // Item does not belong to a new other array, nor anymore to the other array
            // it used to belong to => it is active again.
            insertItemToArray(item, activeArray, 'created');
            if (!skipChangeEvent) {
              emitChangeEvent(ownerUUID, [{type: 'active', array: activeArray},
                              {type: otherArrayWithItemInfo.id, array: otherArrayWithItemInfo.array}],
                              itemType, item);
            }
          } else if (otherArrayInfo && (otherArrayInfo.id !== otherArrayWithItemInfo.id)) {
            // Should be placed in another other array
            insertItemToArray(item, otherArrayInfo.array, otherArrayInfo.id, otherArrayInfo.reverse);
            if (!skipChangeEvent) {
              emitChangeEvent(ownerUUID, [{type: otherArrayInfo.id, array: otherArrayInfo.array},
                              {type: otherArrayWithItemInfo.id, array: otherArrayWithItemInfo.array}],
                              itemType, item);
            }
          } else {
            // Just updating modified in current other array
            insertItemToArray(item, otherArrayWithItemInfo.array, otherArrayWithItemInfo.id,
                              otherArrayInfo.reverse);
            if (!skipChangeEvent) {
              emitChangeEvent(ownerUUID,
                              {type: otherArrayWithItemInfo.id, array: otherArrayWithItemInfo.array},
                              itemType, item);
            }
          }
        } else {
          this.setItem(ownerUUID, itemType, item, activeArray, deletedArray, otherArrays, skipChangeEvent);
        }

        return item.modified;
      }
    },
    combineAndSortArrays: function(firstArray, secondArray, id, reverse) {
      var combinedArray = firstArray.concat(secondArray);
      var combinedAndSortedArray = [];
      // Sort combined array
      for (var i = 0; i < combinedArray.length; i++) {
        insertItemToArray(combinedArray[i], combinedAndSortedArray, id, reverse);
      }
      return combinedAndSortedArray;
    },
    getModifiedItems: function(activeArray, deletedArray, otherArrays) {
      var i, len, j, jlen, modifiedItems;
      for (i=0, len=activeArray.length; i<len; i++) {
        if (activeArray[i].mod){
          if (!modifiedItems) modifiedItems = [];
          modifiedItems.push(activeArray[i]);
        }
      }
      for (i=0, len=deletedArray.length; i<len; i++) {
        if (deletedArray[i].mod){
          if (!modifiedItems) modifiedItems = [];
          modifiedItems.push(deletedArray[i]);
        }
      }
      if (otherArrays) {
        for (i=0, len=otherArrays.length; i<len; i++) {
          for (j=0, jlen=otherArrays[i].array.length; j<jlen; j++) {
            if (otherArrays[i].array[j].mod) {
              if (!modifiedItems) modifiedItems = [];
              modifiedItems.push(otherArrays[i].array[j]);
            }
          }
        }
      }
      return modifiedItems;
    },
    insertItemToArray: insertItemToArray,
    sortAlphabeticallyWithParent: sortAlphabeticallyWithParent,
    evaluateArrays: function(ownerUUID, itemType, activeArray, deletedArray, otherArrays) {
      var changedArrays = [];
      changedArrays.push({type: 'active', array: activeArray});
      changedArrays.push({type: 'deleted', array: deletedArray});
      if (otherArrays) {
        for (var i = 0; i < otherArrays.length; i++) {
          changedArrays.push({type: otherArrays[i].id, array: otherArrays[i].array});
        }
      }
      emitChangeEvent(ownerUUID, changedArrays, itemType);
    }
  };
}

ArrayService['$inject'] = ['$rootScope'];
angular.module('em.base').factory('ArrayService', ArrayService);

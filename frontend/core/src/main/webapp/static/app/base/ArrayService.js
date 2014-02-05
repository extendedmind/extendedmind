/*global angular */
'use strict';

/**
* Helper service for array manipulation.
*/
function ArrayService(){

  // Modified from:
  // http://stackoverflow.com/questions/1344500/efficient-way-to-insert-a-number-into-a-sorted-array-of-numbers
  function insertItemToArray(element, array, field) {
    array.splice(locationOfItemInArray(element, array, field) + 1, 0, element);
    return array;
  }

  function locationOfItemInArray(element, array, field, start, end) {
    start = start || 0;
    end = end || array.length;

    var pivot = parseInt(start + (end - start) / 2, 10);
    if (end - start <= 1){
      return (array[pivot] && (array[pivot][field] > element[field])) ? pivot - 1 : pivot;
    }
    if (array[pivot][field] < element[field]) {
      return locationOfItemInArray(element, array, field, pivot, end);
    } else {
      return locationOfItemInArray(element, array, field, start, pivot);
    }
  }

  function getFirstMatchingArrayInfoByProperty(item, otherArrays){
    if (otherArrays){
      for (var i=0, len=otherArrays.length; i<len; i++) {
        if (item[otherArrays[i].id]){
          return otherArrays[i];
        };
      }
    }
  }

  function getFirstMatchingArrayInfoByUUID(item, otherArrays){
    if (otherArrays){
      for (var i=0, len=otherArrays.length; i<len; i++) {
        var itemInOtherArray = otherArrays[i].array.findFirstObjectByKeyValue('uuid', item.uuid);
        if (itemInOtherArray){
          return otherArrays[i];
        };
      }
    }
  }

  return {
    // Based on given backend response, sets active array, deleted array
    // and optionally other arrays, which are objects of type {array: [], id: ''}.
    // Returns the latest (biggest) modified value.
    setArrays: function(response, activeArray, deletedArray, otherArrays){
      // First clear existing arrays..
      activeArray.length = 0;
      deletedArray.length = 0;
      if (otherArrays){
        for (var i=0, len=otherArrays.length; i<len; i++) {
          otherArrays[i].array.length = 0;
        }
      }
      // ..then loop through response
      if (response) {
        var i = 0;
        var latestModified;
        while (response[i]) {
          var modified = this.setItem(response[i], activeArray, deletedArray, otherArrays);
          if (!latestModified || latestModified < modified){
            latestModified = modified;
          }
          i++;
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
          if (!latestModified || latestModified < response[i].modified){
            latestModified = modified;
          }
          i++;
        }
        return latestModified;
      }
    },
    // item and activeArray are mandatory, rest are optional
    setItem: function(item, activeArray, deletedArray, otherArrays) {
      var otherArrayInfo = getFirstMatchingArrayInfoByProperty(item, otherArrays);
      if (deletedArray && item.deleted){
        insertItemToArray(item, deletedArray, 'deleted');
      }else if (otherArrayInfo) {
        insertItemToArray(item, otherArrayInfo.array, otherArrayInfo.id);
      }else{
        insertItemToArray(item, activeArray, 'modified');
      }
      return item.modified;
    },
    // item and activeArray are mandatory, rest are optional    
    updateItem: function(item, activeArray, deletedArray, otherArrays) {
      var activeItemId, deletedItemId, otherArrayItemId;
      var otherArrayInfo = getFirstMatchingArrayInfoByProperty(item, otherArrays);
      var otherArrayWithItemInfo = getFirstMatchingArrayInfoByUUID(item, otherArrays);

      activeItemId = activeArray.findFirstIndexByKeyValue('uuid', item.uuid);
      if (activeItemId === undefined && deletedArray) {
        deletedItemId = deletedArray.findFirstIndexByKeyValue('uuid', item.uuid);
        if (otherArrayWithItemInfo && deletedItemId === undefined){
          otherArrayItemId = otherArrayWithItemInfo.array.findFirstIndexByKeyValue('uuid', item.uuid);
        }
      }

      if (activeItemId !== undefined){
        activeArray.splice(activeItemId, 1);
        if (item.deleted){
          insertItemToArray(item, deletedArray, 'deleted');
        }else if (otherArrayInfo && item[otherArrayInfo.id]){
          insertItemToArray(item, otherArrayInfo.array, otherArrayInfo.id);
        }else{
          insertItemToArray(item, activeArray, 'modified');
        }
      }else if (deletedItemId !== undefined) {
        deletedArray.splice(deletedItemId, 1);        
        if (!item.deleted){
          if (otherArrayInfo && item[otherArrayInfo.id]){
            insertItemToArray(item, otherArrayInfo.array, otherArrayInfo.id);
          }else {
            insertItemToArray(item, activeArray, 'modified');
          }
        }else{
          insertItemToArray(item, deletedArray, 'deleted');
        }
      }else if (otherArrayItemId !== undefined) {
        otherArrayWithItemInfo.array.splice(otherArrayItemId, 1);
        if (item.deleted){
          insertItemToArray(item, deletedArray, 'deleted');
        }else if (!otherArrayInfo && 
                 (!otherArrayWithItemInfo || !item[otherArrayWithItemInfo.id])){
          // Item does not belong to a new other array, nor anymore to the other array
          // it used to belong to => it is active again. 
          insertItemToArray(item, activeArray, 'modified');
        }else if (otherArrayInfo && (otherArrayInfo.id !== otherArrayWithItemInfo.id)) {
          // Should be placed in another other array
          insertItemToArray(item, otherArrayInfo.array, otherArrayInfo.id);          
        }else{
          // Just updating modified in current other array
          insertItemToArray(item, otherArrayWithItemInfo.array, otherArrayWithItemInfo.id);          
        }
      }else {
        this.setItem(item, activeArray, deletedArray, otherArrays);
      }
      
      return item.modified;
    }
 };
}
  
angular.module('em.services').factory('ArrayService', ArrayService);
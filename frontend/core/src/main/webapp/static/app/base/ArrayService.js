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

  return {
    // Based on given backend response, sets active array, deleted array
    // and optionally extra array, which is identified with extraArrayIdField.
    // Returns the latest (biggest) modified value.
    setArrays: function(response, activeArray, deletedArray, extraArray, extraArrayIdField){
      // First clear existing arrays..
      activeArray.length = 0;
      deletedArray.length = 0;
      if (extraArray){
        extraArray.length = 0;
      }
      // ..then loop through response
      if (response) {
        var i = 0;
        var latestModified;
        while (response[i]) {
          var modified = this.setItem(response[i], activeArray, deletedArray, extraArray, extraArrayIdField);
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
    updateArrays: function(response, activeArray, deletedArray, extraArray, extraArrayIdField) {
      if (response) {
        var i = 0;
        var latestModified;
        while (response[i]) {
          var modified = this.updateItem(response[i], activeArray, deletedArray, extraArray, extraArrayIdField);
          if (!latestModified || latestModified < response[i].modified){
            latestModified = modified;
          }
          i++;
        }
        return latestModified;
      }
    },
    // item and activeArray are mandatory, rest are optional
    setItem: function(item, activeArray, deletedArray, extraArray, extraArrayIdField) {
      if (deletedArray && item.deleted){
        insertItemToArray(item, deletedArray, 'deleted');
      }else if (extraArrayIdField && item.extraArrayIdField) {
        insertItemToArray(item, extraArray, extraArrayIdField);
      }else{
        insertItemToArray(item, activeArray, 'modified');
      }
      return item.modified;
    },
    // item and activeArray are mandatory, rest are optional    
    updateItem: function(item, activeArray, deletedArray, extraArray, extraArrayIdField) {
      var activeItemId, deletedItemId, extraArrayItemId;

      activeItemId = activeArray.findFirstIndexByKeyValue('uuid', item.uuid);
      if (activeItemId === undefined && deletedArray) {
        deletedItemId = deletedArray.findFirstIndexByKeyValue('uuid', item.uuid);
        if (extraArray && deletedItemId === undefined){
          extraArrayItemId = extraArray.findFirstIndexByKeyValue('uuid', item.uuid);
        }
      }

      if (activeItemId !== undefined){
        activeArray.splice(activeItemId, 1);
        if (item.deleted){
          insertItemToArray(item, deletedArray, 'deleted');
        }else if (extraArrayIdField && item[extraArrayIdField]){
          insertItemToArray(item, extraArray, extraArrayIdField);
        }else{
          insertItemToArray(item, activeArray, 'modified');
        }
      }else if (deletedItemId !== undefined) {
        deletedArray.splice(deletedItemId, 1);        
        if (!item.deleted){
          if (extraArrayIdField && item[extraArrayIdField]){
            insertItemToArray(item, extraArray, extraArrayIdField);
          }else {
            insertItemToArray(item, activeArray, 'modified');
          }
        }else{
          insertItemToArray(item, deletedArray, 'deleted');
        }
      }else if (extraArrayItemId !== undefined) {
        extraArray.splice(extraArrayItemId, 1);
        if (item.deleted){
          insertItemToArray(item, deletedArray, 'deleted');
        }else if (!item.extraArrayIdField){
          insertItemToArray(item, activeArray, 'modified');
        }else{
          insertItemToArray(item, extraArray, extraArrayIdField);
        }
      }else {
        this.setItem(item, activeArray, deletedArray, extraArray, extraArrayIdField);
      }
      
      return item.modified;
    }
 };
}
  
angular.module('em.services').factory('ArrayService', ArrayService);
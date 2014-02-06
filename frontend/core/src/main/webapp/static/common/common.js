'use strict';

angular.module('common', []).config(
  function() {
    if (typeof String.prototype.startsWith != 'function') {
      String.prototype.startsWith = function (str){
        return this.slice(0, str.length) == str;
      };
    }
    
    if (typeof String.prototype.endsWith != 'function') {
      String.prototype.endsWith = function (str){
        return this.slice(-str.length) == str;
      };
    }

    if (typeof Array.prototype.findFirstObjectByKeyValue != 'function') {
      Array.prototype.findFirstObjectByKeyValue = function (key, value){
        for (var i=0, len=this.length; i<len; i++) {
          if (this[i][key] === value) return this[i];
        }
      };
    }
    if (typeof Array.prototype.findFirstIndexByKeyValue != 'function') {
      Array.prototype.findFirstIndexByKeyValue = function (key, value){
        for (var i=0, len=this.length; i<len; i++) {
          if (this[i][key] === value) return i;
        }
      };
    }

    function getByValue(arr, value) {
      for (var i=0, iLen=arr.length; i<iLen; i++) {
        if (arr[i].b == 6) return arr[i];
      }
    }

    // http://stackoverflow.com/a/14853974/2659424
    if (typeof Array.prototype.compare != 'function') {
      // attach the .compare method to Array's prototype to call it on any array
      Array.prototype.compare = function (array) {
        // if the other array is a falsy value, return
        if (!array)
          return false;

        // compare lengths - can save a lot of time
        if (this.length != array.length)
          return false;

        for (var i = 0, l=this.length; i < l; i++) {
          // Check if we have nested arrays
          if (this[i] instanceof Array && array[i] instanceof Array) {
              // recurse into the nested arrays
              if (!this[i].compare(array[i]))
                return false;
            }
            else if (this[i] != array[i]) {
              // Warning - two different object instances will never be equal: {x:20} != {x:20}
              return false;
            }
          }
          return true;
        };
      }
    });

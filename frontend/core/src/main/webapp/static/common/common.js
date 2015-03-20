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

 angular.module('common', []).config(function() {
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

  if (typeof String.prototype.replaceAll != 'function') {
    String.prototype.replaceAll = function(search, replace){
      //if replace is null, return original string otherwise it will
      //replace search string with 'undefined'.
      if(!replace)
        return this;
      return this.replace(new RegExp(search, 'g'), replace);
    };
  }

  if (typeof String.prototype.capitalizeFirstLetter != 'function') {
    String.prototype.capitalizeFirstLetter = function() {
      return this.charAt(0).toUpperCase() + this.slice(1);
    };
  }

  /*
  * Adds timezone offset in ISO 8601 format.
  *
  * @see http://stackoverflow.com/a/17415677
  */
  if (typeof String.prototype.yyyymmddToNoonDate !== 'function') {
    String.prototype.yyyymmddToNoonDate = function() {
      var now = new Date();
      var tzo = -now.getTimezoneOffset();
      var dif = tzo >= 0 ? '+' : '-'; // http://en.wikipedia.org/wiki/ISO_8601#Time_offsets_from_UTC

      function pad(num) {
        var norm = Math.abs(Math.floor(num));
        return (norm < 10 ? '0' : '') + norm;
      }

      return new Date(this.concat('T12:00' + dif + pad(tzo / 60) + ':' + pad(tzo % 60)));
    };
  }

  if (typeof Array.prototype.findFirstObjectByKeyValue != 'function') {
    Array.prototype.findFirstObjectByKeyValue = function (key, value, keyParent){
      for (var i=0, len=this.length; i<len; i++) {
        if (keyParent){
          if (this[i][keyParent][key] === value) return this[i];
        }else{
          if (this[i][key] === value) return this[i];
        }
      }
    };
  }
  if (typeof Array.prototype.findFirstIndexByKeyValue != 'function') {
    Array.prototype.findFirstIndexByKeyValue = function (key, value, keyParent){
      for (var i=0, len=this.length; i<len; i++) {
        if (keyParent){
          if (this[i][keyParent][key] === value) return i;
        }else{
          if (this[i][key] === value) return i;
        }
      }
    };
  }

  /*
  * See: http://jsperf.com/new-array-vs-splice-vs-slice/42 for fastest implementation
  */
  if (typeof Array.prototype.clone !== 'function') {
    Array.prototype.clone = function() {
      return this.slice(0);
    };
  }

  // From: http://stackoverflow.com/a/5306832
  Array.prototype.move = function (old_index, new_index) {
    while (old_index < 0) {
      old_index += this.length;
    }
    while (new_index < 0) {
      new_index += this.length;
    }
    if (new_index >= this.length) {
      var k = new_index - this.length;
      while ((k--) + 1) {
        this.push(undefined);
      }
    }
    this.splice(new_index, 0, this.splice(old_index, 1)[0]);
    return this; // for testing purposes
  };

  /*
  * See:  http://davidwalsh.name/javascript-debounce-function
  *       http://unscriptable.com/2009/03/20/debouncing-javascript-methods/
  */
  Function.prototype.debounce = function(wait, immediate) {
    var func = this, timeout;
    return function() {
      var context = this, args = arguments;
      var later = function() {
        timeout = null;
        if (!immediate) func.apply(context, args);
      };
      var callNow = immediate && !timeout;
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
      if (callNow) func.apply(context, args);
    };
  };
});

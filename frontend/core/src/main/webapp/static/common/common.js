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

    if (typeof Array.prototype.clone !== 'function') {
      Array.prototype.clone = function() {
        return this.slice(0);
      };
    }
  });

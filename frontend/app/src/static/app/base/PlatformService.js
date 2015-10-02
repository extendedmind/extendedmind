/* Copyright 2013-2015 Extended Mind Technologies Oy
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

function PlatformService($q, packaging) {

  function getFirstDayOfWeek(){
    return $q(function(resolve, reject) {
      if (packaging.endsWith('cordova') && navigator && navigator.globalization){
        navigator.globalization.getFirstDayOfWeek(function(fdow){
          if (fdow === 1){
            resolve(0);
          }else{
            resolve(1);
          }
        }, function(error){
          reject(error);
        });
      }else{
        // Our best bet is to guess the start day from the time format
        if (getLocaleBasedTimeFormat() === '12h'){
          resolve(0);
        }else{
          resolve(1);
        }
      }
    });
  }

  function getTimeFormat(){
    return $q(function(resolve, reject) {
      if (packaging.endsWith('cordova') && navigator && navigator.globalization){
        navigator.globalization.getFirstDayOfWeek(function(format){
          resolve(format);
        }, function(error){
          reject(error);
        });
      }else{
        // Our best bet is to use toLocaleTimeString. It does not work in Chrome, but what can you do
        resolve(getLocaleBasedTimeFormat());
      }
    });
  }

  function getLocaleBasedTimeFormat() {
    // Our best bet is to use toLocaleTimeString. It does not work in Chrome, but what can you do
    var localeTimeString = new Date().toLocaleTimeString();
    if (localeTimeString.indexOf('AM') !== -1 || localeTimeString.indexOf('PM') !== -1){
      return '12h';
    }else{
      return '24h';
    }
  }

  function isFeatureSupported(featureName){
    if (featureName){
      switch (featureName) {
        case 'timeFormat':
        return true;

        case 'firstDayOfWeek':
        return true;

        case 'keyboardShortcuts':
        return !packaging.endsWith('cordova');
      }
    }
  }

  return {
    isFeatureSupported: isFeatureSupported,
    getFeatureValue: function(featureName) {
      return $q(function(resolve, reject) {
        if (isFeatureSupported(featureName)){
          switch (featureName) {
            case 'timeFormat':
            resolve(getTimeFormat());
            break;
            case 'firstDayOfWeek':
            resolve(getFirstDayOfWeek());
            break;
          }
        }else{
          reject('not supported');
        }
      });
    }
  };
}
PlatformService['$inject'] = ['$q', 'packaging'];
angular.module('em.base').factory('PlatformService', PlatformService);

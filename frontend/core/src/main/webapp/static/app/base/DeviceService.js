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

/* global cordovaDeviceReady */
'use strict';

function DeviceService(packaging) {

  // CORDOVA

  function onCordovaDeviceReady() {
    document.addEventListener('backbutton', onCordovaBackbutton, false);
    executeCordovaDeviceReadyCallbacks();
  }

  var cordovaDeviceReadyCallbackSettings = {};
  function executeCordovaDeviceReadyCallbacks() {
    for (var id in cordovaDeviceReadyCallbackSettings) {
      if (cordovaDeviceReadyCallbackSettings.hasOwnProperty(id)){
        if (cordovaDeviceReadyCallbackSettings[id].callback){
          cordovaDeviceReadyCallbackSettings[id].callback(id);
          cordovaDeviceReadyCallbackSettings[id].callback = undefined;
        }
      }
    }
  }

  function onCordovaBackbutton(e){
    // Prevent default action, if back was executed somewhere else
    if (executeCordovaBackCallbacks())
      e.preventDefault();
  }

  var cordovaBackCallbacks = {};
  function executeCordovaBackCallbacks() {
    var called = false;
    for (var id in cordovaBackCallbacks) {
      if (cordovaBackCallbacks.hasOwnProperty(id)){
        cordovaBackCallbacks[id]();
        called = true;
      }
    }
    return called;
  }

  function checkCordovaPropertyRepeated(settings){
    if (!settings.callback || settings.until < Date.now()){
      return;
    }
    if (settings.condition()){
      if (settings.callback){
        settings.callback();
        settings.callback = undefined;
      }
    }else{
      setTimeout(checkCordovaPropertyRepeated(settings), 100);
    }
  }

  if (packaging.endsWith('cordova')) {
    if (!cordovaDeviceReady){
      document.addEventListener('deviceready', onCordovaDeviceReady, false);
    }
  }

  return {
    // Fires when deviceready fires, or directly
    registerCordovaDeviceReadyCallback: function(settings, id){
      if (cordovaDeviceReady){
        // Execute immediately
        if (settings.callback){
          settings.callback();
          settings.callback = undefined;
          return true;
        }
      }else{
        // Register callback to fire when deviceready fires
        cordovaDeviceReadyCallbackSettings[id] = settings;
      }
    },
    registerCordovaBackCallback: function(callback, id){
      cordovaBackCallbacks[id] = callback;
    },
    unregisterCordovaBackCallback: function(id){
      if (cordovaBackCallbacks[id]) delete cordovaBackCallbacks[id];
    },
    // A function to get a cordova property if it is possible to get, regardles of deviceready
    registerCordovaPropertyReadyCallback: function(settings, id){
      if (settings.condition()){
        settings.callback();
        settings.callback = undefined;
        return true;
      }

      if (!settings.until){
        // Poll for 3 seconds (30 times) by default
        settings.until = Date.now() + 3000;
      }

      // Start both deviceready polling as well as direct polling as there is no guarantee that
      // deviceready will always fire
      this.registerCordovaDeviceReadyCallback(settings, id);
      checkCordovaPropertyRepeated(settings);
    }
  };
}
DeviceService['$inject'] = ['packaging'];
angular.module('em.base').factory('DeviceService', DeviceService);

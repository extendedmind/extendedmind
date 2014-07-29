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

 function SnapService() {
  var snapper, draggerElement, drawerSlidingDisabled = false;

  return {
    createSnapper: function(element) {
      if (snapper) {
        snapper.settings({element: element});
        snapper.enable();
      } else {
        snapper = new Snap({
          element: element,
          disable: 'right',  // use left only
          transitionSpeed: 0.2,
          minDragDistance: 0,
          addBodyClasses: false
        });
        if (draggerElement) {
          snapper.settings({dragger: draggerElement});
        }
      }
    },
    deleteSnapper: function() {
      if (snapper) snapper.disable();
    },
    setDraggerElement: function(element) {
      draggerElement = element;
      if (snapper) snapper.settings({dragger: draggerElement});
    },
    toggle: function() {
      // https://github.com/jakiestfu/Snap.js/#--how-do-i-make-a-toggle-button
      if (snapper.state().state == 'left') {
        snapper.close();
      } else {
        snapper.open('left');
      }
    },
    registerAnimatedCallback: function(callback) {
      // http://stackoverflow.com/a/3458612
      snapper.on('animated', snapAnimated);
      function snapAnimated() {
        callback(snapper.state());
      }
    },
    registerCloseCallback: function(callback) {
      snapper.on('close', callback);
    },
    registerEndCallback: function(callback) {
      snapper.on('end', paneReleased);
      function paneReleased() {
        callback(snapper.state());
      }
    },
    disableSliding: function() {
      if (!drawerSlidingDisabled) {
        snapper.disable();
        drawerSlidingDisabled = true;
      }
    },
    enableSliding: function() {
      if (drawerSlidingDisabled) {
        snapper.enable();
        drawerSlidingDisabled = false;
      }
    },
    getState: function() {
      return snapper.state();
    }
  };
}
angular.module('em.services').factory('SnapService', SnapService);

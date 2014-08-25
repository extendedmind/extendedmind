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
  var drawerSlidingDisabled = false;

  var snappers = {};
  var draggerElements = {};
  var isSnapperSticky = false;

  var animatedCallbacks = {};

  function snapperStartDragCallback(snapperSide) {
    if (snapperSide === 'left') {
      hideRightAndShowLeft();
    }
    else if (snapperSide === 'right') {
      hideLeftAndShowRight();
    }
  }

  function hideRightAndShowLeft() {
    var rightDrawer = document.getElementById('omnibar-drawer');
    var leftDrawer = document.getElementById('menu');
    if (rightDrawer && rightDrawer.style.display !== 'none') rightDrawer.style.display = 'none';
    if (leftDrawer && leftDrawer.style.display !== 'block') leftDrawer.style.display = 'block';
  }
  function hideLeftAndShowRight() {
    var leftDrawer = document.getElementById('menu');
    var rightDrawer = document.getElementById('omnibar-drawer');
    if (leftDrawer && leftDrawer.style.display !== 'none') leftDrawer.style.display = 'none';
    if (rightDrawer && rightDrawer.style.display !== 'block') rightDrawer.style.display = 'block';
  }
  function registerSnapperEventCallback(snapperEvent, snapperSide, callback) {
    if (snappers[snapperSide] && snappers[snapperSide].snapper) {
      snappers[snapperSide].snapper.on(snapperEvent, function() {
        callback(snapperSide);
      });
    }
  }

  function executeSnapperAnimatedCallbacks(snapperSide) {
    if (animatedCallbacks[snapperSide]) {
      for (var i = 0, len = animatedCallbacks[snapperSide].length; i < len; i++) {
        animatedCallbacks[snapperSide][i].callback(snappers[snapperSide].snapper.state().state, snapperSide);
      }
    }
  }

  function snapperExists(snapperSide) {
    return snappers[snapperSide] && snappers[snapperSide].snapper;
  }

  return {
    createSnapper: function(settings, snapperSide) {
      if (!snappers[snapperSide]) snappers[snapperSide] = {};

      if (snappers[snapperSide].snapper) {

        if (snappers[snapperSide].isDraggable) snappers[snapperSide].snapper.enable();
        else snappers[snapperSide].snapper.disable();

      } else {
        snappers[snapperSide].snapper = new Snap(settings);
        snappers[snapperSide].isDraggable = settings.touchToDrag ? true : false;

        if (snappers[snapperSide].isDraggable) {
          if (draggerElements[snapperSide]) snappers[snapperSide].snapper.settings({dragger: draggerElements[snapperSide]});
          registerSnapperEventCallback('start', snapperSide, snapperStartDragCallback);
          if (isSnapperSticky) snappers[snapperSide].snapper.disable();
          else snappers[snapperSide].snapper.enable();
        }
        else snappers[snapperSide].snapper.disable();
        registerSnapperEventCallback('animated', snapperSide, executeSnapperAnimatedCallbacks);
      }
    },
    deleteSnapper: function(snapperSide) {
      if (snappers[snapperSide] && snappers[snapperSide].snapper)
        snappers[snapperSide].snapper.disable();
    },
    setDraggerElement: function(element, snapperSide) {
      if (!draggerElements[snapperSide]) draggerElements[snapperSide] = element;
      if (snappers[snapperSide] && snappers[snapperSide].snapper) {
        snappers[snapperSide].snapper.settings({dragger: element});
      }
    },
    setDraggerElements: function(elements) {
      for (var draggerElementSide in elements) {
        if (elements.hasOwnProperty(draggerElementSide)) {
          if (snappers[draggerElementSide] && snappers[draggerElementSide].snapper)
            snappers[draggerElementSide].snapper.settings({dragger: elements[draggerElementSide]});
        }
      }
    },
    toggle: function(snapperSide) {
      // https://github.com/jakiestfu/Snap.js/#--how-do-i-make-a-toggle-button
      function toggleLeft(snapper) {
        if (snapper.state().state == 'left') {
          snapper.close();
        }
        else {
          hideRightAndShowLeft();
          snapper.open('left');
        }
      }
      function toggleRight(snapper) {
        if (snapper.state().state === 'right') {
          snapper.close();
        } else {
          hideLeftAndShowRight();
          snapper.open('right');
        }
      }
      if (snappers[snapperSide] && snappers[snapperSide].snapper) {
        if (snapperSide === 'left') toggleLeft(snappers[snapperSide].snapper);
        else if (snapperSide === 'right') toggleRight(snappers[snapperSide].snapper);
      }
    },
    toggleSnappersSticky: function(isSticky) {
      isSnapperSticky = isSticky;
      for (var snapper in snappers) {
        if (snappers.hasOwnProperty(snapper)) {
          if (snappers[snapper].isDraggable) {
            if (isSnapperSticky) snappers[snapper].snapper.disable();
            else snappers[snapper].snapper.enable();
          }
        }
      }
    },
    getIsSticky: function() {
      return isSnapperSticky;
    },
    registerAnimatedCallback: function(animatedCallback, snapperSide, id) {
      if (!animatedCallbacks[snapperSide]) animatedCallbacks[snapperSide] = [];
      else {
        for (var i = 0, len = animatedCallbacks[snapperSide].length; i < len; i++) {
          if (animatedCallbacks[snapperSide][i].id === id) {
            // Already registered, replace callback
            animatedCallbacks[snapperSide][i].callback = animatedCallback;
            return;
          }
        }
      }
      animatedCallbacks[snapperSide].push({
        callback: animatedCallback,
        id: id});
    },
    registerCloseCallback: function(callback, snapperSide) {
      if (snappers[snapperSide] && snappers[snapperSide].snapper)
        snappers[snapperSide].snapper.on('close', callback);
    },
    registerEndCallback: function(callback, snapperSide) {
      if (snappers[snapperSide] && snappers[snapperSide].snapper)
        snappers[snapperSide].snapper.on('end', paneReleased);
      function paneReleased() {
        callback(snappers[snapperSide].snapper.state());
      }
    },
    disableSliding: function(snapperSide) {
      if (!drawerSlidingDisabled) {
        if (snappers[snapperSide] && snappers[snapperSide].snapper) {
          snappers[snapperSide].snapper.disable();
          drawerSlidingDisabled = true;
        }
      }
    },
    enableSliding: function(snapperSide) {
      if (drawerSlidingDisabled) {
        if (snappers[snapperSide] && snappers[snapperSide].snapper) {
          snappers[snapperSide].snapper.enable();
          drawerSlidingDisabled = false;
        }
      }
    },
    getState: function(snapperSide) {
      if (snapperExists(snapperSide)) {
        return snappers[snapperSide].snapper.state().state;
      }
    },
    isSnapperClosed: function(snapperSide) {
      if (snapperExists(snapperSide)) return snappers[snapperSide].snapper.state().state === 'closed';
    },
    isSnapperOpen: function(snapperSide) {
      if (snapperExists(snapperSide)) {
        if (snapperSide === 'left') return snappers[snapperSide].snapper.state().state === 'left';
        else if (snapperSide === 'right') return snappers[snapperSide].snapper.state().state === 'right';
      }
    },
    setSnapperVisible: function(snapperSide) {
      if (snapperSide === 'left') {
        hideRightAndShowLeft();
      }
    }
  };
}
angular.module('em.base').factory('SnapService', SnapService);

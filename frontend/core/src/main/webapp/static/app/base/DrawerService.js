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

 function DrawerService() {

  var snappers = {};

  // CALLBACKS

  function snapperClose(drawerSide){
    executeSnapperCloseCallbacks(drawerSide);
  }

  function snapperOpen(drawerSide){
    if (drawerSide === 'left'){
      hideRightAndShowLeft();
    }else{
      hideLeftAndShowRight();
    }
    executeSnapperOpenCallbacks(drawerSide);
  }

  function snapperStartDrag(snapperSide) {
    if (snapperSide === 'left') {
      hideRightAndShowLeft();
    }
    else if (snapperSide === 'right') {
      hideLeftAndShowRight();
    }
  }

  function executeSnapperAnimatedCallbacks(snapperSide) {
    // drawer is open when state is left or right
    if (snappers[snapperSide].snapper.state().state === snapperSide) {
      snappers[snapperSide].isOpen = true;
      for (var openId in snappers[snapperSide].openedCallbacks) {
        if (snappers[snapperSide].openedCallbacks.hasOwnProperty(openId))
          snappers[snapperSide].openedCallbacks[openId]();
      }
    }
    if (snappers[snapperSide].snapper.state().state === 'closed') {
      snappers[snapperSide].isOpen = false;
      for (var closeId in snappers[snapperSide].closedCallbacks) {
        if (snappers[snapperSide].closedCallbacks.hasOwnProperty(closeId))
          snappers[snapperSide].closedCallbacks[closeId]();
      }
    }
  }

  function executeSnapperDraggerReleasedCallbacks(snapperSide) {
    // This if statement is according to current understanding the most reliable (yet not the most intuitive)
    // way to detect that the drawer is closing.
    var drawerState = snappers[snapperSide].snapper.state();
    var drawerDirection;
    if (drawerState.info.opening === snapperSide &&
        drawerState.info.towards === snapperSide &&
        drawerState.info.flick)
    {
      drawerDirection = 'closing';
    } else if (drawerState.info.towards !== snapperSide && drawerState.info.flick) {
      drawerDirection = 'opening';
    }

    for (var id in snappers[snapperSide].handleReleasedCallbacks) {
      if (snappers[snapperSide].handleReleasedCallbacks.hasOwnProperty(id))
        snappers[snapperSide].handleReleasedCallbacks[id](drawerDirection);
    }
  }

  function executeSnapperCloseCallbacks(snapperSide) {
    for (var id in snappers[snapperSide].closeCallbacks) {
      if (snappers[snapperSide].closeCallbacks.hasOwnProperty(id))
        snappers[snapperSide].closeCallbacks[id]();
    }
  }

  function executeSnapperOpenCallbacks(snapperSide) {
    for (var id in snappers[snapperSide].openCallbacks) {
      if (snappers[snapperSide].openCallbacks.hasOwnProperty(id))
        snappers[snapperSide].openCallbacks[id]();
    }
  }

  // PRIVATE METHODS

  function hideRightAndShowLeft() {
    if (snapperExists('left') && snapperExists('right')){
      if (snappers['right'].drawerElement.style.display !== 'none')
        snappers['right'].drawerElement.style.display = 'none';

      if (snappers['left'].drawerElement.style.display !== 'block')
        snappers['left'].drawerElement.style.display = 'block';
    }
  }

  function hideLeftAndShowRight() {
    if (snapperExists('left') && snapperExists('right')){
      if (snappers['left'].drawerElement.style.display !== 'none')
        snappers['left'].drawerElement.style.display = 'none';

      if (snappers['right'].drawerElement.style.display !== 'block')
        snappers['right'].drawerElement.style.display = 'block';
    }
  }

  function snapperExists(snapperSide) {
    if (snappers[snapperSide] && snappers[snapperSide].snapper) return true;
  }

  function createDrawerSkeleton() {
    return {
      openCallbacks: {},
      closeCallbacks: {},
      openedCallbacks: {},
      closedCallbacks: {},
      handleReleasedCallbacks: {}
    };
  }

  return {

    // INITIALIZATION

    setupDrawer: function(drawerSide, settings) {
      if (!snappers[drawerSide]){
        snappers[drawerSide] = createDrawerSkeleton();
      }

      if (!snappers[drawerSide].snapper) {
        // Snapper not created yet
        snappers[drawerSide].snapper = new Snap(settings);
        snappers[drawerSide].isDraggable = settings.touchToDrag ? true : false;

        if (snappers[drawerSide].isDraggable) {
          snappers[drawerSide].snapper.on('start', function() {
            snapperStartDrag(drawerSide);
          });
          snappers[drawerSide].snapper.enable();
        }
        else{
          snappers[drawerSide].snapper.disable();
        }

        snappers[drawerSide].snapper.on('animated', function() {
          executeSnapperAnimatedCallbacks(drawerSide);
        });
        snappers[drawerSide].snapper.on('end', function(){
          executeSnapperDraggerReleasedCallbacks(drawerSide);
        });

        snappers[drawerSide].snapper.on('close', function(){
          snapperClose(drawerSide);
        });

        snappers[drawerSide].snapper.on('open', function(){
          snapperOpen(drawerSide);
        });

      } else {
        // Snapper created already, update settings
        snappers[drawerSide].snapper.settings(settings);

        // touchToDrag can not be updated with the settings method above
        if (settings.touchToDrag) this.enableDragging(drawerSide);
        else this.disableDragging(drawerSide);
      }
    },
    deleteDrawer: function(drawerSide) {
      if (snapperExists(drawerSide))
        delete snappers[drawerSide].snapper;
    },
    setDrawerElement: function(drawerSide, drawerElement) {
      if (!snappers[drawerSide]){
        snappers[drawerSide] = createDrawerSkeleton();
      }
      snappers[drawerSide].drawerElement = drawerElement;
    },
    getDrawerElement: function(drawerSide) {
      if (snappers[drawerSide]) return snappers[drawerSide].drawerElement;
    },
    // NOTE: Call here needs to be _after_  setupDrawer has been called!
    setHandleElement: function(drawerSide, handleElement) {
      snappers[drawerSide].snapper.settings({dragger: handleElement});
    },
    // NOTE: Call here needs to be _after_  setupDrawer has been called!
    setOverrideAisleElement: function(drawerSide, element) {
      snappers[drawerSide].snapper.settings({overrideElement: element});
      snappers[drawerSide].snapper.addOverrideListeningElementEvents(element);
    },

    // MANIPULATION

    open: function(drawerSide) {
      if (snapperExists(drawerSide)){
        if (drawerSide === 'left' && snappers[drawerSide].snapper.state().state !== 'left'){
          snappers[drawerSide].snapper.open('left');
        } else if (drawerSide === 'right' && snappers[drawerSide].snapper.state().state !== 'right'){
          snappers[drawerSide].snapper.open('right');
        }
      }
    },
    close: function(drawerSide) {
      if (snapperExists(drawerSide) && snappers[drawerSide].snapper.state().state === drawerSide){
        snappers[drawerSide].snapper.close();
      }
    },
    toggle: function(drawerSide) {
      if (snapperExists(drawerSide)){
        if (snappers[drawerSide].snapper.state().state === drawerSide){
          this.close(drawerSide);
        }else {
          this.open(drawerSide);
        }
      }
    },
    disableDragging: function(drawerSide) {
      if (snapperExists(drawerSide) && snappers[drawerSide].isDraggable) {
        snappers[drawerSide].snapper.disable();
        snappers[drawerSide].isDraggable = false;
      }
    },
    enableDragging: function(drawerSide) {
      if (snapperExists(drawerSide) && !snappers[drawerSide].isDraggable) {
        snappers[drawerSide].snapper.enable();
        snappers[drawerSide].isDraggable = true;
      }
    },
    isDraggingEnabled: function(drawerSide) {
      if (snapperExists(drawerSide)){
        return snappers[drawerSide].isDraggable;
      }
    },
    isOpen: function(drawerSide) {
      if (snapperExists(drawerSide)) return snappers[drawerSide].isOpen;
    },

    // CALLBACK REGISTRATION

    registerOpenedCallback: function(drawerSide, callback, id) {
      if (!snappers[drawerSide]){
        snappers[drawerSide] = createDrawerSkeleton();
      }
      snappers[drawerSide].openedCallbacks[id] = callback;
    },
    registerClosedCallback: function(drawerSide, callback, id) {
      if (!snappers[drawerSide]){
        snappers[drawerSide] = createDrawerSkeleton();
      }
      snappers[drawerSide].closedCallbacks[id] = callback;
    },
    registerCloseCallback: function(drawerSide, callback, id) {
      if (!snappers[drawerSide]){
        snappers[drawerSide] = createDrawerSkeleton();
      }
      snappers[drawerSide].closeCallbacks[id] = callback;
    },
    registerOpenCallback: function(drawerSide, callback, id) {
      if (!snappers[drawerSide]){
        snappers[drawerSide] = createDrawerSkeleton();
      }
      snappers[drawerSide].openCallbacks[id] = callback;
    },
    registerHandleReleasedCallback: function(drawerSide, callback, id) {
      if (!snappers[drawerSide]){
        snappers[drawerSide] = createDrawerSkeleton();
      }
      snappers[drawerSide].handleReleasedCallbacks[id] = callback;
    }
  };
}
angular.module('em.base').factory('DrawerService', DrawerService);

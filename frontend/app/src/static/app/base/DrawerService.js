/* Copyright 2013-2016 Extended Mind Technologies Oy
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

 function DrawerService($q) {

  var drawers = {};
  var executeOpenedCallbacksDeferred;

  // CALLBACKS

  function executeSnapperDraggerReleasedCallbacks(drawerSide) {
    // This if statement is according to current understanding the most reliable (yet not the most intuitive)
    // way to detect that the drawer is closing.
    var snapperState = drawers[drawerSide].snapper.state();
    if (snapperState.info.opening === drawerSide &&
        snapperState.info.towards === drawerSide &&
        snapperState.info.flick)
    {
      executeDrawerAboutToCloseCallbacks(drawerSide);
    } else if (snapperState.info.towards !== drawerSide && snapperState.info.flick) {
      executeDrawerAboutToOpenCallbacks(drawerSide);
    }
  }

  function executeOnDrawerCloseCallbacks(drawerSide) {
    drawers[drawerSide].closing = true;
    for (var id in drawers[drawerSide].onCloseCallbacks) {
      if (drawers[drawerSide].onCloseCallbacks.hasOwnProperty(id))
        drawers[drawerSide].onCloseCallbacks[id]();
    }
  }

  function executeOnDrawerOpenCallbacks(drawerSide) {
    drawers[drawerSide].opening = true;
    for (var id in drawers[drawerSide].onOpenCallbacks) {
      if (drawers[drawerSide].onOpenCallbacks.hasOwnProperty(id))
        drawers[drawerSide].onOpenCallbacks[id]();
    }
  }

  function executeOnDrawerExpandCallbacks(drawerSide) {
    drawers[drawerSide].isExpanded = true;
    for (var id in drawers[drawerSide].onExpandCallbacks) {
      if (drawers[drawerSide].onExpandCallbacks.hasOwnProperty(id))
        drawers[drawerSide].onExpandCallbacks[id]();
    }
  }

  function executeOnDrawerExpandResetCallbacks(drawerSide) {
    drawers[drawerSide].isExpanded = false;
    for (var id in drawers[drawerSide].onExpandResetCallbacks) {
      if (drawers[drawerSide].onExpandResetCallbacks.hasOwnProperty(id))
        drawers[drawerSide].onExpandResetCallbacks[id]();
    }
  }

  function executeDrawerAboutToCloseCallbacks(drawerSide) {
    for (var id in drawers[drawerSide].aboutToCloseCallbacks) {
      if (drawers[drawerSide].aboutToCloseCallbacks.hasOwnProperty(id))
        drawers[drawerSide].aboutToCloseCallbacks[id]();
    }
  }

  function executeDrawerAboutToOpenCallbacks(drawerSide) {
    for (var id in drawers[drawerSide].aboutToOpenCallbacks) {
      if (drawers[drawerSide].aboutToOpenCallbacks.hasOwnProperty(id))
        drawers[drawerSide].aboutToOpenCallbacks[id]();
    }
  }

  function executeSnapperAnimatedCallbacks(drawerSide) {
    if (drawers[drawerSide].snapper.state().state === drawerSide && !drawers[drawerSide].isOpen) {
      // Drawer is open when state is left or right. Don't execute callbacks if already open.
      // Animated is triggered on every swipe to handle!
      executeDrawerOpenedCallbacks(drawerSide);
    } else if (drawers[drawerSide].snapper.state().state === 'closed') {
      if (drawers[drawerSide].isExpanded) executeOnDrawerExpandResetCallbacks(drawerSide);
      executeDrawerClosedCallbacks(drawerSide);
    }
  }

  function executeDrawerOpenedCallbacks(drawerSide) {
    drawers[drawerSide].isOpen = true;
    drawers[drawerSide].opening = false;
    executeOpenedCallbacksDeferred = $q.defer();
    for (var openId in drawers[drawerSide].openedCallbacks) {
      if (drawers[drawerSide].openedCallbacks.hasOwnProperty(openId))
        drawers[drawerSide].openedCallbacks[openId]();
    }
    executeOpenedCallbacksDeferred.resolve();
    executeOpenedCallbacksDeferred = undefined;
  }

  function executeDrawerClosedCallbacks(drawerSide) {
    drawers[drawerSide].isOpen = false;
    drawers[drawerSide].closing = false;
    for (var closeId in drawers[drawerSide].closedCallbacks) {
      if (drawers[drawerSide].closedCallbacks.hasOwnProperty(closeId))
        drawers[drawerSide].closedCallbacks[closeId]();
    }
  }

  function executeDrawerInitializedCallbacks(drawerSide) {
    var initializedCallbacks = drawers[drawerSide].initializedCallbacks;
    if (initializedCallbacks) {
      for (var i = 0; i < initializedCallbacks.length; i++) {
        initializedCallbacks[i](drawerSide);
      }
      initializedCallbacks = [];
    }
  }

  // PRIVATE METHODS
  function isDrawerCreated(drawerSide) {
    return drawers[drawerSide] && drawers[drawerSide].created;
  }

  function snapperExists(drawerSide) {
    return drawers[drawerSide] && drawers[drawerSide].snapper;
  }

  function createDrawerSkeleton() {
    return {
      onOpenCallbacks: {},
      onCloseCallbacks: {},
      onExpandCallbacks: {},
      onExpandResetCallbacks: {},
      aboutToOpenCallbacks: {},
      aboutToCloseCallbacks: {},
      openedCallbacks: {},
      closedCallbacks: {},
      initializedCallbacks: []
    };
  }

  function initializeDrawer(drawerSide, settings) {
    if (settings.moveAisle) initializeSnapper(drawerSide, settings);
    drawers[drawerSide].created = true;
  }

  function reinitializeDrawer(drawerSide, settings) {
    if (settings.moveAisle) {
      if (drawers[drawerSide].handleElement) {
        settings.dragger = drawers[drawerSide].handleElement;
      }
      if (drawers[drawerSide].overrideElement) {
        settings.overrideElement = drawers[drawerSide].overrideElement;
      }
      if (!snapperExists(drawerSide)) {
        initializeSnapper(drawerSide, settings);
      } else {
        reinitializeSnapper(drawerSide, settings);
      }
    } else if (snapperExists(drawerSide)) {
      // Delete leftover snapper.
      delete drawers[drawerSide].snapper;
    }
  }

  function initializeSnapper(drawerSide, settings) {
    drawers[drawerSide].snapper = new Snap(settings);
    attachCallbacks(drawerSide);
  }

  function reinitializeSnapper(drawerSide, settings) {
    drawers[drawerSide].snapper.settings(settings);
    // Call functions because touchToDrag can not be updated within the settings parameter above.
    if (settings.touchToDrag) drawers[drawerSide].snapper.enable();
    else drawers[drawerSide].snapper.disable();
  }

  function attachCallbacks(drawerSide) {
    drawers[drawerSide].snapper.on('animated', function() {
      executeSnapperAnimatedCallbacks(drawerSide);
    });
    drawers[drawerSide].snapper.on('end', function(){
      executeSnapperDraggerReleasedCallbacks(drawerSide);
    });
    drawers[drawerSide].snapper.on('close', function(){
      executeOnDrawerCloseCallbacks(drawerSide);
    });
    drawers[drawerSide].snapper.on('open', function(){
      executeOnDrawerOpenCallbacks(drawerSide);
    });
  }

  return {

    // INITIALIZATION

    setupDrawer: function(drawerSide, settings) {
      if (!drawers[drawerSide]){
        drawers[drawerSide] = createDrawerSkeleton();
      }
      // Update state parameters
      drawers[drawerSide].moveAisle = settings.moveAisle;
      drawers[drawerSide].isDraggable = settings.touchToDrag;
      drawers[drawerSide].preventDrag = !settings.touchToDrag;

      if (!drawers[drawerSide].created) initializeDrawer(drawerSide, settings); // Drawer not created yet
      else reinitializeDrawer(drawerSide, settings);  // Drawer created already, update settings

      executeDrawerInitializedCallbacks(drawerSide);
    },
    deleteDrawer: function(drawerSide) {
      if (snapperExists(drawerSide)) delete drawers[drawerSide].snapper;  // Delete Snap.js instance.
      if (drawers[drawerSide]) delete drawers[drawerSide];                // Then delete the whole object.
    },
    setDrawerElement: function(drawerSide, drawerElement) {
      if (!drawers[drawerSide]){
        drawers[drawerSide] = createDrawerSkeleton();
      }
      drawers[drawerSide].drawerElement = drawerElement;
    },
    getDrawerElement: function(drawerSide) {
      if (drawers[drawerSide]) return drawers[drawerSide].drawerElement;
    },
    // NOTE: Call here needs to be _after_  setupDrawer has been called!
    setHandleElement: function(drawerSide, handleElement) {
      if (isDrawerCreated(drawerSide)) {
        drawers[drawerSide].handleElement = handleElement;
      }
      if (snapperExists(drawerSide)) drawers[drawerSide].snapper.settings({dragger: handleElement});
    },
    // NOTE: Call here needs to be _after_  setupDrawer has been called!
    setOverrideAisleElement: function(drawerSide, element) {
      if (isDrawerCreated(drawerSide)) {
        drawers[drawerSide].overrideElement = element;
      }
      if (snapperExists(drawerSide)) {
        drawers[drawerSide].snapper.settings({overrideElement: element});

        if (drawers[drawerSide].isDraggable) {
          drawers[drawerSide].snapper.addOverrideListeningElementEvents(element);
        }
      }
    },

    // MANIPULATION

    open: function(drawerSide, speed) {
      if (snapperExists(drawerSide)){
        if (drawerSide === 'left' && drawers[drawerSide].snapper.state().state !== 'left'){
          drawers[drawerSide].snapper.open('left', speed);
        } else if (drawerSide === 'right' && drawers[drawerSide].snapper.state().state !== 'right'){
          drawers[drawerSide].snapper.open('right', speed);
        }
      } else if (isDrawerCreated(drawerSide) && !drawers[drawerSide].moveAisle) {
        // Just execute callbacks.
        executeOnDrawerOpenCallbacks(drawerSide);
        executeDrawerOpenedCallbacks(drawerSide);
      }
    },
    close: function(drawerSide, speed) {
      if (snapperExists(drawerSide) && drawers[drawerSide].snapper.state().state === drawerSide) {
        if (drawers[drawerSide].isExpanded) executeOnDrawerExpandResetCallbacks(drawerSide);
        drawers[drawerSide].snapper.close(speed);
      }
      else if (isDrawerCreated(drawerSide) && !drawers[drawerSide].moveAisle) {
        // Just execute callbacks.
        if (drawers[drawerSide].isExpanded) executeOnDrawerExpandResetCallbacks(drawerSide);
        executeOnDrawerCloseCallbacks(drawerSide);
        executeDrawerAboutToCloseCallbacks(drawerSide);
        executeDrawerClosedCallbacks(drawerSide);
      }
    },
    toggleExpand: function(drawerSide) {
      if (drawers[drawerSide].isExpanded) executeOnDrawerExpandResetCallbacks(drawerSide);
      else executeOnDrawerExpandCallbacks(drawerSide);
    },
    toggle: function(drawerSide) {
      var drawerOpen;
      if (snapperExists(drawerSide)){
        if (drawers[drawerSide].snapper.state().state === drawerSide) {
          this.close(drawerSide);
        } else {
          this.open(drawerSide);
          drawerOpen = true;
        }
      }
      return drawerOpen;
    },
    disableDragging: function(drawerSide) {
      if (!drawers[drawerSide]) {
        // Create skeleton.
        drawers[drawerSide] = createDrawerSkeleton();
      }

      if (!snapperExists(drawerSide) && !(isDrawerCreated(drawerSide) && !drawers[drawerSide].moveAisle)) {
        // Push into created callbacks.
        drawers[drawerSide].initializedCallbacks.push(this.disableDragging);
      } else if (drawers[drawerSide].isDraggable) {
        drawers[drawerSide].snapper.disable();
        drawers[drawerSide].isDraggable = false;
      }
    },
    enableDragging: function(drawerSide) {
      if (snapperExists(drawerSide) && !drawers[drawerSide].preventDrag && !drawers[drawerSide].isDraggable) {
        drawers[drawerSide].snapper.enable();
        drawers[drawerSide].isDraggable = true;
      }
    },
    isDraggingEnabled: function(drawerSide) {
      return snapperExists(drawerSide) && drawers[drawerSide].isDraggable;
    },
    isOpening: function(drawerSide) {
      return isDrawerCreated(drawerSide) && drawers[drawerSide].opening;
    },
    isClosing: function(drawerSide) {
      return isDrawerCreated(drawerSide) && drawers[drawerSide].closing;
    },
    isOpen: function(drawerSide) {
      return isDrawerCreated(drawerSide) && drawers[drawerSide].isOpen;
    },
    isExpanded: function(drawerSide) {
      return isDrawerCreated(drawerSide) && drawers[drawerSide].isExpanded;
    },
    resetPosition: function(drawerSide) {
      if (snapperExists(drawerSide) && drawerSide === 'right') {
        drawers[drawerSide].snapper.resetToMinPosition();
      }
    },
    translateTo: function(drawerSide, x) {
      if (snapperExists(drawerSide)) {
        drawers[drawerSide].snapper.translateTo(x);
      }
    },
    setDrawerMinPosition: function(drawerSide, x) {
      if (snapperExists(drawerSide)) {
        drawers[drawerSide].snapper.setMinPosition(x);
      }
    },

    // CALLBACK REGISTRATION

    registerOpenedCallback: function(drawerSide, callback, id) {
      if (!drawers[drawerSide]){
        drawers[drawerSide] = createDrawerSkeleton();
      }
      drawers[drawerSide].openedCallbacks[id] = callback;
    },
    registerClosedCallback: function(drawerSide, callback, id) {
      if (!drawers[drawerSide]){
        drawers[drawerSide] = createDrawerSkeleton();
      }
      drawers[drawerSide].closedCallbacks[id] = callback;
    },
    registerAboutToOpenCallback: function(drawerSide, callback, id) {
      if (!drawers[drawerSide])
        drawers[drawerSide] = createDrawerSkeleton();
      drawers[drawerSide].aboutToOpenCallbacks[id] = callback;
    },
    registerAboutToCloseCallback: function(drawerSide, callback, id) {
      if (!drawers[drawerSide])
        drawers[drawerSide] = createDrawerSkeleton();
      drawers[drawerSide].aboutToCloseCallbacks[id] = callback;
    },
    registerOnCloseCallback: function(drawerSide, callback, id) {
      if (!drawers[drawerSide]){
        drawers[drawerSide] = createDrawerSkeleton();
      }
      drawers[drawerSide].onCloseCallbacks[id] = callback;
    },
    registerOnOpenCallback: function(drawerSide, callback, id) {
      if (!drawers[drawerSide]){
        drawers[drawerSide] = createDrawerSkeleton();
      }
      drawers[drawerSide].onOpenCallbacks[id] = callback;
    },
    registerOnExpandCallback: function(drawerSide, callback, id) {
      if (!drawers[drawerSide]){
        drawers[drawerSide] = createDrawerSkeleton();
      }
      drawers[drawerSide].onExpandCallbacks[id] = callback;
    },
    registerOnExpandResetCallback: function(drawerSide, callback, id) {
      if (!drawers[drawerSide]){
        drawers[drawerSide] = createDrawerSkeleton();
      }
      drawers[drawerSide].onExpandResetCallbacks[id] = callback;
    },
    getExecuteOpenedCallbacksPromise: function() {
      if (executeOpenedCallbacksDeferred)
        return executeOpenedCallbacksDeferred.promise;
    }
  };
}
DrawerService['$inject'] = ['$q'];
angular.module('em.base').factory('DrawerService', DrawerService);

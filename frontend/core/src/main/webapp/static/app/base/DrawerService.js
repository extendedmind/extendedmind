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
      aboutToOpenCallbacks: {},
      aboutToCloseCallbacks: {},
      openedCallbacks: {},
      closedCallbacks: {},
      initializedCallbacks: []
    };
  }

  return {

    // INITIALIZATION

    setupDrawer: function(drawerSide, settings) {
      function attachCallbacks() {
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

      if (!drawers[drawerSide]){
        drawers[drawerSide] = createDrawerSkeleton();
      }
      drawers[drawerSide].moveAisle = settings.moveAisle;

      if (!drawers[drawerSide].created) {
        // Drawer not created yet
        drawers[drawerSide].isDraggable = settings.touchToDrag;
        drawers[drawerSide].preventDrag = !settings.touchToDrag;

        if (settings.moveAisle) {
          drawers[drawerSide].snapper = new Snap(settings);
          if (settings.touchToDrag) drawers[drawerSide].snapper.enable();
          else drawers[drawerSide].snapper.disable();
          attachCallbacks();
        }
        drawers[drawerSide].created = true;
      } else {
        // Drawer created already, update settings
        drawers[drawerSide].preventDrag = !settings.touchToDrag;

        if (settings.moveAisle) {
          if (!snapperExists(drawerSide)) {
            drawers[drawerSide].snapper = new Snap(settings);
            attachCallbacks();
          } else {
            drawers[drawerSide].snapper.settings(settings);
          }

          // Call functions because touchToDrag can not be updated within the settings parameter above.
          if (settings.touchToDrag) {
            this.enableDragging(drawerSide);
          } else {
            this.disableDragging(drawerSide);
          }
        } else if (snapperExists(drawerSide)) {
          // Delete leftover snapper.
          delete drawers[drawerSide].snapper;
        }
      }
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
      if (snapperExists(drawerSide)) drawers[drawerSide].snapper.settings({dragger: handleElement});
    },
    // NOTE: Call here needs to be _after_  setupDrawer has been called!
    setOverrideAisleElement: function(drawerSide, element) {
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
    close: function(drawerSide) {
      if (snapperExists(drawerSide) && drawers[drawerSide].snapper.state().state === drawerSide) {
        drawers[drawerSide].snapper.close();
      }
      else if (isDrawerCreated(drawerSide) && !drawers[drawerSide].moveAisle) {
        // Just execute callbacks.
        executeOnDrawerCloseCallbacks(drawerSide);
        executeDrawerAboutToCloseCallbacks(drawerSide);
        executeDrawerClosedCallbacks(drawerSide);
      }
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
      if (snapperExists(drawerSide) &&
          !drawers[drawerSide].preventDrag && !drawers[drawerSide].isDraggable)
      {
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
    resetPosition: function(drawerSide) {
      if (snapperExists(drawerSide) && drawerSide === 'right') {
        drawers[drawerSide].snapper.resetToMinPosition();
      }
    },
    setDrawerTranslate: function(drawerSide, x) {
      if (snapperExists(drawerSide)) {
        drawers[drawerSide].snapper.translate(x);
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
    getExecuteOpenedCallbacksPromise: function() {
      if (executeOpenedCallbacksDeferred)
        return executeOpenedCallbacksDeferred.promise;
    }
  };
}
DrawerService['$inject'] = ['$q'];
angular.module('em.base').factory('DrawerService', DrawerService);

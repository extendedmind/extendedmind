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
          minDragDistance: 0
        });
        if (draggerElement) {
          snapper.settings({dragger: draggerElement});
        }
      }
    },
    deleteSnapper: function() {
      if (snapper) {
        snapper.disable();
      }
    },
    setDraggerElement: function(element) {
      draggerElement = element;
      if (snapper) {
        snapper.settings({dragger: draggerElement});
      }
    },
    toggle: function() {
      // https://github.com/jakiestfu/Snap.js/#--how-do-i-make-a-toggle-button
      if(snapper.state().state == 'left') {
        snapper.close();
      } else {
        snapper.open('left');
      }
    },
    registerAnimatedCallback: function(callback) {
      // http://stackoverflow.com/a/3458612
      snapper.on('animated', snapAnimated);
      function snapAnimated() {
        callback(snapper.state().state);
      }
    },
    registerCloseCallback: function(callback) {
      snapper.on('close', callback);
    },
    registerEndCallback: function(callback) {
      snapper.on('end', paneReleased);
      function paneReleased() {
        callback(snapper);
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
    }
  };
}
angular.module('common').factory('SnapService', SnapService);

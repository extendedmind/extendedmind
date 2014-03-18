'use strict';

function SnapService($q) {
  var snapper;

  return {
    createSnapper: function(element) {
      snapper = new Snap({
        element: element,
        disable: 'right'  // use left only
      });
    },
    updateSettings: function(settings) {
      snapper.settings(settings);
    },
    toggle: function() {
      // https://github.com/jakiestfu/Snap.js/#--how-do-i-make-a-toggle-button
      if(snapper.state().state == 'left') {
        snapper.close();
      } else {
        snapper.open('left');
      }
    },
    disableSliding: function() {
      return $q.when(snapper.disable());
    },
    enableSliding: function() {
      return $q.when(snapper.enable());
    },
    registerOpenCallback: function(callback) {
      snapper.on('open', callback);
    },
    registerCloseCallback: function(callback) {
      snapper.on('close', callback);
    },
    registerAnimatedCallback: function(callback) {
      // http://stackoverflow.com/a/3458612
      snapper.on('animated', snapAnimated);
      function snapAnimated() {
        callback(snapper);
      }
    },
    unRegisterOpenCallback: function(callback) {
      snapper.off('open', callback);
    },
    unRegisterCloseCallback: function(callback) {
      snapper.off('close', callback);
    }
  };
}
SnapService.$inject = ['$q'];
angular.module('common').factory('SnapService', SnapService);

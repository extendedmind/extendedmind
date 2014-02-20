'use strict';

function UUIDService() {

  function s4(){
    return Math.floor((1 + Math.random()) * 0x10000)
    .toString(16)
    .substring(1);
  }

  return {
    randomUUID: function() {
      return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
      s4() + '-' + s4() + s4() + s4();
    },
    // Returns a fake UUID, that start with 6
    // bytes of zeros, e.g.:
    // 00000000-0000-4629-8552-96671b73e0f6
    generateFakeUUID: function() {
      return '00000000-0000-' + s4() + '-' +
      s4() + '-' + s4() + s4() + s4();
    },
    isFakeUUID: function(uuid) {
      if (uuid && uuid.startsWith('00000000-0000-'))
        return true;
    }
  };
}
angular.module('common').factory('UUIDService', UUIDService);

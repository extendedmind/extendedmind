'use strict';

function OwnerService(SessionStorageService) {
  var ownerPrefix = 'my';

  function setOwnerPrefix(owner) {
    ownerPrefix = owner;
  }

  return {
    setCollectivePrefix: function() {
      setOwnerPrefix('collective' + '/' + SessionStorageService.getActiveUUID());
    },
    setMyPrefix: function() {
      setOwnerPrefix('my');
    },
    getOwnerPrefix: function() {
      return ownerPrefix;
    }
  };
}
OwnerService['$inject'] = ['SessionStorageService'];
angular.module('em.services').factory('OwnerService', OwnerService);

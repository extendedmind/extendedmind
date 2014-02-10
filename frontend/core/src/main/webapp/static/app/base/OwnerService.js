'use strict';

function OwnerService(SessionStorageService) {
  var prefix = 'my';

  return {
    setCollectivePrefix: function() {
      this.setPrefix('collective' + '/' + SessionStorageService.getActiveUUID());
    },
    setMyPrefix: function() {
      this.setPrefix('my');
    },
    setPrefix: function(name) {
      prefix = name;
    },
    getPrefix: function() {
      return prefix;
    }
  };
}
OwnerService['$inject'] = ['SessionStorageService'];
angular.module('em.services').factory('OwnerService', OwnerService);

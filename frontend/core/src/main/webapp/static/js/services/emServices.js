/*global angular*/

( function() {'use strict';

    angular.module('em.services').value('version', 0.1);

    angular.module('em.services').factory('Enum', [
    function() {
      var pageIndex = {
        my : {
          notes : 1,
          my : 0,
          tasks : 1
        }
      };
      return pageIndex;
    }]);

  }());

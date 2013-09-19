/*global angular*/

( function() {'use strict';

    angular.module('em.services').value('version', 0.1);

    angular.module('em.services').factory('Enum', [
    function() {
      var pageIndex = {
        my : {
          notes : 0,
          my : 1,
          tasks : 2
        }
      };
      return pageIndex;
    }]);

  }());

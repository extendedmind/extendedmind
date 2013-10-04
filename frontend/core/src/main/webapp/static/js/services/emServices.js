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

    angular.module('em.services').factory('disableCarousel', [
    function() {
      var swiping;

      return {
        setSwiping : function(swipe) {
          this.swiping = swipe;
        },
        getSwiping : function() {
          return this.swiping;
        }
      };
    }]);

  }());

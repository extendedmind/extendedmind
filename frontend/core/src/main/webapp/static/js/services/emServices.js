/*global angular*/

( function() {'use strict';

  angular.module('em.services').factory('userPrefix', ['userSessionStorage',
    function(userSessionStorage) {
      var prefix = 'my';

      return {
        setCollectivePrefix : function() {
          this.setPrefix('collective' + '/' + userSessionStorage.getActiveUUID());
        },
        setMyPrefix : function() {
          this.setPrefix('my');
        },
        setPrefix : function(name) {
          prefix = name;
        },
        getPrefix : function() {
          return prefix;
        }
      };
    }]);

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

  angular.module('em.services').factory('filterService',[ 
    function() {
      return {
        activeFilters: {today:'tasksByDate',
        project:'projects'}
      };
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

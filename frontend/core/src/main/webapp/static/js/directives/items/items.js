/*global angular*/

( function() {'use strict';

    angular.module('em.directives').directive('itemActions', [
    function() {
      return {
        restrict : 'A',
        templateUrl : 'static/partials/templates/items/itemActions.html'
      };
    }]);
  }());

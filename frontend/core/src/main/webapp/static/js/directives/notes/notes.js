/*global angular*/

( function() {'use strict';

    angular.module('em.directives').directive('notes', [
    function() {
      return {
        restrict : 'A',
        templateUrl : 'static/partials/my/notes.html'
      };
    }]);
  }());

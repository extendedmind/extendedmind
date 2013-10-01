/*global angular*/

( function() {'use strict';

    angular.module('em.directives').directive('itemActions', [
    function() {
      return {
        restrict : 'A',
        templateUrl : 'static/partials/templates/items/itemActions.html',
        link : function(scope, element, attrs) {
          scope.showItemActions = false;
          scope.itemToTaskSuccess = false;
          scope.itemToNoteSuccess = false;

          scope.toggleItemActions = function toggleItemActions() {

            scope.showItemActions = !scope.showItemActions;

            if (scope.showItemActions) {
              scope.selected = 'active-list-item';
            } else {
              scope.selected = '';
            }

          };

          scope.itemToTask = function itemToTask() {
            scope.itemToTaskSuccess = !scope.itemToTaskSuccess;
          };

          scope.itemToNote = function itemToNote() {
            scope.itemToNoteSuccess = !scope.itemToNoteSuccess;
          };
        }
      };
    }]);
  }());

/*global angular*/

( function() {'use strict';

    angular.module('em.directives').directive('itemsList', [
    function() {
      return {
        restrict : 'A',
        templateUrl : 'static/partials/templates/items/itemsList.html',
        transclude : true,
        link : function(scope, element, attrs) {
          scope.showItemsList = false;

          scope.toggleItemsList = function toggleItemsList() {
            scope.showItemsList = !scope.showItemsList;
          };

          var itemsFilterAttr = attrs.itemsfilter;
          scope.$watch(itemsFilterAttr, function(newValue) {
            scope.itemsListFilter = newValue;
          });
        }
      };
    }]);

    angular.module('em.directives').directive('itemActions', [
    function() {
      return {
        restrict : 'A',
        templateUrl : 'static/partials/templates/items/itemActions.html',
        link : function(scope, element, attrs) {
          scope.showItemActions = false;

          scope.toggleItemActions = function toggleItemActions() {

            scope.showItemActions = !scope.showItemActions;

            if (scope.showItemActions) {
              scope.selected = 'active-list-item';
            } else {
              scope.selected = '';
            }

          };
        }
      };
    }]);
  }());

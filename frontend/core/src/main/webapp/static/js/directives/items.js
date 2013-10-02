/*global angular*/

( function() {'use strict';

    angular.module('em.directives').directive('itemsList', ['$swipe', 'disableCarousel',
    function($swipe, disableCarousel) {
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

          $swipe.bind(element, {
            'start' : function(coords) {
              disableCarousel.setSwiping(true);
            },
            'cancel' : function() {
              disableCarousel.setSwiping(false);
            },
            'move' : function(coords) {
            },
            'end' : function(endCoords) {
              disableCarousel.setSwiping(false);
            }
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
          scope.showItemActionSuccess = false;

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

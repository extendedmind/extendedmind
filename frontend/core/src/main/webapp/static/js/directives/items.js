/*global angular */
/*jslint white: true */

( function() {'use strict';

  angular.module('em.directives').directive('itemsList', [
    function() {
      return {
        controller : 'ItemsController',
        restrict : 'A',
        templateUrl : 'static/partials/templates/items/itemsList.html',
        transclude : true,
        link : function(scope, element, attrs) {
          var itemsFilterAttr = attrs.itemsfilter;

          scope.$watch(itemsFilterAttr, function(newValue) {
            scope.itemsListFilter = newValue;
          });
        }
      };
    }]);

  angular.module('em.directives').directive('itemContent', [
    function() {
      return {
        restrict : 'A',
        templateUrl : 'static/partials/templates/items/itemContent.html',
        link : function(scope, element, attrs) {
          scope.showItemContent = false;

          scope.toggleItemContent = function toggleItemContent() {

            scope.showItemContent = !scope.showItemContent;

            if (scope.showItemContent) {
              scope.selected = 'active-list-item';
            } else {
              scope.selected = '';
            }

          };
        }
      };
    }]);
}());

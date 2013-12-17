/*global angular */
'use strict';

angular.module('em.directives').directive('item', [
  function() {
    return {
      restrict: 'A',
      scope: true,
      templateUrl: 'static/partials/templates/items/item.html',
      link: function(scope) {
        scope.showItemContent = false;

        scope.toggleItemContent = function toggleItemContent() {
          scope.showItemContent = !scope.showItemContent;
          if (scope.showItemContent) {
            scope.selected = 'em-active-list-item';
          } else {
            scope.selected = '';
          }
        };
      }
    };
  }]);

angular.module('em.directives').directive('itemContent', [
  function() {
    return {
      restrict: 'A',
      scope: true,
      templateUrl: 'static/partials/templates/items/itemContent.html'
    };
  }]);

angular.module('em.directives').directive('filteredItemsList', [
  function() {
    return {
      controller: 'ItemsController',
      scope: {
        items: '=filteredItemsList',
        itemsListFilter: '=itemsFilter'
      },
      restrict: 'A',
      templateUrl: 'static/partials/templates/items/filteredItemsList.html',
    };
  }]);

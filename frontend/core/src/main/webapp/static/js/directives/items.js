/*jslint white: true */
'use strict';

angular.module('em.directives').directive('item', [
  function() {
    return {
      restrict : 'A',
      templateUrl : 'static/partials/templates/items/item.html',
      transclude : true
    };
  }]);

angular.module('em.directives').directive('filteredItemsList', [
  function() {
    return {
      controller : 'ItemsController',
      scope: {
        items: '=filteredItemsList',
        itemsListFilter: '=itemsFilter'
      },
      restrict : 'A',
      templateUrl : 'static/partials/templates/items/filteredItemsList.html',
    };
  }]);

angular.module('em.directives').directive('itemContent', [
  function() {
    return {
      restrict : 'A',
      templateUrl : 'static/partials/templates/items/itemContent.html',
      link : function(scope, element, attrs) {
        scope.showItemContent = false;

        var itemTypeAttr = attrs.itemtype;

        scope.$watch(itemTypeAttr, function(newValue) {
          scope.itemType = newValue;
        });

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

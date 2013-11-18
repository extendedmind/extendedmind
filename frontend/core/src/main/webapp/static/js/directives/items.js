/*jslint white: true */
'use strict';

angular.module('em.directives').directive('item', [
  function() {
    return {
      controller : 'ItemsController',
      restrict : 'A',
      templateUrl : 'static/partials/templates/items/item.html',
      transclude : true
    };
  }]);

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

        var itemTypeAttr = attrs.itemtype;

        scope.$watch(itemTypeAttr, function(newValue) {
          scope.itemType = newValue;
        });

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

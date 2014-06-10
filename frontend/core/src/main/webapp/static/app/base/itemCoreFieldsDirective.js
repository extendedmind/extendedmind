'use strict';

function itemCoreFieldsDirective() {
  return {
    restrict: 'A',
    scope: {
      item: '=itemCoreFields',
      details: '=?itemCoreFieldsDetails'
    },
    templateUrl: 'static/app/base/itemCoreFields.html',
    link: function(scope) {
      scope.showCoreFields = function(){
        if (scope.item.description || scope.item.link || scope.details.visible){
          return true;
        }
      };
      scope.showUrl = function(){
        if (scope.item.link || scope.details.visible){
          return true;
        }
      };
      scope.showDescription = function(){
        if (scope.item.description || scope.details.visible){
          return true;
        }
      };
      scope.$on('$destroy', function(){
        scope.details.visible = false;
      });
    }
  };
}
itemCoreFieldsDirective.$inject = [];
angular.module('em.directives').directive('itemCoreFields', itemCoreFieldsDirective);

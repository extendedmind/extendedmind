'use strict';

function editHeaderDirective() {
  return {
    restrict: 'A',
    scope: {
      item: '=editHeader',
      itemType: '@editHeader',
      itemEditForm: '=',
      cancelEdit: '&',
      saveItem: '&',
      onDestroy: '&'
    },
    templateUrl: 'static/app/main/editHeader.html',
    link: function postLink(scope) {
      scope.$on('$destroy', function() {
        if (angular.isFunction(scope.onDestroy)) {
          scope.onDestroy();
        }
      });
    }
  };
}
editHeaderDirective.$inject = [];
angular.module('em.directives').directive('editHeader', editHeaderDirective);

'use strict';

function editHeaderDirective() {
  return {
    restrict: 'A',
    scope: {
      item: '=editHeader',
      itemType: '@editHeader',
      itemEditForm: '=',
      cancelEdit: '&',
      saveItem: '&'
    },
    templateUrl: 'static/app/main/editHeader.html'
  };
}
editHeaderDirective.$inject = [];
angular.module('em.directives').directive('editHeader', editHeaderDirective);

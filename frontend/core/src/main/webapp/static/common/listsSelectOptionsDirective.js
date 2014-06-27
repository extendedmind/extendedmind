'use strict';

function listsSelectOptionsDirective() {
  return {
    link: function(scope) {

      scope.addNewListVisible = false;

      scope.isAddNewListVisible = function isAddNewListVisible() {
        return scope.addNewListVisible;
      };
      scope.setAddNewListVisible = function setAddNewListVisible() {
        scope.setUnsavedList();
        scope.addNewListVisible = true;
      };
      scope.setAddNewListHidden = function setAddNewListHidden() {
        scope.clearUnsavedList();
        scope.addNewListVisible = false;
      };

      scope.$on('$destroy', scope.clearUnsavedList);
    }
  };
}
angular.module('common').directive('listsSelectOptions', listsSelectOptionsDirective);

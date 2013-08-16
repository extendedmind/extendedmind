'use strict';

emDirectives.directive('appVersion', ['version',
function(version) {
  return function(scope, element, attrs) {
    return element.text(version);
  };
}]);

emDirectives.directive('itemList', [
function() {
  return {
    restrict : 'A',
    templateUrl : '/static/partials/templates/newItemTemplate.html',
    link : function(scope, element, attrs) {
      scope.show = function() {
        if (scope.item == undefined)
          return false;
        else
          return scope.item.title.length != 0;
      }
    }
  }
}]);

emDirectives.directive('taskEdit', [
function() {
  return {
    restrict : 'A',
    templateUrl : '/static/partials/templates/newTaskTemplate.html',
    link : function(scope, element, attrs) {
      scope.showNewTask = false;

      scope.toggleNewTask = function() {
        scope.showNewTask = !scope.showNewTask;
      }
    }
  }
}]);

emDirectives.directive('noteEdit', [
function() {
  return {
    restrict : 'A',
    templateUrl : '/static/partials/templates/newNoteTemplate.html',
    link : function(scope, element, attrs) {
      scope.showNewNote = false;

      scope.toggleNewNote = function() {
        scope.showNewNote = !scope.showNewNote;
      }
    }
  }
}]);

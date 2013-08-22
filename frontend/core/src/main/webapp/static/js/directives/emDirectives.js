/*global angular*/

( function() {'use strict';

    angular.module('em.directives').directive('appVersion', ['version',
    function(version) {
      return function(scope, element, attrs) {
        return element.text(version);
      };
    }]);

    angular.module('em.directives').directive('errorAlertBar', ['$parse',
    function($parse) {
      return {
        restrict : 'A',
        templateUrl : '/static/partials/templates/errorMessageTemplate.html',
        link : function(scope, elem, attrs) {
          var alertMessageAttr = attrs.alertmessage;
          scope.errorMessage = null;

          scope.$watch(alertMessageAttr, function(newValue) {
            scope.errorMessage = newValue;
          });

          scope.hideAlert = function() {
            scope.errorMessage = null;
            $parse(alertMessageAttr).assign(scope, null);
          };
        }
      };
    }]);

    angular.module('em.directives').directive('urlList', [
    function() {
      return {
        restrict : 'A',
        templateUrl : '/static/partials/templates/urlListTemplate.html'
      };
    }]);

    angular.module('em.directives').directive('itemList', [
    function() {
      return {
        restrict : 'A',
        templateUrl : '/static/partials/templates/newItemTemplate.html',
        link : function(scope, element, attrs) {
          scope.show = function() {
            if (scope.item === undefined) {
              return false;
            }
            return scope.item.title.length !== 0;
          };
        }
      };
    }]);

    angular.module('em.directives').directive('taskEdit', [
    function() {
      return {
        restrict : 'A',
        templateUrl : '/static/partials/templates/newTaskTemplate.html',
        link : function(scope, element, attrs) {
          scope.showNewTask = false;

          scope.toggleNewTask = function() {
            scope.showNewTask = !scope.showNewTask;
          };
        }
      };
    }]);

    angular.module('em.directives').directive('noteEdit', [
    function() {
      return {
        restrict : 'A',
        templateUrl : '/static/partials/templates/newNoteTemplate.html',
        link : function(scope, element, attrs) {
          scope.showNewNote = false;

          scope.toggleNewNote = function() {
            scope.showNewNote = !scope.showNewNote;
          };
        }
      };
    }]);
  }());

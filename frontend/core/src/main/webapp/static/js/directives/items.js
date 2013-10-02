/*global angular*/

( function() {'use strict';

    angular.module('em.directives').directive('newTag', [
    function() {
      return {
        restrict : 'A',
        templateUrl : 'static/partials/templates/newTag.html',
        link : function(scope, element, attrs) {
          scope.showEditNewTag = false;

          scope.editNewTag = function editNewTag() {
            scope.showEditNewTag = !scope.showEditNewTag;
          };
        }
      };
    }]);

    angular.module('em.directives').directive('newTask', [
    function() {
      return {
        restrict : 'A',
        templateUrl : 'static/partials/templates/newTask.html'
      };
    }]);

    angular.module('em.directives').directive('itemsList', ['$swipe', 'disableCarousel',
    function($swipe, disableCarousel) {
      return {
        restrict : 'A',
        templateUrl : 'static/partials/templates/itemsList.html',
        transclude : true,
        link : function(scope, element, attrs) {
          scope.showItemsList = false;

          scope.toggleItemsList = function toggleItemsList() {
            scope.showItemsList = !scope.showItemsList;
          };

          var itemsFilterAttr = attrs.itemsfilter;
          scope.$watch(itemsFilterAttr, function(newValue) {
            scope.itemsListFilter = newValue;
          });

          $swipe.bind(element, {
            'start' : function(coords) {
              disableCarousel.setSwiping(true);
            },
            'cancel' : function() {
              disableCarousel.setSwiping(false);
            },
            'move' : function(coords) {
            },
            'end' : function(endCoords) {
              disableCarousel.setSwiping(false);
            }
          });
        }
      };
    }]);

    angular.module('em.directives').directive('contextsList', [
    function() {
      return {
        restrict : 'A',
        templateUrl : 'static/partials/templates/contextsList.html'
      };
    }]);

    angular.module('em.directives').directive('my', [
    function() {
      return {
        restrict : 'A',
        templateUrl : 'static/partials/my.html'
      };
    }]);
    angular.module('em.directives').directive('myTasks', [
    function() {
      return {
        restrict : 'A',
        templateUrl : 'static/partials/my/tasks.html'
      };
    }]);
    angular.module('em.directives').directive('myNotes', [
    function() {
      return {
        restrict : 'A',
        templateUrl : 'static/partials/my/notes.html'
      };
    }]);

    angular.module('em.directives').directive('projectsList', [
    function() {
      return {
        restrict : 'A',
        templateUrl : 'static/partials/templates/projectsList.html'
      };
    }]);

    angular.module('em.directives').directive('noteContent', [
    function() {
      return {
        restrict : 'A',
        templateUrl : 'static/partials/templates/noteContent.html'
      };
    }]);

    angular.module('em.directives').directive('taskContent', [
    function() {
      return {
        restrict : 'A',
        templateUrl : 'static/partials/templates/taskContent.html',
        link : function(scope, element, attrs) {
          scope.showMe = false;

          scope.expandTask = function expandTask() {
            scope.showMe = !scope.showMe;
          };
        }
      };
    }]);

    angular.module('em.directives').directive('notesList', [
    function() {
      return {
        restrict : 'A',
        templateUrl : 'static/partials/templates/notesList.html',
        transclude : true,
        link : function(scope, element, attrs) {
          var notesFilterAttr = attrs.notesfilter;

          scope.$watch(notesFilterAttr, function(newValue) {
            scope.notesListFilter = newValue;
          });
        }
      };
    }]);
  }());

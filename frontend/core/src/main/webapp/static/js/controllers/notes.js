/*global angular*/

( function() {'use strict';

    angular.module('em.app').controller('NotesController', ['$location', '$rootScope', '$scope', 'activeItem', 'errorHandler', 'itemsRequest', 'locationHandler', 'notesArray', 'tagsArray',
    function($location, $rootScope, $scope, activeItem, errorHandler, itemsRequest, locationHandler, notesArray, tagsArray) {

      $scope.errorHandler = errorHandler;
      $rootScope.subtitle = 'notes';
      activeItem.setItem(null);

      locationHandler.setPreviousLocation('/my');
      locationHandler.setNextLocation('/my/tasks');

      itemsRequest.getItems(function(itemsResponse) {
        notesArray.setNotes(itemsResponse.notes);
        tagsArray.setTags(itemsResponse.tags);

        $scope.notes = notesArray.getNotes();
      }, function(error) {
      });

      $scope.notesListFilter = true;

      $scope.setActiveItem = function(item) {
        activeItem.setItem(item);
      };

      $scope.swipeLeft = function() {
        $rootScope.pageAnimation = {
          enter : 'em-animate-enter-right',
          leave : 'em-animate-leave-left'
        };
        $location.path('/my');
      };

      $scope.swipeRight = function() {
        $rootScope.pageAnimation = {
          enter : 'em-animate-enter-left',
          leave : 'em-animate-leave-right'
        };
        $location.path('/my/tasks');
      };
    }]);
  }());

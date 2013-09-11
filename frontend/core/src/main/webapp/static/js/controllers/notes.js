/*global angular*/

( function() {'use strict';

    angular.module('em.app').controller('NotesController', ['$location', '$rootScope', '$scope', 'activeItem', 'errorHandler', 'itemsRequest', 'locationHandler', 'notesArray',
    function($location, $rootScope, $scope, activeItem, errorHandler, itemsRequest, locationHandler, notesArray) {

      $scope.errorHandler = errorHandler;
      $rootScope.pageAnimation = null;
      $rootScope.subtitle = 'notes';

      locationHandler.setPreviousLocation('/my');
      locationHandler.setNextLocation('/my/tasks');

      itemsRequest.getItems(function(itemsResponse) {
        notesArray.setNotes(itemsResponse.notes);

        $scope.notes = notesArray.getNotes();
      }, function(error) {
      });

      $scope.notesListFilter = true;

      $scope.setActiveItem = function(item) {
        activeItem.setItem(item);
      };

      $scope.swipeLeft = function(asd) {
        $rootScope.pageAnimation = {
          enter : 'em-page-enter-right',
          leave : 'em-page-leave-left'
        };
        $location.path('/my');
      };

      $scope.swipeRight = function() {
        $rootScope.pageAnimation = {
          enter : 'em-page-enter-left',
          leave : 'em-page-leave-right'
        };
        $location.path('/my/tasks');
      };
    }]);
  }());

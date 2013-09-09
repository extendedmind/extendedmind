/*global angular*/

( function() {'use strict';

    angular.module('em.app').controller('NotesController', ['swiper','$scope', 'activeItem', 'errorHandler', 'itemsRequest', 'notesArray',
    function(swiper,$scope, activeItem, errorHandler, itemsRequest, notesArray) {

      // swiper.reinitSwiper();
      $scope.errorHandler = errorHandler;

      itemsRequest.getItems(function(itemsResponse) {
        notesArray.setNotes(itemsResponse.notes);

        $scope.notes = notesArray.getNotes();
      }, function(error) {
      });

      $scope.notesListFilter = true;

      $scope.setActiveItem = function(item) {
        activeItem.setItem(item);
      };
    }]);
  }());

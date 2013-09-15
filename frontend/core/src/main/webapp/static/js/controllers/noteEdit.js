/*global angular*/

( function() {'use strict';

    angular.module('em.app').controller('NoteEditController', ['$rootScope', '$routeParams', '$scope', 'activeItem', 'itemsArray', 'itemsRequest', 'notesArray',
    function($rootScope, $routeParams, $scope, activeItem, itemsArray, itemsRequest, notesArray) {

      if (activeItem.getItem()) {
        $scope.note = activeItem.getItem();
      } else {

        itemsRequest.getItems(function(itemsResponse) {
          notesArray.setNotes(itemsResponse.notes);

          $scope.note = itemsArray.getItemByUuid(notesArray.getNotes(), $routeParams.uuid);

        }, function(error) {
        });
      }

      $scope.swipeRight = function() {
        $rootScope.pageAnimation = {
          enter : 'em-animate-enter-left',
          leave : 'em-animate-leave-right'
        };
        window.history.back();
      };
    }]);
  }());

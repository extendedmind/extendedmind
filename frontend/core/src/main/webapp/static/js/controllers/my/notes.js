/*global angular*/

( function() {'use strict';

    angular.module('em.app').controller('NotesController', ['$location', '$rootScope', '$scope', 'activeItem', 'Enum', 'errorHandler', 'itemsArray', 'itemsRequest', 'location', 'notesArray', 'slideIndex', 'tagsArray',
    function($location, $rootScope, $scope, activeItem, Enum, errorHandler, itemsArray, itemsRequest, location, notesArray, slideIndex, tagsArray) {

      itemsRequest.getItems(function(itemsResponse) {

        itemsArray.setItems(itemsResponse.items);
        notesArray.setNotes(itemsResponse.notes);
        tagsArray.setTags(itemsResponse.tags);

        $scope.notes = notesArray.getNotes();
        $scope.contexts = tagsArray.getTags();

      }, function(error) {
      });

      $scope.errorHandler = errorHandler;

      $scope.slide = slideIndex;

      $rootScope.$on('event:slideIndexChanged', function() {
        switch($scope.slide) {
          case Enum.my.my:
            if ($location.path() !== '/my') {
              location.skipReload().path('/my');
            }
            break;
          case Enum.my.notes:
            if ($location.path() !== '/my/notes') {
              location.skipReload().path('/my/notes');
            }
            break;
          default:
            break;
        }
      });

      $scope.addNew = function() {
        $location.path('/my/notes/new/');
      };

      $scope.showNoteContent = true;
      $scope.notesListFilter = true;

      $scope.setActiveItem = function(item) {
        activeItem.setItem(item);
      };
    }]);
  }());

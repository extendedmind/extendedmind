'use strict';

function ArchiveController($scope, ListsService, NotesService, SwiperService, TasksService, UISessionService) {
  $scope.archiveSlides = [];
  $scope.completedTasks = TasksService.getCompletedTasks(UISessionService.getActiveUUID());
  $scope.archivedNotes = NotesService.getArchivedNotes(UISessionService.getActiveUUID());
  $scope.archivedLists = ListsService.getArchivedLists(UISessionService.getActiveUUID());

  $scope.slides = {
    leftSlide: {
      slideName: 'completed',
      slideIndex: 0
    },
    centerSlide: {
      slideName: 'overview',
      slideIndex: 1
    },
    rightSlide: {
      slideName: 'details',
      slideIndex: 2
    }
  };
  // push first horizontal slide to archiveSlides
  $scope.archiveSlides.push($scope.slides.leftSlide);

  function swiperCreatedCallback() {
    // push rest of the horizontal slides to archiveSlides
    if ($scope.archiveSlides.length === 1) {
      for (var slide in $scope.slides) {
        if ($scope.slides.hasOwnProperty(slide)) {
          if ($scope.archiveSlides.indexOf($scope.slides[slide]) === -1) $scope.archiveSlides.push($scope.slides[slide]);
        }
      }
    }
  }
  SwiperService.registerSwiperCreatedCallback(swiperCreatedCallback, 'archive', 'ArchiveController');

  $scope.completedTaskChecked = function completedTaskChecked(/*task*/) {
    // console.log('uncompleted ' + task.title);
  };
}

ArchiveController['$inject'] = ['$scope', 'ListsService', 'NotesService', 'SwiperService', 'TasksService', 'UISessionService'];
angular.module('em.app').controller('ArchiveController', ArchiveController);

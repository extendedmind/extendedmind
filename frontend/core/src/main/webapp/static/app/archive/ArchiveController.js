'use strict';

function ArchiveController($scope, ListsService, NotesService, SwiperService, TasksService, SynchronizeService, UISessionService, ArrayService) {
  $scope.archiveSlides = [];
  $scope.completedTasks = TasksService.getCompletedTasks(UISessionService.getActiveUUID());
  $scope.archivedTasks = TasksService.getArchivedTasks(UISessionService.getActiveUUID());
  $scope.archivedNotes = NotesService.getArchivedNotes(UISessionService.getActiveUUID());
  $scope.archivedLists = ListsService.getArchivedLists(UISessionService.getActiveUUID());

  function combineCompletedArrays(){
    var filteredArchivedTasks = [];
    var i = 0;
    while ($scope.archivedTasks[i]) {
      if ($scope.archivedTasks[i].completed !== undefined){
        filteredArchivedTasks.push($scope.archivedTasks[i]);
      }
      i++;
    }
    $scope.fullCompletedTasks =
      ArrayService.combineArrays(
        filteredArchivedTasks,
        $scope.completedTasks, 'completed', true);
    if ($scope.fullCompletedTasks.length < 25){
      $scope.completedTasksLimit = $scope.fullCompletedTasks.length;
    }
  }
  $scope.$watchCollection('archivedTasks', function(/*newValue, oldValue*/) {
    combineCompletedArrays();
  });
  $scope.$watchCollection('completedTasks', function(/*newValue, oldValue*/) {
    combineCompletedArrays();
  });

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

  // synchronize completed right away
  $scope.isCompletedLoading = true;
  $scope.completedTasksLimit = 0;
  $scope.isArchivedLoading = true;

  SynchronizeService.synchronizeCompleted(UISessionService.getActiveUUID()).then(function(){
    $scope.isCompletedLoading = false;
  });

  $scope.getCompletedTasksLimit = function(){
    return $scope.completedTasksLimit;
  };

  $scope.addMoreCompleted = function(){
    if ($scope.completedTasksLimit !== $scope.fullCompletedTasks.length){
      // There is still more to add, add in batches of 25
      if ($scope.completedTasksLimit + 25 < $scope.fullCompletedTasks.length){
        $scope.completedTasksLimit += 25;
      }else{
        $scope.completedTasksLimit = $scope.fullCompletedTasks.length;
      }
    }
  };

  function swiperCreatedCallback() {
    // push rest of the horizontal slides to archiveSlides
    if ($scope.archiveSlides.length === 1) {
      for (var slide in $scope.slides) {
        if ($scope.slides.hasOwnProperty(slide)) {
          if ($scope.archiveSlides.indexOf($scope.slides[slide]) === -1) $scope.archiveSlides.push($scope.slides[slide]);
        }
      }
    }

    // synchronize archived after completed has been loaded
    SynchronizeService.synchronizeArchived(UISessionService.getActiveUUID()).then(function(){
      $scope.isArchivedLoading = false;
    });
  }
  SwiperService.registerSwiperCreatedCallback(swiperCreatedCallback, 'archive', 'ArchiveController');
}

ArchiveController['$inject'] = ['$scope', 'ListsService', 'NotesService', 'SwiperService', 'TasksService', 'SynchronizeService', 'UISessionService', 'ArrayService'];
angular.module('em.app').controller('ArchiveController', ArchiveController);

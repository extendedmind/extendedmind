'use strict';

function DashboardController($scope, DateService, ListsService, NotesService, SwiperService, TasksService, SynchronizeService, UISessionService) {
  $scope.dashboardSlides = [];

  var completedTasks = TasksService.getCompletedTasks(UISessionService.getActiveUUID());
  var notes = NotesService.getNotes(UISessionService.getActiveUUID());
  var archivedNotes = NotesService.getArchivedNotes(UISessionService.getActiveUUID());
  var createdNotes = notes.concat(archivedNotes);
  var listsArchived = ListsService.getArchivedLists(UISessionService.getActiveUUID());

  $scope.isCompletedLoading = true;
  $scope.isArchivedLoading = true;

  function swiperCreatedCallback() {
    if ($scope.dashboardSlides.length === 1) {
      initializeDashboardSlideInfo('weekly');
      initializeDashboardSlideInfo('monthly');
    }

    SynchronizeService.synchronizeCompleted(UISessionService.getActiveUUID()).then(function(){
      $scope.isCompletedLoading = false;
    });
    SynchronizeService.synchronizeArchived(UISessionService.getActiveUUID()).then(function(){
      $scope.isArchivedLoading = false;
    });
  }

  function initializeDashboardSlideInfo(slideName) {
    var dashboardSlide = {
      slideName: slideName,
      messages: []
    };

    var numberOfComparedItems = 0;

    numberOfComparedItems = getNumberOfComparedItems(slideName, completedTasks, 'completed');
    writeDashboardMessage(dashboardSlide, 'task', numberOfComparedItems, 'completed');

    numberOfComparedItems = getNumberOfComparedItems(slideName, createdNotes, 'created');
    writeDashboardMessage(dashboardSlide, 'note', numberOfComparedItems, 'created');

    numberOfComparedItems = getNumberOfComparedItems(slideName, listsArchived, 'archived');
    writeDashboardMessage(dashboardSlide, 'list', numberOfComparedItems, 'archived');

    $scope.dashboardSlides.push(dashboardSlide);
  }

  SwiperService.registerSwiperCreatedCallback(swiperCreatedCallback, 'dashboard', 'DashboardController');
  initializeDashboardSlideInfo('daily');

  function getNumberOfComparedItems(slideName, itemArray, itemComparisonKey) {
    var numberOfComparedItems = 0;
    var startingFromDate, startingFromDateInMilliseconds;

    if (slideName === 'daily') startingFromDate = new Date();
    else if (slideName === 'weekly') startingFromDate = DateService.getFirstDateOfTheWeek(new Date());
    else if (slideName === 'monthly') startingFromDate = DateService.getFirstDateOfTheMonth(new Date());

    startingFromDateInMilliseconds = new Date(
      startingFromDate.getFullYear(),
      startingFromDate.getMonth(),
      startingFromDate.getDate()
      ).getTime();

    for (var i = 0, len = itemArray.length; i < len; i++) {
      var millisecondsFromTaskCompletion = itemArray[i][itemComparisonKey];
      if (millisecondsFromTaskCompletion > startingFromDateInMilliseconds) {
        numberOfComparedItems++;
      }
    }
    return numberOfComparedItems;
  }

  function writeDashboardMessage(slide, itemType, numberOfComparedItems, comparisonResultInfo) {
    if (!slide['messages']) slide['messages'] = [];

    slide['messages'].push({
      comparedItemsNumber: numberOfComparedItems.toString(),
      comparedItemsText:
      itemType +
      (numberOfComparedItems === 1 ? '' : 's') + ' ' +
      comparisonResultInfo
    });
  }
}

DashboardController['$inject'] = ['$scope', 'DateService', 'ListsService', 'NotesService', 'SwiperService', 'TasksService', 'SynchronizeService', 'UISessionService'];
angular.module('em.app').controller('DashboardController', DashboardController);

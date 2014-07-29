/* Copyright 2013-2014 Extended Mind Technologies Oy
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
 'use strict';

 function DashboardController($scope, DateService, ListsService, NotesService, SwiperService, TasksService, SynchronizeService, UISessionService) {
  $scope.dashboardSlides = [];

  var createdNotes;
  // Use MainController
  $scope.createFullCompletedTasks();

  $scope.isCompletedAndArchivedLoading = true;

  function initializeDashboardSlideInfo(slideName) {
    var dashboardSlide = {
      slideName: slideName,
      messages: []
    };

    var numberOfComparedItems = 0;

    numberOfComparedItems = getNumberOfComparedItems(slideName, $scope.fullCompletedTasks, 'completed');
    writeDashboardMessage(dashboardSlide, 'task', numberOfComparedItems, 'completed');

    numberOfComparedItems = getNumberOfComparedItems(slideName, createdNotes, 'created');
    writeDashboardMessage(dashboardSlide, 'note', numberOfComparedItems, 'created');

    numberOfComparedItems = getNumberOfComparedItems(slideName, $scope.archivedLists, 'archived');
    writeDashboardMessage(dashboardSlide, 'list', numberOfComparedItems, 'archived');

    $scope.dashboardSlides.push(dashboardSlide);
  }

  SynchronizeService.synchronizeCompletedAndArchived(UISessionService.getActiveUUID()).then(function() {
    $scope.isCompletedAndArchivedLoading = false;
    createdNotes = $scope.notes.concat($scope.archivedNotes);
    initializeDashboardSlideInfo('daily');
    initializeDashboardSlideInfo('weekly');
    initializeDashboardSlideInfo('monthly');
  });


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

  $scope.getExpectedDashboardSlides = function getExpectedDashboardSlides() {
    if ($scope.dashboardSlides.length) return $scope.dashboardSlides.length;
    else return 1;
  };
}

DashboardController['$inject'] = ['$scope', 'DateService', 'ListsService', 'NotesService', 'SwiperService', 'TasksService', 'SynchronizeService', 'UISessionService'];
angular.module('em.app').controller('DashboardController', DashboardController);

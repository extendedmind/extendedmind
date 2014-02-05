/*jshint sub:true*/
'use strict';

function DatesController($scope, $timeout, DateService, TasksSlidesService, SwiperService) {

  $scope.dates = DateService.activeWeek();

  (function swipeToToday() {
    var todayDateString = DateService.getTodayDateString();

    if (todayDateString) {
      $timeout(function() {
        SwiperService.swipePageSlide(TasksSlidesService.getDateSlidePath(todayDateString));
      });
    }
  })();

  function swipeToMonday() {
    var activeMondayDateString = DateService.getMondayDateString();

    $timeout(function() {
      SwiperService.refreshSwiper(TasksSlidesService.DATES);
      SwiperService.swipeTo(TasksSlidesService.getDateSlidePath(activeMondayDateString));
    });
  }

  $scope.previousWeek = function() {
    $scope.dates = DateService.previousWeek();
    swipeToMonday();
  };

  $scope.nextWeek = function() {
    $scope.dates = DateService.nextWeek();
    swipeToMonday();
  };

  $scope.dateClicked = function(dateString) {
    SwiperService.swipeTo(TasksSlidesService.getDateSlidePath(dateString));
  };
}

DatesController['$inject'] = ['$scope', '$timeout', 'DateService', 'TasksSlidesService', 'SwiperService'];
angular.module('em.app').controller('DatesController', DatesController);

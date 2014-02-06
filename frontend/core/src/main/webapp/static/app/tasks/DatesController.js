/*jshint sub:true*/
'use strict';

function DatesController($scope, $timeout, DateService, TasksSlidesService, SwiperService) {

  $scope.dates = DateService.activeWeek();
  $scope.activeDay = '';

  // invoke function during compile and $scope.$apply();
  (function swipeToStartingDay() {
    $scope.activeDay = DateService.getTodayDateString() || DateService.getMondayDateString();

    $timeout(function() {
      SwiperService.swipePageSlide(TasksSlidesService.getDateSlidePath($scope.activeDay));
    });
  })();

  function swipeToMonday() {
    $scope.activeDay = DateService.getMondayDateString();

    $timeout(function() {
      SwiperService.refreshSwiper(TasksSlidesService.DATES);
      SwiperService.swipeTo(TasksSlidesService.getDateSlidePath($scope.activeDay));
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
    $scope.activeDay = dateString;
    SwiperService.swipeTo(TasksSlidesService.getDateSlidePath(dateString));
  };
}

DatesController['$inject'] = ['$scope', '$timeout', 'DateService', 'TasksSlidesService', 'SwiperService'];
angular.module('em.app').controller('DatesController', DatesController);

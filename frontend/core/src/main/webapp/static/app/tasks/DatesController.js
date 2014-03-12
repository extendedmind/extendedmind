'use strict';

function DatesController($scope, $timeout, DateService, TasksSlidesService, SwiperService) {
  var activeDay, activeDaySlidePath;
  $scope.dates = DateService.activeWeek();

  DateService.registerDayChangeCallback(dayChangeCallback);
  function dayChangeCallback() {
    $scope.dates = DateService.activeWeek();
    activeDay = DateService.getTodayDateString() || DateService.getMondayDateString();

    $timeout(function() {
      SwiperService.swipePageSlide(TasksSlidesService.getDateSlidePath(activeDay));
    });
  }
  $scope.$on('destroy', function() {
    DateService.removeDayChangeCallback();
  });

  // Register a callback to swiper service
  SwiperService.registerSlideChangeCallback(slideChangeCallback, 'tasks/dates', 'DatesController');
  function slideChangeCallback(activeSlidePath) {
    activeDaySlidePath = activeSlidePath;
    // Run digest to change only date picker when swiping to new location
    $scope.$digest();
  }

  // invoke function during compile and $scope.$apply();
  function swipeToStartingDay() {
    activeDay = DateService.getTodayDateString() || DateService.getMondayDateString();

    $timeout(function() {
      SwiperService.swipePageSlide(TasksSlidesService.getDateSlidePath(activeDay));
    });
  };
  swipeToStartingDay();

  $scope.previousWeek = function() {
    $scope.dates = DateService.previousWeek();
    swipeToStartingDay();
  };

  $scope.nextWeek = function() {
    $scope.dates = DateService.nextWeek();
    swipeToStartingDay();
  };

  $scope.dateClicked = function(dateString) {
    activeDay = dateString;
    SwiperService.swipeTo(TasksSlidesService.getDateSlidePath(dateString));
  };

  // http://coder1.com/articles/angularjs-managing-active-nav-elements
  $scope.isDayActive = function(dateString) {
    if (activeDaySlidePath && (activeDaySlidePath.indexOf(dateString) !== -1)) {
      activeDay = dateString;
    }
    return activeDay === dateString;
  };

  $scope.visibleDateFormat = function(date) {
    return (date.yyyymmdd === activeDay) ? date.month.name : date.weekday;
  };
}

DatesController['$inject'] = ['$scope', '$timeout', 'DateService', 'TasksSlidesService', 'SwiperService'];
angular.module('em.app').controller('DatesController', DatesController);

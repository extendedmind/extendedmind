'use strict';

function DatesController($scope, $timeout, DateService, TasksSlidesService, SwiperService) {
  var activeDay, activeDaySlidePath;
  $scope.dates = DateService.activeWeek();

  DateService.registerDayChangeCallback(dayChangeCallback);
  function dayChangeCallback() {
    $scope.dates = DateService.activeWeek();
    swipeToStartingDay();
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
    activeDay = DateService.getTodayDate() || DateService.getMondayDate();

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
  $scope.isDayActive = function(date) {
    if (activeDaySlidePath && (activeDaySlidePath.indexOf(date.weekday) !== -1)) {
      activeDay = date;
    }
    return activeDay === date;
  };

  $scope.visibleDateFormat = function(date) {
    return (date.yyyymmdd === activeDay) ? date.month.name : date.weekday;
  };
}

DatesController['$inject'] = ['$scope', '$timeout', 'DateService', 'TasksSlidesService', 'SwiperService'];
angular.module('em.app').controller('DatesController', DatesController);

'use strict';

function DatesController($scope, $timeout, DateService, TasksSlidesService, SwiperService) {
  var activeDay, activeDaySlidePath;
  $scope.dates = DateService.activeWeek();

  // Register a callback to swiper service
  SwiperService.registerSlideChangeCallback(slideChangeCallback, 'tasks/dates', 'DatesController');
  function slideChangeCallback(activeSlidePath) {
    activeDaySlidePath = activeSlidePath;
    // Run digest to change only date picker when swiping to new location
    $scope.$digest();
  }

  // invoke function during compile and $scope.$apply();
  (function swipeToStartingDay() {
    activeDay = DateService.getTodayDateString() || DateService.getMondayDateString();

    $timeout(function() {
      SwiperService.swipePageSlide(TasksSlidesService.getDateSlidePath(activeDay));
    });
  })();

  function swipeToMonday() {
    activeDay = DateService.getMondayDateString();

    $timeout(function() {
      SwiperService.refreshSwiper(TasksSlidesService.DATES);
      SwiperService.swipeTo(TasksSlidesService.getDateSlidePath(activeDay));
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

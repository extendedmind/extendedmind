'use strict';

function DatesController($document, $q, $scope, $timeout, DateService, TasksSlidesService, SwiperService) {
  var activeDay;
  $scope.dates = DateService.activeWeek();
  $scope.isDatepickerVisible = false;

  DateService.registerDayChangeCallback(dayChangeCallback);
  function dayChangeCallback() {
    $scope.dates = DateService.activeWeek();
    swipeToStartingDay();
  }
  $scope.$on('destroy', function() {
    DateService.removeDayChangeCallback();
  });

  // Register a callback to swiper service
  SwiperService.registerSlideChangeCallback(slideChangeCallback, 'tasks/home', 'DatesController');
  function slideChangeCallback(activeSlidePath) {
    if (!activeSlidePath.endsWith(activeDay.weekday)){
      for (var i = 0, len = $scope.dates.length; i < len; i++) {
        if (activeSlidePath.endsWith($scope.dates[i].weekday)){
          activeDay = $scope.dates[i];
          // Run digest to change only date picker when swiping to new location
          $scope.$digest();
        }
      }
    }
  }

  // invoke function during compile and $scope.$apply();
  function swipeToStartingDay() {
    activeDay = DateService.getTodayDate() || DateService.getMondayDate();
    $q.when(
      SwiperService.setInitialSlidePath(
        TasksSlidesService.DATES,
        TasksSlidesService.getDateSlidePath(activeDay)))
    .then(function(){
        // Need additional swiping if setting initial slide path fails to work
        SwiperService.swipeTo(TasksSlidesService.getDateSlidePath(activeDay));
      });
  }
  swipeToStartingDay();

  $scope.previousWeek = function() {
    $scope.dates = DateService.previousWeek();
    swipeToStartingDay();
  };

  $scope.nextWeek = function() {
    $scope.dates = DateService.nextWeek();
    swipeToStartingDay();
  };

  $scope.dateClicked = function(date) {
    activeDay = date;
    SwiperService.swipeTo(TasksSlidesService.getDateSlidePath(date));
  };

  // http://coder1.com/articles/angularjs-managing-active-nav-elements
  $scope.isDayActive = function(date) {
    return activeDay === date;
  };

  $scope.visibleDateFormat = function(date) {
    return (date === activeDay) ? date.month.name : date.weekday.substring(0,1);
  };

  $scope.setDatepickerVisible = function setDatepickerVisible() {
    $scope.isDatepickerVisible = true;
    bindElsewhereThanDatepickerEvents();
  };

  var elsewhereThanDatepickerEventsBound = false;

  function bindElsewhereThanDatepickerEvents() {
    if (!elsewhereThanDatepickerEventsBound) {
      document.addEventListener('click', elseWhereThanDatepickerCallback, true);
      document.addEventListener('touchmove', elseWhereThanDatepickerCallback, false);
      elsewhereThanDatepickerEventsBound = true;
    }
  }

  function elseWhereThanDatepickerCallback(event) {
    var element = event.target;
    if (event.target.id !== 'datepicker') {
      while (element.parentNode) {
        element = element.parentNode;
        if (element.id === 'datepicker') {
          return;
        }
      }
    }
    if (event.type === 'click') {
      event.preventDefault();
      event.stopPropagation();
    }
    $scope.$apply(function() {
      $scope.isDatepickerVisible = false;
      unbindElsewhereThanDatepickerEvents();
    });
  }

  function unbindElsewhereThanDatepickerEvents() {
    if (elsewhereThanDatepickerEventsBound) {
      document.removeEventListener('click', elseWhereThanDatepickerCallback, true);
      document.removeEventListener('touchmove', elseWhereThanDatepickerCallback, false);
      elsewhereThanDatepickerEventsBound = false;
    }
  }
}

DatesController['$inject'] = ['$document', '$q', '$scope', '$timeout', 'DateService', 'TasksSlidesService', 'SwiperService'];
angular.module('em.app').controller('DatesController', DatesController);

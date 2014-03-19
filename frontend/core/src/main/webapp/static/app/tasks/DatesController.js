'use strict';

function DatesController($q, $scope, DateService, SwiperService) {
  var activeDay;
  /*$scope.activeWeek*/$scope.dates = DateService.activeWeek();
  // $scope.weekdays = DateService.getWeekDays();
  $scope.datepickerWeeks = DateService.datepickerWeeks();
  $scope.isDatepickerVisible = false;

  DateService.registerDayChangeCallback(dayChangeCallback);
  function dayChangeCallback() {
    $scope.dates = DateService.activeWeek();
    swipeToStartingDay();
  }
  $scope.$on('destroy', function() {
    DateService.removeDayChangeCallback();
  });

  function getDateSlidePath(activeDay){
    return 'tasks/home/' + activeDay.weekday;
  }

  // This function is intended to be called from datepicker directive.
  $scope.changeActiveWeek = function changeActiveWeek(direction, cb) {
    $scope.datepickerWeeks = DateService.changeDatePickerWeeks(direction);
    cb().then($scope.$digest()).then(function() {
      if (direction === 'prev') {
        $scope.dates = DateService.previousWeek();
      } else if (direction === 'next') {
        $scope.dates = DateService.nextWeek();
      }
      swipeToStartingDay();
    });
  };

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
        'tasks/home',
        getDateSlidePath(activeDay)))
    .then(function(){
        // Need additional swiping if setting initial slide path fails to work
        SwiperService.swipeTo(getDateSlidePath(activeDay));
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
    SwiperService.swipeTo(getDateSlidePath(date));
  };

  // http://coder1.com/articles/angularjs-managing-active-nav-elements
  $scope.isDayActive = function(date) {
    return activeDay.yyyymmdd === date.yyyymmdd;
  };

  $scope.visibleDateFormat = function(date) {
    return (date.yyyymmdd === activeDay.yyyymmdd) ? date.month.name : date.weekday.substring(0,1);
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

DatesController['$inject'] = ['$q', '$scope', 'DateService', 'SwiperService'];
angular.module('em.app').controller('DatesController', DatesController);

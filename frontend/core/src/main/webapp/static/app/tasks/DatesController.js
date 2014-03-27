'use strict';

function DatesController($q, $rootScope, $scope, DateService, SwiperService) {
  $scope.activeDay = {};
  $scope.weekdays = DateService.activeWeek();
  $scope.datepickerWeeks = DateService.datepickerWeeks();
  $rootScope.isDatepickerVisible = false;

  DateService.registerDayChangeCallback(dayChangeCallback);
  function dayChangeCallback(weekChanged) {
    if (weekChanged) {
      $scope.weekdays = DateService.activeWeek();
      $scope.datepickerWeeks = DateService.datepickerWeeks();
    }
    swipeToStartingDay();
  }
  $scope.$on('$destroy', function() {
    DateService.removeDayChangeCallback();
  });

  function getDateSlidePath(activeDay){
    return 'tasks/home/' + activeDay.weekday;
  }

  // This function is intended to be called from datepicker directive.
  $scope.changeActiveWeek = function changeActiveWeek(direction, cb) {
    var weekdayIndex = $scope.activeDay.weekdayIndex;
    $scope.datepickerWeeks = DateService.changeDatePickerWeeks(direction);
    cb().then($scope.$digest()).then(function() {
      if (direction === 'prev') {
        $scope.weekdays = DateService.previousWeek();
      } else if (direction === 'next') {
        $scope.weekdays = DateService.nextWeek();
      }
      var newActiveDay = $scope.weekdays[weekdayIndex];
      swipeToStartingDay(newActiveDay);
    });
  };

  // Register a callback to swiper service
  SwiperService.registerSlideChangeCallback(slideChangeCallback, 'tasks/home', 'DatesController');
  function slideChangeCallback(activeSlidePath) {
    if (!activeSlidePath.endsWith($scope.activeDay.weekday)){
      for (var i = 0, len = $scope.weekdays.length; i < len; i++) {
        if (activeSlidePath.endsWith($scope.weekdays[i].weekday)){
          $scope.activeDay = $scope.weekdays[i];
          // Run digest to change only date picker when swiping to new location
          $scope.$digest();
        }
      }
    }
  }

  // invoke function during compile and $scope.$apply();
  function swipeToStartingDay(startingDay) {
    $scope.activeDay = startingDay || DateService.getTodayDate() || DateService.getMondayDate();
    $q.when(
      SwiperService.setInitialSlidePath(
        'tasks/home',
        getDateSlidePath($scope.activeDay)))
    .then(function(){
        // Need additional swiping if setting initial slide path fails to work
        SwiperService.swipeTo(getDateSlidePath($scope.activeDay));
      });
  }
  swipeToStartingDay();

  $scope.getSubtask = function getSubtask(date) {
    return {date: date.yyyymmdd};
  };

  $scope.previousWeek = function() {
    $scope.weekdays = DateService.previousWeek();
    $scope.datepickerWeeks = DateService.changeDatePickerWeeks('prev');
    swipeToStartingDay();
  };

  $scope.nextWeek = function() {
    $scope.weekdays = DateService.nextWeek();
    $scope.datepickerWeeks = DateService.changeDatePickerWeeks('next');
    swipeToStartingDay();
  };

  $scope.dateClicked = function(date) {
    $scope.activeDay = date;
    SwiperService.swipeTo(getDateSlidePath(date));
  };

  $scope.getDateClass = function getDateClass(date) {
    var todayYYYYMMDD = DateService.getTodayYYYYMMDD();
    var status = 'date';

    if (date.yyyymmdd === $scope.activeDay.yyyymmdd) {
      status += '-active';
    }

    if (date.yyyymmdd < todayYYYYMMDD && DateService.isDateBeforeCurrentWeek(date)) {
      status += '-past';
    } else if (date.yyyymmdd === todayYYYYMMDD) {
      status += '-today';
    }
    return status;
  };

  $scope.visibleDateFormat = function(date) {
    return (date.yyyymmdd === $scope.activeDay.yyyymmdd) ? date.monthName : date.weekday.substring(0,1);
  };

  $scope.$watch('activeDay.yyyymmdd', function(newActiveYYYYMMDD) {
    if (newActiveYYYYMMDD === DateService.getTodayYYYYMMDD()) {
      $rootScope.isTodayActive = true;
    } else {
      $rootScope.isTodayActive = false;
    }
  });

  $scope.setDatepickerVisible = function setDatepickerVisible() {
    $rootScope.isDatepickerVisible = true;
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

  function gotoToday() {
    if (!DateService.getTodayDate()) {
      $scope.weekdays = DateService.setCurrentWeekActive();
    }
    swipeToStartingDay();
  }

  function elseWhereThanDatepickerCallback(event) {
    var element = event.target;
    if (element.id === 'datepicker') {
      return;
    } else if (element.id === 'today-link') {
      gotoToday();
    }
    if (element.id !== 'datepicker' || element.id !== 'today-link') {
      while (element.parentNode) {
        element = element.parentNode;
        if (element.id === 'datepicker') {
          return;
        } else if (element.id === 'today-link') {
          gotoToday();
        }
      }
    }
    if (event.type === 'click') {
      event.preventDefault();
      event.stopPropagation();
    }
    $scope.$apply(function() {
      $rootScope.isDatepickerVisible = false;
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

DatesController['$inject'] = ['$q', '$rootScope', '$scope', 'DateService', 'SwiperService'];
angular.module('em.app').controller('DatesController', DatesController);

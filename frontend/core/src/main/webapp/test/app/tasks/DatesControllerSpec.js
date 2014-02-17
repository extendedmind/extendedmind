'use strict';

describe('DatesController', function() {

  var $scope, DatesController, DateService;

  beforeEach(function() {
    module('em.appTest');
    module('common');

    inject(function($controller, $rootScope, _DateService_) {
      $scope = $rootScope.$new();
      DatesController = $controller('DatesController', {
        $scope: $scope
      });
      DateService = _DateService_;
    });
  });

  it('should set active day to clicked day', function() {
    var today = DateService.getTodayYYYYMMDD();
    $scope.dateClicked(today);
    expect($scope.isDayActive(today)).toEqual(true);
  });

  it('should set active day visible date format to month name', function() {
    // TODO User DateService.activeWeek to minimize dependencies
    var today = DateService.getTodayYYYYMMDD();
    $scope.dateClicked(today);
    var date = {
      yyyymmdd: DateService.getTodayYYYYMMDD(),
      month: {
        name: 'month'
      },
      weekday: 'day'
    };
    var visibleDateFormat = $scope.visibleDateFormat(date);
    expect(visibleDateFormat).toEqual('month');
  });

  it('should set inactive day visible date format to weekday', function() {
    // TODO User DateService.activeWeek to minimize dependencies
    var monday = DateService.getMondayDateString();
    var today = DateService.getTodayDateString();
    var otherThanMonday;
    var yyyymmdd;

    if (monday !== today) {
      yyyymmdd = monday;
    } else {
      otherThanMonday = DateService.activeWeek();
      yyyymmdd = otherThanMonday[1].yyyymmdd;
    }

    var date = {
      yyyymmdd: yyyymmdd,
      month: {
        name: 'month'
      },
      weekday: 'day'
    };
    var visibleDateFormat = $scope.visibleDateFormat(date);
    expect(visibleDateFormat).toEqual('day');
  });
});

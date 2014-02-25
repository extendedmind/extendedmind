'use strict';

describe('DateService', function() {

  var DateService;

  beforeEach(function() {
    module('em.appTest');

    inject(function(_DateService_) {
      DateService = _DateService_;
    });

  });

  it('should get current week', function() {
    // var activeWeek = DateService.activeWeek();
    // var isToday;
    // for (var i = 0, len = activeWeek.length; i < len; i++) {
    //   if (activeWeek[i].displayDate === 'today') {
    //     isToday = true;
    //     break;
    //   }
    // }
    // expect(activeWeek.length).toEqual(7);
    // expect(isToday).toEqual(true);
  });

  it('should get next week', function() {
    // var differenceBetweenDaysInMilliSeconds;
    // var weekInMilliSeconds = 7 * 24 * 60 * 60 * 1000;
    // var currentWeek = DateService.activeWeek();
    // var nextWeek = DateService.nextWeek();
    // expect(nextWeek.length).toEqual(7);

    // for (var i = 0, len = nextWeek.length; i < len; i++) {
    //   differenceBetweenDaysInMilliSeconds = Math.abs(new Date(currentWeek[i].yyyymmdd) - new Date(nextWeek[i].yyyymmdd));
    //   expect(differenceBetweenDaysInMilliSeconds).toEqual(weekInMilliSeconds);
    // }
  });

  it('should get previous week', function() {
    // var differenceBetweenDaysInMilliSeconds;
    // var weekInMilliSeconds = 7 * 24 * 60 * 60 * 1000;

    // var min = 1, max = 104;
    // var weekOffset = Math.floor(Math.random() * (max - min + 1)) + min;
    // var weeksInMilliSeconds = weekOffset * weekInMilliSeconds;
    // var currentWeek = DateService.activeWeek();

    // for (var j = 0; j < weekOffset; j++) {
    //   DateService.previousWeek();
    // }
    // var previousWeek = DateService.activeWeek();
    // expect(previousWeek.length).toEqual(7);

    // for (var i = 0, len = previousWeek.length; i < len; i++) {
    //   differenceBetweenDaysInMilliSeconds = Math.abs(new Date(currentWeek[i].yyyymmdd) - new Date(previousWeek[i].yyyymmdd));
    //   expect(differenceBetweenDaysInMilliSeconds).toEqual(weeksInMilliSeconds);
    // }
  });

  it('should get monday date string', function() {
    var weekInMilliSeconds = 7 * 24 * 60 * 60 * 1000;
    var monday = DateService.getMondayDateString();
    expect(monday).toBeDefined();
    // Next monday
    DateService.nextWeek();
    var nextMonday = DateService.getMondayDateString();
    expect(nextMonday).toBeDefined();
    expect(Math.abs(new Date(monday) - new Date(nextMonday))).toEqual(weekInMilliSeconds);
    // Previous monday
    DateService.previousWeek();
    DateService.previousWeek();
    var previousMonday = DateService.getMondayDateString();
    expect(previousMonday).toBeDefined();
    expect(Math.abs(new Date(monday) - new Date(previousMonday))).toEqual(weekInMilliSeconds);
  });

  it('should get today date string', function() {
    var dayMilliseconds = 24*60*60*1000;
    DateService.activeWeek();
    var today = DateService.getTodayDateString();
    var differFromNowMilliseconds = Math.abs(new Date(today) - Date.now());
    expect(differFromNowMilliseconds).toBeLessThan(dayMilliseconds);
    // Next week
    DateService.nextWeek();
    expect(DateService.getTodayDateString()).toBeUndefined();
    // Previous week
    DateService.previousWeek();
    DateService.previousWeek();
    expect(DateService.getTodayDateString()).toBeUndefined();
  });

  it('should get today YYYY-MM-DD', function() {
    // http://www.webdeveloper.com/forum/showthread.php?190078-Javascript-Date-(yyyy-mm-dd)-validation&s=fb683a518d3727eb31b0f89cc9d0a6b1&p=926049#post926049
    var dashYYYYMMDD = /(\d{4})-(\d{2})-(\d{2})/;
    var today = DateService.getTodayYYYYMMDD();
    expect(today).toMatch(dashYYYYMMDD);
  });
});

/*global angular*/


( function() {'use strict';

  function TodayController($scope,date,filterService) {

    $scope.filterService = filterService;
    
    $scope.date={};
    
    $scope.date.date=date.yyyymmdd();

    if (date.today($scope.date.date)){
      $scope.date.day='today';
    }

    $scope.dates = [{
      date: '2013-10-30',year:'2013',month:'10',day:'30'
    }, {
      date: '2013-10-31',year:'2013',month:'10',day:'31'
    }, {
      date: '2013-11-01',year:'2013',month:'11',day:'01'
    }];

    $scope.filterService.activeFilters.tasksByDate.filterBy=$scope.date.date;

    $scope.dateClicked = function(day) {

      $scope.date=day;

      if (date.today($scope.date.date)){
        $scope.date.day='today';
      }

      $scope.filterService.activeFilters.tasksByDate.filterBy = $scope.date.date;
    };
  }


  TodayController.$inject = ['$scope','date','filterService'];
  angular.module('em.app').controller('TodayController', TodayController);
}());

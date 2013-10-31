/*global angular*/


( function() {'use strict';

  function TodayController($scope,$swipe,date,disableCarousel,filterService) {

    $scope.filterService = filterService;
    
    $scope.dates = date.week();
    $scope.date=date.today();
    $scope.filterService.activeFilters.tasksByDate.filterBy = $scope.date.yyyymmdd;

    $scope.dateClicked = function(date) {

      $scope.date=date;
      $scope.filterService.activeFilters.tasksByDate.filterBy=$scope.date.yyyymmdd;

    };

    $swipe.bind($(".datebar"),
    {
      start : function() {
       disableCarousel.setSwiping(true);
     },
     end : function() {
       disableCarousel.setSwiping(false);
     }
   });
  }


  TodayController.$inject = ['$scope','$swipe','date','disableCarousel','filterService'];
  angular.module('em.app').controller('TodayController', TodayController);
}());

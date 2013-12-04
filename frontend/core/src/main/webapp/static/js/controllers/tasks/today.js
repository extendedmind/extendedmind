/*jslint white: true */
'use strict';

function TodayController($scope, date, filterService) {

  $scope.filterService = filterService;

  $scope.dates = date.week();
  $scope.date = date.today();
  $scope.filterService.activeFilters.tasksByDate.filterBy = $scope.date.yyyymmdd;
  $scope.subtask = {};
  $scope.subtask.due = $scope.date.yyyymmdd;

  $scope.dateClicked = function(date) {

    $scope.date = date;
    $scope.filterService.activeFilters.tasksByDate.filterBy = $scope.date.yyyymmdd;
    $scope.subtask.due = $scope.date.yyyymmdd;

  };
}

TodayController.$inject = ['$scope', 'date', 'filterService'];
angular.module('em.app').controller('TodayController', TodayController);

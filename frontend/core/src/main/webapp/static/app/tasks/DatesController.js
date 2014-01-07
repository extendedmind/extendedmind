/*global angular */
'use strict';

function DatesController($scope, DateService, ErrorHandlerService, FilterService, itemsArray, TagsService, tasksArray, OwnerService, TasksSlidesService, SwiperService) {
  $scope.tasks = tasksArray.getTasks();
  $scope.tags = TagsService.getTags();
  $scope.items = itemsArray.getItems();

  $scope.filterService = FilterService;
  $scope.prefix = OwnerService.getPrefix();
  $scope.errorHandler = ErrorHandlerService;

  $scope.dates = DateService.week();
  $scope.date = DateService.today();

  $scope.dateClicked = function(dateString) {
    SwiperService.swipeTo(TasksSlidesService.getDateSlidePath(dateString));
  };

}

DatesController.$inject = ['$scope', 'DateService', 'ErrorHandlerService', 'FilterService', 'itemsArray', 'TagsService', 'tasksArray', 'OwnerService', 'TasksSlidesService', 'SwiperService'];
angular.module('em.app').controller('DatesController', DatesController);

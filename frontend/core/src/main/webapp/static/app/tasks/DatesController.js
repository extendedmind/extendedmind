/*global angular */
'use strict';

function DatesController($scope, DateService, ErrorHandlerService, FilterService, itemsArray, TagsService, tasksArray, OwnerService, TasksSlidesService, SwiperService) {

  $scope.dateClicked = function(dateString) {
    SwiperService.swipeTo(TasksSlidesService.getDateSlidePath(dateString));
  };
}

DatesController.$inject = ['$scope', 'DateService', 'ErrorHandlerService', 'FilterService', 'itemsArray', 'TagsService', 'tasksArray', 'OwnerService', 'TasksSlidesService', 'SwiperService'];
angular.module('em.app').controller('DatesController', DatesController);

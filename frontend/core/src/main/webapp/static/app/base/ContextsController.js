'use strict';

function ContextsController($location, $scope, $timeout, $routeParams, UserSessionService, OwnerService, TagsService, SwiperService, TasksSlidesService) {

  if (!$scope.context){
    if ($location.path().indexOf('/edit/' != -1) || $location.path().indexOf('/new' != -1)){
      if ($routeParams.uuid) {
        $scope.context = TagsService.getTagByUUID($routeParams.uuid, UserSessionService.getActiveUUID());
      }else {
        $scope.context = {};
      }
    }
  }

  $scope.saveContext = function(context) {
    TagsService.saveTag(context, UserSessionService.getActiveUUID());
    window.history.back();
  };

  $scope.editContext = function(context) {
    $location.path(OwnerService.getOwnerPrefix() + '/contexts/edit/' + context.uuid);
  };

  $scope.cancelEdit = function() {
    window.history.back();
  };

  $scope.showContextContent = false;
  $scope.toggleContextContent = function() {
    $scope.showContextContent = !$scope.showContextContent;
  };

  $scope.goToContext = function(uuid) {
    SwiperService.swipeTo(TasksSlidesService.CONTEXTS + '/' + uuid);
  };

  $scope.addContext = function(newContext) {
    TagsService.saveTag(newContext, UserSessionService.getActiveUUID()).then(function(/*context*/) {
      // Using timeout 0 to make sure that DOM is ready before refreshing swiper.
      $timeout(function() {
        SwiperService.refreshSwiper(TasksSlidesService.CONTEXTS);
      });
    });
    $scope.newContext = {title: undefined};
  };
}

ContextsController['$inject'] = ['$location', '$scope', '$timeout', '$routeParams',
                              'UserSessionService', 'OwnerService', 'TagsService',
                              'SwiperService', 'TasksSlidesService'];
angular.module('em.app').controller('ContextsController', ContextsController);

'use strict';

function ContextsController($location, $scope, $timeout, $routeParams, UserSessionService, TagsService, SwiperService) {

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
    $location.path(UserSessionService.getOwnerPrefix() + '/contexts/edit/' + context.uuid);
  };

  $scope.cancelEdit = function() {
    window.history.back();
  };

  $scope.showContextContent = false;
  $scope.toggleContextContent = function() {
    $scope.showContextContent = !$scope.showContextContent;
  };

  $scope.addContext = function(newContext) {
    if (!newContext.title  || newContext.title.length === 0) return false;
    TagsService.saveTag(newContext, UserSessionService.getActiveUUID()).then(function(/*context*/) {
      // TODO something
    });
    $scope.newContext = {title: undefined, tagType: 'context'};
  };
}

ContextsController['$inject'] = ['$location', '$scope', '$timeout', '$routeParams', 'UserSessionService',
                                 'TagsService', 'SwiperService'];
angular.module('em.app').controller('ContextsController', ContextsController);

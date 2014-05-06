'use strict';

function ContextsController($location, $scope, $routeParams, UISessionService, TagsService, AnalyticsService) {

  if (!$scope.context){
    if ($location.path().indexOf('/edit/' != -1) || $location.path().indexOf('/new' != -1)){
      if ($routeParams.uuid) {
        $scope.context = TagsService.getTagByUUID($routeParams.uuid, UISessionService.getActiveUUID());
      }else {
        $scope.context = {};
      }
    }
  }

  $scope.saveContext = function(context) {
    TagsService.saveTag(context, UISessionService.getActiveUUID());
    $scope.gotoPreviousPage();
  };

  $scope.editContext = function(context) {
    $location.path(UISessionService.getOwnerPrefix() + '/contexts/edit/' + context.uuid);
  };

  $scope.deleteContext = function(context) {
    TagsService.deleteTag(context, UISessionService.getActiveUUID());
  };

  $scope.cancelEdit = function() {
    $scope.gotoPreviousPage();
  };

  $scope.showContextContent = false;
  $scope.toggleContextContent = function() {
    $scope.showContextContent = !$scope.showContextContent;
  };

  $scope.addContext = function(newContext) {
    if (!newContext.title  || newContext.title.length === 0) return false;
    TagsService.saveTag(newContext, UISessionService.getActiveUUID()).then(function(/*context*/) {
      AnalyticsService.do('addContext');
    });
    $scope.newContext = {title: undefined, tagType: 'context'};
  };
}

ContextsController['$inject'] = ['$location', '$scope', '$routeParams', 'UISessionService',
'TagsService', 'AnalyticsService'];
angular.module('em.app').controller('ContextsController', ContextsController);

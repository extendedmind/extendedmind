'use strict';

function ContextsController($scope, UISessionService, TagsService, AnalyticsService) {

  var featureChangedCallback = function featureChangedCallback(newFeature, oldFeature){
    if (newFeature.name === 'contextEdit'){
      if (newFeature.data){
        $scope.context = newFeature.data;
      }else{
        $scope.context = {};
      }
    }
  }
  UISessionService.registerFeatureChangedCallback(featureChangedCallback, 'ContextsController');

  $scope.saveContext = function(context) {
    TagsService.saveTag(context, UISessionService.getActiveUUID());
    $scope.gotoPreviousPage();
  };

  $scope.editContext = function(context) {
    UISessionService.changeFeature({name: 'contextEdit', data: context});
  };

  $scope.editContextTitle = function(context) {
    AnalyticsService.do('editContextTitle');
    TagsService.saveTag(context, UISessionService.getActiveUUID());
  };

  $scope.deleteContext = function(context) {
    TagsService.deleteTag(context, UISessionService.getActiveUUID());
  };

  $scope.addContext = function(newContext) {
    if (!newContext.title  || newContext.title.length === 0) return false;

    var contextToSave = {title: newContext.title, tagType: newContext.tagType};
    delete newContext.title;

    TagsService.saveTag(contextToSave, UISessionService.getActiveUUID()).then(function(/*context*/) {
      AnalyticsService.do('addContext');
    });
  };

  $scope.contextQuickEditDone = function(context) {
    AnalyticsService.do('contextQuickEditDone');
    TagsService.saveTag(context, UISessionService.getActiveUUID());
  };
}

ContextsController['$inject'] = ['$scope', 'UISessionService',
'TagsService', 'AnalyticsService'];
angular.module('em.app').controller('ContextsController', ContextsController);

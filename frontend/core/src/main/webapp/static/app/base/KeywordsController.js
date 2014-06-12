'use strict';

function KeywordsController($scope, UISessionService, TagsService, AnalyticsService) {

  $scope.saveKeyword = function(keyword) {
    TagsService.saveTag(keyword, UISessionService.getActiveUUID());
    $scope.gotoPreviousPage();
  };

  $scope.keywordDetails = {visible: false};
  $scope.editKeyword = function(keyword) {
    $scope.keywordDetails.visible = !$scope.keywordDetails.visible;
  };

  $scope.editKeywordFields = function(keyword) {
    AnalyticsService.do('editKeywordFields');
    TagsService.saveTag(keyword, UISessionService.getActiveUUID());
  };

  $scope.deleteKeyword = function(keyword) {
    TagsService.deleteTag(keyword, UISessionService.getActiveUUID());
  };

  $scope.addKeyword = function(newKeyword) {
    if (!newKeyword.title  || newKeyword.title.length === 0) return false;

    var keywordToSave = {title: newKeyword.title, tagType: newKeyword.tagType};
    delete newKeyword.title;

    TagsService.saveTag(keywordToSave, UISessionService.getActiveUUID()).then(function(/*keyword*/) {
      AnalyticsService.do('addKeyword');
    });
  };

  $scope.keywordQuickEditDone = function(keyword) {
    AnalyticsService.do('keywordQuickEditDone');
    TagsService.saveTag(keyword, UISessionService.getActiveUUID());
  };
}

KeywordsController['$inject'] = ['$scope', 'UISessionService',
'TagsService', 'AnalyticsService'];
angular.module('em.app').controller('KeywordsController', KeywordsController);

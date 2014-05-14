'use strict';

function ListsController($location, $scope, UISessionService, ListsService, AnalyticsService) {

  var featureChangedCallback = function featureChangedCallback(newFeature, oldFeature){
    if (newFeature.name === 'listEdit'){
      if (newFeature.data){
        $scope.list = newFeature.data;
      }else{
        $scope.list = {};
      }
    }
  }
  UISessionService.registerFeatureChangedCallback(featureChangedCallback, 'ListsController');

  $scope.saveList = function(list) {
    ListsService.saveList(list, UISessionService.getActiveUUID());
    $scope.gotoPreviousPage();
  };

  $scope.editList = function(list) {
    UISessionService.changeFeature({name: 'listEdit', data: list});
  };

  $scope.editListTitle = function(list) {
    AnalyticsService.do('editListTitle');
    ListsService.saveList(list, UISessionService.getActiveUUID());
  };

  $scope.addList = function(newList) {
    if (!newList.title  || newList.title.length === 0) return false;

    var listToSave = {title: newList.title};
    delete newList.title;
    ListsService.saveList(listToSave, UISessionService.getActiveUUID()).then(function(/*list*/) {
      AnalyticsService.do('addList');
    });
  };

  $scope.archiveList = function(list) {
    ListsService.archiveList(list, UISessionService.getActiveUUID());
  };

  $scope.deleteList = function(list) {
    ListsService.deleteList(list, UISessionService.getActiveUUID());
  };

  $scope.listQuickEditDone = function(list) {
    AnalyticsService.do('listQuickEditDone');
    ListsService.saveList(list, UISessionService.getActiveUUID());
  };
}

ListsController['$inject'] = ['$location', '$scope', 'UISessionService',
'ListsService', 'AnalyticsService'];
angular.module('em.app').controller('ListsController', ListsController);

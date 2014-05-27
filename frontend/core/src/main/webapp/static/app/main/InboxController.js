'use strict';

function InboxController($scope) {
  var openFirstElementCallback;
  $scope.registerOpenFirstElementCallback = function registerOpenFirstElementCallback(callback){
    openFirstElementCallback = callback;
  };

  $scope.accordionClosed = function accordionClosed(){
    $scope.sortingItem = undefined;
  };

  $scope.itemRemoved = function itemRemoved(item){
    if (item !== undefined && $scope.sortingItem === item){
      // Continue sorting
      $scope.sortInbox();
    }
  };

  $scope.sortInbox = function sortInbox(){
    if (openFirstElementCallback){
      $scope.sortingItem = openFirstElementCallback($scope.sortingItem);
    }
  };

  $scope.isInboxSorting = function isInboxSorting(item) {
    if ($scope.sortingItem === item) return true;
  };

  $scope.getSortingText = function getSortingText(){
    if ($scope.sortingItem) return 'done sorting';
    else return 'sort inbox';
  };

}

InboxController['$inject'] = ['$scope'];
angular.module('em.app').controller('InboxController', InboxController);

/*jshint sub:true*/
'use strict';

function HomeController($scope, $location, $document, $element, ItemsService, UserSessionService, AuthenticationService) {

  $scope.omniBarActive = false;
  $scope.menuActive = false;
  $scope.collectives = UserSessionService.getCollectives();

  $scope.toggleMenu = function toggleMenu() {
    $scope.menuActive = !$scope.menuActive;
  };

  $scope.setCollectiveActive = function(uuid) {
    AuthenticationService.switchActiveUUID(uuid);
    $location.path('/collective/' + uuid + '/tasks');
    $scope.menuActive = false;
  };
  
  $scope.setMyActive = function() {
    AuthenticationService.switchActiveUUID(UserSessionService.getUserUUID());
    $location.path('/my/tasks');
    $scope.menuActive = false;
  };

  $scope.logout = function() {
    AuthenticationService.logout().then(function() {
      $location.path('/login');
    });
  };

  $scope.useCollectives = function () {
    if ($scope.collectives && Object.keys($scope.collectives).length > 1) {
      return true;
    }
  };

  $scope.addNewItem = function(omnibarText) {
    if ($scope.omnibarText && $scope.omnibarText.title) {
      ItemsService.saveItem(omnibarText, UserSessionService.getActiveUUID()).then(function(/*item*/) {
        // TODO: Highlight new item instead of closing omnibar
        $scope.omnibarText = {};
        $scope.bindElsewhereEvents();
      });

    }else{
      $location.path($scope.prefix + '/items/new');
    }
  };

  $scope.omniBarFocus = function(focus) {
    if (focus) {
      $scope.omniBarActive = true;
      $scope.bindElsewhereEvents();
    } else {
      $scope.unbindElsewhereEvents();
      if ($scope.omnibarText == null || $scope.omnibarText.title == null || $scope.omnibarText.title.length === 0) {
        $scope.omniBarActive = false;
      }
    }
  };

  // "Click elsewhere to lose omnibar focus"

  $scope.$on('$destroy', function() {
    $scope.unbindElsewhereEvents();
  });

  $scope.eventsBound = false;
  $scope.unbindElsewhereEvents = function() {
    if ($scope.eventsBound){
      $document.unbind('click', $scope.elsewhereCallback);
    }
    $scope.eventsBound = false;
  };

  $scope.bindElsewhereEvents = function () {
    if (!$scope.eventsBound){
      $document.bind('click', $scope.elsewhereCallback);
      $scope.eventsBound = true;
    }
  };

  $scope.elsewhereCallback = function(event) {
    // First rule out clicking on omnibar text itself
    if (event.target.id !== 'omniItem' && event.target.id !== 'omnibarPlus') {
      $scope.$apply(function() {
        $scope.unbindElsewhereEvents();
        $scope.omniBarFocus(false);
        // Programmatically blur the omnibar
        $element.find('input#omniItem')[0].blur();
      });
    }
  };
}

HomeController['$inject'] = ['$scope', '$location', '$document', '$element', 'ItemsService', 'UserSessionService', 'AuthenticationService'];
angular.module('em.app').controller('HomeController', HomeController);

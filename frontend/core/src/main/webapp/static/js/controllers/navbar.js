/*global angular */
'use strict';

function NavbarController($location, $scope, $rootScope, $window, auth, authenticateRequest, emSwiper, Enum, userPrefix, userSessionStorage) {

  $scope.user = userSessionStorage.getUserUUID();
  $scope.collectives = userSessionStorage.getCollectives();
  $scope.prefix = userPrefix.getPrefix();

  $scope.logout = function() {
    authenticateRequest.logout().then(function() {
      $location.path('/login');
    });
  };

  $scope.setActiveUuid = function(uuid, collective) {
    auth.switchActiveUUID(uuid);
    if (collective) {
      $location.path('/collective/' + uuid);
    }
  };

  $scope.addNew = function() {
    $location.path($scope.prefix + '/tasks/new');
  };

  $scope.gotoInbox = function() {
    emSwiper.gotoInbox();
  };

  $scope.gotoHome = function() {
    emSwiper.gotoHome();
  };

  $scope.gotoTasks = function() {
    emSwiper.gotoTasks();
  };

  $scope.useCollectives = function () {
    if (userSessionStorage.getCollectives() && Object.keys(userSessionStorage.getCollectives()).length > 1) {
      return true;
    }
  };

  $scope.goToProject = function(index) {
    emSwiper.setSlideIndex(Enum.PROJECTS, index);
  };

  $rootScope.lastCheck = new Date();
  $rootScope.checking = false;

  // Get items on focus if  10 seconds passed since last focus
  angular.element($window).bind('focus',function(){
    var referenceTime = new Date();
    var referenceTime = new Date(referenceTime .getTime() - 1000*10);
    // Time after check is retried even if checking for the last time is still going on,
    // or check failed for some reason
    var retryReferenceTime = new Date(referenceTime .getTime() - 1000*20);
    if ($rootScope.lastCheck < referenceTime){
      if (!$rootScope.checking || $rootScope.lastCheck < retryReferenceTime){
        $rootScope.checking = true;
        $rootScope.lastCheck = new Date();
        auth.check();
        $rootScope.checking = false;
      }
    }
  });

}

NavbarController.$inject = ['$location', '$scope', '$rootScope', '$window', 'auth', 'authenticateRequest', 'emSwiper', 'Enum', 'userPrefix', 'userSessionStorage'];
angular.module('em.app').controller('NavbarController', NavbarController);

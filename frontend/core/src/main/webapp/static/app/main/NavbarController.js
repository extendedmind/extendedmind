'use strict';

function NavbarController($scope, SwiperService, UserSessionService) {

  $scope.user = UserSessionService.getUserUUID();
  $scope.collectives = UserSessionService.getCollectives();
  $scope.ownerPrefix = UserSessionService.getOwnerPrefix();

  // Register a callback to swiper service
  SwiperService.registerSlideChangeCallback(slideChangeCallback, 'tasks', 'NavbarController');
  SwiperService.registerSlideChangeCallback(slideChangeCallback, 'notes', 'NavbarController');
  function slideChangeCallback(/*activeSlidePath*/) {
    // Run digest to change only navbar when swiping to new location
    $scope.$digest();
  }
}

NavbarController.$inject = ['$scope', 'SwiperService', 'UserSessionService'];
angular.module('em.app').controller('NavbarController', NavbarController);

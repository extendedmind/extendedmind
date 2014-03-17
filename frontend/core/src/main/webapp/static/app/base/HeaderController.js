/* global $ */
'use strict';

function HeaderController($timeout, $scope, $location, $document, $element, $rootScope, SnapService) {

  $scope.isMenuOpen = false;

  $scope.toggleMenu = function toggleMenu() {
    if ($rootScope.isMobile) {
      SnapService.toggle();
    } else if ($rootScope.isDesktop) {
      $scope.isMenuOpen = !$scope.isMenuOpen;
    }
  };
}

HeaderController['$inject'] = [
'$timeout', '$scope', '$location', '$document', '$element', '$rootScope', 'SnapService'];
angular.module('em.app').controller('HeaderController', HeaderController);

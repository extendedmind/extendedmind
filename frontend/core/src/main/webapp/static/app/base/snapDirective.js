'use strict';

function snapDirective($rootScope, SnapService) {
  return {
    restrict: 'A',
    link: function($scope, $element) {
      SnapService.createSnapper($element[0]);
      SnapService.disableSliding();
      $rootScope.noSwiping = '';
      $rootScope.isSnapVisible = false;

      SnapService.registerOpenCallback(snapperOpened);
      SnapService.registerCloseCallback(snapperClosed);
      SnapService.registerAnimatedCallback(snapperAnimated);

      function snapperOpened() {
        SnapService.enableSliding().then(function() {
          $rootScope.isSnapVisible = true;
          $rootScope.noSwiping = 'swiper-no-swiping';
        });
      }
      function snapperClosed() {
        SnapService.disableSliding().then(function() {
          $rootScope.noSwiping = '';
        });
      }
      function snapperAnimated(snap) {
        if(snap.state().state === 'closed') {
          $rootScope.isSnapVisible = false;
          snapperClosed();
        }
      }

      $scope.toggleSnap = function toggleSnap() {
        SnapService.toggle();
      };
    }
  };
}
snapDirective.$inject = ['$rootScope', 'SnapService'];
angular.module('em.directives').directive('snapDirective', snapDirective);

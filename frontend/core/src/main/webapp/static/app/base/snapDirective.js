'use strict';

function snapDirective(SnapService) {
  return {
    restrict: 'A',
    link: function($scope, $element) {
      SnapService.createSnapper($element[0]);
      SnapService.disableSliding();

      SnapService.registerOpenCallback(snapperOpened);
      SnapService.registerCloseCallback(snapperClosed);
      SnapService.registerAnimatedCallback(snapperAnimated);

      function snapperOpened() {
        SnapService.enableSliding().then(function() {
          $scope.isSnapVisible = 'swiper-no-swiping';
        });
      }
      function snapperClosed() {
        SnapService.disableSliding().then(function() {
          $scope.isSnapVisible = '';
        });
      }
      function snapperAnimated(snap) {
        if(snap.state().state === 'closed') {
          snapperClosed();
        }
      }

      $scope.toggleSnap = function toggleSnap() {
        SnapService.toggle();
      };
    }
  };
}
snapDirective.$inject = ['SnapService'];
angular.module('em.directives').directive('snapDirective', snapDirective);

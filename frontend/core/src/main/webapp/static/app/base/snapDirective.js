'use strict';

function snapDirective($rootScope, SnapService) {
  return {
    restrict: 'A',
    link: function($scope, $element) {
      SnapService.createSnapper($element[0]);
      SnapService.disableSliding();
      $rootScope.noSwiping = false;
      $rootScope.isSnapVisible = false;

      SnapService.registerOpenCallback(snapperOpened);
      SnapService.registerCloseCallback(snapperClosed);
      SnapService.registerAnimatedCallback(snapperAnimated);

      function snapperOpened() {
        SnapService.enableSliding().then(function() {
          $rootScope.isSnapVisible = true;
          $rootScope.noSwiping = true;
        });
      }
      function snapperClosed() {
        SnapService.disableSliding().then(function() {
          $rootScope.noSwiping = false;
        });
      }
      function snapperAnimated(snap) {
        if(snap.state().state === 'closed') {
          $rootScope.isSnapVisible = false;
          snapperClosed();
        }
      }
      $scope.$on('$destroy', function() {
        SnapService.unRegisterOpenCallback(snapperOpened);
        SnapService.unRegisterCloseCallback(snapperClosed);
      });
    }
  };
}
snapDirective.$inject = ['$rootScope', 'SnapService'];
angular.module('em.directives').directive('snapDirective', snapDirective);

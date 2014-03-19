'use strict';

function snapDrawerDirective($rootScope, SnapService) {
  return {
    restrict: 'A',
    link: function($scope, $element) {

      function initializeSnapper() {
        SnapService.createSnapper($element[0]);
        $scope.noSwiping = false;

        SnapService.registerAnimatedCallback(snapperAnimated);
      }

      function snapperAnimated(snap) {
        if (snap.state().state === 'closed') {
          $scope.$digest(setNoSwipingClass(false));
        } else if (snap.state().state === 'left') {
          $scope.$digest(setNoSwipingClass(true));
        }
      }

      function setNoSwipingClass(swiping) {
        $scope.noSwiping = swiping;
      }
      $scope.getNoSwipingClass = function getNoSwipingClass() {
        return ($scope.noSwiping) ? 'swiper-no-swiping' : '';
      };

      $scope.$watch('isMobile', function(newValue) {
        if (newValue === true) {
          initializeSnapper();
        } else if (newValue === false) {
          SnapService.deleteSnapper();
        }
      });

      $scope.$on('$destroy', function() {
        SnapService.deleteSnapper();
      });

      if ($rootScope.isMobile) {
        initializeSnapper();
      }
    }
  };
}
snapDrawerDirective.$inject = ['$rootScope', 'SnapService'];
angular.module('em.directives').directive('snapDrawer', snapDrawerDirective);

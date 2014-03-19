'use strict';

function snapDrawerDirective($rootScope, SnapService) {
  return {
    restrict: 'A',
    link: function($scope, $element) {

      function initializeSnapper() {
        SnapService.createSnapper($element[0]);
        $scope.noSwiping = false;

        SnapService.registerAnimatedCallback(snapperAnimated);
        SnapService.registerEndCallback(snapperPaneReleased);
        SnapService.registerCloseCallback(snapperClosed);
      }

      function snapperAnimated(snapperStatePaneState) {
        SnapService.enableSliding();
        if (snapperStatePaneState === 'closed') {
          setNoSwipingClass(false);
        } else if (snapperStatePaneState === 'left') {
          setNoSwipingClass(true);
        }
      }

      function snapperClosed() {
        SnapService.disableSliding();
        setNoSwipingClass(false);
      }

      function snapperPaneReleased(snapper) {
        var snapperState = snapper.state();
        if (snapperState.info.towards === 'left' && snapperState.info.flick) {
          SnapService.disableSliding();
          setNoSwipingClass(false);
        }
      }

      function setNoSwipingClass(swiping) {
        if ($scope.noSwiping !== swiping) {
          $scope.noSwiping = swiping;
          $scope.$digest();
        }
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

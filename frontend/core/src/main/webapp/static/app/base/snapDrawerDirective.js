'use strict';

function snapDrawerDirective($rootScope, SnapService) {
  return {
    restrict: 'A',
    link: function($scope, $element) {
      var preventSwipe = false;

      function initializeSnapper() {
        SnapService.createSnapper($element[0]);

        SnapService.registerAnimatedCallback(snapperAnimated);
        SnapService.registerEndCallback(snapperPaneReleased);
        SnapService.registerCloseCallback(snapperClosed);
      }

      function snapperAnimated(snapperStatePaneState) {
        SnapService.enableSliding();
        if (snapperStatePaneState === 'closed') {
          togglePreventSwipe(false);
        } else if (snapperStatePaneState === 'left') {
          togglePreventSwipe(true);
        }
      }

      function snapperClosed() {
        SnapService.disableSliding();
        togglePreventSwipe(false);
      }

      function snapperPaneReleased(snapper) {
        var snapperState = snapper.state();
        if (snapperState.info.towards === 'left' && snapperState.info.flick) {
          SnapService.disableSliding();
          togglePreventSwipe(false);
        }
      }

      function togglePreventSwipe(swiping) {
        if (preventSwipe !== swiping) {
          preventSwipe = swiping;
          if (!$scope.$$phase){
            $scope.$digest();
          }
        }
      }
      $scope.getPreventSwipeClass = function getPreventSwipeClass() {
        return (preventSwipe) ? 'swiper-no-swiping' : '';
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

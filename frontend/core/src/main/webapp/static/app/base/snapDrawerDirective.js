'use strict';

function snapDrawerDirective($rootScope, SnapService, SwiperService) {
  return {
    restrict: 'A',
    link: function($scope, $element, attrs) {
      var swiperPath = attrs.snapDrawer;

      function initializeSnapper() {
        SnapService.createSnapper($element[0]);

        SnapService.registerAnimatedCallback(snapperAnimated);
        SnapService.registerEndCallback(snapperPaneReleased);
        SnapService.registerCloseCallback(snapperClosed);
      }

      // No clicking/tapping when drawer is open.
      angular.element($element).bind('touchstart', drawerContentClicked);
      function drawerContentClicked(event) {
        if (SnapService.getState().state !== 'closed') {
          event.preventDefault();
          event.stopPropagation();
        }
      }

      // Snapper is "ready". Set swiper and snapper statuses.
      function snapperAnimated(snapperState) {
        if (snapperState.state === 'closed') {
          if (swiperPath) {
            SwiperService.setSwiping(swiperPath, true);
            SnapService.enableSliding();
          }
        } else if (snapperState.state === 'left') {
          if (swiperPath) {
            SwiperService.setSwiping(swiperPath, false);
            SnapService.enableSliding();
          }
        }
      }

      function snapperClosed() {
        if (swiperPath) {
          SwiperService.setSwiping(swiperPath, true);
          SnapService.disableSliding();
        }
      }

      // Enable swiping and disable sliding and vice versa when snapper pane is released and animation starts.
      function snapperPaneReleased(snapperState) {
        // This if statement is according to current understanding the most reliable (yet not the most intuitive)
        // way to detect that the drawer is closing.
        if (snapperState.info.opening === 'left' && snapperState.info.towards === 'left' && snapperState.info.flick) {
          if (swiperPath) {
            SwiperService.setSwiping(swiperPath, true);
            SnapService.disableSliding();
          }
          // Drawer is opening
        } else if (snapperState.info.towards === 'right' && snapperState.info.flick) {
          if (swiperPath) {
            SwiperService.setSwiping(swiperPath, false);
            SnapService.enableSliding();
          }
        }
      }

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
snapDrawerDirective.$inject = ['$rootScope', 'SnapService', 'SwiperService'];
angular.module('em.directives').directive('snapDrawer', snapDrawerDirective);

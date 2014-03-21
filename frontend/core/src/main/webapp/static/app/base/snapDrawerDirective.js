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


      function snapperPaneReleased(snapperState) {
        if (snapperState.info.opening === 'left' && snapperState.info.towards === 'left' && snapperState.info.flick) {
          if (swiperPath) {
            SwiperService.setSwiping(swiperPath, true);
            SnapService.disableSliding();
          }
        } else if (snapperState.info.towards === 'right' && snapperState.info.flick) {
          SwiperService.setSwiping(swiperPath, false);
          SnapService.enableSliding();
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

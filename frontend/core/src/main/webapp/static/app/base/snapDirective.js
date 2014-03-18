'use strict';

function snapDirective($rootScope, SnapService, SwiperService) {
  return {
    restrict: 'A',
    link: function($scope, $element, attrs) {
      var swiperPath = attrs.snapDirective;

      $scope.setDrawerDragElement = function setDrawerDragElement() {
        var settings = {dragger: document.getElementById('drawer-dragger')};
        SnapService.updateSettings(settings);

        // TODO set initial resistance in SwiperService
        setTimeout(function() {
          SwiperService.setSwiperResistance(swiperPath, '100%');
        }, 0);
      };

      SnapService.createSnapper($element[0]);
      $rootScope.noSwiping = false;

      SnapService.registerOpenCallback(snapperOpened);
      SnapService.registerCloseCallback(snapperClosed);
      SnapService.registerAnimatedCallback(snapperAnimated);

      if (swiperPath) {
        SwiperService.registerSlideChangeCallback(mainSlideChanged, swiperPath, 'snapDirective');
      }

      function mainSlideChanged(path, activeIndex) {
        if (activeIndex === 0) {
          SwiperService.setSwiperResistance(swiperPath, '100%');
        } else {
          SwiperService.setSwiperResistance(swiperPath, true);
        }
      }

      function snapperOpened() {
        if ($rootScope.noSwiping) {
          $scope.$apply(setNoSwipingClass(true));
        }
      }
      function snapperClosed() {
        if (!$rootScope.noSwiping) {
          $scope.$apply(setNoSwipingClass(false));
        }
      }
      function setNoSwipingClass(swiping) {
        $rootScope.noSwiping = swiping;
      }
      function snapperAnimated(snap) {
        if (snap.state().state === 'closed') {
          $scope.$apply(setNoSwipingClass(false));
        } else if (snap.state().state === 'left') {
          $scope.$apply(setNoSwipingClass(true));
        }
      }
      $scope.$on('$destroy', function() {
        SnapService.unRegisterOpenCallback(snapperOpened);
        SnapService.unRegisterCloseCallback(snapperClosed);
      });
    }
  };
}
snapDirective.$inject = ['$rootScope', 'SnapService', 'SwiperService'];
angular.module('em.directives').directive('snapDirective', snapDirective);

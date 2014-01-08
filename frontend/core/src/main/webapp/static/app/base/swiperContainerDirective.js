/*global angular */
'use strict';

function swiperContainerDirective(SwiperService) {

  return {
    restrict: 'A',
    scope: {
      swiperPath: '@swiperContainer',
      swiperType: '@swiperType',
      expectedSlides: '=?expectedSlides'
    },
    controller: function($scope, $element, $attrs) {
      var swiperSlidePaths = [];
      var initializeSwiperCalled = false;

      // For vertical page swiping, we need to the register touch elements
      // to decide whether events should propagate to the underlying horizontal
      // swiper or not.
      if ($scope.swiperType === "page"){
        $element[0].addEventListener('touchstart', slideTouchStart, false);
        $element[0].addEventListener('touchmove', slideTouchMove, false);
      }

      this.setExpectedSlides = function(expectedSlides){
        $scope.expectedSlides = expectedSlides;
      }

      // Registers the path of the slide to the swiper
      this.registerSlidePath = function(path) {
        swiperSlidePaths.push(path); 

        // (Re)inializes the swiper after the digest to make sure the whole
        // DOM is ready before this is done. Otherwise Swiper does not register
        // the slides. It is in here to prevent the DOM from being incomplete before
        // the swiper is created.
        //
        // $scope.$evalAsync required that we know the expected slide count is known.
        // https://groups.google.com/forum/#!topic/angular/SCc45uVhTt9
        // even though this claims that evalAsync would be done in the right place:
        // http://stackoverflow.com/a/17303759/2659424
        $scope.$evalAsync( function() {
          if (!initializeSwiperCalled){
            if ($scope.expectedSlides == swiperSlidePaths.length){
              SwiperService.initializeSwiper(
                $element[0],
                $scope.swiperPath,
                $scope.swiperType,
                swiperSlidePaths,
                onSlideChangeEndCallback);
              initializeSwiperCalled = true;
            }
          }
        });

      };

      function onSlideChangeEndCallback() {
        SwiperService.onSlideChangeEnd($scope.swiperPath);
      };

      // Overlapping swipers, should stopPropagation be called?

      var top = false;
      var bottom = false;
      var up = false;
      var down = false;
      var startX, startY, distX, distY;

      function slideTouchStart() {
        console.log("slide touch start");
        var touchobj = event.changedTouches[0];
        startX = touchobj.pageX;
        startY = touchobj.pageY;
      }

      function slideTouchMove() {
        /*jshint validthis: true */
        var touchobj = event.changedTouches[0];
        distX = touchobj.pageX - startX;
        distY = touchobj.pageY - startY;

        // http://www.javascriptkit.com/javatutors/touchevents2.shtml
        if (Math.abs(distX) > Math.abs(distY)) { // horizontal
          return;
        } else if (Math.abs(distX) < Math.abs(distY)) { // vertical
          console.log("vertical scroll detected");
          if (distY < 0) {
            down = true;
            up = false;
          } else {
            down = false;
            up = true;
          }

          // https://developer.mozilla.org/en-US/docs/Web/API/Element.scrollHeight#Determine_if_an_element_has_been_totally_scrolled
          if (this.scrollHeight - this.scrollTop <= this.clientHeight && down) {
            bottom = true;
          } else if (this.scrollTop <= 0 && up) {
            top = true;
          } else {
            console.log("stopping propagation");
            bottom = false;
            top = false;
            event.stopPropagation();
          }
        }
      }
    }
  };
}
angular.module('em.directives').directive('swiperContainer', swiperContainerDirective);
swiperContainerDirective.$inject = ['SwiperService'];

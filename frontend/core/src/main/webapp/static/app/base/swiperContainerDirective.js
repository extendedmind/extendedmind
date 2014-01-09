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

      this.setExpectedSlides = function(expectedSlides){
        $scope.expectedSlides = expectedSlides;
      }

      // Registers the path of the slide to the swiper
      // and sets up listeners for element, if needed
      this.registerSlide = function(path, element) {

        // For vertical page swiping, we need to the register touch elements
        // to decide whether events should propagate to the underlying horizontal
        // swiper or not.
        if ($scope.swiperType === "page"){
          element[0].firstElementChild.addEventListener('touchstart', slideTouchStart, false);
          element[0].firstElementChild.addEventListener('touchmove', slideTouchMove, false);
        }

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
          if (distY < 0) {
            console.log("vertical scroll down");
            down = true;
            up = false;
          } else {
            console.log("vertical scroll up");
            down = false;
            up = true;
          }

          console.log("scrollHeight: " + this.scrollHeight);
          console.log("scrollTop: " + this.scrollTop);
          console.log("clientHeight: " + this.clientHeight);

          // https://developer.mozilla.org/en-US/docs/Web/API/Element.scrollHeight#Determine_if_an_element_has_been_totally_scrolled
          if (((this.scrollHeight - this.scrollTop) <= this.clientHeight) && down) {
            // bottom
          } else if ((this.scrollTop <= 0) && up) {
            // top
          } else {
            console.log("stopping propagation");
            event.stopPropagation();
          }
        }
      }
    }
  };
}
angular.module('em.directives').directive('swiperContainer', swiperContainerDirective);
swiperContainerDirective.$inject = ['SwiperService'];

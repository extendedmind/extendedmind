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
        swiperSlidePaths.push(path); 

        // For vertical page swiping, we need to the register touch elements
        // to decide whether events should propagate to the underlying horizontal
        // swiper or not.
        if ($scope.swiperType === "page"){
          // We're expecting an slide, which has "inner-slide-content-container", which has section
          element[0].firstElementChild.firstElementChild.addEventListener('touchstart', slideTouchStart, false);
          element[0].firstElementChild.firstElementChild.addEventListener('touchmove', slideTouchMove, false);
        }
        
        // (Re)inializes the swiper after the digest to make sure the whole
        // DOM is ready before this is done. Otherwise Swiper does not register
        // the slides. It is in the registerSlide function to prevent the DOM 
        // from being incomplete before the swiper is created.
        //
        // To get this to work, we have to know the expected slide count. 
        // Using $scope.$evalAsync should have done the right thing, but it is 
        // fired way too early - only the first slides is evaluated before it 
        // is fired. Using $timeout causes flickering and slows down everything.
        // https://groups.google.com/forum/#!topic/angular/SCc45uVhTt9
        // http://stackoverflow.com/a/17303759/2659424
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
      };

      function onSlideChangeEndCallback() {
        SwiperService.onSlideChangeEnd($scope.swiperPath);
      };

      // Overlapping swipers, should stopPropagation be called?

      var up = false;
      var down = false;
      var startX, startY, distX, distY;

      function slideTouchStart() {
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
            down = true;
            up = false;
          } else {
            down = false;
            up = true;
          }

          // https://developer.mozilla.org/en-US/docs/Web/API/Element.scrollHeight#Determine_if_an_element_has_been_totally_scrolled
          if (((this.scrollHeight - this.scrollTop) <= this.clientHeight) && down) {
            // bottom
          } else if ((this.scrollTop <= 0) && up) {
            // top
          } else {
            event.stopPropagation();
          }
        }
      }
    }
  };
}
angular.module('em.directives').directive('swiperContainer', swiperContainerDirective);
swiperContainerDirective.$inject = ['SwiperService'];

'use strict';

function swiperContainerDirective(SwiperService, $rootScope) {

  return {
    restrict: 'A',
    scope: {
      swiperPath: '@swiperContainer',
      swiperType: '@swiperType',
      expectedSlides: '=?expectedSlides'
    },
    controller: function($scope, $element) {
      var swiperSlideInfos = [];
      var initializeSwiperCalled = false;

      this.setExpectedSlides = function(expectedSlides){
        $scope.expectedSlides = expectedSlides;
      };

      // Registers the path of the slide to the swiper
      // and sets up listeners for element, if needed
      this.registerSlide = function(path, element, index) {
        // Slides from DOM (AngularJS directive) are not necessarily registered in desired order.
        // Slide array of objects is sorted later, during swiper initialization.
        if (index || index === 0) {
          swiperSlideInfos.push({slidePath: path, slideIndex: index});
        } else {
          // Re-init slide info array for new slide set, eg. date slides.
          if (swiperSlideInfos.length >= $scope.expectedSlides) {
            swiperSlideInfos.length = 0;
          }
          swiperSlideInfos.push(path);
        }
        // For vertical page swiping, we need to the register touch elements
        // to decide whether events should propagate to the underlying horizontal
        // swiper or not.
        if ($scope.swiperType === 'page'){
          // We're expecting an slide, which has "inner-slide-content-container", which has section
          element[0].firstElementChild.firstElementChild.addEventListener('touchstart', slideTouchStart, false);
          element[0].firstElementChild.firstElementChild.addEventListener('touchmove', slideTouchMove, false);
        }

        // Listen touch events on slide and set swiping flag on to prevent clickable elements' click event.
        element[0].addEventListener('touchstart', swipeTouchStart, false);
        element[0].addEventListener('touchmove', swipeTouchMove, false);
        element[0].addEventListener('touchend', swipeTouchEnd, false);
        
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
          if ($scope.expectedSlides === swiperSlideInfos.length){
            sortAndFlattenSlideInfos();

            SwiperService.initializeSwiper(
              $element[0],
              $scope.swiperPath,
              $scope.swiperType,
              swiperSlideInfos,
              onSlideChangeEndCallback);
            initializeSwiperCalled = true;
          }
        }
        function sortAndFlattenSlideInfos() {
          // does array contain slide objects
          if (swiperSlideInfos[0].slidePath) {
            swiperSlideInfos.sort(function(a, b) {
              return a.slideIndex - b.slideIndex;
            });
            // flatten
            for (var i = 0, len = swiperSlideInfos.length; i < len; i++) {
              swiperSlideInfos[i] = swiperSlideInfos[i].slidePath;
            }
          }
        }
      };

      function onSlideChangeEndCallback() {
        SwiperService.onSlideChangeEnd($scope, $scope.swiperPath);
      }

      var swipeUp = false;
      var swipeDown = false;
      var swipeLeft = false;
      var swipeRight = false;
      var swipeStartX, swipeStartY, swipeDistX, swipeDistY;
      var horizontalRestraint = 1;
      var verticalRestraint = 1;

      function swipeTouchStart(event) {
        $rootScope.swiping = false;
        swipeLeft = false;
        swipeRight = false;
        swipeDown = false;
        swipeUp = false;

        var touchobj = event.changedTouches[0];
        swipeStartX = touchobj.pageX;
        swipeStartY = touchobj.pageY;
      }
      function swipeTouchMove(event) {
        swipeLeft = false;
        swipeRight = false;
        swipeDown = false;
        swipeUp = false;
        /*jshint validthis: true */
        var touchobj = event.changedTouches[0];
        swipeDistX = touchobj.pageX - swipeStartX;
        swipeDistY = touchobj.pageY - swipeStartY;

        // http://www.javascriptkit.com/javatutors/touchevents2.shtml
        if (Math.abs(swipeDistX) >= horizontalRestraint && Math.abs(swipeDistY) <= horizontalRestraint) { // horizontal
          if (swipeDistX < 0) {
            swipeLeft = true;
            swipeRight = false;
          } else {
            swipeLeft = false;
            swipeRight = true;
          }
        } else if (Math.abs(swipeDistY) >= verticalRestraint && Math.abs(swipeDistX) <= verticalRestraint) { // vertical
          if (swipeDistY < 0) {
            swipeDown = true;
            swipeUp = false;
          } else {
            swipeDown = false;
            swipeUp = true;
          }
        }
        swipeStartX = touchobj.pageX;
        swipeStartY = touchobj.pageY;
      }
      function swipeTouchEnd() {
        // Slide is swiping to some direction.
        if (swipeUp || swipeDown || swipeRight || swipeRight) {
          $rootScope.swiping = true;
        }
      }

      // Overlapping swipers, should stopPropagation be called?

      var up = false;
      var down = false;
      var startX, startY, distX, distY;

      function slideTouchStart(event) {
        var touchobj = event.changedTouches[0];
        startX = touchobj.pageX;
        startY = touchobj.pageY;
      }

      function slideTouchMove(event) {
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
swiperContainerDirective['$inject'] = ['SwiperService', '$rootScope'];
angular.module('em.directives').directive('swiperContainer', swiperContainerDirective);

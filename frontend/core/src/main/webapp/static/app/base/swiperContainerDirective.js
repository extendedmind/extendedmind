'use strict';

function swiperContainerDirective(SwiperService, $rootScope) {

  return {
    restrict: 'A',
    scope: {
      swiperPath: '@swiperContainer',
      swiperType: '@swiperType',
      expectedSlides: '=expectedSlides'
    },
    controller: function($scope, $element) {
      var swiperSlideInfos = [];
      var initializeSwiperCalled = false;

      this.setExpectedSlides = function(expectedSlides){
        $scope.expectedSlides = expectedSlides;
      };

      // Listen touch events on slide and set outerSwiping flag on to prevent clickable elements' click event.
      $element[0].addEventListener('touchstart', swipeTouchStart, false);
      $element[0].addEventListener('touchmove', swipeTouchMove, false);
      $element[0].addEventListener('touchend', swipeTouchEnd, false);

      // Registers the path of the slide to the swiper
      // and sets up listeners for element, if needed
      this.registerSlide = function(path, element, index) {
        // Slides from DOM (AngularJS directive) are not necessarily registered in desired order.
        // Slide array of objects is sorted later, during swiper initialization.
        if (slideInfosHasIndex(index)){
          // Re-init slide info array, because this is a new call
          swiperSlideInfos.length = 0;
        }
        swiperSlideInfos.push({slidePath: path, slideIndex: index, slideElement: element});

        // For vertical page outerSwiping, we need to the register touch elements
        // to decide whether events should propagate to the underlying horizontal
        // swiper or not.
        if ($scope.swiperType === 'page'){
          // We're expecting a slide, which has "inner-slide-content-container", which has section
          element[0].firstElementChild.firstElementChild.addEventListener('touchstart', slideTouchStart, false);
          element[0].firstElementChild.firstElementChild.addEventListener('touchmove', slideTouchMove, false);
          element[0].firstElementChild.firstElementChild.addEventListener('touchend', slideTouchEnd, false);
          element[0].firstElementChild.firstElementChild.addEventListener('scroll', slideScroll, false);
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
        if ($scope.expectedSlides === swiperSlideInfos.length){
          var slides = sortAndFlattenSlideInfos();
          if (!initializeSwiperCalled){
            SwiperService.initializeSwiper(
              $element[0],
              $scope.swiperPath,
              $scope.swiperType,
              slides,
              onSlideChangeEndCallback);
            initializeSwiperCalled = true;
          }else {
            SwiperService.refreshSwiper($scope.swiperPath, slides);
          }
        }
        function sortAndFlattenSlideInfos() {
          // does array contain slide objects
          if (swiperSlideInfos[0].slidePath) {
            swiperSlideInfos.sort(function(a, b) {
              return a.slideIndex - b.slideIndex;
            });
            var slides = [];
            // flatten
            for (var i = 0, len = swiperSlideInfos.length; i < len; i++) {
              slides.push(swiperSlideInfos[i].slidePath);
            }
            return slides;
          }
        }
        function slideInfosHasIndex(index) {
          for (var i = 0, len = swiperSlideInfos.length; i < len; i++) {
            if (swiperSlideInfos[i].slideIndex === index){
              return true;
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
        var touchobj = event.changedTouches[0];
        swipeStartX = touchobj.pageX;
        swipeStartY = touchobj.pageY;

        $rootScope.outerSwiping = false;
        swipeLeft = false;
        swipeRight = false;
        swipeDown = false;
        swipeUp = false;
      }
      function swipeTouchMove(event) {
        /*jshint validthis: true */
        var touchobj = event.changedTouches[0];
        swipeDistX = touchobj.pageX - swipeStartX;
        swipeDistY = touchobj.pageY - swipeStartY;

        swipeLeft = false;
        swipeRight = false;
        swipeDown = false;
        swipeUp = false;

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
        // Swiper is swiping to some direction.
        if (swipeUp || swipeDown || swipeRight || swipeRight) {
          $rootScope.outerSwiping = true;
        }
      }

      // Overlapping swipers, should stopPropagation be called?

      var up = false;
      var down = false;
      var startX, startY, distX, distY;
      var slideScrollTimeout;

      function slideTouchStart(event) {
        $rootScope.innerSwiping = false;
        var touchobj = event.changedTouches[0];
        startX = touchobj.pageX;
        startY = touchobj.pageY;

        // $rootScope.scrolling = false;
        down = false;
        up = false;
      }

      function slideTouchMove(event) {
        /*jshint validthis: true */
        var touchobj = event.changedTouches[0];
        distX = touchobj.pageX - startX;
        distY = touchobj.pageY - startY;

        down = false;
        up = false;

        // http://www.javascriptkit.com/javatutors/touchevents2.shtml
        if (Math.abs(distX) > Math.abs(distY)) { // horizontal
          return; // false? true?
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
      function slideTouchEnd() {
        // Slide is swiping up or down.
        if (down || up) {
          $rootScope.innerSwiping = true;
        }
      }

      function slideScroll() {
        $rootScope.scrolling = true;
        if (slideScrollTimeout) {
          clearTimeout(slideScrollTimeout);
        }
        slideScrollTimeout = setTimeout(function() {
          $rootScope.scrolling = false;
        }, 100);
        return false;
      }

      // Unbind all listeners
      $scope.$on('$destroy', function() {
        $element[0].removeEventListener('touchstart', swipeTouchStart, false);
        $element[0].removeEventListener('touchmove', swipeTouchMove, false);
        $element[0].removeEventListener('touchend', swipeTouchEnd, false);
        
        if ($scope.swiperType === 'page'){
          for (var i = 0, len = swiperSlideInfos.length; i < len; i++) {
            swiperSlideInfos[i].slideElement[0].firstElementChild.firstElementChild.removeEventListener('touchstart', slideTouchStart, false);
            swiperSlideInfos[i].slideElement[0].firstElementChild.firstElementChild.removeEventListener('touchmove', slideTouchMove, false);
            swiperSlideInfos[i].slideElement[0].firstElementChild.firstElementChild.removeEventListener('touchend', slideTouchEnd, false);
            swiperSlideInfos[i].slideElement[0].firstElementChild.firstElementChild.removeEventListener('scroll', slideScroll, false);
          }
        }
      });

    }
  };
}
swiperContainerDirective['$inject'] = ['SwiperService', '$rootScope'];
angular.module('em.directives').directive('swiperContainer', swiperContainerDirective);

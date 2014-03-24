'use strict';

function swiperContainerDirective(SwiperService, $rootScope) {

  return {
    restrict: 'A',
    scope: {
      swiperPath: '@swiperContainer',
      swiperType: '@swiperType',
      expectedSlidesFn: '&expectedSlides'
    },
    controller: function($scope, $element) {
      var swiperSlideInfos = [];
      var initializeSwiperCalled = false;

      $scope.expectedSlides = $scope.expectedSlidesFn();

      // Listen touch events on slide and set outerSwiping flag on to prevent clickable elements' click event.
      $element[0].addEventListener('touchstart', mainSwiperTouchStart, false);
      $element[0].addEventListener('touchmove', mainSwiperTouchMove, false);
      $element[0].addEventListener('touchend', mainSwiperTouchEnd, false);

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

      function getSlideInfosIndex(path) {
        for (var i = 0, len = swiperSlideInfos.length; i < len; i++) {
          if (swiperSlideInfos[i].slidePath === path){
            return i;
          }
        }
      }

      function updateSwiper(){
        var currentExpectedSlides = $scope.expectedSlidesFn();

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
        if (currentExpectedSlides === swiperSlideInfos.length){
          // Update the expected slides variable only now, to make it possible
          // to push indexes forward
          $scope.expectedSlides = $scope.expectedSlidesFn();

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
      }

      // Registers the path of the slide to the swiper
      // and sets up listeners for element, if needed
      this.registerSlide = function(path, element, index) {
        
        // For vertical page outerSwiping, we need to the register touch elements
        // to decide whether events should propagate to the underlying horizontal
        // swiper or not.
        if ($scope.swiperType === 'page'){
          // We're expecting a slide, which has "inner-slide-content-container", which has section
          element[0].firstElementChild.firstElementChild.addEventListener('touchstart', pageSwiperSlideTouchStart, false);
          element[0].firstElementChild.firstElementChild.addEventListener('touchmove', pageSwiperSlideTouchMove, false);
          element[0].firstElementChild.firstElementChild.addEventListener('touchend', pageSwiperSlideTouchEnd, false);
          element[0].firstElementChild.firstElementChild.addEventListener('scroll', pageSwiperSlideScroll, false);
        }

        // Slides from DOM (AngularJS directive) are not necessarily registered in desired order.
        // Slide array of objects is sorted later, during swiper initialization.
        var slideInfo = {slidePath: path, slideIndex: index, slideElement: element};
        var oldSlideInfosIndex;
        if (initializeSwiperCalled) {
          oldSlideInfosIndex = getSlideInfosIndex(path);
        }
        if (oldSlideInfosIndex === undefined){
          // If index is somewhere in the middle of the pack, we need to 
          // increase bigger indexes by one
          if ($scope.expectedSlides <= swiperSlideInfos.length){
            for (var i = 0, len = swiperSlideInfos.length; i < len; i++) {
              if (swiperSlideInfos[i].slideIndex >= index){
                swiperSlideInfos[i].slideIndex += 1;
              }
            }
          }
          swiperSlideInfos.push(slideInfo);
        }else{
          swiperSlideInfos[oldSlideInfosIndex] = slideInfo;
        }
        updateSwiper();
      };

      this.unregisterSlide = function(path) {
        var slideInfosIndex = getSlideInfosIndex(path);
        if (slideInfosIndex !== undefined){
          var oldSlideIndex = swiperSlideInfos[slideInfosIndex].slideIndex;
          swiperSlideInfos.splice(slideInfosIndex, 1);
          updateSwiper();
        }
      };

      function onSlideChangeEndCallback() {
        SwiperService.onSlideChangeEnd($scope, $scope.swiperPath);
      }

      var swipeUp = false;
      var swipeDown = false;
      var swipeLeft = false;
      var swipeRight = false;
      var swipeStartX, swipeStartY, swipeDistanceX, swipeDistanceY;
      var swipeRestraintX = 1;
      var swipeRestraintY = 1;

      function mainSwiperTouchStart(event) {
        var touches = event.changedTouches[0];
        swipeStartX = touches.pageX;
        swipeStartY = touches.pageY;

        $rootScope.outerSwiping = false;
        swipeLeft = false;
        swipeRight = false;
        swipeDown = false;
        swipeUp = false;
      }

      // Main swiper swiping detection.
      function mainSwiperTouchMove(event) {
        /*jshint validthis: true */
        var touches = event.changedTouches[0];
        swipeDistanceX = touches.pageX - swipeStartX;
        swipeDistanceY = touches.pageY - swipeStartY;

        swipeLeft = false;
        swipeRight = false;
        swipeDown = false;
        swipeUp = false;

        // http://www.javascriptkit.com/javatutors/touchevents2.shtml
        if (Math.abs(swipeDistanceX) >= swipeRestraintX && Math.abs(swipeDistanceY) <= swipeRestraintX) { // horizontal
          if (swipeDistanceX < 0) {
            swipeLeft = true;
            swipeRight = false;
          } else {
            swipeLeft = false;
            swipeRight = true;
          }
        } else if (Math.abs(swipeDistanceY) >= swipeRestraintY && Math.abs(swipeDistanceX) <= swipeRestraintY) { // vertical
          if (swipeDistanceY < 0) {
            swipeDown = false;
            swipeUp = true;
          } else {
            swipeDown = true;
            swipeUp = false;
          }
        }
        swipeStartX = touches.pageX;
        swipeStartY = touches.pageY;
      }
      function mainSwiperTouchEnd() {
        // Main swiper is swiping to some direction.
        if (swipeUp || swipeDown || swipeLeft || swipeRight) {
          $rootScope.outerSwiping = true;
        }
      }

      // Overlapping swipers, should stopPropagation be called?

      var swipePageSlideUp = false;
      var swipePageSlideDown = false;
      var swipePageSlideStartX, swipePageSlideStartY, swipePageSlideDistX, swipePageSlideDistY;
      var pageSwiperSlideScrollTimeout;

      function pageSwiperSlideTouchStart(event) {
        $rootScope.innerSwiping = false;
        var touches = event.changedTouches[0];
        swipePageSlideStartX = touches.pageX;
        swipePageSlideStartY = touches.pageY;

        swipePageSlideDown = false;
        swipePageSlideUp = false;
      }

      // This function checks swiping direction and slide scrolling position.
      // Slide swiping is allowed if we are swiping up and on top of a slide or down and bottom.
      // Otherwise do a regular scroll inside the slide.
      function pageSwiperSlideTouchMove(event) {
        /*jshint validthis: true */
        var touches = event.changedTouches[0];
        swipePageSlideDistX = touches.pageX - swipePageSlideStartX;
        swipePageSlideDistY = touches.pageY - swipePageSlideStartY;

        swipePageSlideDown = false;
        swipePageSlideUp = false;

        // Determine swipe direction.
        // http://www.javascriptkit.com/javatutors/touchevents2.shtml
        if (Math.abs(swipePageSlideDistX) > Math.abs(swipePageSlideDistY)) { // horizontal
        } else if (Math.abs(swipePageSlideDistX) < Math.abs(swipePageSlideDistY)) { // vertical
          if (swipePageSlideDistY < 0) {
            swipePageSlideDown = true;
            swipePageSlideUp = false;
          } else {
            swipePageSlideDown = false;
            swipePageSlideUp = true;
          }

          // Find out scroll position of a slide and compare it with swiper direction.
          // https://developer.mozilla.org/en-US/docs/Web/API/Element.scroswipe tllHeight#Determine_if_an_element_has_been_totally_scrolled
          if (((this.scrollHeight - this.scrollTop) <= this.clientHeight) && swipePageSlideDown) {
            // Bottom of a slide and swiping down. Do nothing and let the event bubble to swiper.
          } else if ((this.scrollTop <= 0) && swipePageSlideUp) {
            // Top of a slide on swiping up. Do nothing and let the event bubble to swiper.
          } else {
            // Middle of a slide. Do a regular scroll and stop the event bubbling to swiper.
            event.stopPropagation();
            event.stopImmediatePropagation();
          }
        }
      }
      function pageSwiperSlideTouchEnd() {
        // Page swiper (vertical) slide is swiping up or down.
        if (swipePageSlideDown || swipePageSlideUp) {
          $rootScope.innerSwiping = true;
        }
      }

      function pageSwiperSlideScroll() {
        $rootScope.scrolling = true;
        if (pageSwiperSlideScrollTimeout) {
          clearTimeout(pageSwiperSlideScrollTimeout);
        }
        pageSwiperSlideScrollTimeout = setTimeout(function() {
          $rootScope.scrolling = false;
        }, 100);
        return false;
      }

      // Unbind all listeners
      $scope.$on('$destroy', function() {
        $element[0].removeEventListener('touchstart', mainSwiperTouchStart, false);
        $element[0].removeEventListener('touchmove', mainSwiperTouchMove, false);
        $element[0].removeEventListener('touchend', mainSwiperTouchEnd, false);
        
        if ($scope.swiperType === 'page'){
          for (var i = 0, len = swiperSlideInfos.length; i < len; i++) {
            swiperSlideInfos[i].slideElement[0].firstElementChild.firstElementChild.removeEventListener('touchstart', pageSwiperSlideTouchStart, false);
            swiperSlideInfos[i].slideElement[0].firstElementChild.firstElementChild.removeEventListener('touchmove', pageSwiperSlideTouchMove, false);
            swiperSlideInfos[i].slideElement[0].firstElementChild.firstElementChild.removeEventListener('touchend', pageSwiperSlideTouchEnd, false);
            swiperSlideInfos[i].slideElement[0].firstElementChild.firstElementChild.removeEventListener('scroll', pageSwiperSlideScroll, false);
          }
        }
      });
}
};
}
swiperContainerDirective['$inject'] = ['SwiperService', '$rootScope'];
angular.module('em.directives').directive('swiperContainer', swiperContainerDirective);

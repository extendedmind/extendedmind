'use strict';

function swiperContainerDirective($rootScope, $window, SwiperService) {

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

      // http://blogs.windows.com/windows_phone/b/wpdev/archive/2012/11/15/adapting-your-webkit-optimized-site-for-internet-explorer-10.aspx#step4
      if ($window.navigator.msPointerEnabled) {
        $element[0].addEventListener('MSPointerDown', mainSwiperTouchStart, false);
        $element[0].addEventListener('MSPointerMove', mainSwiperTouchMove, false);
        $element[0].addEventListener('MSPointerUp', mainSwiperTouchEnd, false);
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

      function getSlideInfosIndex(path) {
        for (var i = 0, len = swiperSlideInfos.length; i < len; i++) {
          if (swiperSlideInfos[i].slidePath === path){
            return i;
          }
        }
      }

      function updateSwiper() {
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
              onSlideChangeEndCallback,
              onResistanceBeforeCallback,
              onResistanceAfterCallback);
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

          // http://blogs.windows.com/windows_phone/b/wpdev/archive/2012/11/15/adapting-your-webkit-optimized-site-for-internet-explorer-10.aspx#step4
          if ($window.navigator.msPointerEnabled) {
            element[0].firstElementChild.firstElementChild.addEventListener('MSPointerDown', pageSwiperSlideTouchStart, false);
            element[0].firstElementChild.firstElementChild.addEventListener('MSPointerMove', pageSwiperSlideTouchMove, false);
            element[0].firstElementChild.firstElementChild.addEventListener('MSPointerUp', pageSwiperSlideTouchEnd, false);
          }
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
          swiperSlideInfos.splice(slideInfosIndex, 1);
          updateSwiper();
        }
      };

      function onSlideChangeEndCallback() {
        SwiperService.onSlideChangeEnd($scope, $scope.swiperPath);
      }

      var negativeHoldPosition, positiveHoldPosition;
      function onResistanceBeforeCallback(swiper, negativePosition) {
        negativeHoldPosition = negativePosition;
      }
      function onResistanceAfterCallback(swiper, positivePosition) {
        positiveHoldPosition = positivePosition;
      }

      var swipeUp = false;
      var swipeDown = false;
      var swipeLeft = false;
      var swipeRight = false;
      var swipeStartX, swipeStartY, swipeDistanceX, swipeDistanceY;
      var swipeRestraintX = 1;
      var swipeRestraintY = 1;

      function mainSwiperTouchStart(event) {
        if (event.type === 'touchstart') {
          swipeStartX = event.targetTouches[0].pageX;
          swipeStartY = event.targetTouches[0].pageY;
        } else {
          swipeStartX = event.pageX;
          swipeStartY = event.pageY;
        }

        $rootScope.outerSwiping = false;
        swipeLeft = false;
        swipeRight = false;
        swipeDown = false;
        swipeUp = false;
      }

      // Main swiper swiping detection.
      function mainSwiperTouchMove(event) {
        /*jshint validthis: true */

        if (event.type === 'touchmove') {
          swipeDistanceX = event.targetTouches[0].pageX - swipeStartX;
          swipeDistanceY = event.targetTouches[0].pageY - swipeStartY;
        } else {
          swipeDistanceX = event.pageX - swipeStartX;
          swipeDistanceY = event.pageY - swipeStartY;
        }

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

        if (event.type === 'touchmove') {
          swipeStartX = event.targetTouches[0].pageX;
          swipeStartY = event.targetTouches[0].pageY;
        } else {
          swipeStartX = event.pageX;
          swipeStartY = event.pageY;
        }
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

      var pullToRefreshPosition = 200;  // in pixels
      var pullToPreviousWeekElement = document.getElementById('pull-to-previous-week');
      var pullToNextWeekElement = document.getElementById('pull-to-next-week');
      var isPullToPreviousWeekLoaderActive = false;
      var isPullToNextWeekLoaderActive = false;

      function pageSwiperSlideTouchStart(event) {
        $rootScope.innerSwiping = false;

        if (event.type === 'touchstart') {
          swipePageSlideStartX = event.targetTouches[0].pageX;
          swipePageSlideStartY = event.targetTouches[0].pageY;
        } else {
          swipePageSlideStartX = event.pageX;
          swipePageSlideStartY = event.pageY;
        }

        swipePageSlideDown = false;
        swipePageSlideUp = false;

        negativeHoldPosition = 0;
        positiveHoldPosition = 0;
      }

      // This function checks swiping direction and slide scrolling position.
      // Slide swiping is allowed if we are swiping up and on top of a slide or down and bottom.
      // Otherwise do a regular scroll inside the slide.
      function pageSwiperSlideTouchMove(event) {
        /*jshint validthis: true */

        if (event.type === 'touchmove') {
          swipePageSlideDistX = event.targetTouches[0].pageX - swipePageSlideStartX;
          swipePageSlideDistY = event.targetTouches[0].pageY - swipePageSlideStartY;
        } else {
          swipePageSlideDistX = event.pageX - swipePageSlideStartX;
          swipePageSlideDistY = event.pageY - swipePageSlideStartY;
        }

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
            // Bottom of a slide and swiping down. Let the event bubble to swiper.

            // Toggle pull to next week indicator in DOM
            if (positiveHoldPosition > pullToRefreshPosition) {
              pullToNextWeekElement.className = 'week-loader-active';
              isPullToNextWeekLoaderActive = true;
            } else if (isPullToNextWeekLoaderActive) {
              pullToNextWeekElement.className = 'week-loader';
            }
          } else if ((this.scrollTop <= 0) && swipePageSlideUp) {
            // Top of a slide on swiping up. Let the event bubble to swiper.

            // Toggle pull to previous week indicator in DOM
            if (negativeHoldPosition > pullToRefreshPosition) {
              pullToPreviousWeekElement.className = 'week-loader-active';
              isPullToPreviousWeekLoaderActive = true;
            } else if (isPullToPreviousWeekLoaderActive) {
              pullToPreviousWeekElement.className = 'week-loader';
            }

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

        // Fire pull to refresh callbacks
        if (negativeHoldPosition > pullToRefreshPosition) {
          SwiperService.reachedNegativeResistancePullToRefreshPosition($scope.swiperPath);
        } else if (positiveHoldPosition > pullToRefreshPosition) {
          SwiperService.reachedPositiveResistancePullToRefreshPosition($scope.swiperPath);
        }

        // Toggle pull to previous/next week indicator in DOM
        if (isPullToPreviousWeekLoaderActive) {
          pullToPreviousWeekElement.className = 'week-loader';
          isPullToPreviousWeekLoaderActive = false;
        } else if (isPullToNextWeekLoaderActive) {
          pullToNextWeekElement.className = 'week-loader';
          isPullToNextWeekLoaderActive = false;
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

        // http://blogs.windows.com/windows_phone/b/wpdev/archive/2012/11/15/adapting-your-webkit-optimized-site-for-internet-explorer-10.aspx#step4
        if ($window.navigator.msPointerEnabled) {
          $element[0].removeEventListener('MSPointerDown', mainSwiperTouchStart, false);
          $element[0].removeEventListener('MSPointerMove', mainSwiperTouchMove, false);
          $element[0].removeEventListener('MSPointerUp', mainSwiperTouchEnd, false);
        }

        if ($scope.swiperType === 'page'){
          for (var i = 0, len = swiperSlideInfos.length; i < len; i++) {
            swiperSlideInfos[i].slideElement[0].firstElementChild.firstElementChild.removeEventListener('touchstart', pageSwiperSlideTouchStart, false);
            swiperSlideInfos[i].slideElement[0].firstElementChild.firstElementChild.removeEventListener('touchmove', pageSwiperSlideTouchMove, false);
            swiperSlideInfos[i].slideElement[0].firstElementChild.firstElementChild.removeEventListener('touchend', pageSwiperSlideTouchEnd, false);
            swiperSlideInfos[i].slideElement[0].firstElementChild.firstElementChild.removeEventListener('scroll', pageSwiperSlideScroll, false);
          }
          // http://blogs.windows.com/windows_phone/b/wpdev/archive/2012/11/15/adapting-your-webkit-optimized-site-for-internet-explorer-10.aspx#step4
          if ($window.navigator.msPointerEnabled) {
            for (var j = 0, swiperSlideInfosLength = swiperSlideInfos.length; j < swiperSlideInfosLength; j++) {
              swiperSlideInfos[j].slideElement[0].firstElementChild.firstElementChild.removeEventListener('MSPointerDown', pageSwiperSlideTouchStart, false);
              swiperSlideInfos[j].slideElement[0].firstElementChild.firstElementChild.removeEventListener('MSPointerMove', pageSwiperSlideTouchMove, false);
              swiperSlideInfos[j].slideElement[0].firstElementChild.firstElementChild.removeEventListener('MSPointerUp', pageSwiperSlideTouchEnd, false);
            }
          }
        }
      });
}
};
}
swiperContainerDirective['$inject'] = ['$rootScope', '$window', 'SwiperService'];
angular.module('em.directives').directive('swiperContainer', swiperContainerDirective);

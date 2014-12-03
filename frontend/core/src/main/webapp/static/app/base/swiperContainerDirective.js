/* Copyright 2013-2014 Extended Mind Technologies Oy
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
 'use strict';

 function swiperContainerDirective($rootScope, $window, DetectBrowserService, DrawerService, SwiperService) {

  return {
    restrict: 'A',
    require: '?^drawerAisle',
    scope: {
      swiperPath: '@swiperContainer',
      swiperType: '@swiperType',
      expectedSlidesFn: '&expectedSlides',
      toggleDrawerSlidingEvents: '@swiperContainerToggleDrawerSlidingEvents',
      slideChangedCallbackFn: '&swiperContainerSlideChanged'
    },
    controller: function($scope, $element, $attrs) {
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
          if (swiperSlideInfos[i].slidePath === path) {
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
        if (currentExpectedSlides === swiperSlideInfos.length) {
          // Update the expected slides variable only now, to make it possible
          // to push indexes forward
          $scope.expectedSlides = $scope.expectedSlidesFn();
          var slides = sortAndFlattenSlideInfos();
          if (!initializeSwiperCalled) {
            var queueStartCallbacks = true; // Queue slide change start callbacks.
            var slideChangeStartCallback, slideResetCallback;

            if ($scope.toggleDrawerSlidingEvents) {
              queueStartCallbacks = false;
              slideResetCallback = swiperSlideChangeReset;  // Add custom callback.
            }

            if ($scope.loop) {
              queueStartCallbacks = false;
              slideChangeStartCallback = onSlideChangeStartCallback;  // Add custom callback.
              slideResetCallback = onSlideResetCallback;              // Add custom callback.
            }

            SwiperService.initializeSwiper($element[0], $scope.swiperPath, $scope.swiperType, slides,
                                           slideChangeStartCallback, slideResetCallback,
                                           onSlideChangeEndCallback, $scope.loop, queueStartCallbacks);
            initializeSwiperCalled = true;

            if ($attrs.swiperContainerSlideChanged) {
              var slideChangedCallback = function(path, activeIndex, direction){
                $scope.slideChangedCallbackFn({path: path, activeIndex: activeIndex, direction: direction});
              };
              SwiperService.registerSlideChangeCallback(slideChangedCallback, $scope.swiperPath,
                                                        'swiperContainer');
            }

            if ($scope.toggleDrawerSlidingEvents) {
              // Add custom callback.
              SwiperService.registerSlideChangeCallback(swiperSlideChangeEnd, $scope.swiperPath,
                                                        'swiperContainer' + $scope.swiperPath);
            }

            if ($scope.swiperType === 'main'){
              // Main swipers have a touch ratio, where left edge does not budge
              // TODO: set left edge touch ratio to same value as right edge touch ratio
              // when $rootsScope.colums > 1
              var leftEdgeTouchRatio = 0;
              var rightEdgeTouchRatio = 0.2;
              SwiperService.setEdgeTouchRatios($scope.swiperPath, leftEdgeTouchRatio, rightEdgeTouchRatio);
            }
          } else {
            SwiperService.refreshSwiper($scope.swiperPath, slides);
          }
        }
      }

      // Registers the path of the slide to the swiper
      // and sets up listeners for element, if needed
      this.registerSlide = function(path, slideElement, index, duplicate, verticalMovementCallback) {
        if (duplicate){
          // Registered a duplicate slide, this is a looping swiper
          $scope.loop = true;
        }

        // For vertical page outerSwiping, we need to the register touch elements
        // to decide whether events should propagate to the underlying horizontal
        // swiper or not.
        var slideChildElement;
        if ($scope.swiperType === 'page') {
          // We're expecting a slide, which has "container-content" as child.
          slideChildElement = slideElement[0].firstElementChild;

          slideChildElement.addEventListener('touchstart', pageSwiperSlideTouchStart, false);
          slideChildElement.addEventListener('touchmove', pageSwiperSlideTouchMove, false);
          slideChildElement.addEventListener('touchend', pageSwiperSlideTouchEnd, false);
          slideChildElement.addEventListener('scroll', pageSwiperSlideScroll, false);

          // http://blogs.windows.com/windows_phone/b/wpdev/archive/2012/11/15/adapting-your-webkit-optimized-site-for-internet-explorer-10.aspx#step4
          if ($window.navigator.msPointerEnabled) {
            slideChildElement.addEventListener('MSPointerDown', pageSwiperSlideTouchStart, false);
            slideChildElement.addEventListener('MSPointerMove', pageSwiperSlideTouchMove, false);
            slideChildElement.addEventListener('MSPointerUp', pageSwiperSlideTouchEnd, false);
          }
        }

        // Slides from DOM (AngularJS directive) are not necessarily registered in desired order.
        // Slide array of objects is sorted later, during swiper initialization.
        var slideInfo = {
          slidePath: path,
          slideIndex: index,
          slideChildElement: slideChildElement
        };
        if (verticalMovementCallback) {
          // When present, attach vertical movement callback into slide info.
          slideInfo.verticalMovementCallback = verticalMovementCallback;
        }

        var oldSlideInfosIndex;
        if (initializeSwiperCalled) {
          oldSlideInfosIndex = getSlideInfosIndex(path);
        }
        if (oldSlideInfosIndex === undefined) {
          // If index is somewhere in the middle of the pack, we need to
          // increase bigger indexes by one
          if ($scope.expectedSlides <= swiperSlideInfos.length) {
            for (var i = 0, len = swiperSlideInfos.length; i < len; i++) {
              if (swiperSlideInfos[i].slideIndex >= index) {
                swiperSlideInfos[i].slideIndex += 1;
              }
            }
          }
          swiperSlideInfos.push(slideInfo);
        } else {
          swiperSlideInfos[oldSlideInfosIndex] = slideInfo;
        }
        updateSwiper();
      };

      this.unregisterSlide = function unregisterSlide(path) {
        var slideInfosIndex = getSlideInfosIndex(path);
        if (slideInfosIndex !== undefined) {
          swiperSlideInfos.splice(slideInfosIndex, 1);
          updateSwiper();
        }
      };

      var drawerDisabled; // FIXME: use isDraggable from DrawerService
      function disableDrawer() {
        if (!drawerDisabled && $scope.toggleDrawerSlidingEvents) {
          drawerDisabled = true;
          // FIXME: Remove DrawerService dependency and use drawerAisleController.
          DrawerService.disableDragging('right');
        }
      }
      function enableDrawer() {
        if (drawerDisabled && $scope.toggleDrawerSlidingEvents) {
          if (SwiperService.getActiveSlideIndex($scope.swiperPath) === 0) {
            // FIXME: Listen touch events only on first slide(?)
            drawerDisabled = false;
          // FIXME: Remove DrawerService dependency and use drawerAisleController.
          DrawerService.enableDragging('right');
        }
      }
    }

    function swiperSlideChangeReset(path, index) {
      if (index === 0) enableDrawer();
    }
    function swiperSlideChangeEnd(path, index) {
      if (index === 0) enableDrawer();
      else disableDrawer();
    }

    function onSlideResetCallback(swiper) {
      SwiperService.onSlideReset($scope, $scope.swiperPath);
      var slideInfo = swiperSlideInfos.findFirstObjectByKeyValue('slideIndex', swiper.activeIndex);
      if (slideInfo && slideInfo.verticalMovementCallback) {
        slideInfo.verticalMovementCallback(0);
      }
    }

    function onSlideChangeStartCallback(swiper, direction) {
      SwiperService.onSlideChangeStart($scope, $scope.swiperPath, direction);
    }

    function onSlideChangeEndCallback(swiper, direction) {
      SwiperService.onSlideChangeEnd($scope, $scope.swiperPath, direction);
    }

    function notifyVerticalMovement(movement, slideChildElement) {
      var slideInfo = swiperSlideInfos.findFirstObjectByKeyValue('slideChildElement', slideChildElement);
      if (slideInfo && slideInfo.verticalMovementCallback) {
        slideInfo.verticalMovementCallback(movement);
      }
    }

    var swipeUp = false;
    var swipeDown = false;
    var swipeLeft = false;
    var swipeRight = false;
    var swipeStartX, swipeStartY, swipeDistanceX, swipeDistanceY;

    // Set swipe restraints into same amoumt than Swiper.params.moveStartThreshold.
    var swipeRestraintX = 10;
    var swipeRestraintY = 10;

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

        // If backdrop is active, stop propagation to any swipers
        if ($rootScope.backdropActive) {
          event.stopPropagation();
          event.stopImmediatePropagation();
          return;
        }

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
        if (Math.abs(swipeDistanceX) >= swipeRestraintX &&
            Math.abs(swipeDistanceY) <= swipeRestraintX)
        {
          // Horizontal swipe.
          if (swipeDistanceX < 0) {
            disableDrawer();  // FIXME: Listen touch events only on first slide(?)
            swipeLeft = true;
            swipeRight = false;
          } else {
            enableDrawer();   // FIXME: Listen touch events only on first slide(?)
            swipeLeft = false;
            swipeRight = true;
          }
        } else if (Math.abs(swipeDistanceY) >= swipeRestraintY &&
                   Math.abs(swipeDistanceX) <= swipeRestraintY)
        {
          // Vertical swipe.
          if (swipeDistanceY < 0) {
            swipeDown = false;
            swipeUp = true;
          } else {
            swipeDown = true;
            swipeUp = false;
          }
        }

        if (event.type === 'touchmove') {
          // swipeStartX = event.targetTouches[0].pageX;
          // FIXME: Uncommented so that initial swipeStartX is preserved.

          // TODO: Evaluate need to do this here touchstart event.
          swipeStartY = event.targetTouches[0].pageY;
        } else {
          // swipeStartX = event.pageX;
          // FIXME: Uncommented so that initial swipeStartX is preserved.

          // TODO: Evaluate need to do this here touchstart event.
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
      var swipePageSlideTop = false;
      var swipePageSlideBottom = false;
      var swipePageSlideStartX, swipePageSlideStartY, swipePageSlideDistX, swipePageSlideDistY;
      var swipePageSlideYSpeedStart, swipePageSlideYSpeed;
      var pageSwiperSlideScrollTimeout;

      function pageSwiperSlideTouchStart(event) {
        /*jshint validthis: true */
        // Reset variables
        $rootScope.innerSwiping = false;
        swipePageSlideDown = false;
        swipePageSlideUp = false;
        swipePageSlideTop = false;
        swipePageSlideBottom = false;

        if (event.type === 'touchstart') {
          swipePageSlideStartX = event.targetTouches[0].pageX;
          swipePageSlideStartY = event.targetTouches[0].pageY;
        } else {
          swipePageSlideStartX = event.pageX;
          swipePageSlideStartY = event.pageY;
        }

        // Evaluate top and bottom of scroll

        // Because of this:
        // http://stackoverflow.com/questions/8546863/current-scroll-position-when-using-webkit-overflow-scrollingtouch-safari-ios
        // we need to use speed as well

        if (((this.scrollHeight - this.scrollTop) <= this.clientHeight) ||
            (((this.scrollHeight - this.scrollTop) <= this.clientHeight + 200) &&
             swipePageSlideYSpeed !== undefined && swipePageSlideYSpeed < -30))
        {
          swipePageSlideBottom = true;
        }
        if (this.scrollTop <= 0 ||
            (this.scrollTop <= 200 && swipePageSlideYSpeed !== undefined && swipePageSlideYSpeed > 30))
        {
          swipePageSlideTop = true;
        }
        swipePageSlideYSpeed = swipePageSlideYSpeedStart = undefined;
      }

      // This function checks swiping direction and slide scrolling position.
      // Slide swiping is allowed if we are swiping up and on top of a slide or down and bottom.
      // Otherwise do a regular scroll inside the slide.
      function pageSwiperSlideTouchMove(event) {
        /*jshint validthis: true */

        // If backdrop is active, stop propagation to any swipers
        if ($rootScope.backdropActive) {
          event.stopPropagation();
          event.stopImmediatePropagation();
          return;
        }

        if (event.type === 'touchmove') {
          swipePageSlideDistX = event.targetTouches[0].pageX - swipePageSlideStartX;
          swipePageSlideDistY = event.targetTouches[0].pageY - swipePageSlideStartY;
        } else {
          swipePageSlideDistX = event.pageX - swipePageSlideStartX;
          swipePageSlideDistY = event.pageY - swipePageSlideStartY;
        }


        if (swipePageSlideYSpeedStart !== undefined) {
          swipePageSlideYSpeed = swipePageSlideYSpeedStart - this.scrollTop;
        }
        swipePageSlideYSpeedStart = this.scrollTop;

        swipePageSlideDown = false;
        swipePageSlideUp = false;

        // Determine swipe direction.
        // http://www.javascriptkit.com/javatutors/touchevents2.shtml
        if (Math.abs(swipePageSlideDistX) >= swipeRestraintX &&
            Math.abs(swipePageSlideDistY) <= swipeRestraintY)
        {
          // Horizontal swipe.
        } else if (Math.abs(swipePageSlideDistY) >= swipeRestraintY &&
                   Math.abs(swipePageSlideDistX) <= swipePageSlideStartX)
        {
          // Vertical swipe.
          if (swipePageSlideDistY < 0) {
            swipePageSlideDown = true;
            swipePageSlideUp = false;
          } else {
            swipePageSlideDown = false;
            swipePageSlideUp = true;
          }

          // Find out scroll position of a slide and compare it with swiper direction.
          // https://developer.mozilla.org/en-US/docs/Web/API/Element.scrollHeight#Determine_if_an_element_has_been_totally_scrolled
          if (swipePageSlideBottom && swipePageSlideDown) {
            // Bottom of a slide and swiping down. Let the event bubble to swiper.

            // Notify swiping down to change to next slide (direction = +1).
            notifyVerticalMovement(1, this);

          } else if (swipePageSlideTop && swipePageSlideUp) {
            // Top of a slide on swiping up. Let the event bubble to swiper.

            // Notify swiping up to change to previous slide (direction = -1).
            notifyVerticalMovement(-1, this);

          } else {
            // Middle of a slide. Do a regular scroll and stop the event bubbling to swiper.

            // Notify scrolling in the middle of a slide (direction = 0).
            notifyVerticalMovement(0, this);

            event.stopPropagation();
            event.stopImmediatePropagation();
          }
        }
      }
      function pageSwiperSlideTouchEnd() {
        // Page swiper (vertical) slide is swiping up or down.
        if (swipePageSlideDown || swipePageSlideUp) {
          $rootScope.innerSwiping = true;
          // FIXME: innerswiping isn't set back to false anywhere, might cause problems,
          //        Using setTimeout as below in scrolling might do the trick!
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
        $rootScope.innerSwiping = false;
        $rootScope.outerSwiping = false;
        $rootScope.scrolling = false;
        $element[0].removeEventListener('touchstart', mainSwiperTouchStart, false);
        $element[0].removeEventListener('touchmove', mainSwiperTouchMove, false);
        $element[0].removeEventListener('touchend', mainSwiperTouchEnd, false);

        // http://blogs.windows.com/windows_phone/b/wpdev/archive/2012/11/15/adapting-your-webkit-optimized-site-for-internet-explorer-10.aspx#step4
        if ($window.navigator.msPointerEnabled) {
          $element[0].removeEventListener('MSPointerDown', mainSwiperTouchStart, false);
          $element[0].removeEventListener('MSPointerMove', mainSwiperTouchMove, false);
          $element[0].removeEventListener('MSPointerUp', mainSwiperTouchEnd, false);
        }

        if ($scope.swiperType === 'page') {
          for (var i = 0, len = swiperSlideInfos.length; i < len; i++) {
            swiperSlideInfos[i].slideChildElement.
            removeEventListener('touchstart', pageSwiperSlideTouchStart, false);

            swiperSlideInfos[i].slideChildElement.
            removeEventListener('touchmove', pageSwiperSlideTouchMove, false);

            swiperSlideInfos[i].slideChildElement.
            removeEventListener('touchend', pageSwiperSlideTouchEnd, false);

            swiperSlideInfos[i].slideChildElement.
            removeEventListener('scroll', pageSwiperSlideScroll, false);
          }
          // http://blogs.windows.com/windows_phone/b/wpdev/archive/2012/11/15/adapting-your-webkit-optimized-site-for-internet-explorer-10.aspx#step4
          if ($window.navigator.msPointerEnabled) {
            for (var j = 0, swiperSlideInfosLength = swiperSlideInfos.length;
                 j < swiperSlideInfosLength; j++)
            {
              swiperSlideInfos[j].slideChildElement.
              removeEventListener('MSPointerDown', pageSwiperSlideTouchStart, false);

              swiperSlideInfos[j].slideChildElement.
              removeEventListener('MSPointerMove', pageSwiperSlideTouchMove, false);

              swiperSlideInfos[j].slideChildElement.
              removeEventListener('MSPointerUp', pageSwiperSlideTouchEnd, false);
            }
          }
        }
        SwiperService.deleteSwiper($scope.swiperPath);
      });
    },
    link: function (scope, element, attrs, drawerAisleController){

      // Hide previous and/or next slide with this for the duration of a resize animation
      // to prevent flickering.
      function toggleAdjacentInactiveSwiperSlidesVisiblity(visibilityValue) {
        var activeSlideIndex = SwiperService.getActiveSlideIndex(scope.swiperPath);
        var swiperSlides = SwiperService.getSwiperSlides(scope.swiperPath);

        if (!swiperSlides) return;

        // hide previous
        var previousSlideIndex = activeSlideIndex - 1;
        if (previousSlideIndex >= 0) {
          var previousSwiperSlide = swiperSlides[previousSlideIndex];
          if (previousSwiperSlide.style.visibility !== visibilityValue)
            previousSwiperSlide.style.visibility = visibilityValue;
        }

        // hide next
        var nextSlideIndex = activeSlideIndex + 1;
        if (nextSlideIndex <= swiperSlides.length - 1) {
          var nextSwiperSlide = swiperSlides[nextSlideIndex];
          if (nextSwiperSlide.style.visibility !== visibilityValue)
            nextSwiperSlide.style.visibility = visibilityValue;
        }
      }

      function swiperWrapperTranslate(amount, direction, speed) {
        var translateSwiperWrapperX = amount / 2;

        if ($rootScope.currentWidth <= ($rootScope.CONTAINER_MASTER_MAX_WIDTH + amount)) {
          var contentNewWidth = $rootScope.currentWidth - amount;
          var contentLeftSideWillShrink = ($rootScope.CONTAINER_MASTER_MAX_WIDTH - contentNewWidth) / 2;
          translateSwiperWrapperX -= contentLeftSideWillShrink;
        }
        // http://stackoverflow.com/a/5574196
        if (direction === 'left') translateSwiperWrapperX = -Math.abs(translateSwiperWrapperX);
        SwiperService.setWrapperTransitionAndTranslate(scope.swiperPath,
                                                       speed,
                                                       translateSwiperWrapperX, 0, 0);
      }

      function swiperAboutToShrink(amount, direction, speed){
        swiperWrapperTranslate(amount, 'left', speed);
        toggleAdjacentInactiveSwiperSlidesVisiblity('hidden');
      }

      function swiperAboutToGrow(amount, direction, speed){
        swiperWrapperTranslate(amount, 'right', speed);
        toggleAdjacentInactiveSwiperSlidesVisiblity('hidden');
      }

      function swiperResizeReady(){
        toggleAdjacentInactiveSwiperSlidesVisiblity('visible');
        SwiperService.resizeFixSwiperAndChildSwipers(scope.swiperPath);
      }

      function swiperAboutToMoveToNewPosition() {
        // Disable swiping during move.
        SwiperService.setOnlyExternal(scope.swiperPath, true);
      }

      function swiperAboutToMoveToInitialPosition() {
        // Disable swiping during move.
        SwiperService.setOnlyExternal(scope.swiperPath, false);
      }

      // TODO: update cordova and uncomment: https://issues.apache.org/jira/browse/CB-7043
      // var iOsVersion = DetectBrowserService.getIosVersion(); // for iOS-related stuff

      function swiperMovedToNewPosition() {
        // Disable swiping in new position.
        disableSwiping();

        // Only in < iOS 8
        // TODO: update cordova and uncomment: https://issues.apache.org/jira/browse/CB-7043
        //if (iOsVersion && iOsVersion[0] < 8) {  // running iOS 7 or earlier
          var activeSlideIndex = SwiperService.getActiveSlideIndex(scope.swiperPath);
          if (activeSlideIndex > 0) {
            var swiperSlides = SwiperService.getSwiperSlides(scope.swiperPath);
            swiperSlides[activeSlideIndex - 1].classList.toggle('swiper-slide-under-element', true);
          }
        //}
      }

      function swiperMovedToInitialPosition() {
        // Enable swiping in initial position.
        enableSwiping();

        // Only in < iOS 8
        // TODO: update cordova and uncomment: https://issues.apache.org/jira/browse/CB-7043
        //if (iOsVersion && iOsVersion[0] < 8) {  // running iOS 7 or earlier
          var activeSlideIndex = SwiperService.getActiveSlideIndex(scope.swiperPath);
          if (activeSlideIndex > 0) {
            var swiperSlides = SwiperService.getSwiperSlides(scope.swiperPath);
            swiperSlides[activeSlideIndex - 1].classList.toggle('swiper-slide-under-element', false);
          }
        //}
      }

      function enableSwiping() {
        SwiperService.setOnlyExternal(scope.swiperPath, false);
      }
      function disableSwiping() {
        SwiperService.setOnlyExternal(scope.swiperPath, true);
      }

      if (drawerAisleController){

        // Register callbacks for main swipers
        if (scope.swiperType === 'main'){
          drawerAisleController.registerAreaAboutToShrink(swiperAboutToShrink, scope.swiperPath);
          drawerAisleController.registerAreaAboutToGrow(swiperAboutToGrow, scope.swiperPath);
          drawerAisleController.registerAreaResizeReady(swiperResizeReady, scope.swiperPath);

          drawerAisleController.registerAreaAboutToMoveToNewPosition(swiperAboutToMoveToNewPosition,
                                                                     scope.swiperPath);
          drawerAisleController.registerAreaAboutToMoveToInitialPosition(swiperAboutToMoveToInitialPosition,
                                                                         scope.swiperPath);
          drawerAisleController.registerAreaMovedToNewPosition(swiperMovedToNewPosition,
                                                               scope.swiperPath);
          drawerAisleController.registerAreaMovedToInitialPosition(swiperMovedToInitialPosition,
                                                                   scope.swiperPath);
        }
        // Register hide and show callbacks to swipers whose ancestor is drawerAisleController.
        drawerAisleController.registerAreaAboutToHide(disableSwiping, scope.swiperPath);
        drawerAisleController.registerAreaAboutToShow(enableSwiping, scope.swiperPath);
      }
    }
  };
}
swiperContainerDirective['$inject'] = ['$rootScope', '$window', 'DetectBrowserService', 'DrawerService',
  'SwiperService'];
angular.module('em.base').directive('swiperContainer', swiperContainerDirective);

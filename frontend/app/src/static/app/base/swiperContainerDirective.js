/* Copyright 2013-2016 Extended Mind Technologies Oy
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

 function swiperContainerDirective($rootScope, DetectBrowserService, SwiperService, packaging) {

  return {
    restrict: 'A',
    require: ['?^drawerAisle', '?^drawer'],
    scope: {
      swiperPath: '@swiperContainer',
      swiperType: '@swiperType',
      expectedSlidesFn: '&expectedSlides',
      notifyOuterInteractionStateFn: '&swiperContainerNotifyOuterInteractionState',
      slideChangedCallbackFn: '&swiperContainerSlideChanged'
    },
    controller: ['$scope', '$element', '$attrs', function($scope, $element, $attrs) {
      var swiperSlideInfos = [];
      var initializeSwiperCalled = false;
      var notifyOuterInteractionState = $scope.notifyOuterInteractionStateFn();

      $scope.expectedSlides = $scope.expectedSlidesFn();

      // Listen touch events on slide and set outerSwiping flag on to prevent clickable elements' click event.
      $element[0].addEventListener('touchstart', mainSwiperTouchStart, false);
      $element[0].addEventListener('touchmove', mainSwiperTouchMove, false);
      $element[0].addEventListener('touchend', mainSwiperTouchEnd, false);

      // http://blogs.windows.com/windows_phone/b/wpdev/archive/2012/11/15/adapting-your-webkit-optimized-site-for-internet-explorer-10.aspx#step4
      if (window.navigator.msPointerEnabled) {
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

            if (notifyOuterInteractionState) {
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

            if (notifyOuterInteractionState) {
              // Add custom callback.
              SwiperService.registerSlideChangeCallback(swiperSlideChangeEnd, $scope.swiperPath,
                                                        'swiperContainer' + $scope.swiperPath);
            }

            if ($scope.swiperType === 'main'){
              // Main swipers have a touch ratio, where left edge does not budge
              // TODO: set left edge touch ratio to same value as right edge touch ratio
              // when $rootsScope.columns > 1
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

          if (packaging === 'android-cordova') {
            // See http://developer.android.com/guide/webapps/migrating.html#TouchCancel
            slideChildElement.addEventListener('touchcancel', pageSwiperSlideTouchCancel, false);
          }

          slideChildElement.addEventListener('scroll', pageSwiperSlideScroll, false);

          // http://blogs.windows.com/windows_phone/b/wpdev/archive/2012/11/15/adapting-your-webkit-optimized-site-for-internet-explorer-10.aspx#step4
          if (window.navigator.msPointerEnabled) {
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

      function swiperSlideChangeReset(path, index) {
        if (index === 0) $scope.allowOuterInteraction();
      }
      function swiperSlideChangeEnd(path, index) {
        if (index === 0) $scope.allowOuterInteraction();
        else $scope.preventOuterInteraction();
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

      function notifyHorizontalMovement(movement) {
        if (notifyOuterInteractionState) {
          if (movement < 0) {
            $scope.preventOuterInteraction();
          } else if (movement > 0 && SwiperService.getActiveSlideIndex($scope.swiperPath) === 0) {
            $scope.allowOuterInteraction();
          }
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
        swipeStartX = event.targetTouches[0].pageX || event.pageX;
        swipeStartY = event.targetTouches[0].pageY || event.pageY;

        $rootScope.outerSwiping = false;
        swipeLeft = false;
        swipeRight = false;
        swipeDown = false;
        swipeUp = false;
      }

      // Main swiper swiping detection.
      function mainSwiperTouchMove(event) {
        /*jshint validthis: true */

        swipeDistanceX = (event.targetTouches[0].pageX || event.pageX) - swipeStartX;
        swipeDistanceY = (event.targetTouches[0].pageY || event.pageY) - swipeStartY;

        // http://www.javascriptkit.com/javatutors/touchevents2.shtml
        if (Math.abs(swipeDistanceX) >= swipeRestraintX &&
            Math.abs(swipeDistanceY) <= swipeRestraintY)
        {
          // Horizontal swipe.
          if (swipeDistanceX < 0) {
            swipeLeft = true;
            swipeRight = false;
          } else {
            swipeLeft = false;
            swipeRight = true;
          }
          notifyHorizontalMovement(swipeDistanceX);
        } else if (Math.abs(swipeDistanceY) >= swipeRestraintY &&
                   Math.abs(swipeDistanceX) <= swipeRestraintX)
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
      }

      function mainSwiperTouchEnd() {
        // Main swiper is swiping to some direction.
        if (swipeUp || swipeDown || swipeLeft || swipeRight) {
          $rootScope.outerSwiping = true;
          setTimeout(function() {
            // Clear flag.
            $rootScope.outerSwiping = false;
          }, 100);
        }
      }

      // TODO: Overlapping swipers, should stopPropagation be called?

      var swipePageSlideUp = false;
      var swipePageSlideDown = false;
      var swipePageSlideTop = false;
      var swipePageSlideBottom = false;
      var preventPageSlideSwipe = false;

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
        preventPageSlideSwipe = false;

        swipePageSlideStartX = event.targetTouches[0].pageX || event.pageX;
        swipePageSlideStartY = event.targetTouches[0].pageY || event.pageY;

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

      /*
      * This function checks swiping direction and slide scrolling position.
      * Slide swiping is allowed if we are swiping up and on top of a slide or down and bottom.
      * Otherwise do a regular scroll inside the slide.
      */
      function pageSwiperSlideTouchMove(event) {
        /*jshint validthis: true */

        swipePageSlideDistX = (event.targetTouches[0].pageX || event.pageX) - swipePageSlideStartX;
        swipePageSlideDistY = (event.targetTouches[0].pageY || event.pageY) - swipePageSlideStartY;

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
        } else {
          // Non-horizontal swipe.
          // NOTE:  Threshold comparison can not be used here because we need to prevent event bubbling into
          //        swiper to make scroll working.
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
            // Middle of a slide. Do a regular scroll and prevent swipe.
            if (!preventPageSlideSwipe) {
              SwiperService.setOnlyExternal($scope.swiperPath, true);
              preventPageSlideSwipe = true;
            }

            // Notify scrolling in the middle of a slide (direction = 0).
            notifyVerticalMovement(0, this);
          }
        }
      }
      function pageSwiperSlideTouchEnd() {
        // Page swiper (vertical) slide is swiping up or down.
        if (swipePageSlideDown || swipePageSlideUp) {

          if (Math.abs(swipePageSlideDistY) >= swipeRestraintY) {
            // NOTE:  Since threshold comparison can not be used in pageSwiperTouchMove, compare it here and
            //        set innerSwiping flag on only when passed the threshold.
            $rootScope.innerSwiping = true;
            setTimeout(function() {
              // Clear flag.
              $rootScope.innerSwiping = false;
            }, 100);
          }
        }
        if (preventPageSlideSwipe) {
          // Re-enable swipe.
          SwiperService.setOnlyExternal($scope.swiperPath, false);
          preventPageSlideSwipe = false;
        }
      }

      function pageSwiperSlideTouchCancel() {
        if (preventPageSlideSwipe) {
          // Re-enable swipe.
          SwiperService.setOnlyExternal($scope.swiperPath, false);
          preventPageSlideSwipe = false;
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
        if (window.navigator.msPointerEnabled) {
          $element[0].removeEventListener('MSPointerDown', mainSwiperTouchStart, false);
          $element[0].removeEventListener('MSPointerMove', mainSwiperTouchMove, false);
          $element[0].removeEventListener('MSPointerUp', mainSwiperTouchEnd, false);
        }

        if ($scope.swiperType === 'page') {
          for (var i = 0; i < swiperSlideInfos.length; i++) {
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
          if (window.navigator.msPointerEnabled) {
            for (var j = 0; j < swiperSlideInfos.length; j++)
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
        $scope.allowOuterInteraction(); // Allow possibly prevented outer interaction
        SwiperService.deleteSwiper($scope.swiperPath);
      });
    }],
    link: function (scope, element, attrs, controllers){

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

      function swiperAboutToShrink(amount, direction, speed, move) {
        if (move) swiperWrapperTranslate(amount, 'left', speed);
        toggleAdjacentInactiveSwiperSlidesVisiblity('hidden');
      }

      function swiperAboutToGrow(amount, direction, speed, move) {
        if (move) swiperWrapperTranslate(amount, 'right', speed);
        toggleAdjacentInactiveSwiperSlidesVisiblity('hidden');
      }

      function swiperResizeReady(){
        toggleAdjacentInactiveSwiperSlidesVisiblity('visible');
        SwiperService.resizeFixSwiperAndChildSwipers(scope.swiperPath);
      }

      function resizeSwiper() {
        SwiperService.resizeFixSwiperAndChildSwipers(scope.swiperPath);
      }

      function swiperAboutToMoveToNewPosition() {
        // Disable swiping during move.
        SwiperService.setOnlyExternalSwiperAndChildSwipers(scope.swiperPath, true);
      }

      function swiperAboutToMoveToInitialPosition() {
        // Disable swiping during move.
        SwiperService.setOnlyExternalSwiperAndChildSwipers(scope.swiperPath, false);
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
          if (activeSlideIndex >= 0) {
            var swiperSlides = SwiperService.getSwiperSlides(scope.swiperPath);
            // Remove class if it exists. Slide with class is in previous index or in first index - active
            // slide may have been set to first slide (initial slide except in loop mode).
            var slideIndexWithClass = activeSlideIndex === 0 ? 0 : activeSlideIndex - 1;
            swiperSlides[slideIndexWithClass].classList.contains('swiper-slide-under-element');
            swiperSlides[slideIndexWithClass].classList.toggle('swiper-slide-under-element', false);
          }
        //}
      }

      function enableSwiping() {
        SwiperService.setOnlyExternalSwiperAndChildSwipers(scope.swiperPath, false);
      }
      function disableSwiping() {
        SwiperService.setOnlyExternalSwiperAndChildSwipers(scope.swiperPath, true);
      }

      scope.allowOuterInteraction = function() {
        if (controllers[1]) controllers[1].enableEditorDrawer();
      };
      scope.preventOuterInteraction = function() {
        if (controllers[1]) controllers[1].disableEditorDrawerAndResetPosition();
      };

      if (controllers[0]){

        if (scope.swiperType === 'main'){
          // Register callbacks for main swipers
          controllers[0].registerAreaAboutToShrink(swiperAboutToShrink, scope.swiperPath);
          controllers[0].registerAreaAboutToGrow(swiperAboutToGrow, scope.swiperPath);
          controllers[0].registerAreaResizeReady(swiperResizeReady, scope.swiperPath);

          controllers[0].registerAreaAboutToMoveToNewPosition(swiperAboutToMoveToNewPosition,
                                                              scope.swiperPath);
          controllers[0].registerAreaAboutToMoveToInitialPosition(swiperAboutToMoveToInitialPosition,
                                                                  scope.swiperPath);
          controllers[0].registerAreaMovedToNewPosition(swiperMovedToNewPosition,
                                                        scope.swiperPath);
          controllers[0].registerAreaMovedToInitialPosition(swiperMovedToInitialPosition,
                                                            scope.swiperPath);

          controllers[0].registerAreaResizeCallback(resizeSwiper, scope.swiperPath);
        }
        // Register hide and show callbacks to swipers whose ancestor is controllers[0].
        controllers[0].registerAreaAboutToHide(disableSwiping, scope.swiperPath);
        controllers[0].registerAreaAboutToShow(enableSwiping, scope.swiperPath);
      }

      if (controllers[1] && scope.swiperType === 'main') {
        controllers[1].registerAreaAboutToShrink(swiperAboutToShrink, scope.swiperPath);
        controllers[1].registerAreaAboutToGrow(swiperAboutToGrow, scope.swiperPath);
        controllers[1].registerAreaResizeReady(swiperResizeReady, scope.swiperPath);
        controllers[1].registerAreaResizeCallback(resizeSwiper, scope.swiperPath);
      }

      scope.$on('$destroy', onDestroy);

      function onDestroy() {
        if (controllers[1] && scope.swiperType === 'main') {
          controllers[1].unregisterAreaAboutToShrink(scope.swiperPath);
          controllers[1].unregisterAreaAboutToGrow(scope.swiperPath);
          controllers[1].unregisterAreaResizeReady(scope.swiperPath);
          controllers[1].unregisterAreaResizeCallback(scope.swiperPath);
        }
      }
    }
  };
}
swiperContainerDirective['$inject'] = ['$rootScope', 'DetectBrowserService', 'SwiperService', 'packaging'];
angular.module('em.base').directive('swiperContainer', swiperContainerDirective);

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

// iDangero.us Swiper Service
// http://www.idangero.us/sliders/swiper/api.php
function SwiperService($q, $timeout) {

  // Holds reference to all the swipers and their respective paths
  var swipers = {};

  var slideResetCallbacks = {};
  var slideChangeStartCallbacks = {};
  var slideChangeCallbacks = {};
  var slideActiveCallbacks = {};

  var simulateTouch = false;

  // Optional override parameters per swiper
  var overrideSwiperParams = {};

  /*
  * Gets all swipers that match the given slide path.
  */
  var getSwiperInfosBySlidePath = function(slidePath) {

    // Slide path's root equals the swiper path it is associated to.
    var slidePathStart = slidePath;
    var slidePathStartEndIndex = slidePathStart.indexOf('/');

    if (slidePathStartEndIndex !== -1) {
      // Slide path has sub path(s). Get root path.
      slidePathStart = slidePathStart.substring(0, slidePathStartEndIndex);
    }

    var swiperInfos = {};
    for (var swiperPath in swipers) {
      if (slidePathStart === swiperPath) {
        if (swipers[swiperPath].swiperType === 'main') {
          swiperInfos.main = swipers[swiperPath];
          swiperInfos.mainPath = swiperPath;
        } else if (swipers[swiperPath].swiperType === 'page') {
          swiperInfos.page = swipers[swiperPath];
          swiperInfos.pagePath = swiperPath;
        }
      }
    }
    return swiperInfos;
  };

  // Finds the index of the slide that starts with the given slide
  var getSlideIndexBySlidePath = function(slidePath, slides) {
    if (slidePath) {
      for (var i = 0; i < slides.length; i++) {
        if (slidePath.startsWith(slides[i])) {
          return i;
        }
      }
    }
  };

  function getInitialSlideIndex(swiperPath, swiperSlidesPaths) {
    var overrideSlideIndex = useOverrideSlideIndex(swiperPath, swiperSlidesPaths);
    if (overrideSlideIndex !== undefined) {
      return overrideSlideIndex;
    } else {
      // Default to first slide
      return 0;
    }
  }

  function useOverrideSlideIndex(swiperPath, swiperSlidesPaths) {
    if (overrideSwiperParams[swiperPath] && overrideSwiperParams[swiperPath].initialSlidePath) {
      var slideIndex = getSlideIndexBySlidePath(overrideSwiperParams[swiperPath].initialSlidePath,
                                                swiperSlidesPaths);
      if (slideIndex !== undefined) {
        // execute slide change callbacks on override
        executeSlideChangeCallbacks(swiperPath,
                                    overrideSwiperParams[swiperPath].initialSlidePath,
                                    slideIndex);

        // set initial slide path to undefined for future swiper instances
        overrideSwiperParams[swiperPath].initialSlidePath = undefined;

        return slideIndex;
      }
    }
  }

  var getSwiperParameters = function(swiperPath, swiperType, swiperSlidesPaths,
                                     onSlideChangeStartCallback, onSlideResetCallback,
                                     onSlideChangeEndCallback, loop, queueStartCallbacks) {

    var leftEdgeTouchRatio = (overrideSwiperParams[swiperPath] ?
                              overrideSwiperParams[swiperPath].leftEdgeTouchRatio : undefined);

    var rightEdgeTouchRatio = (overrideSwiperParams[swiperPath] ?
                               overrideSwiperParams[swiperPath].rightEdgeTouchRatio : undefined);

    var swiperParams = {
      speed: 300, // set default speed for reference purposes only
      moveStartThreshold: 10, // same than touchBoundary FastClick and minDragDistance in Snap.js
      onlyExternal: false,
      noSwiping: true,
      loop: loop ? true : false,
      loopDuplicateSlidesIncluded: loop ? true : false,
      cssWidthAndHeight: 'height',
      roundLengths: swiperType === 'main',
      queueStartCallbacks: queueStartCallbacks,
      queueEndCallbacks: true,
      simulateTouch: simulateTouch,
      leftEdgeTouchRatio: leftEdgeTouchRatio,
      rightEdgeTouchRatio: rightEdgeTouchRatio,
      onSlideChangeStart: onSlideChangeStartCallback,
      onSlideReset: onSlideResetCallback,
      onSlideChangeEnd: onSlideChangeEndCallback
    };

    swiperParams.initialSlide = getInitialSlideIndex(swiperPath, swiperSlidesPaths);
    if (swiperType === 'main') {
      swiperParams.mode = 'horizontal';
    } else if (swiperType === 'page') {
      swiperParams.mode = 'vertical';
    }
    return swiperParams;
  };

  var setPathsToSlides = function(swiperInfo, swiperSlidesPaths) {
    swiperInfo.slidesPaths = swiperSlidesPaths;
    for (var i = 0; i < swiperInfo.swiper.slides.length; i++) {
      swiperInfo.swiper.slides[i].setData('path', swiperInfo.slidesPaths[i]);
    }
  };

  var executeSlideResetCallbacks = function(swiperPath, activeIndex, previousIndex) {
    if (slideResetCallbacks[swiperPath]) {
      for (var i = 0; i < slideResetCallbacks[swiperPath].length; i++) {
        slideResetCallbacks[swiperPath][i].callback(activeIndex, previousIndex);
      }
    }
  };

  var executeSlideChangeStartCallbacks = function(swiperPath, activeIndex, direction) {
    if (slideChangeStartCallbacks[swiperPath]) {
      for (var i = 0; i < slideChangeStartCallbacks[swiperPath].length; i++) {
        slideChangeStartCallbacks[swiperPath][i].callback(activeIndex, direction);
      }
    }
  };

  var executeSlideChangeCallbacks = function(swiperPath, path, activeIndex, direction) {
    if (slideChangeCallbacks[swiperPath]) {
      for (var i = 0; i < slideChangeCallbacks[swiperPath].length; i++) {
        slideChangeCallbacks[swiperPath][i].callback(path, activeIndex, direction);
      }
    }
    // Execute slide active callbacks
    if (slideActiveCallbacks && slideActiveCallbacks[path]) {
      for (var j = 0; j < slideActiveCallbacks[path].length; j++) {
        slideActiveCallbacks[path][j].callback();
      }
    }
  };

  return {
    initializeSwiper: function(containerElement, swiperPath, swiperType, swiperSlidesPaths,
                               onSlideChangeStartCallback, onSlideResetCallback, onSlideChangeEndCallback,
                               loop, queueStartCallbacks) {
      if (swipers[swiperPath] && swipers[swiperPath].swiper) {
        delete swipers[swiperPath].swiper;
      }
      var params = getSwiperParameters(swiperPath, swiperType, swiperSlidesPaths,
                                       onSlideChangeStartCallback, onSlideResetCallback,
                                       onSlideChangeEndCallback, loop, queueStartCallbacks);
      var swiper = new Swiper(containerElement, params);

      swipers[swiperPath] = {
        swiper: swiper,
        swiperType: swiperType,
        container: containerElement,
        callback: onSlideChangeEndCallback
      };
      setPathsToSlides(swipers[swiperPath], swiperSlidesPaths);
    },
    refreshSwiper: function(swiperPath, swiperSlidesPaths) {
      function doRefresh(swiperInfo, swiperSlidesPaths, overrideSlideIndex){
        setPathsToSlides(swipers[swiperPath], swiperSlidesPaths);
        if ((overrideSlideIndex !== undefined) &&
            (swipers[swiperPath].swiper.activeIndex !== overrideSlideIndex))
        {
          // Re-init did not work, still wrong slide, need to swipe there
          // NOTE: Adding a 0 after this call would make swiping instant, but the animation might
          //       be helpful in understanding where this is transitioning
          swipers[swiperPath].swiper.swipeTo(overrideSlideIndex);
        }
      }
      if (swipers[swiperPath] && swipers[swiperPath].swiper) {
        // Set initial slide path
        var initialSlideIndex = 0;
        var overrideSlideIndex = useOverrideSlideIndex(swiperPath, swiperSlidesPaths);
        if (overrideSlideIndex !== undefined) {
          initialSlideIndex = overrideSlideIndex;
        }
        swipers[swiperPath].swiper.params.initialSlide = initialSlideIndex;

        if (swiperSlidesPaths.length !== swipers[swiperPath].slidesPaths){
          // The number of slides has changed, reinit won't in scope, has to be done outside
          $timeout(function(){
            swipers[swiperPath].swiper.reInit();
            doRefresh(swipers[swiperPath], swiperSlidesPaths, overrideSlideIndex);
          }, 0);
        }else {
          $q.when(swipers[swiperPath].swiper.reInit()).then(function(){
            doRefresh(swipers[swiperPath], swiperSlidesPaths, overrideSlideIndex);
          });
        }
      }
    },
    refreshSwiperAndChildSwipers: function(swiperPath) {
      if (swipers[swiperPath]) {
        this.refreshSwiper(swiperPath, swipers[swiperPath].slidesPaths);
        var thisService = this;
        swipers[swiperPath].slidesPaths.forEach(function(slidePath) {
          if (swipers[slidePath]) {
            thisService.refreshSwiper(slidePath, swipers[slidePath].slidesPaths);
          }
        });
      }
    },
    /*
    * Move swiper wrapper with speed.
    */
    setWrapperTransitionAndTranslate: function(swiperPath, speed, x, y, z) {
      if (swipers[swiperPath] && swipers[swiperPath].swiper) {
        swipers[swiperPath].swiper.setWrapperTransition(speed);
        x += swipers[swiperPath].swiper.getWrapperTranslate('x');
        y += swipers[swiperPath].swiper.getWrapperTranslate('y');
        z += swipers[swiperPath].swiper.getWrapperTranslate('z');
        swipers[swiperPath].swiper.setWrapperTranslate(x, y, z);
      }
    },
    resizeFixSwiperAndChildSwipers: function(swiperPath) {
      if (swipers[swiperPath] && swipers[swiperPath].swiper) {
        swipers[swiperPath].swiper.resizeFix();

        swipers[swiperPath].slidesPaths.forEach(function(slidePath) {
          if (swipers[slidePath]) {
            swipers[slidePath].swiper.resizeFix();
          }
        });
      }
    },
    resizeFixSwiper: function(swiperPath) {
      if (swipers[swiperPath] && swipers[swiperPath].swiper) {
        swipers[swiperPath].swiper.resizeFix();
      }
    },
    onSlideReset: function(scope, swiperPath) {
      var activeIndex, previousIndex;

      if (swipers[swiperPath].swiper.params.loop) {
        activeIndex = swipers[swiperPath].swiper.activeLoopIndex;
        previousIndex = swipers[swiperPath].swiper.previousLoopIndex;
      } else {
        activeIndex = swipers[swiperPath].swiper.activeIndex;
        previousIndex = swipers[swiperPath].swiper.previousIndex;
      }
      executeSlideResetCallbacks(swiperPath, activeIndex, previousIndex);
    },
    onSlideChangeStart: function(scope, swiperPath, direction) {
      var activeIndex = swipers[swiperPath].swiper.params.loop ? swipers[swiperPath].swiper.activeLoopIndex :
      swipers[swiperPath].swiper.activeIndex;

      executeSlideChangeStartCallbacks(swiperPath, activeIndex, direction);
    },
    onSlideChangeEnd: function(scope, swiperPath, direction) {
      var activeIndex = swipers[swiperPath].swiper.params.loop ?
      swipers[swiperPath].swiper.activeLoopIndex : swipers[swiperPath].swiper.activeIndex;
      var activeSlide = swipers[swiperPath].swiper.getSlide(swipers[swiperPath].swiper.activeIndex);
      var path = activeSlide.getData('path');
      executeSlideChangeCallbacks(swiperPath, path, activeIndex, direction);
    },
    setInitialSlidePath: function(swiperPath, slidePath) {
      if (overrideSwiperParams[swiperPath]) {
        overrideSwiperParams[swiperPath].initialSlidePath = slidePath;
      } else {
        overrideSwiperParams[swiperPath] = {
          initialSlidePath: slidePath
        };
      }
    },
    setEdgeTouchRatios: function(swiperPath, leftEdgeTouchRatio, rightEdgeTouchRatio) {
      if (swipers[swiperPath] && swipers[swiperPath].swiper) {
        swipers[swiperPath].swiper.params.leftEdgeTouchRatio = leftEdgeTouchRatio;
        swipers[swiperPath].swiper.params.rightEdgeTouchRatio = rightEdgeTouchRatio;
      } else {
        if (overrideSwiperParams[swiperPath]) {
          overrideSwiperParams[swiperPath].leftEdgeTouchRatio = leftEdgeTouchRatio;
          overrideSwiperParams[swiperPath].rightEdgeTouchRatio = rightEdgeTouchRatio;
        } else {
          overrideSwiperParams[swiperPath] = {
            leftEdgeTouchRatio: leftEdgeTouchRatio,
            rightEdgeTouchRatio: rightEdgeTouchRatio
          };
        }
      }
    },
    swipeNext: function(swiperPath, speed) {
      if (swipers[swiperPath] && swipers[swiperPath].swiper) {
        swipers[swiperPath].swiper.swipeNext(false, speed); // 1. parameter is 'external'
        if (speed === 0) {
          // Manually fire slide change end callback when speed is zero meaning there will be no animation.
          this.onSlideChangeEnd(undefined, swiperPath);
        }
      }
    },
    swipePrevious: function(swiperPath, speed) {
      if (swipers[swiperPath] && swipers[swiperPath].swiper) {
        swipers[swiperPath].swiper.swipePrev(false, speed); // 1. parameter is 'external'
        if (speed === 0) {
          // Manually fire slide change end callback when speed is zero meaning there will be no animation.
          this.onSlideChangeEnd(undefined, swiperPath);
        }
      }
    },
    swipeTo: function(slidePath) {
      var swiperInfos = getSwiperInfosBySlidePath(slidePath);

      // First, swipe in the main swiper to the right index
      // Second, swipe (vertically) with the page swiper
      this.swipeMainSlide(slidePath, swiperInfos);
      this.swipePageSlide(slidePath, swiperInfos);
      return swiperInfos;
    },
    swipeToWithoutAnimation: function(slidePath) {
      var swiperInfos = getSwiperInfosBySlidePath(slidePath);
      this.swipeMainSlide(slidePath, swiperInfos, 0);
      this.swipePageSlide(slidePath, swiperInfos, 0);
    },
    swipeToWithCallback: function(slidePath) {
      var swiperInfos = this.swipeTo(slidePath);
      if (swiperInfos.pagePath) {
        executeSlideChangeCallbacks(swiperInfos.pagePath, slidePath);
      }
    },
    swipeMainSlide: function(slidePath, swiperInfos, speed) {
      swiperInfos = swiperInfos || getSwiperInfosBySlidePath(slidePath);

      if (swiperInfos.main) {
        var mainSwiperIndex = getSlideIndexBySlidePath(slidePath, swiperInfos.main.slidesPaths);
        if (mainSwiperIndex !== undefined) {
          swiperInfos.main.swiper.swipeTo(mainSwiperIndex, speed);
          if (speed === 0 && swiperInfos.mainPath) {
            // Manually execute slide change end callbacks when speed is zero
            // meaning there will be no animation.
            executeSlideChangeCallbacks(swiperInfos.mainPath, slidePath, mainSwiperIndex);
          }
        }
      }
    },
    swipePageSlide: function(slidePath, swiperInfos, speed) {
      swiperInfos = swiperInfos || getSwiperInfosBySlidePath(slidePath);

      if (swiperInfos.page) {
        var pageSwiperIndex = swiperInfos.page.slidesPaths.indexOf(slidePath);
        if (pageSwiperIndex !== -1) {
          swiperInfos.page.swiper.swipeTo(pageSwiperIndex, speed);
          if (speed === 0 && swiperInfos.pagePath) {
            // Manually execute slide change end callbacks when speed is zero
            // meaning there will be no animation.
            executeSlideChangeCallbacks(swiperInfos.pagePath, slidePath, pageSwiperIndex);
          }
        }
      }
    },
    getActiveSlidePath: function(swiperPath) {
      if (swipers[swiperPath] && swipers[swiperPath].swiper) {
        var activeSlide = swipers[swiperPath].swiper.getSlide(swipers[swiperPath].swiper.activeIndex);
        if (activeSlide) {
          return activeSlide.getData('path');
        }
      }
    },
    getMainSwiperSlide: function(slidePath) {
      var swiperInfos = getSwiperInfosBySlidePath(slidePath);
      if (swiperInfos.main) {
        var mainSwiperIndex = getSlideIndexBySlidePath(slidePath, swiperInfos.main.slidesPaths);
        if (mainSwiperIndex !== undefined) {
          return swiperInfos.main.slidesPaths[mainSwiperIndex];
        }
      }
    },
    isSlideActive: function(slidePath) {
      var swiperInfos = getSwiperInfosBySlidePath(slidePath);
      if (!swiperInfos || !swiperInfos.main){
        return false;
      }
      if (swiperInfos.page) {
        var activePageSlidePath = this.getActiveSlidePath(swiperInfos.pagePath);
        if (activePageSlidePath === undefined || activePageSlidePath !== slidePath) {
          return false;
        }
      }
      var activeMainSlidePath = this.getActiveSlidePath(swiperInfos.mainPath);
      if (activeMainSlidePath === undefined || !slidePath.startsWith(activeMainSlidePath)) {
        return false;
      }
      return true;
    },
    setOnlyExternal: function(swiperPath, swipe) {
      if (swipers[swiperPath] && swipers[swiperPath].swiper) {
        swipers[swiperPath].swiper.params.onlyExternal = swipe;
      }
    },
    registerSlideResetCallback: function(callback, swiperPath, id) {
      if (!slideResetCallbacks[swiperPath]) slideResetCallbacks[swiperPath] = [];
      else {
        for (var i = 0; i < slideResetCallbacks[swiperPath].length; i++) {
          if (slideResetCallbacks[swiperPath][i].id === id) {
            // Already registerd, replace callback
            slideResetCallbacks[swiperPath][i].callback = callback;
            return;
          }
        }
      }
      slideResetCallbacks[swiperPath].push({
        callback: callback,
        id: id});
    },
    registerSlideChangeStartCallback: function(slideChageStartCallback, swiperPath, id) {
      if (!slideChangeStartCallbacks[swiperPath]) slideChangeStartCallbacks[swiperPath] = [];
      else {
        for (var i = 0; i < slideChangeStartCallbacks[swiperPath].length; i++) {
          if (slideChangeStartCallbacks[swiperPath][i].id === id) {
            // Already registered, replace callback
            slideChangeStartCallbacks[swiperPath][i].callback = slideChageStartCallback;
            return;
          }
        }
      }
      slideChangeStartCallbacks[swiperPath].push({
        callback: slideChageStartCallback,
        id: id});
    },
    registerSlideChangeCallback: function(slideChangeCallback, swiperPath, id) {
      if (!slideChangeCallbacks[swiperPath]) {
        slideChangeCallbacks[swiperPath] = [];
      } else {
        for (var i = 0; i < slideChangeCallbacks[swiperPath].length; i++) {
          if (slideChangeCallbacks[swiperPath][i].id === id) {
            // Already registered, replace callback
            slideChangeCallbacks[swiperPath][i].callback = slideChangeCallback;
            return;
          }
        }
      }
      slideChangeCallbacks[swiperPath].push({
        callback: slideChangeCallback,
        id: id});
    },
    registerSlideActiveCallback: function(slideActiveCallback, slidePath, id) {
      if (!slideActiveCallbacks[slidePath]) {
        slideActiveCallbacks[slidePath] = [];
      } else {
        for (var i = 0; i < slideActiveCallbacks[slidePath].length; i++) {
          if (slideActiveCallbacks[slidePath][i].id === id) {
            // Already registered, replace callback
            slideActiveCallbacks[slidePath][i].callback = slideActiveCallback;
            return;
          }
        }
      }
      slideActiveCallbacks[slidePath].push({
        callback: slideActiveCallback,
        id: id});
    },
    unregisterSlideActiveCallback: function(slidePath, id) {
      if (slideActiveCallbacks[slidePath]){
        var index = slideActiveCallbacks[slidePath].findFirstIndexByKeyValue('id', id);
        if (index !== undefined){
          slideActiveCallbacks[slidePath].splice(index, 1);
        }
      }
    },
    getSwiperSlides: function(swiperPath) {
      if (swipers[swiperPath] && swipers[swiperPath].swiper) return swipers[swiperPath].swiper.slides;
    },
    getActiveSlideIndex: function(swiperPath) {
      if (swipers[swiperPath] && swipers[swiperPath].swiper)
        return swipers[swiperPath].swiper.params.loop ?
      swipers[swiperPath].swiper.activeLoopIndex : swipers[swiperPath].swiper.activeIndex;
    },
    setTouchSimulation: function(simulate) {
      simulateTouch = simulate;
    },
    setEnableSwipeToNext: function(swiperPath, enable) {
      if (swipers[swiperPath]) {
        swipers[swiperPath].swiper.params.swipeToNext = enable;
      }
    },
    deleteSwiper: function(swiperPath){
      if (swipers[swiperPath]){
        if (swipers[swiperPath].swiper){
          swipers[swiperPath].swiper.destroy();
          delete swipers[swiperPath].swiper;
        }
        delete swipers[swiperPath];
        if (slideChangeCallbacks[swiperPath]) delete slideChangeCallbacks[swiperPath];
        if (slideChangeStartCallbacks[swiperPath]) delete slideChangeStartCallbacks[swiperPath];
        if (slideResetCallbacks[swiperPath]) delete slideResetCallbacks[swiperPath];
        if (slideActiveCallbacks[swiperPath]) delete slideActiveCallbacks[swiperPath];
        if (overrideSwiperParams[swiperPath]) delete overrideSwiperParams[swiperPath];
      }
    }
  };
}
SwiperService['$inject'] = ['$q', '$timeout'];
angular.module('em.base').factory('SwiperService', SwiperService);

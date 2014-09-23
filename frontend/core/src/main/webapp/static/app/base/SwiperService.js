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

  var slideChangeStartCallbacks = {};
  var slideChangeCallbacks = {};
  var negativeResistancePullToRefreshCallbacks = {};
  var positiveResistancePullToRefreshCallbacks = {};
  var swiperCreatedCallbacks = {};
  var simulateTouch = false;

  // Optional override parameters per swiper
  var overrideSwiperParams = {};

  // Gets all swipers that match the given slide path
  var getSwiperInfosBySlidePath = function(slidePath) {
    var swiperInfos = {};
    for (var swiperPath in swipers) {
      if (slidePath.startsWith(swiperPath)) {
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
      var slideIndex = getSlideIndexBySlidePath(overrideSwiperParams[swiperPath].initialSlidePath, swiperSlidesPaths);
      if (slideIndex !== undefined) {
        // execute slide change callbacks on override
        executeSlideChangeCallbacks(swiperPath, overrideSwiperParams[swiperPath].initialSlidePath, slideIndex);

        // set initial slide path to undefined for future swiper instances
        overrideSwiperParams[swiperPath].initialSlidePath = undefined;

        return slideIndex;
      }
    }
  }

  var getSwiperParameters = function(swiperPath, swiperType, swiperSlidesPaths, onSwiperCreatedCallback, onSlideChangeStartCallback, onSlideChangeEndCallback, onResistanceBeforeCallback, onResistanceAfterCallback, onlyExternalSwipe, loop) {
    var leftEdgeTouchRatio = (overrideSwiperParams[swiperPath]) ? overrideSwiperParams[swiperPath].leftEdgeTouchRatio : undefined;
    var rightEdgeTouchRatio = (overrideSwiperParams[swiperPath]) ? overrideSwiperParams[swiperPath].rightEdgeTouchRatio : undefined;
    var swiperParams = {
      speed: 300, // set default speed for reference purposes only
      onlyExternal: onlyExternalSwipe ? true : false,
      noSwiping: true,
      loop: loop ? true : false,
      loopDuplicateSlidesIncluded: loop ? true : false,
      cssWidthAndHeight: 'height',
      queueStartCallbacks: loop ? false : true,
      queueEndCallbacks: true,
      simulateTouch: simulateTouch,
      leftEdgeTouchRatio: leftEdgeTouchRatio,
      rightEdgeTouchRatio: rightEdgeTouchRatio,
      onSwiperCreated: onSwiperCreatedCallback,
      onSlideChangeStart: onSlideChangeStartCallback,
      onSlideChangeEnd: onSlideChangeEndCallback,
      onResistanceBefore: onResistanceBeforeCallback,
      onResistanceAfter: onResistanceAfterCallback
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

  var executeSlideChangeStartCallbacks = function(swiperPath, direction) {
    if (slideChangeStartCallbacks[swiperPath]) {
      for (var i = 0; i < slideChangeStartCallbacks[swiperPath].length; i++) {
        slideChangeStartCallbacks[swiperPath][i].callback(direction);
      }
    }
  };

  var executeSlideChangeCallbacks = function(swiperPath, path, activeIndex, direction) {
    if (slideChangeCallbacks[swiperPath]) {
      for (var i = 0; i < slideChangeCallbacks[swiperPath].length; i++) {
        slideChangeCallbacks[swiperPath][i].callback(path, activeIndex, direction);
      }
    }
  };
  var executeNegativeResistancePullToRefreshCallbacks = function executeNegativeResistancePullToRefreshCallbacks(swiperPath) {
    if (negativeResistancePullToRefreshCallbacks[swiperPath]) {
      for (var i = 0, len = negativeResistancePullToRefreshCallbacks[swiperPath].length; i < len; i++) {
        negativeResistancePullToRefreshCallbacks[swiperPath][i].callback();
      }
    }
  };
  var executePositiveResistancePullToRefreshCallbacks = function executePositiveResistancePullToRefreshCallbacks(swiperPath) {
    if (positiveResistancePullToRefreshCallbacks[swiperPath]) {
      for (var i = 0, len = positiveResistancePullToRefreshCallbacks[swiperPath].length; i < len; i++) {
        positiveResistancePullToRefreshCallbacks[swiperPath][i].callback();
      }
    }
  };
  var executeSwiperCreatedCallbacks = function executeSwiperCreatedCallbacks(swiperPath) {
    if (swiperCreatedCallbacks[swiperPath]) {
      for (var i = 0, len = swiperCreatedCallbacks[swiperPath].length; i < len; i++) {
        swiperCreatedCallbacks[swiperPath][i].callback();
      }
    }
  };

  return {
    initializeSwiper: function(containerElement, swiperPath, swiperType, swiperSlidesPaths, onSwiperCreatedCallback, onSlideChangeStartCallback, onSlideChangeEndCallback, onResistanceBeforeCallback, onResistanceAfterCallback, disableSwiper, loop) {
      if (swipers[swiperPath] && swipers[swiperPath].swiper) {
        delete swipers[swiperPath].swiper;
      }
      var params = getSwiperParameters(
        swiperPath,
        swiperType,
        swiperSlidesPaths,
        onSwiperCreatedCallback,
        onSlideChangeStartCallback,
        onSlideChangeEndCallback,
        onResistanceBeforeCallback,
        onResistanceAfterCallback,
        disableSwiper,
        loop);
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
        if ((overrideSlideIndex !== undefined) && (swipers[swiperPath].swiper.activeIndex !== overrideSlideIndex) ) {
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
    onSwiperCreated: function(scope, swiperPath) {
      executeSwiperCreatedCallbacks(swiperPath);
    },
    onSlideChangeStart: function(scope, swiperPath, direction) {
      executeSlideChangeStartCallbacks(swiperPath, direction);
    },
    onSlideChangeEnd: function(scope, swiperPath, direction) {
      var activeIndex = swipers[swiperPath].swiper.params.loop ?
      swipers[swiperPath].swiper.activeLoopIndex : swipers[swiperPath].swiper.activeIndex;
      var activeSlide = swipers[swiperPath].swiper.getSlide(activeIndex);
      var path = activeSlide.getData('path');
      executeSlideChangeCallbacks(swiperPath, path, activeIndex, direction);
    },
    reachedNegativeResistancePullToRefreshPosition: function(swiperPath) {
      executeNegativeResistancePullToRefreshCallbacks(swiperPath);
    },
    reachedPositiveResistancePullToRefreshPosition: function(swiperPath) {
      executePositiveResistancePullToRefreshCallbacks(swiperPath);
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
    swipeNext: function(swiperPath) {
      if (swipers[swiperPath] && swipers[swiperPath].swiper) {
        swipers[swiperPath].swiper.swipeNext();
      }
    },
    swipePrevious: function(swiperPath) {
      if (swipers[swiperPath] && swipers[swiperPath].swiper) {
        swipers[swiperPath].swiper.swipePrev();
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
    swipeToWithCallback: function(slidePath) {
      var swiperInfos = this.swipeTo(slidePath);
      if (swiperInfos.pagePath) {
        executeSlideChangeCallbacks(swiperInfos.pagePath, slidePath);
      }
    },
    swipeMainSlide: function(slidePath, swiperInfos) {
      swiperInfos = swiperInfos || getSwiperInfosBySlidePath(slidePath);

      if (swiperInfos.main) {
        var mainSwiperIndex = getSlideIndexBySlidePath(slidePath, swiperInfos.main.slidesPaths);
        if (mainSwiperIndex !== undefined) {
          swiperInfos.main.swiper.swipeTo(mainSwiperIndex);
        }
      }
    },
    swipePageSlide: function(slidePath, swiperInfos) {
      swiperInfos = swiperInfos || getSwiperInfosBySlidePath(slidePath);

      if (swiperInfos.page) {
        var pageSwiperIndex = swiperInfos.page.slidesPaths.indexOf(slidePath);
        if (pageSwiperIndex !== -1) {
          swiperInfos.page.swiper.swipeTo(pageSwiperIndex);
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
    setOnlyExternal: function(swiperPath, swipe) {
      if (swipers[swiperPath] && swipers[swiperPath].swiper) {
        swipers[swiperPath].swiper.params.onlyExternal = swipe;
      }
    },
    setSwiperResistance: function(swiperPath, resistance) {
      swipers[swiperPath].swiper.params.resistance = resistance;
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
    registerNegativeResistancePullToRefreshCallback: function(negativeResistancePullToRefreshCallback, swiperPath, id) {
      if (!negativeResistancePullToRefreshCallbacks[swiperPath]) {
        negativeResistancePullToRefreshCallbacks[swiperPath] = [];
      } else {
        for (var i = 0, len = negativeResistancePullToRefreshCallbacks[swiperPath].length; i < len; i++) {
          if (negativeResistancePullToRefreshCallbacks[swiperPath][i].id === id) {
            negativeResistancePullToRefreshCallbacks[swiperPath][i].callback = negativeResistancePullToRefreshCallback;
            return;
          }
        }
      }
      negativeResistancePullToRefreshCallbacks[swiperPath].push({
        callback: negativeResistancePullToRefreshCallback,
        id: id});
    },
    registerPositiveResistancePullToRefreshCallback: function(positiveResistancePullToRefreshCallback, swiperPath, id) {
      if (!positiveResistancePullToRefreshCallbacks[swiperPath]) {
        positiveResistancePullToRefreshCallbacks[swiperPath] = [];
      } else {
        for (var i = 0, len = positiveResistancePullToRefreshCallbacks[swiperPath].length; i < len; i++) {
          if (positiveResistancePullToRefreshCallbacks[swiperPath][i].id === id) {
            positiveResistancePullToRefreshCallbacks[swiperPath][i].callback = positiveResistancePullToRefreshCallback;
            return;
          }
        }
      }
      positiveResistancePullToRefreshCallbacks[swiperPath].push({
        callback: positiveResistancePullToRefreshCallback,
        id: id});
    },
    registerSwiperCreatedCallback: function(swiperCreatedCallback, swiperPath, id) {
      if (!swiperCreatedCallbacks[swiperPath]) {
        swiperCreatedCallbacks[swiperPath] = [];
      } else {
        for (var i = 0, len = swiperCreatedCallbacks[swiperPath].length; i < len; i++) {
          if (swiperCreatedCallbacks[swiperPath][i].id === id) {
            swiperCreatedCallbacks[swiperPath][i].callback = swiperCreatedCallback;
            return;
          }
        }
      }
      swiperCreatedCallbacks[swiperPath].push({
        callback: swiperCreatedCallback,
        id: id});
    },
    getSwiperSlides: function(swiperPath) {
      if (swipers[swiperPath] && swipers[swiperPath].swiper) return swipers[swiperPath].swiper.slides;
    },
    getSwiperActiveSlideIndex: function(swiperPath) {
      if (swipers[swiperPath] && swipers[swiperPath].swiper) return swipers[swiperPath].swiper.activeIndex;
    },
    setTouchSimulation: function(simulate) {
      simulateTouch = simulate;
    }
  };
}
SwiperService['$inject'] = ['$q', '$timeout'];
angular.module('em.base').factory('SwiperService', SwiperService);

'use strict';

// iDangero.us Swiper Service
// http://www.idangero.us/sliders/swiper/api.php
function SwiperService($q) {

  // Holds reference to all the swipers and their respective paths
  var swipers = {};

  var slideChangeCallbacks = {};
  var negativeResistancePullToRefreshCallbacks = {};
  var positiveResistancePullToRefreshCallbacks = {};

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
    if (overrideSlideIndex !== undefined){
      return overrideSlideIndex;
    }else{
      // Default to first slide
      return 0;
    }
  }

  function useOverrideSlideIndex(swiperPath, swiperSlidesPaths){
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

  var getSwiperParameters = function(swiperPath, swiperType, swiperSlidesPaths, onSlideChangeEndCallback, onResistanceBeforeCallback, onResistanceAfterCallback, onlyExternalSwipe) {
    var leftEdgeTouchRatio = (overrideSwiperParams[swiperPath]) ? overrideSwiperParams[swiperPath].leftEdgeTouchRatio : undefined;
    var rightEdgeTouchRatio = (overrideSwiperParams[swiperPath]) ? overrideSwiperParams[swiperPath].rightEdgeTouchRatio : undefined;

    var swiperParams = {
      onlyExternal: onlyExternalSwipe ? true : false,
      noSwiping: true,
      queueStartCallbacks: true,
      queueEndCallbacks: true,
      simulateTouch: true,
      leftEdgeTouchRatio: leftEdgeTouchRatio,
      rightEdgeTouchRatio: rightEdgeTouchRatio,
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
    for (var i = 0; i < swiperInfo.swiper.slides.length; i++) {
      swiperInfo.swiper.slides[i].setData('path', swiperSlidesPaths[i]);
    }
  };

  var executeSlideChangeCallbacks = function(swiperPath, path, activeIndex) {
    if (slideChangeCallbacks[swiperPath]) {
      for (var i = 0; i < slideChangeCallbacks[swiperPath].length; i++) {
        slideChangeCallbacks[swiperPath][i].callback(path, activeIndex);
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

  return {
    initializeSwiper: function(containerElement, swiperPath, swiperType, swiperSlidesPaths, onSlideChangeEndCallback, onResistanceBeforeCallback, onResistanceAfterCallback, disableSwiper) {
      if (swipers[swiperPath] && swipers[swiperPath].swiper) {
        delete swipers[swiperPath].swiper;
      }
      var params = getSwiperParameters(
        swiperPath,
        swiperType,
        swiperSlidesPaths,
        onSlideChangeEndCallback,
        onResistanceBeforeCallback,
        onResistanceAfterCallback,
        disableSwiper);
      var swiper = new Swiper(containerElement, params);

      swipers[swiperPath] = {
        swiper: swiper,
        swiperType: swiperType,
        slidesPaths: swiperSlidesPaths,
        container: containerElement,
        callback: onSlideChangeEndCallback
      };
      setPathsToSlides(swipers[swiperPath], swiperSlidesPaths);
    },
    refreshSwiper: function(swiperPath, swiperSlidesPaths) {
      if (swipers[swiperPath] && swipers[swiperPath].swiper) {
        // Set initial slide path
        var initialSlideIndex = 0;
        var overrideSlideIndex = useOverrideSlideIndex(swiperPath, swiperSlidesPaths);
        if (overrideSlideIndex !== undefined){
          initialSlideIndex = overrideSlideIndex;
        }
        swipers[swiperPath].swiper.params.initialSlide = initialSlideIndex;
        swipers[swiperPath].slidesPaths = swiperSlidesPaths;
        $q.when(swipers[swiperPath].swiper.reInit()).then(function() {
          setPathsToSlides(swipers[swiperPath], swiperSlidesPaths);
          if ((overrideSlideIndex !== undefined) && (swipers[swiperPath].swiper.activeIndex !== overrideSlideIndex) ){
            // Re-init did not work, still wrong slide, need to swipe there
            // NOTE: Adding a 0 after this call would make swiping instant, but the animation might
            //       be helpful in understanding where this is transitioning
            swipers[swiperPath].swiper.swipeTo(overrideSlideIndex);
          }
        });
      }
    },
    refreshSwiperAndChildSwipers: function(swiperPath) {
      if (swipers[swiperPath]) {
        this.refreshSwiper(swiperPath, swipers[swiperPath].slidesPaths);
        var thisService = this;
        swipers[swiperPath].slidesPaths.forEach(function(slidePath){
          if (swipers[slidePath]){
            thisService.refreshSwiper(slidePath, swipers[slidePath].slidesPaths);
          }
        });
      }

      function refreshChildSwiper(slidePath, slideIndex, parentSwiper) {
        if (swipers[parentSwiper[slideIndex]]) {
          this.refreshSwiper(parentSwiper[slideIndex], swipers[parentSwiper[slideIndex]].slidesPaths);
        }
      }
    },
    onSlideChangeEnd: function(scope, swiperPath) {
      var activeIndex = swipers[swiperPath].swiper.activeIndex;
      var activeSlide = swipers[swiperPath].swiper.getSlide(swipers[swiperPath].swiper.activeIndex);
      var path = activeSlide.getData('path');
      executeSlideChangeCallbacks(swiperPath, path, activeIndex);
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
      if (swiperInfos.pagePath){
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
    setSwiping: function(swiperPath, swipe) {
      if (swipers[swiperPath] && swipers[swiperPath].swiper) {
        swipers[swiperPath].swiper.params.swiping = swipe;
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
    }
  };
}
SwiperService['$inject'] = ['$q'];
angular.module('em.services').factory('SwiperService', SwiperService);

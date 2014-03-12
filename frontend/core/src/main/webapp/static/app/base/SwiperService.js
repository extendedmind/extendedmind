'use strict';

// iDangero.us Swiper Service       
// http://www.idangero.us/sliders/swiper/api.php
function SwiperService($q, UserSessionService) {

  // Holds reference to all the swipers and their respective paths
  var swipers = {};

  var slideChangeCallbacks = {};

  // Initial slides, these must be set by the route provider
  var initialMainSlidePath;
  var initialPageSlidePath;

  // Gets all swipers that match the given slide path
  var getSwiperInfosBySlidePath = function(slidePath) {
    var swiperInfos = {};
    for (var swiperPath in swipers) {
      if (slidePath.startsWith(swiperPath)){
        if (swipers[swiperPath].swiperType === 'main') {
          swiperInfos.main = swipers[swiperPath];
        }else if (swipers[swiperPath].swiperType === 'page'){
          swiperInfos.page = swipers[swiperPath];
        }
      }
    }
    return swiperInfos;
  };

  // Finds the index of the slide that starts with the given slide
  var getSlideIndexBySlidePath = function(slidePath, slides) {
    if (slidePath){
      for (var i = 0; i < slides.length; i++) {
        if (slidePath.startsWith(slides[i])){
          return i;
        }
      }
    }
  };

  var getInitialSlideIndex = function(swiperType, swiperSlidesPaths){
    var initialSlideIndex = 0;
    if (swiperType === 'main'){
      var mainSlideIndex = getSlideIndexBySlidePath(initialMainSlidePath, swiperSlidesPaths);
      if (mainSlideIndex !== undefined){
        initialSlideIndex = mainSlideIndex;
      }
    }else if (swiperType === 'main'){
      var pageSlideIndex = getSlideIndexBySlidePath(initialPageSlidePath, swiperSlidesPaths);
      if (pageSlideIndex !== undefined){
        initialSlideIndex = pageSlideIndex;
      }
    }
    return initialSlideIndex;
  };

  var getSwiperParameters = function(swiperType, swiperSlidesPaths, onSlideChangeEndCallback) {
    var swiperParams = {
      noSwiping: true,
      queueStartCallbacks: true,
      queueEndCallbacks: true,
      simulateTouch: true,
      onSlideChangeEnd: onSlideChangeEndCallback
    };
    
    swiperParams.initialSlide = getInitialSlideIndex(swiperType, swiperSlidesPaths);
    if (swiperType === 'main'){
      swiperParams.mode = 'horizontal';
    } else if (swiperType === 'page'){
      swiperParams.mode = 'vertical';
    }
    return swiperParams;
  };

  var setPathsToSlides = function(swiperInfo, swiperSlidesPaths) {
    for (var i = 0; i < swiperInfo.swiper.slides.length; i++) {
      swiperInfo.swiper.slides[i].setData('path', swiperSlidesPaths[i]);
    }
  };

  var executeSlideChangeCallbacks = function(swiperPath, path){
    if (slideChangeCallbacks[swiperPath]) {
      for (var i = 0; i < slideChangeCallbacks[swiperPath].length; i++) {
        slideChangeCallbacks[swiperPath][i].callback(path);
      }
    }
  };

  return {
    initializeSwiper: function(containerElement, swiperPath, swiperType, swiperSlidesPaths, onSlideChangeEndCallback) {
      if (swipers[swiperPath]){
        delete swipers[swiperPath].swiper;
      }
      var params = getSwiperParameters(
        swiperType,
        swiperSlidesPaths,
        onSlideChangeEndCallback);
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
      if (swipers[swiperPath]){
        // Set initial slide path
        swipers[swiperPath].swiper.params.initialSlide = getInitialSlideIndex(swipers[swiperPath].swiperType, swiperSlidesPaths);
        swipers[swiperPath].slidesPaths = swiperSlidesPaths;
        $q.when(swipers[swiperPath].swiper.reInit()).then(function(){
          setPathsToSlides(swipers[swiperPath], swiperSlidesPaths);
        });
      }
    },
    onSlideChangeEnd: function(scope, swiperPath) {
      var activeSlide = swipers[swiperPath].swiper.getSlide(swipers[swiperPath].swiper.activeIndex);
      var path = UserSessionService.getOwnerPrefix() + '/' + activeSlide.getData('path');
      executeSlideChangeCallbacks(swiperPath, path);
    },
    setInitialSlidePath: function(mainSlide, pageSlide) {
      initialMainSlidePath = mainSlide;
      initialPageSlidePath = pageSlide;
    },
    swipeTo: function(slidePath) {
      var swiperInfos = getSwiperInfosBySlidePath(slidePath);

      // First, swipe in the main swiper to the right index 
      // Second, swipe (vertically) with the page swiper
      this.swipeMainSlide(slidePath, swiperInfos);
      this.swipePageSlide(slidePath, swiperInfos);
    },
    swipeMainSlide: function(slidePath, swiperInfos) {
      swiperInfos = swiperInfos || getSwiperInfosBySlidePath(slidePath);

      if (swiperInfos.main){
        var mainSwiperIndex = getSlideIndexBySlidePath(slidePath, swiperInfos.main.slidesPaths);
        if (mainSwiperIndex !== undefined){
          swiperInfos.main.swiper.swipeTo(mainSwiperIndex);
        }
      }
    },
    swipePageSlide: function(slidePath, swiperInfos) {
      swiperInfos = swiperInfos || getSwiperInfosBySlidePath(slidePath);

      if (swiperInfos.page) {
        var pageSwiperIndex = swiperInfos.page.slidesPaths.indexOf(slidePath);
        if (pageSwiperIndex !== -1){
          swiperInfos.page.swiper.swipeTo(pageSwiperIndex);
        }
      }
    },
    getActiveSlidePath: function(swiperPath) {
      if (swipers[swiperPath]){
        var activeSlide = swipers[swiperPath].swiper.getSlide(swipers[swiperPath].swiper.activeIndex);
        if (activeSlide) {
          return activeSlide.getData('path');
        }
      }
    },
    registerSlideChangeCallback: function(slideChangeCallback, swiperPath, id) {
      if (!slideChangeCallbacks[swiperPath]) {
        slideChangeCallbacks[swiperPath] = [];
      }else{
        for (var i = 0; i < slideChangeCallbacks[swiperPath].length; i++) {
          if (slideChangeCallbacks[swiperPath][i].id === id){
            // Already registered, replace callback
            slideChangeCallbacks[swiperPath][i].callback = slideChangeCallback;
            return;
          }
        }
      }
      slideChangeCallbacks[swiperPath].push({
        callback: slideChangeCallback,
        id: id});
    }
  };
}
SwiperService['$inject'] = ['$q', 'UserSessionService'];
angular.module('em.services').factory('SwiperService', SwiperService);

/*global angular, Swiper */
'use strict';

// iDangero.us Swiper Service       
// http://www.idangero.us/sliders/swiper/api.php
function SwiperService($rootScope, LocationService, TasksSlidesService, OwnerService, AuthenticationService) {

  // Holds reference to all the swipers and their respective paths
  var swipers = {};

  var slideChangeCallbacks = [];

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

  var getSwiperParameters = function(swiperType, swiperSlidesPaths, onSlideChangeEndCallback) {
    var swiperParams = {
      noSwiping: true,
      queueStartCallbacks: true,
      queueEndCallbacks: true,
      simulateTouch: true,
      onSlideChangeEnd: onSlideChangeEndCallback
    };
    
    if (swiperType === 'main'){
      swiperParams.mode = 'horizontal';
      var mainSlideIndex = getSlideIndexBySlidePath(initialMainSlidePath, swiperSlidesPaths);

      if (mainSlideIndex !== undefined){
        swiperParams.initialSlide = mainSlideIndex;
      }else {
        swiperParams.initialSlide = 1;
      }
    } else if (swiperType === 'page'){
      swiperParams.mode = 'vertical';
      var pageSlideIndex = getSlideIndexBySlidePath(initialPageSlidePath, swiperSlidesPaths);
      if (pageSlideIndex !== undefined){
        swiperParams.initialSlide = pageSlideIndex;
      }else {
        swiperParams.initialSlide = 0;
      }
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
  }

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
        slidesPaths: swiperSlidesPaths
      };
      setPathsToSlides(swipers[swiperPath], swiperSlidesPaths);
    },
    onSlideChangeEnd: function(scope, swiperPath) {
      var activeSlide = swipers[swiperPath].swiper.getSlide(swipers[swiperPath].swiper.activeIndex);
      var path = OwnerService.getPrefix() + '/' + activeSlide.getData('path');
      // Use global html5Mode declaration to check how to handle route changes
      if ((typeof html5Mode === 'undefined') || (html5Mode)){
        if (history.pushState) {
          // Modern browser
          history.pushState(null, '', path);
          executeSlideChangeCallbacks(swiperPath, path);
        } else{
          // Legacy browser
          LocationService.skipReload().path(path);
          scope.$apply();
        }
      }else{
        // Phonegap
        executeSlideChangeCallbacks(swiperPath, path);
      }
    },
    setInitialSlidePath: function(mainSlide, pageSlide) {
      initialMainSlidePath = mainSlide;
      initialPageSlidePath = pageSlide;
    },
    swipeTo: function(slidePath) {
      var swiperInfos = getSwiperInfosBySlidePath(slidePath);

      // First, swipe in the main swiper to the right index 
      if (swiperInfos.main){
        var mainSwiperIndex = getSlideIndexBySlidePath(slidePath, swiperInfos.main.slidesPaths);
        if (mainSwiperIndex !== undefined){
          swiperInfos.main.swiper.swipeTo(mainSwiperIndex);
        }
      }

      // Second, swipe (vertically) with the page swiper
      if (swiperInfos.page) {
        var pageSwiperIndex = swiperInfos.page.slidesPaths.indexOf(slidePath);
        if (pageSwiperIndex !== undefined){
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
            // Already registered
            return;
          }
        }
      }
      slideChangeCallbacks[swiperPath].push({
        callback: slideChangeCallback,
        id: id
      });
    }
  };
}
angular.module('em.services').factory('SwiperService', SwiperService);
SwiperService.$inject = ['$rootScope', 'LocationService', 'TasksSlidesService', 'OwnerService', 'AuthenticationService'];

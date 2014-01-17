/*global angular, Swiper */
'use strict';

// iDangero.us Swiper Service       
// http://www.idangero.us/sliders/swiper/api.php
function SwiperService($rootScope, LocationService, TasksSlidesService, OwnerService) {

  // Holds reference to all the swipers and their respective paths
  var swipers = {};

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
      LocationService.skipReload().path(OwnerService.getPrefix() + '/' + activeSlide.getData('path'));
      scope.$apply();
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
        for (var i = 0; i < swipers[swiperPath].swiper.slides.length; i++) {
          if (swipers[swiperPath].swiper.slides[i].isActive()){
            return swipers[swiperPath].swiper.slides[i].getData('path');
          }
        }    
      }
    }
  };
}
angular.module('em.services').factory('SwiperService', SwiperService);
SwiperService.$inject = ['$rootScope', 'LocationService', 'TasksSlidesService', 'OwnerService'];

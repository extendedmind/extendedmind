'use strict';

function FooterController($scope, SwiperService) {

  var slides = {
    notes: {
      leftSlide: 'home',
      leftHeading: 'recent',
      center: 'keywords',
      right: 'details'
    },
    tasks: {
      leftSlide: 'home',
      leftHeading: 'timeline',
      center: 'contexts',
      right: 'details'
    },
    dashboard: {
      leftSlide: 'daily',
      leftHeading: 'daily',
      center: 'weekly',
      right: 'monthly'
    },
    archive: {
      leftSlide: 'completed',
      leftHeading: 'completed',
      center: 'lists',
      right: 'details'
    },
    list: {
      leftSlide: 'tasks',
      leftHeading: 'tasks',
      right: 'notes'
    }
  };

  // Register a callback to swiper service
  SwiperService.registerSlideChangeCallback(slideChangeCallback, 'tasks', 'FooterController');
  SwiperService.registerSlideChangeCallback(slideChangeCallback, 'notes', 'FooterController');
  SwiperService.registerSlideChangeCallback(slideChangeCallback, 'dashboard', 'FooterController');
  SwiperService.registerSlideChangeCallback(slideChangeCallback, 'archive', 'FooterController');
  SwiperService.registerSlideChangeCallback(slideChangeCallback, 'list', 'FooterController');

  function slideChangeCallback(/*activeSlidePath*/) {
    // Run digest to change only navbar when swiping to new location
    $scope.$digest();
  }

  function getSlideInfoByPosition(position) {
    var feature = $scope.getActiveFeature();
    if (feature && slides[feature]) {
      return slides[feature][position];
    }
  }

  function gotoSlide(position) {
    var feature = $scope.getActiveFeature();
    if (feature && slides[feature]) {
      var slidePath = feature + '/' + slides[feature][position];
      SwiperService.swipeTo(slidePath);
    }
  }

  $scope.gotoLeftSlide = function gotoLeftSlide() {
    gotoSlide('leftSlide');
  };

  $scope.gotoCenterSlide = function gotoCenterSlide() {
    gotoSlide('center');
  };

  $scope.gotoRightSlide = function gotoRightSlide() {
    gotoSlide('right');
  };

  $scope.getLeftSlideName = function getLeftSlideName() {
    return getSlideInfoByPosition('leftSlide');
  };

  $scope.getLeftSlideHeading = function getLeftSlideHeading() {
    return getSlideInfoByPosition('leftHeading');
  };

  $scope.getCenterSlideName = function getLeftSlideName() {
    return getSlideInfoByPosition('center');
  };

  $scope.getCenterSlideHeading = function getLeftSlideHeading() {
    return getSlideInfoByPosition('center');
  };

  $scope.getRightSlideName = function getLeftSlideName() {
    return getSlideInfoByPosition('right');
  };

  $scope.getRightSlideHeading = function getLeftSlideHeading() {
    return getSlideInfoByPosition('right');
  };
}

FooterController.$inject = ['$scope', 'SwiperService'];
angular.module('em.app').controller('FooterController', FooterController);

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

 function FooterController($scope, $timeout, SwiperService, UISessionService) {

  var slides = {
    notes: {
      leftSlide: 'home',
      leftHeading: 'recent',
      right: 'keywords'
    },
    tasks: {
      leftSlide: 'home',
      leftHeading: 'timeline',
      right: 'contexts'
    },
    archive: {
      leftSlide: 'completed',
      leftHeading: 'completed',
      right: 'lists'
    },
    list: {
      leftSlide: 'tasks',
      leftHeading: 'tasks',
      center: 'notes',
      right: 'properties'
    }
  };

  // Register a callback to swiper service
  SwiperService.registerSlideChangeCallback(slideChangeCallback, 'tasks', 'FooterController');
  SwiperService.registerSlideChangeCallback(slideChangeCallback, 'notes', 'FooterController');
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

  var toasterNotificationTimer, toasterNotificationVisibleInMilliseconds = 3000;

  $scope.hasVisibleToasterNotification = function hasVisibleToasterNotification() {
    if (!$scope.toasterNotification) {
      $scope.toasterNotification = UISessionService.getToasterNotification();
      if ($scope.toasterNotification) {
        $scope.toasterNotification.displayed = true;

        toasterNotificationTimer = $timeout(function() {
          $scope.toasterNotification = undefined;
        }, toasterNotificationVisibleInMilliseconds);

        return true;
      }
    } else {
      return true;
    }
  };

  $scope.hideToasterNotification = function hideToasterNotification() {
    if (angular.isDefined(toasterNotificationTimer)) {
      $timeout.cancel(toasterNotificationTimer);
      $scope.toasterNotification = undefined;
    }
  };

  $scope.pauseToasterTimer = function pauseToasterTimer() {
    if (angular.isDefined(toasterNotificationTimer)) {
      $timeout.cancel(toasterNotificationTimer);
    }
  };

  $scope.resumeToasterTimer = function resumeToasterTimer() {
    toasterNotificationTimer = $timeout(function() {
      $scope.toasterNotification = undefined;
    }, toasterNotificationVisibleInMilliseconds);
  };

  $scope.gotoToasterLocationAndCall = function gotoToasterLocationAndCall(feature, closeToaster) {
    UISessionService.changeFeature(feature);
    closeToaster();
  };

  $scope.gotoLeftSlide = function gotoLeftSlide() {
    gotoSlide('leftSlide');
  };

  $scope.gotoCenterSlide = function gotoCenterSlide() {
    gotoSlide('center');
  };

  $scope.gotoRightSlide = function gotoRightSlide() {
    gotoSlide('right');
  };

  $scope.hasCenterSlide = function hasCenterSlide() {
    var feature = $scope.getActiveFeature();
    if (feature && slides[feature] && slides[feature].center) {
      return true;
    }
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

FooterController['$inject'] = ['$scope', '$timeout', 'SwiperService', 'UISessionService'];
angular.module('em.app').controller('FooterController', FooterController);

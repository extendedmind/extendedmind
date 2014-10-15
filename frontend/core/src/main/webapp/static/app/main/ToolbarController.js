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

 function ToolbarController($scope, $rootScope, UISessionService) {

  function calculateHeadingWidth() {
    if ($rootScope.currentWidth >= 568) {
      // Maximum width for column
      return 306;
    } else {
      // Smaller, calculate as percentage
      return $rootScope.currentWidth * 0.54;
    }
  }

  function calculateMaximumHeadingLength() {
    var headingWidth = calculateHeadingWidth();
    if (headingWidth > 250) {
      return headingWidth * 0.25;
    } else if (headingWidth > 200) {
      return headingWidth * 0.2;
    } else {
      return headingWidth * 0.1744;
    }
  }

  var featureChangedCallback = function featureChangedCallback(name, data/*, state*/) {
    if (name === 'list') {
      if (data) {
        var maximumHeadingLength = calculateMaximumHeadingLength();
        if (data.title.length > maximumHeadingLength) {
          $scope.overrideHeading = data.title.substring(0, maximumHeadingLength-2) + '&#8230;';
        } else {
          $scope.overrideHeading = data.title;
        }
      }
    } else {
      $scope.overrideHeading = undefined;
    }
  };
  UISessionService.registerFeatureChangedCallback(featureChangedCallback, 'ToolbarController');

  $scope.getCurrentHeading = function getCurrentHeading() {
    var currentHeading;
    if ($scope.overrideHeading) {
      currentHeading = $scope.overrideHeading;
    } else {
      currentHeading = $scope.getActiveFeature();
    }
    if (!$scope.online) {
      currentHeading += '*';
    }
    return currentHeading;
  };

  $scope.getHeadingClass = function getHeadingClass() {
    if ($scope.overrideHeading) {
      var maximumHeadingLength = calculateMaximumHeadingLength();
      if ($scope.overrideHeading.length > (maximumHeadingLength*0.3) && $scope.overrideHeading.length <= (maximumHeadingLength*0.5)) {
        return 'medium-heading';
      } else if ($scope.overrideHeading.length > (maximumHeadingLength*0.5)) {
        return 'long-heading';
      }
    }
  };

  $scope.switchFeature = function switchFeature() {
    if (!$scope.onboardingInProgress) {
      var activeFeature = $scope.getActiveFeature();
      if (activeFeature === 'inbox') {
        UISessionService.changeFeature('tasks');
      } else if (activeFeature === 'tasks') {
        UISessionService.changeFeature('notes');
      } else if (activeFeature === 'notes') {
        UISessionService.changeFeature('lists');
      } else if (activeFeature === 'lists') {
        UISessionService.changeFeature('archive');
      } else if (activeFeature === 'archive') {
        UISessionService.changeFeature('inbox');
      } else if (activeFeature === 'list') {
        var newIndex = $scope.lists.indexOf(UISessionService.getFeatureData('list')) + 1;
        if (newIndex === $scope.lists.length) {
          UISessionService.changeFeature('list', $scope.lists[0]);
        } else {
          UISessionService.changeFeature('list', $scope.lists[newIndex]);
        }
      }
    }
  };
}
ToolbarController['$inject'] = ['$scope', '$rootScope', 'UISessionService'];
angular.module('em.main').controller('ToolbarController', ToolbarController);

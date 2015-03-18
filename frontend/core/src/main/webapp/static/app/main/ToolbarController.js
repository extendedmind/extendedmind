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

 function ToolbarController($scope, $rootScope, DrawerService, UISessionService) {

  function refreshHeadingWidth() {
    // Heading width is calculated with ng-style and updates on $digest() so toggling menu may be unnoticed
    // for a while and the width will be wrong.
    if (!$rootScope.$$phase && !$scope.$$phase) {
      // Digest changes.
      $scope.$digest();
    }
  }

  $scope.registerMenuOpenedCallbacks(refreshHeadingWidth, 'ToolbarController');

  $scope.registerMenuClosedCallbacks(refreshHeadingWidth, 'ToolbarController');

  $scope.calculateHeadingWidth = function() {
    var menuWidth = 0;
    if ($rootScope.columns > 1 && DrawerService.isOpen('left')) {
      menuWidth = DrawerService.getDrawerElement('left').offsetWidth;
    }

    var columnWidth = $rootScope.currentWidth - menuWidth;

    if (columnWidth >= $rootScope.CONTAINER_MASTER_MAX_WIDTH) {
      // Maximum width for column
      return $rootScope.TOOLBAR_HEADING_MAX_WIDTH;
    } else {
      // Smaller, leave
      return columnWidth - $rootScope.TOOLBAR_BUTTON_WIDTH*2;
    }
  };

  /*
  * Show feature name, list title or onboarding phase in heading.
  */
  $scope.getCurrentHeading = function getCurrentHeading() {
    if ($scope.onboardingInProgress) {
      return $scope.getTutorialPhase();
    } else {
      var currentHeading = $scope.getActiveFeature();
      if (currentHeading === 'list'){
        // Get list's title from trans object stored into feature data.
        currentHeading = UISessionService.getFeatureData(currentHeading).trans.title;
      }else if (currentHeading === 'user'){
        currentHeading = $scope.getActiveDisplayName();
      }
      if (!$scope.online && !currentHeading.startsWith('*')) {
        currentHeading = '*' + currentHeading;
      }
      return currentHeading;
    }
  };

  $scope.isToolbarMenuHidden = function() {
    return $scope.onboardingInProgress;
  };

  function switchFeature() {
    var activeFeature = $scope.getActiveFeature();
    if (activeFeature === 'focus') {
      $scope.changeFeature('inbox', undefined, true);
    } else {
      $scope.changeFeature('focus', undefined, true);
    }
  }

  $scope.clickToolbarHeading = function(){
    var activeFeature = $scope.getActiveFeature();
    if (activeFeature === 'list'){
      $scope.openEditor('list', UISessionService.getFeatureData(activeFeature));
    }else{
      switchFeature();
    }
  };
}
ToolbarController['$inject'] = ['$scope', '$rootScope', 'DrawerService', 'UISessionService'];
angular.module('em.main').controller('ToolbarController', ToolbarController);

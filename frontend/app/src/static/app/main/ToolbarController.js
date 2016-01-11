/* Copyright 2013-2016 Extended Mind Technologies Oy
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
      menuWidth = $rootScope.MENU_WIDTH;
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
    if ($scope.isTutorialInProgress()) {
      return 'tutorial ' + $scope.getTutorialPhase() + '/' + $scope.getTutorialLength();
    } else {
      var currentHeading = $scope.getActiveFeature();
      if (currentHeading === 'list' || currentHeading === 'listInverse'){
        // Get list's title from trans object stored into feature data.
        var listData = UISessionService.getFeatureData(currentHeading);
        if (listData.list){
          currentHeading = listData.list.trans.title;
        }else{
          currentHeading = listData.trans.title;
        }
      }else if (currentHeading === 'user'){
        currentHeading = $scope.getActiveDisplayName();
      }
      return currentHeading;
    }
  };

  function switchFeature() {
    var activeFeature = $scope.getActiveFeature();
    if (activeFeature === 'focus') {
      if ($scope.features.inbox.getStatus() !== 'disabled'){
        $scope.changeFeature('inbox', undefined, true);
      }
    } else {
      $scope.changeFeature('focus', undefined, true);
    }
  }

  $scope.clickToolbarHeading = function(){
    var activeFeature = $scope.getActiveFeature();
    if (activeFeature === 'list' || activeFeature === 'listInverse'){
      $scope.openEditor('list', UISessionService.getFeatureData(activeFeature)).then(function(){
        if ($scope.isOnboarding('list')){
          $scope.completeOnboarding('list');
        }
      });
    }else{
      switchFeature();
    }
  };

  $scope.isListOnboarding = function(){
    return $scope.getActiveFeature() === 'list' && $scope.isOnboarding('list');
  };
}
ToolbarController['$inject'] = ['$scope', '$rootScope', 'DrawerService', 'UISessionService'];
angular.module('em.main').controller('ToolbarController', ToolbarController);

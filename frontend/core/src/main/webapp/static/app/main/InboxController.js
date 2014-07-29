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

 function InboxController($scope) {
  var openFirstElementCallback;
  $scope.registerOpenFirstElementCallback = function registerOpenFirstElementCallback(callback) {
    openFirstElementCallback = callback;
  };

  $scope.accordionClosed = function accordionClosed() {
    $scope.sortingItem = undefined;
    if ($scope.resetInboxEdit) $scope.resetInboxEdit();
  };

  $scope.itemRemoved = function itemRemoved(item) {
    if (item !== undefined && $scope.sortingItem === item) {
      // Continue sorting
      $scope.sortInbox();
    }
  };

  $scope.sortInbox = function sortInbox() {
    if (openFirstElementCallback) {
      $scope.sortingItem = openFirstElementCallback($scope.sortingItem);
      if ($scope.getOnboardingPhase() === 'itemAdded' || $scope.getOnboardingPhase() === 'secondItemAdded') {
        $scope.setOnboardingPhase('sortingStarted');
      }
    }
  };

  $scope.isInboxSorting = function isInboxSorting(item) {
    if ($scope.sortingItem === item) return true;
  };

  $scope.getSortingText = function getSortingText() {
    if ($scope.sortingItem) return 'done sorting';
    else return 'sort inbox';
  };

}

InboxController['$inject'] = ['$scope'];
angular.module('em.app').controller('InboxController', InboxController);

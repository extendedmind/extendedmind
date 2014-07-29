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

 function MenuController($location, $scope, AnalyticsService, AuthenticationService, ListsService, UISessionService, UserSessionService) {

  $scope.isAdmin = function isAdmin() {
    return UserSessionService.getUserType() === 0;
  };

  $scope.getActiveOwnerName = function getActiveOwnerName() {
    var activeUUID = UISessionService.getActiveUUID();
    var ownerName;
    if (activeUUID === UserSessionService.getUserUUID()) {
      ownerName = UserSessionService.getEmail();
    } else {
      angular.forEach($scope.collectives, function(collective, uuid) {
        if (activeUUID === uuid) {
          ownerName = collective[0];
        }
      });
    }
    var maximumOwnerNameLength = 20;
    if (ownerName.length > maximumOwnerNameLength) {
      return ownerName.substring(0, maximumOwnerNameLength) + '...';
    }
    return ownerName;
  };

  $scope.getFeatureClass = function getFeatureClass(feature) {
    if (UISessionService.getCurrentFeatureName() === feature) {
      return 'active';
    }
  };

  $scope.gotoFeature = function gotoFeature(feature) {
    if (UISessionService.getCurrentFeatureName() !== feature) {
      var state = UISessionService.getFeatureState(feature);
      if (!state && feature === 'notes') {
        state = 'notes/home';
      }
      UISessionService.changeFeature(feature, undefined, state);
      AnalyticsService.visit(feature);
    }
    $scope.toggleMenu();
  };

  // LISTS

  $scope.lists = ListsService.getLists(UISessionService.getActiveUUID());

  $scope.$watch('lists.length', function(/*newValue, oldValue*/) {
    if ($scope.refreshScroller) $scope.refreshScroller();
  });

  $scope.getListClass = function getListClass(list) {
    if (UISessionService.getCurrentFeatureName() === 'list' && UISessionService.getFeatureData('list') === list) {
      return 'active';
    }
  };

  $scope.gotoList = function gotoList(list) {
    if (UISessionService.getCurrentFeatureName() !== 'list' || UISessionService.getFeatureState('list') !== list) {
      UISessionService.changeFeature('list', list);
      AnalyticsService.visit('list');
    }
    $scope.toggleMenu();
  };

  $scope.toggleLists = function toggleLists() {
    var state = UISessionService.getUIState();
    UISessionService.setUIStateParameter('listsVisible',
      !state['listsVisible']);
    if ($scope.refreshScroller) $scope.refreshScroller();
  };

  $scope.isListsVisible = function isListsVisible() {
    var state = UISessionService.getUIState();
    if (state) {
      return state.listsVisible;
    } else {
      // Default to true
      UISessionService.setUIStateParameter('listsVisible', true);
      return true;
    }
  };

  $scope.getListTitleText = function getListTitleText(list) {
    var maximumListNameLength = 35;
    if (list.title.length > maximumListNameLength) {
      return list.title.substring(0, maximumListNameLength-2) + '...';
    }
    return list.title;
  };
}

MenuController['$inject'] = ['$location', '$scope', 'AnalyticsService', 'AuthenticationService', 'ListsService', 'UISessionService', 'UserSessionService'];
angular.module('em.app').controller('MenuController', MenuController);

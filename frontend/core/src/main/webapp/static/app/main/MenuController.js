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

 function MenuController($location, $rootScope, $scope, AnalyticsService, AuthenticationService, ListsService, UISessionService, UserSessionService) {

  $scope.isAdmin = function isAdmin() {
    return UserSessionService.getUserType() === 0;
  };

  $scope.getActiveOwnerName = function getActiveOwnerName() {
    var activeUUID = UISessionService.getActiveUUID();
    if (activeUUID){
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
        return ownerName.substring(0, maximumOwnerNameLength) + '&#8230;';
      }
      return ownerName;
    }
  };

  $scope.getFeatureClass = function getFeatureClass(feature) {
    if (UISessionService.getCurrentFeatureName() === feature) {
      return 'active';
    }
  };

  $scope.gotoFeature = function gotoFeature(feature, data) {
    $scope.changeFeature(feature,data);
    if ($rootScope.columns === 1) $scope.toggleMenu();
  };

  // LISTS

  $scope.lists = ListsService.getLists(UISessionService.getActiveUUID());

  $scope.getListClass = function getListClass(list) {
    if (UISessionService.getCurrentFeatureName() === 'list' && UISessionService.getFeatureData('list') === list) {
      return 'active';
    }
  };

  $scope.toggleLists = function toggleLists() {
    var state = UISessionService.getUIState();
    UISessionService.setUIStateParameter('listsVisible',
      !state['listsVisible']);
  };

  $scope.getListTitleText = function getListTitleText(list) {
    var maximumListNameLength = 35;
    if (list.title.length > maximumListNameLength) {
      return list.title.substring(0, maximumListNameLength-2) + '&#8230;';
    }
    return list.title;
  };
}

MenuController['$inject'] = ['$location', '$rootScope', '$scope', 'AnalyticsService', 'AuthenticationService', 'ListsService', 'UISessionService', 'UserSessionService'];
angular.module('em.main').controller('MenuController', MenuController);

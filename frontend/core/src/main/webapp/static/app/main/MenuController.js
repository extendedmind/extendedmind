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

 function MenuController($rootScope, $scope, ListsService, UISessionService) {

  $scope.gotoFeature = function (feature, data) {
    $scope.changeFeature(feature,data);
    if ($rootScope.columns === 1) $scope.closeMenu();
  };

  // LISTS

  $scope.lists = ListsService.getLists(UISessionService.getActiveUUID());

  $scope.getActiveList = function() {
    if ($scope.isFeatureActive('list')){
      return UISessionService.getFeatureData(UISessionService.getCurrentFeatureName());
    }
  };
}

MenuController['$inject'] = ['$rootScope', '$scope', 'AnalyticsService', 'ListsService', 'UISessionService'];
angular.module('em.main').controller('MenuController', MenuController);

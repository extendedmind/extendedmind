/* Copyright 2013-2017 Extended Mind Technologies Oy
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
    if (feature === 'list' && data.trans.owner !== UISessionService.getActiveUUID()){
      $scope.changeFeature(feature, {list: data, owner: data.trans.owner});
    }else{
      $scope.changeFeature(feature, data);
    }
    if ($rootScope.columns === 1) $scope.closeMenu();
  };

  // LISTS

  $scope.lists = ListsService.getLists(UISessionService.getActiveUUID());

  $scope.getActiveList = function() {
    if ($scope.isFeatureActive('list') || $scope.isFeatureActive('listInverse')){
      //return UISessionService.getFeatureData(UISessionService.getCurrentFeatureName());
      var listData = UISessionService.getFeatureData(UISessionService.getCurrentFeatureName());
      if (listData.list)
        return listData.list;
      else
        return listData;
    }
  };

  // MENU ITEM VISIBILITY AND CLASSES

  $scope.isMenuItemVisible = function(feature, subfeature){
    return ($scope.features[feature].getStatus(subfeature) !== 'disabled') ||
           ($scope.getOnboardingPhase('settings') === 2);
  };

  $scope.getMenuItemClasses = function(feature, subfeature) {
    // When feature is active, it should be highlighted by default
    var menuClasses;
    if ($scope.isFeatureActive(feature)){
      menuClasses = {highlighted: true};
    }else if (feature === 'settings' || feature === 'trash'){
      // Special case settings and trash, which are downplayed if not hightlighted
      menuClasses = {'downplayed': true};
    }else{
      menuClasses = {};
    }

    // Handle menu onboarding
    var settingsOnboardingPhase = $scope.getOnboardingPhase('settings');
    if (settingsOnboardingPhase >= 1){
      if (settingsOnboardingPhase === 1){
        // Menu onboarding happening, nothing should be highlighted
        menuClasses['highlighted'] = false;
        // Also don't downplay on the first step to make menu blur consistent
        menuClasses['downplayed'] = false;
      }else if (settingsOnboardingPhase > 1){
        // After the first prompt, everything should be potentially visible in the menu
        menuClasses['menu-item-visible-under-modal'] = true;
      }
      // Pulse settings when it is highlighted
      if (feature === 'settings' && settingsOnboardingPhase === 3){
        menuClasses['onboarding-force'] = true;
      }
    }else if ($scope.isOnboarding(feature, subfeature)){
      menuClasses['onboarding'] = true;
    }

    return menuClasses;
  };

  // KEYBOARD SHORTCUTS

  if (angular.isFunction($scope.registerKeyboardShortcutCallback)){
    $scope.registerKeyboardShortcutCallback(function(){
      if (!$scope.isEditorVisible()){
        var activeFeature = $scope.getActiveFeature();

        switch (activeFeature){
        case 'user':
          return $scope.changeFeature('focus', undefined, true);
        // NOTE: break; missing here on purpose: makes it possible to just continue on if features are missing
        case 'focus':
          if ($scope.features.inbox.getStatus() !== 'disabled'){
            return $scope.changeFeature('inbox', undefined, true);
          }
        case 'inbox':
          if ($scope.features.tasks.getStatus('all') !== 'disabled'){
            return $scope.changeFeature('tasks', undefined, true);
          }
        case 'tasks':
          if ($scope.features.notes.getStatus() !== 'disabled'){
            return $scope.changeFeature('notes', undefined, true);
          }
        case 'notes':
          if ($scope.features.lists.getStatus('active') !== 'disabled'){
            return $scope.changeFeature('lists', undefined, true);
          }
        case 'lists':
          return $scope.changeFeature('trash', undefined, true);
        case 'list':
          return $scope.changeFeature('trash', undefined, true);
        case 'listInverse':
          return $scope.changeFeature('trash', undefined, true);
        case 'trash':
          return $scope.changeFeature('settings', undefined, true);
        case 'settings':
          return $scope.changeFeature('user', undefined, true);
        }
      }
    }, 'shift-down', 'MenuControllerDown');
    $scope.registerKeyboardShortcutCallback(function(){
      if (!$scope.isEditorVisible()){
        var activeFeature = $scope.getActiveFeature();

        switch (activeFeature){
        case 'settings':
          return $scope.changeFeature('trash', undefined, true);
        // NOTE: Again without break; to just continue up
        case 'trash':
          if ($scope.features.lists.getStatus('active') !== 'disabled'){
            return $scope.changeFeature('lists', undefined, true);
          }
        case 'list':
          if ($scope.features.lists.getStatus('active') !== 'disabled'){
            return $scope.changeFeature('lists', undefined, true);
          }
        case 'listInverse':
          if ($scope.features.lists.getStatus('active') !== 'disabled'){
            return $scope.changeFeature('lists', undefined, true);
          }
        case 'lists':
          if ($scope.features.notes.getStatus() !== 'disabled'){
            return $scope.changeFeature('notes', undefined, true);
          }
        case 'notes':
          if ($scope.features.tasks.getStatus('all') !== 'disabled'){
            return $scope.changeFeature('tasks', undefined, true);
          }
        case 'tasks':
          if ($scope.features.inbox.getStatus() !== 'disabled'){
            return $scope.changeFeature('inbox', undefined, true);
          }
        case 'inbox':
          return $scope.changeFeature('focus', undefined, true);
        case 'focus':
          return $scope.changeFeature('user', undefined, true);
        case 'user':
          return $scope.changeFeature('settings', undefined, true);
        }
      }
    }, 'shift-up', 'MenuControllerUp');
  }
}

MenuController['$inject'] = ['$rootScope', '$scope', 'ListsService', 'UISessionService'];
angular.module('em.main').controller('MenuController', MenuController);

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

 function SettingsController($scope, AnalyticsService, UserService, UserSessionService, packaging, version) {

  // VERSION
  $scope.extendedMindVersion = version;
  AnalyticsService.visit('settings');

  // GENERAL
  initializeSettings();
  function initializeSettings(){
    $scope.settings = {
      hideFooter: UserSessionService.getUIPreference('hideFooter'),
      disableVibration: UserSessionService.getUIPreference('disableVibration')
    };
  }

  $scope.settingsCheckboxClicked = function(preference) {
    if ($scope.settings[preference] !== undefined){
      UserSessionService.setUIPreference(preference, $scope.settings[preference]);
      UserService.saveAccountPreferences();
    }
  };

  // FEATURES

  // THIS DEVICE
  // agenda

  if (packaging.endsWith('cordova')) {
    if (!window.plugins || !window.plugins.calendar) {
      document.addEventListener('deviceready', function() {
        $scope.agendaCalendarSettingVisible = window.plugins && window.plugins.calendar;
      });
    } else {
      $scope.agendaCalendarSettingVisible = true;
    }
  }

}

SettingsController['$inject'] = ['$scope',
'AnalyticsService', 'UserService', 'UserSessionService',
'packaging', 'version'];
angular.module('em.main').controller('SettingsController', SettingsController);

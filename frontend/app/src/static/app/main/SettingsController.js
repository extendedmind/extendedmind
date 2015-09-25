/* Copyright 2013-2015 Extended Mind Technologies Oy
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

 function SettingsController($timeout, $scope, AnalyticsService, ListsService, ReminderService, SwiperService,
                             UISessionService, UserService, UserSessionService, packaging, version) {

  // VERSION
  $scope.extendedMindVersion = version;
  AnalyticsService.visit('settings');

  initializeSettings();
  function initializeSettings(){
    $scope.settings = {
      hideFooter: UserSessionService.getUIPreference('hideFooter'),
      disableVibration: UserSessionService.getUIPreference('disableVibration'),
      hour12: UserSessionService.getUIPreference('hour12'),
      sundayWeek: UserSessionService.getUIPreference('sundayWeek')
    };

    var keepRunningPreferences = UserSessionService.getUIPreference('keepRunning');
    if (keepRunningPreferences){
      $scope.settings.keepRunning = keepRunningPreferences[UISessionService.getDeviceId()];
    }

    if ($scope.features.notes.getStatus() !== 'disabled'){
      $scope.settings.notes = true;
    }
    if ($scope.features.inbox.getStatus() !== 'disabled'){
      $scope.settings.inbox = true;
    }
    if ($scope.features.lists.getStatus('active') !== 'disabled'){
      $scope.settings.lists = true;
    }
    if ($scope.features.lists.getStatus('archived') !== 'disabled'){
      $scope.settings.archive = true;
    }
    if ($scope.features.tasks.getStatus('contexts') !== 'disabled'){
      $scope.settings.contexts = true;
    }
  }

  $scope.settingsCheckboxClicked = function(preference) {
    if ($scope.settings[preference] !== undefined){

      if (preference === 'keepRunning'){
        if ($scope.settings[preference] === true){
          // Create/update persistent notification
          ReminderService.setPersistentReminderForThisDevice();
        }else{
          // Clear persistent notification
          ReminderService.removePersistentReminderForThisDevice();
        }

        var keepRunningPreferences = UserSessionService.getUIPreference('keepRunning');
        if (!keepRunningPreferences) keepRunningPreferences = {};
        keepRunningPreferences[UISessionService.getDeviceId()] = $scope.settings[preference];
        UserSessionService.setUIPreference('keepRunning', keepRunningPreferences);
      }else{
        UserSessionService.setUIPreference(preference, $scope.settings[preference]);
      }
      UserService.saveAccountPreferences();
    }
  };

  // FEATURES

  function deactivateFeature(featurePreferences, subfeature, fallbackSubfeature){
    if (angular.isString(featurePreferences)){
      if (!featurePreferences.endsWith(':d')){
        if (subfeature && fallbackSubfeature){
          // The overarching value needs to changed into an object
          // where the fallback gets the parent value
          var newPreferences = {};
          newPreferences[fallbackSubfeature] = featurePreferences;
          newPreferences[subfeature] = featurePreferences + ':d';
          return newPreferences;
        }
        return featurePreferences + ':d';
      }else {
        return featurePreferences;
      }
    }else if (angular.isObject(featurePreferences) && subfeature){
      featurePreferences[subfeature] = deactivateFeature(featurePreferences[subfeature]);
      return featurePreferences;
    }
    return 0;
  }

  $scope.isToggleDisabled = function(feature, overrideEnabled){
    var enabled = overrideEnabled !== undefined ? overrideEnabled : $scope.settings[feature];
    var listsPrefs;
    if (feature === 'lists'){
      if (enabled){
        listsPrefs = UserSessionService.getFeaturePreferences('lists');
        if (angular.isString(listsPrefs) ||
            (angular.isObject(listsPrefs) && listsPrefs.archived &&
            (angular.isNumber(listsPrefs.archived) ||
            (angular.isString(listsPrefs.archived) && !listsPrefs.archived.endsWith(':d'))))){
          return true;
        }
      }
    }else if (feature === 'archive'){
      if (!enabled){
        listsPrefs = UserSessionService.getFeaturePreferences('lists');
        if (!listsPrefs || (angular.isObject(listsPrefs) &&
            (!listsPrefs.active || (listsPrefs.active &&
            (angular.isString(listsPrefs.active) && listsPrefs.active.endsWith(':d')))))){
          return true;
        }
      }
    }
  };

  $scope.featureCheckboxClicked = function(feature) {
    if ($scope.settings[feature] !== undefined){
      var enable = $scope.settings[feature];
      var listsPrefs;
      if (feature === 'notes'){
        var focusPrefs = UserSessionService.getFeaturePreferences('focus');
        var notesPrefs = UserSessionService.getFeaturePreferences('notes');
        if (enable){
          notesPrefs = $scope.activateFeatureOnboarding(notesPrefs);
          focusPrefs = $scope.activateFeatureOnboarding(focusPrefs, 'notes');
          if (notesPrefs === 1)
            AnalyticsService.do('notesOnboarding');
          else
            AnalyticsService.do('enableNotes');
        }else {
          notesPrefs = deactivateFeature(notesPrefs);
          focusPrefs = deactivateFeature(focusPrefs, 'notes', 'tasks');
          AnalyticsService.do('disableNotes');
        }
        $scope.features.focus.resizeFix = true;
        $scope.features.list.resizeFix = true;
        UserSessionService.setFeaturePreferences('notes', notesPrefs);
        UserSessionService.setFeaturePreferences('focus', focusPrefs);
      }else if (feature === 'lists'){
        listsPrefs = UserSessionService.getFeaturePreferences('lists');
        var listPrefs = UserSessionService.getFeaturePreferences('list');
        if (enable) {
          listsPrefs = $scope.activateFeatureOnboarding(listsPrefs, 'active');
          listPrefs = $scope.activateFeatureOnboarding(listPrefs);
          if (angular.isObject(listsPrefs) && listsPrefs.active === 1)
            AnalyticsService.do('listsActiveOnboarding');
          else
            AnalyticsService.do('enableLists');
        }else {
          if ($scope.isToggleDisabled('lists', !enable)){
            // Can't disable lists if archive is enabled or currently onboarding
            $scope.settings[feature] = true;
            UISessionService.pushNotification({
              type: 'fyi',
              text: 'lists can not be disabled when archive is enabled'
            });
            return;
          }
          listsPrefs = deactivateFeature(listsPrefs, 'active');
          listPrefs = deactivateFeature(listPrefs);
          AnalyticsService.do('disableLists');
        }
        UserSessionService.setFeaturePreferences('lists', listsPrefs);
        UserSessionService.setFeaturePreferences('list', listPrefs);
      }else if (feature === 'inbox'){
        var inboxPrefs = UserSessionService.getFeaturePreferences('inbox');
        if (enable){
          inboxPrefs = $scope.activateFeatureOnboarding(inboxPrefs);
          if (inboxPrefs === 1)
            AnalyticsService.do('inboxOnboarding');
          else
            AnalyticsService.do('enableInbox');
        }else {
          inboxPrefs = deactivateFeature(inboxPrefs);
          AnalyticsService.do('disableInbox');
        }
        UserSessionService.setFeaturePreferences('inbox', inboxPrefs);
      }else if (feature === 'contexts'){
        var tasksPrefs = UserSessionService.getFeaturePreferences('tasks');
        if (enable){
          tasksPrefs = $scope.activateFeatureOnboarding(tasksPrefs, 'contexts');
          tasksPrefs = $scope.activateFeatureOnboarding(tasksPrefs, 'context');
          if (angular.isObject(tasksPrefs) && tasksPrefs.contexts === 1)
            AnalyticsService.do('tasksContextsOnboarding');
          else
            AnalyticsService.do('enableContexts');
        }else {
          tasksPrefs = deactivateFeature(tasksPrefs, 'contexts', 'all');
          tasksPrefs = deactivateFeature(tasksPrefs, 'context', 'all');
          AnalyticsService.do('disableContexts');
        }
        $scope.features.tasks.resizeFix = true;
        UserSessionService.setFeaturePreferences('tasks', tasksPrefs);
      }else if (feature === 'archive'){
        listsPrefs = UserSessionService.getFeaturePreferences('lists');
        if (enable){
          if ($scope.isToggleDisabled('archive', !enable)){
            // Can't enable archive if lists is enabled or currently onboarding
            $scope.settings[feature] = false;
            UISessionService.pushNotification({
              type: 'fyi',
              text: 'archive can not be enabled when lists is disabled'
            });
            return;
          }
          listsPrefs = $scope.activateFeatureOnboarding(listsPrefs, 'archived');
          if (angular.isObject(listsPrefs) && listsPrefs.archived === 1)
            AnalyticsService.do('listsArchivedOnboarding');
          else
            AnalyticsService.do('enableArchive');
        }else {
          listsPrefs = deactivateFeature(listsPrefs, 'archived', 'active');
          AnalyticsService.do('disableArchive');
        }
        $scope.features.lists.resizeFix = true;
        UserSessionService.setFeaturePreferences('lists', listsPrefs);
      }
      UserService.saveAccountPreferences();
    }
  };

  $scope.showArchiveFeature = function(){
    if (!UserSessionService.isFakeUser() && (UserSessionService.getUserType() < 2)){
      return true;
    }

    // Also show archive if the user has already archived lists
    if (ListsService.getArchivedLists(UISessionService.getActiveUUID()).length > 0){
      return true;
    }
  };

  $scope.getSettingsPadding = function(){
    if (isOnboarding('settings')){
      return initial;
    }
  };

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
    if (packaging === 'android-cordova') $scope.keepRunningVisible = true;
  }

}

SettingsController['$inject'] = ['$timeout', '$scope', 'AnalyticsService', 'ListsService',
'ReminderService', 'SwiperService', 'UISessionService', 'UserService', 'UserSessionService',
'packaging', 'version'];
angular.module('em.main').controller('SettingsController', SettingsController);

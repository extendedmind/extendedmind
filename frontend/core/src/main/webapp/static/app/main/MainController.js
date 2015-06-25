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

 /* global cordova */
 'use strict';

// Controller for all main slides
// Holds a reference to all the item arrays. There is no sense in limiting
// the arrays because everything is needed anyway to get home and inbox to work,
// which are part of every main slide collection.
function MainController($element, $controller, $filter, $q, $rootScope, $scope, $timeout, $window,
                        AnalyticsService, CalendarService, DrawerService, ItemsService, ReminderService,
                        SwiperService, TasksService, UISessionService, UserService, UserSessionService,
                        packaging) {


  // SHARED ACCESS

  $scope.collectives = UserSessionService.getCollectives();
  $scope.sharedLists = UserSessionService.getSharedLists();

  $scope.getCollectiveName = function(collectiveUUID){
    if ($scope.collectives && $scope.collectives[collectiveUUID]){
      return $scope.collectives[collectiveUUID][0];
    }
  };

  $scope.isPersonalData = function(){
    return UserSessionService.getUserUUID() === UISessionService.getActiveUUID();
  };

  $scope.isCollectiveReadOnly = function(ownerUUID) {
    if ($scope.collectives && $scope.collectives[ownerUUID]) {
      return $scope.collectives[ownerUUID][1] === 1;
    }
  };

  $scope.isSharedListReadOnly = function(ownerUUID, listUUID) {
    if ($scope.sharedLists && $scope.sharedLists[ownerUUID]) {
      var sharedListInfo = $scope.sharedLists[ownerUUID][1][listUUID];
      return sharedListInfo && sharedListInfo[1] === 1;
    }
  };

  $scope.usePremiumFeatures = function() {
    // For now, only admin and alfa users can see premium features
    return UserSessionService.getUserType() === 0 || UserSessionService.getUserType() === 1;
  };

  // MAP OF ALL FEATURES

  function getFeatureStatus(featurePreferences, subfeature){
    if (!featurePreferences){
      return 'disabled';
    }else{
      if (angular.isString(featurePreferences)){
        if (featurePreferences.endsWith(':d')){
          return 'disabled';
        }else{
          return 'active';
        }
      }else if (angular.isNumber(featurePreferences)){
        if (featurePreferences === 0){
          return 'disabled';
        }else{
          return 'onboarding_' + featurePreferences;
        }
      }else if (subfeature && angular.isObject(featurePreferences)){
        // recursively call return status for subfeature
        return getFeatureStatus(featurePreferences[subfeature]);
      }
    }
  }

  $scope.features = {
    user: {
      heading: undefined,
      getStatus: function(subfeature){
        return getFeatureStatus(UserSessionService.getFeaturePreferences('user'), subfeature);
      },
      slides: {
        left: {
          path: 'user/home',
          heading: 'home'
        },
        right: {
          path: 'user/details',
          heading: undefined
        }
      }
    },
    focus: {
      heading: 'focus',
      getStatus: function(subfeature){
        return getFeatureStatus(UserSessionService.getFeaturePreferences('focus'), subfeature);
      },
      additionalContentVisibleStatuses: ['onboarding_2', 'onboarding_6'],
      slides: {
        left: {
          path: 'focus/tasks',
          heading: 'tasks'
        },
        right: {
          path: 'focus/notes',
          heading: 'notes'
        }
      }
    },
    inbox: {
      heading: 'inbox',
      getStatus: function(subfeature){
        return getFeatureStatus(UserSessionService.getFeaturePreferences('inbox'), subfeature);
      },
      sortable: {
        heading: 'sort',
        action: openRecurringEditor,
        actionParam: 'item'
      }
    },
    tasks: {
      heading: 'tasks',
      getStatus: function(subfeature){
        return getFeatureStatus(UserSessionService.getFeaturePreferences('tasks'), subfeature);
      },
      slides: {
        left: {
          path: 'tasks/all',
          heading: 'all tasks'
        },
        middle: {
          path: 'tasks/contexts',
          heading: 'contexts'
        },
        right: {
          path: 'tasks/context',
          heading: 'no context'
        }
      }
    },
    notes: {
      heading: 'notes',
      getStatus: function(subfeature){
        return getFeatureStatus(UserSessionService.getFeaturePreferences('notes'), subfeature);
      }
    },
    lists: {
      heading: 'lists',
      getStatus: function(subfeature){
        return getFeatureStatus(UserSessionService.getFeaturePreferences('lists'), subfeature);
      },
      additionalContentVisibleStatuses: ['onboarding_2'],
      slides: {
        left: {
          path: 'lists/active',
          heading: 'active'
        },
        right: {
          path: 'lists/archived',
          heading: 'archived'
        }
      }
    },
    list: {
      heading: undefined,
      getStatus: function(subfeature){
        if (subfeature === 'notes'){
          // List notes is active only if notes is active
          return getFeatureStatus(UserSessionService.getFeaturePreferences('notes'));
        }else{
          return getFeatureStatus(UserSessionService.getFeaturePreferences('list'), subfeature);
        }
      },
      slides: {
        left: {
          path: 'list/tasks',
          heading: 'tasks'
        },
        right: {
          path: 'list/notes',
          heading: 'notes'
        }
      }
    },
    trash: {
      heading: 'trash',
      getStatus: function(subfeature){
        return getFeatureStatus(UserSessionService.getFeaturePreferences('trash'), subfeature);
      }
    },
    settings: {
      heading: 'settings',
      getStatus: function(subfeature){
        return getFeatureStatus(UserSessionService.getFeaturePreferences('settings'), subfeature);
      }
    },
    admin: {
      heading: 'admin'
    }
  };

  $scope.isMoreThanOneFeatureActive = function(){
    var preferences = UserSessionService.getPreferences();
    if (preferences && preferences.onboarded){
      var numberOfActiveFeatures = 0;
      for (var key in preferences.onboarded) {
        if (preferences.onboarded.hasOwnProperty(key)) {
          numberOfActiveFeatures++;
          if (numberOfActiveFeatures > 1) return true;
        }
      }
    }
  };

  // Check to see if menu should be enabled
  if (!$scope.isMoreThanOneFeatureActive()) {
    // Only one feature active, no need to show menu so disable dragging
    DrawerService.disableDragging('left');
  }

  // returns if main content is visible for given feature (and subfeature if applicable)
  $scope.isContentVisible = function(feature, subfeature){
    var status = getFeatureStatus(UserSessionService.getFeaturePreferences(feature), subfeature);
    if (status === 'active'){
      return true;
    }
    if ($scope.features[feature].additionalContentVisibleStatuses &&
        $scope.features[feature].additionalContentVisibleStatuses.indexOf(status) !== -1)
    {
      return true;
    }
  };

  $scope.isOnboarding = function(feature, subfeature){
    var status = getFeatureStatus(UserSessionService.getFeaturePreferences(feature), subfeature);
    if (status.startsWith('onboarding')){
      return true;
    }
  };

  $scope.getOnboardingPhase = function(feature, subfeature){
    var featurePreferences = UserSessionService.getFeaturePreferences(feature);
    if (angular.isNumber(featurePreferences) && featurePreferences > 0) return featurePreferences;
    else if (subfeature && angular.isObject(featurePreferences)){
      if (angular.isNumber(featurePreferences[subfeature]) && featurePreferences[subfeature] > 0)
        return featurePreferences[subfeature];
    }
  };

  function increaseOnboardingPhase(feature, featurePreferences, subfeature, warpIntoPhase){
    if (subfeature) {
      if (warpIntoPhase) {
        featurePreferences[subfeature] = warpIntoPhase;
      } else {
        featurePreferences[subfeature] += 1;
      }
    }
    else {
      if (warpIntoPhase) {
        featurePreferences = warpIntoPhase;
      } else {
        featurePreferences += 1;
      }
    }
    UserSessionService.setFeaturePreferences(feature, featurePreferences);
    UserService.saveAccountPreferences();
  }

  $scope.increaseOnboardingPhase = function(feature, subfeature){
    var featurePreferences = UserSessionService.getFeaturePreferences(feature);
    increaseOnboardingPhase(feature, featurePreferences, subfeature);
  };

  function decreaseOnboardingPhase(feature, featurePreferences, subfeature){
    if (subfeature) featurePreferences[subfeature] -= 1;
    else featurePreferences -= 1;
    UserSessionService.setFeaturePreferences(feature, featurePreferences);
    UserService.saveAccountPreferences();
  }

  $scope.activateFeatureOnboarding = function(featurePreferences, subfeature){
    if (angular.isString(featurePreferences)){
      if (featurePreferences.endsWith(':d')){
        return featurePreferences.substring(0, featurePreferences.length - 2);
      }
    }else if (angular.isObject(featurePreferences) && subfeature){
      featurePreferences[subfeature] = $scope.activateFeatureOnboarding(featurePreferences[subfeature]);
      return featurePreferences;
    }else if (!featurePreferences && subfeature){
      var newPreferences = {};
      newPreferences[subfeature] = 1;
      return newPreferences;
    }
    return 1;
  };

  // Plus button is pressed or new item is added, this function figures out what to do then
  $scope.notifyAddAction = function(type, featureInfo, subfeature){
    if (featureInfo === $scope.features.user){

    }else if (featureInfo === $scope.features.focus){
      var focusPreferences = UserSessionService.getFeaturePreferences('focus');
      if (subfeature === 'tasks'){
        var phase = $scope.getOnboardingPhase('focus', 'tasks');
        if (phase && (phase === 1 || phase === 2)){
          if (type === 'noAdd'){
            decreaseOnboardingPhase('focus', focusPreferences, subfeature);
          }else if (type === 'add' || type === 'activate'){
            // Focus tasks is the current feature and it is onboarding: we update the onboarding status
            var warpIntoPhase;
            if (phase === 2 && !CalendarService.isCalendarEnabled()) {
              warpIntoPhase = 5;
            }
            increaseOnboardingPhase('focus', focusPreferences, subfeature, warpIntoPhase);
            return true;
          }
        }
      }
    }else if (featureInfo === $scope.features.inbox){

    }else if (featureInfo === $scope.features.tasks){

    }else if (featureInfo === $scope.features.notes){

    }else if (featureInfo === $scope.features.lists){
      var listsPreferences = UserSessionService.getFeaturePreferences('lists');
      if (subfeature == 'active'){
        if (getFeatureStatus(listsPreferences, subfeature).startsWith('onboarding')){
          if (type === 'noAdd'){
            decreaseOnboardingPhase('lists', listsPreferences, subfeature);
          }else if (type === 'add' || type === 'activate'){
            // Lists is the current feature and it is onboarding: we update the onboarding status
            increaseOnboardingPhase('lists', listsPreferences, subfeature);
            return true;
          }
        }
      }else if (subfeature === 'archived'){
        if (type === 'beginAdd'){
          // When adding new archived lists, it is important it is done one at a time, to prevent
          // problems with online causing list to appear too slow
          return true;
        }
      }
    }else if (featureInfo === $scope.features.list){

    }else if (featureInfo === $scope.features.trash){

    }else if (featureInfo === $scope.features.settings){

    }
  };

  $scope.isTutorialInProgress = function(){
    var phase = $scope.getOnboardingPhase('focus', 'tasks');
    if (phase !== undefined && phase < 6){
      return true;
    }
  };

  $scope.getTutorialPhase = function(){
    var phase = $scope.getOnboardingPhase('focus', 'tasks');
    if (phase !== undefined){
      if (phase < 3 ) return 1;
      if (phase < 5) return 2;
      if (phase === 5) return $scope.getTutorialLength();
    }
  };

  $scope.getTutorialLength = function() {
    return CalendarService.isCalendarEnabled() ? 3 : 2;
  };

  $scope.completeTutorial = function(){
    // Tutorial is now ready, open up other avenues
    var onboardedValue = UISessionService.getOnboardedValue();

    UserSessionService.setFeaturePreferences('user', onboardedValue);
    UserSessionService.setFeaturePreferences('tasks', {all: 1});
    UserSessionService.setFeaturePreferences('trash', onboardedValue);
    UserSessionService.setFeaturePreferences('settings', 1);
    // Open up menu
    DrawerService.enableDragging('left');
    AnalyticsService.do('completeTutorial');
    $scope.increaseOnboardingPhase('focus', 'tasks');
  };

  $scope.completeOnboarding = function(feature, subfeature){
    var featurePreferences = UserSessionService.getFeaturePreferences(feature);

    var onboardedValue = UISessionService.getOnboardedValue();
    if (subfeature){
      if (!angular.isObject(featurePreferences)) featurePreferences = {};
      featurePreferences[subfeature] = onboardedValue;
      AnalyticsService.do(feature + subfeature.capitalizeFirstLetter() + 'Onboarded');
    }else{
      featurePreferences = onboardedValue;
      AnalyticsService.do(feature + 'Onboarded');
    }
    UserSessionService.setFeaturePreferences(feature, featurePreferences);
    UserService.saveAccountPreferences();
  };

  // NAVIGATION

  var openEditorAfterMenuClosed;
  var openMenuAfterEditorClosed = false;

  /*
  * Open editor.
  *
  * Set openEditorAfterMenuClosed and openMenuAFterEditorClosed flags to:
  *   i.  open editor in menu's close callback
  *   ii. open menu in editor's close callback
  *
  * TODO: analytics visit omnibar
  */
  $scope.openEditor = function (type, item, mode, speed) {

    // Check for existing edit locks and resolve them first.
    var deferredEditorClose = UISessionService.getDeferredAction('editorClose');
    if (deferredEditorClose) deferredEditorClose.resolve();

    var promise = UISessionService.deferAction('editorClose');

    if (DrawerService.isOpen('left') && $rootScope.columns < 3) {
      DrawerService.close('left', speed);
      openEditorAfterMenuClosed = {type: type, item: item, mode: mode, speed: speed};
      openMenuAfterEditorClosed = true;
    } else {
      DrawerService.open('right', speed);
      executeEditorAboutToOpenCallbacks(type, item, mode);
      $element[0].classList.add('editor-show');
    }

    return promise;
  };

  /*
  * Recurring editor.
  */
  function openRecurringEditor(items, mode) {
    $scope.openEditor('recurring', items, mode);
  }

  $scope.closeEditorDrawer = function(skipDrawerClose) {
    if (!skipDrawerClose) DrawerService.close('right');
    executeAboutToCloseCallbacks();
  };

  $scope.toggleMenu = function() {
    var menuOpen = DrawerService.toggle('left');
    if ($rootScope.columns === 3) {
      if (menuOpen && !$element[0].classList.contains('menu-show')) {
        $element[0].classList.add('menu-show');
      }
    }
  };

  $scope.closeMenu = function() {
    DrawerService.close('left');
  };

  $scope.openMenu = function() {
    if (!$scope.isMenuVisible()){
      DrawerService.open('left');
      if ($rootScope.columns === 3 && !$element[0].classList.contains('menu-show')) {
        $element[0].classList.add('menu-show');
      }
    }
  };

  $scope.disableDragging = function() {
    DrawerService.disableDragging('left');
  };

  $scope.isEditorVisible = function() {
    return DrawerService.isOpen('right');
  };

  $scope.isMenuVisible = function() {
    return DrawerService.isOpen('left');
  };

  $scope.isFooterNavigationHidden = function(){
    return (packaging.endsWith('cordova') && UserSessionService.getUIPreference('hideFooter'));
  };

  $scope.isVibrationDisabled = function(){
    return UserSessionService.getUIPreference('disableVibration');
  };

  // FEATURE CHANGING

  var featurePendingOpen;
  $scope.changeFeature = function(feature, data, toggleMenu, pending){
    var currentFeature = UISessionService.getCurrentFeatureName();
    var currentData = UISessionService.getFeatureData(currentFeature);
    var featureChanged = !(currentFeature === feature && currentData === data);
    var featureInfos = $scope.features[feature];

    if (featureChanged) {
      // Feature changed
      if (!$scope.isMenuVisible() && toggleMenu){
        // Open only after menu has been opened
        featurePendingOpen = {
          feature: feature,
          data: data
        };
        $scope.openMenu();
      }else {
        if (!featureInfos.loaded) featureInfos.loaded = true;

        var state = UISessionService.getFeatureState(feature);

        UISessionService.changeFeature(feature, data, state);
        if (!$scope.$$phase && !$rootScope.$$phase){
          $scope.$digest();
        }
        if (toggleMenu && pending){
          $timeout(function(){
            $scope.closeMenu();
          }, 300);
        }
      }

      if (featureInfos.loaded) resizeFixAndSetInitialSlideActive(true, featureInfos, feature);
      AnalyticsService.visit(feature);
    } else {
      // Feature not changed
      resizeFixAndSetInitialSlideActive(false, featureInfos, feature);
    }

    // Run special case focus callbacks because drawer-handle directive does not re-register itself when
    // feature changes to focus.
    if (featureActiveCallbacks) {
      for (var id in featureActiveCallbacks) {
        if (featureActiveCallbacks[id].feature === feature) {
          featureActiveCallbacks[id].callback(featureChanged);
        }
      }
    }
  };

  var resizeSwiperCallback;
  $scope.registerResizeSwiperCallback = function(callback) {
    resizeSwiperCallback = callback;
  };

  function resizeFixAndSetInitialSlideActive(featureChanged, featureInfos, feature) {

    if (featureInfos.resizeFix){
      window.requestAnimationFrame(function(){
        SwiperService.resizeFixSwiperAndChildSwipers(feature);
        featureInfos.resizeFix = false;
      });
    }

    if (featureInfos.slides && featureInfos.slides.left) {
      if (featureChanged) {
        // Swipe to initial slide before the next repaint when feature changes,
        // ng-show is evaluated and the DOM is rendered.
        // NOTE: use setTimeout(callback, 0) if requestAnimationFrame is not working.
        window.requestAnimationFrame(function() {
          if (typeof resizeSwiperCallback === 'function') {
            var swiperPath = featureInfos.heading;
            if (!swiperPath) {
              // When path is not set, get swiper from the left slide.
              swiperPath = SwiperService.getSwiperBySlidePath(featureInfos.slides.left.path);
            }
            resizeSwiperCallback(swiperPath);
            // NOTE:  Better would be to achieve this from swiper.js or someplace else because featureChange
            //        needs to do as little things as possible. However, ng-show sets display: none to
            //        inactive swipers so they have no width which swiper.js depends on when it calculates
            //        width for resized swiper (height is calculated in CSS with cssWidthAndHeight: 'height').
          }
          SwiperService.swipeToWithoutAnimation(featureInfos.slides.left.path);
        });
      } else {
        // Swipe to initial slide immediately.
        SwiperService.swipeToWithoutAnimation(featureInfos.slides.left.path);
      }
    }
  }

  $scope.isFeatureLoaded = function(feature){
    return ($rootScope.syncState !== 'active' || $rootScope.signUpInProgress) &&
    $scope.features[feature].loaded;
  };

  $scope.getActiveFeature = function getActiveFeature() {
    return UISessionService.getCurrentFeatureName();
  };

  $scope.isFeatureActive = function isFeatureActive(feature) {
    return $rootScope.syncState !== 'active' && $scope.getActiveFeature() === feature;
  };

  $scope.getFeatureMap = function(feature){
    return $scope.features[feature];
  };

  var featureActiveCallbacks = {};
  $scope.registerFeatureActivateCallback = function(activateFn, feature, id) {
    featureActiveCallbacks[id] = {
      callback: activateFn,
      feature: feature
    };
  };

  $scope.isFakeUser = function(){
    return UserSessionService.isFakeUser();
  };


  // START FROM FOCUS
  $scope.changeFeature('focus');

  var editorReady, editorReadyCallback = {};
  $scope.editorReady = function() {
    editorReady = true;
    if (typeof editorReadyCallback.fn === 'function') {
      editorReadyCallback.fn.apply(this, editorReadyCallback.parameters);
      if (!$rootScope.$$phase && !$scope.$$phase) {
        // Programmatic open. Most likely does not cause digest.
        $scope.$digest();
      }
    }
  };

  // CORDOVA LISTENER

  if (packaging.endsWith('cordova')) {

    var onDeviceReady = function() {
      registerCordovaListeners();
      activateCordova();
    };

    var registerCordovaListeners = function() {
      if (cordova.plugins && cordova.plugins.notification) {
        listenReminderClick();
      }

      if (packaging === 'android-cordova'){
        document.addEventListener('backbutton', onBack, false);
        document.addEventListener('menubutton', onMenu, false);
      }
    };

    if (cordova) {
      if (cordova.plugins && cordova.plugins.notification) {
        registerCordovaListeners();
        activateCordova();
      } else {
        document.addEventListener('deviceready', onDeviceReady, false);
      }
    } else {
      document.addEventListener('deviceready', onDeviceReady, false);
    }
  }

  function activateCordova(){
    ReminderService.clearTriggeredReminders();
    var keepRunningPreferences = UserSessionService.getUIPreference('keepRunning');
    if (keepRunningPreferences && keepRunningPreferences[UISessionService.getDeviceId()]){
      ReminderService.setPersistentReminderForThisDevice();
    }
    if (packaging === 'android-cordova'){
      processIncomingItem();
    }
  }

  // SHARE VIA

  function processIncomingItem(){
    if (window.plugins && window.plugins.webintent){
      window.plugins.webintent.getExtra(window.plugins.webintent.EXTRA_TEXT,
        function(url) {
          // url is the value of EXTRA_TEXT
          storeSharedItem('url', url);
          window.plugins.webintent.clearExtra(window.plugins.webintent.EXTRA_TEXT,
            function() { // extra is now cleared
            },function() { // There was no extra supplied.
            }
          );
        }, function() {
          // There was no extra text supplied, this means there is no proper share
          shareViaValues = undefined;
        }
      );
      window.plugins.webintent.getExtra(window.plugins.webintent.EXTRA_SUBJECT,
        function(subject) {
          // subject is the value of EXTRA_SUBJECT
          storeSharedItem('subject', subject);
          window.plugins.webintent.clearExtra(window.plugins.webintent.EXTRA_SUBJECT,
            function() { // extra is now cleared
            },function() { // There was no extra supplied.
            }
          );
        }, function() {
          // There was no extra supplied.
          storeSharedItem('subject', undefined);
        }
      );
    }
  }

  var shareViaValues;
  function storeSharedItem(type, value){
    if (!shareViaValues) shareViaValues = {};
    if (type === 'subject'){
      shareViaValues.subject = value;
    }else if (type === 'url'){
      shareViaValues.url = value;
    }
    if (shareViaValues.hasOwnProperty('url') && shareViaValues.hasOwnProperty('subject')){
      // First set back button to exit app
      $scope.exitAppOnBack = true;

      // Second: activate inbox if not active
      if ($scope.features.inbox.getStatus() === 'disabled'){
        var inboxPrefs = UserSessionService.getFeaturePreferences('inbox');
        inboxPrefs = $scope.activateFeatureOnboarding(inboxPrefs);
        UserSessionService.setFeaturePreferences('inbox', inboxPrefs);
        UserService.saveAccountPreferences();
      }

      // Then, save value to inbox
      var initialShareItemValues = {
        title: shareViaValues.subject ? shareViaValues.subject : shareViaValues.url.trim()
      };
      if (shareViaValues.url){
        initialShareItemValues.link = shareViaValues.url.trim();
      }
      shareViaValues = undefined;
      if (initialShareItemValues.title){
        var newItem = ItemsService.getNewItem(initialShareItemValues, UserSessionService.getUserUUID());

        var doSaveSharedItem = function(newItem){
          ItemsService.saveItem(newItem).then(function(){
            $scope.openEditor('item', newItem);
            if (!$rootScope.$$phase && !$scope.$$phase) {
              // Programmatic open. Most likely does not cause digest.
              $scope.$digest();
            }
          });
        }
        if (editorReady) {
          doSaveSharedItem(newItem);
        }else{
          editorReadyCallback.fn = doSaveSharedItem;
          editorReadyCallback.parameters = [newItem];
        }
      }
    }
  }

  // REMINDERS

  function openTaskInEditor(notificationData, directOpen) {
    var taskInfo = TasksService.getTaskInfo(notificationData.itemUUID, UISessionService.getActiveUUID());
    if (taskInfo !== undefined) {
      // NOTE:  Speed is set to 0 in both cases. Set to undefined when directOpen === false to enable
      //        editor open animation.
      if (editorReady) {
        $scope.openEditor('task', taskInfo.task, undefined, directOpen ? 0 : 0);
        if (!$rootScope.$$phase && !$scope.$$phase) {
          // Programmatic open. Most likely does not cause digest.
          $scope.$digest();
        }
      } else {
        editorReadyCallback.fn = $scope.openEditor;
        editorReadyCallback.parameters = ['task', taskInfo.task, undefined, directOpen ? 0 : 0];
      }
    }
  }

  function reminderClick(notification) {
    var coldBootClick = !UserSessionService.isPersistentDataLoaded();
    if (notification.data) {
      // https://github.com/katzer/cordova-plugin-local-notifications/issues/489
      var notificationData = JSON.parse(notification.data);
      if (notificationData.itemType === 'task') {
        if (UserSessionService.isPersistentDataLoaded()) {
          openTaskInEditor(notificationData, coldBootClick);
        } else {
          // Items are not loaded yet. Register callback to persistendDataLoaded.
          UserSessionService.registerPersistentDataLoadedCallback(function() {
            openTaskInEditor(notificationData, coldBootClick);
          }, 'MainController');
        }
      }
    }
  }

  function listenReminderClick() {
    cordova.plugins.notification.local.on('click', reminderClick);
  }

  // BACK HANDLER

  var backCallbacks = {};
  $scope.registerBackCallback = function(callback, id) {
    backCallbacks[id] = callback;
  };
  $scope.unregisterBackCallback = function(id) {
    if (backCallbacks[id]) delete backCallbacks[id];
  };
  function executeBackCallbacks() {
    var backHandled = false;
    for (var id in backCallbacks){
      if (backCallbacks[id]() === true) backHandled = true;
    }
    return backHandled;
  }
  function onBack(e) {
    if (executeBackCallbacks() !== true){
      // TODO: Back wasn't handled by a callback, navigate to previous feature
    }
    e.preventDefault();
  }


  // MENU HANDLER

  function onMenu(e) {
    if (!$scope.isTutorialInProgress()){
      if ($scope.isEditorVisible()){
        $scope.closeEditorDrawer();
        $timeout(function(){
          $scope.changeFeature('settings', undefined, true);
        }, $rootScope.EDITOR_ANIMATION_SPEED);
      }else{
        $scope.changeFeature('settings', undefined, true);
      }
    }
    e.preventDefault();
  }

  // DATA ARRAY LISTENERS

  /*
  * tasks: {
  *   active: [cb1, cb2...],
  *   deleted: [cb2, cb3...]
  * }
  */
  var arrayChangedCallbacks = {};
  $scope.registerArrayChangeCallback = function(itemType, arrayTypes, callback, id) {

    function doRegisterArrayChangeCallback(itemType, arrayType, callback, id) {
      if (!arrayChangedCallbacks[itemType][arrayType]) arrayChangedCallbacks[itemType][arrayType] = [];
      else {
        for (var i = 0; i < arrayChangedCallbacks[itemType][arrayType].length; i++) {
          var changeCallback = arrayChangedCallbacks[itemType][arrayType][i];
          if (changeCallback.id === id) {
            changeCallback.callback = callback;
            return;
          }
        }
      }
      arrayChangedCallbacks[itemType][arrayType].push({
        callback: callback,
        id: id
      });
    }

    if (!arrayChangedCallbacks[itemType]) arrayChangedCallbacks[itemType] = [];

    if (angular.isArray(arrayTypes)) {
      for (var i = 0; i < arrayTypes.length; i++) {
        doRegisterArrayChangeCallback(itemType, arrayTypes[i], callback, id);
      }
    } else {
      doRegisterArrayChangeCallback(itemType, arrayTypes, callback, id);
    }
  };

  $rootScope.$on('arrayChanged', function(name, arrayInfo) {

    function executeArrayChangedCallbacks(itemType, arrayType, array, item, ownerUUID) {
      // Execute ownerUUID arrayType callbacks for itemType.
      if (arrayChangedCallbacks[itemType] && arrayChangedCallbacks[itemType][arrayType]) {
        var changeCallbacks = arrayChangedCallbacks[itemType][arrayType];
        for (var i = 0; i < changeCallbacks.length; i++) {
          changeCallbacks[i].callback(array, item, arrayType, ownerUUID);
        }
      }
    }

    if (angular.isArray(arrayInfo.data)) {
      for (var i = 0; i < arrayInfo.data.length; i++) {
        executeArrayChangedCallbacks(arrayInfo.type,
                                     arrayInfo.data[i].type,
                                     arrayInfo.data[i].array,
                                     arrayInfo.item,
                                     arrayInfo.ownerUUID);
      }
    } else if (angular.isObject(arrayInfo.data)) {
      executeArrayChangedCallbacks(arrayInfo.type,
                                   arrayInfo.data.type,
                                   arrayInfo.data.array,
                                   arrayInfo.item,
                                   arrayInfo.ownerUUID);
    }
  });

  // ACTIVATE / DEACTIVATE

  // Focus event listening is on for browsers, where hidden tab should not poll continuously, false in
  // Cordova where in iOS javascript execution is paused anyway when app is not in focus, and Android needs
  // to be handled with pause event.
  if (!packaging.endsWith('cordova')){
    angular.element($window).bind('focus', executeActivateCallbacks);
    angular.element($window).bind('blur', executeDeactivateCallbacks);
  // Resume and pause listening in Cordova:
  //  * in Android and iOS to clear triggered reminders on resume.
  }else{
    document.addEventListener('resume', executeActivateCallbacks, false);
    document.addEventListener('pause', executeDeactivateCallbacks, false);
  }

  var activateDeactivateCallbacks = {};
  $scope.registerActivateDeactivateCallbacks = function(activateCallback, deactivateCallback, id) {
    activateDeactivateCallbacks[id] = {activate: activateCallback, deactivate: deactivateCallback};
  };
  $scope.unregisterActivateDeactivateCallbacks = function(id) {
    if (activateDeactivateCallbacks[id]) delete activateDeactivateCallbacks[id];
  };
  function executeActivateCallbacks() {
    if (packaging.endsWith('cordova')){
      activateCordova();
    }
    for (var id in activateDeactivateCallbacks)
      activateDeactivateCallbacks[id].activate();
  }
  function executeDeactivateCallbacks() {
    for (var id in activateDeactivateCallbacks)
      activateDeactivateCallbacks[id].deactivate();
  }

  $scope.$on('$destroy', function() {
    // http://www.bennadel.com/blog/2548-Don-t-Forget-To-Cancel-timeout-Timers-In-Your-destroy-Events-In-AngularJS.htm
    if (!packaging.endsWith('cordova')){
      angular.element($window).unbind('focus', executeActivateCallbacks);
      angular.element($window).unbind('blur', executeDeactivateCallbacks);
    }else{
      document.removeEventListener('resume', executeActivateCallbacks, false);
      document.removeEventListener('pause', executeDeactivateCallbacks, false);
    }
  });

  // EDITOR CALLBACKS

  var editorAboutToOpenCallbacks = {};
  var editorOpenedCallbacks = {};
  var editorAboutToCloseCallbacks = {};
  var editorClosedCallbacks = {};

  // register editor callbacks
  $scope.registerEditorAboutToOpenCallback = function (callback, id) {
    editorAboutToOpenCallbacks[id] = callback;
  };
  $scope.unregisterEditorAboutToOpenCallback = function (callback, id) {
    if (editorAboutToOpenCallbacks[id]) delete editorAboutToOpenCallbacks[id];
  };

  $scope.registerEditorOpenedCallback = function(callback, id) {
    editorOpenedCallbacks[id] = callback;
  };
  $scope.unregisterEditorOpenedCallback = function(id) {
    if (editorOpenedCallbacks[id]) delete editorOpenedCallbacks[id];
  };

  $scope.registerEditorAboutToCloseCallback = function(callback, id) {
    editorAboutToCloseCallbacks[id] = callback;
  };
  $scope.unregisterEditorAboutToCloseCallback = function(id) {
    if (editorAboutToCloseCallbacks[id]) delete editorAboutToCloseCallbacks[id];
  };

  $scope.registerEditorClosedCallback = function(callback, id) {
    editorClosedCallbacks[id] = callback;
  };
  $scope.unregisterEditorClosedCallback = function(id) {
    if (editorClosedCallbacks[id]) delete editorClosedCallbacks[id];
  };

  var menuOpenedCallbacks = {}, menuClosedCallbacks = {};

  // Register menu callbacks
  $scope.registerMenuOpenedCallbacks = function(callback, id) {
    menuOpenedCallbacks[id] = callback;
  };
  $scope.registerMenuClosedCallbacks = function(callback, id) {
    menuClosedCallbacks[id] = callback;
  };

  // register drawer callbacks to DrawerService

  function executeEditorAboutToOpenCallbacks(editorType, item, mode) {
    for (var id in editorAboutToOpenCallbacks)
      editorAboutToOpenCallbacks[id](editorType, item, mode);
  }

  DrawerService.registerOpenedCallback('right', editorOpened, 'MainController');
  function editorOpened() {
    for (var id in editorOpenedCallbacks) {
      editorOpenedCallbacks[id]();
    }
    if ($rootScope.columns < 3) $element[0].classList.add('editor-visible');
  }

  function executeAboutToCloseCallbacks() {
    for (var id in editorAboutToCloseCallbacks) {
      editorAboutToCloseCallbacks[id]();
    }
  }

  DrawerService.registerAboutToCloseCallback('right', editorAboutToClose, 'MainController');
  function editorAboutToClose() {
    executeAboutToCloseCallbacks();
  }

  DrawerService.registerClosedCallback('right', editorClosed, 'MainController');
  function editorClosed() {
    if (openMenuAfterEditorClosed) {
      DrawerService.open('left');
      openMenuAfterEditorClosed = false;
    }
    for (var id in editorClosedCallbacks)
      editorClosedCallbacks[id]();

    // Don't remove list items from list before editor has been closed.
    // See: listItemLeaveAnimation in listItemDirective.
    UISessionService.resolveDeferredActions('editorClose');
    $element[0].classList.remove('editor-show', 'editor-visible');
  }

  DrawerService.registerOpenedCallback('left', menuOpened, 'MainController');
  function menuOpened() {
    if (featurePendingOpen){
      var doChangeFeature = function() {
        $scope.changeFeature(featurePendingOpen.feature,
                             featurePendingOpen.data,
                             true,
                             true);
        featurePendingOpen = undefined;
      };

      var callbacksExecutedPromise = DrawerService.getExecuteOpenedCallbacksPromise();
      if (callbacksExecutedPromise) // Change feature when all callbacks are executed.
        callbacksExecutedPromise.then(doChangeFeature);
      else
        doChangeFeature();
    }
    executeMenuOpenedCallbacks();
  }

  function executeMenuOpenedCallbacks() {
    for (var id in menuOpenedCallbacks) {
      menuOpenedCallbacks[id]();
    }
  }

  DrawerService.registerClosedCallback('left', menuClosed, 'MainController');
  function menuClosed() {
    if (openEditorAfterMenuClosed) {
      // Snap.js clears transition style from drawer aisle element and executes closed (animated) callback.
      // Wait until DOM manipulation is ready before opening editor
      // to have correct transition style in drawer aisle element.
      $timeout(function() {
        DrawerService.open('right', openEditorAfterMenuClosed.speed);
        executeEditorAboutToOpenCallbacks(openEditorAfterMenuClosed.type,
                                          openEditorAfterMenuClosed.item,
                                          openEditorAfterMenuClosed.mode);
        openEditorAfterMenuClosed = undefined;
        $element[0].classList.add('editor-show');
      });
    }
    if ($rootScope.columns === 3 && $element[0].classList.contains('menu-show')) {
      $element[0].classList.remove('menu-show');
    }
    executeMenuClosedCallbacks();
  }

  function executeMenuClosedCallbacks() {
    for (var id in menuClosedCallbacks) {
      menuClosedCallbacks[id]();
    }
  }

  // UI FUNCTIONS

  $scope.customToolbar = undefined;
  $scope.isCustomToolbar = function(){
    return $scope.customToolbar;
  };

  $scope.swapToCustomToolbar = function(toolbar){
    $scope.customToolbar = toolbar;
  };

  $scope.resetToDefaultToolbar = function(){
    $scope.customToolbar = undefined;
  };

  $scope.getActiveDisplayName = function() {
    if ($scope.isFakeUser()){
      return 'get my free account';
    }else{
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
        return ownerName;
      }
    }
  };

  // INJECT OTHER CONTENT CONTROLLERS HERE
  $controller('SynchronizeController',{$scope: $scope});
  $controller('TasksController',{$scope: $scope});
  $controller('ListsController',{$scope: $scope});
  $controller('TagsController',{$scope: $scope});
  $controller('NotesController',{$scope: $scope});
  $controller('ItemsController',{$scope: $scope});
  $controller('UserController',{$scope: $scope});
}

MainController['$inject'] = [
'$element', '$controller', '$filter', '$q', '$rootScope', '$scope', '$timeout', '$window',
'AnalyticsService', 'CalendarService', 'DrawerService', 'ItemsService', 'ReminderService', 'SwiperService',
'TasksService', 'UISessionService', 'UserService', 'UserSessionService', 'packaging'
];
angular.module('em.main').controller('MainController', MainController);

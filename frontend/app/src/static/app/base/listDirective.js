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
 /*jshint -W008 */

 function listDirective($parse, $q, $rootScope, $timeout, UISessionService) {
  return {
    require: ['^listContainer', '?^swiperSlide'],
    restrict: 'A',
    scope: true,
    controller: ['$scope', '$element', '$attrs', function($scope, $element, $attrs) {
      $scope.listInfos = {};
      $scope.listOptions = {};
      $scope.listAddState = {};
      if ($attrs.listOptions) {
        $scope.listOptions = $parse($attrs.listOptions)($scope);
      }

      var listArrayFn = $parse($attrs.list);
      $scope.getFullArray = function(){
        return listArrayFn($scope);
      };

      $scope.getVisibleArray = function(getFullArrayFn, limitTo) {
        var fullArray = getFullArrayFn();
        if (fullArray) {
          if (customFilterItemVisible) {
            $scope.listInfos.array = customFilterItemVisible(fullArray);  // Cache filtered full array
          } else if ($scope.listOptions.hideItemDefault) {
            // Return empty array.
            // NOTE:  This is intended to be working together with custom filter. While it is not visible,
            //        but will be later, use this to avoid Angular error "Controller 'list', required by
            //        directive 'listItem', can't be found!"
            $scope.listInfos.array = [];
          } else {
            $scope.listInfos.array = fullArray; // Cache filtered full array
          }
          return $scope.listInfos.array.slice(0, limitTo);
        }
      };

      $scope.getFilteredFullArrayLength = function() {
        if ($scope.listInfos.array)
          return $scope.listInfos.array.length;
      };

      this.notifyArrayVisible = function(/*array*/) {
        if (arrayVisibleCallbacks) {
          for (var id in arrayVisibleCallbacks) {
            if (arrayVisibleCallbacks.hasOwnProperty(id)) arrayVisibleCallbacks[id]();
          }
        }
        $scope.arrayVisible = true;
      };

      this.getSlideId = function() {
        return $scope.listOptions.id;
      };

      var arrayVisibleCallbacks = {};
      this.registerArrayVisibleCallback = function(callback, id) {
        arrayVisibleCallbacks[id] = callback;
      };
      $scope.registerArrayVisibleCallback = this.registerArrayVisibleCallback;

      this.unregisterArrayVisibleCallback = function(id) {
        if (arrayVisibleCallbacks[id])
          delete arrayVisibleCallbacks[id];
      };
      $scope.unregisterArrayVisibleCallback = this.unregisterArrayVisibleCallback;

      var listOpenOnAddFn;
      if ($attrs.listOpen){
        listOpenOnAddFn = $parse($attrs.listOpen).bind(undefined, $scope);
      }
      $scope.activateListAdd = function() {
        if (angular.isFunction($scope.isListAddDisabled) && $scope.isListAddDisabled()){
          // Add is disabled, exit
          return;
        }
        if (listOpenOnAddFn){
          // Execute open function
          listOpenOnAddFn();
        } else if ($scope.activateAddItem) {
          $scope.activateAddItem();
          if ($scope.notifyAddAction){
            $scope.notifyAddAction('activate', $scope.listAddState.featureInfo,
                                   $scope.listAddState.subfeature);
          }
        }
      };
      this.activateListAdd = $scope.activateListAdd;

      this.registerAddActiveCallback = function(callback){
        $scope.activateAddItem = callback;
      };

      this.notifyListItemAddActive = function(active) {
        $scope.listItemAddActive = active;
      };

      this.notifyListItemAdd = function(){
        if ($scope.notifyAddAction){
          return $scope.notifyAddAction('add', $scope.listAddState.featureInfo,
                                                   $scope.listAddState.subfeature);
        }
      };

      this.notifyListItemExitNoAdd = function(){
        if ($scope.notifyAddAction){
          return $scope.notifyAddAction('noAdd', $scope.listAddState.featureInfo,
                                                   $scope.listAddState.subfeature);
        }
      };

      this.notifyListItemBeginAdd = function(){
        if ($scope.notifyAddAction){
          return $scope.notifyAddAction('beginAdd', $scope.listAddState.featureInfo,
                                                   $scope.listAddState.subfeature);
        }
      };

      var customFilterItemVisible;
      this.setCustomFilterItemVisible = function(filter){
        customFilterItemVisible = filter;
      };
      $scope.isListItemVisible = function(item, param){
        if (customFilterItemVisible){
          return customFilterItemVisible(item, param);
        }
        return true;
      };

      this.registerIsNearListBottomCallback = function(callback) {
        $scope.isNearListBottomCallback = callback;
        if ($scope.listInfos && $scope.listInfos.array) {
          // Return initial status to caller.
          return $scope.currentListLimitTo < $scope.getFilteredFullArrayLength();
        }
      };

      this.setLoading = function(enabled) {
        if (enabled){
          $scope.disableLoading = false;
          if (!$scope.currentListLimitTo || $scope.currentListLimitTo < 25) $scope.currentListLimitTo = 25;
        }else{
          $scope.currentListLimitTo = $scope.getFilteredFullArrayLength();
          $scope.disableLoading = true;
        }
      };

      var checkingItemsDeferred = [];
      function resolveAllDeferredCheckings(){
        UISessionService.allow('leaveAnimation', 200);
        for (var i=0; i<checkingItemsDeferred.length; i++){
          if (checkingItemsDeferred[i].deferred)
            checkingItemsDeferred[i].deferred.resolve(checkingItemsDeferred[i].item);
        }
        checkingItemsDeferred = [];
      }
      function resolveDeferredChekckingsIfItemLatest(item){
        return $timeout(function() {
            if (checkingItemsDeferred.length > 0 &&
                (checkingItemsDeferred[checkingItemsDeferred.length-1].item === item ||
                (checkingItemsDeferred.length>1 &&
                 checkingItemsDeferred[checkingItemsDeferred.length-1].deferred === undefined &&
                 checkingItemsDeferred[checkingItemsDeferred.length-2].item === item))){
              resolveAllDeferredCheckings();
              if (!$scope.$$phase && !$rootScope.$$phase) $scope.$digest();
            }
          }, $rootScope.CHECKBOX_CHECKING_ANIMATION_TIME);
      }

      this.toggleLeftCheckbox = function(item, toggleFn, checkingTimeout) {
        var checkboxCheckingReadyDeferred = $q.defer();
        var checked = toggleFn(item, checkboxCheckingReadyDeferred);
        if (checked) {
          checkingItemsDeferred.push({deferred: checkboxCheckingReadyDeferred, item: item});
          checkingTimeout = resolveDeferredChekckingsIfItemLatest(item);
        } else{
          checkingItemsDeferred.push({item: item});
          if (checkingTimeout){
            $timeout.cancel(checkingTimeout);
            checkingTimeout = undefined;
          }
          if (checkingItemsDeferred.length > 1){
            // See if this item is among the recently checked (not the last one, as that was just pushed)
            // and splice it from there
            for (var i=0; i<checkingItemsDeferred.length-1; i++){
              if (checkingItemsDeferred[i].item === item){
                checkingItemsDeferred.splice(i, 1);
                break;
              }
            }
          }
          checkboxCheckingReadyDeferred.resolve(item);
          resolveDeferredChekckingsIfItemLatest(item);
        }
        return checkingTimeout;
      };
    }],
    link: function(scope, element, attrs, controllers) {
      var scrollElement = scope.listOptions.scrollParent ? element[0].parentElement : element[0];

      var listLockedCallback;
      if (attrs.listLocked) {
        listLockedCallback = $parse(attrs.listLocked).bind(undefined, scope);
      }

      controllers[0].registerGetFullArrayFn(scope.getFullArray);

      function notifyListAddFeature(featureInfo, subfeature){
        scope.listAddState.featureInfo = featureInfo;
        scope.listAddState.subfeature = subfeature;
      }

      function activateListAdd() {
        scope.activateListAdd();
      }

      function getWatcher() {
        return scope.$watch('listInfos.array.length', function(newLength, oldLength) {
          if (newLength !== oldLength) {
            if (oldLength <= scope.currentListLimitTo && newLength > scope.currentListLimitTo) {
              // Went above limit. Reset limit.
              setLimits(0);
            } else if (oldLength >= scope.currentListLimitTo && newLength < scope.currentListLimitTo) {
              // Went below limit. Reset limit.
              setLimits(0);
            }
          }
        });
      }

      var listData = {
        element: scrollElement,
        setLimits: setLimits,
        setIsNearListBottom: setIsNearListBottom,
        getCurrentListStartIndex: function() {
          return scope.currentListStartIndex;
        },
        updateUI: function() {
          if (!scope.$$phase && !$rootScope.$$phase) scope.$digest(); // Update UI.
        }
      };

      function getListData() {
        return listData;
      }

      initList(scope.listOptions);

      function isListBounded() {
        return scope.listOptions.isBounded === 'function' && scope.listOptions.isBounded();
      }

      function listActive(){
        controllers[0].registerActivateAddListItemCallback(activateListAdd, element);
        controllers[0].registerNotifyListAddFeatureCallback(notifyListAddFeature, element);

        if (scope.arrayVisible) {
          controllers[0].registerLengthChangeWatcher(getWatcher);
        } else {
          // Wait for array to become visible, unregister array visible callback
          // and register length change watcher.
          scope.registerArrayVisibleCallback(function() {
            scope.unregisterArrayVisibleCallback('listDirective');
            controllers[0].registerLengthChangeWatcher(getWatcher);
          }, 'listDirective');
        }

        if (!isListBounded()) {

          var elementHeight = scrollElement.offsetHeight;
          var elementScrollHeight = scrollElement.scrollHeight;
          var elementScrollPosition, remainingToBottom;

          if (elementHeight !== elementScrollHeight) {
            // Item has scrollable content
            elementScrollPosition = scrollElement.scrollTop;
            remainingToBottom = elementScrollHeight - elementScrollPosition - elementHeight;

            if (remainingToBottom === 0) {
              // At the bottom, load more.
              preventListModify = false;  // Clear state variable when returning to bottom of the list.
              addMoreItemsToBottom();
            }
          }
        }
        // Did we return into list that has been scrolled near the bottom.
        setIsNearListBottom();
        if (scope.listOptions.duplicate) {
          var duplicateListData = controllers[0].getDuplicateListData(scope.listOptions.id);
          if (duplicateListData) {
            duplicateListData.setIsNearListBottom();
          }
        }
      }

      function listInActive() {
        if (scrollElement.scrollTop) {
          scrollElement.scrollTop = 0;
        }

        if (scope.currentListStartIndex !== 0) {
          setLimits(0);
          if (!scope.$$phase && !$rootScope.$$phase) scope.$digest(); // Update UI.
        }

        var duplicateListData = controllers[0].getDuplicateListData(scope.listOptions.id);
        if (duplicateListData) {
          if (duplicateListData.element.scrollTop) {
            duplicateListData.element.scrollTop = 0;
          }

          if (duplicateListData.getCurrentListStartIndex()) {  // !undefined && !0
            duplicateListData.setLimits(0);
            duplicateListData.updateUI();
          }
        }
      }

      /*
      * Set flag to prevent/allow modifying list.
      */
      var preventListModify;
      function listMoved(movement) {
        preventListModify = movement !== 0;
        if (!preventListModify && allowListModifyDeferred) {
          // Resolve existing list modifying lock when list modifying is allowed again.
          allowListModifyDeferred.resolve();
        }
      }

      if (controllers[1] && !scope.listOptions.slidePollingDisabled){
        controllers[1].registerSlideActiveCallback(listActive, 'listDirective');
        if (controllers[1].isSlideActiveByDefault()){
          listActive();
        }
      }else {
        // List is active as it doesn't have a swiper to begin with
        listActive();
      }

      // Calls a function which returns a promise, and on promise resolve,
      // scrolls to the right place.
      scope.callAndWaitThenScroll = function(fn, parameter){
        var promise = fn(parameter);
        if (attrs.listRecent !== undefined && promise && promise.then){
          promise.then(function(){
            scrollElement.scrollTop = 0;
          });
        }
      };

      // INFINITE SCROLL

      // Coefficient of container height, which specifies when add more is called.
      var removeCoefficientToEdge;
      var nearingCoefficientToEdge = .5;
      var lastScrollPosition = 0;
      var bottomVerificationTimer;

      /**
       * @description Returns appropriate number of items relative to current height.
       *
       * Five items in iPhone 5 (height is 568 pixels in portrait mode) is the baseline.
       * It has a moderate exponential growth when the height increases.
       * TODO:  Max number and increase amount should be calculated based on the height of individual elements
       *        in the list.
       */
       function calculateMaximumNumberOfBoundedItems() {
        return Math.floor(($rootScope.currentHeight - ($rootScope.TOOLBAR_HEIGHT * 2)) / 76.5);
      }

      /**
       * @description Calculates the limits of a bounded list.
       *
       * TODO:  Debounce the execution when bounded lists are used in desktop (when agenda is enabled) because
       *        the callback is fired from resize event.
       */
       function calculateBoundedItemsAndLimits() {
        var filteredFullArrayLength = scope.getFilteredFullArrayLength();
        scope.maximumNumberOfItems = calculateMaximumNumberOfBoundedItems();

        if (scope.currentListLimitTo < filteredFullArrayLength) {
          // List is limited. Set new limits.
          setLimits(0);
        }

        else if (scope.currentListStartIndex === 0 && scope.currentListLimitTo >= filteredFullArrayLength &&
                 scope.maximumNumberOfItems < scope.currentListLimitTo)
        {
          // List is limited, but whole list is visible with the previous height and new maximum number of
          // items is below the current limit. Set new limits.
          setLimits(0);
        }
      }

      function initList(options) {
        var bounded;

        if (options) {
          if (options.registerModeChanged && typeof options.registerModeChanged === 'function') {
            options.registerModeChanged(modeChanged, options.id);
          }
          if (options.isBounded && typeof options.isBounded === 'function') {
            bounded = options.isBounded();
          }
          if (options.scrollInactiveTop && controllers[1]) {
            controllers[1].registerSlideInActiveCallback(listInActive, 'listDirective');
          }
          if (options.duplicate) {
            controllers[0].registerGetDuplicateListData(getListData, options.duplicate);
          }
        }

        if (bounded) {
          scope.maximumNumberOfItems = calculateMaximumNumberOfBoundedItems();
          if (options.id) scope.registerWindowResizedCallback(calculateBoundedItemsAndLimits, options.id);
        } else {
          scrollElement.addEventListener('scroll', listScroll, false);
          removeCoefficientToEdge = 3;

          // TODO:  Max number and increase amount should be calculated based on the height of the
          //        container and the height of individual elements in the list.
          scope.maximumNumberOfItems = 25;
          scope.itemIncreaseAmount = 25;

          if (controllers[1]) {
            controllers[1].registerSlideMovementCallback(listMoved, 'listDirective');
          }
        }
        setLimits(0);
      }

      function reInitList(options) {
        var bounded;
        if (options && options.isBounded && typeof options.isBounded === 'function')
          bounded = options.isBounded();

        if (bounded) {
          scope.maximumNumberOfItems = calculateMaximumNumberOfBoundedItems();
          if (options.id) scope.registerWindowResizedCallback(calculateBoundedItemsAndLimits, options.id);

          scrollElement.removeEventListener('scroll', listScroll, false);
          if (controllers[1]) {
            controllers[1].unregisterSlideMovementCallback('listDirective');
          }
        } else {
          scrollElement.addEventListener('scroll', listScroll, false);
          removeCoefficientToEdge = 3;

          // TODO:  Max number and increase amount should be calculated based on the height of the
          //        container and the height of individual elements in the list.
          scope.maximumNumberOfItems = 25;
          scope.itemIncreaseAmount = 25;

          if (controllers[1]) {
            controllers[1].registerSlideMovementCallback(listMoved, 'listDirective');
          }
          if (options.id) scope.unregisterWindowResizedCallback(calculateBoundedItemsAndLimits, options.id);
        }
        setLimits(0);
      }

      function modeChanged() {
        reInitList(scope.listOptions);
      }

      scope.addMoreItems = function() {
        var limit = scope.getFilteredFullArrayLength();
        setLimits(limit);
        if (scope.listOptions.duplicate) {
          var duplicateListData = controllers[0].getDuplicateListData(scope.listOptions.id);
          if (duplicateListData) {
            duplicateListData.setLimits(limit);
          }
        }
      };

      function startBottomVerificationTimer() {
        bottomVerificationTimer = setTimeout(function() {
          // Stayed at the lower position of the container for long enough - add more items to bottom.
          addMoreItemsToBottom();

          // Clear state variables.
          stoppedInNegativeScrollPosition = false;
          cameFromNegativePosition = false;
        }, 800);
      }

      /*
      * When reached negative scroll position, start timer.
      *
      * If we are at the negative position after time limit, set flag on.
      */
      var negativeHoldPositionTimer;
      function startNegativeHoldPositionTimer() {
        negativeHoldPositionTimer = setTimeout(function() {
          var elementHeight = scrollElement.offsetHeight;
          var elementScrollHeight = scrollElement.scrollHeight;
          var elementScrollPosition = scrollElement.scrollTop;
          var remainingToBottom = elementScrollHeight - elementScrollPosition - elementHeight;

          if (remainingToBottom < 0) {
            // Stayed at the negative position of the container for long enough
            stoppedInNegativeScrollPosition = true;
          } else {
            stoppedInNegativeScrollPosition = false;
          }
          negativeHoldPositionTimer = undefined;  // Clear state variable.
        }, 1300);
      }

      var cameFromNegativePosition, stoppedInNegativeScrollPosition;

      /*
      * FIXME
      * i.  kun ei olla käyty negatiivisella puolella:
      *       - kun kaksi kertaa pohjalla sekunnin välein, lisää pohjalle
      *
      * ii. kun ollaan käyty negatiivisella puolella:
      *       - kun seuraavaksi pohjalla, tarkista lyhyen ajan (~50ms) jälkeen, ollaanko yhä pohjalla ja
      *       - lisää sitten pohjalle.
      *
      * iii.  kun ollaan pohjalla tai negatiivisella puolella, näytä ja käynnistä latausanimaatio
      * iv.   kun ollaan positiivisella puolella, pysäytä ja piilota latausanimaatio
      */
      function listScroll(/*event*/){

        // get scroll position
        var elementHeight = scrollElement.offsetHeight;
        var elementScrollHeight = scrollElement.scrollHeight;
        var elementScrollPosition = scrollElement.scrollTop;
        var remainingToBottom = elementScrollHeight - elementScrollPosition - elementHeight;

        var scrollingDown = lastScrollPosition < elementScrollPosition; // evaluate direction
        lastScrollPosition = elementScrollPosition; // Store last scroll position for reference.

        if (remainingToBottom >= 0 && remainingToBottom <= elementHeight * nearingCoefficientToEdge) {
          // At the bottom or at lower half of the element.
          if (stoppedInNegativeScrollPosition && remainingToBottom > 0) {
            // Do nothing when stopped in negative scroll position and then scrolled towards the top.
            return;
          } else if (stoppedInNegativeScrollPosition) {
            // Stopped in negative position, add more items immediately.
            addMoreItemsToBottom();
            stoppedInNegativeScrollPosition = false;  // Clear state variable.
            return;
          }
          if ((scrollingDown || cameFromNegativePosition) && !bottomVerificationTimer) {
            // Start verification timer when scrolling down or came from negative scroll position,
            // e.g from momentum scrolling.
            startBottomVerificationTimer();
          }
        } else {
          if (remainingToBottom < 0) {
            // Came from negative position, e.g from momentum scrolling or intentionally.
            cameFromNegativePosition = true;
            if (!negativeHoldPositionTimer) {
              // Determine, whether user stayed in negative scroll position.
              startNegativeHoldPositionTimer();
            }
          }
          else if (!scrollingDown && (remainingToBottom >= elementHeight * removeCoefficientToEdge)) {
            // Call remove method when distance to edge is smaller than the safe zone
            // and when scroll direction is up.
            removeItemsFromBottom();
          }
          if (bottomVerificationTimer) {
            // Clear verification timer and state variables.
            clearTimeout(bottomVerificationTimer);
            bottomVerificationTimer = undefined;
          }
        }
      }

      var allowListModifyDeferred;

      function addMoreItemsToBottom(){

        function doAddMoreItemsToBottom(){
          var limit, duplicateListData;

          if (scope.maximumNumberOfItems + scope.itemIncreaseAmount >= filteredFullArrayLength)
            limit = filteredFullArrayLength - scope.maximumNumberOfItems;
          else
            limit = scope.currentListStartIndex + scope.itemIncreaseAmount;

          setLimits(limit);

          if (scope.listOptions.duplicate) {
            duplicateListData = controllers[0].getDuplicateListData(scope.listOptions.id);
            if (duplicateListData) {
              duplicateListData.setLimits(limit);
              duplicateListData.updateUI();
            }
          }
        }

        var filteredFullArrayLength = scope.getFilteredFullArrayLength();
        if ((filteredFullArrayLength - scope.currentListStartIndex) > scope.maximumNumberOfItems) {
          if (preventListModify) {
            // List modifying is prevented.
            allowListModifyDeferred = $q.defer();
            allowListModifyDeferred.promise.then(function() {
              // List modifying is allowed again.
              doAddMoreItemsToBottom(filteredFullArrayLength);
              allowListModifyDeferred = undefined;
            });
          } else {
            // Ok to to add more items.
            doAddMoreItemsToBottom(filteredFullArrayLength);
            if (!$rootScope.$$phase && !scope.$$phase) scope.$digest(); // Update UI.
          }
        }
      }

      function removeItemsFromBottom(){
        function doRemoveItemsFromBottom(){
          if (scope.currentListStartIndex <= scope.itemIncreaseAmount) {
            setLimits(0);
          } else {
            setLimits(scope.currentListStartIndex - scope.itemIncreaseAmount);
          }
        }

        if (scope.currentListStartIndex !== 0 && !preventListModify) {
          // Ok to remove items.
          doRemoveItemsFromBottom();
          if (!scope.$$phase && !$rootScope.$$phase) scope.$digest(); // Update UI.
        }
      }

      function setLimits(startIndex){
        scope.currentListStartIndex = startIndex;
        if (scope.disableLoading){
          scope.currentListLimitTo = scope.getFilteredFullArrayLength();
        }else{
          scope.currentListLimitTo = scope.maximumNumberOfItems + scope.currentListStartIndex;
        }
        if (startIndex === 0) {
          scope.currentListStartIndexLimit = scope.currentListLimitTo;
        } else {
          scope.currentListStartIndexLimit = -startIndex;
        }
        setIsNearListBottom();
      }

      function setIsNearListBottom() {
        if (scope.currentListLimitTo >= scope.getFilteredFullArrayLength()) {
          if (angular.isFunction(scope.isNearListBottomCallback)) {
            scope.isNearListBottomCallback(false);
          }
        } else if (scope.getFilteredFullArrayLength()) {
          if (angular.isFunction(scope.isNearListBottomCallback)) {
            scope.isNearListBottomCallback(true);
          }
        }
      }

      scope.$on('$destroy', function() {
        if (controllers[1] && !scope.listOptions.slidePollingDisabled)
          controllers[1].unregisterSlideActiveCallback('listDirective');
        scrollElement.removeEventListener('scroll', listScroll, false);
      });
    }
  };
}
listDirective['$inject'] = ['$parse', '$q', '$rootScope', '$timeout', 'UISessionService'];
angular.module('em.base').directive('list', listDirective);

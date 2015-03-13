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
 /*jshint -W008 */

 function listDirective($parse, $q, $rootScope, $timeout, UISessionService) {
  return {
    require: ['^listContainer', '?^swiperSlide'],
    restrict: 'A',
    scope: true,
    controller: ['$scope', '$element', '$attrs', function($scope, $element, $attrs) {
      $scope.listInfos = {};

      var listArrayFn = $parse($attrs.list);
      $scope.getFullArray = function(){
        return listArrayFn($scope);
      };

      $scope.getVisibleArray = function(getFullArrayFn, limitTo) {
        var fullArray = getFullArrayFn();
        if (fullArray) {
          if (customFilterItemVisible) {
            $scope.listInfos.array = customFilterItemVisible(fullArray);  // Cache filtered full array
            return $scope.listInfos.array.slice(0, limitTo);
          }

          $scope.listInfos.array = fullArray; // Cache filtered full array
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

      this.registerAddActiveCallback = function(callback){
        $scope.activateAddItem = callback;
      };

      this.notifyListItemAddActive = function(active) {
        $scope.listItemAddActive = active;
      };

      this.notifyListItemAdd = function(){
        if ($scope.onboardingInProgress) {
          $scope.setOnboardingListItemAddActive(false);
          return true;
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

      this.registerGetBottomElementHeight = function(callback) {
        $scope.getBottomElementHeight = callback;
      };

      var checkingTimeout;
      this.toggleLeftCheckbox = function(item, toggleFn) {

        var checkboxCheckingReadyDeferred = $q.defer();
        var checked = toggleFn(item, checkboxCheckingReadyDeferred);

        if (checked) {
          checkingTimeout = $timeout(function() {
            UISessionService.allow('leaveAnimation', 200);
            checkboxCheckingReadyDeferred.resolve(item);
            if (!$scope.$$phase && !$rootScope.$$phase) $scope.$digest();
          }, $rootScope.CHECKBOX_CHECKING_ANIMATION_TIME);
        } else{
          if (checkingTimeout){
            $timeout.cancel(checkingTimeout);
            checkingTimeout = undefined;
          }
          checkboxCheckingReadyDeferred.resolve(item);
        }
      };
    }],
    link: function(scope, element, attrs, controllers) {
      var listOpenOnAddFn;
      if (attrs.listOpen){
        listOpenOnAddFn = $parse(attrs.listOpen).bind(undefined, scope);
      }

      var listLockedCallback;
      if (attrs.listLocked) {
        listLockedCallback = $parse(attrs.listLocked).bind(undefined, scope);
      }

      controllers[0].registerGetFullArrayFn(scope.getFullArray);

      function activateListAdd() {
        if (listOpenOnAddFn){
          // Execute open function
          listOpenOnAddFn();
        } else if (scope.activateAddItem) {
          if (scope.onboardingInProgress) scope.setOnboardingListItemAddActive(true);
          scope.activateAddItem();
        }
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

      function listActive(){
        controllers[0].registerActivateAddListItemCallback(activateListAdd, element);

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

        if (!attrs.listBounded) {
          var elementHeight = element[0].offsetHeight;
          var elementScrollHeight = element[0].scrollHeight;
          var elementScrollPosition, remainingToBottom;

          if (elementHeight !== elementScrollHeight) {
            // Item has scrollable content
            elementScrollPosition = element[0].scrollTop;
            remainingToBottom = elementScrollHeight - elementScrollPosition - elementHeight;

            if (remainingToBottom === 0) {
              // At the bottom, load more.
              preventListModify = false;  // Clear state variable when returning to bottom of the list.
              addMoreItemsToBottom();
            }
          }
          // Did we return into list that has been scrolled near the bottom.
          setIsNearListBottom();
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

      if (controllers[1]){
        controllers[1].registerSlideActiveCallback(listActive, 'listDirective');
        if (controllers[1].isSlideActiveByDefault()){
          listActive();
        }
        if (!attrs.listBounded) {
          controllers[1].registerSlideMovementCallback(listMoved, 'listDirective');
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
            element[0].scrollTop = 0;
          });
        }
      };

      // INFINITE SCROLL

      if (attrs.listBounded) {
        element[0].addEventListener('scroll', listScrollUp, false);

        scope.addMoreItems = function() {
          addMoreItemsToBottom();
        };
      } else {
        element[0].addEventListener('scroll', listScroll, false);
      }

      // Coefficient of container height, which specifies when add more is called.
      var removeCoefficientToEdge = 3;
      var nearingCoefficientToEdge = .5;
      var lastScrollPosition = 0;
      var bottomVerificationTimer;

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
          var elementHeight = element[0].offsetHeight;
          var elementScrollHeight = element[0].scrollHeight;
          var elementScrollPosition = element[0].scrollTop;
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
        var elementHeight = element[0].offsetHeight;
        var elementScrollHeight = element[0].scrollHeight;
        var elementScrollPosition = element[0].scrollTop;
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

      function listScrollUp(/*event*/){
        // get scroll position
        var elementHeight = element[0].offsetHeight;
        var elementScrollHeight = element[0].scrollHeight;
        var elementScrollPosition = element[0].scrollTop;
        var remainingToBottom = elementScrollHeight - elementScrollPosition - elementHeight;

        if (angular.isFunction(scope.getBottomElementHeight)) {
          // Subtract bottom element height from remainingToBottom.
          remainingToBottom -= scope.getBottomElementHeight();
        }
        var scrollingDown = lastScrollPosition < elementScrollPosition; // evaluate direction
        lastScrollPosition = elementScrollPosition; // Store last scroll position for reference.

        if (!scrollingDown && (remainingToBottom >= elementHeight * 1.5)) {
          // Call remove method when distance to edge is smaller than the safe zone
          // and when scroll direction is up.
          removeItemsFromBottom();
        }
      }

      var allowListModifyDeferred;

      function addMoreItemsToBottom(){

        function doAddMoreItemsToBottom(){
          if (scope.maximumNumberOfItems + scope.itemIncreaseAmount >= filteredFullArrayLength) {
            setLimits(filteredFullArrayLength - scope.maximumNumberOfItems);
          } else {
            setLimits(scope.currentListStartIndex + scope.itemIncreaseAmount);
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

      // TODO:  Max number and increase amount should be calculated based on the height of the
      //        container and the height of individual elements in the list.
      scope.maximumNumberOfItems = attrs.listBounded ? 10 : 25;
      scope.itemIncreaseAmount = attrs.listBounded ? 10 : 25;
      setLimits(0);
      function setLimits(startIndex){
        scope.currentListStartIndex = startIndex;
        scope.currentListLimitTo = scope.maximumNumberOfItems + scope.currentListStartIndex;

        if (startIndex === 0) {
          scope.currentListStartIndexLimit = scope.currentListLimitTo;
        } else {
          scope.currentListStartIndexLimit = -startIndex;
        }
        setIsNearListBottom();
      }

      function setIsNearListBottom() {
        if (scope.currentListLimitTo >= scope.getFilteredFullArrayLength()) {
          if (angular.isFunction(scope.isNearListBottomCallback)) scope.isNearListBottomCallback(false);
        } else if (scope.getFilteredFullArrayLength()) {
          if (angular.isFunction(scope.isNearListBottomCallback)) scope.isNearListBottomCallback(true);
        }
      }

      scope.$on('$destroy', function() {
        if (controllers[1]) controllers[1].unregisterSlideActiveCallback('listDirective');
        element[0].removeEventListener('scroll', listScroll, false);
      });
    }
  };
}
listDirective['$inject'] = ['$parse', '$q', '$rootScope', '$timeout', 'UISessionService'];
angular.module('em.base').directive('list', listDirective);

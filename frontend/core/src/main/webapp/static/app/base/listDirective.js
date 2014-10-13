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

 function listDirective($parse, $q, $rootScope, $timeout, UISessionService) {
  return {
    require: ['^listContainer', '?^swiperSlide'],
    restrict: 'A',
    scope: true,
    controller: function($scope) {
      this.registerAddActiveCallback = function(callback){
        $scope.activateAddItem = callback;
      }
      this.notifyListLength = function(length){
        $scope.listLength = length;
      }

      var checkingTimeout;
      this.toggleLeftCheckbox = function(item, toggleFn, element) {

        var checkboxCheckingReadyDeferred = $q.defer();
        var checked = toggleFn(item, checkboxCheckingReadyDeferred);

        if (checked) {
          checkingTimeout = $timeout(function() {
            checkboxCheckingReadyDeferred.resolve(item);
            $scope.$digest();
          }, $rootScope.CHECKBOX_CHECKING_ANIMATION_TIME);
        } else{
          if (checkingTimeout){
            $timeout.cancel(checkingTimeout);
            checkingTimeout = undefined;
          }
          checkboxCheckingReadyDeferred.resolve(item);
        };
      };

    },
    link: function(scope, element, attrs, controllers) {

      var listOpenOnAddFn;
      if (attrs.listOpen){
        listOpenOnAddFn = $parse(attrs.listOpen).bind(undefined, scope);
      }

      function activateListAdd() {
        if (listOpenOnAddFn){
          // Execute open function
          listOpenOnAddFn();
        }else if (scope.activateAddItem){
          if (attrs.list !== 'top'){
            if (activateListBottom()){
              // The entire list was not visible, we
              // have to wait for digest to complete for focus to move to the
              // bottom. Can't think of a better way to do this, can you?
              $timeout(function(){
                scope.activateAddItem();
              });
              return;
            }
          }
          scope.activateAddItem();
        }
      }
      function listActive(){
        controllers[0].registerActivateAddListItemCallback(activateListAdd);
      }
      if (controllers[1]){
        controllers[1].registerSlideActiveCallback(listActive);
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
        if (attrs.list === 'top' && promise && promise.then){
          promise.then(function(){
            element[0].scrollTop = 0;
          })
        }
      }


      // INFINITE SCROLL

      element[0].addEventListener('scroll', listScroll, false);

      // Coefficient of container height, which specifies when add more
      // is called.
      var addMoreCoefficientToEdge = 1.5;
      var lastScrollPosition = 0;

      function listScroll(event){

        // get scroll position
        var elementHeight = element[0].offsetHeight;
        var elementScrollHeight = element[0].scrollHeight;
        var elementScrollPosition = element[0].scrollTop;
        var remainingToBottom = elementScrollHeight - elementScrollPosition;
        var remainingToTop = elementScrollHeight - remainingToBottom;

        // evaluate direction
        var scrollingDown = true;
        if (lastScrollPosition > elementScrollPosition){
          scrollingDown = false;
        }
        lastScrollPosition = elementScrollPosition;

        // call add methods if distance to edge is smaller than the safe zone
        if (scrollingDown && (remainingToBottom <= elementHeight * addMoreCoefficientToEdge)) {
          addMoreItemsToBottom();
        }else if (!scrollingDown && (remainingToBottom > elementHeight * addMoreCoefficientToEdge)) {
          removeItemsFromBottom();
        }
      }

      // TODO: Max number and increase amount should be calculated based on the height of the
      // container and the height of individual elements in the list.
      scope.maximumNumberOfItems = 25;
      scope.itemIncreaseAmount = 10;
      setLimits(0);
      function setLimits(startIndex){
        scope.currentListStartIndex = startIndex;
        scope.currentListLimitTo = scope.maximumNumberOfItems + scope.currentListStartIndex;

        if (startIndex === 0){
          scope.currentListStartIndexLimit = scope.currentListLimitTo;
        }else{
          scope.currentListStartIndexLimit = -startIndex;
        }

        // issue a 500ms lock to prevent leave animation for this digest cycle
        // see listItemDirective => animation
        UISessionService.lock('leaveAnimation', 500);
      }

      function activateListBottom() {
        if (scope.listLength - scope.maximumNumberOfItems > 0){
          setLimits(scope.listLength - scope.maximumNumberOfItems);
          return true;
        }
      }

      function addMoreItemsToBottom(){
        function doAddMoreItemsToBottom(){

          if (scope.maximumNumberOfItems + scope.itemIncreaseAmount >= scope.listLength){
            setLimits(scope.listLength - scope.maximumNumberOfItems);
          }else{
            setLimits(scope.currentListStartIndex + scope.itemIncreaseAmount);
          }
        }
        if ((scope.listLength - scope.currentListStartIndex) > scope.maximumNumberOfItems){
          if (scope.$$phase) {
            doAddMoreItemsToBottom();
          } else {
            scope.$apply(doAddMoreItemsToBottom);
          }
        }
      }

      function removeItemsFromBottom(){
        function doRemoveItemsFromBottom(){
          if (scope.currentListStartIndex <= scope.itemIncreaseAmount){
            setLimits(0);
          }else{
            setLimits(scope.currentListStartIndex - scope.itemIncreaseAmount);
          }
        }

        if (scope.currentListStartIndex !== 0){
          if (scope.$$phase) {
            doRemoveItemsFromBottom();
          } else {
            scope.$apply(doRemoveItemsFromBottom);
          }
        }
      }

      scope.$on('$destroy', function() {
        if (controllers[1]) controllers[1].unregisterSlideActiveCallback();
        element[0].removeEventListener('scroll', listScroll, false);
      });
    }
  };
}
listDirective['$inject'] = ['$parse', '$q', '$rootScope', '$timeout', 'UISessionService'];
angular.module('em.base').directive('list', listDirective);

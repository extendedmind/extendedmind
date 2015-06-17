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

 function listContainerDirective() {
  return {
    restrict: 'A',
    require: ['^verticalResize', '?^swiperSlide'],
    controller: ['$scope', '$element', '$attrs', '$parse', function($scope, $element, $attrs, $parse) {
      var activateAddListItemCallback;
      var notifyListAddFeatureCallback;
      var listAddFeatureInfo;
      var listAddSubfeature;

      this.registerActivateAddListItemCallback = function(callback, element){
        activateAddListItemCallback = callback;
        if ($attrs.listContainerOverrideVerticalResize)
          $scope.registerOverrideElement(element);
      };

      this.registerNotifyListAddFeatureCallback = function(callback){
        notifyListAddFeatureCallback = callback;
        // If nofity came before registering, notify right away
        if (listAddFeatureInfo) notifyListAddFeatureCallback(listAddFeatureInfo, listAddSubfeature);
      };

      this.notifyListAddFeature = function(featureInfo, subfeature){
        if (notifyListAddFeatureCallback) notifyListAddFeatureCallback(featureInfo, subfeature);
        else {
          listAddFeatureInfo = featureInfo;
          listAddSubfeature = subfeature;
        }
      };

      var isReadOnlyFn;
      if ($attrs.listContainerReadonly !== undefined)
        isReadOnlyFn = $parse($attrs.listContainerReadonly);
      $scope.isListAddDisabled = function(){
        if (isReadOnlyFn){
          return isReadOnlyFn($scope);
        }
      };

      this.activateAddListItem = function(){
        if ($attrs.listContainerOverrideVerticalResize){
          // Re-register just in case list container active has not fired
          $scope.registerOverrideElement();
        }
        if (activateAddListItemCallback) activateAddListItemCallback();
      };

      this.registerGetFullArrayFn = function(getArrayFn) {
        this.getFullArrayFn = getArrayFn;
      };

      var lengthChangeWatcher;
      this.registerLengthChangeWatcher = function(getWatcherFn) {
        if (lengthChangeWatcher) {
          // Unbind existing watcher.
          lengthChangeWatcher();
        }
        lengthChangeWatcher = getWatcherFn();
      };

      var getDuplicateListData = {};
      this.registerGetDuplicateListData = function(getterFn, duplicateOfListPath) {
        getDuplicateListData[duplicateOfListPath] = getterFn;
      };

      this.getDuplicateListData = function(listPath) {
        if (getDuplicateListData && getDuplicateListData[listPath])
          return getDuplicateListData[listPath]();
      };

    }],
    compile: function compile() {
      return {
        pre: function preLink(scope, element, attrs, controllers) {
          var overrideElement;
          scope.registerOverrideElement = function(elem) {
            if (elem) overrideElement = elem;
            if (overrideElement) controllers[0].overrideVerticalResize(overrideElement);
          };

          function listContainerActive(){
            if (!attrs.listContainerOverrideVerticalResize){
              controllers[0].clearOverrideElement();
            }else {
              controllers[0].overrideVerticalResize(overrideElement);
            }
          }
          if (controllers[1]){
            controllers[1].registerSlideActiveCallback(listContainerActive, 'listContainerDirective');
            if (controllers[1].isSlideActiveByDefault()){
              listContainerActive();
            }
          }else {
            // List is active as it doesn't have a swiper to begin with
            listContainerActive();
          }

          scope.$on('$destroy', function() {
            controllers[0].clearOverrideElement();
            if (controllers[1]) controllers[1].unregisterSlideActiveCallback('listContainerDirective');
          });
        }
      };
    }
  };
}
angular.module('em.base').directive('listContainer', listContainerDirective);

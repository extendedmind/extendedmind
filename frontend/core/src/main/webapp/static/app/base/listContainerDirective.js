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

 function listContainerDirective() {
  return {
    restrict: 'A',
    require: '?^verticalResize',
    controller: function($scope, $element, $attrs) {
      var activateAddListItemCallback;

      var overrideVerticalResize = $attrs.listContainerOverrideVerticalResize;

      this.registerCallbacks = function(activateCallback, resizeCallback, element){
        activateAddListItemCallback = activateCallback;
        $scope.verticallyResizedCallback = resizeCallback;
        if (overrideVerticalResize) $scope.registerOverrideElement(element);
      };

      this.activateAddListItem = function(){
        if (activateAddListItemCallback) activateAddListItemCallback();
      };


    },
    compile: function compile() {
      return {
        pre: function preLink(scope, element, attrs, verticalResizeController) {
          scope.registerOverrideElement = function(overrideElement) {
            if (verticalResizeController)
              verticalResizeController.overrideVerticalResize(overrideElement);
          };

          function verticallyResized(){
            if (scope.verticallyResizedCallback) scope.verticallyResizedCallback();
          }

          if (verticalResizeController){
            verticalResizeController.registerResizedCallback(verticallyResized, element);
          }

          scope.$on('$destroy', function() {
            if (verticalResizeController) verticalResizeController.clearOverrideElement();
            if (verticalResizeController) verticalResizeController.unregisterResizedCallback(element);
          });
        }
      };
    }
  };
}
angular.module('em.base').directive('listContainer', listContainerDirective);

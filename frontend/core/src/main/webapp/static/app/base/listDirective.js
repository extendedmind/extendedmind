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

 function listDirective() {
  return {
    require: ['^listContainer', '?^swiperSlide'],
    restrict: 'A',
    scope: true,
    controller: function($scope) {
      this.registerAddActiveCallback = function(callback){
        $scope.addActiveCallback = callback;
      }
    },
    link: function(scope, element, attrs, controllers) {
      function activateListAdd() {
        if (scope.addActiveCallback) scope.addActiveCallback();
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

      scope.$on('$destroy', function() {
        if (controllers[1]) controllers[1].unregisterSlideActiveCallback();
      });
    }
  };
}
angular.module('em.base').directive('list', listDirective);

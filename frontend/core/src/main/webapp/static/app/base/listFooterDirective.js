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

 function listFooterDirective($filter, $parse, $rootScope) {
  return {
    require: ['^listContainer', '?^swiperSlide'],
    restrict: 'A',
    templateUrl: $rootScope.urlBase + 'app/base/listFooter.html',
    scope: true,
    link: function(scope, element, attrs, controllers){
      scope.featureInfo = $parse(attrs.listFooter)(scope);
      var subfeature = attrs.listFooterSubfeature;
      scope.addItem = function(){
        controllers[0].activateAddListItem(scope.featureInfo, subfeature);
      };

      function trimNavigationText(text){
        if (text.length > 12){
          return text.substring(0, 10) + '\u2026';
        }else return text;
      }

      function isSlideDisabled(slidePath){
        var tokenizedPath = slidePath.split('/');
        if (tokenizedPath.length > 0){
          if (scope.featureInfo.getStatus(tokenizedPath[1]) === 'disabled'){
            return true;
          }
        }
      }

      if (controllers[1]){
        var currentSlidePath = controllers[1].getSlidePath();
        scope.navigationAction = controllers[1].swipeToSibling;

        if (scope.featureInfo.slides.left.path === currentSlidePath){
          // Leftmost slide
          if (scope.featureInfo.slides.middle && !isSlideDisabled(scope.featureInfo.slides.middle.path)){
            scope.rightNavigationText = scope.featureInfo.slides.middle.heading;
            scope.rightNavigationActionParameter = scope.featureInfo.slides.middle.path;
          }else if (!isSlideDisabled(scope.featureInfo.slides.right.path)){
            scope.rightNavigationText = scope.featureInfo.slides.right.heading;
            scope.rightNavigationActionParameter = scope.featureInfo.slides.right.path;
          }
        }else if (scope.featureInfo.slides.middle &&
                  scope.featureInfo.slides.middle.path === currentSlidePath){
          // Middle slide
          if (!isSlideDisabled(scope.featureInfo.slides.left.path)){
            scope.leftNavigationText = scope.featureInfo.slides.left.heading;
            scope.leftNavigationActionParameter = scope.featureInfo.slides.left.path;
          }
          if (!isSlideDisabled(scope.featureInfo.slides.right.path)){
            scope.rightNavigationText = trimNavigationText(scope.featureInfo.slides.right.heading);
            scope.$watch('featureInfo.slides.right.heading', function(newValue) {
              scope.rightNavigationText = trimNavigationText(newValue);
            });
            scope.rightNavigationActionParameter = scope.featureInfo.slides.right.path;
          }

        }else if (scope.featureInfo.slides.right.path === currentSlidePath){
          // Rightmost slide
          if (scope.featureInfo.slides.middle && !isSlideDisabled(scope.featureInfo.slides.middle.path)){
            scope.leftNavigationText = scope.featureInfo.slides.middle.heading;
            scope.leftNavigationActionParameter = scope.featureInfo.slides.middle.path;
          }else if (!isSlideDisabled(scope.featureInfo.slides.left.path)){
            scope.leftNavigationText = scope.featureInfo.slides.left.heading;
            scope.leftNavigationActionParameter = scope.featureInfo.slides.left.path;
          }
        }
      }

      // FOOTER ACTIONS
      if (scope.featureInfo.sortable) {
        var sortableArray = controllers[0].getFullArrayFn();
        scope.leftActionText = scope.featureInfo.sortable.heading;

        scope.leftAction = function() {
          var param = $filter('orderBy')(sortableArray, 'trans.created', true);
          scope.featureInfo.sortable.action(param, scope.featureInfo.sortable.actionParam);
        };
      }

      scope.isLeftActionActive = function() {
        return scope.featureInfo.sortable && sortableArray && sortableArray.length;
      };
    }
  };
}
listFooterDirective['$inject'] = ['$filter', '$parse', '$rootScope'];
angular.module('em.base').directive('listFooter', listFooterDirective);

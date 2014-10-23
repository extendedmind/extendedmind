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

 function editorFooterDirective($animate, $parse, $rootScope) {
  var footerHeight = 44;
  var expandedFooterHeight = 179;
  return {
    restrict: 'A',
    scope: true,
    link: function(scope, element, attrs) {
      var containerInfos = $parse(attrs.editorFooter)(scope);
      containerInfos.footerHeight = element[0].offsetHeight;

      var expandPromise, shrinkPromise;

      scope.closeExpand = function() {
        // Reset container's padding-bottom to default footer height before animation so that the backside
        // of expanded footer is not blank.
        containerInfos.footerHeight = footerHeight;

        // Start shrink animation.
        shrinkPromise = $animate.removeClass(element, 'animate-editor-footer-open').then(function() {

          // Set footer height and bottom to default values.
          element[0].style.height = footerHeight + 'px';
          element[0].style.bottom = 0;

          if (!$rootScope.$$phase && !scope.$$phase)
            scope.$apply(function(){
              scope.footerExpanded = false; // remove expandable DOM
            });
          else {
            scope.footerExpanded = false; // remove expandable DOM
          }
          shrinkPromise = undefined;
        });

      };

      scope.openExpand = function() {
        scope.footerExpanded = true;
        // Footer expands so it needs new height and bottom.
        element[0].style.height = expandedFooterHeight + 'px';
        element[0].style.bottom = -(expandedFooterHeight - footerHeight) + 'px';


        // Start expand animation.
        expandPromise = $animate.addClass(element, 'animate-editor-footer-open').then(function() {

          // Shrink promise exists if footer is shrinked before it is fully expanded. In that case,
          // this resolve callback is more like a rejection so let's do nothing here and let shrink promise
          // do its thing instead.
          if (!shrinkPromise) {
            // No shrink promise -> footer expanded.

            scope.$apply(function() {
              // Set padding-bottom for container to make content scrollable.
              containerInfos.footerHeight = expandedFooterHeight;
            });
          }
          expandPromise = undefined;
        });

      };
    }
  };
}
editorFooterDirective['$inject'] = ['$animate', '$parse', '$rootScope'];
angular.module('em.base').directive('editorFooter', editorFooterDirective);

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

 function accordionTitleLinkDirective(packaging) {
  return {
    require: '^accordion',  // We need this directive to be inside an accordion
    restrict: 'A',          // It will be an attribute
    scope: {
      titleLength: '=accordionTitleLink',
      boldTitle: '=accordionTitleLinkBold'
    },
    link: function postLink(scope, element, attrs, accordionCtrl) {

      var accordionTitleLinkWidth;
      if (!scope.boldTitle) {
        accordionTitleLinkWidth = accordionCtrl.getTitleLinkElementWidth();
        if (!accordionTitleLinkWidth) {
          scope.$evalAsync(function() {
            accordionTitleLinkWidth = element.parent().innerWidth();
            accordionCtrl.getTitleLinkElementWidth(accordionTitleLinkWidth);
            addClasses();
          });
        }
      } else {
        // Can't use cached value for bold titles
        scope.$evalAsync(function() {
          accordionTitleLinkWidth = element.parent().innerWidth();
          addClasses();
        });
      }

      function addClasses() {
        if (isTitleOnTwoLines(accordionTitleLinkWidth)) {
          var classes = 'ellipsis';
          if (packaging === 'ios-cordova') {
            classes += ' needsSmallPadding';
          } else {
            classes += ' needsBigPadding';
          }
          element.parent().addClass(classes);
        }
      }

      function isTitleOnTwoLines(width) {
        if (!scope.boldTitle) {
          if (scope.titleLength * 5.4 > width) {
            return true;
          }
        } else {
          // Bold titles
          if (scope.titleLength * 8 > width) {
            return true;
          }
        }
      }

    }
  };
}
accordionTitleLinkDirective['$inject'] = ['packaging'];
angular.module('em.base').directive('accordionTitleLink', accordionTitleLinkDirective);

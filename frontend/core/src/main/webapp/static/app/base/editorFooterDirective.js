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

 function editorFooterDirective($animate, $document, $parse, $rootScope, $timeout, packaging) {
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


      function startFooterExpandAnimation() {
        // Footer expands so it needs new height and bottom.
        element[0].style.height = expandedFooterHeight + 'px';
        element[0].style.bottom = -(expandedFooterHeight - footerHeight) + 'px';
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
        // Need to digest ot be sure that class is applied
        if (!$rootScope.$$phase && !scope.$$phase){
          scope.$digest();
        }
      }

      scope.openExpand = function() {
        if (!scope.footerExpanded){
          scope.footerExpanded = true;
          startFooterExpandAnimation();
        }
      };

      scope.toggleExpand = function() {
        if (scope.footerExpanded){
          scope.closeExpand();
        }else {
          scope.openExpand();
        }
      };

      // iOS hack: when keyboard is up, later icon does not open expanded area. To get around this
      // we use a long enough timetout for the keyboard to get hidden, and after that, open the
      // expand area.
      function iOSEditorFooterTouchStart(){
        // First stop touch start from getting anywhere else to prevent ghost clicks to
        // textarea below footer
        event.preventDefault();
        event.stopPropagation();
      }

      function iOSEditorFooterTouchEnd(){
        function doProcessTouchEnd(touchEndEvent){
          // First, blur active element
          var blurredActiveElement = false;
          if ($document[0].activeElement &&
              ($document[0].activeElement.nodeName === 'TEXTAREA' ||
               $document[0].activeElement.nodeName === 'INPUT'))
          {
            $document[0].activeElement.blur();
            blurredActiveElement = true;
          }

          // After that, do the action where the click hit
          if (!scope.footerExpanded && touchEndEvent.target.id.startsWith('editorFooterExpand')){
            // If the touch hit the expand icon while keyboard was up,
            // first wait for the resize animation to end
            if (blurredActiveElement){
              $timeout(function(){
                scope.openExpand();
              }, 150);
            }else{
              scope.openExpand();
            }
            touchEndEvent.preventDefault();
            touchEndEvent.stopPropagation();
          }else if (touchEndEvent.target.nodeName === 'A'){
            // Execute the action of the touchend link target.
            // NOTE:  Vanilla JS click() is not working for the first time.
            //        Wrapping click into angular $digest cycle printed error message:
            //          'Can only call HTMLElement.click on instances of HTMLElement'
            //        So wrap element into angular element first and use jqLite click()
            angular.element(touchEndEvent.target.parentElement).click();
          }else if (touchEndEvent.target.nodeName === 'SPAN' &&
                    touchEndEvent.target.parentElement.nodeName === 'A'){
            // Execute the action of the touchend target parent link.
            angular.element(touchEndEvent.target.parentElement).click();
          }else if (touchEndEvent.target.nodeName === 'SPAN' &&
                    touchEndEvent.target.parentElement.nodeName === 'SPAN' &&
                    touchEndEvent.target.parentElement.parentElement.nodeName === 'A'){
            // Execute the action of the touchend target grandparent link.
            angular.element(touchEndEvent.target.parentElement.parentElement).click();
          }else {
            // Touch hit somewhere else in the footer
            touchEndEvent.preventDefault();
            touchEndEvent.stopPropagation();
          }
        }
        if ($rootScope.$$phase || scope.$$phase){
          $timeout(function(){
            doProcessTouchEnd(event);
          });
        }else {
          doProcessTouchEnd(event);
        }
      }

      if (packaging === 'ios-cordova'){
        element[0].addEventListener('touchstart', iOSEditorFooterTouchStart);
        element[0].addEventListener('touchend', iOSEditorFooterTouchEnd);
      }
      scope.$on('$destroy', function() {
        if (packaging === 'ios-cordova'){
          element[0].removeEventListener('touchstart', iOSEditorFooterTouchStart);
          element[0].removeEventListener('touchend', iOSEditorFooterTouchEnd);
        }
      });
    }
  };
}
editorFooterDirective['$inject'] = ['$animate', '$document', '$parse', '$rootScope', '$timeout', 'packaging'];
angular.module('em.base').directive('editorFooter', editorFooterDirective);

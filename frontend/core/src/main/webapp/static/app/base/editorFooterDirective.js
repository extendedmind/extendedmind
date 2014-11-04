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
  var footerHeight = 44;  // NOTE: Match with @grid-vertical in LESS.
  return {
    restrict: 'A',
    scope: true,
    link: function(scope, element, attrs) {
      var expandedFooterMaxHeight = 135;  // Default expanded height. Used in task editor.
      var oldTranslateYPosition = 0;      // Default and previous translateY position.
      var expandPromise, shrinkPromise;   // Animation promises.
      var expandedHeightChangeWatcher;    // Attach watcher into variable to be able to unregister it.

      if (attrs.editorFooter) {
        // Delegate footer height info.
        var containerInfos = $parse(attrs.editorFooter)(scope);
        containerInfos.footerHeight = element[0].offsetHeight;
      }

      if (attrs.editorFooterExpandHeightChange) {
        // Height change callback function.
        var registerExpandedHeightChangeCallbackFn = $parse(attrs.editorFooterExpandHeightChange)(scope);
      }

      if (attrs.editorFooterToggledCallback) {
        // Toggled callback function.
        var editorFooterToggledCallbackFn = $parse(attrs.editorFooterToggledCallback)(scope);
      }

      scope.closeExpand = function() {
        // Reset container's padding-bottom to default footer height before animation so that the backside
        // of expanded footer is not blank.
        containerInfos.footerHeight = footerHeight;

        // Set footer height and bottom to default values.
        element[0].style.height = footerHeight + 'px';
        element[0].style.bottom = 0;

        // Remove animation class from opening.
        element[0].classList.remove('animate-editor-footer-open');

        // Start shrink animation.
        shrinkPromise = $animate.addClass(element, 'animate-editor-footer-close').then(function() {
          if (!$rootScope.$$phase && !scope.$$phase)
            scope.$apply(function(){
              scope.footerExpanded = false;   // Remove expandable DOM.
              scope.footerExpandOpen = false; // Footer is now closed.
            });
          else {
            scope.footerExpanded = false;   // Remove expandable DOM.
            scope.footerExpandOpen = false; // Footer is now closed.
          }
          shrinkPromise = undefined;
        });

        if (expandedHeightChangeWatcher) expandedHeightChangeWatcher(); // unregister watcher
        oldTranslateYPosition = 0; // Clear old Y position to default.
        element[0].classList.remove('expanded-one-row');  // Remove padding-bottom fix class.
      };

      function startFooterExpandAnimation(expandedHeight) {
        // Footer expands so it needs new height and bottom.
        element[0].style.height = expandedHeight + footerHeight + 'px';
        element[0].style.bottom = -expandedHeight + 'px';

        // Remove animation class from previous toggling.
        element[0].classList.remove('animate-editor-footer-close');
        element[0].classList.remove('animate-editor-footer-open');

        expandPromise = $animate.addClass(element, 'animate-editor-footer-open', {
          from: {
            transform: 'translate3d(0, ' + -oldTranslateYPosition + 'px' + ', 0)'
          },
          to: {
            transform: 'translate3d(0, ' + -expandedHeight + 'px, 0)'
          }
        }).then(function() {
          // Shrink promise exists if footer is shrinked before it is fully expanded. In that case,
          // this resolve callback is more like a rejection so let's do nothing here and let shrink promise
          // do its thing instead.
          if (!shrinkPromise) {
            // No shrink promise -> footer expanded.

            scope.$apply(function() {
              // Set padding-bottom for container to make content scrollable.
              containerInfos.footerHeight = expandedHeight + footerHeight;
              scope.footerExpandOpen = true;  // Footer is now opened.
            });
          }
          expandPromise = undefined;
        });
        // Need to digest ot be sure that class is applied
        if (!$rootScope.$$phase && !scope.$$phase){
          scope.$digest();
        }
        oldTranslateYPosition = expandedHeight;
      }

      scope.openExpand = function() {
        if (!scope.footerExpanded){
          scope.footerExpanded = true;  // Create element in the DOM.

          if (typeof registerExpandedHeightChangeCallbackFn === 'function') {
            // Set new expand height.
            expandedHeightChangeWatcher =
            registerExpandedHeightChangeCallbackFn(setNewExpandHeightAndStartAnimation);
          } else {
            // Expand to max height.
            startFooterExpandAnimation(expandedFooterMaxHeight);
          }
        }
      };

      scope.toggleExpand = function() {
        var expanded;
        if (scope.footerExpanded){
          expanded = false;
          scope.closeExpand();
        }else {
          expanded = true;
          scope.openExpand();
        }
        if (typeof editorFooterToggledCallbackFn === 'function')
          editorFooterToggledCallbackFn(expanded); // Inform about footer new state.
      };

      /*
      * There are three elements in a row, so divide elements in a container by three and round that upwards
      * to get the number of rows in a container.
      */
      function setNewExpandHeightAndStartAnimation(elementsInFirstContainer, elementsInSecondContainer) {
        var rowsInFirstContainer = Math.ceil(elementsInFirstContainer / 3);
        var firstContainerHeight = footerHeight * rowsInFirstContainer;

        var rowsInSecondContainer = Math.ceil(elementsInSecondContainer / 3);
        var secondContainerHeight = footerHeight * rowsInSecondContainer;

        var expandedHeight = firstContainerHeight + secondContainerHeight;

        if (expandedHeight > expandedFooterMaxHeight) {
          // Do not expand beyond max height.
          expandedHeight = expandedFooterMaxHeight;
        }
        startFooterExpandAnimation(expandedHeight);

        // Toggle padding-bottom with this class. When expanded only one row, area would have undesired scroll
        // due to padding-bottom.
        var expandedOneRow = rowsInFirstContainer + rowsInSecondContainer === 1;
        element[0].classList.toggle('expanded-one-row', expandedOneRow);
      }

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

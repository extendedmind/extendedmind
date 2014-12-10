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
      var expandedFooterMaxHeight = 156;  // Default expanded height. Used in task editor.
      var oldTranslateYPosition = 0;      // Default and previous translateY position.
      var currentExpandedFooterHeight;    // Current expanded footer height.
      var expandPromise, shrinkPromise;   // Animation promises.
      var expandedHeightChangeWatcher;    // Attach watcher into variable to be able to unregister it.

      scope.editorFooterHiddenCallback = function(hidden) {
        if (hidden && containerInfos.footerHeight !== 0) {
          // Store old footer height and set footer height temporarily to zero.
          containerInfos.oldFooterHeight = containerInfos.footerHeight;
          containerInfos.footerHeight = 0;
        } else if (!hidden && containerInfos.oldFooterHeight !== undefined &&
                   containerInfos.footerHeight !== containerInfos.oldFooterHeight)
        {
          // Reset footer height.
          containerInfos.footerHeight = containerInfos.oldFooterHeight;
        }
      };

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
        containerInfos.footerHeight = containerInfos.oldFooterHeight = footerHeight;

        // Set footer height and bottom to default values.
        element[0].style.height = footerHeight + 'px';
        element[0].style.bottom = 0;

        // Remove animation class from opening.
        element[0].classList.remove('animate-editor-footer-open');

        // Start shrink animation.
        shrinkPromise = $animate.addClass(element, 'animate-editor-footer-close', {
          // Remove flicker during open caused by leftover transform property in element style from previous
          // position.
          to: {
            transform: 'translate3d(0, 0, 0)' // Reset element style.
          }
        }).then(function() {
          if (!$rootScope.$$phase && !scope.$$phase)
            scope.$apply(function(){
              scope.footerExpanded = false;   // Remove expandable DOM.
              scope.footerExpandOpen = false; // Footer is now closed.
              scope.footerExpandedToMaxHeight = false;  // Reset variable.
            });
          else {
            scope.footerExpanded = false;   // Remove expandable DOM.
            scope.footerExpandOpen = false; // Footer is now closed.
            scope.footerExpandedToMaxHeight = false;  // Reset variable.
          }
          shrinkPromise = undefined;
        });

        if (expandedHeightChangeWatcher) expandedHeightChangeWatcher(); // unregister watcher
        oldTranslateYPosition = 0; // Clear old Y position to default.
        element[0].classList.remove('expanded-one-row');  // Remove padding-bottom fix class.
      };

      function startFooterExpand(expandedHeight, noAnimation) {
        // Footer expands so it needs new height and bottom.
        element[0].style.height = expandedHeight + footerHeight + 'px';
        element[0].style.bottom = -expandedHeight + 'px';

        // Remove animation class from previous toggling.
        element[0].classList.remove('animate-editor-footer-close');
        element[0].classList.remove('animate-editor-footer-open');

        var editorFooterOpenClass = 'animate-editor-footer-open';
        if (noAnimation) {
          // Prevent animation.
          editorFooterOpenClass += ' no-animate';
        }

        expandPromise = $animate.addClass(element, editorFooterOpenClass, {
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
              containerInfos.footerHeight = containerInfos.oldFooterHeight = expandedHeight + footerHeight;
              scope.footerExpandOpen = true;  // Footer is now opened.
            });
          }
          expandPromise = undefined;

          if (noAnimation) {
            element[0].classList.remove('no-animate');
          }
        });
        // Need to digest ot be sure that class is applied
        if (!$rootScope.$$phase && !scope.$$phase){
          scope.$digest();
        }
        oldTranslateYPosition = expandedHeight;
      }

      scope.openExpand = function(noAnimation) {
        if (!scope.footerExpanded){
          scope.footerExpanded = true;  // Create element in the DOM.

          if (typeof registerExpandedHeightChangeCallbackFn === 'function') {
            // Set new expand height.
            expandedHeightChangeWatcher =
            registerExpandedHeightChangeCallbackFn(setNewExpandHeightAndStartAnimation);
          } else {
            // Expand to max height.
            startFooterExpand(expandedFooterMaxHeight, noAnimation);
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

      scope.toggleExpandFooterToMaxHeight = function() {
        if (!scope.footerExpandedToMaxHeight) {
          scope.footerExpandedToMaxHeight = true;

          var maxPosition;
          if ($rootScope.currentHeight < $rootScope.CONTAINER_MASTER_MAX_HEIGHT) {
            // Set max position to current height.
            maxPosition = $rootScope.currentHeight;
          }
          else {
            // Set max position to max available height.
            maxPosition = $rootScope.CONTAINER_MASTER_MAX_HEIGHT;
          }

          // Decrease max position by footer height to make un-expandable part visible.
          maxPosition -= footerHeight;

          startFooterExpand(maxPosition);
        } else {
          scope.footerExpandedToMaxHeight = false;
          // Animate to previous position.
          startFooterExpand(currentExpandedFooterHeight);
        }
      };

      if (attrs.editorFooterStartExpanded !== undefined) {
        // Open on init, without animation.
        // NOTE: scope.openExpand is defined in run-time so it needs to be defined before calling it.
        scope.openExpand(true);
        // Register close callback when initially expanded.
        scope.registerEditorFooterCloseCallback(scope.closeExpand);
      }

      /*
      * There are three elements in a row, so divide elements in a container by three and round that upwards
      * to get the number of rows in a container.
      *
      * Second row is always present, so default it to one row.
      */
      function setNewExpandHeightAndStartAnimation(elementsInFirstContainer, elementsInSecondContainer) {
        var rowsInFirstContainer = Math.ceil(elementsInFirstContainer / 3);
        var firstContainerHeight = footerHeight * rowsInFirstContainer;

        var rowsInSecondContainer = Math.ceil(elementsInSecondContainer / 3) || 1;  // Default to one row.
        var secondContainerHeight = footerHeight * rowsInSecondContainer;

        var expandedHeight = firstContainerHeight + secondContainerHeight;

        if (expandedHeight > expandedFooterMaxHeight) {
          // Do not expand beyond max height.
          expandedHeight = expandedFooterMaxHeight;
        }
        startFooterExpand(expandedHeight);

        // Toggle padding-bottom with this class. When expanded only one row, area would have undesired scroll
        // due to padding-bottom.
        var expandedOneRow = rowsInFirstContainer + rowsInSecondContainer === 1;
        element[0].classList.toggle('expanded-one-row', expandedOneRow);
        currentExpandedFooterHeight = expandedHeight;
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
            angular.element(touchEndEvent.target).click();
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
            // FIXME: $timeout should not be needed since AngularJS version 1.2.24
            //        See: https://github.com/angular/angular.js/commit/54f0bc0fe0c6b6d974d23f2c5ef07359dd93eb99
            doProcessTouchEnd(event);
          });
        }else {
          doProcessTouchEnd(event);
        }
      }

      if (attrs.editorFooterIosClick !== undefined && packaging === 'ios-cordova'){
        element[0].addEventListener('touchstart', iOSEditorFooterTouchStart);
        element[0].addEventListener('touchend', iOSEditorFooterTouchEnd);
      }
      scope.$on('$destroy', function() {
        if (attrs.editorFooterIosClick !== undefined && packaging === 'ios-cordova'){
          element[0].removeEventListener('touchstart', iOSEditorFooterTouchStart);
          element[0].removeEventListener('touchend', iOSEditorFooterTouchEnd);
        }
      });
    }
  };
}
editorFooterDirective['$inject'] = ['$animate', '$document', '$parse', '$rootScope', '$timeout', 'packaging'];
angular.module('em.base').directive('editorFooter', editorFooterDirective);

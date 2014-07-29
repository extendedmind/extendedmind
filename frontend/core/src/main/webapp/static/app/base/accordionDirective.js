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

 /* global $ */
 'use strict';

// From:
// https://github.com/angular-app/Samples/tree/master/1820EN_10_Code/03_basic_accordion_directive

// The accordion directive simply sets up the directive controller
// and adds an accordion CSS class to itself element.
function accordionDirective($document) {
  return {
    restrict: 'A',
    controller: function($scope) {
      var accordionReady = false;
      var lastCallback;

      // This array keeps track of the accordion title scopes
      this.titleScopes = [];
      $scope.thisController = this;

      // Optional first element open method
      function openFirstElement(previousFirstItem) {
        if ($scope.thisController.titleScopes && $scope.thisController.titleScopes.length > 0) {
          $scope.thisController.titleScopes[0].openItem(previousFirstItem);
          if (!$scope.eventsBound) {
            bindElsewhereEvents();
          }
          return $scope.thisController.titleScopes[0].item;
        }
      }

      if ($scope.registerOpenFirstElementCallback) {
        $scope.registerOpenFirstElementCallback(openFirstElement);
      }

      // Ensure that all the items in this accordion are closed
      $scope.closedOtherItems = false;
      this.closeOthers = function closeOthers(activeScope) {
        $scope.closedOtherItems = false;
        angular.forEach(this.titleScopes, function(titleScope) {
          if ( titleScope !== activeScope ) {
            if (titleScope.closeItem()) {
              $scope.closedOtherItems = true;
            }
          }
        });
        $scope.openTitle = {
          item: activeScope.item,
          element: activeScope.getElement()
        };

        // This is called when accordion title is opened
        // so it's a good place to bind to start listening
        // on clicking elsewhere
        if (!$scope.eventsBound) {
          bindElsewhereEvents();
        }
        return $scope.closedOtherItems;
      };

      $scope.isOpen = function isOpen(item) {
        if ($scope.openTitle) {
          if ($scope.openTitle.item.uuid === item.uuid) {
            return true;
          }
        }
      };

      this.notifyFirst = function notifyFirst() {
        accordionReady = false;
      };

      this.notifyLast = function notifyLast() {
        accordionReady = true;
        if (lastCallback) lastCallback();
      };

      this.scrollToElement = function scrollToElement(element) {
        if (angular.isFunction($scope.scrollToElement)) {
          $scope.scrollToElement(element);
        }
      };

      $scope.scrollToOpenTitle = function scrollToOpenTitle() {
        if ($scope.openTitle) $scope.thisController.scrollToElement($scope.openTitle.element);
      };

      $scope.registerLastCallback = function registerLastCallback(callback) {
        lastCallback = callback;
      };

      // TITLE LINK HANDLING
      // Getting innerWidth is expensive so use this as a cache
      var titleLinkElementWidth;
      this.setTitleLinkElementWidth = function setTitleLinkElementWidth(width) {
        titleLinkElementWidth = width;
      };
      this.getTitleLinkElementWidth = function getTitleLinkElementWidth() {
        return titleLinkElementWidth;
      };

      // ACCORDION MANIPULATION

      function close(item, skipSave) {
        angular.forEach($scope.thisController.titleScopes, function(titleScope) {
          if (titleScope.item === item) {
            titleScope.closeItem(skipSave);
            $scope.openTitle = undefined;
            return;
          }
        });
      }

      $scope.closeAndCall = function closeInFn(item, itemAction) {
        close(item, true);
        itemAction(item);
      };

      // This is called from the accordion-title directive to add itself to the accordion
      this.addItem = function addItem(itemScope) {
        var that = this;
        $scope.thisController.titleScopes.push(itemScope);

        itemScope.$on('$destroy', function() {
          that.removeItem(itemScope);
        });
      };

      // This is called from the accordion-title directive when to remove itself
      this.removeItem = function removeItem(titleScope) {
        var index = this.titleScopes.indexOf(titleScope);
        if (index !== -1) {
          this.titleScopes.splice(this.titleScopes.indexOf(titleScope), 1);
        }
        if ($scope.itemRemoved) $scope.itemRemoved(titleScope.item);
      };

      $scope.$on('$destroy', function() {
        unbindElsewhereEvents();
      });

      // "Click elsewhere to close accordion"

      $scope.eventsBound = false;
      function unbindElsewhereEvents() {
        if ($scope.eventsBound) {
          $document.unbind('click', $scope.elsewhereCallback);
        }
        $scope.eventsBound = false;
      }

      function bindElsewhereEvents() {
        $document.bind('click', $scope.elsewhereCallback);
        $scope.eventsBound = true;
      }

      $scope.elsewhereCallback = function(event) {
        // First rule out clicking on link with a closed accordion
        if (!(!$scope.closedOtherItems && (event.target.id === 'accordionTitleLink' || event.target.id === 'accordionTitleLinkContent'))) {
          // If clicking elswehere than on the input or on an element that has as parent
          // the accordion-title, close accordion and unbind events.
          // NOTE: Class item-actions is needed to get clicking on buttons inside the
          //       accordion to work!
          if (($scope.closedOtherItems && (event.target.id === 'accordionTitleLink' ||
           event.target.id === 'accordionTitleLinkContent')) ||
           (!$(event.target).parents('.accordion-item-active').length &&
            !$(event.target).parents('.item-actions').length))
          {

            $scope.$apply(function() {
              angular.forEach($scope.thisController.titleScopes, function(titleScope) {
                titleScope.closeItem();
              });
              if ($scope.accordionClosed) $scope.accordionClosed();

              $scope.openTitle = undefined;
              unbindElsewhereEvents();
            });
          }
        }
      };
    },
    link: function postLink(scope, element) {
      element.addClass('accordion');
    }
  };
}
accordionDirective['$inject'] = ['$document'];
angular.module('em.directives').directive('accordion', accordionDirective);

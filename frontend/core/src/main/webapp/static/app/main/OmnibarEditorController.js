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

 function OmnibarEditorController($q, $rootScope, $scope, $timeout, DateService, UISessionService) {

  // INITIALIZE VARIABLES

  $scope.titlebar.text = "";
  $scope.searchText = {};

  // SAVING

  $scope.saveOmnibarToItem = function() {
    var item = {title: $scope.titlebar.text};
    $scope.deferEdit().then(function() {
      $scope.saveItem(item);
    });
  };

  // TITLEBAR

  $scope.omnibarTitlebarTextKeyDown = function (keydownEvent) {
    // Escape
    if (keydownEvent.keyCode === 27){
      $scope.closeEditor();
    }
    // Return
    else if (event.keyCode === 13){
      if ($rootScope.syncState !== 'active' && $scope.titlebarHasText()) {
        // Enter in editor saves to new item
        $scope.closeEditor();
        $scope.saveOmnibarToItem();
      }
      event.preventDefault();
      event.stopPropagation();
    }
  };

  // SEARCH

  $scope.$watch('titlebar.text', function(newTitle/*, oldTitle*/) {
    $scope.searchText.current = newTitle;
    if (newTitle && newTitle.length > 1) {
      // Use a delayed update for search
      $timeout(function() {
        if ($scope.searchText.current === newTitle)
          $scope.searchText.delayed = newTitle;
      }, 700);
    } else {
      $scope.searchText.delayed = undefined;
    }
  });

}

OmnibarEditorController['$inject'] = ['$q', '$rootScope', '$scope', '$timeout', 'DateService',
'UISessionService'];
angular.module('em.main').controller('OmnibarEditorController', OmnibarEditorController);

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

 function TagsController($scope, AnalyticsService, TagsService, UISessionService) {

  // KEYWORDS

  $scope.saveKeyword = function(keyword) {
    TagsService.saveTag(keyword, UISessionService.getActiveUUID());
    $scope.gotoPreviousPage();
  };

  $scope.deleteKeyword = function deleteKeyword(keyword) {
    TagsService.deleteTag(keyword, UISessionService.getActiveUUID());
  };

  $scope.addKeyword = function addKeyword(newKeyword) {
    if (!newKeyword.title || newKeyword.title.length === 0) return false;

    var keywordToSave = {title: newKeyword.title, tagType: newKeyword.tagType};
    delete newKeyword.title;

    TagsService.saveTag(keywordToSave, UISessionService.getActiveUUID()).then(function(/*keyword*/) {
      AnalyticsService.do('addKeyword');
    });
  };

  // CONTEXTS

  $scope.saveContext = function(context) {
    console.log("calling save context")
    console.log(context)
    return TagsService.saveTag(context, UISessionService.getActiveUUID());
  };

  $scope.deleteContext = function deleteContext(context) {
    TagsService.deleteTag(context, UISessionService.getActiveUUID());
  };

  $scope.addContext = function addContext(newContext) {
    if (!newContext.title || newContext.title.length === 0) return false;

    var contextToSave = {title: newContext.title, tagType: newContext.tagType};
    delete newContext.title;

    TagsService.saveTag(contextToSave, UISessionService.getActiveUUID()).then(function(/*context*/) {
      AnalyticsService.do('addContext');
    });
  };
}

TagsController['$inject'] = ['$scope', 'AnalyticsService', 'TagsService', 'UISessionService'];
angular.module('em.base').controller('TagsController', TagsController);

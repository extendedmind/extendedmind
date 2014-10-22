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
    if (!keyword || !keyword.title || !keyword.title.length) return;
    if (keyword.uuid) AnalyticsService.do('saveKeyword');
    else AnalyticsService.do('addKeyword');

    TagsService.saveTag(keyword, UISessionService.getActiveUUID());
    $scope.gotoPreviousPage();
  };

  $scope.deleteKeyword = function (keyword) {
    if (keyword.uuid){
      AnalyticsService.do('deleteKeyword');
      return TagsService.deleteTag(keyword, UISessionService.getActiveUUID());
    }
  };

  $scope.undeleteKeyword = function(keyword) {
    if (keyword.uuid){
      AnalyticsService.do('undeleteKeyword');
      return TagsService.undeleteTag(keyword, UISessionService.getActiveUUID());
    }
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
    if (!context || !context.title || !context.title.length) return;
    if (context.uuid) AnalyticsService.do('saveContext');
    else AnalyticsService.do('addContext');

    return TagsService.saveTag(context, UISessionService.getActiveUUID());
  };

  $scope.deleteContext = function(context) {
    if (context.uuid){
      AnalyticsService.do('deleteContext');
      return TagsService.deleteTag(context, UISessionService.getActiveUUID());
    }
  };

  $scope.undeleteContext = function(context) {
    if (context.uuid){
      AnalyticsService.do('undeleteContext');
      return TagsService.undeleteTag(context, UISessionService.getActiveUUID());
    }
  };
}

TagsController['$inject'] = ['$scope', 'AnalyticsService', 'TagsService', 'UISessionService'];
angular.module('em.base').controller('TagsController', TagsController);

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

 function ContextsController($scope, AnalyticsService, TagsService, UISessionService) {

  $scope.saveContext = function(context) {
    TagsService.saveTag(context, UISessionService.getActiveUUID());
    $scope.gotoPreviousPage();
  };

  $scope.contextDetails = {visible: false};
  $scope.editContext = function editContext(/*context*/) {
    $scope.contextDetails.visible = !$scope.contextDetails.visible;
  };

  $scope.editContextFields = function editContextFields(context) {
    AnalyticsService.do('editContextFields');
    TagsService.saveTag(context, UISessionService.getActiveUUID());
  };

  $scope.deleteContext = function deleteContext(context) {
    TagsService.deleteTag(context, UISessionService.getActiveUUID());
  };

  $scope.addContext = function addContext(newContext) {
    if (!newContext.title  || newContext.title.length === 0) return false;

    var contextToSave = {title: newContext.title, tagType: newContext.tagType};
    delete newContext.title;

    TagsService.saveTag(contextToSave, UISessionService.getActiveUUID()).then(function(/*context*/) {
      AnalyticsService.do('addContext');
    });
  };

  $scope.contextQuickEditDone = function contextQuickEditDone(context) {
    AnalyticsService.do('contextQuickEditDone');
    TagsService.saveTag(context, UISessionService.getActiveUUID());
  };
}

ContextsController['$inject'] = ['$scope',
'AnalyticsService', 'TagsService', 'UISessionService'];
angular.module('em.app').controller('ContextsController', ContextsController);

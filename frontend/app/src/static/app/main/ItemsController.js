/* Copyright 2013-2016 Extended Mind Technologies Oy
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

 function ItemsController($rootScope, $scope, AnalyticsService, ArrayService, BackendClientService,
                          ItemsService, UISessionService, UserSessionService, packaging) {

  if (angular.isFunction($scope.registerArrayChangeCallback)) {
    $scope.registerArrayChangeCallback('item', ['active'], invalidateItemsArrays,
                                       'ItemsController');
  }

  var cachedItemsArrays = {};

  /*
  * Invalidate cached active notes arrays.
  */
  function invalidateItemsArrays(items, modifiedItem, itemsType, ownerUUID) {
    if (cachedItemsArrays[ownerUUID]) {
      updateAllItems(cachedItemsArrays[ownerUUID], ownerUUID);
    }
  }

  function updateAllItems(cachedItems, ownerUUID) {
    var activeItems = ItemsService.getItems(ownerUUID);
    cachedItems['all'] = [];
    if (activeItems && activeItems.length){
      for (var i = 0; i < activeItems.length; i++) {
        ArrayService.insertItemToArray(activeItems[i], cachedItems['all'], 'created', true);
      }
    }
  }

  $scope.getItemsArray = function(arrayType, info) {
    var ownerUUID = info && info.owner ? info.owner : UISessionService.getActiveUUID();
    if (!cachedItemsArrays[ownerUUID]) cachedItemsArrays[ownerUUID] = {};
    switch (arrayType) {
      case 'all':
      if (!cachedItemsArrays[ownerUUID]['all']) {
        updateAllItems(cachedItemsArrays[ownerUUID], ownerUUID);
      }
      return cachedItemsArrays[ownerUUID]['all'];
    }
  };

  // NAVIGATING

  $scope.openItemEditor = function(item){
    $scope.openEditor('item', item);
  };

  $scope.gotoInbox = function(item){
    $scope.changeFeature('inbox', item, true);
  };

  $scope.getNewItem = function(initialValues){
    return ItemsService.getNewItem(initialValues, UISessionService.getActiveUUID());
  };

  // SAVING

  $scope.saveItem = function(item) {
    return ItemsService.saveItem(item);
  };

  // DELETING

  $scope.deleteItem = function(item) {
    if (item.trans.uuid) {
      AnalyticsService.do('deleteItem');
      return ItemsService.deleteItem(item);
    }
  };

  $scope.undeleteItem = function(item) {
    if (item.trans.uuid) {
      AnalyticsService.do('undeleteItem');
      return ItemsService.undeleteItem(item);
    }
  };

  // UI

  $scope.getInboxEmailPrompt = function() {
    return 'send email to <b>' + $scope.getInboxEmailAddress() + '</b> or press plus below';
  };

  $scope.getInboxEmailAddress = function() {
    var inboxEmail = 'inbox-' + UserSessionService.getInboxId();

    var urlPrefix = BackendClientService.getUrlPrefix();
    if (urlPrefix.length > 0){
      var domainIndex = urlPrefix.indexOf('://');
      if (domainIndex !== -1){
        inboxEmail += "@" + urlPrefix.substring(urlPrefix.indexOf('://') + 3);
      }
    }else {
      inboxEmail += "@" + window.location.hostname;
    }
    return inboxEmail;
  };

  $scope.getInboxEmailHref = function() {
    if (!packaging.endsWith('cordova')){
      return 'mailto:' + $scope.getInboxEmailAddress();
    }
  };

  $scope.clickInboxEmail = function() {
    if (packaging.endsWith('cordova') && cordova && cordova.InAppBrowser){
      cordova.InAppBrowser.open('mailto:' + $scope.getInboxEmailAddress(), '_system', 'location=yes');
    }
  };
}

ItemsController['$inject'] = ['$rootScope', '$scope', 'AnalyticsService', 'ArrayService',
'BackendClientService', 'ItemsService', 'UISessionService', 'UserSessionService', 'packaging'];
angular.module('em.main').controller('ItemsController', ItemsController);

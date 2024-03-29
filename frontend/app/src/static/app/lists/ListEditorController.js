/* Copyright 2013-2017 Extended Mind Technologies Oy
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
  /* global jQuery */

 'use strict';

 function ListEditorController($q, $rootScope, $scope, $timeout, ListsService, UISessionService,
                               UserService, UserSessionService) {

  // INITIALIZING

  if (angular.isFunction($scope.registerFeatureEditorAboutToCloseCallback))
    $scope.registerFeatureEditorAboutToCloseCallback(listEditorAboutToClose, 'ListEditorController');

  if ($scope.fullEditor) refreshSharedToList($scope.list);
  else refreshSharedByList($scope.list);

  function refreshSharedToList(list) {
    $scope.sharedToList = [];
    if (list.trans.visibility && list.trans.visibility.agreements &&
        list.trans.visibility.agreements.length > 0)
    {
      for (var i = 0; i < list.trans.visibility.agreements.length; i++) {
        $scope.sharedToList.push({
          email: list.trans.visibility.agreements[i].proposedTo.email,
          access: list.trans.visibility.agreements[i].access,
          accessText: (list.trans.visibility.agreements[i].access === 2 ? 'read/write' : 'read'),
          accepted: list.trans.visibility.agreements[i].accepted,
          acceptStatus: (list.trans.visibility.agreements[i].accepted ? 'accepted' : 'pending'),
          uuid: list.trans.visibility.agreements[i].uuid
        });
      }
    }
  }

  function refreshSharedByList(list) {
    $scope.sharedByList = {};
    if (list.trans.visibility && list.trans.visibility.agreements &&
        list.trans.visibility.agreements.length > 0)
    {
      for (var i = 0; i < list.trans.visibility.agreements.length; i++) {
        if (list.trans.visibility.agreements[i].proposedBy) {
          $scope.sharedByList.email = list.trans.visibility.agreements[i].proposedBy.email;
          $scope.sharedByList.accessText = ($scope.list.trans.visibility.agreements[i].access ===
                                            2 ? 'read/write' : 'read');
          $scope.sharedByList.uuid = list.trans.visibility.agreements[i].uuid;
          break;
        }
      }
    }
  }

  $scope.list.trans.showNotesFirst = $scope.isShowListNotesFirst($scope.list);
  $scope.toggleShowNotesFirst = function(list){
    $scope.setShowListNotesFirst(list, $scope.list.trans.showNotesFirst);
  };

  // LIST EDITOR FIELD VISIBILITY

  $scope.showListAction = function(actionName, list){
    var ownerUUID = $scope.list.trans.owner;
    var adoptedLists;
    switch (actionName){
      case 'favorite':
      // For lists, favoriting is an action because there is no 'favorited' field in the list there is
      // for a note.
      return $scope.showEditorProperty('title') && $scope.isPersonalData();
      case 'archive':
      return !$scope.isFakeUser() &&
        $scope.fullEditor &&
        $scope.list.trans.archived === undefined &&
        $scope.editorType !== 'recurring' &&
        $scope.features.lists.getStatus('archived') !== 'disabled';
      case 'activate':
      return !$scope.isFakeUser() &&
        $scope.fullEditor &&
        $scope.list.trans.archived !== undefined &&
        $scope.editorType !== 'recurring' &&
        $scope.features.lists.getStatus('archived') !== 'disabled';
      case 'delete':
      return !list.trans.deleted && $scope.fullEditor && !$scope.isPropertyInDedicatedEdit();
      case 'restore':
      return list.trans.deleted && $scope.fullEditor && !$scope.isPropertyInDedicatedEdit();
      case 'share':
      return $scope.usePremiumFeatures() && $scope.fullEditor &&
             (ownerUUID === UserSessionService.getUserUUID()) &&
             !$scope.listShareEditorOpen && !$scope.revisionPickerOpen;
      case 'adopt':
      // Show adopt when activeUUID is not the same as userUUID (in collective)
      // and list not already adopted
      var userUUID = UserSessionService.getUserUUID();
      var activeUUID = UISessionService.getActiveUUID();
      adoptedLists = UserSessionService.getUIPreference('adoptedLists');
      if (activeUUID !== userUUID && activeUUID === ownerUUID &&
        (!adoptedLists || !adoptedLists[ownerUUID] ||
         adoptedLists[ownerUUID].indexOf($scope.list.trans.uuid) === -1)){
        return true;
      }
      break;
      case 'unadopt':
      // Show unadopt when ownerUUID and listUUID are found in adopted lists
      adoptedLists = UserSessionService.getUIPreference('adoptedLists');
      if (adoptedLists && adoptedLists[ownerUUID] &&
          adoptedLists[ownerUUID].indexOf($scope.list.trans.uuid) !== -1){
        return true;
      }
      break;
    }
  };

  $scope.showListProperty = function(propertyName){
    switch (propertyName){
      case 'list':
      return  $scope.usePremiumFeatures() && !$scope.listIsParent($scope.list) && $scope.fullEditor &&
              !$scope.isPropertyInDedicatedEdit();
      case 'sharedTo':
      return $scope.usePremiumFeatures() && $scope.sharedToList && $scope.sharedToList.length &&
             !$scope.listShareEditorOpen && !$scope.revisionPickerOpen;
      case 'sharedBy':
      return $scope.usePremiumFeatures() && $scope.sharedByList &&
             !jQuery.isEmptyObject($scope.sharedByList) && !$scope.revisionPickerOpen;
      case 'showNotesFirst':
      return $scope.features.notes.getStatus() !== 'disabled' && !$scope.listShareEditorOpen &&
             !$scope.revisionPickerOpen;
    }
  };

  $scope.showListSubEditor = function(subEditorName){
    switch (subEditorName){
      case 'share':
      return $scope.listShareEditorOpen;
    }
  };

  $scope.showListEditorComponent = function(componentName, subcomponentName) {
    switch (componentName) {
      case 'basicFooter':
      if (!subcomponentName){
        return !$scope.isPropertyInDedicatedEdit() &&
              (($scope.showListAction('archive') || $scope.showListAction('activate')) ||
               $scope.showListEditorComponent('basicFooter', 'navigation'));
      }else if (subcomponentName === 'navigation'){
        return !$scope.isFooterNavigationHidden();
      }
      break;

      case 'advancedFooter':
      if (!subcomponentName){
        return !$scope.listShareEditorOpen &&
           ($scope.showListEditorComponent('advancedFooter', 'convert') ||
            $scope.showListEditorComponent('advancedFooter', 'navigationWrapper'));
      }else if (subcomponentName === 'navigationWrapper'){
        return $scope.showListEditorComponent('advancedFooter', 'navigation') ||
               ($scope.showListAction('adopt') || $scope.showListAction('unadopt'));
      }else if (subcomponentName === 'navigation'){
        return !$scope.isFooterNavigationHidden();
      }else if (subcomponentName === 'convert'){
        return $scope.showEditorAction('convertToTask', $scope.list) ||
               $scope.showEditorAction('convertToNote', $scope.list);
      }
      break;
    }
  };

  // SAVING, DELETING

  function saveListInEdit(exitAppAfterSave) {
    if (exitAppAfterSave){
      return $scope.saveList($scope.list);
    }else{
      return $scope.deferEdit().then(function() {
        $scope.saveList($scope.list);
      });
    }
  }

  $scope.deleteListInEdit = function() {
    if ($scope.sharedToList && $scope.sharedToList.length) {
      var exception = {
        type: 'deleteSharedList',
        value: {
          allowCancel: true
        }
      };
      $rootScope.$emit('emException', exception);
    } else {
      var activeFeature = $scope.getActiveFeature();
      if (activeFeature === 'list') {
        var currentData = UISessionService.getFeatureData(activeFeature);
        if (currentData === $scope.list) {
          $scope.features.lists.resizeFix = true;
          $scope.features.list.resizeFix = true;
          $scope.changeFeature('lists', undefined, false);
        }
      }
      $scope.processDelete($scope.list, $scope.deleteList, $scope.undeleteList);
    }
  };

  $scope.endListEdit = function() {
    $scope.closeEditor();
  };

  function listEditorAboutToClose(exitAppAfterSave) {
    if (angular.isFunction($scope.unregisterEditorAboutToCloseCallback))
      $scope.unregisterEditorAboutToCloseCallback('ListEditorController');

    if ($scope.isEdited($scope.list) && !$scope.list.trans.deleted) return saveListInEdit(exitAppAfterSave);
    else ListsService.resetList($scope.list);
  }

  // ARCHIVE LIST

  $scope.archiveListInEdit = function() {
    if ($scope.hasChildLists($scope.list)){
      UISessionService.pushNotification({
        type: 'fyi',
        text: 'can\'t archive a parent list'
      });
      return;
    }

    var parentListPickerModalParams = {
      messageHeading: 'select parent',
      messageIngress: 'optionally add or choose a parent for the archived list',
      confirmText: 'archive',
      confirmTextDeferred: 'archiving\u2026',
      confirmActionDeferredFn: saveAndArchiveList,
      confirmActionDeferredParam: $scope.list,
      confirmActionPromiseFn: true,
      listPicker: {
        getListsArray: getArhivedParentlessLists,
        getNewList: $scope.getNewList,
        save: saveNewArchiveParentToList,
        clear: function(list){
          list.trans.archiveParent = undefined;
        },
        getSelected: function(list){
          return list.trans.archiveParent;
        },
        itemInEdit: $scope.list
      }
    };
    $scope.showModal(undefined, parentListPickerModalParams);
  };

  function saveAndArchiveList(list){
    return $scope.saveAndArchiveList(list, processSaveNewParentOffline).then(
      archiveOrUnarchiveListSuccess, archiveOrUnarchiveListError);
  }

  function getArhivedParentlessLists(){
    return $scope.getListsArray('archivedParentless');
  }

  function saveNewArchiveParentToList(list, listParent){
    var deferred = $q.defer();
    if (listParent.trans.uuid){
      if (!listParent.trans.archived){
        // Save succeeded but archive failed, retry archive
        ListsService.archiveList(listParent).then(
          function(){
            list.trans.archiveParent = listParent;
            deferred.resolve();
          }, function(error){
            deferred.reject(error);
          });
      }else{
        // This is an existing archived list, just set it to the trans archiveParent
        list.trans.archiveParent = listParent;
        deferred.resolve();
      }
    }else{
      $scope.saveAndArchiveList(listParent, processSaveNewParentOffline).then(
        function(success){
          list.trans.archiveParent = listParent;
          deferred.resolve(success);
        }, function(error){
          deferred.reject(error);
        });
    }
    return deferred.promise;
  }

  // UNARCHIVING

  $scope.unarchiveListInEdit = function() {
    if ($scope.hasChildLists($scope.list)){
      UISessionService.pushNotification({
        type: 'fyi',
        text: 'can\'t activate a parent list'
      });
      return;
    }

    var parentListPickerModalParams = {
      messageHeading: 'select parent',
      messageIngress: 'optionally add or choose a parent for the active list',
      confirmText: 'activate',
      confirmTextDeferred: 'activating\u2026',
      confirmActionDeferredFn: saveAndUnarchiveList,
      confirmActionDeferredParam: $scope.list,
      confirmActionPromiseFn: true,
      listPicker: {
        getListsArray: getActiveParentlessLists,
        getNewList: $scope.getNewList,
        save: saveNewActiveParentToList,
        clear: function(list){
          list.trans.activeParent = undefined;
        },
        getSelected: function(list){
          return list.trans.activeParent;
        },
        itemInEdit: $scope.list
      }
    };
    $scope.showModal(undefined, parentListPickerModalParams);
  };

  function saveAndUnarchiveList(list){
    return $scope.saveAndUnarchiveList(list, processSaveNewParentOffline).then(
      archiveOrUnarchiveListSuccess, archiveOrUnarchiveListError);
  }

  function getActiveParentlessLists(){
    return $scope.getListsArray('activeParentless');
  }

  function saveNewActiveParentToList(list, listParent){
    var deferred = $q.defer();
    if (listParent.trans.uuid){
      // This is an existing active list, just set it to the trans activeParent
      list.trans.activeParent = listParent;
      deferred.resolve();
    }else{
      $scope.saveAndUnarchiveList(listParent, processSaveNewParentOffline).then(
        function(success){
          list.trans.activeParent = listParent;
          deferred.resolve(success);
        }, function(error){
          deferred.reject(error);
        });
    }
    return deferred.promise;
  }

  // ARCHIVE/UNARCHIVE HELPERS

  function processSaveNewParentOffline(error, list, deferred){
    deferred.reject(error);
  }

  function archiveOrUnarchiveListSuccess() {
    $scope.features.lists.resizeFix = true;
    $scope.closeEditor();
    $scope.changeFeature('lists', $scope.list);
  }

  function archiveOrUnarchiveListError(error){
    return $q.reject(error);
  }

  // FAVORITING

  $scope.clickFavorite = function() {
    if (!$scope.isFavoriteList($scope.list)){
      $scope.favoriteList($scope.list);
    }else{
      $scope.unfavoriteList($scope.list);
    }
  };

  // TITLEBAR

  $scope.listTitlebarTextKeyDown = function (keydownEvent) {
    $scope.handleBasicTitlebarKeydown(keydownEvent, $scope.list);
    // Return
    if (event.keyCode === 13) {
      if ($scope.titlebarHasText()) {
        // Enter in editor saves, no line breaks allowed
        $scope.handleTitlebarEnterAction(saveListInEdit);
      }
      event.preventDefault();
      event.stopPropagation();
    }
  };

  // UI

  function isSubEditorOpenInListEditor(){
    return $scope.listPickerOpen || $scope.listShareEditorOpen || $scope.revisionPickerOpen;
  }
  $scope.registerIsSubEditorOpenCondition(isSubEditorOpenInListEditor);


  $scope.getListPropertyNameInEdit = function() {
    var propertyName = $scope.getPropertyNameInEdit();
    if (!propertyName && $scope.listShareEditorOpen){
      propertyName = 'share';
    }
    return propertyName;
  };

  // SHARE LIST EDITOR

  $scope.openListShareEditor = function(data) {
    if ($scope.useSharedLists()) {
      var initialData = {};
      $scope.shareEditor = {
        data: {}
      };

      if (data) {
        // Initialize with data.
        initialData.email = $scope.shareEditor.data.email = data.email;
        initialData.access = $scope.shareEditor.data.access = data.access;
        initialData.accepted = $scope.shareEditor.data.accepted = data.accepted;
        initialData.uuid = $scope.shareEditor.data.uuid = data.uuid;

        $scope.shareEditor.existing = true;
      } else {
        // Initialize with default values.
        initialData.email = $scope.shareEditor.data.email = undefined;
        initialData.access = $scope.shareEditor.data.access = 1; // read access
        initialData.accepted = $scope.shareEditor.data.accepted = undefined;

        $scope.shareEditor.emailWatcher = $scope.$watch('shareEditor.data.email',
                                                        clearInvalidListShareEmailErrorOnChange);
      }

      $scope.listShareEditorOpen = true;

      if (angular.isFunction($scope.registerSubEditorDoneCallback)) {
        $scope.registerSubEditorDoneCallback(saveListShareAndClose,
                                             [$scope.shareEditor.data, initialData,
                                             $scope.shareEditor.existing, $scope.list]);
      }

      if ($scope.fullEditor && angular.isFunction($scope.registerHasSubEditorEditedCallback)) {
        $scope.registerHasSubEditorEditedCallback(isListShareEdited,
                                                  [initialData, $scope.shareEditor.data]);
      }
    } else {
      // TODO: get premium
    }
  };

  function closeListShareEditor() {
    if (angular.isFunction($scope.unregisterSubEditorDoneCallback)) $scope.unregisterSubEditorDoneCallback();
    $scope.listShareEditorOpen = false;
    if ($scope.shareEditor.emailWatcher) $scope.shareEditor.emailWatcher();
    delete $scope.shareEditor;
  }

  function clearInvalidListShareEmailErrorOnChange(newEmail, oldEmail) {
    if ($scope.shareEditor.previouslyFailedEmail && newEmail !== oldEmail) {
      $scope.shareEditor.previouslyFailedEmail = false;
    }
  }

  function isListShareEdited(initialData, data) {
    if (!data.email) {
      return false;
    } else if (!initialData.email && data.email) {
      return true;
    } else if (initialData.access !== data.access) {
      return true;
    }
  }

  function saveListShareAndClose(data, initialData, existing, targetList) {

    function doSaveListShare(data, initialData, existing, targetList) {
      return $q(function(resolve, reject) {
        if (isListShareEdited(initialData, data)) {
          if (existing) {
            // Existing
            ListsService.updateExistingListShareAccess(targetList, data.uuid, data.access).then(resolve,
                                                                                                reject);
          } else {
            // New
            var listShareToSave = {
              agreementType: 'list',
              access: data.access,
              targetItem: {uuid: targetList.trans.uuid},
              proposedTo: {email: data.email}
            };
            ListsService.shareList(targetList, listShareToSave).then(resolve, function() {
              reject('email');
            });
          }
        } else {
          resolve();
        }
      });
    }

    function listShareResolved(targetList) {
      refreshSharedToList(targetList);
      closeListShareEditor();
    }
    function listShareRejected(reason) {
      if (reason === 'email') { // FIXME: backend returns something different
        $scope.shareEditor.previouslyFailedEmail = true;
      }
    }

    if ($scope.fullEditor) {
      var promise = doSaveListShare(data, initialData, existing, targetList);
      promise.then(function() {
        listShareResolved(targetList);
      }, listShareRejected);
    } else {
      closeListShareEditor();
    }
  }

  function unshareList(targetList, agreementUUID, sharedToRemovesList) {
    return ListsService.unshareList(targetList, agreementUUID).then(function(){
      if (sharedToRemovesList){
        var sharedLists = $scope.sharedLists;
        if (sharedLists && sharedLists[targetList.trans.owner] && sharedLists[targetList.trans.owner][1] &&
            sharedLists[targetList.trans.owner][1][targetList.trans.uuid]){
          // Delete the list from the in-memory-array
          delete sharedLists[targetList.trans.owner][1][targetList.trans.uuid];
          if (jQuery.isEmptyObject(sharedLists[targetList.trans.owner][1])){
            delete sharedLists[targetList.trans.owner];
          }
        }
        UserService.getAccount();
        $scope.closeEditor();
        $scope.changeFeature('lists');
      }
    });
  }

  function unshareListResolved(targetList) {
    refreshSharedToList(targetList);
    closeListShareEditor();
    UISessionService.pushNotification({
      type: 'fyi',
      text: 'list unshared'
    });
  }

  function removeListShareResolved() {
    $scope.closeEditor();
    UISessionService.pushDelayedNotification({
      type: 'fyi',
      text: 'removed shared list'
    });
    $timeout(function() {
      UISessionService.activateDelayedNotifications();
    }, $rootScope.EDITOR_CLOSED_FAILSAFE_TIME);
  }

  $scope.clearSharedToEmail = function() {
    $scope.shareEditor.data.email = undefined;
  };

  $scope.removeListShare = function() {
    var interaction;
    if ($scope.fullEditor) {
      interaction = {
        type: 'confirmationRequired',
        value: {
          messageHeading: 'confirm unshare',
          messageIngress: 'are you sure you want to stop sharing this list to ' +
          $scope.shareEditor.data.email + '?',
          confirmText: 'unshare',
          confirmTextDeferred: 'unsharing\u2026',
          confirmActionDeferredFn: function() {
            return unshareList($scope.list, $scope.shareEditor.data.uuid);
          },
          confirmActionPromiseFn: function() {
            unshareListResolved($scope.list);
          },
          allowCancel: true
        }
      };
      $rootScope.$emit('emInteraction', interaction);
    } else {
      interaction = {
        type: 'confirmationRequired',
        value: {
          messageHeading: 'confirm remove',
          messageIngress: 'are you sure you want to leave from the list shared to you?',
          confirmText: 'remove',
          confirmTextDeferred: 'removing\u2026',
          confirmActionDeferredFn: function() {
            return unshareList($scope.list, $scope.shareEditor.data.uuid, true);
          },
          confirmActionPromiseFn: function() {
            removeListShareResolved($scope.list);
          },
          allowCancel: true
        }
      };
      $rootScope.$emit('emInteraction', interaction);
    }
  };

  $scope.resendListShare = function(uuid) {
    var resendListSharePromise = ListsService.resendListShare(uuid);
    $scope.shareEditor.resendPending = true;
    var resendResolveMinimumTimeReached = false;
    var resendResolveMinimumTimeTimer = $timeout(function() {
      resendResolveMinimumTimeReached = true;
    }, 1000);

    resendListSharePromise.then(function() {
      if (resendResolveMinimumTimeReached) {
        $scope.shareEditor.resendPending = false;
        $scope.shareEditor.resendResolved = true;
      } else {
        resendResolveMinimumTimeTimer.then(function() {
          $scope.shareEditor.resendPending = false;
          $scope.shareEditor.resendResolved = true;
        });
      }
    });
  };

  $scope.getListShareResendStatusText = function() {
    if ($scope.shareEditor.resendPending) {
      return 'resending';
    } else if ($scope.shareEditor.resendResolved) {
      return 'resent';
    } else {
      return 'resend';
    }
  };

  var showFooterCallbacks = {};
  $scope.registerShowFooterCallback = function(callback, id) {
    if (!showFooterCallbacks[id]) {
      showFooterCallbacks[id] = callback;
    }
  };

  var gotoTitleCallback;
  $scope.gotoListTitle = function() {
    if (typeof gotoTitleCallback === 'function') gotoTitleCallback();
    if (!$scope.isFirstSlide('listEditor')) $scope.swipeToBasic('listEditor');
  };
  $scope.registerGotoListTitleCallback = function(callback) {
    gotoTitleCallback = callback;
  };

  // REVISION HANDLING

  $scope.closeListRevisionPickerAndActivateRevision = function(list, revision){
    var promise = $scope.closeRevisionPickerAndActivateRevision(list, revision);
    if (promise){
      promise.then(function(revisionItem){
        var revisionItemType = revisionItem.trans.itemType;
        ListsService.resetList(revisionItem);
        if (revisionItemType === 'list'){
          // Use one bigger revision number to force creation of a new revision right now
          var newRevision = $scope.list.revision + 1;
          $scope.list.trans = revisionItem.trans;
          $scope.list.revision = newRevision;
          ListsService.saveList($scope.list).then(function(result){
            if (result === 'unmodified') $scope.list.revision = $scope.list.revision - 1;
          });
        }else if (revisionItemType === 'note'){
          $scope.convertToNote(revisionItem);
        } else if (revisionItemType === 'task'){
          $scope.convertToTask(revisionItem);
        }
      });
    }
  };

  // WATCH FOR CHANGES

  function setListWatch(){
    return $scope.$watch(function() {
      // Execute footer callbacks
      for (var id in showFooterCallbacks) {
        var showFooter = $scope.showListEditorComponent(id);
        if (showFooterCallbacks.hasOwnProperty(id)) showFooterCallbacks[id](showFooter);
      }
      // Autosave on every tick. Function is debounced so it can be called every digest
      if (!$scope.isAutoSavingPrevented()) $scope.autoSave($scope.list);
    });
  }
  var clearListWatch = setListWatch();

  // REINITIALIZING

  function reinitializeListEditor(){
    clearListWatch();
    clearListWatch = setListWatch();
    $scope.resetSaveStatus();
  }
  $scope.registerReinitializeEditorCallback(reinitializeListEditor);

  // CLEANUP

  $scope.$on('$destroy', function() {
    clearListWatch();
    if (angular.isFunction($scope.unregisterReinitializeEditorCallback))
      $scope.unregisterReinitializeEditorCallback();
    if (angular.isFunction($scope.unregisterSubEditorDoneCallback)) {
      // Unregister any leftover callback.
      $scope.unregisterSubEditorDoneCallback();
    }
  });
}

ListEditorController['$inject'] = ['$q', '$rootScope', '$scope', '$timeout',
'ListsService', 'UISessionService', 'UserService', 'UserSessionService'];
angular.module('em.main').controller('ListEditorController', ListEditorController);

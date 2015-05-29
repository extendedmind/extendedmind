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

 function ListEditorController($q, $rootScope, $scope, $timeout, ListsService, UISessionService) {

  // INITIALIZING

  if (angular.isFunction($scope.registerFeatureEditorAboutToCloseCallback))
    $scope.registerFeatureEditorAboutToCloseCallback(listEditorAboutToClose, 'ListEditorController');

  if ($scope.foreignOwner) refreshSharedByList($scope.list);
  else refreshSharedToList($scope.list);

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
          $scope.sharedByList.accessText =
          $scope.list.trans.visibility.agreements[i].proposedBy.access === 2 ? 'read/write' : 'read';
          break;
        }
      }
    }
  }

  // SAVING, DELETING

  function saveListInEdit () {
    $scope.deferEdit().then(function() {
      $scope.saveList($scope.list);
    });
  }

  $scope.deleteListInEdit = function() {
    if ($scope.sharedToList) {
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

  $scope.isListEdited = function() {
    if ($scope.listTitlebarHasText()) {
      return ListsService.isListEdited($scope.list);
    }
  };

  $scope.endListEdit = function() {
    $scope.closeEditor();
  };

  function listEditorAboutToClose() {
    if (angular.isFunction($scope.unregisterEditorAboutToCloseCallback))
      $scope.unregisterEditorAboutToCloseCallback('ListEditorController');

    if ($scope.isListEdited() && !$scope.list.trans.deleted) saveListInEdit();
    else ListsService.resetList($scope.list);
  }

  function saveAndArchiveList(){
    return $scope.saveAndArchiveList($scope.list).then(archiveOrUnarchiveListSuccess, archiveListError);
  }

  function getArhivedParentlessLists(){
    return $scope.getListsArray('archivedParentless');
  }

  function getNewParentListForArchiving(){
    if ($scope.list.trans.archived){
      return $scope.getNewList();
    }else{
      return $scope.getNewList();
    }
  }

  $scope.archiveListInEdit = function() {
    /*
    TODO: Use this
    if ($scope.showModal){
      var parentListPickerModalParams = {
        messageHeading: 'select parent',
        messageIngress: 'optionally add or choose a parent for the archived list',
        confirmText: 'archive',
        confirmTextDeferred: 'archiving\u2026',
        confirmActionDeferredFn: $scope.saveAndArchiveList,
        confirmActionDeferredParam: $scope.list,
        listPicker: {
          getListsArray: getArhivedParentlessLists,
          getNewList: $scope.getNewList,
          save: $scope.saveList,
          clear: function(list){
            list.trans.list = undefined;
          },
          getSelected: function(list){
            return list.trans.list;
          },
          itemInEdit: $scope.list
        }
      };
      $scope.showModal(undefined, parentListPickerModalParams);

    }
*/

    return $scope.saveAndArchiveList($scope.list).then(function(success){
      $scope.closeEditor();
      $scope.changeFeature('lists', $scope.list);
    });
  };

  function archiveOrUnarchiveListSuccess() {
    $scope.closeEditor();
    $scope.changeFeature('lists', $scope.list);
  }

  function archiveListError(error) {
    if (error.type === 'offline') {
      var rejection = {
        type: 'onlineRequired',
        value: {
          retry: function() {
            var archiveListDeferred = $scope.archiveList($scope.list);
            if (archiveListDeferred) {
              return archiveListDeferred.then(archiveOrUnarchiveListSuccess);
            }
          },
          allowCancel: true
        }
      };
      $rootScope.$emit('emInteraction', rejection);
    }
  }

  $scope.unarchiveListInEdit = function() {
    return $scope.saveAndUnarchiveList($scope.list).then(function(success){
      $scope.closeEditor();
      $scope.changeFeature('lists', $scope.list);
    });
  };

  function unarchiveListError(error) {
    if (error.type === 'offline') {
      var rejection = {
        type: 'onlineRequired',
        value: {
          retry: function() {
            var unarchiveListDeferred = $scope.unarchiveList($scope.list);
            if (unarchiveListDeferred) {
              return unarchiveListDeferred.then(archiveOrUnarchiveListSuccess);
            }
          },
          allowCancel: true
        }
      };
      $rootScope.$emit('emInteraction', rejection);
    }
  }

  $scope.clickFavorite = function() {
    if (!$scope.isFavoriteList($scope.list)){
      $scope.favoriteList($scope.list);
    }else{
      $scope.unfavoriteList($scope.list);
    }
  };

  // TITLEBAR

  $scope.listTitlebarHasText = function() {
    return $scope.list.trans.title && $scope.list.trans.title.length !== 0;
  };

  $scope.listTitlebarTextKeyDown = function (keydownEvent) {
    $scope.handleBasicTitlebarKeydown(keydownEvent, $scope.list);
    // Return
    if (event.keyCode === 13) {
      if ($scope.listTitlebarHasText()) {
        // Enter in editor saves, no line breaks allowed
        $scope.handleTitlebarEnterAction(saveListInEdit);
      }
      event.preventDefault();
      event.stopPropagation();
    }
  };

  // UI

  function isSubEditorOpenInListEditor(){
    return $scope.listPickerOpen || $scope.listShareEditorOpen;
  }
  $scope.registerIsSubEditorOpenCondition(isSubEditorOpenInListEditor);


  $scope.getListPropertyNameInEdit = function() {
    var propertyName = $scope.getPropertyNameInEdit();
    if (!propertyName && $scope.listShareEditorOpen){
      propertyName = 'share';
    }
    return propertyName;
  };

  // LIST PICKER

  $scope.listIsParent = function(list) {
    var lists = $scope.getListsArray('all');
    for (var i = 0; i < lists.length; i++) {
      if (lists[i].trans.list && lists[i].trans.list.trans.uuid === list.trans.uuid) {
        return true;
      }
    }
    return false;
  };

  $scope.showArchive = function() {
    return !$scope.isFakeUser() &&
    !$scope.foreignOwner &&
    $scope.list.trans.archived === undefined &&
    $scope.editorType !== 'recurring' &&
    $scope.features.lists.getStatus('archived') !== 'disabled';
  };

  $scope.showUnarchive = function() {
    return !$scope.isFakeUser() &&
    !$scope.foreignOwner &&
    $scope.list.trans.archived !== undefined &&
    $scope.editorType !== 'recurring' &&
    $scope.features.lists.getStatus('archived') !== 'disabled';
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

      if (!$scope.foreignOwner && angular.isFunction($scope.registerHasSubEditorEditedCallback)) {
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

    var promise = doSaveListShare(data, initialData, existing, targetList);
    promise.then(function() {
      listShareResolved(targetList);
    }, listShareRejected);
  }

  function unshareList(targetList, agreementUUID) {
    return ListsService.unshareList(targetList, agreementUUID);
  }

  function unshareListResolved(targetList) {
    refreshSharedToList(targetList);
    closeListShareEditor();
    UISessionService.pushNotification({
      type: 'fyi',
      text: 'list unshared'
    });
  }

  function removeListShareAndClose(uuid) {
    ListsService.removeListShare(uuid);
    closeListShareEditor();
  }

  $scope.clearSharedToEmail = function() {
    $scope.shareEditor.data.email = undefined;
  };

  $scope.removeListShare = function() {
    if ($scope.foreignOwner) {
      removeListShareAndClose($scope.shareEditor.data.uuid);
    } else {
      var interaction = {
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
    }
  };

  $scope.resendListShare = function(uuid) {

    function doResendListShare(uuid) {
      return $q(function(resolve, reject) {
        ListsService.resendListShare(uuid).then(resolve, reject);
      });
    }

    $scope.shareEditor.resendPending = true;
    var resendListSharePromise = doResendListShare(uuid);
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

  $scope.containerClick = function(disabledElement) {
    if ($scope.foreignOwner && disabledElement) {
      UISessionService.pushNotification({
        type: 'fyi',
        text: 'can\'t edit shared list'
      });
    }
  };
}

ListEditorController['$inject'] = ['$q', '$rootScope', '$scope', '$timeout',
'ListsService', 'UISessionService'];
angular.module('em.main').controller('ListEditorController', ListEditorController);

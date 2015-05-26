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

  if ($scope.list.visibility && $scope.list.visibility.agreements &&
      $scope.list.visibility.agreements.length > 0)
  {
    var i;
    if ($scope.mode === 'extrinsic') {
      $scope.sharedByList = {};
      for (i = 0; i < $scope.list.visibility.agreements.length; i++) {
        if ($scope.list.visibility.agreements[i].proposedBy) {
          $scope.sharedByList.email = $scope.list.visibility.agreements[i].proposedBy.email;
          $scope.sharedByList.accessText = $scope.list.visibility.agreements[i].proposedBy.access === 2 ?
          'read/write' : 'read';
          break;
        }
      }
    } else {
      $scope.sharedToList = [];
      for (i = 0; i < $scope.list.visibility.agreements.length; i++) {
        $scope.sharedToList.push({
          email: $scope.list.visibility.agreements[i].proposedTo.email,
          access: $scope.list.visibility.agreements[i].access,
          accessText: ($scope.list.visibility.agreements[i].access === 2 ? 'read/write' : 'read'),
          accepted: $scope.list.visibility.agreements[i].accepted,
          acceptStatus: ($scope.list.visibility.agreements[i].accepted ? 'accepted' : 'pending')
        });
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

  $scope.archiveListInEdit = function() {
    var deferredSaveAndArchive = $scope.saveAndArchiveList($scope.list);
    if (deferredSaveAndArchive){
      return deferredSaveAndArchive.then(archiveOrUnarchiveListSuccess, archiveListError);
    }
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
    var deferredSaveAndUnarchive = $scope.saveAndUnarchiveList($scope.list);
    if (deferredSaveAndUnarchive){
      return deferredSaveAndUnarchive.then(archiveOrUnarchiveListSuccess, unarchiveListError);
    }
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

  $scope.isListPropertyInEdit = function() {
    return $scope.descriptionFocused || $scope.listShareEditorOpen || $scope.isSubEditorOpen();
  };

  function isSubEditorOpenInListEditor(){
    return $scope.listPickerOpen || $scope.listShareEditorOpen;
  }
  $scope.registerIsSubEditorOpenCondition(isSubEditorOpenInListEditor);

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
    $scope.list.trans.archived === undefined &&
    $scope.editorType !== 'recurring' &&
    $scope.features.lists.getStatus('archived') !== 'disabled';
  };

  $scope.showUnarchive = function() {
    return !$scope.isFakeUser() &&
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

        $scope.shareEditor.existing = true;
      } else {
        // Initialize with default values.
        initialData.email = $scope.shareEditor.data.email = undefined;
        initialData.access = $scope.shareEditor.data.access = 1; // read access
        initialData.accepted = $scope.shareEditor.data.accepted = undefined;
      }

      $scope.listShareEditorOpen = true;

      if (angular.isFunction($scope.registerSubEditorDoneCallback)) {
        $scope.registerSubEditorDoneCallback(saveListShare);
      }
      if (angular.isFunction($scope.registerHasSubEditorEditedCallback)) {
        $scope.registerHasSubEditorEditedCallback(function() {
          return isShareListEdited(initialData);
        });
      }
    } else {
      // TODO: get premium
    }
  };

  function saveListShare() {
    // TODO: save
    $scope.listShareEditorOpen = false;
  }

  function isShareListEdited(initialData) {
    if (!initialData.email && $scope.shareEditor.data.email) {
      return true;
    } else if (initialData.access !== $scope.shareEditor.data.access) {
      return true;
    }
  }

  $scope.clearSharedToEmail = function() {
    $scope.shareEditor.data.email = undefined;
  };

  $scope.removeShareList = function() {
    if ($scope.mode === 'extrinsic') {
      // TODO
    } else {
      var interaction = {
        type: 'confirmationRequired',
        value: {
          messageHeading: 'confirm unshare',
          messageIngress: 'are you sure you want to stop sharing this list to ' +
          $scope.shareEditor.data.email + '?',
          confirmText: 'unshare',
          confirmAction: function() {
            // TODO: remove
          },
          allowCancel: true
        }
      };
      $rootScope.$emit('emInteraction', interaction);
    }
  };

  $scope.resendShareList = function() {
    $scope.shareEditor.resendPending = true;
    // TODO: resend
    $timeout(function() {
      $scope.shareEditor.resendPending = false;
      $scope.shareEditor.resendResolved = true;
    }, 1000);
  };

  $scope.getShareListResendStatusText = function() {
    if ($scope.shareEditor.resendPending) {
      return 'resending';
    } else if ($scope.shareEditor.resendResolved) {
      return 'resent';
    } else {
      return 'resend';
    }
  };
}

ListEditorController['$inject'] = ['$q', '$rootScope', '$scope', '$timeout',
'ListsService', 'UISessionService'];
angular.module('em.main').controller('ListEditorController', ListEditorController);

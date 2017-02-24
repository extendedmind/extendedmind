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

 'use strict';

 function NoteEditorController($rootScope, $scope, $timeout, $window, ContentService,
                               DrawerService, NotesService, SwiperService,
                               TagsService, UISessionService, URLService, UserSessionService) {

  // INITIALIZING

  if ($scope.mode === 'omnibar') {
    // Dirtily set flag on to remove flicker when note editor is rendered.
    $scope.contentFocused = true;
  }


  if (angular.isFunction($scope.registerFeatureEditorAboutToCloseCallback))
    $scope.registerFeatureEditorAboutToCloseCallback(noteEditorAboutToClose, 'NoteEditorController');

  $scope.noteStatus = $scope.showEditorComponent('side-by-side-links') ? 'close' : 'back';
  $scope.keywordsPickerOpen = false;

  // Set collapsible open when
  $scope.collapsibleOpen = $scope.editorType === 'recurring' || $scope.mode === 'convert';

  // NOTE EDITOR FIELD VISIBILITY

  $scope.showNoteAction = function(actionName){
    switch (actionName){
      case 'delete':
      return $scope.showEditorAction('delete', $scope.note) && !$scope.isOnboarding('notes');
      case 'restore':
      return $scope.showEditorAction('restore', $scope.note) && !$scope.isOnboarding('notes');
      case 'preview':
      return ($scope.isAdmin() || (!$scope.isMyActive() && $scope.usePremiumFeatures())) &&
              $scope.note.uuid && !$scope.isOnboarding('notes');
      case 'publish':
      return ($scope.isAdmin() || (!$scope.isMyActive() && $scope.usePremiumFeatures())) &&
              $scope.note.uuid && !$scope.isOnboarding('notes');
    }
  };

  $scope.showNoteEditorComponent = function(componentName, subcomponentName) {
    switch (componentName) {

      case 'collapsible':
      if (!subcomponentName) {
        return $scope.collapsibleOpen && !$scope.isPropertyInDedicatedEdit();
      }
      if (subcomponentName ==='keywords'){
        return !hasActiveKeywords($scope.note) && $scope.fullEditor;
      }else if (subcomponentName ==='list'){
        return ((!$scope.note.trans.list || $scope.note.trans.list.trans.deleted) &&
                ($scope.features.lists.getStatus('active') !== 'disabled'));
      }else if (subcomponentName ==='url'){
        return !$scope.note.trans.link && $scope.getPropertyNameInEdit() !== 'url';
      }
      break;

      case 'lessMore':
      return (hasUnsetCollapsableProperty() && !$scope.isPropertyInDedicatedEdit() &&
              !$scope.isOnboarding('notes'));

      case 'basicFooter':

      if (!subcomponentName) {
        if ($scope.showNoteEditorComponent('basicFooter', 'expandible') ||
            $scope.showNoteEditorComponent('basicFooter', 'navigation')){
          return true;
        }
      } else if (subcomponentName === 'expandible') {
        return $rootScope.columns === 3;
      } else if (subcomponentName === 'navigation') {
        if (!$scope.isPropertyInDedicatedEdit() && !$scope.isFooterNavigationHidden() &&
            !$scope.isOnboarding('notes'))
        {
          return true;
        }
      }
      break;

      case 'advancedFooter':

      if (!subcomponentName){
        return $scope.showNoteEditorComponent('advancedFooter', 'convert') ||
               $scope.showNoteEditorComponent('advancedFooter', 'navigation');
      }else if (subcomponentName === 'navigation'){
        return !$scope.isPropertyInDedicatedEdit() &&
          ($scope.showNoteAction('preview') ||
           $scope.showNoteAction('publish') ||
           !$scope.isFooterNavigationHidden());
      }else if (subcomponentName === 'convert'){
        return !$scope.isPropertyInDedicatedEdit() &&
        ($scope.showEditorAction('convertToTask', $scope.note) ||
         $scope.showEditorAction('convertToList', $scope.note));
      }
      break;
    }
  };

  $scope.showNoteProperty = function(propertyName){
    switch (propertyName){
      case 'content':
      return $scope.drawerAisleInitialized && !$scope.isOtherPropertyInEdit('content');
      case 'favorite':
      return $scope.fullEditor && !$scope.isOnboarding('notes');
      case 'keywords':
      return hasActiveKeywords($scope.note) && !$scope.isPropertyInDedicatedEdit() && $scope.fullEditor;
      case 'list':
      return ($scope.note.trans.list && !$scope.note.trans.list.trans.deleted &&
              $scope.features.lists.getStatus('active') !== 'disabled' &&
              !$scope.isPropertyInDedicatedEdit());
      case 'modified':
      return $scope.note.trans.uuid && $scope.note.trans.created !== $scope.note.trans.modified &&
            !$scope.isPropertyInDedicatedEdit();

      case 'public':
      return $scope.note.visibility && $scope.note.visibility.published &&
            !$scope.isPropertyInDedicatedEdit();
    }
  };

  $scope.showNoteSubEditor = function(subEditorName){
    switch (subEditorName){
      case 'keywords':
      return $scope.keywordsPickerOpen;
    }
  };

  $scope.showNoteInstruction = function(instructionName) {
    if (!instructionName) {
      // Special case where name is undefined.
      return $scope.isOnboarding('notes');
    }
    switch (instructionName) {
      case 'content':
      return $scope.note.trans.content && $scope.note.trans.content.length && $scope.isOnboarding('notes');
      case 'title':
      return $scope.isOnboarding('notes') && $scope.focusedTextProperty !== 'content' &&
             !($scope.note.trans.content && $scope.note.trans.content.length);
    }
  };

  $scope.getNoteContentInstructionText = function(){
    if ($rootScope.columns === 3){
      return 'when done, save your note by clicking \'save\' in the top-right corner';
    }else{
      return 'when done, save your note by clicking \'save\' in the top-left corner or swipe left';
    }
  };


  // SAVING, DELETING

  $scope.deleteNoteInEdit = function() {
    $scope.processDelete($scope.note, $scope.deleteNote, $scope.undeleteNote);
  };

  $scope.endNoteEdit = $scope.closeEditor;

  function noteEditorAboutToClose(exitAppAfterSave) {
    if (angular.isFunction($scope.unregisterEditorAboutToCloseCallback))
      $scope.unregisterEditorAboutToCloseCallback('NoteEditorController');

    if ($scope.isEdited($scope.note) && !$scope.note.trans.deleted){
      if ($scope.features.notes.getStatus() === 'onboarding_1'){
        $scope.increaseOnboardingPhase('notes');
      }
      // Save note manually here
      if (exitAppAfterSave){
        return $scope.saveNote($scope.note);
      }else{
        return $scope.deferEdit().then(function() {
          $scope.saveNote($scope.note);
        });
      }
    }else{
      NotesService.resetNote($scope.note);
    }
  }

  $scope.clickFavorite = function() {
    if (!$scope.note.trans.favorited)
      $scope.favoriteNote($scope.note);
    else
      $scope.unfavoriteNote($scope.note);
  };

  // MODES

  $scope.gotoNoteTitle = function() {
    if (typeof gotoTitleCallback === 'function') gotoTitleCallback();
    if (!$scope.isFirstSlide('noteEditor')) $scope.swipeToBasic('noteEditor');
  };

  var gotoTitleCallback;
  $scope.registerGotoNoteTitleCallback = function(callback) {
    gotoTitleCallback = callback;
  };

  // UI

  function isSubEditorOpenInListEditor(){
    return $scope.listPickerOpen || $scope.keywordsPickerOpen || $scope.revisionPickerOpen;
  }
  $scope.registerIsSubEditorOpenCondition(isSubEditorOpenInListEditor);

  $scope.getNotePropertyNameInEdit = function() {
    var propertyName = $scope.getPropertyNameInEdit();
    if (!propertyName && $scope.keywordsPickerOpen) {
      propertyName = 'key' + ($rootScope.columns === 1 ? '-\n' : '') + 'words';
    }
    return propertyName;
  };

  $scope.isExpanded = function() {
    return DrawerService.isExpanded('right');
  };

  // CONTENT

  var noteContentFocusCallback;
  $scope.registerNoteContentInputCallbacks = function(focus){
    noteContentFocusCallback = focus;
    if ($scope.mode === 'omnibar') {
      // Execute focus right away.
      noteContentFocusCallback();
    }
  };

  // TITLEBAR

  $scope.noteTitlebarTextKeyDown = function (keydownEvent) {
    $scope.handleBasicTitlebarKeydown(keydownEvent, $scope.note);
    // Return
    if (event.keyCode === 13){
      noteContentFocusCallback();
      event.preventDefault();
      event.stopPropagation();
    } else if (event.keyCode === 8 && $scope.note.trans.title === 'untitled'){
      // When pressing backspace on 'untitled', remove the entire title
      $scope.note.trans.title = undefined;
    }
  };

  // PUBLISHING

  $scope.getNotePublicPath = function(note){
    return URLService.getVisibleUrl(
              ContentService.getAbsoluteUrlPrefix() + '/our/' +
              UserSessionService.getHandle(note.trans.owner) + '/' +
              note.visibility.path);
  };

  $scope.getNotePublicInfo = function(note){
    var licenceText = note.visibility.licence ? ' under the ' + note.visibility.licence +
                      ' licence': ', all rights reserved';
    return 'published at ' + $scope.formatToLocaleDateWithTime(note.visibility.published) + licenceText;
  };

  $scope.getNotePreviewPath = function(note){
    if (note.visibility && note.visibility.preview && (note.visibility.previewExpires > (Date.now()+300000))){
      return ContentService.getAbsoluteUrlPrefix() + '/preview/' + note.trans.owner + '/' +
                 note.trans.uuid + '/' + note.visibility.preview;
    }
  };

  $scope.openPreviewNoteDialog = function(note){
    return $scope.createPreviewLink(note).then(function(response){
      var previewNoteModalParams = {
        messageHeading: 'preview page created',
        messageIngress: 'preview expires on ' + $scope.formatToLocaleDateWithTime(response.previewExpires),
        messageText: [{
          type: 'linkExternal',
          data: 'click here to open preview',
          url: $scope.getNotePreviewPath(note)
        }],
        confirmText: 'got it',
        allowCancel: true
      };
      $scope.showModal(undefined, previewNoteModalParams);
    });
  };

  $scope.openPublishNoteDialog = function(note){
    if (!$scope.isNotePublishable(note)){
      UISessionService.pushNotification({
        type: 'fyi',
        text: 'no saved changed to publish'
      });
    } else if (!UserSessionService.getHandle(note.trans.owner) ||
        !UserSessionService.getDisplayName(note.trans.owner)){
      var previewNoteModalParams = {
        messageHeading: 'update preferences',
        messageIngress: 'before publishing your first note, you need to set your handle and display name',
        confirmText: 'open preferences',
        confirmAction: function() {
          $scope.openEditor('user', $scope.getPublishingInfo(note), 'publishing');
        },
        allowCancel: true
      };
      $scope.showModal(undefined, previewNoteModalParams);
    }else{
      var licenceValue =
        UserSessionService.getUIPreference('useCC', note.trans.owner) ? $rootScope.CC_LICENCE : undefined;
      // Override with previous licence for this if this note already has been published
      if (note.visibility && note.visibility.path) licenceValue = note.visibility.licence;
      note.trans.cc = licenceValue === $rootScope.CC_LICENCE;

      var defaultSharing = UserSessionService.getUIPreference('sharing', note.trans.owner);
      var sharing = defaultSharing ? defaultSharing : false;
      // Override with previous sharing for this note if this note already has been published
      if (note.visibility && note.visibility.publicUi) sharing =
        JSON.parse(note.visibility.publicUi).sharing;
      note.trans.sharing = sharing;

      var defaultIndexing = UserSessionService.getUIPreference('indexing', note.trans.owner);
      var indexing = defaultIndexing ? defaultIndexing : false;
      // Override with previous index value for this note if this note already has been published
      if (note.visibility && note.visibility.indexed) indexing = true;
      note.trans.indexing = indexing;

      note.trans.publishPath = note.visibility && note.visibility.path ? note.visibility.path : undefined;
      if (!note.trans.publishPath){
        // Create a path from note title
        note.trans.publishPath = note.trans.title.toLowerCase();
        note.trans.publishPath = note.trans.publishPath.replaceAll(' ', '-');
        note.trans.publishPath = note.trans.publishPath.replaceAll('ä', 'a');
        note.trans.publishPath = note.trans.publishPath.replaceAll('ö', 'o');
        note.trans.publishPath = note.trans.publishPath.replace(/[^0-9a-z-]/gi, '');
      }
      var messageForm = {
        input: note.trans.publishPath,
        inputPlaceholder: 'enter path\u2026',
        inputMaxLength: 128,
        inputPattern: /^[0-9a-z-]+$/,
        inputErrorText: 'path must be lower case and can not contain spaces',
        checkbox: note.trans.cc,
        checkboxText: 'publish under creative commons (' + $rootScope.CC_LICENCE + ')',
        checkbox2: note.trans.sharing,
        checkboxText2: 'enable social sharing',
        checkbox3: note.trans.indexing,
        checkboxText3: 'include note in the public directory',
        submitErrorText: 'publishing failed'
      };

      var publishNoteModalParams = {
        messageHeading: 'publish note',
        messageIngress: 'set a path and licence for the note',
        messageForm: messageForm,
        confirmText: 'publish',
        confirmTextDeferred: 'publishing\u2026',
        confirmActionDeferredFn: function(messageForm){
          var licence = messageForm.checkbox ? $rootScope.CC_LICENCE : undefined;
          var publicUi = messageForm.checkbox2 ? {sharing:true} : undefined;
          var indexing = messageForm.checkbox3;
          return NotesService.publishNote($scope.note, messageForm.input, licence, indexing, publicUi);
        },
        confirmActionDeferredParam: messageForm,
        allowCancel: true
      };
      $scope.showModal(undefined, publishNoteModalParams);
    }
  };

  $scope.isNotePublishable = function(note){
    return note.uuid &&
      (!note.visibility || !note.visibility.published || (note.revision > note.visibility.publishedRevision));
  };

  $scope.openUnpublishNoteDialog = function(note){
    var unpublishNoteModalParams = {
      messageHeading: 'unpublish note',
      messageIngress: 'are you sure you want to make this note private again?',
      confirmText: 'unpublish',
      confirmTextDeferred: 'unpublishing\u2026',
      confirmActionDeferredFn: function(note){
        return NotesService.unpublishNote(note);
      },
      confirmActionDeferredParam: note,
      allowCancel: true
    };
    $scope.showModal(undefined, unpublishNoteModalParams);
  };

  // KEYWORDS

  function clearKeyword() {
    $scope.newKeyword = TagsService.getNewTag({tagType: 'keyword'}, UISessionService.getActiveUUID());
  }
  clearKeyword(); // Initialize new keyword.

  $scope.addNewKeywordToNote = function(note, newKeyword) {
    if (!newKeyword || !newKeyword.trans.title) return; // No text entered.
    if (note.trans.keywords) {
      var noteKeyword = note.trans.keywords.findFirstObjectByKeyValue('title', newKeyword.trans.title);

      if (noteKeyword !== undefined) {
        // Note's existing keyword. Do not re-add.
        clearKeyword();
        return;
      }
    }

    var keywords = $scope.getTagsArray('keywords', {owner: $scope.note.trans.owner});
    var exisitingKeyword = keywords.findFirstObjectByKeyValue('title', newKeyword.trans.title, 'trans');
    var keywordToAdd = exisitingKeyword || newKeyword;
    // Add already existing keyword or newly created keyword.
    $scope.addKeywordToNote(note, keywordToAdd);
  };

  $scope.addKeywordToNote = function(note, keyword) {
    function doAddKeywordToNote(note, keyword, removedParent){
      if (!note.trans.keywords) note.trans.keywords = [];
      var removedParentIndex = note.trans.keywords.indexOf(removedParent);
      if (removedParentIndex !== -1){
        note.trans.keywords.splice(removedParentIndex, 1);
      }
      note.trans.keywords.push(keyword);
      clearKeyword();
    }
    if (!keyword.trans.uuid){
      // Save new keyword immediately to prevent problems with sorting
      $scope.saveKeyword(keyword).then(function(){
        doAddKeywordToNote(note, keyword);
      });
    }else {
      // First check if the keyword is a child keyword and the note already as the parent
      // in which case we want to remove the parent and keep only the child
      var removedParent;
      if (keyword.trans.parent &&
          note.trans.keywords &&
          note.trans.keywords.indexOf(keyword.trans.parent) !== -1){
        removedParent = keyword.trans.parent;
      }
      doAddKeywordToNote(note, keyword, removedParent);
    }
  };

  $scope.removeKeywordFromNote = function(note, keyword) {
    note.trans.keywords.splice(note.trans.keywords.indexOf(keyword), 1);
  };

  $scope.getKeywordsListString = function(note) {
    var keywordsList = '';

    for (var i = 0; i < note.trans.keywords.length; i++) {
      if (!note.trans.keywords[i].trans.deleted){
        if (keywordsList !== ''){
          // Separate keywords with comma and non-breaking space.
          // NOTE:  Non-breaking space is used to make Clamp.js (when used) work better - with regular space
          //        it would remove word following the space leaving trailing comma + ellipsis in the end.
          //        With nbsp, last keyword is split.
          keywordsList += ',\xA0';
        }
        keywordsList += '#' + note.trans.keywords[i].trans.title; // Add hash character into keyword
      }
    }
    return keywordsList;
  };

  $scope.openKeywordsPicker = function() {
    $scope.keywordsPickerOpen = true;
    if (angular.isFunction($scope.registerSubEditorDoneCallback)) {
      $scope.registerSubEditorDoneCallback(function() {
        if ($scope.newKeyword.trans.title) {
          $scope.addKeywordToNote($scope.note, $scope.newKeyword);
        }
        $scope.closeKeywordsPicker();
      });
    }
    if (angular.isFunction($scope.registerHasSubEditorEditedCallback)) {
      $scope.registerHasSubEditorEditedCallback(function() {
        return $scope.newKeyword && $scope.newKeyword.trans.title;
      });
    }
  };

  $scope.closeKeywordsPicker = function() {
    $scope.keywordsPickerOpen = false;
    clearKeyword();
    if (angular.isFunction($scope.unregisterHasSubEditorEditedCallback))
      $scope.unregisterHasSubEditorEditedCallback();
  };

  function hasActiveKeywords(note){
    if (note.trans.keywords && note.trans.keywords.length){
      for (var i=0; i<note.trans.keywords.length; i++){
        if (!note.trans.keywords[i].trans.deleted) return true;
      }
    }
  }

  $scope.getActiveKeywords = function(note){
    var activeKeywords = [];
    if (note.trans.keywords && note.trans.keywords.length){
      for (var i=0; i<note.trans.keywords.length; i++){
        if (!note.trans.keywords[i].trans.deleted) activeKeywords.push(note.trans.keywords[i]);
      }
    }
    return activeKeywords;
  };

  $scope.getVisibleKeywords = function(note){
    var activeKeywords = $scope.getActiveKeywords(note);
    var visibleKeywords = [];
    for (var i=0; i<activeKeywords.length; i++){
      visibleKeywords.push({
        uuid: activeKeywords[i].trans.uuid,
        firstPart: '#' + (activeKeywords[i].trans.parent ?
          activeKeywords[i].trans.parent.trans.title : activeKeywords[i].trans.title),
        secondPart: activeKeywords[i].trans.parent ? activeKeywords[i].trans.title : undefined
      });
    }
    return visibleKeywords;
  };

  $scope.getUnselectedCommonCollectiveKeywords = function(note) {
    var commonCollectiveKeywords = $scope.getTagsArray('collectiveKeywords', {owner: note.trans.owner});
    if (commonCollectiveKeywords.length === 1){
      return commonCollectiveKeywords[0].array;
    }
  };

  $scope.hasAvailableCommonCollectiveKeywords = function(note) {
    return $scope.getTagsArray('collectiveKeywords', {owner: note.trans.owner}).length;
  };

  $scope.toggleCollapsible = function() {
    $scope.collapsibleOpen = !$scope.collapsibleOpen;
  };

  function hasUnsetCollapsableProperty() {
    return !$scope.note.trans.list || !$scope.note.trans.link || ($scope.fullEditor &&
            (!$scope.note.trans.keywords || !$scope.note.trans.keywords.length));
  }

  var showFooterCallbacks = {};
  $scope.registerShowFooterCallback = function(callback, id) {
    if (!showFooterCallbacks[id]) {
      showFooterCallbacks[id] = callback;
    }
  };

  $scope.toggleExpand = function() {
    $scope.toggleExpandEditor();
  };

  // REVISION HANDLING

  $scope.closeNoteRevisionPickerAndActivateRevision = function(note, revision){
    var promise = $scope.closeRevisionPickerAndActivateRevision(note, revision);
    if (promise){
      promise.then(function(revisionItem){
        var revisionItemType = revisionItem.trans.itemType;
        NotesService.resetNote(revisionItem);
        if (revisionItemType === 'note'){
          // Use one bigger revision number to force creation of a new revision right now
          var newRevision = $scope.note.revision + 1;
          $scope.note.trans = revisionItem.trans;
          $scope.note.revision = newRevision;
          NotesService.saveNote($scope.note).then(function(result){
            if (result === 'unmodified') $scope.note.revision = $scope.note.revision - 1;
          });
        }else if (revisionItemType === 'task'){
          $scope.convertToTask(revisionItem);
        } else if (revisionItemType === 'list'){
          $scope.convertToList(revisionItem);
        }
      });
    }
  };

  // WATCH FOR CHANGES

  function setNoteWatch(){
    return $scope.$watch(function() {
      // Execute footer callbacks
      for (var id in showFooterCallbacks) {
        var showFooter = $scope.showNoteEditorComponent(id);
        if (showFooterCallbacks.hasOwnProperty(id)) showFooterCallbacks[id](showFooter);
      }
      if (($scope.note.trans.content && $scope.note.trans.content.length) &&
          (!$scope.note.trans.title || !$scope.note.trans.title.length)) {
        // Set untitled as title when title is missing but there is content
        $scope.note.trans.title = 'untitled';
      }
      // Autosave on every tick. Function is debounced so it can be called every digest
      if (!$scope.isAutoSavingPrevented()) $scope.autoSave($scope.note);
    });
  }
  var clearNoteWatch = setNoteWatch();

  // REINITIALIZING

  function reinitializeNoteEditor(){
    clearNoteWatch();
    clearNoteWatch = setNoteWatch();
    $scope.resetSaveStatus();
  }
  $scope.registerReinitializeEditorCallback(reinitializeNoteEditor);

  // CLEAN UP

  $scope.$on('$destroy', function() {
    clearNoteWatch();
    if (angular.isFunction($scope.unregisterReinitializeEditorCallback))
      $scope.unregisterReinitializeEditorCallback();
    if (angular.isFunction($scope.unregisterEditorAboutToCloseCallback)){
      $scope.unregisterEditorAboutToCloseCallback();
    }
  });
}

NoteEditorController['$inject'] = ['$rootScope', '$scope', '$timeout', '$window', 'ContentService',
'DrawerService', 'NotesService', 'SwiperService', 'TagsService', 'UISessionService', 'URLService',
'UserSessionService'];
angular.module('em.main').controller('NoteEditorController', NoteEditorController);

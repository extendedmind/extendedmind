'use strict';

describe('extended mind', function() {
  const h = browser.params.helpers;
  const vr = browser.params.visualreview;
  it('should have the correct visual layout for an existing user', function() {
    // Load the login page and press login
    browser.get('http://localhost:8008/login');
    element(by.model('user.username')).sendKeys('timo@ext.md');
    element(by.model('user.password')).sendKeys('timopwd');
    h.waitForBackendReady(40000).then(function () {
      vr.takeScreenshot('login-ready');
      const doneButton = element(by.buttonText('done'));
      doneButton.click();
      h.waitForUrlToChangeTo('http://localhost:8008/my', 10000).then(function () {

        // FOCUS
        const activeSlide = element(by.xpath(h.XPATH_FOCUS_TASKS_TODAY_SLIDE));
        expect(activeSlide.isDisplayed()).toBeTruthy();
        const activeSlideHeading = activeSlide.element(by.css('h2.group-heading'));
        expect(activeSlideHeading.getText()).toBe('today');
        vr.takeScreenshot('focus-tasks-today');
        const menuButton = element(by.xpath(h.XPATH_MENU_BUTTON));
        menuButton.click();
        browser.driver.sleep(h.MENU_ANIMATION_SPEED);
        vr.takeScreenshot('focus-tasks-today-menu');
        const focusToNotesLink = element(by.xpath(h.XPATH_FOCUS_TASKS_SLIDE +
                                                  h.XPATH_FOOTER_NAVIGATION_LINK.replace('${linkText}', 'notes')));
        focusToNotesLink.click();
        browser.driver.sleep(h.SWIPER_ANIMATION_SPEED);
        vr.takeScreenshot('focus-notes-menu');
        const focusToTasksLink = element(by.xpath(h.XPATH_FOCUS_NOTES_SLIDE +
                                                  h.XPATH_FOOTER_NAVIGATION_LINK.replace('${linkText}', 'tasks')));
        focusToTasksLink.click();
        browser.driver.sleep(h.SWIPER_ANIMATION_SPEED);

        // TASK EDITOR
        const finalizeEssayLink = element(by.xpath(h.XPATH_FOCUS_TASKS_TODAY_SLIDE +
                                                   h.XPATH_LINK_LIST_ITEM.replace('${linkText}', 'finalize essay')));
        expect(finalizeEssayLink.isDisplayed()).toBeTruthy();
        finalizeEssayLink.click();
        const activeTaskEditorSlide = element(by.xpath(h.XPATH_TASK_EDITOR_BASIC_SLIDE));
        expect(activeTaskEditorSlide.isDisplayed()).toBeTruthy();
        vr.takeScreenshot('focus-tasks-today-menu-editor-basic');
        const listPickerLink = element(by.xpath(h.XPATH_TASK_EDITOR_BASIC_SLIDE + h.XPATH_LINK_SWIPER_CLICK.replace('${clickMethod}', 'openListPicker()')));
        listPickerLink.click();
        const listPickerDone = element(by.xpath(h.XPATH_EDITOR_HIGHLIGHTED_LINK.replace('${linkText}', 'done')));
        expect(listPickerDone.isDisplayed()).toBeTruthy();
        vr.takeScreenshot('focus-tasks-today-menu-editor-basic-list');
        listPickerDone.click();
        const contextPickerLink = element(by.xpath(h.XPATH_TASK_EDITOR_BASIC_SLIDE + h.XPATH_LINK_SWIPER_CLICK.replace('${clickMethod}', 'openContextPicker()')));
        contextPickerLink.click();
        const contextPickerDone = element(by.xpath(h.XPATH_EDITOR_HIGHLIGHTED_LINK.replace('${linkText}', 'done')));
        expect(contextPickerDone.isDisplayed()).toBeTruthy();
        vr.takeScreenshot('focus-tasks-today-menu-editor-basic-context');
        contextPickerDone.click();
        const taskEditorAdvancedLink = element(by.xpath(h.XPATH_EDITOR_FOOTER_NAVIGATION_LINK.replace('${linkText}', 'advanced')));
        taskEditorAdvancedLink.click();
        browser.driver.sleep(h.SWIPER_ANIMATION_SPEED);
        let taskEditorCloseLink = element(by.xpath(h.XPATH_EDITOR_CLOSE.replace('${ItemType}', 'Task')));
        expect(taskEditorCloseLink.isDisplayed()).toBeTruthy();
        vr.takeScreenshot('focus-tasks-today-menu-editor-advanced');
        const repeatingPickerLink = element(by.xpath(h.XPATH_TASK_EDITOR_ADVANCED_SLIDE + h.XPATH_LINK_SWIPER_CLICK.replace('${clickMethod}', 'openRepeatingPicker()')));
        repeatingPickerLink.click();
        const repeatingPickerDone = element(by.xpath(h.XPATH_EDITOR_HIGHLIGHTED_LINK.replace('${linkText}', 'done')));
        expect(repeatingPickerDone.isDisplayed()).toBeTruthy();
        vr.takeScreenshot('focus-tasks-today-menu-editor-repeating');
        repeatingPickerDone.click();
        taskEditorCloseLink.click();

        // USER
        const userLink = element(by.xpath(h.XPATH_MENU_LINK.replace('${linkText}', 'timo@ext.md')));
        userLink.click();
        const accountLink = element(by.xpath(h.XPATH_USER_HOME_SLIDE + h.XPATH_LINK_ITEM.replace('${linkText}', 'account')));
        expect(accountLink.isDisplayed()).toBeTruthy();
        vr.takeScreenshot('user-home-menu');
        accountLink.click();
        browser.driver.sleep(h.SWIPER_ANIMATION_SPEED);
        const changePasswordLink = element(by.xpath(h.XPATH_USER_DETAILS_SLIDE + h.XPATH_LINK_ITEM.replace('${linkText}', 'change password')));
        expect(changePasswordLink.isDisplayed()).toBeTruthy();
        vr.takeScreenshot('user-details-menu');
        changePasswordLink.click();
        const closeChangePasswordEditor = element(by.xpath(h.XPATH_EDITOR_HEADER_NAVIGATION_LINK.replace('${linkText}', 'back')));
        expect(closeChangePasswordEditor.isDisplayed()).toBeTruthy();
        vr.takeScreenshot('user-details-menu-change-password-editor');
        closeChangePasswordEditor.click();
        const changeEmailLink = element(by.xpath(h.XPATH_USER_DETAILS_SLIDE + h.XPATH_LINK_ITEM.replace('${linkText}', 'change email')));
        changeEmailLink.click();
        const closeChangeEmailEditor = element(by.xpath(h.XPATH_EDITOR_HEADER_NAVIGATION_LINK.replace('${linkText}', 'back')));
        expect(closeChangeEmailEditor.isDisplayed()).toBeTruthy();
        vr.takeScreenshot('user-details-menu-change-email-editor');
        closeChangeEmailEditor.click();
        const updatePublishingLink = element(by.xpath(h.XPATH_USER_DETAILS_SLIDE + h.XPATH_LINK_ITEM.replace('${linkText}', 'update publishing information')));
        updatePublishingLink.click();
        const closeUpdatePublishingEditor = element(by.xpath(h.XPATH_EDITOR_HEADER_NAVIGATION_LINK.replace('${linkText}', 'back')));
        expect(closeUpdatePublishingEditor.isDisplayed()).toBeTruthy();
        vr.takeScreenshot('user-details-menu-update-publishing-editor');
        closeUpdatePublishingEditor.click();
        const deleteAccountLink = element(by.xpath(h.XPATH_USER_DETAILS_SLIDE + h.XPATH_LINK_ITEM.replace('${linkText}', 'delete account')));
        deleteAccountLink.click();
        const closeDeleteAccountEditor = element(by.xpath(h.XPATH_EDITOR_HEADER_NAVIGATION_LINK.replace('${linkText}', 'back')));
        expect(closeDeleteAccountEditor.isDisplayed()).toBeTruthy();
        vr.takeScreenshot('user-details-menu-delete-account-editor');
        closeDeleteAccountEditor.click();

        // INBOX
        const inboxLink = element(by.xpath(h.XPATH_MENU_LINK.replace('${linkText}', 'inbox')));
        inboxLink.click();
        const rememberTheMilkLink = element(by.xpath(h.XPATH_INBOX_CONTENT + h.XPATH_LINK_LIST_ITEM.replace('${linkText}', 'remember the milk')));
        expect(rememberTheMilkLink.isDisplayed()).toBeTruthy();
        vr.takeScreenshot('inbox-menu');
        rememberTheMilkLink.click();
        const itemEditorCloseLink = element(by.xpath(h.XPATH_EDITOR_CLOSE.replace('${ItemType}', 'Item')));
        expect(itemEditorCloseLink.isDisplayed()).toBeTruthy();
        vr.takeScreenshot('inbox-menu-editor');
        itemEditorCloseLink.click();

        // TASKS
        const tasksLink = element(by.xpath(h.XPATH_MENU_LINK.replace('${linkText}', 'tasks')));
        tasksLink.click();
        const writeEssayBodyLink = element(by.xpath(h.XPATH_TASKS_ALL_SLIDE + h.XPATH_LINK_LIST_ITEM.replace('${linkText}', 'write essay body')));
        expect(writeEssayBodyLink.isDisplayed()).toBeTruthy();
        vr.takeScreenshot('tasks-all-menu');
        writeEssayBodyLink.click();
        taskEditorCloseLink = element(by.xpath(h.XPATH_EDITOR_CLOSE.replace('${ItemType}', 'Task')));
        expect(taskEditorCloseLink.isDisplayed()).toBeTruthy();
        vr.takeScreenshot('tasks-all-menu-editor-basic');
        taskEditorCloseLink.click();
        const tasksToContextsLink = element(by.xpath(h.XPATH_TASKS_ALL_SLIDE +
                                                     h.XPATH_FOOTER_NAVIGATION_LINK.replace('${linkText}', 'contexts')));
        tasksToContextsLink.click();
        browser.driver.sleep(h.SWIPER_ANIMATION_SPEED);
        vr.takeScreenshot('tasks-contexts-menu');
        const computerContextLink = element(by.xpath(h.XPATH_TASKS_CONTEXTS_SLIDE + h.XPATH_LINK_LIST_ITEM.replace('${linkText}', '@computer')));
        computerContextLink.click();
        browser.driver.sleep(h.SWIPER_ANIMATION_SPEED);
        vr.takeScreenshot('tasks-context-menu');

        // CONTEXT EDITOR
        const computerContextHeadingLink = element(by.xpath(h.XPATH_TASKS_CONTEXT_SLIDE + h.XPATH_LINK_SWIPER_CLICK.replace('${clickMethod}', 'openContextEditor(context)')));
        computerContextHeadingLink.click();
        const contextEditorCloseLink = element(by.xpath(h.XPATH_EDITOR_CLOSE.replace('${ItemType}', 'Tag')));
        expect(contextEditorCloseLink.isDisplayed()).toBeTruthy();
        vr.takeScreenshot('tasks-context-menu-editor');
        contextEditorCloseLink.click();

        // NOTES
        const notesLink = element(by.xpath(h.XPATH_MENU_LINK.replace('${linkText}', 'notes')));
        notesLink.click();
        const notesOnProductivityLink = element(by.xpath(h.XPATH_NOTES_CONTENT + h.XPATH_LINK_LIST_ITEM.replace('${linkText}', 'notes on productivity')));
        expect(notesOnProductivityLink.isDisplayed()).toBeTruthy();
        vr.takeScreenshot('notes-menu');

        // NOTE EDITOR
        notesOnProductivityLink.click();
        let noteEditorCloseLink = element(by.xpath(h.XPATH_EDITOR_CLOSE.replace('${ItemType}', 'Note')));
        expect(noteEditorCloseLink.isDisplayed()).toBeTruthy();
        vr.takeScreenshot('notes-menu-editor-basic');
        const noteListPickerLink = element(by.xpath(h.XPATH_NOTE_EDITOR_BASIC_SLIDE + h.XPATH_LINK_SWIPER_CLICK.replace('${clickMethod}', 'openListPicker()')));
        noteListPickerLink.click();
        const noteListPickerDone = element(by.xpath(h.XPATH_EDITOR_HIGHLIGHTED_LINK.replace('${linkText}', 'done')));
        expect(noteListPickerDone.isDisplayed()).toBeTruthy();
        vr.takeScreenshot('notes-menu-editor-basic-list');
        noteListPickerDone.click();
        const noteKeywordsPickerLink = element(by.xpath(h.XPATH_NOTE_EDITOR_BASIC_SLIDE + h.XPATH_LINK_SWIPER_CLICK.replace('${clickMethod}', 'openKeywordsPicker()')));
        noteKeywordsPickerLink.click();
        const noteKeywordsPickerDone = element(by.xpath(h.XPATH_EDITOR_HIGHLIGHTED_LINK.replace('${linkText}', 'done')));
        expect(noteKeywordsPickerDone.isDisplayed()).toBeTruthy();
        vr.takeScreenshot('notes-menu-editor-basic-keywords');
        noteKeywordsPickerDone.click();
        noteEditorCloseLink.click();

        // LISTS
        const listsLink = element(by.xpath(h.XPATH_MENU_LINK.replace('${linkText}', 'lists')));
        listsLink.click();
        const tripToDublinLink = element(by.xpath(h.XPATH_LISTS_ACTIVE_SLIDE + h.XPATH_LINK_LIST_ITEM.replace('${linkText}', 'trip to Dublin')));
        expect(tripToDublinLink.isDisplayed()).toBeTruthy();
        vr.takeScreenshot('lists-active-menu');

        // LIST
        tripToDublinLink.click();
        expect(element(by.xpath(h.XPATH_LIST_TASKS_SLIDE + h.XPATH_LINK_LIST_ITEM.replace('${linkText}', 'print tickets'))).isDisplayed()).toBeTruthy();
        vr.takeScreenshot('list-tasks-menu');
        const listToNotesLink = element(by.xpath(h.XPATH_LIST_TASKS_SLIDE +
                                                 h.XPATH_FOOTER_NAVIGATION_LINK.replace('${linkText}', 'notes')));
        listToNotesLink.click();
        browser.driver.sleep(h.SWIPER_ANIMATION_SPEED);
        vr.takeScreenshot('list-notes-menu');

        // LIST EDITOR
        const listHeadingLink = element(by.xpath(h.XPATH_TOOLBAR_HEADING_BUTTON));
        listHeadingLink.click();
        let listEditorCloseLink = element(by.xpath(h.XPATH_EDITOR_CLOSE.replace('${ItemType}', 'List')));
        expect(listEditorCloseLink.isDisplayed()).toBeTruthy();
        vr.takeScreenshot('list-notes-menu-editor-basic');
        const parentListPickerLink = element(by.xpath(h.XPATH_LIST_EDITOR_BASIC_SLIDE + h.XPATH_LINK_SWIPER_CLICK.replace('${clickMethod}', 'openListPicker()')));
        parentListPickerLink.click();
        const parentListPickerDone = element(by.xpath(h.XPATH_EDITOR_HIGHLIGHTED_LINK.replace('${linkText}', 'done')));
        expect(parentListPickerDone.isDisplayed()).toBeTruthy();
        vr.takeScreenshot('list-notes-menu-editor-basic-parent');
        parentListPickerDone.click();
        const listEditorAdvancedLink = element(by.xpath(h.XPATH_EDITOR_FOOTER_NAVIGATION_LINK.replace('${linkText}', 'advanced')));
        listEditorAdvancedLink.click();
        browser.driver.sleep(h.SWIPER_ANIMATION_SPEED);
        vr.takeScreenshot('list-notes-menu-editor-advanced');
        const listShareEditorLink = element(by.xpath(h.XPATH_LIST_EDITOR_ADVANCED_SLIDE + h.XPATH_LINK_SWIPER_CLICK.replace('${clickMethod}', 'openListShareEditor()')));
        listShareEditorLink.click();
        const listShareEditorDone = element(by.xpath(h.XPATH_EDITOR_HIGHLIGHTED_LINK.replace('${linkText}', 'done')));
        expect(listShareEditorDone.isDisplayed()).toBeTruthy();
        vr.takeScreenshot('list-notes-menu-editor-advanced-share');
        listShareEditorDone.click();
        listEditorCloseLink.click();

        // TRASH
        const trashLink = element(by.xpath(h.XPATH_MENU_LINK.replace('${linkText}', 'trash')));
        trashLink.click();
        const trashHeading = element(by.xpath(h.XPATH_HEADING.replace('${headingText}', '0 deleted')));
        expect(trashHeading.isDisplayed()).toBeTruthy();
        vr.takeScreenshot('trash-menu');

        // SETTINGS
        const settingsLink = element(by.xpath(h.XPATH_MENU_LINK.replace('${linkText}', 'settings')));
        settingsLink.click();
        const settingsHeading = element(by.xpath(h.XPATH_HEADING.replace('${headingText}', 'settings')));
        expect(settingsHeading.isDisplayed()).toBeTruthy();
        vr.takeScreenshot('settings-menu-top');

        // OMNIBAR
        const omnibarButton = element(by.xpath(h.XPATH_OMNIBAR_BUTTON));
        omnibarButton.click();
        const omnibarCloseLink = element(by.xpath(h.XPATH_LINK_SWIPER_CLICK.replace('${clickMethod}', 'closeEditor()')));
        expect(omnibarCloseLink.isDisplayed()).toBeTruthy();
        vr.takeScreenshot('settings-menu-omnibar');
        const expandLink = element(by.xpath(h.XPATH_LINK_SWIPER_CLICK.replace('${clickMethod}', 'toggleExpand()')));
        expandLink.click();
        const editLink = element(by.xpath(h.XPATH_EDITOR_HIGHLIGHTED_LINK.replace('${linkText}', 'edit')));
        expect(editLink.isDisplayed()).toBeTruthy();
        vr.takeScreenshot('settings-menu-omnibar-keywords');
        editLink.click();
        const secretKeywordLink = element(by.xpath(h.XPATH_KEYWORD_LINK.replace('${linkText}', '#secret')));
        expect(secretKeywordLink.isDisplayed()).toBeTruthy();
        vr.takeScreenshot('settings-menu-omnibar-keywords-edit');
        secretKeywordLink.click();
        const keywordEditorCloseLink = element(by.xpath(h.XPATH_EDITOR_CLOSE.replace('${ItemType}', 'Tag')));
        expect(keywordEditorCloseLink.isDisplayed()).toBeTruthy();
        vr.takeScreenshot('settings-menu-keyword-editor');
        const parentKeywordPickerLink = element(by.xpath(h.XPATH_LINK_SWIPER_CLICK.replace('${clickMethod}', 'openParentPicker()')));
        parentKeywordPickerLink.click();
        const parentKeywordPickerDone = element(by.xpath(h.XPATH_TAG_EDITOR_HIGHLIGHTED_LINK.replace('${linkText}', 'done')));
        expect(parentKeywordPickerDone.isDisplayed()).toBeTruthy();
        vr.takeScreenshot('settings-menu-keyword-editor-parent');
        parentKeywordPickerDone.click();
        keywordEditorCloseLink.click();

        // LOGOUT
        userLink.click();
        const logoutButton = element(by.xpath(h.XPATH_FOOTER_BUTTON.replace('${clickMethod}', 'logOut()')));
        logoutButton.click();
        h.waitForUrlToChangeTo('http://localhost:8008/entry', 10000).then(function () {
          const entryMainSlide = element(by.xpath(h.XPATH_ENTRY_MAIN_SLIDE));
          expect(entryMainSlide.isDisplayed()).toBeTruthy();
        });
      });
    });
  });
});
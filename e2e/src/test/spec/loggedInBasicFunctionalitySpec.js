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
      const errorSearch = by.css('.text-error');
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
        const errorSearch = by.css('.text-error');
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
        const taskEditorAdvancedLink = element(by.xpath(h.XPATH_EDITOR_FOOTER_NAVIGATION_LINK.replace('${linkText}', 'advanced')));
        taskEditorAdvancedLink.click();
        browser.driver.sleep(h.SWIPER_ANIMATION_SPEED);
        let taskEditorCloseLink = element(by.xpath(h.XPATH_EDITOR_CLOSE.replace('${ItemType}', 'Task')));
        expect(taskEditorCloseLink.isDisplayed()).toBeTruthy();
        vr.takeScreenshot('focus-tasks-today-menu-editor-advanced');
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
        vr.takeScreenshot('tasks-all-menu-editor');
        taskEditorCloseLink.click();

        // NOTES
        const notesLink = element(by.xpath(h.XPATH_MENU_LINK.replace('${linkText}', 'notes')));
        notesLink.click();
        const notesOnProductivityLink = element(by.xpath(h.XPATH_NOTES_CONTENT + h.XPATH_LINK_LIST_ITEM.replace('${linkText}', 'notes on productivity')));
        expect(notesOnProductivityLink.isDisplayed()).toBeTruthy();
        vr.takeScreenshot('notes-menu');
        notesOnProductivityLink.click();
        let noteEditorCloseLink = element(by.xpath(h.XPATH_EDITOR_CLOSE.replace('${ItemType}', 'Note')));
        expect(noteEditorCloseLink.isDisplayed()).toBeTruthy();
        vr.takeScreenshot('notes-menu-editor');
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

/*        let noteEditorCloseLink = element(by.xpath(h.XPATH_EDITOR_CLOSE.replace('${ItemType}', 'Note')));
        expect(noteEditorCloseLink.isDisplayed()).toBeTruthy();
        vr.takeScreenshot('notes-menu-editor');
        noteEditorCloseLink.click();
*/

      });
    });
  });
});
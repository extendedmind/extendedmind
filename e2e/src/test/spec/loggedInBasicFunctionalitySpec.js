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
        // Assert that we are in the today page
        const activeSlide = element(by.xpath(h.XPATH_FOCUS_TASKS_TODAY_SLIDE));
        expect(activeSlide.isDisplayed()).toBeTruthy();
        const activeSlideHeading = activeSlide.element(by.css('h2.group-heading'));
        expect(activeSlideHeading.getText()).toBe('today');
        vr.takeScreenshot('focus-tasks-today');

        // Find menu button
        const menuButton = element(by.xpath(h.XPATH_MENU_BUTTON));
        menuButton.click();
        browser.driver.sleep(h.MENU_ANIMATION_SPEED);
        vr.takeScreenshot('focus-tasks-today-menu');
        const errorSearch = by.css('.text-error');

        // Go to notes and back
        const focusToNotesLink = element(by.xpath(h.XPATH_FOCUS_TASKS_SLIDE +
                                                  h.XPATH_FOOTER_NAVIGATION_LINK.replace('${linkText}', 'notes')));
        focusToNotesLink.click();
        browser.driver.sleep(h.SWIPER_ANIMATION_SPEED);
        vr.takeScreenshot('focus-notes-menu');
        const focusToTasksLink = element(by.xpath(h.XPATH_FOCUS_NOTES_SLIDE +
                                                  h.XPATH_FOOTER_NAVIGATION_LINK.replace('${linkText}', 'tasks')));
        focusToTasksLink.click();
        browser.driver.sleep(h.SWIPER_ANIMATION_SPEED);

        // Find finalize essay task and click editor open
        // NOTE: Xpath search always needs full path
        const finalizeEssayLink = element(by.xpath(h.XPATH_FOCUS_TASKS_TODAY_SLIDE +
                                                   h.XPATH_LINK_LIST_ITEM.replace('${linkText}', 'finalize essay')));
        expect(finalizeEssayLink.isDisplayed()).toBeTruthy();
        finalizeEssayLink.click();
        const activeTaskEditorSlide = element(by.xpath(h.XPATH_TASK_EDITOR_BASIC_SLIDE));
        expect(activeTaskEditorSlide.isDisplayed()).toBeTruthy();
        vr.takeScreenshot('focus-tasks-today-menu-editor');
        let taskEditorCloseLink = element(by.xpath(h.XPATH_EDITOR_CLOSE.replace('${ItemType}', 'Task')));
        taskEditorCloseLink.click();

        // Go to inbox
        const inboxLink = element(by.xpath(h.XPATH_MENU_LINK.replace('${linkText}', 'inbox')));
        inboxLink.click();
        vr.takeScreenshot('inbox-menu');
        const rememberTheMilkLink = element(by.xpath(h.XPATH_INBOX_CONTENT + h.XPATH_LINK_LIST_ITEM.replace('${linkText}', 'remember the milk')));
        rememberTheMilkLink.click();
        vr.takeScreenshot('inbox-menu-editor');
        const itemEditorCloseLink = element(by.xpath(h.XPATH_EDITOR_CLOSE.replace('${ItemType}', 'Item')));
        itemEditorCloseLink.click();

        // Go to tasks
        const tasksLink = element(by.xpath(h.XPATH_MENU_LINK.replace('${linkText}', 'tasks')));
        tasksLink.click();
        vr.takeScreenshot('tasks-menu');
        const writeEssayBodyLink = element(by.xpath(h.XPATH_TASKS_ALL_SLIDE + h.XPATH_LINK_LIST_ITEM.replace('${linkText}', 'write essay body')));
        writeEssayBodyLink.click();
        vr.takeScreenshot('tasks-menu-editor');
        taskEditorCloseLink = element(by.xpath(h.XPATH_EDITOR_CLOSE.replace('${ItemType}', 'Task')));
        taskEditorCloseLink.click();

        // Go to notes
        const notesLink = element(by.xpath(h.XPATH_MENU_LINK.replace('${linkText}', 'notes')));
        notesLink.click();
        vr.takeScreenshot('notes-menu');
        const notesOnProductivityLink = element(by.xpath(h.XPATH_NOTES_CONTENT + h.XPATH_LINK_LIST_ITEM.replace('${linkText}', 'notes on productivity')));
        notesOnProductivityLink.click();
        vr.takeScreenshot('notes-menu-editor');
        let noteEditorCloseLink = element(by.xpath(h.XPATH_EDITOR_CLOSE.replace('${ItemType}', 'Note')));
        noteEditorCloseLink.click();
      });
    });
  });
});
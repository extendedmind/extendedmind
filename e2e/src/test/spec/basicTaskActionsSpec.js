'use strict';

describe('extended mind tasks', function() {
  const h = browser.params.helpers;
  const vr = browser.params.visualreview;
  it('should have basic functionality for an existing user', function() {
    // Load the login page and press login
    browser.get('http://localhost:8008/login');
    element(by.model('user.username')).sendKeys('jp@ext.md');
    element(by.model('user.password')).sendKeys('jiipeepwd');
    h.waitForBackendReady(40000).then(function () {
      const doneButton = element(by.buttonText('done'));
      doneButton.click();
      h.waitForUrlToChangeTo('http://localhost:8008/my', 10000).then(function () {
        const activeSlide = element(by.xpath(h.XPATH_FOCUS_TASKS_TODAY_SLIDE));
        expect(activeSlide.isDisplayed()).toBeTruthy();
        const activeSlideHeading = activeSlide.element(by.css('h2.group-heading'));
        expect(activeSlideHeading.getText()).toBe('today');

        // ADD TWO TASKS TO TODAY
        const addTaskButton =  element(by.xpath(h.XPATH_FOCUS_TASKS_SLIDE + h.XPATH_ADD_ITEM));
        addTaskButton.click();
        let newItemTextarea = element(by.xpath(h.XPATH_FOCUS_TASKS_TODAY_SLIDE + '//textarea'));
        newItemTextarea.sendKeys('test today task');
        browser.actions().sendKeys(protractor.Key.ENTER).perform();
        newItemTextarea = element(by.xpath(h.XPATH_FOCUS_TASKS_TODAY_SLIDE + '//textarea'));
        newItemTextarea.sendKeys('second test today task');
        browser.actions().sendKeys(protractor.Key.ENTER).perform();
        browser.actions().sendKeys(protractor.Key.ESCAPE).perform();

        // OPEN EDITOR, CHANGE TITLE AND SNOOZE TO TOMORROW
        const testTodayTaskLink = element(by.xpath(h.XPATH_FOCUS_TASKS_TODAY_SLIDE +
                                                   h.XPATH_UNCOMPLETED_TASK.replace('${linkText}', 'test today task')));
        expect(testTodayTaskLink.isDisplayed()).toBeTruthy();
        testTodayTaskLink.click();
        element(by.model('task.trans.title')).sendKeys(', no wait tomorrow');
        const snoozeToTomorrow = element(by.xpath(h.XPATH_TASK_EDITOR_BASIC_SLIDE +
                                                   h.XPATH_LINK_ITEM.replace('${linkText}', 'tomorrow')));
        snoozeToTomorrow.click();
        browser.actions().sendKeys(protractor.Key.ARROW_DOWN).perform();
        browser.driver.sleep(h.SWIPER_ANIMATION_SPEED);
        const testTomorrowTaskLink = element(by.xpath(h.XPATH_FOCUS_TASKS_TOMORROW_SLIDE +
                                                   h.XPATH_UNCOMPLETED_TASK.replace('${linkText}', 'test today task, no wait tomorrow')));
        expect(testTomorrowTaskLink.isDisplayed()).toBeTruthy();
        browser.actions().sendKeys(protractor.Key.ARROW_UP).perform();
        browser.driver.sleep(h.SWIPER_ANIMATION_SPEED);
        const secondTestTaskToday = element(by.xpath(h.XPATH_FOCUS_TASKS_TODAY_SLIDE +
                                                   h.XPATH_UNCOMPLETED_TASK.replace('${linkText}', 'second test today task')));
        expect(secondTestTaskToday.isDisplayed()).toBeTruthy();

        // COMPLETE
        const secondTestTaskTodayComplete = element(by.xpath(h.XPATH_FOCUS_TASKS_TODAY_SLIDE +
                                                   h.XPATH_LINK_LIST_ITEM.replace('${linkText}', 'second test today task') +
                                                   h.XPATH_PRECEDING_COMPLETE));
        secondTestTaskTodayComplete.click();
        const toggleTodayCompleted = element(by.xpath(h.XPATH_FOCUS_TASKS_TODAY_SLIDE +
                                                      h.XPATH_TOGGLE_COMPLETE_BUTTON));
        toggleTodayCompleted.click();
        const completedSecondTestTaskToday = element(by.xpath(h.XPATH_FOCUS_TASKS_TODAY_SLIDE +
                                                     h.XPATH_COMPLETED_TASK.replace('${linkText}', 'second test today task')));
        expect(completedSecondTestTaskToday.isDisplayed()).toBeTruthy();

        const secondTestTaskTodayUncomplete = element(by.xpath(h.XPATH_FOCUS_TASKS_TODAY_SLIDE +
                                                   h.XPATH_COMPLETED_TASK.replace('${linkText}', 'second test today task') +
                                                   h.XPATH_PRECEDING_COMPLETE));
        secondTestTaskTodayUncomplete.click();
        const uncompletedSecondTestTaskToday = element(by.xpath(h.XPATH_FOCUS_TASKS_TODAY_SLIDE +
                                                   h.XPATH_UNCOMPLETED_TASK.replace('${linkText}', 'second test today task')));
        expect(uncompletedSecondTestTaskToday.isDisplayed()).toBeTruthy();

        // DELETE AND UNDELETE
        secondTestTaskToday.click();
        let secondTestTaskTodayDelete = element(by.xpath(h.XPATH_EDITOR_DELETE.replace('${ItemType}', 'Task')));
        expect(secondTestTaskTodayDelete.isDisplayed()).toBeTruthy();
        secondTestTaskTodayDelete.click();
        const toasterUndoLink = element(by.xpath(h.XPATH_TOASTER_INLINE_LINK));
        toasterUndoLink.click();
        expect(secondTestTaskToday.isDisplayed()).toBeTruthy();

        // ADD TASK THAT CONVERTS TO NOTE AND ONE THAT IS A LIST
        addTaskButton.click();
        newItemTextarea = element(by.xpath(h.XPATH_FOCUS_TASKS_TODAY_SLIDE + '//textarea'));
        newItemTextarea.sendKeys('task that is a note');
        browser.actions().sendKeys(protractor.Key.ENTER).perform();
        newItemTextarea = element(by.xpath(h.XPATH_FOCUS_TASKS_TODAY_SLIDE + '//textarea'));
        newItemTextarea.sendKeys('task that is a list');
        browser.actions().sendKeys(protractor.Key.ENTER).perform();
        browser.actions().sendKeys(protractor.Key.ESCAPE).perform();
        const taskThatIsANoteLinkXpath = by.xpath(h.XPATH_FOCUS_TASKS_TODAY_SLIDE +
                                                   h.XPATH_UNCOMPLETED_TASK.replace('${linkText}', 'task that is a note'));
        const taskThatIsANoteLink = element(taskThatIsANoteLinkXpath);
        expect(taskThatIsANoteLink.isDisplayed()).toBeTruthy();
        taskThatIsANoteLink.click();
        const taskEditorAdvancedLink = element(by.xpath(h.XPATH_EDITOR_FOOTER_NAVIGATION_LINK.replace('${linkText}', 'advanced')));
        taskEditorAdvancedLink.click();
        browser.driver.sleep(h.SWIPER_ANIMATION_SPEED);
        const convertToNoteLink = element(by.xpath(h.XPATH_TASK_EDITOR_ADVANCED_SLIDE +
                                                   h.XPATH_LINK_ITEM.replace('${linkText}', 'note')));
        convertToNoteLink.click();
        element(by.xpath(h.XPATH_EDITOR_CLOSE.replace('${ItemType}', 'Note'))).click();
        expect(browser.driver.isElementPresent(taskThatIsANoteLinkXpath)).toBeFalsy();

        const taskThatIsAListLinkXpath = by.xpath(h.XPATH_FOCUS_TASKS_TODAY_SLIDE +
                                                   h.XPATH_UNCOMPLETED_TASK.replace('${linkText}', 'task that is a list'));
        const taskThatIsAListLink = element(taskThatIsAListLinkXpath);
        expect(taskThatIsAListLink.isDisplayed()).toBeTruthy();
        taskThatIsAListLink.click();
        taskEditorAdvancedLink.click();
        browser.driver.sleep(h.SWIPER_ANIMATION_SPEED);
        const convertToListLink = element(by.xpath(h.XPATH_TASK_EDITOR_ADVANCED_SLIDE +
                                                   h.XPATH_LINK_ITEM.replace('${linkText}', 'list')));
        convertToListLink.click();
        element(by.xpath(h.XPATH_EDITOR_CLOSE.replace('${ItemType}', 'List'))).click();
        expect(browser.driver.isElementPresent(taskThatIsAListLinkXpath)).toBeFalsy();

        // OPEN MENU AND NAVIGATE TO NOTES AND LISTS AND VERIFY PRESENCE OF CONVERTED TASKS
        const menuButton = element(by.xpath(h.XPATH_MENU_BUTTON));
        menuButton.click();
        browser.driver.sleep(h.MENU_ANIMATION_SPEED);
        const notesLink = element(by.xpath(h.XPATH_MENU_LINK.replace('${linkText}', 'notes')));
        notesLink.click();
        const convertedNoteLink = element(by.xpath(h.XPATH_NOTES_CONTENT + h.XPATH_LINK_LIST_ITEM.replace('${linkText}', 'task that is a note')));
        expect(convertedNoteLink.isDisplayed()).toBeTruthy();
        const listsLink = element(by.xpath(h.XPATH_MENU_LINK.replace('${linkText}', 'lists')));
        listsLink.click();
        const convertedListLink = element(by.xpath(h.XPATH_LISTS_ACTIVE_SLIDE + h.XPATH_LINK_LIST_ITEM.replace('${linkText}', 'task that is a list')));
        expect(convertedListLink.isDisplayed()).toBeTruthy();

        // LOGOUT
        const userLink = element(by.xpath(h.XPATH_MENU_LINK.replace('${linkText}', 'jp@ext.md')));
        userLink.click();
        const logoutButton = element(by.xpath(h.XPATH_FOOTER_BUTTON.replace('${clickMethod}', 'logOut()')));
        logoutButton.click();
        h.waitForUrlToChangeTo('http://localhost:8008/entry', 10000).then(function () {
          const entryMainSlide = element(by.xpath(h.XPATH_ENTRY_MAIN_SLIDE));
          expect(entryMainSlide.isDisplayed()).toBeTruthy();
        });
      });
    });
  }, 60000); // Use a large enough timeout for this test
});
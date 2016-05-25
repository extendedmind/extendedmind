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

        // OPEN MENU AND NAVIGATE TO USER
        const menuButton = element(by.xpath(h.XPATH_MENU_BUTTON));
        menuButton.click();
        browser.driver.sleep(h.MENU_ANIMATION_SPEED);
        const userLink = element(by.xpath(h.XPATH_MENU_LINK.replace('${linkText}', 'jp@ext.md')));
        userLink.click();

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
  }, 60000); // Use a large enough timeout for this test
});
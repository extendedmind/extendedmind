'use strict';

describe('extended mind lists', function() {
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

        // NAVIGATE TO LISTS
        const menuButton = element(by.xpath(h.XPATH_MENU_BUTTON));
        menuButton.click();
        browser.driver.sleep(h.MENU_ANIMATION_SPEED);
        const listsLink = element(by.xpath(h.XPATH_MENU_LINK.replace('${linkText}', 'lists')));
        listsLink.click();

        // ADD TWO NEW LISTS
        const addListButton =  element(by.xpath(h.XPATH_LISTS_ACTIVE_SLIDE + h.XPATH_ADD_ITEM));
        addListButton.click();
        let newItemTextarea = element(by.xpath(h.XPATH_LISTS_ACTIVE_SLIDE + '//textarea'));
        newItemTextarea.sendKeys('test list');
        browser.actions().sendKeys(protractor.Key.ENTER).perform();
        newItemTextarea = element(by.xpath(h.XPATH_LISTS_ACTIVE_SLIDE + '//textarea'));
        newItemTextarea.sendKeys('second test list');
        browser.actions().sendKeys(protractor.Key.ENTER).perform();
        browser.actions().sendKeys(protractor.Key.ESCAPE).perform();
        const firstTestListLink = element(by.xpath(h.XPATH_LISTS_ACTIVE_SLIDE +
                                                   h.XPATH_LINK_LIST_ITEM.replace('${linkText}', 'test list')));
        expect(firstTestListLink.isDisplayed()).toBeTruthy();
        const secondTestListLink = element(by.xpath(h.XPATH_LISTS_ACTIVE_SLIDE +
                                                   h.XPATH_LINK_LIST_ITEM.replace('${linkText}', 'second test list')));
        expect(secondTestListLink.isDisplayed()).toBeTruthy();

        // OPEN EDITOR, CHANGE TITLE AND FAVORITE
        firstTestListLink.click();
        const listHeadingLink = element(by.xpath(h.XPATH_TOOLBAR_HEADING_BUTTON));
        listHeadingLink.click();
        element(by.model('list.trans.title')).sendKeys(' is my favorite');
        const favoriteLink = element(by.xpath(h.XPATH_LIST_EDITOR_BASIC_SLIDE + h.XPATH_LINK_SWIPER_CLICK.replace('${clickMethod}', 'clickFavorite()')));
        favoriteLink.click();
        element(by.xpath(h.XPATH_EDITOR_CLOSE.replace('${ItemType}', 'List'))).click();
        listsLink.click();
        const favoriteListMenuLinkXpath = by.xpath(h.XPATH_MENU_LINK_SMALL.replace('${linkText}', 'test list is my favorite'));
        const favoriteListMenuLink = element(favoriteListMenuLinkXpath);
        favoriteListMenuLink.click();
        listHeadingLink.click();
        favoriteLink.click();
        element(by.xpath(h.XPATH_EDITOR_CLOSE.replace('${ItemType}', 'List'))).click();
        listsLink.click();
        expect(browser.driver.isElementPresent(favoriteListMenuLinkXpath)).toBeFalsy();

        // DELETE AND UNDELETE
        secondTestListLink.click();
        listHeadingLink.click();
        let secondTestListDelete = element(by.xpath(h.XPATH_EDITOR_DELETE.replace('${ItemType}', 'List')));
        expect(secondTestListDelete.isDisplayed()).toBeTruthy();
        secondTestListDelete.click();
        const toasterUndoLink = element(by.xpath(h.XPATH_TOASTER_INLINE_LINK));
        toasterUndoLink.click();
        expect(secondTestListLink.isDisplayed()).toBeTruthy();

        // NAVIGATE TO SETTINGS AND ENABLE ARCHIVE
        const settingsLink = element(by.xpath(h.XPATH_MENU_LINK.replace('${linkText}', 'settings')));
        settingsLink.click();
        const enableArchiveCheckbox = element(by.xpath(h.XPATH_SETTINGS_CONTENT +
                                                   h.XPATH_TEXT_LINK_CONTAINER.replace('${linkText}', 'lists archive') +
                                                   h.XPATH_PRECEDING_COMPLETE));
        enableArchiveCheckbox.click();
        listsLink.click();

        // ARCHIVE AND UNARCHIVE
        secondTestListLink.click();
        listHeadingLink.click();
        const archiveLink = element(by.xpath(h.XPATH_EDITOR_HIGHLIGHTED_LINK.replace('${linkText}', 'archive')));
        archiveLink.click();
        const archiveButton = element(by.xpath(h.XPATH_MODAL_BUTTON.replace('${linkText}', 'archive')));
        archiveButton.click();
        const activeToArchivedLink = element(by.xpath(h.XPATH_LISTS_ACTIVE_SLIDE +
                                                     h.XPATH_FOOTER_NAVIGATION_LINK.replace('${linkText}', 'archived')));
        activeToArchivedLink.click();
        browser.driver.sleep(h.SWIPER_ANIMATION_SPEED);
        const archivedSecondTestListLinkXpath = by.xpath(h.XPATH_LISTS_ARCHIVED_SLIDE +
                                                   h.XPATH_LINK_LIST_ITEM.replace('${linkText}', 'second test list'));
        const archivedSecondTestListLink = element(archivedSecondTestListLinkXpath);
        expect(archivedSecondTestListLink.isDisplayed()).toBeTruthy();
        archivedSecondTestListLink.click();
        listHeadingLink.click();
        const unarchiveLink = element(by.xpath(h.XPATH_EDITOR_HIGHLIGHTED_LINK.replace('${linkText}', 'activate')));
        unarchiveLink.click();
        const unarchiveButton = element(by.xpath(h.XPATH_MODAL_BUTTON.replace('${linkText}', 'activate')));
        unarchiveButton.click();
        expect(secondTestListLink.isDisplayed()).toBeTruthy();
        activeToArchivedLink.click();
        browser.driver.sleep(h.SWIPER_ANIMATION_SPEED);
        expect(browser.driver.isElementPresent(archivedSecondTestListLinkXpath)).toBeFalsy();
        const archivedToActiveLink = element(by.xpath(h.XPATH_LISTS_ARCHIVED_SLIDE +
                                                     h.XPATH_FOOTER_NAVIGATION_LINK.replace('${linkText}', 'active')));
        archivedToActiveLink.click();
        browser.driver.sleep(h.SWIPER_ANIMATION_SPEED);

        // REMOVE ARCHIVE FEATURE AGAIN FROM SETTINGS
        settingsLink.click();
        enableArchiveCheckbox.click();
        listsLink.click();

        // ADD LIST THAT CONVERTS TO NOTE AND ONE THAT CONVERTS TO TASK
        addListButton.click();
        newItemTextarea = element(by.xpath(h.XPATH_LISTS_ACTIVE_SLIDE + '//textarea'));
        newItemTextarea.sendKeys('list that is a note');
        browser.actions().sendKeys(protractor.Key.ENTER).perform();
        newItemTextarea = element(by.xpath(h.XPATH_LISTS_ACTIVE_SLIDE + '//textarea'));
        newItemTextarea.sendKeys('list that is a task');
        browser.actions().sendKeys(protractor.Key.ENTER).perform();
        browser.actions().sendKeys(protractor.Key.ESCAPE).perform();
        const listThatIsANoteLinkXpath = by.xpath(h.XPATH_LISTS_ACTIVE_SLIDE +
                                                   h.XPATH_LINK_LIST_ITEM.replace('${linkText}', 'list that is a note'));
        const listThatIsANoteLink = element(listThatIsANoteLinkXpath);
        expect(listThatIsANoteLink.isDisplayed()).toBeTruthy();
        listThatIsANoteLink.click();
        listHeadingLink.click();
        const listEditorAdvancedLink = element(by.xpath(h.XPATH_EDITOR_FOOTER_NAVIGATION_LINK.replace('${linkText}', 'advanced')));
        listEditorAdvancedLink.click();
        browser.driver.sleep(h.SWIPER_ANIMATION_SPEED);
        const convertToNoteLink = element(by.xpath(h.XPATH_LIST_EDITOR_ADVANCED_SLIDE +
                                                   h.XPATH_LINK_ITEM.replace('${linkText}', 'note')));
        convertToNoteLink.click();
        element(by.xpath(h.XPATH_EDITOR_CLOSE.replace('${ItemType}', 'Note'))).click();
        listsLink.click();
        expect(browser.driver.isElementPresent(listThatIsANoteLinkXpath)).toBeFalsy();
        const listThatIsATaskLinkXpath = by.xpath(h.XPATH_LISTS_ACTIVE_SLIDE +
                                                   h.XPATH_LINK_LIST_ITEM.replace('${linkText}', 'list that is a task'));
        const listThatIsATaskLink = element(listThatIsATaskLinkXpath);
        expect(listThatIsATaskLink.isDisplayed()).toBeTruthy();
        listThatIsATaskLink.click();
        listHeadingLink.click();
        listEditorAdvancedLink.click();
        browser.driver.sleep(h.SWIPER_ANIMATION_SPEED);
        const convertToTaskLink = element(by.xpath(h.XPATH_LIST_EDITOR_ADVANCED_SLIDE +
                                                   h.XPATH_LINK_ITEM.replace('${linkText}', 'task')));
        convertToTaskLink.click();
        element(by.xpath(h.XPATH_EDITOR_CLOSE.replace('${ItemType}', 'Task'))).click();
        listsLink.click();
        expect(browser.driver.isElementPresent(listThatIsATaskLinkXpath)).toBeFalsy();

        // OPEN MENU AND NAVIGATE TO TASKS AND NOTES AND VERIFY PRESENCE OF CONVERTED LISTS
        const tasksLink = element(by.xpath(h.XPATH_MENU_LINK.replace('${linkText}', 'tasks')));
        tasksLink.click();
        const convertedTaskLink = element(by.xpath(h.XPATH_TASKS_ALL_SLIDE + h.XPATH_LINK_LIST_ITEM.replace('${linkText}', 'list that is a task')));
        expect(convertedTaskLink.isDisplayed()).toBeTruthy();
        const notesLink = element(by.xpath(h.XPATH_MENU_LINK.replace('${linkText}', 'notes')));
        notesLink.click();
        const convertedNoteLink = element(by.xpath(h.XPATH_NOTES_CONTENT + h.XPATH_LINK_LIST_ITEM.replace('${linkText}', 'list that is a note')));
        expect(convertedNoteLink.isDisplayed()).toBeTruthy();

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
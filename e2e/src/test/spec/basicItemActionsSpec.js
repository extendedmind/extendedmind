'use strict';

describe('extended mind items', function() {
  const h = browser.params.helpers;
  it('should have basic functionality for an existing user', function() {
    // Load the login page and press login
    browser.get('http://localhost:8008/login');
    element(by.model('user.username')).sendKeys('jp@extendedmind.org');
    element(by.model('user.password')).sendKeys('jiipeepwd');
    h.waitForBackendReady(40000).then(function () {
      const doneButton = element(by.buttonText('done'));
      doneButton.click();
      h.waitForUrlToChangeTo('http://localhost:8008/my', 10000).then(function () {
        const activeSlide = element(by.xpath(h.XPATH_FOCUS_TASKS_TODAY_SLIDE));
        expect(activeSlide.isDisplayed()).toBeTruthy();
        const activeSlideHeading = activeSlide.element(by.css('h2.group-heading'));
        expect(activeSlideHeading.getText()).toBe('today');

        // ADD TWO ITEMS TO INBOX FROM OMNIBAR
        const omnibarButton = element(by.xpath(h.XPATH_OMNIBAR_BUTTON));
        omnibarButton.click();
        element(by.model('titlebar.text')).sendKeys('test item');
        browser.actions().sendKeys(protractor.Key.ENTER).perform();
        element(by.xpath(h.XPATH_TOASTER_CLOSE_LINK)).click();
        omnibarButton.click();
        element(by.model('titlebar.text')).sendKeys('second test item');
        browser.actions().sendKeys(protractor.Key.ENTER).perform();
        element(by.xpath(h.XPATH_TOASTER_CLOSE_LINK)).click();

        // NAVIGATE TO INBOX AND ADD TWO MORE FROM THERE
        const menuButton = element(by.xpath(h.XPATH_MENU_BUTTON));
        menuButton.click();
        browser.driver.sleep(h.MENU_ANIMATION_SPEED);
        const inboxLink = element(by.xpath(h.XPATH_MENU_LINK.replace('${linkText}', 'inbox')));
        inboxLink.click();
        const addItemButton =  element(by.xpath(h.XPATH_INBOX + h.XPATH_ADD_ITEM));
        addItemButton.click();
        let newItemTextarea = element(by.xpath(h.XPATH_INBOX + '//textarea'));
        newItemTextarea.sendKeys('third test item');
        browser.actions().sendKeys(protractor.Key.ENTER).perform();
        newItemTextarea.sendKeys('fourth test item');
        browser.actions().sendKeys(protractor.Key.ENTER).perform();
        browser.actions().sendKeys(protractor.Key.ESCAPE).perform();
        const testItemLinkXpath = by.xpath(h.XPATH_INBOX_CONTENT +
                                              h.XPATH_LINK_LIST_ITEM.replace('${linkText}', 'test item'));
        const testItemLink = element(testItemLinkXpath);
        expect(testItemLink.isDisplayed()).toBeTruthy();
        const secondItemLinkXpath = by.xpath(h.XPATH_INBOX_CONTENT +
                                                h.XPATH_LINK_LIST_ITEM.replace('${linkText}', 'second test item'));
        const secondItemLink = element(secondItemLinkXpath);
        expect(secondItemLink.isDisplayed()).toBeTruthy();
        const thirdItemLinkXpath = by.xpath(h.XPATH_INBOX_CONTENT +
                                              h.XPATH_LINK_LIST_ITEM.replace('${linkText}', 'third test item'));
        const thirdItemLink = element(thirdItemLinkXpath);
        expect(thirdItemLink.isDisplayed()).toBeTruthy();
        const fourthItemLinkXpath = by.xpath(h.XPATH_INBOX_CONTENT +
                                                h.XPATH_LINK_LIST_ITEM.replace('${linkText}', 'fourth test item'));
        const fourthItemLink = element(fourthItemLinkXpath);
        expect(fourthItemLink.isDisplayed()).toBeTruthy();

        // OPEN EDITOR, CHANGE TITLE AND CONVERT ONE TO A TASK
        testItemLink.click();
        element(by.model('item.trans.title')).sendKeys(' is a task');
        const convertToTaskLink = element(by.xpath(h.XPATH_ITEM_EDITOR +
                                                   h.XPATH_LINK_ITEM.replace('${linkText}', 'task')));
        convertToTaskLink.click();
        element(by.xpath(h.XPATH_EDITOR_CLOSE.replace('${ItemType}', 'Task'))).click();

        // PROCESS REST OF ITEMS WITH RECURRING EDITOR
        const recurringButton =  element(by.xpath(h.XPATH_INBOX + h.XPATH_LEFT_ACTION));
        recurringButton.click();

        // CONVERT FOURTH ITEM TO A NOTE
        element(by.model('item.trans.title')).sendKeys(' is a note');
        const convertToNoteLink = element(by.xpath(h.XPATH_ITEM_EDITOR +
                                                   h.XPATH_LINK_ITEM.replace('${linkText}', 'note')));
        convertToNoteLink.click();
        element(by.xpath(h.XPATH_RECURRING_NEXT)).click();

        // SKIP THIRD ITEM AND LEAVE IT TO THE INBOX
        element(by.xpath(h.XPATH_RECURRING_SKIP)).click();

        // CONVERT SECOND ITEM TO LIST
        const convertToListLink = element(by.xpath(h.XPATH_ITEM_EDITOR +
                                                   h.XPATH_LINK_ITEM.replace('${linkText}', 'list')));
        convertToListLink.click();
        // Undo and convert again
        element(by.xpath(h.XPATH_RECURRING_UNDO)).click();
        convertToListLink.click();
        element(by.model('list.trans.title')).sendKeys(' is a list');
        element(by.xpath(h.XPATH_RECURRING_FINISH)).click();

        // VERIFY THAT CONVERTING WORKED
        expect(element(testItemLinkXpath).isPresent()).toBeFalsy();
        expect(element(secondItemLinkXpath).isPresent()).toBeFalsy();
        expect(element(fourthItemLinkXpath).isPresent()).toBeFalsy();
        expect(thirdItemLink.isDisplayed()).toBeTruthy();

        // DELETE AND UNDELETE
        thirdItemLink.click();
        let thirdTestItemDelete = element(by.xpath(h.XPATH_EDITOR_DELETE.replace('${ItemType}', 'Item')));
        expect(thirdTestItemDelete.isDisplayed()).toBeTruthy();
        thirdTestItemDelete.click();
        const toasterUndoLink = element(by.xpath(h.XPATH_TOASTER_INLINE_LINK));
        toasterUndoLink.click();
        expect(thirdItemLink.isDisplayed()).toBeTruthy();

        // OPEN MENU AND NAVIGATE TO TASKS, NOTES AND LISTS AND VERIFY PRESENCE OF CONVERTED ITEMS
        const tasksLink = element(by.xpath(h.XPATH_MENU_LINK.replace('${linkText}', 'tasks')));
        tasksLink.click();
        const convertedTaskLink = element(by.xpath(h.XPATH_TASKS_ALL_SLIDE + h.XPATH_LINK_LIST_ITEM.replace('${linkText}', 'test item is a task')));
        expect(convertedTaskLink.isDisplayed()).toBeTruthy();

        const notesLink = element(by.xpath(h.XPATH_MENU_LINK.replace('${linkText}', 'notes')));
        notesLink.click();
        const convertedNoteLink = element(by.xpath(h.XPATH_NOTES_CONTENT + h.XPATH_LINK_LIST_ITEM.replace('${linkText}', 'fourth test item is a note')));
        expect(convertedNoteLink.isDisplayed()).toBeTruthy();
        const listsLink = element(by.xpath(h.XPATH_MENU_LINK.replace('${linkText}', 'lists')));
        listsLink.click();
        const convertedListLink = element(by.xpath(h.XPATH_LISTS_ACTIVE_SLIDE + h.XPATH_LINK_LIST_ITEM.replace('${linkText}', 'second test item is a list')));
        expect(convertedListLink.isDisplayed()).toBeTruthy();

        // SEARCH WITH OMNIBAR AND VERIFY THAT ITEMS ARE FOUND
        omnibarButton.click();
        element(by.model('titlebar.text')).sendKeys('test item is a tas');
        const testItemSearchResult = element(by.xpath(h.XPATH_OMNIBAR_EDITOR +
                                              h.XPATH_LINK_SEARCH_RESULT.replace('${linkText}', 'test item is a task')));
        expect(testItemSearchResult.isDisplayed()).toBeTruthy();
        element(by.model('titlebar.text')).clear().sendKeys('second test item is');
        const secondTestItemSearchResult = element(by.xpath(h.XPATH_OMNIBAR_EDITOR +
                                              h.XPATH_LINK_SEARCH_RESULT.replace('${linkText}', 'second test item is a list')));
        expect(secondTestItemSearchResult.isDisplayed()).toBeTruthy();
        element(by.model('titlebar.text')).clear().sendKeys('third test ite');
        const thirdTestItemSearchResult = element(by.xpath(h.XPATH_OMNIBAR_EDITOR +
                                              h.XPATH_LINK_SEARCH_RESULT.replace('${linkText}', 'third test item')));
        expect(thirdTestItemSearchResult.isDisplayed()).toBeTruthy();
        element(by.model('titlebar.text')).clear().sendKeys('fourth test item is ');
        const fourthTestItemSearchResult = element(by.xpath(h.XPATH_OMNIBAR_EDITOR +
                                              h.XPATH_LINK_SEARCH_RESULT.replace('${linkText}', 'fourth test item is a note')));
        expect(fourthTestItemSearchResult.isDisplayed()).toBeTruthy();

        // LOGOUT
        const userLink = element(by.xpath(h.XPATH_MENU_LINK.replace('${linkText}', 'jp@extendedmind.org')));
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

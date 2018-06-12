'use strict';

describe('extended mind notes', function() {
  const h = browser.params.helpers;
  const vr = browser.params.visualreview;
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

        // NAVIGATE TO NOTES
        const menuButton = element(by.xpath(h.XPATH_MENU_BUTTON));
        menuButton.click();
        browser.driver.sleep(h.MENU_ANIMATION_SPEED);
        const notesLink = element(by.xpath(h.XPATH_MENU_LINK.replace('${linkText}', 'notes')));
        notesLink.click();

        // ADD TWO NOTES
        const addNoteButton = element(by.xpath(h.XPATH_NOTES_ALL + h.XPATH_ADD_ITEM));
        addNoteButton.click();
        element(by.model('note.trans.title')).sendKeys('first test note');
        browser.actions().sendKeys(protractor.Key.ESCAPE).perform();
        addNoteButton.click();
        element(by.model('note.trans.title')).sendKeys('second test note');
        browser.actions().sendKeys(protractor.Key.ESCAPE).perform();
        const firstTestNoteLink = element(by.xpath(h.XPATH_NOTES_CONTENT +
                                                   h.XPATH_LINK_LIST_ITEM.replace('${linkText}', 'first test note')));
        expect(firstTestNoteLink.isDisplayed()).toBeTruthy();
        const secondTestNoteLink = element(by.xpath(h.XPATH_NOTES_CONTENT +
                                                   h.XPATH_LINK_LIST_ITEM.replace('${linkText}', 'second test note')));
        expect(secondTestNoteLink.isDisplayed()).toBeTruthy();

        // OPEN EDITOR, CHANGE TITLE AND FAVORITE
        firstTestNoteLink.click();
        element(by.model('note.trans.title')).sendKeys(' is my favorite');
        const favoriteLink = element(by.xpath(h.XPATH_NOTE_EDITOR_BASIC_SLIDE + h.XPATH_LINK_SWIPER_CLICK.replace('${clickMethod}', 'clickFavorite()')));
        favoriteLink.click();
        element(by.xpath(h.XPATH_EDITOR_CLOSE.replace('${ItemType}', 'Note'))).click();

        // NAVIGATE TO STARRED NOTES, UNFAVORITE AND BACK
        const focusLink = element(by.xpath(h.XPATH_MENU_LINK.replace('${linkText}', 'focus')));
        focusLink.click();
        const focusToNotesLink = element(by.xpath(h.XPATH_FOCUS_TASKS_SLIDE +
                                                  h.XPATH_FOOTER_NAVIGATION_LINK.replace('${linkText}', 'notes')));
        focusToNotesLink.click();
        browser.driver.sleep(h.SWIPER_ANIMATION_SPEED);
        const firstFavoriteNoteInStarredLinkXpath = by.xpath(h.XPATH_FOCUS_NOTES_SLIDE + h.XPATH_LINK_LIST_ITEM.replace('${linkText}', 'first test note is my favorite'));
        const firstFavoriteNoteInStarredLink = element(firstFavoriteNoteInStarredLinkXpath);
        firstFavoriteNoteInStarredLink.click();
        const unfavoriteLink = element(by.xpath(h.XPATH_NOTE_EDITOR_BASIC_SLIDE + h.XPATH_LINK_SWIPER_CLICK.replace('${clickMethod}', 'clickFavorite()')));
        unfavoriteLink.click();
        element(by.xpath(h.XPATH_EDITOR_CLOSE.replace('${ItemType}', 'Note'))).click();
        expect(element(firstFavoriteNoteInStarredLinkXpath).isPresent()).toBeFalsy();
        notesLink.click();
        const firstFavoriteTestNoteLink = element(by.xpath(h.XPATH_NOTES_CONTENT +
                                                   h.XPATH_LINK_LIST_ITEM.replace('${linkText}', 'first test note is my favorite')));
        expect(firstFavoriteTestNoteLink.isDisplayed()).toBeTruthy();

        // DELETE AND UNDELETE
        secondTestNoteLink.click();
        let secondTestNoteDelete = element(by.xpath(h.XPATH_EDITOR_DELETE.replace('${ItemType}', 'Note')));
        expect(secondTestNoteDelete.isDisplayed()).toBeTruthy();
        secondTestNoteDelete.click();
        const toasterUndoLink = element(by.xpath(h.XPATH_TOASTER_INLINE_LINK));
        toasterUndoLink.click();
        expect(secondTestNoteLink.isDisplayed()).toBeTruthy();

        // ADD TASK THAT CONVERTS TO NOTE AND ONE THAT CONVERTS TO LIST
        addNoteButton.click();
        element(by.model('note.trans.title')).sendKeys('note that is a task');
        browser.actions().sendKeys(protractor.Key.ESCAPE).perform();
        addNoteButton.click();
        element(by.model('note.trans.title')).sendKeys('note that is a list');
        browser.actions().sendKeys(protractor.Key.ESCAPE).perform();
        const noteThatIsATaskLinkXpath = by.xpath(h.XPATH_NOTES_CONTENT +
                                                   h.XPATH_LINK_LIST_ITEM.replace('${linkText}', 'note that is a task'));
        const noteThatIsATaskLink = element(noteThatIsATaskLinkXpath);
        expect(noteThatIsATaskLink.isDisplayed()).toBeTruthy();
        noteThatIsATaskLink.click();
        const noteEditorAdvancedLink = element(by.xpath(h.XPATH_EDITOR_FOOTER_NAVIGATION_LINK.replace('${linkText}', 'advanced')));
        noteEditorAdvancedLink.click();
        browser.driver.sleep(h.SWIPER_ANIMATION_SPEED);
        const convertToTaskLink = element(by.xpath(h.XPATH_NOTE_EDITOR_ADVANCED_SLIDE +
                                                   h.XPATH_LINK_ITEM.replace('${linkText}', 'task')));
        convertToTaskLink.click();
        element(by.xpath(h.XPATH_EDITOR_CLOSE.replace('${ItemType}', 'Task'))).click();
        expect(element(noteThatIsATaskLinkXpath).isPresent()).toBeFalsy();

        const noteThatIsAListLinkXpath = by.xpath(h.XPATH_NOTES_CONTENT +
                                                   h.XPATH_LINK_LIST_ITEM.replace('${linkText}', 'note that is a list'));
        const noteThatIsAListLink = element(noteThatIsAListLinkXpath);
        expect(noteThatIsAListLink.isDisplayed()).toBeTruthy();
        noteThatIsAListLink.click();
        noteEditorAdvancedLink.click();
        browser.driver.sleep(h.SWIPER_ANIMATION_SPEED);
        const convertToListLink = element(by.xpath(h.XPATH_NOTE_EDITOR_ADVANCED_SLIDE +
                                                   h.XPATH_LINK_ITEM.replace('${linkText}', 'list')));
        convertToListLink.click();
        element(by.xpath(h.XPATH_EDITOR_CLOSE.replace('${ItemType}', 'List'))).click();
        expect(element(noteThatIsAListLinkXpath).isPresent()).toBeFalsy();

        // OPEN MENU AND NAVIGATE TO TASKS AND LISTS AND VERIFY PRESENCE OF CONVERTED TASKS
        const tasksLink = element(by.xpath(h.XPATH_MENU_LINK.replace('${linkText}', 'tasks')));
        tasksLink.click();
        const convertedTaskLink = element(by.xpath(h.XPATH_TASKS_ALL_SLIDE + h.XPATH_LINK_LIST_ITEM.replace('${linkText}', 'note that is a task')));
        expect(convertedTaskLink.isDisplayed()).toBeTruthy();
        const listsLink = element(by.xpath(h.XPATH_MENU_LINK.replace('${linkText}', 'lists')));
        listsLink.click();
        const convertedListLink = element(by.xpath(h.XPATH_LISTS_ACTIVE_SLIDE + h.XPATH_LINK_LIST_ITEM.replace('${linkText}', 'note that is a list')));
        expect(convertedListLink.isDisplayed()).toBeTruthy();

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

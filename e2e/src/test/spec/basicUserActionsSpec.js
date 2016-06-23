'use strict';

describe('extended mind users', function() {
  const h = browser.params.helpers;
  it('should have basic functionality', function() {
    // Load the sign up page and press and sign up
    browser.get('http://localhost:8008/signup');
    element(by.model('user.username')).sendKeys('signuptest@ext.md');
    element(by.model('user.password')).sendKeys('signuptestpwd');

    const agreeToTermsCheckbox = element(by.xpath(h.XPATH_ENTRY_MAIN_SLIDE +
                                               h.XPATH_TEXT_DETAILS_CONTAINER.replace('${linkText}', 'i have read and agree to the') +
                                               h.XPATH_PRECEDING_COMPLETE));
    agreeToTermsCheckbox.click();
    h.waitForBackendReady(40000).then(function () {
      const doneButton = element(by.buttonText('done'));
      doneButton.click();
      h.waitForUrlToChangeTo('http://localhost:8008/my', 10000).then(function () {

        // COMPLETE TUTORIAL
        let addTaskButton =  element(by.xpath(h.XPATH_FOCUS_TASKS_SLIDE + h.XPATH_ADD_ITEM));
        addTaskButton.click();
        let newItemTextarea = element(by.xpath(h.XPATH_FOCUS_TASKS_TODAY_SLIDE + '//textarea'));
        newItemTextarea.sendKeys('tutorial today task');
        browser.actions().sendKeys(protractor.Key.ENTER).perform();
        const completeTutorialButton = element(by.xpath(h.XPATH_FOOTER_BUTTON.replace('${clickMethod}', 'completeTutorial()')));
        completeTutorialButton.click();
        let activeSlideHeading = element(by.xpath(h.XPATH_FOCUS_TASKS_TODAY_SLIDE)).element(by.css('h2.group-heading'));
        expect(activeSlideHeading.getText()).toBe('today');

        // REMOVE BLINKING TODAY AND ADD TASK TO NO DATE
        activeSlideHeading.click();
        element(by.xpath(h.XPATH_LINK_CLICK.replace('${clickMethod}', 'customToolbar.rightActionFn()'))).click();
        browser.driver.sleep(h.SWIPER_ANIMATION_SPEED);
        activeSlideHeading = element(by.xpath(h.XPATH_FOCUS_TASKS_NO_DATE_SLIDE)).element(by.css('h2.group-heading'));
        expect(activeSlideHeading.getText()).toBe('no date');
        addTaskButton.click();
        newItemTextarea = element(by.xpath(h.XPATH_FOCUS_TASKS_NO_DATE_SLIDE + '//textarea'));
        newItemTextarea.sendKeys('tutorial no date task');
        browser.actions().sendKeys(protractor.Key.ENTER).perform();
        browser.actions().sendKeys(protractor.Key.ESCAPE).perform();

        // OPEN MENU FOR THE FIRST TIME
        const menuButton = element(by.xpath(h.XPATH_MENU_BUTTON));
        menuButton.click();
        browser.driver.sleep(h.MENU_ANIMATION_SPEED);

        // CLICK THROUGH THE SETTINGS TUTORIAL
        element(by.xpath(h.XPATH_MODAL_BUTTON.replace('${linkText}', 'next'))).click();
        browser.driver.sleep(h.MODAL_REPEAT_ANIMATION_SPEED);
        element(by.xpath(h.XPATH_MODAL_BUTTON.replace('${linkText}', 'next'))).click();
        browser.driver.sleep(h.MODAL_REPEAT_ANIMATION_SPEED);
        element(by.xpath(h.XPATH_MODAL_BUTTON.replace('${linkText}', 'got it'))).click();

        // NAVIGATE TO USER ACCOUNT
        let userLink = element(by.xpath(h.XPATH_MENU_LINK.replace('${linkText}', 'signuptest@ext.md')));
        userLink.click();
        const accountLink = element(by.xpath(h.XPATH_USER_HOME_SLIDE + h.XPATH_LINK_SWIPER_CLICK.replace('${clickMethod}', 'swipeToDetails(\'account\')')));
        accountLink.click();
        browser.driver.sleep(h.SWIPER_ANIMATION_SPEED);

        // CHANGE PASSWORD
        const changePasswordLink = element(by.xpath(h.XPATH_USER_DETAILS_SLIDE + h.XPATH_LINK_ITEM.replace('${linkText}', 'change password')));
        expect(changePasswordLink.isDisplayed()).toBeTruthy();
        changePasswordLink.click();
        element(by.model('user.passwordOld')).sendKeys('signuptestpwd');
        element(by.model('user.passwordNew')).sendKeys('signuptestpwd2');
        const changePasswordButton = element(by.xpath(h.XPATH_USER_EDITOR +
                                             h.XPATH_BUTTON_CLICK.replace('${clickMethod}', 'changePassword(user.passwordOld, user.passwordNew)')));
        changePasswordButton.click();

        // LOG OUT, VERIFY EMAIL AND LOG BACK IN WITH NEW PASSWORD
        const userHomeLink = element(by.xpath(h.XPATH_USER_DETAILS_SLIDE +
                                              h.XPATH_FOOTER_NAVIGATION_LINK.replace('${linkText}', 'back')));
        userHomeLink.click();
        browser.driver.sleep(h.SWIPER_ANIMATION_SPEED);
        const logoutButton = element(by.xpath(h.XPATH_FOOTER_BUTTON.replace('${clickMethod}', 'logOut()')));
        logoutButton.click();
        h.waitForUrlToChangeTo('http://localhost:8008/entry', 10000).then(function () {
          const entryMainSlide = element(by.xpath(h.XPATH_ENTRY_MAIN_SLIDE));
          expect(entryMainSlide.isDisplayed()).toBeTruthy();

          const verifyEmailDom = h.readSentEmail(browser.params.emailTestPath, 'signuptest@ext.md verify your email address.html');
          const verifyLinkElement = verifyEmailDom.getElementById('em-button').firstElementChild;
          const verifyUrl = verifyLinkElement.getAttribute('href');
          browser.get(verifyUrl);
          const toasterSuccessText = element(by.xpath(h.XPATH_TOASTER_TEXT.replace('${toasterText}', 'email verified')));
          expect(toasterSuccessText.isDisplayed()).toBeTruthy();
          // TODO: Click does not hit the toaster, because toaster CSS is somehow broken on entry.
          //       This is a minor inconvenience, so just don't try to close the toaster for now.
          //element(by.xpath(h.XPATH_TOASTER_CLOSE_LINK)).click();
          element(by.model('user.username')).sendKeys('signuptest@ext.md');
          element(by.model('user.password')).sendKeys('signuptestpwd2');
          element(by.buttonText('done')).click();
          h.waitForUrlToChangeTo('http://localhost:8008/my', 10000).then(function () {

            // NAVIGATE TO USER
            const activeSlide = element(by.xpath(h.XPATH_FOCUS_TASKS_TODAY_SLIDE));
            expect(activeSlide.isDisplayed()).toBeTruthy();
            const activeSlideHeading = activeSlide.element(by.css('h2.group-heading'));
            expect(activeSlideHeading.getText()).toBe('today');
            menuButton.click();
            browser.driver.sleep(h.MENU_ANIMATION_SPEED);
            userLink.click();
            accountLink.click();
            browser.driver.sleep(h.SWIPER_ANIMATION_SPEED);
            const hasBeenVerified = element(by.xpath(h.XPATH_USER_DETAILS_SLIDE + '//span[text() = "email verified"]'));
            expect(hasBeenVerified.isDisplayed()).toBeTruthy();

            // CHANGE EMAIL
            const changeEmailLink = element(by.xpath(h.XPATH_USER_DETAILS_SLIDE + h.XPATH_LINK_ITEM.replace('${linkText}', 'change email')));
            changeEmailLink.click();
            element(by.model('user.emailNew')).sendKeys('signuptest2@ext.md');
            element(by.model('user.password')).sendKeys('signuptestpwd2');
            const changeEmailButton = element(by.xpath(h.XPATH_USER_EDITOR +
                                                 h.XPATH_BUTTON_CLICK.replace('${clickMethod}', 'changeEmail(user.emailNew, user.password)')));
            changeEmailButton.click();
            const modalCloseButton = element(by.xpath(h.XPATH_MODAL_CLOSE_BUTTON));
            modalCloseButton.click();
            userHomeLink.click();
            browser.driver.sleep(h.SWIPER_ANIMATION_SPEED);

            // LOG OUT AND LOG BACK USING FORGOT PASSWORD
            logoutButton.click();
            h.waitForUrlToChangeTo('http://localhost:8008/entry', 10000).then(function () {

              // FORGOT PASSWORD
              const forgotLink = element(by.xpath(h.XPATH_ENTRY_MAIN_SLIDE +
                                         h.XPATH_LINK_CLICK.replace('${clickMethod}', 'swipeToDetails(\'forgot\')')));
              forgotLink.click();
              browser.driver.sleep(h.SWIPER_ANIMATION_SPEED);
              element(by.xpath(h.XPATH_ENTRY_DETAILS_SLIDE + '//input')).sendKeys('signuptest2@ext.md');
              const doneButton = element(by.buttonText('send instructions'));
              doneButton.click();
              browser.driver.sleep(1000).then(function(){
                const hasBeenSentText = element(by.xpath(h.XPATH_TEXTGROUP_INGRESS.replace('${ingressText}', 'password reset instructions have been sent to your email')));
                expect(hasBeenSentText.isDisplayed()).toBeTruthy();
                const forgotEmailDom = h.readSentEmail(browser.params.emailTestPath, 'signuptest2@ext.md password reset instructions.html');
                const forgotLinkElement = forgotEmailDom.getElementById('em-button').firstElementChild;
                const forgotUrl = forgotLinkElement.getAttribute('href');
                browser.get(forgotUrl);
                element(by.model('user.password')).sendKeys('signuptestpwdreset');
                const resetPasswordButton = element(by.buttonText('done'));
                resetPasswordButton.click();
                h.waitForUrlToChangeTo('http://localhost:8008/my', 10000).then(function () {
                  const activeSlide = element(by.xpath(h.XPATH_FOCUS_TASKS_TODAY_SLIDE));
                  expect(activeSlide.isDisplayed()).toBeTruthy();
                  menuButton.click();
                  browser.driver.sleep(h.MENU_ANIMATION_SPEED);
                  userLink = element(by.xpath(h.XPATH_MENU_LINK.replace('${linkText}', 'signuptest2@ext.md')));
                  userLink.click();
                  accountLink.click();
                  browser.driver.sleep(h.SWIPER_ANIMATION_SPEED);
                  const deleteAccountLink = element(by.xpath(h.XPATH_USER_DETAILS_SLIDE + h.XPATH_LINK_ITEM.replace('${linkText}', 'delete account')));
                  deleteAccountLink.click();
                  element(by.model('user.password')).sendKeys('signuptestpwdreset');
                  const deleteAccountButton = element(by.buttonText('delete'));
                  deleteAccountButton.click();
                  h.waitForUrlToChangeTo('http://localhost:8008/entry', 10000).then(function () {
                    const markedForDeletionHeading = element(by.xpath(h.XPATH_MODAL_HEADING.replace(
                      '${headingText}', 'account marked for deletion')));
                    expect(markedForDeletionHeading.isPresent()).toBeTruthy();
                  });
                });
              });
            });
          });
        });
      });
    });
  }, 60000); // Use a large enough timeout for this test
});
'use strict';

describe('extended mind', function() {
  var helpers = browser.params.helpers;
  var vr = browser.params.visualreview;
  it('should process basic online functionality of logged in user', function() {
    // Load the login page and press login
    browser.get('http://localhost:8008/login');
    element(by.model('user.username')).sendKeys('timo@ext.md');
    element(by.model('user.password')).sendKeys('timopwd');
    helpers.waitForBackendReady(40000).then(function () {
      vr.takeScreenshot('login-ready');
      var doneButton = element(by.buttonText('done'));
      var errorSearch = by.css('.text-error');
      doneButton.click();
      helpers.waitForUrlToChangeTo('http://localhost:8008/my', 10000).then(function () {
        // Assert that we are in the today page
        var availableActiveSlide = by.xpath('//div[@swiper-slide="focus/tasks/left"]');
        var activeSlide = element(availableActiveSlide);
        expect(activeSlide.isDisplayed()).toBeTruthy();
        var activeSlideHeading = activeSlide.element(by.css('h2.group-heading'));
        expect(activeSlideHeading.getText()).toBe('today');
      });
    });
  });
});
'use strict';

describe('extended mind', function() {
  var helpers = require('./testHelpers.js');

  it('should process basic online functionality of logged in user', function() {
    // Load the login page and press login
    browser.get('http://localhost:8008/login');
    element(by.model('user.username')).sendKeys('timo@ext.md');
    element(by.model('user.password')).sendKeys('timopwd');
    helpers.waitForBackendReady(40000).then(function () {
      var doneButton = element(by.buttonText('done'));
      var errorSearch = by.css('.text-error');
      doneButton.click().then(function(){
        browser.driver.isElementPresent(errorSearch).then(function(errorIsPresent){
          if (errorIsPresent){
            return doneButton.click().then(function(){
              return browser.driver.wait(function() {
                browser.driver.sleep(800);
                return doneButton.click().then(function(){
                  return browser.driver.isElementPresent(errorSearch).then(function(errorIsPresent){
                    return !errorIsPresent;
                  });
                });
              }, 10000);
            });
          }
        });
      });
      helpers.waitForUrlToChangeTo('http://localhost:8008/my', 10000).then(function () {
        // Assert that we are in the today page
        var availableActiveSlide = by.xpath('//div[@swiper-slide="focus/tasks/left"]');
        browser.driver.wait(function() {
          return browser.driver.isElementPresent(availableActiveSlide);
        }, 10000).then(function(){
          var activeSlide = element(availableActiveSlide);
          expect(activeSlide.isDisplayed()).toBeTruthy();
          var activeSlideHeading = activeSlide.element(by.css('h2.group-heading'));
          expect(activeSlideHeading.getText()).toBe('today');
        });
      });
    });
  });
});
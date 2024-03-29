'use strict';

const request = require('request');
const fs = require('fs');
var jsdom = require('jsdom');
const { JSDOM } = jsdom;

const waitForUrlToChangeTo = function (newUrl, timeout) {
  let currentUrl;
  return browser.driver.getCurrentUrl().then(function(url) {
    currentUrl = url;
  }).then(function() {
      return browser.driver.wait(function() {
        return browser.driver.getCurrentUrl().then(function(url) {
          return newUrl === url;
        });
      }, timeout);
    }
  );
};

const waitForBackendReady = function(timeout) {
  return browser.driver.wait(function() {
    let deferred = protractor.promise.defer();
    browser.driver.executeAsyncScript(function() {
      var callback = arguments[arguments.length - 1];
      var xmlHttp = new XMLHttpRequest();
      xmlHttp.onreadystatechange = function() {
        if (xmlHttp.readyState == 4 && xmlHttp.status == 200){
          callback(true);
        }else{
          setTimeout(function(){
            callback(false);
          }, 500);
        }
      };
      xmlHttp.open('GET', 'http://localhost:8008/api/v2/info', true); // true for asynchronous
      xmlHttp.timeout = 500; // time in milliseconds
      xmlHttp.ontimeout = function() {
        xmlHttp.abort();
        callback(false);
      };
      xmlHttp.send(null);
    }).then(function(success){
      if (success)
        deferred.fulfill(true);
      else
        deferred.fulfill(false);
    });
    return deferred.promise;
  }, timeout);
};


const waitForVisualReviewReady = (function() {
  let count = 0;

  return function(max, timeout, next) {
    request('http://localhost:7000', function (error, response) {
      if (error || response.statusCode !== 200) {
        if (count++ < max) {
          return setTimeout(function() {
            waitForVisualReviewReady(max, timeout, next);
          }, timeout);
        } else {
          return next(false);
        }
      }
      next(true);
    });
  };
})();

const readSentEmail = function(emailDirectory, emailFileName){
  var htmlFileContent;
  try {
    htmlFileContent = fs.readFileSync(emailDirectory + '/' + emailFileName, 'utf-8');
  } catch (e) {
    htmlFileContent = fs.readFileSync(emailDirectory + '/' + emailFileName, 'utf-8');
  }
  const { document } = (new JSDOM(htmlFileContent)).window;
  return document;
};

exports.waitForUrlToChangeTo = waitForUrlToChangeTo;
exports.waitForBackendReady = waitForBackendReady;
exports.waitForVisualReviewReady = waitForVisualReviewReady;
exports.readSentEmail = readSentEmail;

// CONSTANTS

// Animations
exports.MENU_ANIMATION_SPEED = 200;
exports.SWIPER_ANIMATION_SPEED = 300;
exports.MODAL_REPEAT_ANIMATION_SPEED = 140;

// XPath searches
exports.XPATH_FOCUS_TASKS_TODAY_SLIDE = '//div[@swiper-slide="focus/tasks/left"]';
exports.XPATH_FOCUS_TASKS_NO_DATE_SLIDE = '//div[@swiper-slide="focus/tasks/rightDuplicate"]';
exports.XPATH_FOCUS_TASKS_TOMORROW_SLIDE = '//div[@swiper-slide="focus/tasks/middle"]';
exports.XPATH_FOCUS_TASKS_SLIDE = '//div[@swiper-slide="focus/tasks"]';
exports.XPATH_FOCUS_NOTES_SLIDE = '//div[@swiper-slide="focus/notes"]';
exports.XPATH_TASKS_ALL_SLIDE = '//div[@swiper-slide="tasks/all"]';
exports.XPATH_TASKS_CONTEXTS_SLIDE = '//div[@swiper-slide="tasks/contexts"]';
exports.XPATH_TASKS_CONTEXT_SLIDE = '//div[@swiper-slide="tasks/context"]';
exports.XPATH_MENU_BUTTON = '//button[@ng-click="toggleMenu()"]';
exports.XPATH_TOOLBAR_HEADING_BUTTON = '//div[@ng-click="clickToolbarHeading()"]';
exports.XPATH_EDITOR_HIGHLIGHTED_LINK = '//div[contains(@class, "container-editor")]//a[contains(@class, "highlighted") and ./span/text()="${linkText}"]';
exports.XPATH_EDITOR_HEADER_NAVIGATION_LINK = '//div[contains(@class, "container-editor")]//header//a[contains(@class, "link-navigation") and ./span/text()="${linkText}"]';
exports.XPATH_EDITOR_FOOTER_NAVIGATION_LINK = '//div[contains(@class, "container-editor")]//footer//a[contains(@class, "link-navigation") and ./span/text()="${linkText}"]';
exports.XPATH_EDITOR_FOOTER_LINK = '//div[contains(@class, "container-editor")]//footer//a[./span/text()="${linkText}"]';
exports.XPATH_FOOTER_NAVIGATION_LINK = '//footer//a[contains(@class, "link-navigation") and ./span/text()="${linkText}"]';
exports.XPATH_LINK_LIST_ITEM = '//a[contains(@class, "link-list-item") and ./span/text()="${linkText}"]';
exports.XPATH_LINK_SEARCH_RESULT = '//a[contains(@class, "link-search-result") and ./span/text()="${linkText}"]';
exports.XPATH_TASK_EDITOR_BASIC_SLIDE = '//div[@swiper-slide="taskEditor/basic"]';
exports.XPATH_TASK_EDITOR_ADVANCED_SLIDE = '//div[@swiper-slide="taskEditor/advanced"]';
exports.XPATH_LINK_SWIPER_CLICK = '//a[@swiper-click="${clickMethod}"]';
exports.XPATH_LINK_CLICK = '//a[@ng-click="${clickMethod}"]';
exports.XPATH_BUTTON_CLICK = '//button[@ng-click="${clickMethod}"]';
exports.XPATH_EDITOR_CLOSE = '//div[contains(@class, "container-editor")]//div[contains(@class, "container-titlebar--inner")]//a[@swiper-click="end${ItemType}Edit()"]';
exports.XPATH_EDITOR_DELETE = '//div[contains(@class, "container-editor")]//div[contains(@class, "container-titlebar--inner")]//a[@swiper-click="delete${ItemType}InEdit()"]';
exports.XPATH_MENU_LINK = '//div[contains(@class, "container-menu")]//div[contains(@class, "link-menu") and ./span/text()="${linkText}"]';
exports.XPATH_MENU_LINK_SMALL = '//div[contains(@class, "container-menu")]//div[contains(@class, "link-menu-small") and ./span/text()="${linkText}"]';
exports.XPATH_USER_HOME_SLIDE = '//div[@swiper-slide="user/home"]';
exports.XPATH_USER_DETAILS_SLIDE = '//div[@swiper-slide="user/details"]';
exports.XPATH_USER_EDITOR = '//div[@ng-switch-when="user"]';
exports.XPATH_LINK_ITEM = '//a[contains(@class, "link") and ./span/text()="${linkText}"]';
exports.XPATH_INBOX = '//div[@id="inbox"]';
exports.XPATH_INBOX_CONTENT = '//section[@ng-show="isContentVisible(\'inbox\')"]';
exports.XPATH_NOTES_ALL = '//div[@id="notes-all"]';
exports.XPATH_NOTES_CONTENT = '//div[@ng-show="isContentVisible(\'notes\')"]';
exports.XPATH_SETTINGS_CONTENT = '//section[@ng-show="isContentVisible(\'settings\')"]';
exports.XPATH_NOTE_EDITOR_BASIC_SLIDE = '//div[@swiper-slide="noteEditor/basic"]';
exports.XPATH_NOTE_EDITOR_ADVANCED_SLIDE = '//div[@swiper-slide="noteEditor/advanced"]';
exports.XPATH_LISTS_ACTIVE_SLIDE = '//div[@swiper-slide="lists/active"]';
exports.XPATH_LISTS_ARCHIVED_SLIDE = '//div[@swiper-slide="lists/archived"]';
exports.XPATH_LIST_TASKS_SLIDE = '//div[@swiper-slide="list/tasks"]';
exports.XPATH_LIST_EDITOR_BASIC_SLIDE = '//div[@swiper-slide="listEditor/basic"]';
exports.XPATH_LIST_EDITOR_ADVANCED_SLIDE = '//div[@swiper-slide="listEditor/advanced"]';
exports.XPATH_HEADING = '//h2[contains(@class, "group-heading") and text()="${headingText}"]';
exports.XPATH_OMNIBAR_BUTTON = '//button[@ng-click="openEditor(\'omnibar\')"]';
exports.XPATH_OMNIBAR_EDITOR = '//div[@ng-controller="OmnibarEditorController"]';
exports.XPATH_KEYWORD_LINK = '//a[contains(@class, "keyword") and ./span/text()="${linkText}"]';
exports.XPATH_FOOTER_BUTTON = '//footer//button[@ng-click="${clickMethod}"]';
exports.XPATH_ENTRY_MAIN_SLIDE = '//div[@swiper-slide="entry/main"]';
exports.XPATH_ENTRY_DETAILS_SLIDE = '//div[@swiper-slide="entry/details"]';
exports.XPATH_TAG_EDITOR_HIGHLIGHTED_LINK = '//div[@ng-switch-when="tag"]//a[contains(@class, "highlighted") and ./span/text()="${linkText}"]';
exports.XPATH_ITEM_EDITOR = '//div[@ng-switch-when="item"]';
exports.XPATH_ADD_ITEM = '//div[@swiper-click="addItem()"]';
exports.XPATH_LEFT_ACTION = '//a[@swiper-click="leftAction()"]';
exports.XPATH_RECURRING_NEXT = '//div[@ng-switch-when="recurring"]//a[@swiper-click="saveItemAndGotoNextItem(iterableItem)" and ./span/text()="next"]';
exports.XPATH_RECURRING_FINISH = '//div[@ng-switch-when="recurring"]//a[@swiper-click="saveItemAndGotoNextItem(iterableItem)" and ./span/text()="finish"]';
exports.XPATH_RECURRING_UNDO = '//div[@ng-switch-when="recurring"]//a[@swiper-click="undoSorting(iterableItem)"]';
exports.XPATH_RECURRING_SKIP = '//div[@ng-switch-when="recurring"]//a[@swiper-click="saveItemAndGotoNextItem(iterableItem)" and ./span/text()="skip"]';
exports.XPATH_PRECEDING_COMPLETE = '/preceding-sibling::div[./input]';
exports.XPATH_TEXT_LINK_CONTAINER = '//div[./span[contains(@class, "text-link") and text()="${linkText}"]]';
exports.XPATH_TEXT_DETAILS_CONTAINER = '//div[./span[contains(@class, "text-details") and text()="${linkText}"]]';
exports.XPATH_TOGGLE_COMPLETE_BUTTON = '//button[@ng-click="toggleShowCompletedTasks()"]';
exports.XPATH_COMPLETED_TASK = '//div[contains(@class, "checkbox-checked")]//a[contains(@class, "link-list-item") and ./span/text()="${linkText}"]';
exports.XPATH_UNCOMPLETED_TASK = '//div[not(contains(@class, "checkbox-checked"))]//a[contains(@class, "link-list-item") and ./span/text()="${linkText}"]';
exports.XPATH_TOASTER_TEXT = '//div[contains(@class, "container-toaster")]//span[contains(@class, "textgroup-toaster") and text() = "${toasterText}"]';
exports.XPATH_TOASTER_INLINE_LINK = '//div[contains(@class, "container-toaster")]//a[contains(@class, "link-inline")]';
exports.XPATH_TOASTER_CLOSE_LINK = '//div[contains(@class, "container-toaster")]//a[@swiper-click="closeNotificationAndCall(notification)"]';
exports.XPATH_MODAL_BUTTON = '//div[contains(@class, "container-modal")]//button[./span/text()="${linkText}"]';
exports.XPATH_MODAL_CLOSE_BUTTON = '//div[contains(@class, "container-modal")]//a[@ng-click="close()"]';
exports.XPATH_MODAL_HEADING = '//div[contains(@class, "container-modal")]//h2[contains(@class, "group-heading") and ./span/text()="${headingText}"]';
exports.XPATH_TEXTGROUP_INGRESS = '//div[contains(@class, "textgroup-ingress") and text()="${ingressText}"]';

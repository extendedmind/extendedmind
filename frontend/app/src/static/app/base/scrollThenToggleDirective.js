/* Copyright 2013-2015 Extended Mind Technologies Oy
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
 'use strict';

 function scrollThenToggleDirective($parse) {
  return {
    restrict: 'A',
    link: function postLink(scope, element, attrs) {


      //*****************************************************
      // START
      // https://github.com/component/textarea-caret-position

      // The properties that we copy into a mirrored div.
      // Note that some browsers, such as Firefox,
      // do not concatenate properties, i.e. padding-top, bottom etc. -> padding,
      // so we have to do every single property specifically.
      var properties = [
        'direction',  // RTL support
        'boxSizing',
        'width',  // on Chrome and IE, exclude the scrollbar, so the mirror div wraps exactly as the textarea does
        'height',
        'overflowX',
        'overflowY',  // copy the scrollbar for IE

        'borderTopWidth',
        'borderRightWidth',
        'borderBottomWidth',
        'borderLeftWidth',
        'borderStyle',

        'paddingTop',
        'paddingRight',
        'paddingBottom',
        'paddingLeft',

        // https://developer.mozilla.org/en-US/docs/Web/CSS/font
        'fontStyle',
        'fontVariant',
        'fontWeight',
        'fontStretch',
        'fontSize',
        'fontSizeAdjust',
        'lineHeight',
        'fontFamily',

        'textAlign',
        'textTransform',
        'textIndent',
        'textDecoration',  // might not make a difference, but better be safe

        'letterSpacing',
        'wordSpacing',

        'tabSize',
        'MozTabSize'

      ];

      var isFirefox = window.mozInnerScreenX != null;

      function getCaretCoordinates(element, position) {
        // mirrored div
        var div = document.createElement('div');
        div.id = 'input-textarea-caret-position-mirror-div';
        document.body.appendChild(div);

        var style = div.style;
        var computed = window.getComputedStyle? getComputedStyle(element) : element.currentStyle;  // currentStyle for IE < 9

        // default textarea styles
        style.whiteSpace = 'pre-wrap';
        if (element.nodeName !== 'INPUT')
          style.wordWrap = 'break-word';  // only for textarea-s

        // position off-screen
        style.position = 'absolute';  // required to return coordinates properly
        style.visibility = 'hidden';  // not 'display: none' because we want rendering

        // transfer the element's properties to the div
        properties.forEach(function (prop) {
          style[prop] = computed[prop];
        });

        if (isFirefox) {
          // Firefox lies about the overflow property for textareas: https://bugzilla.mozilla.org/show_bug.cgi?id=984275
          if (element.scrollHeight > parseInt(computed.height))
            style.overflowY = 'scroll';
        } else {
          style.overflow = 'hidden';  // for Chrome to not render a scrollbar; IE keeps overflowY = 'scroll'
        }

        div.textContent = element.value.substring(0, position);
        // the second special handling for input type="text" vs textarea: spaces need to be replaced with non-breaking spaces - http://stackoverflow.com/a/13402035/1269037
        if (element.nodeName === 'INPUT')
          div.textContent = div.textContent.replace(/\s/g, "\u00a0");

        var span = document.createElement('span');
        // Wrapping must be replicated *exactly*, including when a long word gets
        // onto the next line, with whitespace at the end of the line before (#7).
        // The  *only* reliable way to do that is to copy the *entire* rest of the
        // textarea's content into the <span> created at the caret position.
        // for inputs, just '.' would be enough, but why bother?
        span.textContent = element.value.substring(position) || '.';  // || because a completely empty faux span doesn't render at all
        div.appendChild(span);

        var coordinates = {
          top: span.offsetTop + parseInt(computed['borderTopWidth']),
          left: span.offsetLeft + parseInt(computed['borderLeftWidth'])
        };

        document.body.removeChild(div);

        return coordinates;
      }

      // END
      // https://github.com/component/textarea-caret-position
      //*****************************************************

      function getTopElementBottomPosition() {
        return topElement.offsetHeight + topElement.offsetTop;
      }

      var topElement = document.getElementById(attrs.scrollThenToggleTop);
      var topElementBottomPosition = getTopElementBottomPosition();

      if (attrs.scrollThenToggleReset) $parse(attrs.scrollThenToggleReset)(scope)(scrollToTop);
      if (attrs.scrollThenToggleResizeable) {

        var scrollToBottomOnResizeFn;
        if (attrs.scrollThenToggleResizeableToBottom){
          scrollToBottomOnResizeFn = $parse(attrs.scrollThenToggleResizeableToBottom)(scope);
        }

        var elementToScroll, originalTop;
        scope.$on('elastic:resize', function(event, elem) {
          if (!originalTop) originalTop = elem[0].getBoundingClientRect().top;

          if (elem[0].id === attrs.scrollThenToggleResizeable) {
            topElementBottomPosition = getTopElementBottomPosition();
          }
          if (angular.isFunction(scrollToBottomOnResizeFn)){
            var elementIdScroll = scrollToBottomOnResizeFn();
            if (elementIdScroll){

              console.log('*****')
              console.log(elem[0].getBoundingClientRect().top)
              console.log(getCaretCoordinates(elem[0], elem[0].selectionEnd).top)
              console.log(element[0].offsetHeight)

              console.log(element[0].scrollHeight - element[0].offsetHeight)
              console.log(element[0].scrollTop - element[0].scrollHeight)




              //console.log(element[0].pageYOffset)
              //console.log(element[0].offsetHeight)
              //console.log(rect.top, rect.right, rect.bottom, rect.left);

/*
              console.log((element[0].scrollHeight - element[0].offsetHeight))

              //console.log(elem[0].getBoundingClientRect().top)
              console.log(element[0].scrollTop)
              console.log(element[0].scrollHeight)
              console.log(element[0].scrollHeight - element[0].scrollTop)
              //console.log(element[0].scrollHeight)
              console.log(element[0].offsetHeight);
*/

              if (element[0].scrollHeight - element[0].offsetHeight > 0 && // there is something to scroll
                  element[0].scrollTop - element[0].scrollHeight < 0  && // not at the bottom already
                  getCaretCoordinates(elem[0], elem[0].selectionEnd).top < 0){ // caret is below the bottom
                console.log("SCROLLING")
                if (!elementToScroll && elementIdScroll === true) elementToScroll = element[0];
                else if (!elementToScroll) elementToScroll = document.getElementById(elementIdScroll);
                scrollToBottom(elementToScroll);
              }
            }
          }
        });
      }

      function scrollToTop() {
        element[0].scrollTop = 0;
      }

      function scrollToBottom(elementToScroll) {
        elementToScroll.scrollTop = elementToScroll.scrollHeight;
      }

      var toggleElement = document.getElementById(attrs.scrollThenToggle);
      var toggleElementVisible;  // Cache element visiblity info.

      function scroll() {
        /* jshint validthis: true */

        // Element.scrollTop does not cause reflow.
        if (this.scrollTop <= topElementBottomPosition && toggleElementVisible) {
          // Top element is visible, hide toggle element.
          toggleElement.classList.remove('show-sticky');
          toggleElementVisible = false;
        } else if (this.scrollTop > topElementBottomPosition && !toggleElementVisible) {
          // Top element hidden, show toggle element.
          toggleElement.classList.add('show-sticky');
          toggleElementVisible = true;
        }
      }

      element[0].addEventListener('scroll', scroll, false);
    }
  };
}
scrollThenToggleDirective['$inject'] = ['$parse'];
angular.module('em.base').directive('scrollThenToggle', scrollThenToggleDirective);

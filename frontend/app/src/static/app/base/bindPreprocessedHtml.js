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

function bindPreprocessedHtml($compile, $rootScope, PlatformService) {
  return {
    restrict: 'A',
    scope: {
      html: '=bindPreprocessedHtml'
    },
    link: function(scope, element, attrs) {
      // Function to add external click event handling for links in preprocessed HTML, based
      // on "clickable" class and a valid link in the "target" attribute.
      scope.clickExternalLink = function(clickEvent){
        PlatformService.doAction('openLinkExternal', clickEvent.target.dataset.href);
      };

      element.append(scope.html);

      // External link handling
      if (PlatformService.isSupported('openLinkExternal')){
        var clickableElements = element[0].getElementsByClassName("clickable");
        for (var i=0; i<clickableElements.length; i++){
          var url = clickableElements[i].getAttribute('target');
          if (url && $rootScope.validUrlRegexp.test(url)){
            clickableElements[i].setAttribute('ng-click', 'clickExternalLink($event)');
            clickableElements[i].setAttribute('data-href', url);
            clickableElements[i].removeAttribute('target');
            $compile(clickableElements[i])(scope);
          }
        }
      }
    }
  };
}
bindPreprocessedHtml['$inject'] = ['$compile', '$rootScope', 'PlatformService'];
angular.module('em.base').directive('bindPreprocessedHtml', bindPreprocessedHtml);

/* Copyright 2013-2014 Extended Mind Technologies Oy
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

 function toasterDirective(UISessionService) {
  return {
    restrict: 'A',
    templateUrl: 'static/app/base/toaster.html',
    scope: true,
    link: function(scope, element, attrs) {
      UISessionService.registerNotificationsActiveCallback(attrs.toaster, notificationsActive);

      function notificationsActive(/*notifications*/) {
        // Digest may not be running.
        scope.$evalAsync(function() {
          // Activate notifications here.
        });
      }

      scope.$on('$destroy', function() {
        // Unregister notifications callback for toaster type in UISessionService
        UISessionService.unregisterNotificationsActiveCallback(attrs.toaster);
      });
    }
  };
}
toasterDirective['$inject'] = ['UISessionService'];
angular.module('em.base').directive('toaster', toasterDirective);

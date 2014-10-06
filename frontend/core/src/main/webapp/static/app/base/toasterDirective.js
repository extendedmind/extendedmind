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

 function toasterDirective($timeout, UISessionService) {
  var notificationVisibleInMilliseconds = 3000;

  return {
    restrict: 'A',
    templateUrl: 'static/app/base/toaster.html',
    scope: true,
    link: function(scope, element, attrs) {

      // TODO: pause toaster
      // https://github.com/extendedmind/extendedmind/blob/719b7fba55cdab65989df50fcff448f48ea9e805/frontend/core/src/main/webapp/static/app/main/footer.html#L3
      // https://github.com/extendedmind/extendedmind/blob/719b7fba55cdab65989df50fcff448f48ea9e805/frontend/core/src/main/webapp/static/app/main/FooterController.js#L88

      scope.toasterNotifications = false;

      UISessionService.registerNotificationsActiveCallback(attrs.toaster, notificationsActive);

      function notificationsActive(notifications) {
        scope.toasterNotifications = true;
        showNotifications(notifications);

        // Digest may not be running when callback is executed. E.g. from $animate promise.
        if (!scope.$phase) scope.$digest();
      }

      /*
      * Show notifications serialized.
      */
      function showNotifications(notifications) {
        if (notifications && notifications.length > 0) {
          var notification = notifications.shift();
          scope.notification = notification;

          // Proceed to next notification when timeout is reached or promise is cancelled.
          var notificationTimer = $timeout(function() {
            scope.notification = undefined; // clear notification just in case
            showNotifications(notifications);
          }, notificationVisibleInMilliseconds);

          // Timeout promise cancelled.
          notificationTimer.then(null, function() {
            scope.notification = undefined; // clear notification just in case
            showNotifications(notifications);
          });
          scope.notification.timer = notificationTimer; // attach timeout promise to notification
        } else
        // No more notifications. End.
        scope.toasterNotifications = false;
      }

      /*
      * Cancel notification's timeout promise and fire callback.
      */
      scope.closeNotificationAndCall = function(notification, item, callback) {
        if (notification.timer) $timeout.cancel(notification.timer);
        if (callback) callback(item);
      };

      scope.$on('$destroy', function() {
        // Unregister notifications callback for toaster type in UISessionService
        UISessionService.unregisterNotificationsActiveCallback(attrs.toaster);
      });
    }
  };
}
toasterDirective['$inject'] = ['$timeout', 'UISessionService'];
angular.module('em.base').directive('toaster', toasterDirective);

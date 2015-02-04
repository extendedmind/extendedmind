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

 function modalDirective($rootScope, $timeout) {
  return {
    restrict: 'A',
    scope: {
      modalInfos: '=modal',
      closeModal: '&modalClose'
    },
    templateUrl: $rootScope.urlBase + 'app/base/modal.html',
    // NOTE: URL could be passed as a directive attribute for different kind of modals, e.g. list picker.
    link: function(scope) {
      scope.messageHeading = scope.modalInfos.messageHeading;
      scope.messageIngress = scope.modalInfos.messageIngress;
      scope.messageText = scope.modalInfos.messageText;
      scope.closeText = scope.modalInfos.closeText;
      scope.confirmText = scope.modalInfos.confirmText || 'ok';
      scope.hideCloseText = scope.modalInfos.cancelDisabled;

      scope.confirmAction = function() {
        if (typeof scope.modalInfos.confirmActionDeferredFn === 'function') {
          // Confirm action is a promise.
          scope.confirmText = scope.modalInfos.confirmTextDeferred;
          scope.confirmDisabled = true;

          var confirmActionDeferred = scope.modalInfos.confirmActionDeferredFn();
          if (confirmActionDeferred)
            confirmActionDeferred.then(confirmActionDeferredSuccess, confirmActionDeferredError);

        } else {
          scope.closeModal();
        }
      };

      function confirmActionDeferredSuccess() {
        scope.confirmDisabled = false;
        scope.closeModal();
        if (typeof scope.modalInfos.confirmActionPromiseFn === 'function') {
          // Delay executing callback so that close animation has finished before it.
          $timeout(scope.modalInfos.confirmActionPromiseFn, 300);
        }
      }
      function confirmActionDeferredError() {
        scope.confirmText = scope.modalInfos.confirmText;
        scope.confirmDisabled = false;
      }
    }
  };
}
modalDirective['$inject'] = ['$rootScope', '$timeout'];
angular.module('em.base').directive('modal', modalDirective);

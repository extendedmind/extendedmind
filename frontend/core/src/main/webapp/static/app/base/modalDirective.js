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

 function modalDirective($rootScope) {
  return {
    restrict: 'A',
    scope: {
      modalInfos: '=modal',
      closeModal: '&modalClose'
    },
    templateUrl: $rootScope.urlBase + 'app/base/modal.html',
    link: function(scope) {
      scope.closeText = scope.modalInfos.closeText || 'close';
      scope.messageText = scope.modalInfos.messageText;
      scope.confirmText = scope.modalInfos.confirmText || 'ok';

      scope.confirmAction = function() {
        if (typeof scope.modalInfos.confirmActionDeferredFn === 'function') {
          // Confirm action is a promise.
          scope.confirmText = scope.modalInfos.confirmTextDeferred;
          scope.confirmDisabled = true;

          scope.modalInfos.confirmActionDeferredFn(scope.modalInfos.confirmActionDeferredParam)
          .then(confirmActionPromiseSuccess, confirmActionPromiseError);
        } else {
          scope.closeModal();
        }
      };

      function confirmActionPromiseSuccess() {
        scope.confirmDisabled = false;
        scope.closeModal();
        if (scope.modalInfos.confirmActionPromiseFn) {
          scope.modalInfos.confirmActionPromiseFn(scope.modalInfos.confirmActionPromiseParam);
        }
      }
      function confirmActionPromiseError() {
        scope.confirmText = scope.modalInfos.confirmText;
        scope.confirmDisabled = false;
      }
    }
  };
}
modalDirective['$inject'] = ['$rootScope'];
angular.module('em.base').directive('modal', modalDirective);

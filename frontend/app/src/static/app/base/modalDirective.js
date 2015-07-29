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

 function modalDirective($animate, $rootScope, $timeout) {
  return {
    restrict: 'A',
    scope: {
      modalInfos: '=modal',
      closeModal: '&modalClose',
      reinit: '=modalReinit'
    },
    templateUrl: $rootScope.urlBase + 'app/base/modal.html',
    // NOTE: URL could be passed as a directive attribute for different kind of modals, e.g. list picker.
    link: function(scope, element) {

      function init(params) {
        scope.messageHeading = params.messageHeading;
        scope.messageIngress = params.messageIngress;
        scope.messageText = params.messageText;
        scope.messageDetails = params.messageDetails;
        scope.closeText = params.closeText;
        scope.confirmText = params.confirmText || 'ok';
        scope.hideCloseText = params.cancelDisabled;
        scope.listPicker = params.listPicker;
      }

      init(scope.modalInfos);

      document.addEventListener('keyup', keyReleased, false);
      function keyReleased(event) {
        if (event.keyCode === 27) {
          // ESC button. Close modal.
          if (!$rootScope.$$phase && !scope.$$phase) {
            // Need to apply to propagate to parent (closeModal is in rootViewDirective).
            scope.$apply(scope.closeModal);
          }
          else {
            scope.closeModal();
          }
        }
      }

      scope.confirmAction = function() {
        scope.saveError = undefined;
        if (typeof scope.modalInfos.confirmAction === 'function') {
          scope.closeModal();
          // Delay executing callback so that close animation has finished before it.
          $timeout(scope.modalInfos.confirmAction, 300);
        }
        else if (typeof scope.modalInfos.confirmActionDeferredFn === 'function') {
          // Confirm action is a promise.
          scope.confirmText = scope.modalInfos.confirmTextDeferred;
          scope.confirmDisabled = true;

          var confirmActionDeferred = scope.modalInfos.confirmActionDeferredFn(
                                        scope.modalInfos.confirmActionDeferredParam);
          if (confirmActionDeferred)
            confirmActionDeferred.then(confirmActionDeferredSuccess, confirmActionDeferredError);

        } else {
          scope.closeModal();
        }
      };

      function confirmActionDeferredSuccess(success) {
        scope.confirmDisabled = false;
        scope.closeModal();
        if (typeof scope.modalInfos.confirmActionPromiseFn === 'function') {
          // Delay executing callback so that close animation has finished before it.
          $timeout(scope.modalInfos.confirmActionPromiseFn, 300);
        }
      }
      function confirmActionDeferredError(error) {
        scope.confirmText = scope.modalInfos.confirmText;
        scope.confirmDisabled = false;
        if (scope.modalInfos.confirmActionPromiseFn === true){
          scope.saveError = error;
        }
      }

      if (scope.reinit && typeof scope.reinit.register === 'function') scope.reinit.register(reinit);

      function reinit(params) {
        $animate.addClass(element, 'modal-fade-scale').then(function() {
          element[0].classList.remove('modal-fade-scale');
        });
        scope.modalInfos = params;
        init(scope.modalInfos);
      }

      scope.$on('$destroy', function() {
        if (scope.reinit && typeof scope.reinit.unregister === 'function') scope.reinit.unregister();
        document.removeEventListener('keyup', keyReleased, false);
      });
    }
  };
}
modalDirective['$inject'] = ['$animate', '$rootScope', '$timeout'];
angular.module('em.base').directive('modal', modalDirective);

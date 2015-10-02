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

 function modalDirective($animate, $animateCss, $rootScope, $timeout) {
  return {
    restrict: 'A',
    scope: {
      modalInfos: '=modal',
      closeModal: '&modalClose',
      reinit: '=modalReinit',
      layoutChange: '=?modalLayoutChange'
    },
    templateUrl: $rootScope.urlBase + 'app/base/modal.html',
    // NOTE: URL could be passed as a directive attribute for different kind of modals, e.g. list picker.
    link: function(scope, element) {

      function init(params, reinit) {
        scope.messageHeading = params.messageHeading;
        scope.messageIngress = params.messageIngress;
        scope.messageText = params.messageText;
        scope.messageDetails = params.messageDetails;
        scope.messageHtml = params.messageHtml;
        scope.closeText = params.closeText;
        scope.confirmText = params.confirmText || 'ok';
        scope.hideCloseText = params.cancelDisabled;
        scope.listPicker = params.listPicker;
        if (params.customPosition) {
          if (params.anchorToElement) {
            initAnchoredModal(params.activeElement, params.previousActiveElement, reinit);
          }
        }
        if (scope.messageHtml){
          element.addClass("wide");
        }
      }

      function initAnchoredModal(targetElement, previousTargetElement, reinit) {
        if (previousTargetElement) {
          previousTargetElement.classList.remove('active');
        }
        targetElement.classList.add('active');
        // NOTE:  This has to be before calculating targetElementBottom using offsetHeight and offsetTop.
        //        First run won't work on iOS otherwise.
        element[0].classList.add('anchor-to-menu-element');
        var targetElementBottom = targetElement.offsetHeight + targetElement.offsetTop;
        if (!reinit) {
          if ($rootScope.columns === 1) {
            $animateCss(element, {
              from: {
                transform: 'scale(.9) translateY(' + targetElementBottom + 'px)',
                opacity: 0
              },
              to: {
                transform: 'scale(1) translateY(' + targetElementBottom + 'px)',
                opacity: 1
              },
              duration: 0.07
            }).start();
          } else {
            element[0].classList.add('anchor-to-menu-element');
          }
          scope.modalInfos.oldPosition = targetElementBottom;
          if (scope.layoutChange && typeof scope.layoutChange.register === 'function') {
            scope.layoutChange.register(onLayoutChange, 'modalDirective');
          }
        }
      }

      function onLayoutChange(newLayout, oldLayout) {
        if (newLayout === 1) {
          $animateCss(element, {
            to: {
              transform: 'translateY(' + scope.modalInfos.oldPosition + 'px)'
            }
          }).start();
        } else if (oldLayout === 1) {
          $animateCss(element, {
            to: {
              transform: 'translateY(-50%)'
            }
          }).start();
        }
      }

      scope.close = function() {
        if (scope.modalInfos.anchorToElement) closeAnchoredModal();
        scope.closeModal();
      };

      function closeAnchoredModal() {
        var translateY = $rootScope.columns === 1 ? scope.modalInfos.oldPosition + 'px' : -50 + '%';
        $animateCss(element, {
          from: {
            transform: 'scale(1) translateY(' + translateY + ')',
            opacity: 1
          },
          to: {
            transform: 'scale(.9) translateY(' + translateY + ')',
            opacity: 0
          },
          duration: 0.07
        }).start();
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
          if (scope.modalInfos.keepOpenOnClose) {
            scope.modalInfos.confirmAction();
          } else {
            if (scope.modalInfos.anchorToElement) closeAnchoredModal();
            scope.closeModal();
            // Delay executing callback so that close animation has finished before it.
            $timeout(scope.modalInfos.confirmAction, 300);
          }
        } else if (typeof scope.modalInfos.confirmActionDeferredFn === 'function') {
          // Confirm action is a promise.
          scope.confirmText = scope.modalInfos.confirmTextDeferred;
          scope.confirmDisabled = true;

          var confirmActionDeferred = scope.modalInfos.confirmActionDeferredFn(scope.modalInfos
                                                                               .confirmActionDeferredParam);
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
        function doDefaultModalFadeScale() {
          $animate.addClass(element, 'modal-fade-scale').then(function() {
            element[0].classList.remove('modal-fade-scale');
          });
        }
        if (params.anchorToElement) {
          var targetElement = params.activeElement;
          var newPosition = targetElement.offsetHeight + targetElement.offsetTop; // Target bottom.
          if (newPosition + element[0].offsetHeight > window.innerHeight) {
            newPosition = targetElement.offsetTop - element[0].offsetHeight;  // Modal bottom to target top.
          }
          // http://stackoverflow.com/a/9845896
          if ($rootScope.columns === 1) {
            element[0].firstElementChild.classList.add('modal-fade-scale-anchored');
            $animateCss(element, {
              from: {
                transform: 'translateY(' + scope.modalInfos.oldPosition + 'px)'
              },
              to: {
                transform: 'translateY(' + newPosition + 'px)'
              },
              duration: 0.25
            }).start().done(function() {
              element[0].firstElementChild.classList.remove('modal-fade-scale-anchored');
            });
          } else {
            doDefaultModalFadeScale();
          }
          params.oldPosition = newPosition;
        } else {
          doDefaultModalFadeScale();
        }
        scope.modalInfos = params;
        init(scope.modalInfos, true);
      }

      scope.$on('$destroy', function() {
        if (scope.reinit && typeof scope.reinit.unregister === 'function') scope.reinit.unregister();
        if (scope.layoutChange && typeof scope.layoutChange.register === 'function') {
          scope.layoutChange.unregister(onLayoutChange, 'modalDirective');
        }
        document.removeEventListener('keyup', keyReleased, false);
      });
    }
  };
}
modalDirective['$inject'] = ['$animate', '$animateCss', '$rootScope', '$timeout'];
angular.module('em.base').directive('modal', modalDirective);

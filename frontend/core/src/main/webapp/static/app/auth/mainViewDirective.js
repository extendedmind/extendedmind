/* global $ */

'use strict';

function mainViewDirective($window, $document, $rootScope, $timeout, ModalService, BackendClientService, UserSessionService, ItemsService, SnapService) {
  return {
    restrict: 'A',
    replace: 'true',
    templateUrl: 'static/app/auth/main.html',
    controller: function($scope) {
      // Online/offline status, optimistic default
      $scope.online = true;
      var onlineStatusCallback = function(online){
        $scope.online = online;
      };
      BackendClientService.registerOnlineStatusCallback(onlineStatusCallback);

      $scope.retrying = false;
      var onlineRequiredRetryCallback = function(modalScope, modalClose, retryFunction, retryFunctionParam, promise){
        $scope.retrying = true;
        modalScope.modalSuccessText = 'retrying...';
        modalScope.modalSuccessDisabled = true;
        retryFunction(retryFunctionParam).then(function(){
          $scope.retrying = false;
          modalClose();
          if (promise){
            promise.resolve();
          }
        },function(error){
          $scope.retrying = false;
          if (error.status === 403){
            modalClose();
            if (promise){
              promise.resolve();
            }
          }else{
            modalScope.modalSuccessText = 'retry';
            modalScope.modalSuccessDisabled = false;
          }
        });
      };

      // Listen to exceptions emitted to rootscope
      var unbindEmException = $rootScope.$on('emException', function(name, exception) {
        var modalOptions = {
         scope: $scope,
         id: 'errorDialog',
         showHeaderCloseButton: false,
         backdrop: true,
         footerTemplateUrl:'static/app/auth/modalFooter.html',
         modalClass: 'modal small-modal'
       };

       if (exception.type === 'onlineRequired'){
        if (!$scope.retrying){
          $scope.errorMessageHeading = 'no online connection';
          $scope.errorMessageText = 'please connect to the internet and press retry to access your information';
          $scope.modalSuccessText = 'retry';
          modalOptions.allowBackdropDismiss = false;
          modalOptions.asyncSuccess = true;
          modalOptions.success = {fn: onlineRequiredRetryCallback,
            fnParam: exception.retry,
            fnParamParam: exception.retryParam,
            fnPromise: exception.promise};
            ModalService.createDialog('static/app/auth/errorMessage.html', modalOptions);
          }
        }else{
          $scope.errorMessageHeading = 'something unexpected happened, sorry!';
          $scope.errorMessageText = JSON.stringify(exception, null, 4);
          $scope.modalSuccessText = 'close';
          ModalService.createDialog('static/app/auth/errorMessage.html',modalOptions);
        }
      });

      // Clean up listening by executing the variable
      $scope.$on('$destroy', unbindEmException);


      // MENU TOGGLE

      $scope.isMenuOpen = false;
      $scope.toggleMenu = function toggleMenu() {
        $scope.isMenuOpen = !$scope.isMenuOpen;
        if ($rootScope.isMobile) {
          SnapService.toggle();
        }
      };
    },
    link: function($scope, $element){

      // BACKEND POLLING

      var synchronizeItemsTimer;
      var synchronizeItemsDelay = 12 * 1000;
      var itemsSynchronizedThreshold = 10 * 1000; // 10 seconds in milliseconds

      // Start synchronize interval or just start synchronize interval. 
      synchronizeItemsAndSynchronizeItemsDelayed();

      // Global variable bindToFocusEvent specifies if focus event should be wathed. Variable is true by default
      // for browsers, where hidden tab should not poll continuously, false in PhoneGap, because javascript
      // execution is paused anyway when app is not in focus.
      var bindToFocus = (typeof bindToFocusEvent !== 'undefined') ? bindToFocusEvent: true;
      if (bindToFocus) {
        angular.element($window).bind('focus', synchronizeItemsAndSynchronizeItemsDelayed);
        angular.element($window).bind('blur', cancelSynchronizeItemsDelayed);
      }

      function synchronizeItemsAndSynchronizeItemsDelayed() {
        synchronizeItems();
        synchronizeItemsDelayed();
      }
      function cancelSynchronizeItemsDelayed() {
        $timeout.cancel(synchronizeItemsTimer);
      }

      // https://developer.mozilla.org/en/docs/Web/API/window.setInterval
      function synchronizeItemsDelayed() {
        synchronizeItemsTimer = $timeout(function() {
          synchronizeItems();
          synchronizeItemsDelayed();
        }, synchronizeItemsDelay);
      }

      // Synchronize items if not already synchronizing and interval reached.
      function synchronizeItems() {
        var activeUUID = UserSessionService.getActiveUUID();
        // First check that the user has login
        if (activeUUID){
          if (!UserSessionService.isItemsSynchronizing(activeUUID)) {
            var itemsSynchronized = Date.now() - UserSessionService.getItemsSynchronized(activeUUID);
            
            if (isNaN(itemsSynchronized) || itemsSynchronized > itemsSynchronizedThreshold) {
              UserSessionService.setItemsSynchronizing(activeUUID);
              ItemsService.synchronize(activeUUID).then(function() {
                UserSessionService.setItemsSynchronized(activeUUID);
              });
            }
          }
        }
      }

      // WINDOW RESIZING

      function setDimensions(width, height) {
        $rootScope.currentWidth = width;
        $rootScope.currentHeight = height;
        if (width <= 568) {
          $rootScope.isDesktop = false;
          $rootScope.isMobile = true;
        } else {
          $rootScope.isMobile = false;
          $rootScope.isDesktop = true;
        }
      }
      setDimensions($window.innerWidth, $window.innerHeight);

      function windowResized() {
        $scope.$apply(function(){
          setDimensions($window.innerWidth, $window.innerHeight);
        });
      }

      angular.element($window).bind('resize', windowResized);

      // CLEANUP

      $scope.$on('$destroy', function() {
        // http://www.bennadel.com/blog/2548-Don-t-Forget-To-Cancel-timeout-Timers-In-Your-destroy-Events-In-AngularJS.htm
        $timeout.cancel(synchronizeItemsTimer);

        if (bindToFocus) {
          angular.element($window).unbind('focus', synchronizeItemsAndSynchronizeItemsDelayed);
          angular.element($window).unbind('blur', cancelSynchronizeItemsDelayed);
        }
        angular.element($window).unbind('resize', windowResized);
      });
    }
  };
}
mainViewDirective.$inject = ['$window', '$document', '$rootScope', '$timeout',
'ModalService', 'BackendClientService', 'UserSessionService', 'ItemsService', 'SnapService'];
angular.module('em.directives').directive('mainView', mainViewDirective);

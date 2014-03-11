'use strict';

function mainViewDirective($rootScope, ModalService, BackendClientService) {
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
    }
  };
}
mainViewDirective.$inject = ['$rootScope', 'ModalService', 'BackendClientService'];
angular.module('em.directives').directive('mainView', mainViewDirective);

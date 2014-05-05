'use strict';

function mainViewDirective($injector, $window, $document, $rootScope, $timeout, ModalService, BackendClientService, UserSessionService, ItemsService, SnapService, SwiperService, AnalyticsService, UUIDService) {

  return {
    restrict: 'A',
    replace: 'true',
    templateUrl: 'static/app/auth/main.html',
    controller: function($scope) {
      // Back function globally available
      $scope.gotoPreviousPage = function() {
        window.history.back();
      };

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
            if (exception.retry){
              $scope.errorMessageText = 'please connect to the internet and press retry to access your information';
              $scope.modalSuccessText = 'retry';
              modalOptions.allowBackdropDismiss = false;
              modalOptions.asyncSuccess = true;
              modalOptions.success = {
                fn: onlineRequiredRetryCallback,
                fnParam: exception.retry,
                fnParamParam: exception.retryParam,
                fnPromise: exception.promise
              };
              ModalService.createDialog('static/app/auth/errorMessage.html', modalOptions);
            }else{
              // No retry possibility
              $scope.modalSuccessText = 'close';
              $scope.errorMessageText = 'you need to be online to complete this action';
              ModalService.createDialog('static/app/auth/errorMessage.html', modalOptions);
            }
          }
        }else if (exception.type === 'http' && exception.status === 403) {
          // Redirect thrown 403 Forbidden exception to the login page
          AnalyticsService.error('forbidden', JSON.stringify(exception));
          var email = UserSessionService.getEmail();
          UserSessionService.clearUser();
          UserSessionService.setEmail(email);
          // $location can not be injected directly presumably because this directive
          // is defined above ng-view
          var $location = $injector.get('$location');
          $location.url('/login');
        }else{
          AnalyticsService.error('unexpected', JSON.stringify(exception));
          $scope.errorMessageHeading = 'something unexpected happened, sorry!';
          $scope.errorMessageText = JSON.stringify(exception, null, 4);
          $scope.modalSuccessText = 'close';
          ModalService.createDialog('static/app/auth/errorMessage.html', modalOptions);
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
    link: function($scope){

      // SESSION MANAGEMENT

      var currentSessionId, currentSessionStartTime, currentSessionLatestActivity;
      $scope.registerActivity = function() {
        if (!currentSessionId){
          startNewSession();
        }else{
          var now = Date.now();
          // If 20 seconds has passed since last activity, consider this a new session
          if (currentSessionLatestActivity && (currentSessionLatestActivity < (now - 20000))){
            AnalyticsService.stopSession(currentSessionId, currentSessionStartTime);
            startNewSession();
          }else {
            currentSessionLatestActivity = now;
          }
        }
      };

      function startNewSession() {
        currentSessionId = UUIDService.randomUUID();
        currentSessionStartTime = AnalyticsService.startSession(currentSessionId);
        currentSessionLatestActivity = undefined;
      }

      // WINDOW RESIZING

      function setDimensions(width, height) {
        $rootScope.currentWidth = width;
        $rootScope.currentHeight = height;
        if (width <= 568) {
          $rootScope.isDesktop = false;
          $rootScope.isMobile = true;

          // Swiper override parameters.
          var leftEdgeTouchRatio = 0;
          var rightEdgeTouchRatio = 0.2;
          SwiperService.setEdgeTouchRatios('tasks', leftEdgeTouchRatio, rightEdgeTouchRatio);
          SwiperService.setEdgeTouchRatios('notes', leftEdgeTouchRatio, rightEdgeTouchRatio);

        } else {
          $rootScope.isMobile = false;
          $rootScope.isDesktop = true;

          // Swiper override parameters.
          SwiperService.setEdgeTouchRatios('tasks');
          SwiperService.setEdgeTouchRatios('notes');
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
        angular.element($window).unbind('resize', windowResized);
      });
    }
  };
}
mainViewDirective.$inject = ['$injector', '$window', '$document', '$rootScope', '$timeout',
'ModalService', 'BackendClientService', 'UserSessionService', 'ItemsService', 'SnapService', 'SwiperService', 'AnalyticsService', 'UUIDService'];
angular.module('em.directives').directive('mainView', mainViewDirective);

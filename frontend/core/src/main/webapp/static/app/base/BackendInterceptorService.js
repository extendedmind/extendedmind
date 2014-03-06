// INTERCEPTOR

angular.module('em.services').config(['$httpProvider',
  function($httpProvider) {
    $httpProvider.interceptors.push('BackendInterceptorService');
  }]);

function BackendInterceptorService($injector, $q, base64, UserSessionService) {
  var forbiddenAllowed = ['/api/password'];
  
  function isTokenAuthentication(rejection){
    if (rejection.config.url === '/api/authenticate'){
      if (rejection.config.headers.Authorization){
        var parsedAuthorizationHeader = rejection.config.headers.Authorization.split(' ');
        var userNamePass = base64.decode(parsedAuthorizationHeader[1]);
        if (userNamePass.startsWith('token:')){
          return true;
        }          
      }
    }
  }

  return {
    responseError : function(rejection) {
      // Every time we get a 403 in methods that are not in the 
      // list of urls where forbidden is allowed (due to authentication
      // with email/password), go to login with empty user session
      if (rejection.status === 403 &&
          (forbiddenAllowed.indexOf(rejection.config.url) === -1 ||
           isTokenAuthentication)){
        var $location = $injector.get('$location');
        var email = UserSessionService.getEmail();
        UserSessionService.clearUser();
        UserSessionService.setEmail(email);
        $location.url('/login');
      }
      return $q.reject(rejection);
    }
  };
}
BackendInterceptorService.$inject = ['$injector', '$q', 'base64', 'UserSessionService'];
angular.module('em.services').factory('BackendInterceptorService', BackendInterceptorService);
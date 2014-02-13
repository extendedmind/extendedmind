'use strict';

/* http://rogeralsing.com/2013/08/26/angularjs-directive-to-check-that-passwords-match-followup/ */
function passwordMatchDirective() {
    return {
        restrict: 'A',
        scope:true,
        require: 'ngModel',
        link: function (scope, elem , attrs,control) {
            var checker = function () {
                //get the value of the first password
                var e1 = scope.$eval(attrs.ngModel);

                //get the value of the other password  
                var e2 = scope.$eval(attrs.passwordMatch);
                return e1 == e2;
            };
            scope.$watch(checker, function (n) {
                //set the form control to valid if both 
                //passwords are the same, else invalid
                control.$setValidity('unique', n);
            });
        }
    };
}
angular.module('common').directive('passwordMatch', passwordMatchDirective);

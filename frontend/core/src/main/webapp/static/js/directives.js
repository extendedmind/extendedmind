"use strict";

angular.module('em.directives', []).directive('appVersion', ['version',
function(version) {
    return function(scope, elm, attrs) {
        return elm.text(version);
    };
}]);

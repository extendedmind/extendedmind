'use strict';

function optionsDisabledDirective($parse) {
  var disableOptions = function(scope, attr, element, data, fnDisableIfTrue) {
    // refresh the disabled options in the select element.
    var options = element.find("option");
    for(var pos= 0,index=0;pos<options.length;pos++){
      var elem = angular.element(options[pos]);
      if(elem.val()!=""){
        var locals = {};
        locals[attr] = data[index];
        elem.attr("disabled", fnDisableIfTrue(scope, locals));
        index++;
      }
    }
  };
  return {
    priority: 0,
    require: 'ngModel',
    link: function(scope, iElement, iAttrs, ctrl) {
      // parse expression and build array of disabled options
      var expElements = iAttrs.optionsDisabled.match(
        /^\s*(.+)\s+for\s+(.+)\s+in\s+(.+)?\s*/);
      var attrToWatch = expElements[3];
      var fnDisableIfTrue = $parse(expElements[1]);
      scope.$watch(attrToWatch, function(newValue, oldValue) {
        if(newValue)
          disableOptions(scope, expElements[2], iElement,
            newValue, fnDisableIfTrue);
      }, true);
      // handle model updates properly
      scope.$watch(iAttrs.ngModel, function(newValue, oldValue) {
        var disOptions = $parse(attrToWatch)(scope);
        if(newValue)
          disableOptions(scope, expElements[2], iElement,
            disOptions, fnDisableIfTrue);
      });
    }
  };
}
optionsDisabledDirective.$inject = ['$parse'];
angular.module('common').directive('optionsDisabled', optionsDisabledDirective);


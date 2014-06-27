'use strict';

// http://stackoverflow.com/a/20790905
function optionsDisabledDirective($parse) {
  var disableOptions = function(scope, attr, element, data, fnDisableIfTrue) {
    // refresh the disabled options in the select element.
    var options = element.find('option');
    for (var position = 0, index = 0; position < options.length; position++) {
      var elem = angular.element(options[position]);
      if (elem.val() !== '') {
        var locals = {};
        locals[attr] = data[index];
        elem.attr('disabled', fnDisableIfTrue(scope, locals));
        index++;
      }
    }
  };
  return {
    require: 'ngModel',
    link: function(scope, element, attrs, ngModelController) {
      // parse expression and build array of disabled options
      var expElements = attrs.optionsDisabled.match(
        /^\s*(.+)\s+for\s+(.+)\s+in\s+(.+)?\s*/);
      var attrToWatch = expElements[3];
      var fnDisableIfTrue = $parse(expElements[1]);

      scope.$watch(attrToWatch, function(newValue) {
        if (newValue) disableOptions(scope, expElements[2], element, newValue, fnDisableIfTrue);
      }, true);

      function isAddNewOption(uuid) {
        var dataSourceArray = scope.$eval(attrToWatch);
        for (var i = 0, len = dataSourceArray.length; i < len; i++) {
          if (dataSourceArray[i].uuid === uuid && dataSourceArray[i].isAddNewItem) {
            ngModelController.$setViewValue();  // https://docs.angularjs.org/api/ng/type/ngModel.NgModelController
            return true;
          }
        }
      }

      // handle model updates properly
      scope.$watch(attrs.ngModel, function(newValue) {
        var disOptions = $parse(attrToWatch)(scope);
        if (newValue) {
          if (isAddNewOption(newValue)) {
            scope.setAddNewListVisible();
            return;
          }
          disableOptions(scope, expElements[2], element, disOptions, fnDisableIfTrue);
        }
      });
    }
  };
}
optionsDisabledDirective.$inject = ['$parse'];
angular.module('common').directive('optionsDisabled', optionsDisabledDirective);

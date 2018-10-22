export class JsonEditor {
  static getDI(){
    return [
      '$timeout'
    ];
  }
  
  constructor (...args) {
    this.di = [];
    JsonEditor.getDI().forEach((value, index) => {
      this.di[value] = args[index];
    }, this);
  
    this.restrict = 'A';
    this.require = 'ngModel';
    this.scope = {
      options: '=',
      ngJsoneditor: '=',
      preferText: '='
    };
    this.link = (...args) => this._link.apply(this, args);
  }
  
  _link ($scope, element, attrs, ngModel) {
    const JSONEditor = require('jsoneditor');
    let defaults = {};
    const $timeout = this.di.$timeout;
    
    let debounceTo, debounceFrom;
    let editor;
    let internalTrigger = false;

    function _createEditor(options) {
      let settings = angular.extend({}, defaults, options);
      let theOptions = angular.extend({}, settings, {
        change: function () {
          if (typeof debounceTo !== 'undefined') {
            $timeout.cancel(debounceTo);
          }

          debounceTo = $timeout(function () {
            if (editor) {
              internalTrigger = true;
              let error = undefined;
              try {
                ngModel.$setViewValue($scope.preferText === true ? editor.getText() : editor.get());
              } catch (err) {
                error = err;
              }

              if (settings && settings.hasOwnProperty('change')) {
                settings.change(error);
              }
            }
          }, settings.timeout || 100);
        }
      });

      element.html('');

      let instance = new JSONEditor(element[0], theOptions);

      if ($scope.ngJsoneditor instanceof Function) {
        $timeout(function () { $scope.ngJsoneditor(instance);});
      }

      return instance;
    }

    $scope.$watch('options', function (newValue, oldValue) {
      for (let k in newValue) {
        if (newValue.hasOwnProperty(k)) {
          let v = newValue[k];

          if (newValue[k] !== oldValue[k]) {
            if (k === 'mode') {
              editor.setMode(v);
            } else if (k === 'name') {
              editor.setName(v);
            } else { //other settings cannot be changed without re-creating the JsonEditor
              editor = _createEditor(newValue);
              $scope.updateJsonEditor();
              return;
            }
          }
        }
      }
    }, true);

    $scope.$on('$destroy', function () {
      //remove jsoneditor?
    });

    $scope.updateJsonEditor = function (newValue) {
      if (internalTrigger) {
        //ignore if called by $setViewValue (after debounceTo)
        internalTrigger = false;
        return;
      }

      if (typeof debounceFrom !== 'undefined') {
        $timeout.cancel(debounceFrom);
      }

      debounceFrom = $timeout(function () {
        if (($scope.preferText === true) && !angular.isObject(ngModel.$viewValue)) {
          editor.setText(ngModel.$viewValue || '{}');
        } else {
          editor.set(ngModel.$viewValue || {});
        }
      }, $scope.options.timeout || 100);
    };

    editor = _createEditor($scope.options);

    if ($scope.options.hasOwnProperty('expanded')) {
      $timeout($scope.options.expanded ? function () {editor.expandAll()} : function () {editor.collapseAll()}, ($scope.options.timeout || 100) + 100);
    }

    ngModel.$render = $scope.updateJsonEditor;
    $scope.$watch(function () { return ngModel.$modelValue; }, $scope.updateJsonEditor, true); //if someone changes ng-model from outside
  }
}

JsonEditor.$inject = JsonEditor.getDI();
JsonEditor.$$ngIsClass = true;
export class mdlText {
  static getDI() {
    return [];
  }

  constructor(...args) {
    this.di = {};
    mdlText.getDI().forEach((value, index) => {
      this.di[value] = args[index];
    });
    this.replace = true;
    this.restrict = 'E';
    this.template = require('../templates/text.html');
    this.scope = {
      value: '=ngModel',
      displayLabel: '=',
      disable: '=',
    };
    this.link = (...args) => this._link.apply(this, args);
  }

  _link (scope, element, attrs, ngModel) {
    scope.hint = scope.displayLabel && scope.displayLabel.hint;
    scope.id = scope.displayLabel && scope.displayLabel.id;
    scope.type = scope.displayLabel && scope.displayLabel.type || 'text';
    scope.required = scope.displayLabel && scope.displayLabel.required || 'false';

    if (scope.disable) {   //scope.$eval(attrs.status)
      element.addClass('mdc-text-field--disabled');
      element.find('input').attr('disabled', true);
      //当text有值且禁用，hint不显示
      if (scope.value) {
        scope.hint = null;
      }
    }

    if (scope.required) {
      element.find('input').attr('required', true);
    }

    scope.focus = () => {
      element.addClass('mdc-text-field--focused');
      element.find('label').addClass('mdc-floating-label--float-above');
      element.find('div').addClass('mdc-line-ripple--active');
    };

    scope.blur = () => {
      if (!scope.value) {
        element.find('label').removeClass('mdc-floating-label--float-above');
      }
      element.removeClass('mdc-text-field--focused');
      element.find('div').removeClass('mdc-line-ripple--active');
    };
  }
}
mdlText.$inject = mdlText.getDI();
mdlText.$$ngIsClass = true;
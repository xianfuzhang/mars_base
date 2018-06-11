export class mdlTextarea {
  static getDI() {
    return [];
  }

  constructor(...args) {
    this.di = {};
    mdlTextarea.getDI().forEach((value, index) => {
      this.di[value] = args[index];
    });
    this.replace = true;
    this.restrict = 'E';
    this.template = require('../templates/textarea.html');
    this.scope = {
      value: '=ngModel',
      displayLabel: '=',
      disable: '=',
    };
    this.link = (...args) => this._link.apply(this, args);
  }

  _link (scope, element, attrs, ngModel) {
    scope.hint = scope.displayLabel && scope.displayLabel.hint;
    scope.resize = scope.displayLabel && scope.displayLabel.resize || false;
    if (!scope.resize) {
      element.find('textarea').css('resize', 'none');
    }
    if (scope.disable) {
      element.addClass('mdc-text-field--disabled');
      element.find('textarea').attr('disabled', true);
      //当text有值,hint float
      if (scope.value) {
        element.find('label').addClass('mdc-floating-label--float-above');
      }
    }

    scope.focus = () => {
      element.addClass('mdc-text-field--focused');
      element.find('label').addClass('mdc-floating-label--float-above');
    };

    scope.blur = () => {
      if (!scope.value) {
        element.find('label').removeClass('mdc-floating-label--float-above');
      }
      element.removeClass('mdc-text-field--focused');
    };
  }
}
mdlTextarea.$inject = mdlTextarea.getDI();
mdlTextarea.$$ngIsClass = true;
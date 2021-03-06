export class mdlSelect {
  static getDI() {
    return [
      '$compile'
    ];
  }

  constructor(...args) {
    this.di = {};
    mdlSelect.getDI().forEach((value, index) => {
      this.di[value] = args[index];
    });
    this.replace = true;
    this.restrict = 'E';
    this.template = require('../templates/select.html');
    this.scope = {
      value: '=ngModel',
      displayLabel: '=',
      helper: '=',
      disable: '=',
    }
    this.link = (...args) => this._link.apply(this, args);
  }

  _link (scope, element, attrs, ngModel) {
    if (scope.disable) {
      angular.element(element.children()[0]).addClass('mdc-select--disabled');
      element.find('select').attr('disabled', true);
    }
    scope.hint = scope.displayLabel && scope.displayLabel.hint;
    scope.options = scope.displayLabel && scope.displayLabel.options;

    if (scope.helper) {
      //scope.helpId = scope.helper.id;
      scope.content = scope.helper.content;
      let helperElement = this.di.$compile('<p aria-hidden="true"' +
        'class="mdc-text-field-helper-text" >{{content}} </p>')(scope);
      element.append(helperElement);
      //说明信息会一直显示
      helperElement.addClass('mdc-text-field-helper-text--persistent');
    }

    if (scope.value) {
      element.find('label').addClass('mdc-floating-label--float-above');
      element.find('div').addClass('mdc-line-ripple--active');
    }

    scope.selectChange = () => {
      element.find('label').addClass('mdc-floating-label--float-above');
      element.find('div').addClass('mdc-line-ripple--active');
    };
  }
}

mdlSelect.$inject = mdlSelect.getDI();
mdlSelect.$$ngIsClass = true;
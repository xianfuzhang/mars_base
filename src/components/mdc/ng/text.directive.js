export class mdlText {
  static getDI() {
    return [
      '$compile'
    ];
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
      helper: '=',
      disable: '=',
    };
    this.link = (...args) => this._link.apply(this, args);
  }

  _link (scope, element, attrs, ngModel) {
    let helperElement;

    scope.hint = scope.displayLabel && scope.displayLabel.hint;
    scope.id = scope.displayLabel && scope.displayLabel.id;
    scope.type = scope.displayLabel && scope.displayLabel.type || 'text';
    scope.required = scope.displayLabel && scope.displayLabel.required || 'false';
    scope.helpId = scope.helper && scope.helper.id;
    scope.content = scope.helper && scope.helper.content;

    if (scope.disable) {   //scope.$eval(attrs.status)
      angular.element(element.children()[0]).addClass('mdc-text-field--disabled');
      element.find('input').attr('disabled', true);
      //当text有值且禁用，hint不显示
      if (scope.value) {
        scope.hint = null;
      }
    }

    if (scope.required) {
      element.find('input').attr('required', true);
    }

    if (scope.helper) {
      helperElement = this.di.$compile('<p id="{{helpId}}" aria-hidden="true"' +
        'class="mdc-text-field-helper-text" >{{content}} </p>')(scope);
      element.append(helperElement);
      element.find('input').attr('aria-controls', scope.helpId);
      element.find('input').attr('aria-describedby', scope.helpId);

      //说明信息会一直显示
      if (scope.helper.persistent) {
        helperElement.addClass('mdc-text-field-helper-text--persistent');
      }
      //告警信息当invalid才会显示
      if (scope.helper.validation) {
        angular.element(element.children()[0]).addClass('mdc-text-field--invalid');
        helperElement.addClass('mdc-text-field-helper-text--validation-msg');
      }
      else {
        angular.element(element.children()[0]).removeClass('mdc-text-field--invalid');
        helperElement.removeClass('mdc-text-field-helper-text--validation-msg');
      }
    }

    scope.focus = () => {
      angular.element(element.children()[0]).addClass('mdc-text-field--focused');
      element.find('label').addClass('mdc-floating-label--float-above');
      element.find('div').addClass('mdc-line-ripple--active');
    };

    scope.blur = () => {
      if (!scope.value) {
        element.find('label').removeClass('mdc-floating-label--float-above');
      }
      angular.element(element.children()[0]).removeClass('mdc-text-field--focused');
      element.find('div').removeClass('mdc-line-ripple--active');
    };
  }
}
mdlText.$inject = mdlText.getDI();
mdlText.$$ngIsClass = true;
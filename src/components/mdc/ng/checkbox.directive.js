export class mdlCheckbox {
  static getDI() {
    return [];
  }
  constructor(...args){
    this.di = {};
    mdlCheckbox.getDI().forEach((value, index) => {
      this.di[value] = args[index];
    });
    this.replace = true;
    this.require = 'ngModel';
    this.restrict = 'E';
    this.template = require('../templates/checkbox.html');
    this.scope = {
      data: '=ngModel',
      displayLabel: '=',
      disable: '=',
      onClick : '&'
    };
    this.link = (...args) => this._link.apply(this, args);
  }

  _link (scope, element, attrs, ngModel) {
    scope.label = scope.displayLabel && scope.displayLabel.label;
    scope.id = scope.displayLabel && scope.displayLabel.id;
    scope.onClick = scope.onClick || angular.noop;

    if (scope.disable) {
      element.find('input').attr('disabled', true);
    }
    if (scope.data) {
      element.find('input').attr('checked' ,true);
    }
    if (attrs.size && attrs.size === 'small') {
      let checkboxElm = element.children().eq(0);
      checkboxElm.addClass('mdc-checkbox__small');
      checkboxElm.children().eq(1).addClass('mdc-checkbox__background-small');
    }

    scope.clicked = (event) => {
      scope.data = !scope.data;
      ngModel.$setViewValue(scope.data);

      scope.onClick({'$value': scope.data});
      event.stopPropagation();
    };
  }
}

mdlCheckbox.$inject = mdlCheckbox.getDI();
mdlCheckbox.$$ngIsClass = true;
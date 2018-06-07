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
    };
    this.link = (...args) => this._link.apply(this, args);
  }

  _link (scope, element, attrs, ngModel) {
    scope.label = scope.displayLabel && scope.displayLabel.label;
    scope.id = scope.displayLabel && scope.displayLabel.id;

    if (scope.disable) {   //scope.$eval(attrs.status)
      element.addClass('mdc-checkbox--disabled');
    }
    if (scope.data) {
      element.find('input').attr('checked' ,true);
    }

    scope.clicked = (event) => {
      scope.data = !scope.data;
      ngModel.$setViewValue(scope.data);
      event.stopPropagation();
    };
  }
}

mdlCheckbox.$inject = mdlCheckbox.getDI();
mdlCheckbox.$$ngIsClass = true;
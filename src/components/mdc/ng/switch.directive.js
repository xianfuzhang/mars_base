export class mdlSwitch {
  static getDI() {
    return [];
  }
  constructor(...args){
    this.di = {};
    mdlSwitch.getDI().forEach((value, index) => {
      this.di[value] = args[index];
    });
    this.replace = true;
    this.require = 'ngModel';
    this.restrict = 'E';
    this.template = require('../templates/switch.html');
    this.scope = {
      displayLabel: '=',
      disable: '=',
      data: '=ngModel',
    };
    this.link = (...args) => this._link.apply(this, args);
  }

  _link (scope, element, attrs, ngModel) {
    if (scope.disable) {   //scope.$eval(attrs.status)
      element.find('input').attr('disabled', true);
    }
    if (scope.data) {
      element.find('input').attr('checked' ,true);
    }
    scope.onLabel = (scope.displayLabel && scope.displayLabel.on) || 'on';
    scope.offLabel = (scope.displayLabel && scope.displayLabel.off) || 'off';
    scope.switchId = scope.displayLabel && scope.displayLabel.id;

    scope.clicked = () => {
      scope.data = !scope.data;
      ngModel.$setViewValue(scope.data);
    };

    scope.$on('$destroy', ()=> {

    });
  }
}

mdlSwitch.$inject = mdlSwitch.getDI();
mdlSwitch.$$ngIsClass = true;
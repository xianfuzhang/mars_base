export class mdlSwitch {
  static getDI() {
    return [
      '_'
    ];
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
      onClick: '&',
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

    scope.onClick = scope.onClick || angular.noop;

    if (scope.data === true || scope.data === "true") {
      element.find('input').attr('checked' ,true);
    }
    scope.onLabel = (scope.displayLabel && scope.displayLabel.on) || 'on';
    scope.offLabel = (scope.displayLabel && scope.displayLabel.off) || 'off';
    scope.switchId = scope.displayLabel && scope.displayLabel.id;

    scope.clicked = () => {
      scope.data = !scope.data;
      ngModel.$setViewValue(scope.data);
      scope.onClick();
    };


    let unSubscribers = [];
    unSubscribers.push(scope.$watch('data',(value)=>{
      if (value === true || value === "true") {
        element.find('input').attr('checked' ,true);
      } else {
        element.find('input').attr('checked' ,false);
      }
    }));

    scope.$on('$destroy', ()=> {
      this.di._.forEach(unSubscribers,(unSub)=>{
        unSub();
      })
    });
  }
}

mdlSwitch.$inject = mdlSwitch.getDI();
mdlSwitch.$$ngIsClass = true;
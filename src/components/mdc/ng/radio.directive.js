export class mdlRadio {
  static getDI() {
    return [];
  }
  constructor(...args){
    this.di = {};
    mdlRadio.getDI().forEach((value, index) => {
      this.di[value] = args[index];
    });
    this.replace = true;
    this.require = 'ngModel';
    this.restrict = 'E';
    this.template = require('../templates/radio.html');
    this.scope = {
      data: '=ngModel',
      displayLabel: '=',
      disable: '=',
      onClick: '&'
    };
    this.link = (...args) => this._link.apply(this, args);
  }

  _link (scope, element, attrs, ngModel) {
    let unSubscribers = [];
    scope.label = scope.displayLabel && scope.displayLabel.label;
    scope.id = scope.displayLabel && scope.displayLabel.id;
    scope.name = scope.displayLabel && scope.displayLabel.name;
    scope.value = scope.displayLabel && scope.displayLabel.value;

    if (scope.disable) {   //scope.$eval(attrs.status)
      element.addClass('mdc-radio--disabled');
      element.find('input').attr('disabled', true);
    }

    scope.isRadioChecked = () => {
      if (scope.data === scope.value) {
        element.find('input').attr('checked' ,true);
        return true;
      }
      else {
        element.find('input').attr('checked' , false);
        return false;
      }
    };

    scope.clicked = (event) => {
      scope.onClick = scope.onClick || angular.noop;
      ngModel.$setViewValue(scope.value);
      scope.onClick();
      event.stopPropagation();
    };
  
    unSubscribers.push(scope.$watch('disable',(newValue)=>{
      if (scope.disable) {   //scope.$eval(attrs.status)
        element.addClass('mdc-radio--disabled');
        element.find('input').attr('disabled', true);
      } else {
        element.removeClass('mdc-radio--disabled');
        element.find('input').attr('disabled', false);
      }
    }));
  
    scope.$on('$destroy', () => {
      unSubscribers.forEach((unSubscribe) => {
        unSubscribe();
      });
    });
  }
}

mdlRadio.$inject = mdlRadio.getDI();
mdlRadio.$$ngIsClass = true;
export class mdlSelect {
  static getDI() {
    return [
      '$compile',
      '_',
      '$timeout'
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
      ngChange: '&',
      onInit: '&'
    };

    this.link = (...args) => this._link.apply(this, args);
  }

  _link (scope, element, attrs, ngModel) {
    let unSubscribes = [];
    if (scope.disable) {
      // angular.element(element.children()[0]).addClass('mdc-select--disabled');
      // element.find('select').attr('disabled', true);
      disable();
    }
    scope.hint = scope.displayLabel && scope.displayLabel.hint;
    scope.options = scope.displayLabel && scope.displayLabel.options;
    if(scope.options){
      scope.value = scope.options[0];
    }
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
      scope.ngChange = scope.ngChange || angular.noop;
      scope.ngChange({'$value': scope.value});
    };

    function disable(){
      angular.element(element.children()[0]).addClass('mdc-select--disabled');
      element.find('select').attr('disabled', true);
    }

    function enable(){
      angular.element(element.children()[0]).removeClass('mdc-select--disabled');
      element.find('select').attr('disabled', false);
    }

    unSubscribes.push(scope.$watch('disable',(newValue)=>{
      if(newValue === true){
        disable();
      } else {
        enable();
      }
    }));

    unSubscribes.push(scope.$watch('displayLabel.options',(newValue)=>{
      // console.log(newValue);
      // console.log(scope.displayLabel);
      scope.options = newValue;
    }));

    this.di.$timeout(function () {
      if(scope.onInit){
        scope.onInit();
      }
    })

    scope.$on('$destroy', () => {
      this.di._.each(unSubscribes, (unSubscribe) => {
        unSubscribe();
      });
    });
  }
}

mdlSelect.$inject = mdlSelect.getDI();
mdlSelect.$$ngIsClass = true;
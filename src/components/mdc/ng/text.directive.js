export class mdlText {
  static getDI() {
    return [
      '$compile',
      '_',
      'regexService'
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
      disable: '@',
      datalist:'@',
      formatValidate: '&' //在blur中已经做了正则校验，该方法用于范围的校验，字符长度、整数范围等
    };
    this.link = (...args) => this._link.apply(this, args);
  }

  _link (scope, element, attrs, ngModel) {
    let helperElement;

    let unSubscribes = [];

    scope.hint = scope.displayLabel && scope.displayLabel.hint;
    scope.id = scope.displayLabel && scope.displayLabel.id;
    scope.regType = scope.displayLabel && scope.displayLabel.regType;
    scope.type = scope.displayLabel && scope.displayLabel.type || 'text';
    scope.required = scope.displayLabel && scope.displayLabel.required || 'false';
    scope.helpId = scope.helper && scope.helper.id;
    scope.content = scope.helper && scope.helper.content;

    if (scope.disable == 'true') {   //scope.$eval(attrs.status)
      // angular.element(element.children()[0]).addClass('mdc-text-field--disabled');
      // element.find('input').attr('disabled', true);
      disable();
      //当text有值,hint float
      if (scope.value) {
        element.find('label').addClass('mdc-floating-label--float-above');
        //element.find('div').addClass('mdc-line-ripple--active');
      }
    }

    if (scope.required !== 'false') {
      element.find('input').attr('required', true);
    }

    function changeValidationState() {
      scope.content = scope.helper.content;
      //告警信息当invalid才会显示
      if (scope.helper.validation === 'true') {
        angular.element(element.children()[0]).addClass('mdc-text-field--invalid');
      }
      else {
        angular.element(element.children()[0]).removeClass('mdc-text-field--invalid');
      }
    }
    if (scope.helper) {
      helperElement = this.di.$compile('<p id="{{helpId}}" aria-hidden="true"' +
        'class="mdc-text-field-helper-text" >{{content}} </p>')(scope);
      element.append(helperElement);
      element.find('input').attr('aria-controls', scope.helpId);
      element.find('input').attr('aria-describedby', scope.helpId);

      //说明信息会一直显示
      if (scope.helper.persistent === 'true') {
        helperElement.addClass('mdc-text-field-helper-text--persistent');
      }
      if (scope.helper.validation) {
        helperElement.addClass('mdc-text-field-helper-text--validation-msg');
      }
      changeValidationState();
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
      if (scope.regType) {
        scope.helper.validation = this.di.regexService.excute(scope.regType, scope.value) ? 'false' : 'true';
      }
      angular.element(element.children()[0]).removeClass('mdc-text-field--focused');
      element.find('div').removeClass('mdc-line-ripple--active');
      scope.formatValidate = scope.formatValidate || angular.noop;
      scope.formatValidate();
    };

    function disable(){
      angular.element(element.children()[0]).addClass('mdc-text-field--disabled');
      element.find('input').attr('disabled', true);
    }

    function enable(){
      angular.element(element.children()[0]).removeClass('mdc-text-field--disabled');
      element.find('input').attr('disabled', false);
    }

    /*unSubscribes.push(scope.$watch('value',(newValue)=>{
      if(!scope.value){
        scope.blur();
      } else {
        scope.focus();
      }
    }));*/

    unSubscribes.push(scope.$watch('disable',(newValue)=>{
      if(newValue === 'true'){
        disable();
      } else {
        enable();
      }
    }));
    
     scope.$watch('helper.validation', (newVal, oldVal) => {
      if (scope.helper) {
        changeValidationState();
      }
    }, true);

     scope.$watch('helper.content', (newVal, oldVal) => {
      if (scope.helper) {
        changeValidationState();
      }
    }, true);

    scope.$on('$destroy', () => {
      this.di._.each(unSubscribes, (unSubscribe) => {
        unSubscribe();
      });
    });

  }
}
mdlText.$inject = mdlText.getDI();
mdlText.$$ngIsClass = true;
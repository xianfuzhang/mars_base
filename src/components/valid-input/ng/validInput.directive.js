/**
 * Created by wls on 2018/6/7.
 */

export class validInput {
  static getDI () {
    return [
      '$rootScope',
      '$filter'
    ];
  }

  constructor (...args) {
    this.di = [];
    validInput.getDI().forEach((value, index) => {
      this.di[value] = args[index];
    }, this);

    this.replace = true;
    this.restrict = 'E';
    this.template = require('../template/valid_input');
    this.translate = this.di.$filter('translate');

    this.scope = {
      vName : '@',
      vRequire: '@',
      vModel : '=ngModel',
      vRegex: '=',
      vMessage: '@',
      vRpcid: '@'

    };

    this.link = (...args) => this._link.apply(this, args);
  }

  _link (scope, element) {
    (function init(){

      let unsubscribers = [];


      scope.validModel = {
        name: scope.vName,
        require: scope.vRequire,
        ngPattern: scope.vRegex,
        isInvalid: false,
        change: false,
        message: scope.vMessage,
        emptyMessage: this.translate('MODULES.REGEX.FLOW_ADD.NOTNULL'),
        mouseOver: false
      };

      scope.blur = () => {
        setTimeout(function () {
          scope.validModel.change = true;
          let invalid = element.children().hasClass('ng-invalid');
          scope.validModel.isInvalid = invalid && scope.validModel.change;
          scope.$apply();
        })
      };

      scope.onchange = () => {
        setTimeout(function () {
          scope.validModel.change = true;
          let invalid = element.children().hasClass('ng-invalid');
          scope.validModel.isInvalid = invalid && scope.validModel.change;
          scope.$apply();
        })
      };

      // unsubscribers.push(scope.$watch('vModel',(newData)=>{
      //   // let invalid = element.children().hasClass('ng-invalid');
      //   // let a = 2;
      //   // a = 2 *2 ;
      //   // scope.validModel.isInvalid = invalid && scope.validModel.change;
      // }));
      scope.mouseEnter = () => {
        scope.validModel.mouseOver = true;
        // scope.$apply();
      };

      scope.mouseLeave = () => {
        scope.validModel.mouseOver = false;
        // scope.$apply();
      };



      unsubscribers.push(this.di.$rootScope.$on(scope.vRpcid,()=>{
        // console.log('valid input message receive=========')
        scope.validModel.change = true;
        let invalid = element.children().hasClass('ng-invalid');
        scope.validModel.isInvalid = invalid && scope.validModel.change;
        // scope.$apply();
      }));


      scope.$on('$destroy', () => {
        unsubscribers.forEach((unsubscribe) => {
          unsubscribe();
        });
      });



    }).call(this);
  }
}

validInput.$inject = validInput.getDI();
validInput.$$ngIsClass = true;

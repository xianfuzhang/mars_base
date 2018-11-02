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
      ngChange: '&',
      vRegex: '=',
      vType: '=',
      vMessage: '@',
      vRpcid: '@',
      vStyle: '@',
      vSpan: '@',
      vList: '@'
    };

    this.link = (...args) => this._link.apply(this, args);
  }

  _link (scope, element, attr) {
    (function init(){

      let unsubscribers = [];
      scope.ngChange = scope.ngChange|| angular.noop;

      let getMessageByType = (type) =>{

        let message = '';
        if(type === 'mac'){
          message = this.translate('MODULES.REGEX.FLOW_ADD.MAC')
        } else if(type === 'ipv4'){
          message = this.translate('MODULES.REGEX.FLOW_ADD.IPV4')
        } else if(type === 'ipv4_multi'){
          message = this.translate('MODULES.REGEX.FLOW_ADD.IPV4_MULTI')
        } else if(type === 'ipv6'){
          message = this.translate('MODULES.REGEX.FLOW_ADD.IPV6')
        } else if (type === 'int'){
          message = this.translate('MODULES.REGEX.FLOW_ADD.NUMBER')
        }
        return message;
      };

      let getPattern = (type) =>{

        let regex = '';
        if(type === 'mac'){
          regex = '^([A-Fa-f0-9]{2}:){5}[A-Fa-f0-9]{2}$';
        } else if(type === 'ipv4'){
          regex = '^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$';
        } else if(type === 'ipv4_multi'){
          regex = '^(22[4-9]|23[0-9])(\\.[0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5]){3}$';
        } else if(type === 'ipv6'){
          regex = /((^\s*((([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5]))\s*$)|(^\s*((([0-9A-Fa-f]{1,4}:){7}([0-9A-Fa-f]{1,4}|:))|(([0-9A-Fa-f]{1,4}:){6}(:[0-9A-Fa-f]{1,4}|((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){5}(((:[0-9A-Fa-f]{1,4}){1,2})|:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){4}(((:[0-9A-Fa-f]{1,4}){1,3})|((:[0-9A-Fa-f]{1,4})?:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){3}(((:[0-9A-Fa-f]{1,4}){1,4})|((:[0-9A-Fa-f]{1,4}){0,2}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){2}(((:[0-9A-Fa-f]{1,4}){1,5})|((:[0-9A-Fa-f]{1,4}){0,3}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){1}(((:[0-9A-Fa-f]{1,4}){1,6})|((:[0-9A-Fa-f]{1,4}){0,4}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(:(((:[0-9A-Fa-f]{1,4}){1,7})|((:[0-9A-Fa-f]{1,4}){0,5}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:)))(%.+)?\s*$))/;
        } else if (type === 'int'){
          regex = '^\d$|^[1-9]+[0-9]*$';
        } else if (type === 'int_with_zero'){
          regex = '^\d$|^[1-9]+[0-9]*$|^0*$';
        }
        return regex;
      };

      scope.validModel = {
        name: scope.vName,
        require: scope.vRequire === 'true'? true : false,
        ngPattern: scope.vRegex || getPattern(scope.vType||attr.vType),
        isInvalid: false,
        change: false,
        message: scope.vMessage || getMessageByType(scope.vType),
        emptyMessage: this.translate('MODULES.REGEX.FLOW_ADD.NOTNULL'),
        mouseOver: false
      };

      scope.blockOrInline = {};

      if(scope.vStyle){
        scope.vStyle = JSON.parse(scope.vStyle);
        scope.blockOrInline = scope.vStyle;
      }

      if(scope.vSpan  === 'true' || scope.vSpan === true){
        scope.blockOrInline['display'] = 'inline-block';
      }

      if(scope.vList) {
        element.find('input').attr('list', scope.vList)
      }

      scope.blur = () => {
        setTimeout(function () {
          scope.validModel.change = true;
          let invalid = element.children().hasClass('ng-invalid');
          scope.validModel.isInvalid = invalid && scope.validModel.change;
          scope.$apply();
        })
      };

      // scope.onchange = () => {
      //   setTimeout(function () {
      //     console.log('====>' + scope.vModel);
      //     scope.validModel.change = true;
      //     let invalid = element.children().hasClass('ng-invalid');
      //     scope.validModel.isInvalid = invalid && scope.validModel.change;
      //     scope.$apply();
      //
      //     // console.log('====>' + scope.vModel);
      //   })
      // };

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

      unsubscribers.push(scope.$watch('vModel',()=>{
        scope.ngChange();
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

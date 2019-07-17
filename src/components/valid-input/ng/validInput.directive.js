/**
 * Created by wls on 2018/6/7.
 */

import {MDCTextField} from '@material/textfield';
import {MDCTextFieldHelperText} from '@material/textfield/helper-text';
import {MDCTextFieldIcon} from '@material/textfield/icon';

export class validInput {
  static getDI() {
    return [
      '$rootScope',
      '$filter',
      '$timeout',
      'uuid'
    ];
  }

  constructor(...args) {
    this.di = [];
    validInput.getDI().forEach((value, index) => {
      this.di[value] = args[index];
    }, this);

    this.replace = true;
    this.restrict = 'E';
    this.template = require('../template/valid_input');
    this.translate = this.di.$filter('translate');
    this.transclude = {
      'trailing': '?transcludeTrailing',
      'leading': '?transcludeLeading'
    };

    this.scope = {
      vName: '@',
      vLabel: '@',
      vHelper: '@',
      vFixedHeight: '@',
      vRequire: '@',
      vValue: '=ngValue',
      vModel: '=ngModel',
      ngChange: '&',
      vRegex: '=',
      vType: '@',
      vMessage: '@',
      vRpcid: '@',
      vEmptyMessage : '@',
      vDisabled: '=',
      vStyle: '@',
      vWidth: '@',
      vSpan: '@',
      vList: '@'
    };

    this.link = (...args) => this._link.apply(this, args);
  }

  _link(scope, element, attr) {
    (function init() {

      let unsubscribers = [];
      scope.ngChange = scope.ngChange || angular.noop;
      scope.disabled = scope.vDisabled || false;
      scope.id = this.di.uuid();
      scope.help_id = scope.id + '-helper-text';

      let getMessageByType = (type) => {

        let message = '';
        if (type === 'mac') {
          message = this.translate('MODULES.REGEX.FLOW_ADD.MAC')
        } else if (type === 'ipv4') {
          message = this.translate('MODULES.REGEX.FLOW_ADD.IPV4')
        } else if (type === 'ipv4_multi') {
          message = this.translate('MODULES.REGEX.FLOW_ADD.IPV4_MULTI')
        } else if (type === 'ipv6') {
          message = this.translate('MODULES.REGEX.FLOW_ADD.IPV6')
        } else if (type === 'int') {
          message = this.translate('MODULES.REGEX.FLOW_ADD.NUMBER')
        } else if (type === 'vlan') {
          message = this.translate('MODULES.REGEX.FLOW_ADD.VLAN')
        } else if (type === 'ipv4_mask') {
          message = this.translate('MODULES.REGEX.FLOW_ADD.IPV4_MASK')
        } else if (type === 'ipv4_mask_or_not') {
          message = this.translate('MODULES.REGEX.FLOW_ADD.IPV4_MASK_OR_NOT')
        } else if (type === 'port') {
          message = this.translate('MODULES.REGEX.FLOW_ADD.PORT')
        } else if (type === 'host'){
          message = this.translate('MODULES.REGEX.FLOW_ADD.HOST')
        } else if (type === 'port_array') {
          message = this.translate('MODULES.REGEX.FLOW_ADD.PORT_ARRAY')
        } else if (type === 'hour') {
          message = this.translate('MODULES.REGEX.TIMERANGE.HOUR')
        } else if (type === 'minute') {
          message = this.translate('MODULES.REGEX.TIMERANGE.MINUTE')
        }
        return message;
      };

      let getPattern = (type) => {

        let regex = '';
        if (type === 'mac') {
          regex = '^([A-Fa-f0-9]{2}:){5}[A-Fa-f0-9]{2}$';
        } else if (type === 'ipv4') {
          regex = '^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$';
        } else if (type === 'ipv4_multi') {
          regex = '^(22[4-9]|23[0-9])(\\.[0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5]){3}$';
        } else if (type === 'ipv6') {
          regex = '((^\s*((([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5]))\s*$)|(^\s*((([0-9A-Fa-f]{1,4}:){7}([0-9A-Fa-f]{1,4}|:))|(([0-9A-Fa-f]{1,4}:){6}(:[0-9A-Fa-f]{1,4}|((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){5}(((:[0-9A-Fa-f]{1,4}){1,2})|:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){4}(((:[0-9A-Fa-f]{1,4}){1,3})|((:[0-9A-Fa-f]{1,4})?:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){3}(((:[0-9A-Fa-f]{1,4}){1,4})|((:[0-9A-Fa-f]{1,4}){0,2}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){2}(((:[0-9A-Fa-f]{1,4}){1,5})|((:[0-9A-Fa-f]{1,4}){0,3}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){1}(((:[0-9A-Fa-f]{1,4}){1,6})|((:[0-9A-Fa-f]{1,4}){0,4}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(:(((:[0-9A-Fa-f]{1,4}){1,7})|((:[0-9A-Fa-f]{1,4}){0,5}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:)))(%.+)?\s*$))';
        } else if (type === 'int') {
          regex = '^\d$|^[1-9]+[0-9]*$';
        } else if (type === 'int_with_zero') {
          regex = '^\d$|^[1-9]+[0-9]*$|^0*$';
        } else if (type === 'vlan') {
          regex = '^\d$|^[1-9]+[0-9]*$';
        } else if (type === 'ipv4_mask') {
          regex = '^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])/([0-9]|[1-2][0-9]|3[0-2])$';
        } else if (type === 'ipv4_mask_or_not') {
          regex = '^((([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])/([0-9]|[1-2][0-9]|3[0-2]))|(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$';
        } else if (type === 'port') {
          regex = '^[1-9]|[1-9][0-9]$';
        } else if( type === 'host'){
          regex = '^[a-zA-z]+[0-9a-zA-Z\.\-]*$'
        } else if( type === 'port_array'){
          regex = '^(([1-9]|[1-9][0-9])\\s*,\\s*)*([1-9]|[1-9][0-9])$'
        } else if( type === 'hour'){
          regex = '^[0-9]|1[0-9]|2[0-3]$'
        } else if( type === 'minute'){
          regex = '^[0-9]|[1-5][0-9]$'
        }



        return regex;
      };

      // ﻿element[0].querySelector('.mdc-select__menu');

      scope.validModel = {
        name: scope.vName,
        require: scope.vRequire === 'true',
        fixedHeight: scope.vFixedHeight === 'true', //固定高度，避免下面的info撑开整个div的高度
        ngPattern: scope.vRegex || getPattern(scope.vType || attr.vType),
        isInvalid: false,
        change: false,
        message: scope.vHelper || null,
        emptyMessage: scope.vEmptyMessage || this.translate('MODULES.REGEX.FLOW_ADD.NOTNULL'),
        floatLabel: scope.vLabel ? scope.vLabel : null,
        mouseOver: false,
        focus: false,
        hasLabel: false,
        conTrailIcon: false,
        conLeadIcon: false,
        vStyle: scope.vStyle?JSON.parse(scope.vStyle):""
      };

      let _init = () => {
        let inputEle = element[0].querySelector('.mdc-text-field');
        const textField = new MDCTextField(inputEle);
        if(scope.validModel.ngPattern !== '' && scope.validModel.ngPattern !== null){
          // angular.element(inputEle).attr('pattern', scope.validModel.ngPattern);
          element.find('input').attr('pattern', scope.validModel.ngPattern)
        }
        scope.textFieldModel = textField;
        const helperText = new MDCTextFieldHelperText(element[0].querySelector('.mdc-text-field-helper-text'));
        scope.textFieldHelpTextModel = helperText;
        helperText.getDefaultFoundation().setPersistent(true);

        // let iconEle= element[0].querySelector('.mdc-text-field-icon');
        let trail_icon_span = element[0].querySelector('.valid_trail_icon');
        if(trail_icon_span.childElementCount > 0){
          let trail_icon =  trail_icon_span.querySelector('.mdc-text-field-icon');
          scope.validModel.conTrailIcon = true;
          if(trail_icon){
            const trail_icon_obj = new MDCTextFieldIcon(trail_icon);
          }
        }

        let lead_icon_span = element[0].querySelector('.valid_lead_icon');
        if(lead_icon_span.childElementCount > 0){
          let lead_icon =  lead_icon_span.querySelector('.mdc-text-field-icon');
          scope.validModel.conLeadIcon = true;
          if(lead_icon){
            const lead_icon_obj = new MDCTextFieldIcon(lead_icon);
          }
        }



      };
      _init();


      scope.blockOrInline = {};

      if (scope.vStyle) {
        // scope.vStyle = JSON.parse(scope.vStyle);
        scope.blockOrInline = JSON.parse(scope.vStyle);
      }

      if (scope.vSpan === 'true' || scope.vSpan === true) {
        scope.blockOrInline['display'] = 'inline-block';
      }

      if (scope.vList) {
        element.find('input').attr('list', scope.vList)
      }

      scope.blur = ($event) => {
        scope.validModel.focus = false;

        scope.validModel.isInvalid = !scope.textFieldModel.getDefaultFoundation().isValid();
        this.di.$timeout(()=>{
          if(scope.validModel.isInvalid && scope.validModel.floatLabel === null){

            scope.inputStyle = {'animation': '.4s linear', 'animation-name': 'shake'};
            this.di.$timeout(()=> {
              scope.inputStyle = {};
            }, 500)

          }
        });
        // 如果合理的话，则是2秒之后
        if(scope.validModel.isInvalid){
          if(scope.validModel.require && scope.textFieldModel.value === ''){
            scope.validModel.message = scope.validModel.emptyMessage;
          } else {
            scope.validModel.message = scope.vMessage || getMessageByType(scope.vType || attr.vType);
          }
        } else {
          scope.validModel.message = scope.vHelper || null;
          // if(scope.vHelper){
          //   scope.validModel.message = scope.vHelper || null;
          // } else {
          //   this.di.$timeout(()=>{
          //     scope.validModel.message =  null;
          //   }, 400)
          //
          // }
        }

        // else {
        //   scope.validModel.message = scope.vHelper || null;
        // }

        console.log(scope.textFieldModel.getDefaultFoundation().isValid())

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

      scope.focus = () => {
        scope.validModel.focus = true;
      }


      unsubscribers.push(this.di.$rootScope.$on(scope.vRpcid, () => {
        if(!scope.textFieldModel.getDefaultFoundation().isValid()){
          element.find('input')[0].focus();
          element.find('input')[0].blur();
        }

        // scope.validModel.change = true;
        // let invalid = element.children().hasClass('ng-invalid');
        // scope.validModel.isInvalid = invalid && scope.validModel.change;
        //
        // if (invalid) {
        //   scope.inputStyle = {'animation': '.4s linear', 'animation-name': 'shake'};
        //   setTimeout(function () {
        //     scope.inputStyle = {};
        //     scope.$apply()
        //   }, 500)
        // }
        // scope.$apply();
      }));

      let vModelHasChanged = false;
      unsubscribers.push(scope.$watch('vModel', () => {
        if (!vModelHasChanged) { // bugfix by yazhou.miao
          vModelHasChanged = true;
          // use ngValue instead of ngModel when init value
          scope.textFieldModel.value = scope.vValue ? scope.vValue: '';
          return;
        }

        scope.textFieldModel.value = scope.vModel?scope.vModel:'';
        scope.ngChange();
      }));

      unsubscribers.push(scope.$watch('vList', (newValue, oldValue) => {
        if (newValue == oldValue)  return;
        element.find('input').attr('list', scope.vList)
      }));


      unsubscribers.push(scope.$watch('vLabel', (newValue, oldValue) => {
        scope.validModel.floatLabel = scope.vLabel ? scope.vLabel : null;
        element.find('input').attr('list', scope.vList)
      }));

      unsubscribers.push(scope.$watch('vDisabled', (newValue) => {
        if (newValue) {
          scope.disabled = true;
          scope.textFieldModel.getDefaultFoundation().setDisabled(true);
        } else {
          scope.disabled = false;
          scope.textFieldModel.getDefaultFoundation().setDisabled(false);
        }
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

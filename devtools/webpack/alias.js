'use strict';
const path = require('path');

class AliasProvider {
  static getServices() {
    return {
      'lodashService': path.resolve('src/libs/lodash/'),
      'c3Service': path.resolve('src/libs/c3/'),
      'uuid': path.resolve('src/libs/uuid/'),
      'easing': path.resolve('src/libs/easing/'),
      'apis': path.resolve('src/apis/'),
      'localStore': path.resolve('src/libs/localstore/'),
      'crypto': path.resolve('src/libs/crypto/'),
      'eventEmitter': path.resolve('src/libs/eventEmitter/')
    };
  }

  static getModules(){
    return {
      'login': path.resolve('src/modules/login/'),
      'dashboard': path.resolve('src/modules/dashboard/'),
      'fabric': path.resolve('src/modules/fabric/'),
      'logical': path.resolve('src/modules/logical/'),
      'configuration': path.resolve('src/modules/configuration/'),
      'alert': path.resolve('src/modules/alert/'),
      'log': path.resolve('src/modules/log/'),
      'manage': path.resolve('src/modules/manage/')
    };
  }

  static getComponents() {
    return {
      'mdc': path.resolve('src/components/mdc/'),
      'mdlHeader': path.resolve('src/components/mdl-header'),
      'menu': path.resolve('src/components/menu/'),
      'marHeader': path.resolve('src/components/mar-header/'),
      'contentHeader': path.resolve('src/components/content-header/'),
      'staticTable': path.resolve('src/components/static-table/'),
      'marDrawer': path.resolve('src/components/mar-drawer/'),
      'marSection': path.resolve('src/components/mar-section/'),
      'contentPanel': path.resolve('src/components/content-panel/'),
      'footer': path.resolve('src/components/footer/'),
      'wizard': path.resolve('src/components/wizard'),
      'marButton': path.resolve('src/components/mar-button'),
      'mdlTable': path.resolve('src/components/table'),
      'modal': path.resolve('src/components/modal'),     
      'topo': path.resolve('src/components/topo/'),
      'validInput': path.resolve('src/components/valid-input/'),
      'loading': path.resolve('src/components/loading/'),
      'deviceTooltip': path.resolve('src/components/device-tooltip/'),
      'linkTooltip': path.resolve('src/components/link-tooltip/'),
      'ngTable$': path.resolve('src/libs/ngtable/ng-table.min.js'),
      'datePicker': path.resolve('src/components/date-picker'),
      'jsonEditor': path.resolve('src/components/jsoneditor'),
      'gradientScale': path.resolve('src/components/gradient-scale'),
      'splineChart': path.resolve('src/components/spline-chart')
    };
  }

  static getTest(){
    return {
      'test': path.resolve('src/test/component/')
    }
  }

}

module.exports = AliasProvider;
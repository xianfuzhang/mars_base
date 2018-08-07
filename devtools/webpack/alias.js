'use strict';
const path = require('path');

class AliasProvider {
  static getServices() {
    return {
      'lodashService': path.resolve('src/libs/lodash/'),
      'easing': path.resolve('src/libs/easing/'),
      'apis': path.resolve('src/apis/'),
      'localStore': path.resolve('src/libs/localstore/'),
    };
  }

  static getModules(){
    return {
      'login': path.resolve('src/modules/login/'),
      'dashboard': path.resolve('src/modules/dashboard/'),
      'fabric': path.resolve('src/modules/fabric/'),
      'logical': path.resolve('src/modules/logical/'),
      'configuration': path.resolve('src/modules/configuration/'),
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
      'footer': path.resolve('src/components/footer/'),
      'wizard': path.resolve('src/components/wizard'),
      'mdlTable': path.resolve('src/components/table'),
      'modal': path.resolve('src/components/modal'),     
      'topo': path.resolve('src/components/topo/'),
      'loading': path.resolve('src/components/loading/'),
      'deviceTooltip': path.resolve('src/components/device-tooltip/'),
      'ngTable$': path.resolve('src/libs/ngtable/ng-table.min.js')
    };
  }

  static getTest(){
    return {
      'test': path.resolve('src/test/component/')
    }
  }

}

module.exports = AliasProvider;
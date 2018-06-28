'use strict';
const path = require('path');

class AliasProvider {
  static getServices() {
    return {
      'lodashService': path.resolve('src/libs/lodash/'),
      'easing': path.resolve('src/libs/easing/'),
    };
  }

  static getModules(){
    return {
      'login': path.resolve('src/modules/login/'),
      'dashboard': path.resolve('src/modules/dashboard/'),
      'fabric': path.resolve('src/modules/fabric/'),
      'switches': path.resolve('src/modules/fabric_switch/'),
      'logical': path.resolve('src/modules/logical/'),
      'tenants': path.resolve('src/modules/logical_tenant/'),
    };
  }

  static getComponents() {
    return {
      'mdc': path.resolve('src/components/mdc/'),
      'menu': path.resolve('src/components/menu/'),
      'marHeader': path.resolve('src/components/mar-header/'),
      'marDrawer': path.resolve('src/components/mar-drawer/'),
      'footer': path.resolve('src/components/footer/'),
      'wizard': path.resolve('src/components/wizard'),
      'topo': path.resolve('src/components/topo/'),
    };
  }

  static getTest(){
    return {
      'test': path.resolve('src/test/component/')
    }
  }

}

module.exports = AliasProvider;
'use strict';
const path = require('path');

class AliasProvider {
  static getServices() {
    return {
      'lodashService': path.resolve('src/libs/lodash/'),
      'easing': path.resolve('src/libs/easing/'),
      'apis': path.resolve('src/apis/')
    };
  }

  static getModules(){
    return {
      'login': path.resolve('src/modules/login/'),
      'dashboard': path.resolve('src/modules/dashboard/'),
      'fabric': path.resolve('src/modules/fabric/'),
      'logical': path.resolve('src/modules/logical/'),
    };
  }

  static getComponents() {
    return {
      'mdc': path.resolve('src/components/mdc/'),
      'mdlHeader': path.resolve('src/components/mdl-header'),
      'menu': path.resolve('src/components/menu/'),
      'marHeader': path.resolve('src/components/mar-header/'),
      'marDrawer': path.resolve('src/components/mar-drawer/'),
      'footer': path.resolve('src/components/footer/'),
      'wizard': path.resolve('src/components/wizard'),
      'mdlTable': path.resolve('src/components/table'),
      'modal': path.resolve('src/components/modal'),     
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
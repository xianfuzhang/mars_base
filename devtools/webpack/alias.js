'use strict';
const path = require('path');

class AliasProvider {
  static getServices() {
    return {
      'lodashService': path.resolve('src/libs/lodash/'),
    };
  }

  static getModules(){
    return {
      'login': path.resolve('src/modules/login/'),
      'nav': path.resolve('src/modules/nav'),
      'dashboard': path.resolve('src/modules/dashboard/'),
      'fabric': path.resolve('src/modules/fabric/'),
      'switches': path.resolve('src/modules/fabric_switch/'),
      'logical': path.resolve('src/modules/logical/'),
      'tenants': path.resolve('src/modules/logical_tenant/'),
    };
  }

  static getComponents() {
    return {
      'mdc': path.resolve('src/components/mdc/')
    };
  }
}

module.exports = AliasProvider;
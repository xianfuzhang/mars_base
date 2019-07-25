// import './scss/alert.scss';
// import './component/receivegroup_establish/scss/receivegroup_establish.scss';
// import './component/addHealthyCheck/scss/add_healthycheck.scss';

import {VlanAllController} from './ng/vlan_all.controller'

export default angular
  .module('topoManage', [])
  .controller('vlanAllController', VlanAllController)
  .name;
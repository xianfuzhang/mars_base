import {DynamicVlanController} from './ng/dynamic.controller';
import {VlanIpSubnetController} from './ng/ipsubnet.controller';

export default angular
  .module('vlan', [])
  .controller('DynamicVlanController', DynamicVlanController)
  .controller('vlanIpSubnetController', VlanIpSubnetController)
  .name;
import {DynamicVlanController} from './ng/dynamic.controller';
import {VlanIpEstablishController} from './component/vlan_ip_establish/ng/VlanIpEstablish.controller';
import {VlanIpSubnetController} from './ng/ipsubnet.controller';
import {ViewSelectDirective} from './component/view_select/ng/view_select.directive';

export default angular
  .module('vlan', [])
  .controller('dynamicVlanController', DynamicVlanController)
  .controller('vlanIpSubnetController', VlanIpSubnetController)
  .controller('vlanIpEstablishController', VlanIpEstablishController)
  .directive('viewSelect', ViewSelectDirective)
  .name;
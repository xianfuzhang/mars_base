import {DynamicVlanController} from './ng/dynamic.controller';
import {VlanIpSubnetController} from './ng/ipsubnet.controller';
import {ViewSelectDirective} from './component/view_select/ng/view_select.directive';

export default angular
  .module('vlan', [])
  .controller('DynamicVlanController', DynamicVlanController)
  .controller('vlanIpSubnetController', VlanIpSubnetController)
  .directive('viewSelect', ViewSelectDirective)
  .name;
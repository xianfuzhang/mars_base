import {DynamicVlanController} from './ng/dynamic.controller';
import {GuestVlanCtrl} from './ng/guest.controller';
import {VlanIpEstablishController} from './component/vlan_ip_establish/ng/VlanIpEstablish.controller';
import {VlanIpSubnetController} from './ng/ipsubnet.controller';
import {CreateGuestVlanCtrl} from './component/guestVlan/ng/createGuestVlan.controller'
import {ViewSelectDirective} from './component/view_select/ng/view_select.directive';

export default angular
  .module('vlan', [])
  .controller('dynamicVlanController', DynamicVlanController)
  .controller('guestVlanCtrl', GuestVlanCtrl)
  .controller('vlanIpSubnetController', VlanIpSubnetController)
  .controller('vlanIpEstablishController', VlanIpEstablishController)
  .controller('createGuestVlanCtrl', CreateGuestVlanCtrl)
  .directive('viewSelect', ViewSelectDirective)
  .name;
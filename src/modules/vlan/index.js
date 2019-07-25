import {DynamicVlanController} from './ng/dynamic.controller';
import {VlanController} from './ng/vlan.controller';
import {GuestVlanCtrl} from './ng/guest.controller';
import {VoiceVlanCtrl} from './ng/voiceVlan.controller';
import {VlanIpEstablishController} from './component/vlan_ip_establish/ng/VlanIpEstablish.controller';
import {VlanIpSubnetController} from './ng/ipsubnet.controller';
import {CreateGuestVlanCtrl} from './component/guestVlan/ng/createGuestVlan.controller'
import {CreateVoiceVlanDialogController} from './component/createVoiceVlan/ng/createVoiceVlanDialog.controller';
import {CreateOuiDialogController} from './component/createOui/ng/createOuiDialog.controller';
import {CreatePortDialogController} from './component/createPort/ng/createPortDialog.controller';
import {ViewSelectDirective} from './component/view_select/ng/view_select.directive';
import {EditViewSelectDirective} from './component/edit_view_select/ng/edit_view_select.directive';
import {CreateVlanDialogController} from './component/createVlan/ng/createVlanDialog.controller';

export default angular
  .module('vlan', [])
  .controller('dynamicVlanController', DynamicVlanController)
  .controller('guestVlanCtrl', GuestVlanCtrl)
  .controller('vlanController', VlanController)
  .controller('voiceVlanCtrl', VoiceVlanCtrl)
  .controller('vlanIpSubnetController', VlanIpSubnetController)
  .controller('vlanIpEstablishController', VlanIpEstablishController)
  .controller('createGuestVlanCtrl', CreateGuestVlanCtrl)
  .controller('createVoiceVlanCtrl', CreateVoiceVlanDialogController)
  .controller('createOuiCtrl', CreateOuiDialogController)
  .controller('createPortCtrl', CreatePortDialogController)
  .controller('createVlanDialogCtl', CreateVlanDialogController)
  .directive('viewSelect', ViewSelectDirective)
  .directive('editViewSelect', EditViewSelectDirective)
  .name;
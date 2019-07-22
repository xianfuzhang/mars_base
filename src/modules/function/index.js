// import './scss/alert.scss';
// import './component/receivegroup_establish/scss/receivegroup_establish.scss';
// import './component/addHealthyCheck/scss/add_healthycheck.scss';

import {PoeController} from './ng/poe.controller'
import {PoeDeviceEstablishController} from './component/poe_device_establish/ng/PoeDeviceEstablish.controller'
import {PoePortEstablishController} from './component/poe_port_establish/ng/PoePortEstablish.controller'
import {snoopCtrl} from './ng/snooping.controller';
import {SnoopService} from './service/snoop.service';
import {EstablishSnoopCtrl} from './components/device_dhcpsnoop/ng/establishSnoop.controller'

export default angular
  .module('function', [])
  .controller('poeController', PoeController)
  .controller('poeDeviceEstablishController', PoeDeviceEstablishController)
  .controller('poePortEstablishController', PoePortEstablishController)
    .controller('snoopCtrl', snoopCtrl)
  .controller('establishSnoopCtrl', EstablishSnoopCtrl)
  .service('snoopService', SnoopService)
  .name;
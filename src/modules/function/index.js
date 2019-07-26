// import './scss/alert.scss';
// import './component/receivegroup_establish/scss/receivegroup_establish.scss';
// import './component/addHealthyCheck/scss/add_healthycheck.scss';

import {PoeController} from './ng/poe.controller'
import {PoeDeviceEstablishController} from './component/poe_device_establish/ng/PoeDeviceEstablish.controller'
import {PoePortEstablishController} from './component/poe_port_establish/ng/PoePortEstablish.controller'
import {CreateSegmentCtrl} from './component/traffic_segment/ng/createSegment.controller';
import {snoopCtrl} from './ng/snooping.controller';
import {TrafficCtrl} from './ng/traffic.controller';
import {SnoopService} from './service/snoop.service';
import {EstablishSnoopCtrl} from './component/device_dhcpsnoop/ng/establishSnoop.controller'

export default angular
  .module('function', [])
  .controller('poeController', PoeController)
  .controller('poeDeviceEstablishController', PoeDeviceEstablishController)
  .controller('poePortEstablishController', PoePortEstablishController)
  .controller('createSegmentCtrl', CreateSegmentCtrl)
  .controller('snoopCtrl', snoopCtrl)
  .controller('trafficCtrl', TrafficCtrl)
  .controller('establishSnoopCtrl', EstablishSnoopCtrl)
  .service('snoopService', SnoopService)
  .name;
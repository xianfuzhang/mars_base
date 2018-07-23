import './scss/device.scss'
import {InterfaceGroupController} from './ng/interfaceGroup.controller';
import {DeviceController} from './ng/device.controller';
import {DeviceDetailController} from './ng/deviceDetail.controller';
import {StatisticController} from './ng/statistic.controller';
import {StormControlController} from './ng/stormControl.controller';
import {DeviceService} from './service/device.service';
import {DeviceDetailService} from './service/deviceDetail.service';
import {FabricSummaryController} from './ng/summary.controller';
import {StormService} from './service/storm.service';

export default angular
  .module('fabric', [])
  .controller('deviceController', DeviceController)
  .controller('deviceDetailController', DeviceDetailController)
  .controller('interfaceGroupController', InterfaceGroupController)
  .controller('statisticController', StatisticController)
  .controller('stormControlController', StormControlController)
  .controller('fabricSummaryController', FabricSummaryController)
  .service('deviceService', DeviceService)
  .service('deviceDetailService', DeviceDetailService)
  .service('stormService', StormService)
  .name;
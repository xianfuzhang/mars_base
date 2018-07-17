import './scss/device.scss'
import {InterfaceGroupController} from './ng/interfaceGroup.controller';
import {DeviceController} from './ng/device.controller';
import {StatisticController} from './ng/statistic.controller';
import {StormControlController} from './ng/stormControl.controller';
import {DeviceService} from './service/device.service';
import {FabricSummaryController} from './ng/summary.controller';

export default angular
  .module('fabric', [])
  .controller('deviceController', DeviceController)
  .controller('interfaceGroupController', InterfaceGroupController)
  .controller('statisticController', StatisticController)
  .controller('stormControlController', StormControlController)
  .controller('fabricSummaryController', FabricSummaryController)
  .service('deviceService', DeviceService)
  .name;
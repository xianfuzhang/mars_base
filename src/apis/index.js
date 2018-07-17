import {DeviceDataManager} from './datamanagers/device.dataManager';
import {appService} from './services/app.service';
import {switchService} from './services/switch.service';

export default angular
  .module('apis', [])
  .service('appService', appService)
  .service('switchService', switchService)
  .service('deviceDataManager', DeviceDataManager)
  .name;
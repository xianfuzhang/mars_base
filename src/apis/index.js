import {DeviceDataManager} from './datamanagers/device.dataManager';
import {appService} from './services/app.service';

export default angular
  .module('apis', [])
  .service('appService', appService)
  .service('deviceDataManager', DeviceDataManager)
  .name;
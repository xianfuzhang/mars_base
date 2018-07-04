import {switchDataManager} from './datamanagers/switch.dataManager';
import {appService} from './services/app.service';

export default angular
  .module('apis', [])
  .service('appService', appService)
  .service('switchDataManager', switchDataManager)
  .name;
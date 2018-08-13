import {DeviceDataManager} from './datamanagers/device.dataManager';
import {StormDataManager} from './datamanagers/storm.dataManager';
import {LoginDataManager} from './datamanagers/login.dataManager';
import {AccountDataManager} from './datamanagers/account.dataManager';
import {ConfigurationDataManager} from './datamanagers/configuration.dataManager';
import {appService} from './services/app.service';
import {switchService} from './services/switch.service';
import {notificationService} from './services/notification.service';
import {LogService} from './services/log.service';
import {LogDataManager} from './datamanagers/log.dataManager'

export default angular
  .module('apis', [])
  .service('appService', appService)
  .service('switchService', switchService)
  .service('notificationService', notificationService)
  .service('deviceDataManager', DeviceDataManager)
  .service('stormDataManager', StormDataManager)
  .service('loginDataManager', LoginDataManager)
  .service('accountDataManager', AccountDataManager)
  .service('configurationDataManager', ConfigurationDataManager)
  .service('logService', LogService)
  .service('logDataManager', LogDataManager)
  .name;
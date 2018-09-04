import {DeviceDataManager} from './datamanagers/device.dataManager';
import {StormDataManager} from './datamanagers/storm.dataManager';
import {LoginDataManager} from './datamanagers/login.dataManager';
import {AccountDataManager} from './datamanagers/account.dataManager';
import {ConfigurationDataManager} from './datamanagers/configuration.dataManager';
import {AlertDataManager} from './datamanagers/alert.dataManager';
import {appService} from './services/app.service';
import {switchService} from './services/switch.service';
import {alertService} from './services/alert.service';
import {notificationService} from './services/notification.service';
import {LogService} from './services/log.service';
import {DialogService} from './services/dialog.service';
import {LogDataManager} from './datamanagers/log.dataManager';
import {DashboardDataManager} from './datamanagers/dashboard.dataManager';

export default angular
  .module('apis', [])
  .service('appService', appService)
  .service('switchService', switchService)
  .service('alertService', alertService)
  .service('notificationService', notificationService)
  .service('dialogService', DialogService)
  .service('deviceDataManager', DeviceDataManager)
  .service('stormDataManager', StormDataManager)
  .service('loginDataManager', LoginDataManager)
  .service('accountDataManager', AccountDataManager)
  .service('configurationDataManager', ConfigurationDataManager)
  .service('dashboardDataManager', DashboardDataManager)
  .service('alertDataManager', AlertDataManager)
  .service('logService', LogService)
  .service('logDataManager', LogDataManager)
  .name;
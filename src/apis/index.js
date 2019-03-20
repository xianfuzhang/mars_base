import {DeviceDataManager} from './datamanagers/device.dataManager';
import {StormDataManager} from './datamanagers/storm.dataManager';
import {LoginDataManager} from './datamanagers/login.dataManager';
import {AccountDataManager} from './datamanagers/account.dataManager';
import {ConfigurationDataManager} from './datamanagers/configuration.dataManager';
import {AlertDataManager} from './datamanagers/alert.dataManager';
import {appService} from './services/app.service';
import {commonService} from './services/common.service';
import {switchService} from './services/switch.service';
import {alertService} from './services/alert.service';
import {notificationService} from './services/notification.service';
import {LogService} from './services/log.service';
import {DialogService} from './services/dialog.service';
import {FlowService} from './services/flow.service';
import {DateService} from './services/date.service';
import {manageService} from './services/manage.service';
import {logicalService} from './services/logical.service';
import {RoleService} from './services/role.service';
import {ColorService} from './services/color.service';
import {LogDataManager} from './datamanagers/log.dataManager';
import {DashboardDataManager} from './datamanagers/dashboard.dataManager';
import {IntentDataManager} from './datamanagers/intent.dataManager';
import {ManageDataManager} from './datamanagers/manage.dataManager';
import {LogicalDataManager} from './datamanagers/logical.dataManager';
import {WebsocketService} from './services/ws.service';
import {applicationService} from './services/application.service';
import {flowCacheService} from './services/flowCache.service';
import {MessageWebsocketService} from './services/message.service';
import {regexService} from './services/regex.service';

export default angular
  .module('apis', [])
  .service('appService', appService)
  .service('commonService', commonService)
  .service('switchService', switchService)
  .service('alertService', alertService)
  .service('notificationService', notificationService)
  .service('dialogService', DialogService)
  .service('flowService', FlowService)
  .service('deviceDataManager', DeviceDataManager)
  .service('stormDataManager', StormDataManager)
  .service('loginDataManager', LoginDataManager)
  .service('accountDataManager', AccountDataManager)
  .service('configurationDataManager', ConfigurationDataManager)
  .service('dashboardDataManager', DashboardDataManager)
  .service('alertDataManager', AlertDataManager)
  .service('logService', LogService)
  .service('logDataManager', LogDataManager)
  .service('dateService', DateService)
  .service('manageService', manageService)
  .service('logicalService', logicalService)
  .service('roleService', RoleService)
  .service('colorService', ColorService)
  .service('wsService', WebsocketService)
  .service('applicationService', applicationService)
  .service('flowCacheService', flowCacheService)
  .service('intentDataManager', IntentDataManager)
  .service('manageDataManager', ManageDataManager)
  .service('logicalDataManager', LogicalDataManager)
	.service('messageService', MessageWebsocketService)
  .service('regexService', regexService)
  .name;
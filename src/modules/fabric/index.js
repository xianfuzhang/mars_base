// import './scss/device.scss'
// import './components/flow_establish/scss/flow_establish';
// import './components/group_establish/scss/group_establish';

import {InterfaceGroupController} from './ng/interfaceGroup.controller';
import {DeviceController} from './ng/device.controller';
import {DeviceDetailController} from './ng/deviceDetail.controller';
import {EndPointController} from './ng/endpoints.controller';
import {StormControlController} from './ng/stormControl.controller';
import {DeviceService} from './service/device.service';
import {DeviceDetailService} from './service/deviceDetail.service';
import {FabricSummaryController} from './ng/summary.controller';
import {StormService} from './service/storm.service';
import {IntentService} from './service/intent.service';
import { DeviceWizardController } from './components/deviceWizard/ng/DeviceWizard.controller'
import { FlowEstablishController } from './components/flow_establish/ng/FlowEstablish.controller';
import {CreateIntentController} from './components/createIntent/ng/createIntent.controller';
import { GroupEstablishController } from './components/group_establish/ng/GroupEstablish.controller';
import {ShowSwitchFlowsController} from './ng/showSwitchFlows.controller';
import {ShowSwitchGroupsController} from './ng/showSwitchGroups.controller';
import {ShowLinksSelectController} from './ng/showLinksSelect.controller';
import {IntentsController} from './ng/intents.controller';
import {ShowFlowDetailController} from './ng/showFlowDetail.controller';
import {ShowSwitchPFCsController} from './ng/showSwitchPFCs.controller';
import {CreateEndpointController} from './components/createEndpoint/ng/createEndpoint.controller';
import {PfcEstablishController} from './components/pfc_establish/ng/pfcEstablish.controller';
import {UpLinkEstablishController} from './components/uplink_establish/ng/upLinkEstablish.controller';
import {TrunkController} from  './components/trunk_establish/ng/trunk.controller';
import {UpLinkController} from './ng/uplink.controller';
import {StormController} from './ng/storm.controller';
import {StormEstablishController} from './components/storm_establish/ng/stormEstablish.controller';
import {MonitorController} from './ng/monitor.controller';
import {MonitorEstablishController} from './components/monitor_establish/ng/monitorEstablish.controller';

export default angular
  .module('fabric', [])
  .controller('deviceController', DeviceController)
  .controller('deviceDetailController', DeviceDetailController)
  .controller('interfaceGroupController', InterfaceGroupController)
  .controller('endPointController', EndPointController)
  .controller('stormControlController', StormControlController)
  .controller('fabricSummaryController', FabricSummaryController)
  .controller('deviceWizardController', DeviceWizardController)
  .controller('flowEstablishController', FlowEstablishController)
  .controller('groupEstablishController', GroupEstablishController)
  .controller('showSwitchFlowsController', ShowSwitchFlowsController)
  .controller('createIntentCtrl', CreateIntentController)
  .controller('showSwitchGroupsController', ShowSwitchGroupsController)
  .controller('showSwitchPFCsController', ShowSwitchPFCsController)
  .controller('showLinksSelectController', ShowLinksSelectController)
  .controller('intentsController', IntentsController)
  .controller('createEndpointCtrl', CreateEndpointController)
  .controller('showFlowDetailCtrl', ShowFlowDetailController)
  .controller('pfcEstablishController', PfcEstablishController)
  .controller('upLinkController', UpLinkController)
  .controller('upLinkEstablishController', UpLinkEstablishController)
  .controller('stormController', StormController)
  .controller('stormEstablishController', StormEstablishController)
  .controller('monitorController', MonitorController)
  .controller('monitorEstablishController', MonitorEstablishController)
  .controller('trunkCtrl', TrunkController)
  .service('deviceService', DeviceService)
  .service('deviceDetailService', DeviceDetailService)
  .service('stormService', StormService)
  .service('intentService', IntentService)
  .name;

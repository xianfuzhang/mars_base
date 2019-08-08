// import './scss/alert.scss';
// import './component/receivegroup_establish/scss/receivegroup_establish.scss';
// import './component/addHealthyCheck/scss/add_healthycheck.scss';

import {AlertController} from './ng/alert.controller';
import {HealthyCheckController} from './ng/healthycheck.controller';
import {InformController} from './ng/inform.controller';
import {ReceiveGroupEstablishController} from './component/receivegroup_establish/ng/ReceiveGroupEstablish.controller'
import {AddHealthyCheckController} from './component/addHealthyCheck/ng/addHealthyCheck.controller'

export default angular
  .module('alert', [])
  .controller('AlertController', AlertController)
  .controller('InformController', InformController)
  .controller('HealthyCheckController', HealthyCheckController)
  .controller('ReceiveGroupEstablishController', ReceiveGroupEstablishController)
  .controller('AddHealthyCheckController', AddHealthyCheckController)
  .name;
import './scss/switch.scss'
import {SwitchController} from './ng/switch.controller';
import {switchService} from './ng/switch.service';
export default angular
  .module('switches', ['marHeader', 'marDrawer'])
  .controller('SwitchController', SwitchController)
  .service('switchService', switchService)
  .name;
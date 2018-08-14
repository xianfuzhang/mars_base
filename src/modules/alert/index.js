import './scss/alert.scss'
import {AlertController} from './ng/alert.controller';
import {HealthyCheckController} from './ng/healthycheck.controller';

export default angular
  .module('alert', [])
  .controller('AlertController', AlertController)
  .controller('HealthyCheckController', HealthyCheckController)
  .name;
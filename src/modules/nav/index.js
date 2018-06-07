import './scss/nav.scss';
import {NavController} from './ng/nav.controller';
import {Nav} from './ng/nav.directive';
import {navService} from './ng/nav.service';

export default angular
  .module('nav', [])
  .controller('NavController', NavController)
  .directive('nav', Nav)
  .service('navService', navService)

  .name;
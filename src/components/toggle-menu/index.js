/**
 * Created by wls on 2018/6/7.
 */
// import './scss/menu';

import { toggleMenu } from './ng/toggleMenu.directive';

export default angular
  .module('toggleMenu', [])
  .directive('toggleMenu', toggleMenu)
  .name;

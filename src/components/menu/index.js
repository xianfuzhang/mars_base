/**
 * Created by wls on 2018/6/7.
 */
import './scss/menu';

import { Menu } from './ng/menu.directive';

export default angular
  .module('menu', [])
  .directive('menu', Menu)
  .name;

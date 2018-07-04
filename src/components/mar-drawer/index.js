/**
 * Created by wls on 2018/6/19.
 */

import './scss/mar_drawer';

import { marDrawer } from './ng/marDrawer.directive';

export default angular
  .module('marDrawer', [])
  .directive('marDrawer', marDrawer)
  .name;

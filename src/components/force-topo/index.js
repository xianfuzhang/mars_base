/**
 * Created by wls on 2018/6/7.
 */
// import './scss/topo';

import { ForceTopo } from './ng/forceTopo.directive';

export default angular
  .module('forceTopo', ['easing'])
  .directive('forceTopo', ForceTopo)
  .name;

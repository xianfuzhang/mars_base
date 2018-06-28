/**
 * Created by wls on 2018/6/7.
 */
import './scss/topo';

import { Topo } from './ng/topo.directive';

export default angular
  .module('topo', ['easing'])
  .directive('topo', Topo)
  .name;

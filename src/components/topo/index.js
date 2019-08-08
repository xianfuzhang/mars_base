/**
 * Created by wls on 2018/6/7.
 */
// import './scss/topo';

import { Topo } from './ng/topo.directive';
import {DonutTopo} from './ng/donut-topo.directive';

export default angular
  .module('topo', ['easing'])
  .directive('topo', Topo)
  .directive('donutTopo', DonutTopo)
  .name;

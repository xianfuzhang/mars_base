/**
 * Created by wls on 2018/6/7.
 */
// import './scss/topo';

import { VlanTopo } from './ng/vlanTopo.directive';

export default angular
  .module('vlanTopo', ['easing'])
  .directive('vlanTopo', VlanTopo)
  .name;

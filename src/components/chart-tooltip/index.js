/**
 * Created by wls on 2018/6/7.
 */
// import './scss/deviceTooltip';

import { chartTooltip } from './ng/chartTooltip';

export default angular
  .module('chartTooltip', [])
  .directive('chartTooltip', chartTooltip)
  .name;

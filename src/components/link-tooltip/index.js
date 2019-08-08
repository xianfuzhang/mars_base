/**
 * Created by wls on 2018/6/7.
 */
// import './scss/deviceTooltip';

import { linkTooltip } from './ng/linkTooltip';

export default angular
  .module('linkTooltip', [])
  .directive('linkTooltip', linkTooltip)
  .name;

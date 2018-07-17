/**
 * Created by wls on 2018/6/7.
 */
import './scss/deviceTooltip';

import { deviceTooltip } from './ng/deviceTooltip';

export default angular
  .module('deviceTooltip', [])
  .directive('deviceTooltip', deviceTooltip)
  .name;

/**
 * Created by wls on 2018/6/7.
 */
import './scss/wizard';

import { Wizard } from './ng/wizard.directive';
import { initBind } from './ng/initBind.directive';

export default angular
  .module('wizard', [])
  .directive('wizard', Wizard)
  .directive('initBind', initBind)
  .name;

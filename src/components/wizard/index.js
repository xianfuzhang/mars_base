/**
 * Created by wls on 2018/6/7.
 */
import './scss/wizard';

import { Wizard } from './ng/wizard.directive';
import { initBind } from './ng/initBind.directive';
import { SwitchWizardController } from './ng/SwitchWizard.controller';

export default angular
  .module('wizard', [])
  .controller('switchWizardController', SwitchWizardController)
  .directive('wizard', Wizard)
  .directive('initBind', initBind)
  .name;

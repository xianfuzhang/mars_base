import {mdlButton} from './ng/button.directive';
import {mdlCheckbox} from './ng/checkbox.directive';
import {mdlSwitch} from './ng/switch.directive';
import {mdlRadio} from './ng/radio.directive';

export default angular
  .module('mdc', [])
  .directive('mdlCheckbox', mdlCheckbox)
  .directive('mdlButton', mdlButton)
  .directive('mdlSwitch', mdlSwitch)
  .directive('mdlRadio', mdlRadio)
  .name;
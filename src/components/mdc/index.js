import './scss/mdc.scss';

import {mdlButton} from './ng/button.directive';
import {mdlCheckbox} from './ng/checkbox.directive';
import {mdlSwitch} from './ng/switch.directive';
import {mdlRadio} from './ng/radio.directive';
import {mdlText} from './ng/text.directive';
import {mdlSelect} from './ng/select.directive';
import {mdlTextarea} from './ng/textarea.directive';
import {dialogCtrl} from './ng/dialog.controller';
import {TabsController} from './ng/tabs.controller';
import {mdlTabs} from './ng/tabs.directive';
import {tabItem} from './ng/tabItem.directive';


export default angular
  .module('mdc', [])
  .directive('mdlCheckbox', mdlCheckbox)
  .directive('mdlButton', mdlButton)
  .directive('mdlSwitch', mdlSwitch)
  .directive('mdlRadio', mdlRadio)
  .directive('mdlText', mdlText)
  .directive('mdlSelect', mdlSelect)
  .directive('mdlTextarea', mdlTextarea)
  .controller('dialogCtrl', dialogCtrl)
  .controller('TabsController', TabsController)
  .directive('mdlTabs', mdlTabs)
  .directive('tabItem', tabItem)
  .name;
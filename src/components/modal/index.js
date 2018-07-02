import './scss/modal';

import { modalBackdrop } from './ng/modalBackdrop.directive';
import { modalCenter } from './ng/modalCenter.directive';
import { modalStackedMap } from './ng/modalStackedMap.factory';
import { modalStack } from './ng/modalStack.factory';
import { modalWindow } from './ng/modalWindow.directive';

import { modalTransition } from './ng/modalTransition.factory';

import { modalManager } from './ng/modalManager.provider';

export default angular
  .module('modal', [])
  .directive('modalBackdrop', modalBackdrop)
  .directive('modalCenter', modalCenter)
  .factory('modalStackedMap', modalStackedMap)
  .factory('modalStack', modalStack)
  .directive('modalWindow', modalWindow)
  .factory('modalTransition', modalTransition)
  .provider('modalManager', modalManager)
  .name;

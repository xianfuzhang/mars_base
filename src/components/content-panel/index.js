/**
 * Created by wls on 2018/6/7.
 */
import './scss/content_panel';

import { contentPanel } from './ng/contentPanel.directive';

export default angular
  .module('contentPanel', [])
  .directive('contentPanel', contentPanel)
  .name;

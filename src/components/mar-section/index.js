/**
 * Created by wls on 2018/6/7.
 */
import './scss/mar_section';

import { marSection } from './ng/marSection.directive';

export default angular
  .module('marSection', [])
  .directive('marSection', marSection)
  .name;

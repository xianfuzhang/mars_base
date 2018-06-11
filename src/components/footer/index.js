/**
 * Created by wls on 2018/6/7.
 */
import './scss/footer';

import { Footer } from './ng/footer.directive';

export default angular
  .module('footer', [])
  .directive('footer', Footer)
  .name;

/**
 * Created by wls on 2018/6/7.
 */
// import './scss/mar_header';

import { marHeader } from './ng/marHeader.directive';

export default angular
  .module('marHeader', [])
  .directive('marHeader', marHeader)
  .name;

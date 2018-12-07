/**
 * Created by wls on 2018/6/7.
 */
// import './scss/content_header';

import { contentHeader } from './ng/contentHeader.directive';

export default angular
  .module('contentHeader', [])
  .directive('contentHeader', contentHeader)
  .name;

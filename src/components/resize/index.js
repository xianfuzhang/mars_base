import {resize} from './ng/resize.directive';
import {autoWidth} from './ng/autoWidth.directive';

export default angular
  .module('resize', [])
  .directive('resize', resize)
  .directive('autoWidth', autoWidth)
  .name;

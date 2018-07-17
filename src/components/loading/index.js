/**
 * Created by wls on 2018/6/7.
 */
import './scss/loading';

import { Loading } from './ng/loading.directive';

export default angular
  .module('loading', [])
  .directive('loading', Loading)
  .name;

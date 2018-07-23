/**
 * Created by wls on 2018/6/7.
 */
import './scss/static_table.scss';
import './scss/ng-table.min';

import { staticTable } from './ng/staticTable.directive';

export default angular
  .module('staticTable', [])
  .directive('staticTable', staticTable)
  .name;

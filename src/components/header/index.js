/**
 * Created by wls on 2018/6/7.
 */
import './scss/header';

import { Header } from './ng/header.directive';

export default angular
  .module('header', [])
  .directive('header', Header)
  .name;

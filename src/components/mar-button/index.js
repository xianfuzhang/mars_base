/**
 * Created by wls on 2018/6/7.
 */
// import './scss/mar-button.scss';

import { MarButton } from './ng/marButton.directive';

export default angular
  .module('marButton', [])
  .directive('marButton', MarButton)
  .name;

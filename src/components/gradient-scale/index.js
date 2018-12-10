// import './scss/gradientScale.scss';
import {gradientScale} from './ng/gradientScale.directive';
export default angular
  .module('gradientScale', [])
  .directive('gradientScale', gradientScale)
  .name;

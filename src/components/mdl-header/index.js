// import './scss/header.scss';
import {mdlHeader} from './ng/header.directive';
import {headerController} from './ng/header.controller';

export default angular
  .module('mdlHeader', [])
  .controller('headerCtrl', headerController)
  .directive('mdlHeader', mdlHeader)
  .name;

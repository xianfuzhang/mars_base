
// import './scss/valid_input.scss';

import { validInput } from './ng/validInput.directive';

export default angular
  .module('validInput', [])
  .directive('validInput', validInput)
  .name;

import { Language } from './ng/language.directive';

export default angular
  .module('languageSelection', [])
  .directive('languageSelection', Language)
  .name;
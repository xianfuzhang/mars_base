import {JsonEditor} from './ng/jsoneditor.directive';

export default angular
  .module('jsonEditor', [])
  .directive('jsoneditor', JsonEditor)
  .name
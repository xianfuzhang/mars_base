import './scss/test.scss'
import {TestController} from './ng/test.controller'

export default angular
  .module('test', [])
  .controller('TestController', TestController)
  .name;
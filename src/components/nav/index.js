import './scss/nav.scss'
import {Nav} from './directive/nav.directive'

export default angular
  .module('nav', [])
  .directive('nav', Nav)
  .name;
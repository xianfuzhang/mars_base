import './scss/configuration.scss'
import {ConfigurationController} from './ng/configuration.controller'

export default angular
  .module('configuration', [])
  .controller('ConfigurationController', ConfigurationController)
  .name;
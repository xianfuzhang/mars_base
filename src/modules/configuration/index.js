import './scss/configuration.scss'

import {ConfigurationController} from './ng/configuration.controller'
import {ConfigurationListController} from './ng/configurationList.controller'

export default angular
  .module('configuration', [])
  .controller('ConfigurationController', ConfigurationController)
  .controller('ConfigurationListController', ConfigurationListController)
  .name;
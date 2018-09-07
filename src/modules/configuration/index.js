import './scss/configuration.scss'

import {ConfigurationController} from './ng/configuration.controller'
import {ConfigurationListController} from './ng/configurationList.controller'
import {ConfigurationHistoryController} from './ng/configurationHistory.controller'

export default angular
  .module('configuration', [])
  .controller('ConfigurationController', ConfigurationController)
  .controller('ConfigurationListController', ConfigurationListController)
  .controller('ConfigurationHistoryController', ConfigurationHistoryController)
  .name;
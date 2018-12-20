// import './scss/configuration.scss'

import {ConfigurationListController} from './ng/configurationList.controller'
import {ConfigurationHistoryController} from './ng/configurationHistory.controller'

export default angular
  .module('configuration', [])
  .controller('ConfigurationListController', ConfigurationListController)
  .controller('ConfigurationHistoryController', ConfigurationHistoryController)
  .name;
import 'c3/c3.css';
import './scss/dashboard.scss';

import {DashboardController} from './ng/dashboard.controller';
import {DateRangeConfigurationController} from './ng/dateRangeconfiguration.controller';

export default angular
  .module('dashboard', [])
  .controller('DashboardController', DashboardController)
  .controller('dateRangeConfigurationCtrl', DateRangeConfigurationController)
  .name;
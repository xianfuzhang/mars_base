import 'c3/c3.css';
// import './scss/dashboard.scss';

import {DashboardController} from './ng/dashboard.controller';
import {DateRangeConfigurationController} from './ng/dateRangeConfiguration.controller';
import {ShowChartSettingController} from './ng/showChartSetting.controller';
export default angular
  .module('dashboard', [])
  .controller('DashboardController', DashboardController)
  .controller('dateRangeConfigurationCtrl', DateRangeConfigurationController)
  .controller('showChartSettingCtrl', ShowChartSettingController)
  .name;
import './scss/dashboard.scss'
import {DashboardController} from './ng/dashboard.controller'

export default angular
  .module('dashboard', [])
  .controller('DashboardController', DashboardController)
  .name;
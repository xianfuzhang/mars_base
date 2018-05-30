import './scss/dashboard.scss'
import {DashboardController} from './controller/dashboard.controller'

export default angular
  .module('dashboard', [])
  .controller('DashboardController', DashboardController)
  .name;
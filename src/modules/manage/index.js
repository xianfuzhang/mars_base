import './scss/manage.scss';

import {DHCPController} from './ng/dhcp.controller'

export default angular
  .module('manage', [])
  .controller('dhcpController', DHCPController)
  .name;
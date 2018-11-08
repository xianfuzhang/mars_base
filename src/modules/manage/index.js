import './scss/manage.scss';

import {DHCPController} from './ng/dhcp.controller'
import {ElasticsearchController} from './ng/elasticsearch.controller'

export default angular
  .module('manage', [])
  .controller('dhcpController', DHCPController)
  .controller('elasticsearchController', ElasticsearchController)
  .name;
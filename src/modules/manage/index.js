import './scss/manage.scss';

import {DHCPController} from './ng/dhcp.controller'
import {ElasticsearchController} from './ng/elasticsearch.controller'
import {SelectDateDialogController} from './ng/selectDateDialogController'
import {InputFilenameDialogController} from './ng/inputFilenameDialogController'

export default angular
  .module('manage', [])
  .controller('dhcpController', DHCPController)
  .controller('elasticsearchController', ElasticsearchController)
  .controller('selectDateDialogController', SelectDateDialogController)
  .controller('inputFilenameDialogController', InputFilenameDialogController)
  .name;
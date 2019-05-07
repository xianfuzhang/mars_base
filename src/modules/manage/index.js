// import './scss/manage.scss';

import {DHCPController} from './ng/dhcp.controller';
import {NTPController} from './ng/ntp.controller';
import {ElasticsearchController} from './ng/elasticsearch.controller';
import {ShowChartSettingController} from './ng/showChartSetting.controller';
import {SelectDateDialogController} from './ng/selectDateDialogController';
import {InputFilenameDialogController} from './ng/inputFilenameDialogController';
import {GenerateCSVFileDialogController} from './ng/generateCSVFileDialogController'
import {IpmacEstablishController} from './component/ipmac_establish/ng/IpmacEstablish.controller';
import {NtpEstablishController} from './component/ntp_establish/ng/NtpEstablish.controller'
import {ApplicationEstablishController} from './component/application_establish/ng/ApplicationEstablish.controller';
import {SystemInfoController} from './ng/systemInfo.controller';
import {ApplicationController} from './ng/application.controller';
import {LicenseController} from './ng/license.controller';

export default angular
  .module('manage', [])
  .controller('dhcpController', DHCPController)
  .controller('ntpController', NTPController)
  .controller('elasticsearchController', ElasticsearchController)
  .controller('showChartSettingCtrl', ShowChartSettingController)
  .controller('selectDateDialogController', SelectDateDialogController)
  .controller('inputFilenameDialogController', InputFilenameDialogController)
  .controller('generateCSVFileDialogController', GenerateCSVFileDialogController)
  .controller('ipmacEstablishController', IpmacEstablishController)
  .controller('ntpEstablishController', NtpEstablishController)
  .controller('systemInfoController', SystemInfoController)
  .controller('applicationController', ApplicationController)
  .controller('applicationEstablishController', ApplicationEstablishController)
	.controller('licenseController', LicenseController)
  .name;
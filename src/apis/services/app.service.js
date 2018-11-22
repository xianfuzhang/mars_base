export class appService {
  static getDI() {
    return [
      '$location',
      '$filter'
    ];
  }

  constructor(...args) {
    this.di = {};
    appService.getDI().forEach((value, index) => {
      this.di[value] = args[index];
    });
    this.translate = this.di.$filter('translate');
    this.isMocked = false;
    this.versionUrl = 'mars/v1';
    this.CONST = {
      MOCKED_ZONE_ENDPOINT: '[%__PROTOCOL__%]://[%__ZONE_IP__%]/' + this.versionUrl,
      LIVE_ZONE_ENDPOINT: '[%__PROTOCOL__%]://[%__ZONE_IP__%]/' + this.versionUrl,
      MOCKED_WEBSOCKETS_ENDPONT: 'ws://localhost:3001/',
      // LIVE_WEBSOCKETS_ENDPONT: 'ws://[%__ZONE_IP__%]:3233/',
      LIVE_WEBSOCKETS_ENDPONT: 'ws://210.63.204.29:3233/',

      MOCKED_USERNAME: 'nocsys',
      MOCKED_PASSWORD: 'nocsys',
      GUEST_GROUP: 'guestgroup',
      ADMIN_GROUP: 'managergroup',
      SUPER_GROUP: 'admingroup',
      //权限管理 {supergroup: 3, admingroup: 2, guestgroup: 1}
      HEADER: {
        'menu': [
          {
            'group': 'Fabric',
            'label': this.translate('MODULE.HEADER.FABRIC'),
            'role': 1,
            'items': [
              {'label': this.translate('MODULE.HEADER.FABRIC.SUMMARY'), 'url': '/fabric_summary', 'role': 1},
              {'label': this.translate('MODULE.HEADER.FABRIC.DEVICE'), 'url': '/devices', 'role': 2},
              {'label': this.translate('MODULE.HEADER.FABRIC.ENDPOINTS'), 'url': '/endpoints', 'role': 2},
              {'label': 'Intents', 'url': '/intents', 'role': 2},
              //  {'label': 'Storm Profile', 'url': '/storm_control'},
            ]
          },
          {
            'group':'Logical',
            'label': this.translate('MODULE.HEADER.LOGICAL'),
            'role': 2,
            'items':[
              {'label': 'Tenant', 'url': '/tenant', 'role': 2},
              {'label': 'Segment', 'url': '/segment', 'role': 2},
             ]
           },
          {
            'group': 'Alert',
            'label': this.translate('MODULE.HEADER.ALERT'),
            'role': 2,
            'items': [
              // {'label': 'Alert', 'url': '/alert'},
              {'label': this.translate('MODULE.HEADER.ALERT.ALERT'), 'url': '/alert', 'role': 2},
              {'label': this.translate('MODULE.HEADER.ALERT.HEALTHYCHECK'), 'url': '/healthycheck', 'role': 2},
              {'label': this.translate('MODULE.HEADER.ALERT.INFORM'), 'url': '/inform', 'role': 2},
            ]
          },
          {
            'group': 'Config',
            'label': this.translate('MODULE.HEADER.CONFIG'),
            'role': 3,
            'items': [
              {'label': this.translate('MODULE.HEADER.CONFIG.CONFIGURATION'), 'url': '/configuration_list', 'role': 3},
              {'label': this.translate('MODULE.HEADER.CONFIG.CONFIGURATION_HISTORY'), 'url': '/configuration_history', 'role': 3}
            ]
          },
          {
            'group': 'Log',
            'role': 2,
            'label': this.translate('MODULE.HEADER.LOG'),
            'items': [
              {'label': this.translate('MODULE.LOG.PAGE.TITLE'), 'url': '/log', 'role': 2}
            ]
          },
          {
            'group': 'Account',
            'role': 3,
            'label': this.translate('MODULE.HEADER.ACCOUNT'),
            'items': [
              {'label': this.translate('MODULE.HEADER.ACCOUNT.ACCOUNT_MANAGER'), 'url': '/account_manage', 'role': 3}
            ]
          }, {
            'group': 'Manage',
            'role': 3,
            'label': this.translate('MODULE.HEADER.MANAGE'),
            'items': [
              {'label': this.translate('MODULE.HEADER.MANAGE.DHCP'), 'url': '/dhcp', 'role': 3},
              {'label': this.translate('MODULE.HEADER.MANAGE.ELASTICSEARCH'), 'url': '/elasticsearch', 'role': 3}
            ]
          }

        ],
        'user': {
          //username暂时是用来显示的，后期是通过接口返回。或者是通过session
          //'UserName':'Nocsys',
          'items': [
            //{'label': this.translate('MODULE.LOGIN.USERACCOUNT.MANAGER'), 'url': '/account_manage'},
            {'label': this.translate('MODULE.HEADER.ACCOUNT.LOGOUT'), 'url': '/logout'}
          ]
        }
      },
      CRYPTO_STRING: 'secret',
      DEFAULT_FILENAME: 'startup_netcfg.cfg' // default configuration file name
    };
    this.loginRole = 1;
    this.roleFilterMenu = [];
  }

  setLoginRole(num) {
    this.loginRole = num;
  }

  filterMenuByLoginRole() {
    let menu = [];
    this.CONST.HEADER.menu.forEach((group) => {
      if (this.loginRole >= group.role) {
        let tmp = {
          'group': group.group,
          'label': group.label,
          'role': group.role,
          'items': []
        };
        group.items.forEach((item) => {
          if (this.loginRole >= item.role) {
            tmp.items.push(item);  
          }
        });
        menu.push(tmp);
      }
    });
    this.roleFilterMenu = menu;
  }

  getZoneEndpoint(isComponent) {
    let endpoint;
    if (this.isMocked) {
      endpoint = this.CONST.MOCKED_ZONE_ENDPOINT.replace('[%__ZONE_IP__%]',
        (this.di.$location.host()  + ":"+  this.di.$location.port()));
      endpoint = endpoint.replace('[%__PROTOCOL__%]', this.di.$location.protocol());
    }
    else {
      endpoint = this.CONST.LIVE_ZONE_ENDPOINT.replace('[%__ZONE_IP__%]',
        (this.di.$location.host() + ":" + this.di.$location.port()));
      endpoint = endpoint.replace('[%__PROTOCOL__%]', this.di.$location.protocol());
    }

    if (isComponent) {
      endpoint = endpoint.substr(0, endpoint.length - '/v1'.length);
    }

    return endpoint;
  }
  
  getWebscoketEndpoint() {
    let endpoint;
    if (this.isMocked) {
      endpoint = this.CONST.MOCKED_WEBSOCKETS_ENDPONT;
    } else {
      endpoint = this.CONST.LIVE_WEBSOCKETS_ENDPONT.replace('[%__ZONE_IP__%]', (this.di.$location.host()));
    }
    return endpoint;
  }
  
  getLoginUrl() {
    return this.getZoneEndpoint(true) + '/j_security_check';
  }

  getLogoutUrl() {
    return this.getZoneEndpoint() + '/logout';
  }

  getUserAccountsUrl() {
    return this.getZoneEndpoint(true) + '/useraccount/v1';
  }

  getUserAccountUrl(username) {
    return this.getZoneEndpoint(true) + '/useraccount/v1/' + username;
  }

  getDeviceRebootUrl(deviceId) {
    return this.getZoneEndpoint(true) + '/switchmgmt/v1/reboot/' + deviceId;
  }

  getDevicesUrl() {
    return this.getZoneEndpoint() + '/devices';
  }

  getDeviceDetailUrl(deviceId) {
    return this.getZoneEndpoint() + '/devices/' + deviceId;
  }

  getDeleteDeviceUrl(deviceId) {
    return this.getZoneEndpoint() + '/devices/' + deviceId;
  }

  getPortsUrl() {
    return this.getZoneEndpoint() + '/devices/ports';
  }

  getDevicePortsUrl(deviceId) {
    return this.getZoneEndpoint() + '/devices/' + deviceId + '/ports';
  }

  getDeviceConfigsUrl() {
    return this.getZoneEndpoint() + '/devices/config';
  }

  getDeviceConfigUrl(deviceId) {
    return this.getZoneEndpoint() + '/devices/config/' + deviceId;
  }

  getDevicePortsStatisticsUrl(deviceId) {
    if (deviceId === undefined || deviceId === null || deviceId === '') {
      return this.getZoneEndpoint() + '/statistics/ports';
    }
    return this.getZoneEndpoint() + '/statistics/ports/' + deviceId;
  }

  getDeviceFlowsUrl(deviceId) {
    return this.getZoneEndpoint() + '/flows/' + deviceId;
  }

  getDeleteDeviceFlowUrl(deviceId, flowId) {
    return this.getZoneEndpoint() + '/flows/' + deviceId + '/' + flowId;
  }

  getDeviceGroupsUrl(deviceId) {
    return this.getZoneEndpoint() + '/groups/' + deviceId;
  }

  getDeviceGroupDeleteUrl(deviceId, appCookie) {
    return this.getZoneEndpoint() + '/groups/' + deviceId + '/' + appCookie;
  }

  getLinksUrl() {
    return this.getZoneEndpoint() + '/links';
  }

  getDeviceLinksUrl(deviceId) {
    return this.getZoneEndpoint() + '/devices/' + deviceId + '/links';
  }

  getChangePortStateUrl(deviceId, portId) {
    return this.getZoneEndpoint() + '/devices/' + deviceId + '/portstate/' + portId;
  }

  getCreateFlowUrl(deviceId, appId) {
    return this.getZoneEndpoint() + '/flows/' + deviceId + '?appId=' + appId;
  }

  getEndPointsUrl() {
    return this.getZoneEndpoint() + '/hosts';
  }

  // getDeleteEndpointUrl(tenant, segment, mac) {
  //   return this.getZoneEndpoint() + '/endpoints/v1/' + tenant + '/' + segment + '/' + mac;
  // }
  getDeleteEndpointUrl(mac, segment){
    return this.getZoneEndpoint() + '/hosts/' + mac + '/' + segment;
  }

  getStormProfilesUrl() {
    return this.getZoneEndpoint() + '/links';
  }

  getConfigurationUrl(subjectClass, subject) {
    let url = this.getZoneEndpoint() + '/network/configuration';
    if (subjectClass) {
      url = url + '/' + subjectClass;
      if (subject) {
        url = url + '/' + subject;
      }
    }
    return url;
  }

  getConfigurationFileListUrl() {
    return this.getZoneEndpoint() + '/network/configuration/files';
  }

  getConfigurationFileUrl(filename) {
    return this.getZoneEndpoint() + '/network/configuration/files/' + filename;
  }

  updateConfigurationFileUrl(filename) {
    return this.getZoneEndpoint() + '/network/configuration/file-modify/' + filename;
  }

  getConfigurationHistoryUrl(params) {
    let url = this.getZoneEndpoint(true) + '/utility/confighistory/v1/';

    return url;
  }

  getConfigurationHistoryFilesUrl() {
    return this.getZoneEndpoint(true) + '/utility/confighistory/v1/files';
  }

  getAlertHistoryUrl() {
    return this.getZoneEndpoint(true) + '/alert/v1/history/list';
  }

  getAlertHistoryRemoveUrl(uuid) {
    return this.getZoneEndpoint(true) + '/alert/v1/history/uuid/' + uuid;
  }

  getAlertHistoriesSelectedRemoveUrl() {
    return this.getZoneEndpoint(true) + '/alert/v1/history/select/delete';

  }

  getAlertHistoriesRemoveAllUrl() {
    return this.getZoneEndpoint(true) + '/alert/v1/history/all';
  }

  getAlertGroupBasicConfigUrl() {
    return this.getZoneEndpoint(true) + '/alert/v1/basicconfig';
  }

  getAlertGroupReceiveSettingUrl() {
    return this.getZoneEndpoint(true) + '/alert/v1/group/receiver';
  }

  getAlertGroupReceiveUrl() {
    return this.getZoneEndpoint(true) + '/alert/v1/group/receiver/all';
  }

  getAlertGroupReceiveByNameUrl(name) {
    return this.getZoneEndpoint(true) + '/alert/v1/group/receiver/' + name;
  }


  getAllHealthyCheckUrl() {
    return this.getZoneEndpoint(true) + '/healthycheck/v1/threshold';
  }


  getHealthyCheckUrl(object, resource) {
    return this.getZoneEndpoint(true) + '/healthycheck/v1/' + object + '/' + resource + '/threshold';
  }

  getHealthyCheckByNameUrl(object, resource, rule_name) {
    return this.getZoneEndpoint(true) + '/healthycheck/v1/' + object + '/' + resource + '/threshold/' + rule_name;
  }

  getLogsUrl() {
    return this.getZoneEndpoint(true) + '/utility/logs/v1/controller';
  }

  getLogFilesUrl() {
    return this.getZoneEndpoint(true) + '/utility/logs/v1/controller/files';
  }

  getClusterUrl() {
    return this.getZoneEndpoint() + '/cluster';
  }

  getStatisticOfController() {
    return this.getZoneEndpoint() + '/statistics/system/controller';
  }

  getDeviceCPUAnalyzerUrl(deviceId, startTime, endTime, resolutionSecond) {
    return this.getZoneEndpoint(true) + '/analyzer/v1/timerangebar/cpu/' + deviceId + '/' + startTime + '/' + endTime + '/' + resolutionSecond;
  }

  getDeviceMemoryAnalyzerUrl(deviceId, startTime, endTime, resolutionSecond) {
    return this.getZoneEndpoint(true) + '/analyzer/v1/timerangebar/memory/' + deviceId + '/' + startTime + '/' + endTime + '/' + resolutionSecond;
  }

  getIntentsUrl() {
    return this.getZoneEndpoint() + '/intents';
  }

  getIntentsConfigUrl() {
    return this.getZoneEndpoint() + '/intents/config';
  }

  getDeleteIntentUrl(appId, key) {
    return this.getZoneEndpoint() + '/intents/' + appId + '/' + key;
  }

  getDhcpUrl() {
    return this.getZoneEndpoint(true) + '/dhcpserver/ztp/v1/dhcpserver/config';
  }

  getDhcpPostUrl() {
    return this.getZoneEndpoint(true) + '/dhcpserver/ztp/v1/dhcpserver/setConfig';
  }

  getDHCPServerUrl(isBindings) {
    if(isBindings) {
      return this.getZoneEndpoint(true) + '/dhcpserver/ztp/v1/dhcpserver/mappings';
    } else {
      return this.getZoneEndpoint(true) + '/dhcpserver/ztp/v1/dhcpserver';
    }
  }

  getDHCPServerMappingRemoveUrl(mac){
    return this.getZoneEndpoint(true) + '/dhcpserver/ztp/v1/dhcpserver/mappings/'+ mac;
  }

  getElasticsearchDataIndexUrl(index){
    return this.getZoneEndpoint(true) + '/utility/elasticsearch/v1/'+ index +'/query';
  }
  
  getElasticsearchStatusUrl() {
    return this.getZoneEndpoint(true) + '/utility/elasticsearch/v1/status';
  }
  
  getElasticsearchDeleteIndexUrl(index) {
    return this.getZoneEndpoint(true) + `/utility/elasticsearch/v1/${index}/_delete_by_query`;
  }
  
  getElasticsearchBackupUrl(backup_name) {
    return this.getZoneEndpoint(true) + `/utility/elasticsearch/v1/_snapshot/${backup_name}`;
  }
  
  getSegmentUrl(tenant_name, segment_name){
    let path_url = '/tenants/v1';
    if(tenant_name) {
      path_url = path_url + '/' + tenant_name;
    }
  
    path_url = path_url + '/segments';
    
    if(segment_name) {
      path_url = path_url + '/' + segment_name;
    }
    
    return this.getZoneEndpoint() + path_url;
  }
  
  getTenantUrl(){
    return this.getZoneEndpoint() + "/tenants/v1";
  }

  getTenantDeleteUrl(name){
    return this.getZoneEndpoint() + "/tenants/v1/" + name;
  }

  getTenantSegmentUrl(tenantName){
    return this.getZoneEndpoint() + "/tenants/v1/"+ tenantName+"/segments"
  }

  getTenantSegmentDetailsUrl(tenantName, segmentName){
    return this.getZoneEndpoint() + "/tenants/v1/"+ tenantName+"/segments/" + segmentName;
  }

  getAllTenantSegmentUrl(tenantName){
    return this.getZoneEndpoint() + "/tenants/v1/segments";
  }

}

appService.$inject = appService.getDI();
appService.$$ngIsClass = true;


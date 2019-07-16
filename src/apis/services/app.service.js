export class appService {
  static getDI() {
    return [
      '$location',
      '$filter',
      '$cookies',
      '$http',
      '$q'
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
      LIVE_ZONE_ENDPOINT_AUTH: '[%__PROTOCOL__%]://[%__USERNAME__%]:[%__PASSWORD__%]@[%__ZONE_IP__%]/' + this.versionUrl,
      MOCKED_WEBSOCKETS_ENDPONT: 'ws://localhost:3001/',
      //logstash/ 最后的斜杠是不能去掉的，否则无法正常代理
      LIVE_WEBSOCKETS_ENDPONT: '[%__PROTOCOL__%]://[%__ZONE_IP__%]/logstash/',
      // LIVE_WEBSOCKETS_ENDPONT: 'ws://210.63.204.29:3233/',
      // LIVE_WEBSOCKETS_ENDPONT_PORT: 3233,
      MOCKED_MESSAGE_WEBSOCKETS_ENDPONT: 'ws://localhost:3001/mars/websock',
      LIVE_MESSAGE_WEBSOCKETS_ENDPONT: '[%__PROTOCOL__%]://[%__ZONE_IP__%]/mars/websock/',
      // LIVE_MESSAGE_WEBSOCKETS_ENDPONT: '[%__PROTOCOL__%]://210.63.204.29/mars/websock/',
      
      MOCKED_USERNAME: 'nocsys',
      MOCKED_PASSWORD: 'nocsys',
      GUEST_GROUP: 'guestgroup',
      ADMIN_GROUP: 'managergroup',
      SUPER_GROUP: 'admingroup',
      //权限管理 {supergroup: 3, admingroup: 2, guestgroup: 1}
      HEADER: {
        'menu': this.getHeaderMenus()
      },
      //type对应google icon name，不能随意更改
      ENDPOINT_TYPE: [
        {'label': this.translate('MODULES.COMMON.HOST'), 'value': 1, 'type': 'devices'}, 
        {'label': this.translate('MODULES.COMMON.PRINT'), 'value': 2, 'type': 'print'}
      ],
      NOCSYS_APP: 'com.nocsys',
      CRYPTO_STRING: 'secret',
      DEFAULT_FILENAME: 'startup_netcfg.cfg',// default configuration file name
      MAX_MESSAGES_NUMBER: 100
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

  getHeaderMenus() {
    return [
      {
        'group': 'Fabric',
        'label': this.translate('MODULE.HEADER.FABRIC'),
        'role': 1,
        'items': [
          {'label': this.translate('MODULE.HEADER.FABRIC.SUMMARY'), 'url': '/fabric_summary', 'role': 1},
          {'label': this.translate('MODULE.HEADER.FABRIC.DEVICE'), 'url': '/devices', 'role': 2},
          {'label': this.translate('MODULE.HEADER.FABRIC.HOSTS'), 'url': '/hosts', 'role': 2},
          {'label': this.translate('MODULE.HEADER.FABRIC.LOGICAL_PORT'), 'url': '/logical_port', 'role': 3},
          {'label': 'Intents', 'url': '/intents', 'role': 2},
          {'label': 'UpLink', 'url': '/uplinks', 'role': 2},
          {'label': 'Host Segment', 'url': '/host_segment', 'role': 2},
        ]
      },
      {
        'group': 'Functions',
        'label': this.translate('MODULE.HEADER.FUNCTIONS'),
        'role': 1,
        'items': [
          {'label': this.translate('MODULE.HEADER.FABRIC.DHCPRELAY'), 'url': '/dhcp_relay', 'role': 2},
        ]
      },
      {
        'group': 'Topology',
        'label': this.translate('MODULE.HEADER.TOPOLOGY'),
        'role': 1,
        'items': [
          {'label': this.translate('MODULE.HEADER.VLAN.NORMAL'), 'url': '/vlan', 'role': 2},
          {'label': this.translate('MODULE.HEADER.VLAN.DYNAMIC'), 'url': '/vlan_dynamic', 'role': 2},
          {'label': this.translate('MODULE.HEADER.VLAN.GUEST'), 'url': '/vlan_guest', 'role': 2},
        {'label': this.translate('MODULE.HEADER.VLAN.VOICE_VLAN'), 'url': '/vlan_voice', 'role': 2},
          {'label': this.translate('MODULE.HEADER.VLAN.IP_SUBTNET'), 'url': '/vlan_ip', 'role': 2},
        ]
      },
      {
        'group': 'Security',
        'label': this.translate('MODULE.HEADER.SECURITY'),
        'role': 1,
        'items': [
          {'label': 'sFlow', 'url': '/sflow', 'role': 2},
          {'label': this.translate('MODULE.HEADER.FABRIC.MONITOR'), 'url': '/monitor', 'role': 2},
          {'label': 'QoS', 'url': '/qos', 'role': 3},
          {'label': this.translate('MODULE.HEADER.FABRIC.STORM'), 'url': '/storm_control', 'role': 2},
        ]
      },
      {
        'group':'Logical',
        'label': this.translate('MODULE.HEADER.LOGICAL'),
        'role': 3,
        'items':[
          {'label': 'Tenant', 'url': '/tenant', 'role': 3},
          {'label': 'Segment', 'url': '/segment', 'role': 3},
          {'label': this.translate('MODULE.HEADER.FABRIC.ENDPOINTS'), 'url': '/endpoints', 'role': 2},
          {'label': 'EGP', 'url': '/egp', 'role': 3}
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
        'group': 'Account',
        'role': 3,
        'label': this.translate('MODULE.HEADER.ACCOUNT'),
        'items': [
          {'label': this.translate('MODULE.HEADER.ACCOUNT.ACCOUNT_MANAGER'), 'url': '/account_manage', 'role': 3}
        ]
      },
      {
        'group': 'System',
        'role': 3,
        'label': this.translate('MODULE.HEADER.SYSTEM'),
        'items': [
          {'label': this.translate('MODULE.HEADER.MANAGE.DHCP'), 'url': '/dhcp', 'role': 3},
          {'label': this.translate('MODULE.HEADER.MANAGE.NTP'), 'url': '/ntp', 'role': 3},
          // {'label': 'TimeRange', 'url': '/time_range', 'role': 3}, //TODO 暂时隐藏
          {'label': this.translate('MODULE.LOG.PAGE.TITLE'), 'url': '/log', 'role': 2},
          {'label': this.translate('MODULE.HEADER.MANAGE.ELASTICSEARCH'), 'url': '/elasticsearch', 'role': 3},
          {'label': this.translate('MODULE.HEADER.MANAGE.ANALYZER'), 'url': '/analyzer', 'role': 3},
          {'label': this.translate('MODULE.HEADER.MANAGE.SYSTEM_INFO'), 'url': '/system_info', 'role': 3},
          {'label': this.translate('MODULE.HEADER.MANAGE.APPLICATION'), 'url': '/application', 'role': 3},
          {'label': this.translate('MODULE.HEADER.MANAGE.LICENSE'), 'url': '/license', 'role': 3}
        ]
      },


      //===========old hide
      // {
      //   'group': 'Fabric',
      //   'label': this.translate('MODULE.HEADER.FABRIC'),
      //   'role': 1,
      //   'items': [
      //     {'label': this.translate('MODULE.HEADER.FABRIC.SUMMARY'), 'url': '/fabric_summary', 'role': 1},
      //     {'label': this.translate('MODULE.HEADER.FABRIC.DEVICE'), 'url': '/devices', 'role': 2},
      //     {'label': this.translate('MODULE.HEADER.FABRIC.HOSTS'), 'url': '/hosts', 'role': 2},
      //     {'label': this.translate('MODULE.HEADER.FABRIC.LOGICAL_PORT'), 'url': '/logical_port', 'role': 3},
      //     {'label': 'Intents', 'url': '/intents', 'role': 2},
      //     {'label': 'UpLink', 'url': '/uplinks', 'role': 2},
      //     {'label': 'sFlow', 'url': '/sflow', 'role': 2},
      //     {'label': this.translate('MODULE.HEADER.FABRIC.STORM'), 'url': '/storm_control', 'role': 2},
      //     {'label': this.translate('MODULE.HEADER.FABRIC.MONITOR'), 'url': '/monitor', 'role': 2},
      //     {'label': 'Host Segment', 'url': '/host_segment', 'role': 2},
      //     {'label': this.translate('MODULE.HEADER.FABRIC.DHCPRELAY'), 'url': '/dhcp_relay', 'role': 2},
      //     {'label': 'QoS', 'url': '/qos', 'role': 3},
      //
      //   ]
      // },
      // {
      //   'group':'Vlan',
      //   'label': this.translate('MODULE.HEADER.VLAN'),
      //   'role': 3,
      //   'items':[
      //     {'label': this.translate('MODULE.HEADER.VLAN.NORMAL'), 'url': '/vlan', 'role': 2},
      //     {'label': this.translate('MODULE.HEADER.VLAN.DYNAMIC'), 'url': '/vlan_dynamic', 'role': 2},
      //     {'label': this.translate('MODULE.HEADER.VLAN.GUEST'), 'url': '/vlan_guest', 'role': 2},
      //     {'label': this.translate('MODULE.HEADER.VLAN.IP_SUBTNET'), 'url': '/vlan_ip', 'role': 2},
      //   ]
      // },
      // {
      //   'group':'Logical',
      //   'label': this.translate('MODULE.HEADER.LOGICAL'),
      //   'role': 3,
      //   'items':[
      //     {'label': 'Tenant', 'url': '/tenant', 'role': 3},
      //     {'label': 'Segment', 'url': '/segment', 'role': 3},
      //     {'label': this.translate('MODULE.HEADER.FABRIC.ENDPOINTS'), 'url': '/endpoints', 'role': 2},
      //     {'label': 'EGP', 'url': '/egp', 'role': 3}
      //   ]
      //  },
      // {
      //   'group': 'Alert',
      //   'label': this.translate('MODULE.HEADER.ALERT'),
      //   'role': 2,
      //   'items': [
      //     // {'label': 'Alert', 'url': '/alert'},
      //     {'label': this.translate('MODULE.HEADER.ALERT.ALERT'), 'url': '/alert', 'role': 2},
      //     {'label': this.translate('MODULE.HEADER.ALERT.HEALTHYCHECK'), 'url': '/healthycheck', 'role': 2},
      //     {'label': this.translate('MODULE.HEADER.ALERT.INFORM'), 'url': '/inform', 'role': 2},
      //   ]
      // },
      // {
      //   'group': 'Config',
      //   'label': this.translate('MODULE.HEADER.CONFIG'),
      //   'role': 3,
      //   'items': [
      //     {'label': this.translate('MODULE.HEADER.CONFIG.CONFIGURATION'), 'url': '/configuration_list', 'role': 3},
      //     {'label': this.translate('MODULE.HEADER.CONFIG.CONFIGURATION_HISTORY'), 'url': '/configuration_history', 'role': 3}
      //   ]
      // },
      // {
      //   'group': 'Log',
      //   'role': 2,
      //   'label': this.translate('MODULE.HEADER.LOG'),
      //   'items': [
      //     {'label': this.translate('MODULE.LOG.PAGE.TITLE'), 'url': '/log', 'role': 2}
      //   ]
      // },
      // {
      //   'group': 'Account',
      //   'role': 3,
      //   'label': this.translate('MODULE.HEADER.ACCOUNT'),
      //   'items': [
      //     {'label': this.translate('MODULE.HEADER.ACCOUNT.ACCOUNT_MANAGER'), 'url': '/account_manage', 'role': 3}
      //   ]
      // }, {
      //   'group': 'Manage',
      //   'role': 3,
      //   'label': this.translate('MODULE.HEADER.MANAGE'),
      //   'items': [
      //     {'label': this.translate('MODULE.HEADER.MANAGE.DHCP'), 'url': '/dhcp', 'role': 3},
      //     {'label': this.translate('MODULE.HEADER.MANAGE.NTP'), 'url': '/ntp', 'role': 3},
      //     {'label': 'TimeRange', 'url': '/time_range', 'role': 3},
      //     {'label': this.translate('MODULE.HEADER.MANAGE.ELASTICSEARCH'), 'url': '/elasticsearch', 'role': 3},
      //     {'label': this.translate('MODULE.HEADER.MANAGE.ANALYZER'), 'url': '/analyzer', 'role': 3},
      //     {'label': this.translate('MODULE.HEADER.MANAGE.SYSTEM_INFO'), 'url': '/system_info', 'role': 3},
      //     {'label': this.translate('MODULE.HEADER.MANAGE.APPLICATION'), 'url': '/application', 'role': 3},
      //     {'label': this.translate('MODULE.HEADER.MANAGE.LICENSE'), 'url': '/license', 'role': 3}
      //   ]
      // }

    ]
  }

  getMenuAppMapping() {
    return {
      '/hosts': ['org.onosproject.hostprovider'],
      '/logical_port': ['com.nocsys.logicalport'],
      '/uplinks': ['com.nocsys.topology'],
      '/sflow': ['com.nocsys.sflow'],
      '/monitor': ['com.nocsys.monitor'],
      '/host_segment': ['com.nocsys.topologyl3'],
      '/storm_control':['com.nocsys.storm-control'],
      '/dhcp_relay': ['org.onosproject.dhcprelay'],
      '/qos': ['com.nocsys.qos'],
      '/lbd': ['com.nocsys.lbd'],
      '/vlan': ['com.nocsys.vlanmgmt'],
      '/vlan_dynamic': ['com.nocsys.vlanmgmt'],
      '/vlan_guest': ['com.nocsys.vlanmgmt'],
      '/vlan_ip': ['com.nocsys.vlanmgmt'],
      '/tenant': ['com.nocsys.tenant'],
      '/segment': ['com.nocsys.tenant'],
      '/endpoints': ['com.nocsys.tenant', 'com.nocsys.endpoint'],
      '/egp': ['com.nocsys.tenant', 'com.nocsys.egp'],
      '/alert': ['com.nocsys.alert', 'com.nocsys.healthycheck'],
      '/healthycheck': ['com.nocsys.alert', 'com.nocsys.healthycheck'],
      '/inform': ['com.nocsys.alert', 'com.nocsys.healthycheck'],
      '/configuration_list': ['com.nocsys.utility'],
      '/configuration_history': ['com.nocsys.utility'],
      '/log': ['com.nocsys.utility'],
      '/account_manage': ['com.nocsys.useraccount'],
      '/dhcp': ['com.nocsys.dhcpv6server', 'com.nocsys.dhcpserver'],
      '/ntp': ['com.nocsys.ntpserver'],
      '/elasticsearch': ['com.nocsys.utility'],
      '/analyzer': ['com.nocsys.analyzer'],
      '/system_info': ['com.nocsys.utility']
    };
  }

  getZoneEndpoint(isComponent, isAuth) {
    let endpoint;
    if (this.isMocked) {
      endpoint = this.CONST.MOCKED_ZONE_ENDPOINT.replace('[%__ZONE_IP__%]',
        (this.di.$location.host()  + ":"+  this.di.$location.port()));
      endpoint = endpoint.replace('[%__PROTOCOL__%]', this.di.$location.protocol());
    }
    else {
      if(isAuth === true) {
        let useraccount = this.di.$cookies.get('useraccount');
        let crypto = require('crypto-js');
        let decodeBytes = crypto.AES.decrypt(useraccount.toString(), 'secret');
        let decodeData = decodeBytes.toString(crypto.enc.Utf8);
        let username = JSON.parse(decodeData).user_name;
        let password = JSON.parse(decodeData).password;
  
        endpoint = this.CONST.LIVE_ZONE_ENDPOINT_AUTH.replace('[%__USERNAME__%]', username);
        endpoint = endpoint.replace('[%__PASSWORD__%]', password);
        endpoint = endpoint.replace('[%__ZONE_IP__%]', (this.di.$location.host() + ":" + this.di.$location.port()));
        endpoint = endpoint.replace('[%__PROTOCOL__%]', this.di.$location.protocol());
      } else {
        endpoint = this.CONST.LIVE_ZONE_ENDPOINT.replace('[%__ZONE_IP__%]',
          (this.di.$location.host() + ":" + this.di.$location.port()));
        endpoint = endpoint.replace('[%__PROTOCOL__%]', this.di.$location.protocol());
      }
    }

    if (isComponent) {
      endpoint = endpoint.substr(0, endpoint.length - '/v1'.length);
    }

    return endpoint;
  }
  
  getWebscoketEndpoint(endpoint) {
    if (typeof endpoint == 'string' && endpoint) return endpoint;
    
    if (this.isMocked) {
      endpoint = this.CONST.MOCKED_WEBSOCKETS_ENDPONT;
    } else {
      endpoint = this.CONST.LIVE_WEBSOCKETS_ENDPONT.replace('[%__ZONE_IP__%]', this.di.$location.host());
      if(this.di.$location.protocol() === 'https'){
        endpoint = endpoint.replace('[%__PROTOCOL__%]', 'wss');
      } else {
        endpoint = endpoint.replace('[%__PROTOCOL__%]', 'ws');
      }
    }
    return endpoint;
  }
  
  getMessageWebscoketEndpoint() {
    let endpoint;
    if (this.isMocked) {
      endpoint = this.CONST.MOCKED_MESSAGE_WEBSOCKETS_ENDPONT;
    } else {
      endpoint = this.CONST.LIVE_MESSAGE_WEBSOCKETS_ENDPONT.replace('[%__ZONE_IP__%]', this.di.$location.host());
      if(this.di.$location.protocol() === 'https'){
        endpoint = endpoint.replace('[%__PROTOCOL__%]', 'wss');
      } else {
        endpoint = endpoint.replace('[%__PROTOCOL__%]', 'ws');
      }
    }
    return endpoint;
  }
  
  _downloadFile(url) {
    let headers = {};
    let useraccount = this.di.$cookies.get('useraccount');
    let crypto = require('crypto-js');
    let decodeBytes = crypto.AES.decrypt(useraccount.toString(), 'secret');
    let decodeData = decodeBytes.toString(crypto.enc.Utf8);
    let username = JSON.parse(decodeData).user_name;
    let password = JSON.parse(decodeData).password;
    
    headers['Authorization'] = "Basic " + window.btoa(username + ':' + password);
    
    let deferred = this.di.$q.defer();
    this.di.$http.get(url,{responseType: 'arraybuffer', headers: headers})
      .then((result, status, headers) => {
        deferred.resolve(result.data);
      }, (data, status) => {
        console.error("Request failed with status: " + status);
        deferred.reject('Error:' + status);
    })
    
    return deferred.promise;
  }
  
  downloadFileWithAuth(url, filename, type) {
    filename = filename || 'download_file';
    type = type || 'text|plain';
    
    let deferred = this.di.$q.defer();
    this._downloadFile(url).then((data) => {
      // generate file
      let file = new Blob([data], { type: type});
      let fileURL = window.URL.createObjectURL(file);
      deferred.resolve();
      
      // download file
      let a = document.createElement("a");
      document.body.appendChild(a);
      a.style = "display: none";
      a.href = fileURL;
      a.download = filename;
      a.click();
      a.remove();
    }, (error) => {
      console.error('Error:Failed to download file.');
      deferred.reject('Error:Failed to download file.');
    });
    
    return deferred.promise;
  }
  
  getLoginUrl() {
    // return this.getZoneEndpoint(true) + '/j_security_check';
    return this.getZoneEndpoint(true) + '/useraccount/v1/login';
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

  getEndPointsUrl(type) {
    if (type && type === 'host') {
      return this.getZoneEndpoint() + '/hosts';
    }
    else {
      return this.getZoneEndpoint(true) + '/endpoint/v1';
    }
  }

  // getDeleteEndpointUrl(tenant, segment, mac) {
  //   return this.getZoneEndpoint() + '/endpoints/v1/' + tenant + '/' + segment + '/' + mac;
  // }
  getDeleteEndpointUrl(type, params){
    if (type && type === 'host') {
      return this.getZoneEndpoint() + '/hosts/' + params.mac + '/' + params.segment;
    }
    else {
      return this.getZoneEndpoint(true) + '/endpoint/v1/' + params.tenant + '/' + params.segment + '/' + params.mac;
    }  
    
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
    return this.getZoneEndpoint(true, true) + '/utility/confighistory/v1/files';
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
  getTemperatureSensorsUrl(deviceId){
    return this.getZoneEndpoint(true) + '/healthycheck/v1/sensors/' + deviceId + '/temp';
  }
  getPsuSensorsUrl(deviceId){
    return this.getZoneEndpoint(true) + '/healthycheck/v1/sensors/' + deviceId + '/psu';
  }
  getFanSensorsUrl(deviceId){
    return this.getZoneEndpoint(true) + '/healthycheck/v1/sensors/' + deviceId + '/fan';
  }
  getLogsUrl() {
    return this.getZoneEndpoint(true) + '/utility/logs/v1/controller';
  }

  getLogFilesUrl() {
    return this.getZoneEndpoint(true, true) + '/utility/logs/v1/controller/files';
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

  getDeviceDiskAnalyzerUrl(deviceId, startTime, endTime, resolutionSecond) {
    return this.getZoneEndpoint(true) + '/analyzer/v1/timerangebar/disk/' + deviceId + '/' + startTime + '/' + endTime + '/' + resolutionSecond;
  }

  getClusterInterfaceAnalyzerUrl(deviceId, startTime, endTime, resolutionSecond) {
    return this.getZoneEndpoint(true) + '/analyzer/v1/timerangebar/mgmt_ports/' + deviceId + '/' + startTime + '/' + endTime + '/' + resolutionSecond;
  }

  getDeviceInterfaceAnalyzerUrl(deviceId, startTime, endTime, resolutionSecond) {
    return this.getZoneEndpoint(true) + '/analyzer/v1/timerangebar/portstats/' + deviceId + '/summary/' + startTime + '/' + endTime + '/' + resolutionSecond;
  }

  getDevicePortsAnalyzerUrl(deviceId, startTime, endTime, resolutionSecond) {
    return this.getZoneEndpoint(true) + '/analyzer/v1/timerangebar/portstats/' + deviceId + '/' + startTime + '/' + endTime + '/' + resolutionSecond;
  }

  getDevicePortAnalyzerUrl(deviceId, port, startTime, endTime, resolutionSecond) {
    return this.getZoneEndpoint(true) + '/analyzer/v1/timerangebar/portstats/' + deviceId + '/' + port + '/' + startTime + '/' + endTime + '/' + resolutionSecond;
  }

  getNginxTypeAnalyzerUrl(type, startTime, endTime) {
    return this.getZoneEndpoint(true) + '/analyzer/v1/nginx/' + startTime + '/' + endTime +  '/type/' + type.toLowerCase();
  }

  getNginxTimerangeAnalyzerUrl(startTime, endTime, resolutionSecond, ip) {
    if(ip) {
      return this.getZoneEndpoint(true) + '/analyzer/v1/nginx/' + startTime + '/' + endTime +  '/' + resolutionSecond + '/clientip/' + ip;
    } else {
      return this.getZoneEndpoint(true) + '/analyzer/v1/nginx/' + startTime + '/' + endTime +  '/' + resolutionSecond;
    }
  }

  getSyslogAnalyzerUrl(host, startTime, endTime, resolutionSecond) {
    return this.getZoneEndpoint(true) + '/analyzer/v1/syslog/' + host + '/' + startTime + '/' + endTime +  '/' + resolutionSecond;
  }

  getFilebeatAnalyzerUrl(type, startTime, endTime, resolutionSecond) {
    return this.getZoneEndpoint(true) + '/analyzer/v1/filebeat/' + type + '/' + startTime + '/' + endTime +  '/' + resolutionSecond;
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


  getDhcpV6Url() {
    return this.getZoneEndpoint(true) + '/dhcpv6server/ztp/v1/dhcpv6server/read';
  }

  getDhcpV6PostUrl() {
    return this.getZoneEndpoint(true) + '/dhcpv6server/ztp/v1/dhcpv6server/config';
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

  getDHCPV6ServerMappingUrl(){
    return this.getZoneEndpoint(true) + '/dhcpv6server/ztp/v1/dhcpv6server/mappings';
  }

  getNtpUrl(){
    return this.getZoneEndpoint(true) + '/ntpserver/v1';
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
  
  getElasticsearchCSVFileUrl(index, query) {
    let url = this.getZoneEndpoint(true) + '/utility/elasticsearch/v1/csv';
    if(index && !query){
      url += `/${index}`;
    } else if(index && query) {
      url += `/${index}/query`;
    } else if(!index && !query){
      url += `/file`;
    }
    
    return url;
  }


  getDownloadFileUrl(filename) {
    let useraccount = this.di.$cookies.get('useraccount');
    let crypto = require('crypto-js');
    let decodeBytes = crypto.AES.decrypt(useraccount.toString(), 'secret');
    let decodeData = decodeBytes.toString(crypto.enc.Utf8);
    let username = JSON.parse(decodeData).user_name;
    let password = JSON.parse(decodeData).password;
    
    return this.di.$location.protocol() + `://${username}:${password}@` + this.di.$location.host() + ":" + this.di.$location.port() + `/download/${filename}`;
  }

  getPFCUrl(deviceId){
    return this.getZoneEndpoint(true) + `/qos/pfc/v1/${deviceId}`;
  }

  getPFCDeleteUrl(deviceId, port){
    return this.getZoneEndpoint(true) + `/qos/pfc/v1/${deviceId}/${port}`;
  }

  getUpLinkUrl(){
    return this.getZoneEndpoint(true) + '/topology/v1/uplink-segments';
  }

  getUpLinkDeleteUrl(name){
    return this.getZoneEndpoint(true) + '/topology/v1/uplink-segments/' + name;
  }

  getSystemVersionUrl(){
    return this.getZoneEndpoint(true) + '/utility/v1/version';
  }

  getApplicationUrl(){
    return this.getZoneEndpoint() + '/applications';
  }

  getApplicationActionUrl(app_name){
    return this.getZoneEndpoint() + '/applications/' + app_name + '/active';
  }

  getApplicationByNameUrl(app_name){
    return this.getZoneEndpoint() + '/applications/' + app_name;
  }
  
  getLicenseUrl() {
    return this.getZoneEndpoint() + '/license/v1';
  }
  
  getLicenseUploadUrl() {
    return this.getZoneEndpoint() + '/license/BinaryFile';
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

  getSegmentVxlanMemberUrl(tenantName, segmentName) {
    return this.getZoneEndpoint() + "/tenants/v1/"+ tenantName+"/segments/" + segmentName + "/vxlan";
  }

  getSegmentVlanMemberUrl(tenantName, segmentName) {
    return this.getZoneEndpoint() + "/tenants/v1/"+ tenantName+"/segments/" + segmentName + "/vlan";
  }
  
  getTenantSegmentMemberVlanURl(tenant_name, segment_name, device_name){
    return this.getZoneEndpoint() + `/tenants/v1/${tenant_name}/segments/${segment_name}/device/${device_name}/vlan`
  }

  getTenantSegmentMemberVlanRemoveURl(tenant_name, segment_name, device_name){
    return this.getZoneEndpoint() + `/tenants/v1/${tenant_name}/segments/${segment_name}/device/${device_name}`
  }


  getTenantSegmentMemberVxlanURl(tenant_name, segment_name){
   return this.getZoneEndpoint() + `/tenants/v1/${tenant_name}/segments/${segment_name}/vxlan`
  }

  getTenantSegmentMemberVxlanAccessRemoveURl(tenant_name, segment_name,member_name){
    return this.getZoneEndpoint() + `/tenants/v1/${tenant_name}/segments/${segment_name}/vxlan/access/${member_name}`;
  }

  getTenantSegmentMemberVxlanNetworkRemoveURl(tenant_name, segment_name,member_name){
    return this.getZoneEndpoint() + `/tenants/v1/${tenant_name}/segments/${segment_name}/vxlan/network/${member_name}`;
  }

  getTenantSingleSegmentUrl(tenant_name, segment_name){
    return this.getZoneEndpoint() + `/tenants/v1/${tenant_name}/segments/${segment_name}`;
  }

  getTenantSegmentPvid(){
    return this.getZoneEndpoint() + '/tenants/v1/pvid';
  }

  getTenantLogicalAllRouteUrl(){
    return this.getZoneEndpoint(true) + '/tenantlogicalrouter/v1';
  }

  getTenantLogicalRouteUrl(tenant){
    return this.getZoneEndpoint(true) + '/tenantlogicalrouter/v1/tenants/' + tenant;
  }

  getTenantLogicalRouteDeleteUrl(tenant, route_name){
    return this.getZoneEndpoint(true) + `/tenantlogicalrouter/v1/tenants/${tenant}/${route_name}`;
  }

  getTenantLogicalPolicyRouteUrl(tenant, route_name){
    return this.getZoneEndpoint(true) + `/tenantlogicalrouter/v1/tenants/${tenant}/${route_name}/policy-route`;
  }

  getTenantLogicalPolicyRouteWithNameUrl(tenant, route_name, policy_route_name){
    return this.getZoneEndpoint(true) + `/tenantlogicalrouter/v1/tenants/${tenant}/${route_name}/policy-route/${policy_route_name}`;
  }


  getTenantLogicalStaticRouteUrl(tenant, route_name){
    return this.getZoneEndpoint(true) + `/tenantlogicalrouter/v1/tenants/${tenant}/${route_name}/static-route`;
  }

  getTenantLogicalStaticRouteWithNameUrl(tenant, route_name, static_route_name){
    return this.getZoneEndpoint(true) + `/tenantlogicalrouter/v1/tenants/${tenant}/${route_name}/static-route/${static_route_name}`;
  }

  getTenantLogicalNexthopUrl(tenant, route_name){
    return this.getZoneEndpoint(true) + `/tenantlogicalrouter/v1/tenants/${tenant}/${route_name}/nexthop-group`;
  }

  getTenantLogicalNexthopWithNameUrl(tenant, route_name, nexthop_group_name){
    return this.getZoneEndpoint(true) + `/tenantlogicalrouter/v1/tenants/${tenant}/${route_name}/nexthop-group/${nexthop_group_name}`;
  }

  getCosListUrl(){
    return this.getZoneEndpoint(true) + "/qos/cos/v1";
  }

  getEcnListUrl(){
    return this.getZoneEndpoint(true) + "/qos/ecn/v1";
  }

  getScheduleListUrl(){
    return this.getZoneEndpoint(true) + "/qos/scheduler/v1";
  }

  getEGPGroupUrl(){
    return this.getZoneEndpoint(true) + "/egp/v1/group";
  }

  getDeleteEGPGroupUrl(group_name) {
    return this.getZoneEndpoint(true) + "/egp/v1/group/" + group_name;
  }

  getEGPPolicyUrl(){
    return this.getZoneEndpoint(true) + "/egp/v1/policy";
  }

  getDeleteEGPPolicyUrl(policy_name) {
    return this.getZoneEndpoint(true) + "/egp/v1/policy/" + policy_name;
  }

  getEGPPolicyDetailUrl(policy_name) {
    return this.getZoneEndpoint(true) + "/egp/v1/policy/" + policy_name;
  }

  getMonitorUrl(){
    return this.getZoneEndpoint(true) + "/monitor/v1";
  }

  getMonitorUrlBySessionId(sessionId) {
    return this.getZoneEndpoint(true) + "/monitor/v1/" + sessionId;
  }

  getStormControlUrl(){
    return this.getZoneEndpoint(true) + "/storm/v1";
  }

  getStormControlUrlByDeviceId(deviceId) {
    return this.getZoneEndpoint(true) + "/storm/v1/" + deviceId;
  }

  getLogicalPortUrl() {
    return this.getZoneEndpoint(true) + "/logicalport/v1"; 
  }

  getDeleteLogicalPortUrl(logical_name) {
    return this.getZoneEndpoint(true) + "/logicalport/v1/" +  logical_name;   
  }

  getPathUrl(){
    return this.getZoneEndpoint(true) + "/calcpath/v1/getpath";
  }

  getLogicalPortMappingUrl() {
   return this.getZoneEndpoint(true) + "/logicalport/v1/mapping";  
  }

  getSFlowsUrl(device_id) {
    let str = this.getZoneEndpoint(true) + "/sflow/v1";
    if (device_id) str += '/' + device_id;
    return str;
  }

  getHostSegmentUrl(){
    return this.getZoneEndpoint(true) + `/topologyl3/v1/host-segments`;
  }

  getHostSegmentByNameAndDeviceUrl(device_id,seg_name){
    return this.getZoneEndpoint(true) + `/topologyl3/v1/host-segments/${device_id}/${seg_name}`;
  }

  getHostSegmentByNameUrl(seg_name){
    return this.getZoneEndpoint(true) + `/topologyl3/v1/host-segments/${seg_name}`;
  }

  getHostSegmentByDeviceUrl(device_id){
    return this.getZoneEndpoint(true) + `/topologyl3/v1/host-segments/${device_id}`;
  }

  getDHCPRelayDefaultUrl(){
    return this.getZoneEndpoint() + `/dhcprelay/v1/default`;
  }

  getDHCPRelayDefaultByDeviceAndPortUrl(device_id, port){
    return this.getZoneEndpoint() + `/dhcprelay/v1/default/dhcpserverConnetPoint/${device_id}/${port}`;
  }

  getDHCPRelayIndirectUrl(){
    return this.getZoneEndpoint() + `/dhcprelay/v1/indirect`;
  }

  getDHCPRelayIndirectByDeviceAndPortUrl(device_id, port){
    return this.getZoneEndpoint() + `/dhcprelay/v1/indirect/dhcpserverConnetPoint/${device_id}/${port}`;
  }

  getDHCPRelayInterfaceUrl(){
    return this.getZoneEndpoint() + `/dhcprelay/v1/interfaces`;
  }

  getDHCPRelayInterfaceByDeviceAndPortUrl(connectPoint, vlan){
    return this.getZoneEndpoint() + `/dhcprelay/v1/interfaces/${connectPoint}/${vlan}`;
  }

  getDHCPRelayCountersUrl(){
    return this.getZoneEndpoint() + `/dhcprelay/v1/counters`;
  }

  getVlanConfigUrl(device_id){
    return this.getZoneEndpoint(true) + '/vlan/v1/vlan-config' + (device_id ? '/' + device_id : '');
  }
  getVlanMembersUrl() {
    return this.getZoneEndpoint(true) + '/vlan/v1/vlan-config/vlanmembers';
  }

  getVoiceVlanUrl(device_id){
    return this.getZoneEndpoint(true) + '/vlan/v1/voice-vlan' + (device_id ? '/' + device_id : '');
  }

  getVlanIpDeleteUrl(device_id, vlan_id){
    return this.getZoneEndpoint(true) + `/vlan/v1/vlan-config/${device_id}/vlan/${vlan_id}`;
  }

  getTimeRangeUrl(){
    return this.getZoneEndpoint(true) + '/timerange/v1';
  }

  getTimeRangeOfDeviceUrl(deviceId){
    return this.getZoneEndpoint(true) + '/timerange/v1/' + deviceId;
  }

  getTimeRangeOfDeviceAndNameUrl(deviceId, name){
    return this.getZoneEndpoint(true) + '/timerange/v1/' + deviceId + '/' + name;
  }

  getTimeRangeDeleteAbOfDeviceAndNameUrl(deviceId, name){
    return this.getZoneEndpoint(true) + '/timerange/v1/' + deviceId + '/' + name + '/absolute';
  }

  getTimeRangeDeletePerOfDeviceAndNameUrl(deviceId, name, time){
    return this.getZoneEndpoint(true) + '/timerange/v1/' + deviceId + '/' + name + '/periodic/' + time ;
  }

}

appService.$inject = appService.getDI();
appService.$$ngIsClass = true;


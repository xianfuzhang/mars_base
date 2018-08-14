export class appService {
  static getDI() {
    return [
      '$location',
      '$filter'
    ];
  }
  constructor(...args){
    this.di = {};
    appService.getDI().forEach((value, index) => {
      this.di[value] = args[index];
    });
    this.translate = this.di.$filter('translate');
    this.isMocked = true;
    this.CONST = {
      MOCKED_ZONE_ENDPOINT: 'http://[%__ZONE_IP__%]/',
      LIVE_ZONE_ENDPOINT: 'http://[%__ZONE_IP__%]/',

      MOCKED_USERNAME: 'nocsys',
      MOCKED_PASSWORD: 'nocsys',
      GUEST_GROUP: 'guestgroup',
      ADMIN_GROUP: 'admingroup',
      HEADER: {
        'menu':[
          {
            'group':'Fabric',
            'items':[
              {'label': 'Summary', 'url': '/fabric_summary'},
              {'label': 'Switches', 'url': '/devices'},
             // {'label': 'Interface Group', 'url': '/interface_group'},
             //  {'label': 'Statistics', 'url': '/statistics'},
             //  {'label': 'Storm Profile', 'url': '/storm_control'},
            ]
          },
          // {
          //   'group':'Logical',
          //   'items':[
          //     {'label': 'Tenant', 'url': '/tenant'},
          //     {'label': 'Segment', 'url': '/segment'},
          //     {'label': 'Interface Group', 'url': '/interface_group'},
          //   ]
          // },
          {
            'group':'Alert',
            'items':[
              
            ]
          },
          {
            'group':'Config',
            'items':[
              // {'label': 'Configuration', 'url': '/configuration'},
              {'label': this.translate('MODULE.HEADER.CONFIG.CONFIGURATION'), 'url': '/configuration'},
            ]
          },
          {
            'group': 'Log',
            'items': [
              {'label': this.translate('MODULE.LOG.PAGE.TITLE'), 'url': '#!/log'}
            ]
          },
          {
            'group': 'Account',
            'items': [
              {'label': this.translate('MODULE.HEADER.ACCOUNT.ACCOUNT_MANAGER'), 'url': '/account_manage'}
            ]
          }
        ],
        'user':{
          //username暂时是用来显示的，后期是通过接口返回。或者是通过session
          //'UserName':'Nocsys',
          'items':[
            //{'label': this.translate('MODULE.LOGIN.USERACCOUNT.MANAGER'), 'url': '/account_manage'},
            {'label': this.translate('MODULE.HEADER.ACCOUNT.LOGOUT'), 'url': '/logout'}
          ]
        }
      }
    };
  }


  getZoneEndpoint() {
    let endpoint;
    if (this.isMocked) {
      endpoint = this.CONST.MOCKED_ZONE_ENDPOINT.replace('[%__ZONE_IP__%]',
        (this.di.$location.host()  + ":"+  this.di.$location.port()));;
    }
    else {
      endpoint = this.CONST.LIVE_WEBSOCKETS_ENDPONT.replace('[%__ZONE_IP__%]',
        (this.di.$location.host()  + ":"+  this.di.$location.port()));
    }
    return endpoint;
  }

  getLoginUrl() {
    return this.getZoneEndpoint() + 'onos/v1/login';
  }

  getLogoutUrl() {
    return this.getZoneEndpoint() + 'onos/v1/logout';
  }

  getUserAccountUrl() {
    return this.getZoneEndpoint() + 'onos/v1/useraccount/v1';
  }

  getDeleteUserAccountUrl(username) {
    return this.getZoneEndpoint() + 'onos/v1/useraccount/v1/' + username;
  }

  getDevicesUrl(){
    return this.getZoneEndpoint() + 'onos/v1/devices';
  }

  getDeviceDetailUrl(deviceId){
    return this.getZoneEndpoint() + 'onos/v1/devices/' + deviceId;
  }

  getDeleteDeviceUrl(deviceId) {
    return this.getZoneEndpoint() + 'onos/v1/devices/' + deviceId;
  }

  getPortsUrl() {
    return this.getZoneEndpoint() + 'onos/v1/devices/ports';
  }

  getDevicePortsUrl(deviceId) {
    return this.getZoneEndpoint() + 'onos/v1/devices/' + deviceId + '/ports';
  }

  getDevicePortsStatisticsUrl(deviceId) {
    return this.getZoneEndpoint() + 'onos/v1/statistics/ports/' + deviceId;
  }

  getDeviceFlowsUrl(deviceId) {
    return this.getZoneEndpoint() + 'onos/v1/sflow/' + deviceId;
  }

  getLinksUrl() {
    return this.getZoneEndpoint() + 'onos/v1/links';
  }

  getDeviceLinksUrl(deviceId){
    return this.getZoneEndpoint() + 'onos/v1/devices/' +  deviceId + '/links';
  }

  getChangePortStateUrl(deviceId, portId) {
    return this.getZoneEndpoint() + 'onos/v1/devices/' + deviceId + '/portstate/' + portId;
  }

  getCreateFlowUrl(deviceId, appId) {
    return this.getZoneEndpoint() + 'onos/v1/flows/' + deviceId + '?appId=' + appId;
  }

  getEndPointsUrl(){
    return this.getZoneEndpoint() + 'onos/v1/endpoints';
  }

  getDeleteEndpointUrl(tenant, segment, mac){
    return this.getZoneEndpoint() + 'onos/v1/endpoints/' + tenant + '/' + segment + '/' + mac;
  }

  getStormProfilesUrl(){
    return this.getZoneEndpoint() + 'onos/v1/links';
  }

  getConfigurationUrl(subjectClass, subject){
    let url = this.getZoneEndpoint() + 'onos/v1/configuration';
    if(subjectClass){
      url = url + '/' + subjectClass;
      if(subject){
        url =   url + '/' + subject;
      }
    }
    return url;
  }

  getAlertHistoryUrl(){
    return this.getZoneEndpoint() + 'alert/history/list';
  }

  getAlertHistoryRemoveUrl(uuid){
    return this.getZoneEndpoint() + 'alert/history/uuid/' + uuid ;
  }

  getAlertHistoriesSelectedRemoveUrl(){
    return this.getZoneEndpoint() + 'alert/history/select';

  }

  getAlertHistoriesRemoveAllUrl(){
    return this.getZoneEndpoint() + 'alert/history/all';
  }

}

appService.$inject = appService.getDI();
appService.$$ngIsClass = true;
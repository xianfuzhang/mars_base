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
    this.versionUrl = 'mars/v1';
    this.CONST = {
      MOCKED_ZONE_ENDPOINT: '[%__PROTOCOL__%]://[%__ZONE_IP__%]/' + this.versionUrl,
      LIVE_ZONE_ENDPOINT: '[%__PROTOCOL__%]://[%__ZONE_IP__%]/'  + this.versionUrl,

      MOCKED_USERNAME: 'nocsys',
      MOCKED_PASSWORD: 'nocsys',
      GUEST_GROUP: 'guestgroup',
      ADMIN_GROUP: 'admingroup',
      HEADER: {
        'menu':[
          {
            'group':'Fabric',
            'label': this.translate('MODULE.HEADER.FABRIC'),
            'items':[
              {'label': this.translate('MODULE.HEADER.FABRIC.SUMMARY'), 'url': '/fabric_summary'},
              {'label': this.translate('MODULE.HEADER.FABRIC.DEVICE'), 'url': '/devices'},
             // {'label': 'Interface Group', 'url': '/interface_group'},
             //  {'label': 'Statistics', 'url': '/statistics'},
             //  {'label': 'Storm Profile', 'url': '/storm_control'},
            ]
          },
          /*{
            'group':'Logical',
            'items':[
              {'label': 'Tenant', 'url': '/tenant'},
              {'label': 'Segment', 'url': '/segment'},
              {'label': 'Interface Group', 'url': '/interface_group'},
            ]
          },*/
          {
            'group':'Alert',
            'label': this.translate('MODULE.HEADER.ALERT'),
            'items':[
              // {'label': 'Alert', 'url': '/alert'},
              {'label': this.translate('MODULE.HEADER.ALERT.ALERT'), 'url': '/alert'},
              {'label': this.translate('MODULE.HEADER.ALERT.HEALTHYCHECK'), 'url': '/healthycheck'},
              {'label': this.translate('MODULE.HEADER.ALERT.INFORM'), 'url': '/inform'},
            ]
          },
          {
            'group':'Config',
            'label': this.translate('MODULE.HEADER.CONFIG'),
            'items':[
              {'label': this.translate('MODULE.HEADER.CONFIG.CONFIGURATION'), 'url': '/configuration'},
              {'label': this.translate('MODULE.HEADER.CONFIG.CONFIGURATION_LIST'), 'url': '/configuration_list'},
              {'label': this.translate('MODULE.HEADER.CONFIG.CONFIGURATION_HISTORY'), 'url': '/configuration_history'}
            ]
          },
          {
            'group': 'Log',
            'label': this.translate('MODULE.HEADER.LOG'),
            'items': [
              {'label': this.translate('MODULE.LOG.PAGE.TITLE'), 'url': '/log'}
            ]
          },
          {
            'group': 'Account',
            'label': this.translate('MODULE.HEADER.ACCOUNT'),
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

      endpoint = endpoint.replace('[%__PROTOCOL__%]', this.di.$location.protocol());
    }
    else {
      endpoint = this.CONST.LIVE_WEBSOCKETS_ENDPONT.replace('[%__ZONE_IP__%]',
        (this.di.$location.host()  + ":"+  this.di.$location.port()));
      endpoint = endpoint.replace('[%__PROTOCOL__%]', this.di.$location.protocol());
    }
    return endpoint;
  }

  getLoginUrl() {
    return this.getZoneEndpoint() + '/login';
  }

  getLogoutUrl() {
    return this.getZoneEndpoint() + '/logout';
  }

  getUserAccountUrl() {
    return this.getZoneEndpoint() + '/useraccount/v1';
  }

  getDeleteUserAccountUrl(username) {
    return this.getZoneEndpoint() + '/useraccount/v1/' + username;
  }

  getDevicesUrl(){
    return this.getZoneEndpoint() + '/devices';
  }

  getDeviceDetailUrl(deviceId){
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

  getDevicePortsStatisticsUrl(deviceId) {
    if(deviceId === undefined || deviceId === null || deviceId === ''){
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

  getLinksUrl() {
    return this.getZoneEndpoint() + '/links';
  }

  getDeviceLinksUrl(deviceId){
    return this.getZoneEndpoint() + '/devices/' +  deviceId + '/links';
  }

  getChangePortStateUrl(deviceId, portId) {
    return this.getZoneEndpoint() + '/devices/' + deviceId + '/portstate/' + portId;
  }

  getCreateFlowUrl(deviceId, appId) {
    return this.getZoneEndpoint() + '/flows/' + deviceId + '?appId=' + appId;
  }

  getEndPointsUrl(){
    return this.getZoneEndpoint() + '/endpoints';
  }

  getDeleteEndpointUrl(tenant, segment, mac){
    return this.getZoneEndpoint() + '/endpoints/' + tenant + '/' + segment + '/' + mac;
  }

  getStormProfilesUrl(){
    return this.getZoneEndpoint() + '/links';
  }

  getConfigurationUrl(subjectClass, subject){
    let url = this.getZoneEndpoint() + '/configuration';
    if(subjectClass){
      url = url + '/' + subjectClass;
      if(subject){
        url =   url + '/' + subject;
      }
    }
    return url;
  }

  getConfigurationFileListUrl(){
    return this.getZoneEndpoint() + '/network/configuration/files';
  }

  getConfigurationFileUrl(filename){
    return this.getZoneEndpoint() + '/network/configuration/files/' + filename;
  }
  
  getConfigurationHistoryUrl(params){
    let url = this.getZoneEndpoint() + '/utility/confighistory/v1/';
    
    if(params.from && params.to) {
      url += `?from=${params.from}&to=${params.to}`
    }
    return url;
  }
  
  getAlertHistoryUrl(){
    return this.getZoneEndpoint() + '/alert/history/list';
  }

  getAlertHistoryRemoveUrl(uuid){
    return this.getZoneEndpoint() + '/alert/history/uuid/' + uuid ;
  }

  getAlertHistoriesSelectedRemoveUrl(){
    return this.getZoneEndpoint() + '/alert/v1/history/select';

  }

  getAlertHistoriesRemoveAllUrl(){
    return this.getZoneEndpoint() + '/alert/v1/history/all';
  }

  getAlertGroupBasicConfigUrl(){
    return this.getZoneEndpoint() + '/alert/v1/basicconfig';
  }

  getAlertGroupReceiveSettingUrl(){
    return this.getZoneEndpoint() + '/alert/v1/group/receiver';
  }

  getAlertGroupReceiveUrl(){
    return this.getZoneEndpoint() + '/alert/v1/group/receiver/all';
  }

  getAlertGroupReceiveByNameUrl(name){
    return this.getZoneEndpoint() + '/alert/v1/group/receiver/' + name;
  }


  getAllHealthyCheckUrl(){
    return this.getZoneEndpoint() + '/healthycheck/v1/threshold';
  }


  getHealthyCheckUrl(object, resource){
    return this.getZoneEndpoint() + '/healthycheck/v1/'+ object +'/' + resource + '/threshold';
  }

  getHealthyCheckByNameUrl(object, resource, rule_name){
    return this.getZoneEndpoint() + '/healthycheck/v1/'+ object +'/' + resource + '/threshold/' + rule_name;
  }

  getLogsUrl(){
    return this.getZoneEndpoint() + '/logs/v1/controller';
  }

  getClusterUrl(){
    return this.getZoneEndpoint() + '/cluster';
  }

  getStatisticOfController(){
    return this.getZoneEndpoint() + '/statistics/system/controller';
  }


}

appService.$inject = appService.getDI();
appService.$$ngIsClass = true;
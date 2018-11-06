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
    this.isMocked = false;
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
             {'label': this.translate('MODULE.HEADER.FABRIC.ENDPOINTS'), 'url': '/endpoints'},
             {'label': 'Intents', 'url': '/intents'},
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
              {'label': this.translate('MODULE.HEADER.CONFIG.CONFIGURATION'), 'url': '/configuration_list'},
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
      },
      CRYPTO_STRING: 'secret',
      DEFAULT_FILENAME: 'startup_netcfg.cfg' // default configuration file name
    };
  }


  getZoneEndpoint(isComponent) {
    let endpoint;
    if (this.isMocked) {
      endpoint = this.CONST.MOCKED_ZONE_ENDPOINT.replace('[%__ZONE_IP__%]',
        (this.di.$location.host()  + ":"+  this.di.$location.port()));;
      endpoint = endpoint.replace('[%__PROTOCOL__%]', this.di.$location.protocol());
    }
    else {
      endpoint = this.CONST.LIVE_ZONE_ENDPOINT.replace('[%__ZONE_IP__%]',
        (this.di.$location.host()  + ":"+  this.di.$location.port()));
      endpoint = endpoint.replace('[%__PROTOCOL__%]', this.di.$location.protocol());
    }

    if(isComponent){
      endpoint = endpoint.substr(0, endpoint.length - '/v1'.length);
    }

    return endpoint;
  }

  getLoginUrl() {
    return this.getZoneEndpoint(true) + '/j_security_check';
  }

  getLogoutUrl() {
    return this.getZoneEndpoint() + '/logout';
  }

  getUserAccountUrl() {
    return this.getZoneEndpoint(true) + '/useraccount/v1';
  }

  getDeleteUserAccountUrl(username) {
    return this.getZoneEndpoint(true) + '/useraccount/v1/' + username;
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

  getDeviceConfigsUrl(){
    return this.getZoneEndpoint() + '/devices/config';
  }

  getDeviceConfigUrl(deviceId){
    return this.getZoneEndpoint() + '/devices/config/' + deviceId;
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

  getDeviceGroupsUrl(deviceId){
    return this.getZoneEndpoint() + '/groups/' + deviceId;
  }

  getDeviceGroupDeleteUrl(deviceId, appCookie){
    return this.getZoneEndpoint() + '/groups/' + deviceId + '/' + appCookie;
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
    return this.getZoneEndpoint() + '/hosts';
  }

  getDeleteEndpointUrl(mac, segment){
    return this.getZoneEndpoint() + '/hosts/v1/' + mac + '/' + segment;
  }

  getStormProfilesUrl(){
    return this.getZoneEndpoint() + '/links';
  }

  getConfigurationUrl(subjectClass, subject){
    let url = this.getZoneEndpoint() + '/network/configuration';
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
  
  updateConfigurationFileUrl(filename){
    return this.getZoneEndpoint() + '/network/configuration/file-modify/' + filename;
  }
  
  getConfigurationHistoryUrl(params){
    let url = this.getZoneEndpoint(true) + '/utility/confighistory/v1/';

    return url;
  }
  
  getConfigurationHistoryFilesUrl(){
    return this.getZoneEndpoint(true) + '/utility/confighistory/v1/files';
  }

  getAlertHistoryUrl(){
    return this.getZoneEndpoint(true) + '/alert/v1/history/list';
  }

  getAlertHistoryRemoveUrl(uuid){
    return this.getZoneEndpoint(true) + '/alert/v1/history/uuid/' + uuid ;
  }

  getAlertHistoriesSelectedRemoveUrl(){
    return this.getZoneEndpoint(true) + '/alert/v1/history/select/delete';

  }

  getAlertHistoriesRemoveAllUrl(){
    return this.getZoneEndpoint(true) + '/alert/v1/history/all';
  }

  getAlertGroupBasicConfigUrl(){
    return this.getZoneEndpoint(true) + '/alert/v1/basicconfig';
  }

  getAlertGroupReceiveSettingUrl(){
    return this.getZoneEndpoint(true) + '/alert/v1/group/receiver';
  }

  getAlertGroupReceiveUrl(){
    return this.getZoneEndpoint(true) + '/alert/v1/group/receiver/all';
  }

  getAlertGroupReceiveByNameUrl(name){
    return this.getZoneEndpoint(true) + '/alert/v1/group/receiver/' + name;
  }


  getAllHealthyCheckUrl(){
    return this.getZoneEndpoint(true) + '/healthycheck/v1/threshold';
  }


  getHealthyCheckUrl(object, resource){
    return this.getZoneEndpoint(true) + '/healthycheck/v1/'+ object +'/' + resource + '/threshold';
  }

  getHealthyCheckByNameUrl(object, resource, rule_name){
    return this.getZoneEndpoint(true) + '/healthycheck/v1/'+ object +'/' + resource + '/threshold/' + rule_name;
  }

  getLogsUrl(){
    return this.getZoneEndpoint(true) + '/utility/logs/v1/controller';
  }
  
  getLogFilesUrl(){
    return this.getZoneEndpoint(true) + '/utility/logs/v1/controller/files';
  }

  getClusterUrl(){
    return this.getZoneEndpoint() + '/cluster';
  }

  getStatisticOfController(){
    return this.getZoneEndpoint() + '/statistics/system/controller';
  }

  getDeviceCPUAnalyzerUrl(deviceId, startTime, endTime, resolutionSecond) {
    return this.getZoneEndpoint(true) + '/analyzer/v1/timerangebar/cpu/' + deviceId + '/' + startTime + '/' + endTime + '/'  + resolutionSecond;
  }

  getDeviceMemoryAnalyzerUrl(deviceId, startTime, endTime, resolutionSecond) {
    return this.getZoneEndpoint(true) + '/analyzer/v1/timerangebar/memory/' + deviceId + '/' + startTime + '/' + endTime + '/'  + resolutionSecond;
  }

  getIntentsUrl() {
    return this.getZoneEndpoint() + '/intents';
  }

  getDeleteIntentUrl(appId, key) {
    return this.getZoneEndpoint() + '/intents/' + appId + '/' + key;
  }
}

appService.$inject = appService.getDI();
appService.$$ngIsClass = true;


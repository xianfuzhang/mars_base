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
    this.isMocked = true;
    this.CONST = {
      MOCKED_ZONE_ENDPOINT: 'http://localhost:3000/',
      LIVE_ZONE_ENDPOINT: 'http://[%__ZONE_IP__%]/',
    };
  }

  getZoneEndpoint() {
    let endpoint;
    if (this.isMocked) {
      endpoint = this.CONST.MOCKED_ZONE_ENDPOINT;
    }
    else {
      endpoint = this.CONST.LIVE_WEBSOCKETS_ENDPONT.replace('[%__ZONE_IP__%]',
        (this.di.$location.host()  + ":"+  this.di.$location.port()));
    }
    return endpoint;
  }

  getSwitchesUrl(){
    return this.getZoneEndpoint() + 'devices';
  }
}

appService.$inject = appService.getDI();
appService.$$ngIsClass = true;
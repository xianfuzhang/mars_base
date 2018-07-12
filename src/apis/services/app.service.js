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

      HEADER: {
        'menu':[
          {
            'group':'Fabric',
            'items':[
              {'label': 'Devices', 'url': '/devices'},
             // {'label': 'Interface Group', 'url': '/interface_group'},
              {'label': 'Statistics', 'url': '/statistics'},
              {'label': 'Storm Profile', 'url': '/storm_control'},
            ]
          },
          {
            'group':'Logical',
            'items':[
              {'label': 'Tenant', 'url': '/tenant'},
              {'label': 'Segment', 'url': '/segment'},
              {'label': 'Interface Group', 'url': '/interface_group'},
            ]
          }
        ],
        'user':{
          //username暂时是用来显示的，后期是通过接口返回。或者是通过session
          'UserName':'Nocsys',
          'items':[
            {'label': 'setting', 'url': 'setting'},
            {'label': 'logout', 'url': 'logout'}
          ]
        }
      }
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

  getDevicesUrl(){
    return this.getZoneEndpoint() + 'onos/v1/devices';
  }

  getPortsUrl() {
    return this.getZoneEndpoint() + 'onos/v1/devices/ports';
  }

  getLinksUrl() {
    return this.getZoneEndpoint() + 'onos/v1/links';
  }
}

appService.$inject = appService.getDI();
appService.$$ngIsClass = true;
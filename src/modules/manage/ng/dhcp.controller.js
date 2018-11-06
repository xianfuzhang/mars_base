export class DHCPController {
  static getDI() {
    return [
      '$scope',
      '$rootScope',
      '_',
      '$http',
      '$filter',
      '$q',
      '$log',
      '$uibModal',
      'appService',
      'manageDataManager',
      'dialogService',
    ];
  }

  constructor(...args) {
    this.di = {};
    DHCPController.getDI().forEach((value, index) => {
      this.di[value] = args[index];
    });
    let unSubscribers = [];
    let scope = this.di.$scope;

    this.translate = this.di.$filter('translate');


    scope.dhcpModel = {
      dhcpserver:null
    };

    let init = () =>{
      // this.di.manageDataManager.getDHCP().then((res)=>{
      //   if(res ===  null){
      //     //PASS
      //     return;
      //   }
      //   scope.dhcpModel.dhcpserver  =  res;
      // })
      scope.dhcpModel.dhcpserver  = {
        "startip": "10.1.11.51",
        "endip": "10.1.11.100",
        "subnet": "255.255.252.0",
        "router": "10.1.8.1",
        "domain": "8.8.8.8",
        "ttl": 63,
        "lease": 300,
        "renew": 150,
        "rebind": 200,
        "delay": 2,
        "timeout": 150
      }
    };
    init();

  }


}

DHCPController.$inject = DHCPController.getDI();
DHCPController.$$ngIsClass = true;
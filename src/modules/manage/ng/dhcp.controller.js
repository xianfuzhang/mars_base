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
        "endip": "",
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



    scope.saveDHCPConfig = () =>{
      this.di.$rootScope.$emit('page_dhcp');
      if(!validCurrentDom('dhcp')){
        return false;
      }

      this.di.dialogService.createDialog('confirm', this.translate('MODULES.SUMMARY.REBOOT.CONFORM'))
        .then((data)=>{
          this.di.deviceDataManager.rebootDevice(event.data.id);
        },(res)=>{
          // error
        })

    };

    scope.clearDHCPConfig = () =>{

    };
  }


}

DHCPController.$inject = DHCPController.getDI();
DHCPController.$$ngIsClass = true;
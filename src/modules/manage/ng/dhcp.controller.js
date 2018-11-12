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

    scope.regex = {
      ttl_regex: '^[1-9]$|^[1-9][0-9]$|^1[0-9]{2}$|^2[0-4][0-9]$|^25[0-5]$',
      delay_regex: '^([2-9]|10)$',
      timeout_regex: '^(1[5-9][0-9]|2[0-9]{2}|300)$',
      dhcp_int_regex: '^([0-9]|[1-9][0-9]{0,5}|1[0-9]{6}|2[0-4][0-9]{5}|25[0-8][0-9]{4}|259[0-1]{3}|2592000)$'
    };

    let default_ttl = 63;
    let default_lease = 300;
    let default_renew= 150;
    let default_rebind = 200;
    let default_delay = 2;
    let default_timeout = 150;

    let getDefaultValue = (key)=>{
      if(key === 'ttl'){
        return default_ttl + '';
      }

      if(key === 'lease'){
        return default_lease + '';
      }

      if(key === 'renew'){
        return default_renew + '';
      }

      if(key === 'rebind'){
        return default_rebind + '';
      }

      if(key === 'delay'){
        return default_delay + '';
      }

      if(key === 'timeout'){
        return default_timeout + '';
      }
      return "";
    };
  //     "ttl": 63,
  //     "lease": 300,
  //     "renew": 150,
  //     "rebind": 200,
  //     "delay": 2,
  //     "timeout": 150
  // }


    scope.dhcpModel = {
      dhcpserver:{
          "startip": "",
          "endip": "",
          "subnet": "",
          "router": "",
          "domain": "",
          "ttl": "",
          "lease": "",
          "renew": "",
          "rebind": "",
          "delay": "",
          "timeout": ""
        }
    };

    let init = () =>{
      this.di.manageDataManager.getDHCP().then((res)=>{
        if(res === null){
          // PASS
          return;
        }
        let dhcpJson = res.data;
        let _ = this.di._;
        if(_.keys(dhcpJson).length > 0){
          _.forEach(_.keys(dhcpJson), (key)=>{
            scope.dhcpModel.dhcpserver[key] = dhcpJson[key] !== 0?dhcpJson[key]:getDefaultValue(key);
          })
        }

      })
      // scope.dhcpModel.dhcpserver  = {
      //   "startip": "10.1.11.51",
      //   "endip": "",
      //   "subnet": "255.255.252.0",
      //   "router": "10.1.8.1",
      //   "domain": "8.8.8.8",
      //   "ttl": 63,
      //   "lease": 300,
      //   "renew": 150,
      //   "rebind": 200,
      //   "delay": 2,
      //   "timeout": 150
      // }
    };



    init();

    function validCurrentDom(dom_class) {
      let out = document.getElementsByClassName(dom_class);

      if(out && out.length === 1){
        let invalidDoms = out[0].getElementsByClassName('ng-invalid');
        if(invalidDoms && invalidDoms.length > 0){
          return false;
        }
      }
      return true;
    }

    let genPostParam = () => {
      let res = angular.copy(scope.dhcpModel.dhcpserver);
      if(res['router'] === '' || res['router'] === null){
        delete res['router'];
      }

      if(res['domain'] === '' || res['domain'] === null){
        delete res['domain'];
      }

      if(res['ttl'] === '' || res['ttl'] === null){
        delete res['ttl'];
      } else {
        res['ttl'] = parseInt(res['ttl']);
      }

      if(res['lease'] === '' || res['lease'] === null){
        delete res['lease'];
      } else {
        res['lease'] = parseInt(res['lease']);
      }

      if(res['renew'] === '' || res['renew'] === null){
        delete res['renew'];
      } else {
        res['renew'] = parseInt(res['renew']);
      }

      if(res['rebind'] === '' || res['rebind'] === null){
        delete res['rebind'];
      } else {
        res['rebind'] = parseInt(res['rebind']);
      }

      if(res['delay'] === '' || res['delay'] === null){
        delete res['delay'];
      } else {
        res['delay'] = parseInt(res['delay']);
      }

      if(res['timeout'] === '' || res['timeout'] === null){
        delete res['timeout'];
      } else {
        res['timeout'] = parseInt(res['timeout']);
      }
      return res;
    };

    scope.saveDHCPConfig = () =>{
      this.di.$rootScope.$emit('page_dhcp');
      if(!validCurrentDom('dhcp')){
        return false;
      }

      let param = genPostParam();

      this.di.dialogService.createDialog('confirm', this.translate('MODULES.MANAGE.DHCP.SUBMIT.CONFORM'))
        .then((data)=>{
          this.di.manageDataManager.postDHCP(param);
        },(res)=>{

        })
    };

    scope.clearDHCPConfig = () =>{
      this.di.dialogService.createDialog('confirm', this.translate('MODULES.MANAGE.DHCP.DELETE.CONFORM'))
        .then((data)=>{
          this.di.manageDataManager.deleteDHCP();
        },(res)=>{

        })
    };
  }


}

DHCPController.$inject = DHCPController.getDI();
DHCPController.$$ngIsClass = true;
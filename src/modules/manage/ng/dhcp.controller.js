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
      'roleService',
      'appService',
      'notificationService',
      'manageService',
      'manageDataManager',
      'applicationService',
      'tableProviderFactory',
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
    this.di.$scope.role = this.di.roleService.getRole();
    this.translate = this.di.$filter('translate');

    scope.regex = {
      ttl_regex: '^[1-9]$|^[1-9][0-9]$|^1[0-9]{2}$|^2[0-4][0-9]$|^25[0-5]$',
      delay_regex: '^([2-9]|10)$',
      timeout_regex: '^(1[5-9][0-9]|2[0-9]{2}|300)$',
      dhcp_int_regex: '^([0-9]|[1-9][0-9]{0,5}|1[0-9]{6}|2[0-4][0-9]{5}|25[0-8][0-9]{4}|259[0-1]{3}|2592000)$'
    };

    scope.tabSelected = null;
    scope.tabs = [];

    // {
    //   'label': this.translate('MODULES.MANAGE.DHCP.TAB.DHCP_SERVER'),
    //   'value': 'dhcp_server',
    //   'type': 'dhcp_server'
    // },
    // {
    //   'label': this.translate('MODULES.MANAGE.DHCP.TAB.IPMAC_MAPPING'),
    //   'value': 'ipmac_mapping',
    //   'type': 'ipmac_mapping'
    // },
    // {
    //   'label': this.translate('MODULES.MANAGE.DHCP.TAB.DHCP_SERVER_V6'),
    //   'value': 'dhcp_server_v6',
    //   'type': 'dhcp_server_v6'
    // },
    // {
    //   'label': this.translate('MODULES.MANAGE.DHCP.TAB.IPMAC_MAPPING_V6'),
    //   'value': 'ipmac_mapping_v6',
    //   'type': 'ipmac_mapping_v6'
    // }

    scope.onTabChange= (tab) => {
      if (tab){
        scope.tabSelected = tab;

        if(tab.type === 'dhcp_server_v6'){
          initV6config();
        } else if(tab.type === 'dhcp_server'){
          init();
        }
      }
    };

    scope.onDHCPTableRowSelectAction = (event) => {
      if (event.data && event.action) {
        if (event.action.value === 'delete') {
          this.di.dialogService.createDialog('warning', this.translate('MODULES.MANAGE.DHCP.REMOVE_IPMAC'))
            .then((data) =>{
              this.di.manageDataManager.deleteMacAndIpBindings(event.data.host.split('/')[0])
                .then((res) =>{
                  this.di.notificationService.renderSuccess(scope, this.translate('MODULES.MANAGE.DHCP.IPMAC.DELETE.SUCCESS'));
                  scope.dhcpModel.dhcpAPI.queryUpdate();
                },(error)=>{
                  this.di.notificationService.renderWarning(scope, error);
                });
            }, (res) =>{
              this.di.$log.debug('delete macip binding dialog cancel');
            });
        } else if(event.action.value === 'edit'){
          this.di.$rootScope.$emit('ipmac-wizard-show', event.data.host.split('/')[0]);
        } else if(event.action.value === 'save'){
          _save_2_static(event)
        } else if(event.action.value === 'init_device'){
          this.di.$rootScope.$emit('switch-wizard-show-4-dhcp', event.data.host.split('/')[0], event.data.ip);
        }
      }
    };


    let _save_2_static = (event) =>{
      let mac = event.data.host.split('/')[0];
      let ip = event.data.ip;
      this.di.manageDataManager.postMacAndIpBindings({'mac':mac, 'ip':ip})
        .then((res) => {
          this.di.notificationService.renderSuccess(scope, this.translate('MODULES.MANAGE.DHCP.IPMAC.CREATE.SUCCESS'));
          scope.dhcpModel.dhcpAPI.queryUpdate();
        }, (error) => {
          this.di.notificationService.renderWarning(scope, error.data.message);
        });
    }


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

    let emptyDHCPServerConfig = {
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
    };

    let emptyDHCPV6ServerConfig = {
      "enable": '0',
      "isEnable": false,
      "dns_server": "",
      "domain_search_list": "",
      "sntp_server": "",
    };

    scope.dhcpModel = {
      dhcpserverv6:angular.copy(emptyDHCPV6ServerConfig),
      dhcpserver:angular.copy(emptyDHCPServerConfig),
        actionsShow:{
          'menu': {'enable': false, 'role': 3}, 
          'add': {'enable': true, 'role': 3},
          'remove': {'enable': false, 'role': 3}, 
          'refresh': {'enable': true, 'role': 3}, 
          'search': {'enable': false, 'role': 3}
        },
        rowActions:[
          {
            'label': this.translate('MODULES.MANAGE.DHCP.TABLE.INIT_DEVICE'),
            'role': 3,
            'value': 'init_device'
          },
          {
            'label': this.translate('MODULES.MANAGE.DHCP.TABLE.SAVE'),
            'role': 3,
            'value': 'save'
          },
          {
            'label': this.translate('MODULES.MANAGE.DHCP.TABLE.EDIT'),
            'role': 3,
            'value': 'edit'
          },
          {
            'label': this.translate('MODULES.MANAGE.DHCP.TABLE.DELETE'),
            'role': 3,
            'value': 'delete'
          }

        ],
      dhcpTableProvider:null,
      dhcpAPI: "",
      v6actionsShow:{
        'menu': {'enable': false, 'role': 3},
        'add': {'enable': false, 'role': 3},
        'remove': {'enable': false, 'role': 3},
        'refresh': {'enable': true, 'role': 3},
        'search': {'enable': false, 'role': 3}
      },
      v6rowActions:[
        // {
        //   'label': this.translate('MODULES.MANAGE.DHCP.TABLE.EDIT'),
        //   'role': 3,
        //   'value': 'edit'
        // },
        // {
        //   'label': this.translate('MODULES.MANAGE.DHCP.TABLE.DELETE'),
        //   'role': 3,
        //   'value': 'delete'
        // }
      ],
      dhcpv6TableProvider:null,
      dhcpv6API: "",
    };


    scope.displayLabel = {
      v6enable : {
        options: [{'label': this.translate('MODULES.MANAGE.DHCP.YES'), 'value': '1'}, {'label': this.translate('MODULES.MANAGE.DHCP.NO'), 'value': '0'}]
      },
      v6enable_radio: {on: this.translate('MODULES.MANAGE.DHCP.YES'), off: this.translate('MODULES.MANAGE.DHCP.NO'), id: 'ntp_enable'}
    };

    scope.addIPMac = () =>{
      this.di.$rootScope.$emit('ipmac-wizard-show');
    };

    scope.dhcpModel.dhcpTableProvider = this.di.tableProviderFactory.createProvider({
      query: (params) => {
        let defer = this.di.$q.defer();
        this.di.manageDataManager.getMacAndIpBindings().then((res) => {
            defer.resolve({
              data: res.mappings,
              count: undefined
            });
        },(error)=>{
          console.log('error ====');
        });
        return defer.promise;
      },
      getSchema: () => {
        return {
          schema: this.di.manageService.getDHCPTableSchema(),
          index_name: 'host',
          rowCheckboxSupport: true,
          rowActionsSupport: true,
          authManage: {
            support: true,
            currentRole: this.di.$scope.role
          }
        };
      }
    });

    scope.dhcpModel.dhcpv6TableProvider = this.di.tableProviderFactory.createProvider({
      query: (params) => {
        let defer = this.di.$q.defer();
        this.di.manageDataManager.getV6MacAndIpBindings().then((res) => {
          this.di._.map(res.mappings, (mapping)=>{ mapping.timestamp = this._formatLocaleTime(mapping.timestamp)})
          defer.resolve({
            data: res.mappings,
            count: undefined
          });
        },(error)=>{
          console.log('error dhcpv6TableProvider ====');
        });
        return defer.promise;
      },
      getSchema: () => {
        return {
          schema: this.di.manageService.getDHCPV6TableSchema(),
          index_name: 'host',
          rowCheckboxSupport: false,
          rowActionsSupport: false,
        };
      }
    });

    scope.onDHPAPIReady = ($api) => {
      scope.dhcpModel.dhcpAPI = $api;
    };

    scope.onDHCPV6APIReady = ($api) =>{
      scope.dhcpModel.dhcpv6API = $api;
    }


    let init = () =>{
      scope.tabSelected = scope.tabs[0];

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

      },(err)=>{
        this.di.notificationService.renderWarning(scope, JSON.stringify(err,undefined, 2));
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

    let initV6config = () =>{
      this.di.manageDataManager.getDHCPV6().then((res)=>{
        let dhcpJson = res.data;
        scope.dhcpModel.dhcpserverv6 = angular.copy(emptyDHCPV6ServerConfig);
        if(dhcpJson['MANAGEMENT']){
          // scope.dhcpModel.dhcpserverv6.enable = this.di._.find(scope.displayLabel.v6enable.options, {'value': dhcpJson['MANAGEMENT']['enable']});
          scope.dhcpModel.dhcpserverv6.isEnable = dhcpJson['MANAGEMENT']['enable'] === '1'?true:false;
          scope.dhcpModel.dhcpserverv6.dns_server = dhcpJson['DHCPv6']['DNS_SERVER'];
          scope.dhcpModel.dhcpserverv6.domain_search_list = dhcpJson['DHCPv6']['DOMAIN_SEARCH_LIST'];
          scope.dhcpModel.dhcpserverv6.sntp_server = dhcpJson['DHCPv6']['SNTP_SERVER'];
          // if(dhcpJson['MANAGEMENT']['enable'] === '1' && dhcpJson['DHCPv6']){
          //   scope.dhcpModel.dhcpserverv6.dns_server = dhcpJson['DHCPv6']['DNS_SERVER'];
          //   scope.dhcpModel.dhcpserverv6.domain_search_list = dhcpJson['DHCPv6']['DOMAIN_SEARCH_LIST'];
          //   scope.dhcpModel.dhcpserverv6.sntp_server = dhcpJson['DHCPv6']['SNTP_SERVER'];
          // }
        }
      },(err)=>{
        // this.di.notificationService.renderWarning(scope, err);
        this.di.notificationService.renderWarning(scope, JSON.stringify(err,undefined, 2));
      });
    };

    //init由application的状态控制
    this.init_application_license().then(()=>{
      scope.onTabChange(scope.tabs[0])
    });

    function validCurrentDom(dom_class) {
      let out = document.getElementsByClassName(dom_class);

      if(out && out.length === 1){
        let invalidDoms = out[0].getElementsByClassName('mdc-text-field--invalid');
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
          this.di.manageDataManager.postDHCP(param).then((res)=>{
            if(res){
              this.di.notificationService.renderSuccess(scope, this.translate('MODULES.MANAGE.DHCP.CREATE.SUCCESS'));
              init();
            }
          },(err)=>{
            this.di.notificationService.renderWarning(scope, err);
          });
        },(res)=>{

        })
    };


    // scope.changeDHCPv6Switch = () =>{
    //   this.di.manageDataManager.getNTP().then((res) => {
    //
    //     let ntp = (res.data);
    //     ntp['enabled'] = scope.ntpmodel.isEnable;
    //     this.di.manageDataManager.putNTP(ntp).then((res)=>{},(err)=>{
    //       this.di.notificationService.renderWarning(scope, err);
    //     })
    //
    //   },(err)=>{
    //     this.di.notificationService.renderWarning(scope, err);
    //   });
    // }

    let genV6PostParam = () =>{
      return  {
        "MANAGEMENT": {
          "enable": scope.dhcpModel.dhcpserverv6.isEnable?"1":"0"
        },
        "CONTROLLER": {
          "mapping_url": "http://localhost:8181/mars/dhcpv6server/ztp/v1/dhcpv6server/mappings",
          "account": "onos",
          "passwd": "rocks"
        },
        "RA_INFO": {
          "period": "10",
          "m_flag": "0",
          "o_flag": "1",
          "current_hop_limit": "64",
          "router_life_time": "1800",
          "reachable_time": "0",
          "retrans_time": "0",
          "mcast_dst": "ff02::1",
          "prefix_length": "64",
          "prefix": "d00d::"
        },
        "DHCPv6": {
          "DUID": "0003001a8583561abc6",
          "DNS_SERVER": scope.dhcpModel.dhcpserverv6.dns_server,
          "DOMAIN_SEARCH_LIST": scope.dhcpModel.dhcpserverv6.domain_search_list,
          "SNTP_SERVER": scope.dhcpModel.dhcpserverv6.sntp_server
        }
      }
    };


    scope.saveDHCPV6Config = () =>{
      // console.log(scope.dhcpModel.dhcpserverv6.isEnable);
      // return false;
      this.di.$rootScope.$emit('page_dhcp_v6');
      if(!validCurrentDom('dhcp')){
        return false;
      }
      let param = genV6PostParam();
      this.di.dialogService.createDialog('confirm', this.translate('MODULES.MANAGE.DHCPV6.SUBMIT.CONFORM'))
        .then((data)=>{
          this.di.manageDataManager.postDHCPV6(param).then((res)=>{
            if(res){
              this.di.notificationService.renderSuccess(scope, this.translate('MODULES.MANAGE.DHCPV6.CREATE.SUCCESS'));
              initV6config();
            }
          },(err)=>{
            this.di.notificationService.renderWarning(scope, err);
          });
        },(res)=>{

        })
    };

    scope.clearDHCPConfig = () =>{
      this.di.dialogService.createDialog('confirm', this.translate('MODULES.MANAGE.DHCP.DELETE.CONFORM'))
        .then((data)=>{
          this.di.manageDataManager.deleteDHCP().then(()=>{
            this.di.notificationService.renderSuccess(scope, this.translate('MODULES.MANAGE.DHCP.DELETE.SUCCESS'));

            scope.dhcpModel.dhcpserver = angular.copy(emptyDHCPServerConfig);
          },(err)=>{
            this.di.notificationService.renderWarning(scope, err);
          });
        },(res)=>{

        })
    };


    let genV6ClearParam = () =>{
      return {
        "MANAGEMENT": {
          "enable": "0"
        },
        "CONTROLLER": {
          "mapping_url": "http://localhost:8181/mars/dhcpv6server/ztp/v1/dhcpv6server/mappings",
          "account": "onos",
          "passwd": "rocks"
        },
        "RA_INFO": {
          "period": "10",
          "m_flag": "0",
          "o_flag": "1",
          "current_hop_limit": "64",
          "router_life_time": "1800",
          "reachable_time": "0",
          "retrans_time": "0",
          "mcast_dst": "ff02::1",
          "prefix_length": "64",
          "prefix": "d00d::"
        },
        "DHCPv6": {
        }
      }
    };

    scope.clearDHCPV6Config = () =>{
      let param = genV6ClearParam();
      this.di.dialogService.createDialog('confirm', this.translate('MODULES.MANAGE.DHCPV6.DELETE.CONFORM'))
        .then((data)=>{
          this.di.manageDataManager.postDHCPV6(param).then((res)=>{
            if(res){
              this.di.notificationService.renderSuccess(scope, this.translate('MODULES.MANAGE.DHCPV6.DELETE.SUCCESS'));
              scope.dhcpModel.dhcpserverv6 = angular.copy(emptyDHCPV6ServerConfig);
            }
          },(err)=>{
            this.di.notificationService.renderWarning(scope, err);
          });
        },(res)=>{

        })
    };

    let unsubscribes = [];
    unsubscribes.push(this.di.$rootScope.$on('ipmac-refresh', ($event) => {
      this.di.notificationService.renderSuccess(scope, this.translate('MODULES.MANAGE.DHCP.IPMAC.CREATE.SUCCESS'));
      scope.dhcpModel.dhcpAPI.queryUpdate();
    }));

    scope.$on('$destroy', () => {
      unsubscribes.forEach((cb) => {
        cb();
      })
    })

  }


  init_application_license(){
    let defer = this.di.$q.defer();
    let scope = this.di.$scope;

    scope.isDHCPv4Enable= false;
    scope.isDHCPv6Enable= false;

    let _reset_tab_list = () => {
      let tabs = this.di.manageService.getDHCPTabSchema();
      if(!scope.isDHCPv4Enable){
        this.di._.remove(tabs, (tab)=>{
          return tab['value'] === 'dhcp_server' || tab['value'] === 'ipmac_mapping';
        });
      }

      if(!scope.isDHCPv6Enable){
        this.di._.remove(tabs, (tab)=>{
          return tab['value'] === 'dhcp_server_v6' || tab['value'] === 'ipmac_mapping_v6';
        });
      }

      scope.tabs = tabs;
    };

    this.di.applicationService.getNocsysAppsState().then(()=>{
      let allState = this.di.applicationService.getAppsState();
      let DCHPV4_APP_NAME = 'com.nocsys.dhcpserver';
      let DCHPV6_APP_NAME = 'com.nocsys.dhcpv6server';
      if(allState[DCHPV4_APP_NAME] === 'ACTIVE'){
        scope.isDHCPv4Enable = true;
      }
      if(allState[DCHPV6_APP_NAME] === 'ACTIVE'){
        scope.isDHCPv6Enable = true;
      }
      _reset_tab_list();
      defer.resolve();
    },()=>{
      defer.resolve();
    });
    return defer.promise;
  }

  _formatLocaleTime(time){
    let _fillInt= (num, count)=>{
      if(!count){
        count = 2;
      }
      let numStr = num + '';
      if(numStr.length !== count) {
        return '0'.repeat(count - numStr.length) + numStr
      } else
        return num
    };

    let d = new Date(time);
    let res = d.getFullYear() + '-' +
      _fillInt(d.getMonth()+ 1) + '-' +
      _fillInt(d.getDate()) + ' ' +
      _fillInt(d.getHours()) +  ':' +
      _fillInt(d.getMinutes()) + ':' +
      _fillInt(d.getSeconds())+ ',' +
      _fillInt(d.getMilliseconds(),3);

    return res
  }

}

DHCPController.$inject = DHCPController.getDI();
DHCPController.$$ngIsClass = true;
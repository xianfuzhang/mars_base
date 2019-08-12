import {MDCRipple} from '@material/ripple';
export class headerController{
  static getDI() {
    return [
      '$scope',
      '$rootScope',
      '$cookies',
      '$location',
      '$timeout',
      '$window',
      '$filter',
      '_',
      'crypto',
      'appService',
      'roleService',
      'localStoreService',
      'applicationService',
      'loginDataManager',
      'alertDataManager',
      'manageDataManager',
      'deviceDataManager',
      'messageService'
    ];
  }

  constructor(...args){
    this.di= {};
    headerController.getDI().forEach((value, index) => {
      this.di[value] = args[index];
    });
    this.scope = this.di.$scope;
    this.translate = this.di.$filter('translate');
    this.CONST_ADMIN_GROUP = this.di.appService.CONST.ADMIN_GROUP;
    this.scope.groups = angular.copy(this.di.appService.CONST.HEADER);
    this.scope.username = null;
    this.scope.messages = [];
    this.scope.hasUnreadMsg = false;
    this.devices = [];
    this.scope.userConfig = [
      {'label': this.di.$filter('translate')('MODULE.HEADER.ACCOUNT.LOGOUT'), 'url': '/logout'}
    ];
    this.scope.timeout1 = null;
    this.scope.timeout2 = null;
    //this.scope.alerts_acount = 0;
    this.scope.location = (url, event) => {
      this.scope.$emit('change-selected-menu-item', {'url': url});
      event && event.stopPropagation();
      if (url === '/logout') {
        this.di.$cookies.remove('useraccount');
        this.di.localStoreService.getSyncStorage().del('menus');
        this.di.roleService.clearRole();
      }
      this.di.$location.url(url);
    };

    // handle theme
    const CONST_LOCAL_STORAGE_KEY = 'userPrefs__';
    const CONST_THEME = 'theme';
    let theme =  this.di.$window.localStorage.getItem(CONST_LOCAL_STORAGE_KEY + CONST_THEME);
    if(theme) {
      this.scope.theme = theme;
    } else {
      this.scope.theme = 'theme_default';
    }
    
    this.scope.changeTheme = () => {
      let theme = this.scope.theme == 'theme_default' ? 'theme_dark' : 'theme_default';
      this.di.$rootScope.$emit('change-theme', theme)
    }
  
    this.scope.messageClick = (message) => {
      let unReadNum = 0;
      message.isRead = true;
    
      let messages = this.scope.messages;
      this.di._.forEach(messages, (message) => {
        if(!message.isRead) {
          unReadNum++;
        }
      })
      
      this.scope.hasUnreadMsg = unReadNum > 0 ? true : false;
      
      let savedMessages = this.di.messageService.getMessages();
      savedMessages.forEach((msg) => {
        if(msg.uuid && (msg.uuid === message.uuid)) {
          msg.isRead = true;
        }
      })
      this.di.messageService.saveMessages(savedMessages);
      
      if(message.path.url) {
        this.di.$location.path(message.path.url).search(message.path.query);
      }
    };
    
    this.init();

    let unsubscribers = [];
    unsubscribers.push(this.di.$rootScope.$on('application-change-state', (event) => {
      this.filterMenusByApps();
    }));
    unsubscribers.push(this.di.$rootScope.$on('change-selected-menu-item', (event, param) => {
      this.scope.timeout1 = this.di.$timeout(() => {
        this.changeSelectedMenuItem(param.url);
      });
    }));

    unsubscribers.push(this.di.$rootScope.$on('$translateChangeSuccess', () => {
      console.log('in header contrl...');
      this.di.appService.CONST.HEADER['menu'] = this.di.appService.getHeaderMenus();
      this.di.appService.filterMenuByLoginRole();
      this.scope.menus['groups'] = this.di.appService.roleFilterMenu;
      this.filterMenusByApps();
      this.di.localStoreService.getSyncStorage().set('menus',
        {
          'role': this.di.roleService.getRole(), 
          'groups': this.di.appService.roleFilterMenu
        });
    }));
    
    unsubscribers.push(this.di.$rootScope.$on('new-websocket-message', ($event, message) => {
      let messages = this.scope.messages;
    
      messages.splice(0, 0, this.formatMessage(message));
    
      this.scope.hasUnreadMsg = true;
      if(messages.length > this.di.appService.CONST.MAX_MESSAGES_NUMBER) {
        this.scope.messages = messages.slice(0, this.di.appService.CONST.MAX_MESSAGES_NUMBER);
      }
      
      this.scope.$apply();
    }));

    this.scope.$on('$destroy', () => {
      unsubscribers.forEach((cb) => {
        cb();
      });
      this.di.$timeout.cancel(this.scope.timeout1);
      this.di.$timeout.cancel(this.scope.timeout2);
    });
  }

  init() {
    this.scope.menus = this.di.localStoreService.getSyncStorage().get('menus');
    let useraccount = this.di.$cookies.get('useraccount'),
        url = this.di.$location.path();
    if (!useraccount || !this.scope.menus) {
      let search = this.di.$location.search();
      if(url !== '/'){
        url = window.btoa(url);
        search = window.btoa(JSON.stringify(search));
        this.di.$location.path('/login').search({lastp: url, lasts: search});
      } else {
        this.di.$location.path('/login');
      }
      // this.di.$location.path('/login');
      return;
    }
    let decodeBytes = this.di.crypto.AES.decrypt(useraccount.toString(), this.di.appService.CONST.CRYPTO_STRING);
    let decodeData = decodeBytes.toString(this.di.crypto.enc.Utf8);
    this.scope.username = JSON.parse(decodeData).user_name;

    this.filterMenusByApps();
    this.setMessageWebsocket();
    this.scope.timeout2 = this.di.$timeout(() => {
      this.changeSelectedMenuItem(url);
    }, 1000);
  }

  setMessageWebsocket() {
    let unReadNum = 0;
    let devices = [];
    const THIS = this;
  
    // get devices
    THIS.di.deviceDataManager.getDeviceConfigs().then((res) => {
      THIS.devices = res;
    }, () => {
      THIS.devices = [];
    }).finally(() => {
      // setup message websocket
      THIS.di.messageService.init();
    
      let messages = THIS.di.messageService.getMessages();
    
    
      THIS.di._.forEach(messages, (message) => {
        if(!message.isRead) {
          unReadNum++;
        }
      
        THIS.scope.messages.push(THIS.formatMessage(message));
      })
    
      THIS.scope.hasUnreadMsg = unReadNum > 0 ? true : false;
    })
  }
  
  filterMenusByApps() {
    this.di.applicationService.getNocsysAppsState().then(() => {
      let apps = this.di.applicationService.getAppsState();
      if (!Object.keys(apps).length) {
        this.scope.menues = this.scope.menus.groups;
      }
      else {
        let origins = angular.copy(this.scope.menus.groups);
        let menuMapping = this.di.appService.getMenuAppMapping();
        // let tenantState = apps['com.nocsys.tenant'];
        // let dhcpserverState = apps['com.nocsys.dhcpserver'];
        // let dhcpv6serverState = apps['com.nocsys.dhcpv6server'];
        // let fabricIndex = this.di._.findIndex(origins, {'group': 'Fabric'});
        // for(let key in apps) {
        //   if (apps[key] !== 'ACTIVE') {
        //     switch (key) {
        //       case 'com.nocsys.alert':
        //       case 'com.nocsys.healthycheck':
        //         let alertIndex = this.di._.findIndex(origins, {'group': 'Alert'});
        //         if (alertIndex > -1) origins.splice(alertIndex , 1);
        //         break;
        //       case 'com.nocsys.dhcpserver':
        //       case 'com.nocsys.dhcpv6server':
        //         if (dhcpserverState !== 'ACTIVE' && dhcpv6serverState !== 'ACTIVE') {
        //           let index0 = this.di._.findIndex(origins, {'group': 'Manage'});
        //           if (index0 > -1) {
        //             let dhcpIndex = this.di._.findIndex(origins[index0]['items'], {'url': '/dhcp'});
        //             if (dhcpIndex > -1) origins[index0]['items'].splice(dhcpIndex, 1);  
        //           }  
        //         }
        //         break;
        //       case 'com.nocsys.utility':
        //         let configIndex = this.di._.findIndex(origins, {'group': 'Config'});
        //         if (configIndex > -1) origins.splice(configIndex, 1);
        //         let logIndex = this.di._.findIndex(origins, {'group': 'Log'});
        //         if (logIndex > -1) origins.splice(logIndex, 1);
        //         let index1 = this.di._.findIndex(origins, {'group': 'Manage'});
        //         if (index1 > -1) {
        //           let elasticIndex = this.di._.findIndex(origins[index1]['items'], {'url': '/elasticsearch'});
        //           if (elasticIndex > -1) origins[index1]['items'].splice(elasticIndex, 1);    
        //         }
        //         break;
        //       case 'com.nocsys.tenant':
        //         let tenantIndex = this.di._.findIndex(origins, {'group': 'Logical'});
        //         if (tenantIndex > -1) origins.splice(tenantIndex , 1);
        //         break;
        //       case 'com.nocsys.endpoint':
        //         //let index2 = this.di._.findIndex(origins, {'group': 'Fabric'});
        //         if (fabricIndex > -1) {
        //           let endpointIndex = this.di._.findIndex(origins[fabricIndex]['items'], {'url': '/endpoints'});
        //           if (endpointIndex > -1) origins[fabricIndex]['items'].splice(endpointIndex, 1);  
        //         }
        //         break;
        //       case 'com.nocsys.topology':
        //         //let index3 = this.di._.findIndex(origins, {'group': 'Fabric'});
        //         if (fabricIndex > -1) {
        //           let uplinkIndex = this.di._.findIndex(origins[fabricIndex]['items'], {'url': '/uplinks'});
        //           if (uplinkIndex > -1) origins[fabricIndex]['items'].splice(uplinkIndex, 1);  
        //         }
        //         break;
        //       case 'com.nocsys.ntpserver':
        //         let index4 = this.di._.findIndex(origins, {'group': 'Manage'});
        //         if (index4 > -1) {
        //           let ntpIndex = this.di._.findIndex(origins[index4]['items'], {'url': '/ntp'});
        //           if (ntpIndex > -1) origins[index4]['items'].splice(ntpIndex, 1);  
        //         }
        //         break;
        //       case 'com.nocsys.egp':
        //         if (tenantState === 'ACTIVE') {
        //           let index5 = this.di._.findIndex(origins, {'group': 'Logical'});
        //           if (index5 > -1) {
        //             let egpIndex = this.di._.findIndex(origins[index5]['items'], {'url': '/egp'});
        //             if (egpIndex > -1) origins[index5]['items'].splice(egpIndex, 1);  
        //           }
        //         }
        //         break;
        //       case 'com.nocsys.qos':
        //         if (tenantState === 'ACTIVE') {
        //           let index6 = this.di._.findIndex(origins, {'group': "Fabric"});
        //           if (index6 > -1) {
        //             let qosIndex = this.di._.findIndex(origins[index6]['items'], {'url': '/qos'});
        //             if (qosIndex > -1) origins[index6]['items'].splice(qosIndex, 1);
        //           }
        //         }
        //         break;
        //       case 'com.nocsys.monitor':
        //         //let index7 = this.di._.findIndex(origins, {'group': 'Fabric'});
        //         if (fabricIndex > -1) {
        //           let endpointIndex = this.di._.findIndex(origins[fabricIndex]['items'], {'url': '/monitor'});
        //           if (endpointIndex > -1) origins[fabricIndex]['items'].splice(endpointIndex, 1);
        //         }
        //         break;

        //       case 'com.nocsys.storm-control':
        //         //let index8 = this.di._.findIndex(origins, {'group': 'Fabric'});
        //         if (fabricIndex > -1) {
        //           let endpointIndex = this.di._.findIndex(origins[fabricIndex]['items'], {'url': '/storm_control'});
        //           if (endpointIndex > -1) origins[fabricIndex]['items'].splice(endpointIndex, 1);
        //         }
        //         break;
        //       case 'com.nocsys.logicalport':
        //         //let index9 = this.di._.findIndex(origins, {'group': 'Fabric'});
        //         if (fabricIndex > -1) {
        //           let endpointIndex = this.di._.findIndex(origins[fabricIndex]['items'], {'url': '/logical_port'});
        //           if (endpointIndex > -1) origins[fabricIndex]['items'].splice(endpointIndex, 1);
        //         }
        //         break;
        //       case 'com.nocsys.sflow':
        //         //let index10 = this.di._.findIndex(origins, {'group': 'Fabric'});
        //         if (fabricIndex > -1) {
        //           let sflowIndex = this.di._.findIndex(origins[fabricIndex]['items'], {'url': '/sflows'});
        //           if (sflowIndex > -1) origins[fabricIndex]['items'].splice(sflowIndex, 1);
        //         }
        //         break;
        //       case 'com.nocsys.analyzer':
        //         let index8 = this.di._.findIndex(origins, {'group': 'Manage'});
        //         if (index8 > -1) {
        //           let anaIndex = this.di._.findIndex(origins[index8]['items'], {'url': '/analyzer'});
        //           if (anaIndex > -1) origins[index8]['items'].splice(anaIndex, 1);

        //           // let ntpIndex = this.di._.findIndex(origins[index4]['items'], {'url': '/ntp'});
        //           // if (ntpIndex > -1) origins[index4]['items'].splice(ntpIndex, 1);
        //         }
        //         break;
        //       case 'com.nocsys.topologyl3':
        //         if (fabricIndex > -1) {
        //           let hostsegmentIndex = this.di._.findIndex(origins[fabricIndex]['items'], {'url': '/host_segment'});
        //           if (hostsegmentIndex > -1) origins[fabricIndex]['items'].splice(hostsegmentIndex, 1);
        //         }
        //         break;
        //       case 'com.nocsys.vlanmgmt':
        //         let vlanMgmtIndex = this.di._.findIndex(origins, {'group': 'Vlan'});
        //         if (vlanMgmtIndex > -1) origins.splice(vlanMgmtIndex , 1);
        //         break;
                
        //     }
        //   }
        // }
        // if (!tenantState) {
        //   let logicalIndex = this.di._.findIndex(origins, {'group': 'Logical'});
        //   if (logicalIndex > -1) origins.splice(logicalIndex , 1);
        // }

        for (let i = 0, j = this.scope.menus.groups.length; i < j; i++) {
          
          let needDeletes = [];
          for (let x = 0, y = this.scope.menus.groups[i].items.length - 1; x <= y; x++) {
            let item = this.scope.menus.groups[i].items[x],
                state = true;
            if (menuMapping[item.url]) {
              for(let m = 0, n = menuMapping[item.url].length; m < n; m++) {
                if(apps[menuMapping[item.url][m]]){
                  if(apps[menuMapping[item.url][m]] !== 'ACTIVE'){
                    state = false;
                    break;
                  }
                } 
                else {
                  state = false;
                  break;
                }
              }
            }
            if (!state) {
              needDeletes.push(item['url'])
            }
          }
          if(needDeletes.length > 0){
            origins[i]['items'] = origins[i]['items'].filter( item =>{
              return needDeletes.indexOf(item['url']) === -1;
            })
          }
      

        }
        for (let i = origins.length - 1; i >= 0; i--) {
          if (origins[i]['items'].length === 0) {
            origins.splice(i, 1);
          }
        }
        this.scope.menues = origins;

        setTimeout(function () {
          let aList = document.querySelectorAll('.header_ripple');
          aList.forEach(surface=>new MDCRipple(surface))
        },100);
      }
    });
  }
  
  formatMessage(message) {
    let msg = {};
    let devices = this.devices;
    let srcArr, srcPort, srcDevice, dstArr, dstPort, dstDevice;
    
    msg.uuid = message.uuid;
    msg.isRead = message.isRead;
    msg.time = message.time;
    msg.title = '';
    
    function getDeviceName (deviceId) {
      let device = devices.find((val) => {
        return val.id === deviceId
      })
      
      if(device && device.name) {
        return device.name
      } else {
        return deviceId
      }
    }
    
    switch(message.event) {
      case 'portState':
        if(message.payload.link == 'up') {
          msg.title += this.translate('MODULE.HEADER_INFO.PORT_START') + ' - ';
        } else {
          msg.title += this.translate('MODULE.HEADER_INFO.PORT_CLOSE') + ' - ';
        }
        
        msg.title += getDeviceName(message.payload.device) + ':' + message.payload.port;
        msg.path = {
          url: '/devices/' + message.payload.device,
          query: {port:message.payload.port}
        };
        break;
      case 'linkAdded':
        srcArr = message.payload.src.split(':');
        srcPort = srcArr[srcArr.length - 1];
        srcDevice = message.payload.src.slice(0, message.payload.src.length - srcPort.length - 1);
        
        dstArr = message.payload.dst.split(':');
        dstPort = dstArr[dstArr.length - 1];
        dstDevice = message.payload.dst.slice(0, message.payload.dst.length - dstPort.length - 1);
        msg.title += this.translate('MODULE.HEADER_INFO.ADD') + 'link - ' + getDeviceName(srcDevice) + ' >> ' + getDeviceName(dstDevice);
        msg.path = {
          url: '/devices/' + srcDevice,
          query: {link_port: srcPort}
        };
        break;
      case 'linkRemoved':
        srcArr = message.payload.src.split(':');
        srcPort = srcArr[srcArr.length - 1];
        srcDevice = message.payload.src.slice(0, message.payload.src.length - srcPort.length - 1);
        
        dstArr = message.payload.dst.split(':');
        dstPort = dstArr[dstArr.length - 1];
        dstDevice = message.payload.src.slice(0, message.payload.dst.length - dstPort.length - 1);
        msg.title += this.translate('MODULE.HEADER_INFO.REMOVE') + 'link - ' + getDeviceName(srcDevice) + ' >> ' + getDeviceName(dstDevice);
        msg.path = {
          url: false,
          query: {}
        };
        break;
      case 'overThreshold':
        msg.title += this.translate('MODULE.HEADER_INFO.ALERT') + ' - ' + message.payload.rule_name + ':' + message.payload.msg;
        msg.path = {
          url: '/alert',
          query: {uuid: message.payload.uuid}
        };
        break;
      case 'deviceAdded':
        msg.title += this.translate('MODULE.HEADER_INFO.ADD_DEVICE') + ' - ' + getDeviceName(message.payload.device);
        msg.path = {
          url: '/devices/' + message.payload.device,
          query: {}
        };
        break;
      case 'deviceUpdated':
        msg.title += this.translate('MODULE.HEADER_INFO.UPDATE_DEVICE') +' - ' + getDeviceName(message.payload.device);
        msg.path = {
          url: '/devices/' + message.payload.device,
          query: {}
        };
        break;
      case 'deviceRemoved':
        msg.title += this.translate('MODULE.HEADER_INFO.RM_DEVICE') +' - ' + getDeviceName(message.payload.device);
        msg.path = {
          url: false,
          query: {}
        };
        break;
      default:
        msg.title += this.translate('MODULE.HEADER_INFO.UNKNOWN_MSG');
        msg.path = {
          url: false,
          query: {}
        };
    }
    
    return msg;
  }

  changeSelectedMenuItem(selectedUrl) {
    if (selectedUrl !== '/dashboard' && selectedUrl !== '/logout') {
      let ulNodes = document.querySelector('.navbar-inner__nav') && document.querySelector('.navbar-inner__nav').children || [];
      for (let i = 0, l = ulNodes.length; i < l; i++) {
        if (ulNodes[i].classList.contains('selected')) ulNodes[i].classList.remove('selected');
        let liNodes = ulNodes[i].querySelectorAll('li>a');
        for (let j = 0, m = liNodes.length; j < m; j++) {
          let url = liNodes[j].attributes['data-url'] && liNodes[j].attributes['data-url'].value;
          if (selectedUrl === url) {
            ulNodes[i].classList.add('selected');
            liNodes[j].classList.add('selected');
          }
        }
      }
    }
  }
}

headerController.$inject = headerController.getDI();
headerController.$$ngIsClass = true;
export class DeviceWizardController {
  static getDI() {
    return [
      '$scope',
      '$rootScope',
      '$log',
      '$q',
      '$timeout',
      '_',
      '$http',
      'appService',
      'deviceDataManager'
    ];
  }

  constructor(...args) {
    this.di = {};
    DeviceWizardController.getDI().forEach((value, index) => {
      this.di[value] = args[index];
    });
    
    let unsubscribes = [];
    const scope = this.di.$scope;
    const deviceDataManager = this.di.deviceDataManager;
    const rootScope = this.di.$rootScope;

    scope.protocolDisplayLabel = {
      options: [
        {label: 'OpenFlow', value: 'of'},
        {label: 'SNMP', value: 'snmp'},
        {label: 'REST', value: 'rest'},
        {label: 'GRPC', value: 'grpc'}
      ]
    };

    let initSwitch = {
      id: '',
      mac_address: '',
      name: '',
      rack_id: '',
      mfr: '',
      available: true,
      fabric_role: 'unknown',
      leaf_group: '',
      managementAddress: '',
      port: '',
      protocol: scope.protocolDisplayLabel.options[0],
      description: ''
    };

    scope.showWizard = false;
    scope.mode = 'add'; // 'add': add a new switch | 'update': update the switch
    scope.title = '添加交换机';
    scope.steps = [
      {
        id: 'step1',
        title: 'Info',
        content: require('../template/device_wizard.html'),
      },
    ];
  
    // init form data
    scope.switch = _.cloneDeep(initSwitch);
    
    // TODO: init mac&ip bindings
    scope.mac_addresses = [];
    scope.ip_addresses = ['1.1.1.1','2.2.2.2','3.3.3.3','4.4.4.4','5.5.5.5'];
    scope.mac_ip_bindings = {}
    
    let ipv4_regex = '^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$';
    let ipv6_regex = '((^\\s*((([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5]))\\s*$)|(^\\s*((([0-9A-Fa-f]{1,4}:){7}([0-9A-Fa-f]{1,4}|:))|(([0-9A-Fa-f]{1,4}:){6}(:[0-9A-Fa-f]{1,4}|((25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]?\\d)(\\.(25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]?\\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){5}(((:[0-9A-Fa-f]{1,4}){1,2})|:((25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]?\\d)(\\.(25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]?\\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){4}(((:[0-9A-Fa-f]{1,4}){1,3})|((:[0-9A-Fa-f]{1,4})?:((25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]?\\d)(\\.(25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]?\\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){3}(((:[0-9A-Fa-f]{1,4}){1,4})|((:[0-9A-Fa-f]{1,4}){0,2}:((25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]?\\d)(\\.(25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]?\\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){2}(((:[0-9A-Fa-f]{1,4}){1,5})|((:[0-9A-Fa-f]{1,4}){0,3}:((25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]?\\d)(\\.(25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]?\\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){1}(((:[0-9A-Fa-f]{1,4}){1,6})|((:[0-9A-Fa-f]{1,4}){0,4}:((25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]?\\d)(\\.(25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]?\\d)){3}))|:))|(:(((:[0-9A-Fa-f]{1,4}){1,7})|((:[0-9A-Fa-f]{1,4}){0,5}:((25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]?\\d)(\\.(25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]?\\d)){3}))|:)))(%.+)?\\s*$))';
    scope.mac_regex = '^([A-Fa-f0-9]{2}:){5}[A-Fa-f0-9]{2}$';  // MAC Address regex for validation
    scope.ip_regex = `(${ipv4_regex}|${ipv6_regex})`;
    scope.num_regex = '^\d$|^[1-9]+[0-9]*$';
  
    // scope.protocols = ['REST', 'SNMP', 'GRPC', 'Openflow'];
    scope.protocols = ['of' ,'snmp', 'rest', 'grpc'];

    scope.open = function(deviceId){
      if(scope.showWizard) return;
      
      // 'update' mode
      if(deviceId) {
        scope.mode = 'update';

        deviceDataManager.getDeviceConfig(deviceId)
          .then((res)=>{
            if(res) {
              const device = res;

              scope.switch = {
                id: device.id,
                mac_address: device.mac,
                // description: 'test',
                available: device.available,
                fabric_role: device.type,
                leaf_group: device.leafGroup,
                rack_id: device.rack_id,
                mfr: device.mfr,
                community: device.community,
                name: device.name,
                managementAddress: device.mgmtIpAddress,
                port: device.port,
                protocol: device.protocol,
              };

              scope.showWizard = true;
            }
          });

        // deviceDataManager.getDeviceDetail(deviceId)
        //   .then((res) => {
        //     if(res) {
        //       const device = res.data;
        //       let port = device.annotations.channelId ? device.annotations.channelId.split(':')[1] : '';
        //
        //       scope.switch = {
        //         id: device.id,
        //         mac_address: device.mac,
        //         description: 'test',
        //         available: device.available,
        //         fabric_role: device.type,
        //         leaf_group: device.leaf_group,
        //         rack_id: device.rack_id,
        //         mfr: device.mfr,
        //         community: device.community,
        //         name: device.annotations.name,
        //         managementAddress: device.annotations.managementAddress,
        //         port: parseInt(port),
        //         protocol: device.annotations.protocol,
        //       }
        //
        //       scope.showWizard = true;
        //     }
        //   });
      } else { // 'add' mode
        scope.mode = 'add';
        scope.switch = _.cloneDeep(initSwitch);
        scope.showWizard = true;
      }
      
      // init mac&ip bindings
      scope.mac_ip_bindings = {}
      scope.mac_addresses = []
      scope.ip_addresses = []
      deviceDataManager.getMacAndIpBindings()
        .then((res) => {
          res.mappings.forEach((bind) => {
            // "host": "70:72:CF:6A:A8:D8/None"
            let mac = bind.host.slice(0,17)
            scope.mac_ip_bindings[mac] = bind.ip
            scope.mac_addresses.push(mac)
            scope.ip_addresses.push(bind.ip)
          })
        })
      
    }
    
    scope.stepValidation = function(curStep, nextStep) {
      return {
        valid: true,
        errorMessage: ''
      }
    }
    
    scope.cancel = function(formData){
      return new Promise((resolve, reject) => {
        resolve({valid: true, errorMessage: ''});
      });
    }
  
    scope.submit = function() {
      let params = {
        id: scope.switch.id,
        mac: scope.switch.mac_address,
        name: scope.switch.name,
        type: scope.switch.fabric_role,
        available: scope.switch.available,
        // leaf_group: scope.switch.leaf_group,
        rack_id: scope.switch.rack_id,
        mfr: scope.switch.mfr,
        // community: scope.switch.community,
        managementAddress: scope.switch.managementAddress,
        port: scope.switch.port,
        protocol: scope.switch.protocol.value,
      };
      
      return new Promise((resolve, reject) => {
        if(scope.mode == 'update') { // update switch config
          deviceDataManager.putDeviceDetail(params)
            .then(() => {
              scope.switch = _.cloneDeep(initSwitch);
              rootScope.$emit('device-list-refresh');
              resolve({valid: true, errorMessage: ''});
            }, (err) => {
              // scope.switch = _.cloneDeep(initSwitch);
              resolve({valid: false, errorMessage: err});
            });
        } else { // add a new switch
          // generate device id
          let deviceId = '';
          switch (params.protocol.toLowerCase()) {
            case 'rest':
              params.id = `rest:${params.managementAddress}:${params.port}`;
              break;
              
            case 'snmp':
              params.id = `snmp:${params.managementAddress}:${params.port}`;
              params.community = scope.switch.community;
              break;

            case 'grpc':
              params.id = `gnmi:${params.managementAddress}:${params.port}`;
              break;
              
            case 'of':
              params.id = `of:0000${(params.mac.split(':')).join('')}`;
              delete params.port;
              break;
          }
          deviceDataManager.postDeviceDetail(params)
            .then(() => {
              scope.switch = _.cloneDeep(initSwitch);
              rootScope.$emit('device-list-refresh');
              resolve({valid: true, errorMessage: ''});
            }, (err) => {
              // scope.switch = _.cloneDeep(initSwitch);
              resolve({valid: false, errorMessage: err});
            });
        }
      });
    }
  
    unsubscribes.push(scope.$watch('mode', (newMode, oldMode) => {
      if(newMode == 'update') {
        scope.title = '修改交换机配置';
      }
    }));

    unsubscribes.push(scope.$watch('switch.protocol', (newPro, oldPro) => {
      if(newPro.value == 'rest') {
        scope.switch.mfr = 'Accton';
      }
    }));
  
    unsubscribes.push(scope.$watch('switch.mac_address', (newMac, oldMac) => {
      if(newMac == oldMac) return
  
      scope.ip_addresses = [];
      let macs = Object.keys(scope.mac_ip_bindings)
      for(let mac of macs) {
        if(mac.indexOf(newMac) != -1) {
          scope.ip_addresses.push(scope.mac_ip_bindings[mac])
        }
      }
    }));
  
    unsubscribes.push(scope.$watch('switch.managementAddress', (newIp, oldIp) => {
      if(newIp == oldIp) return
  
      scope.mac_addresses = [];
      let macs = Object.keys(scope.mac_ip_bindings)
      for(let mac of macs) {
        if(scope.mac_ip_bindings[mac].indexOf(newIp) != -1) {
          scope.mac_addresses.push(mac)
        }
      }
    }));
    
    unsubscribes.push(this.di.$rootScope.$on('switch-wizard-show', ($event, deviceId) => {
      scope.open(deviceId);
    }));
    
    scope.$on('$destroy', () => {
      unsubscribes.forEach((cb) => {
        cb();
      })
    })
  }
}

DeviceWizardController.$inject = DeviceWizardController.getDI();
DeviceWizardController.$$ngIsClass = true;


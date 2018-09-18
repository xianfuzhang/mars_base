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
  
    let initSwitch = {
      id: '',
      mac_address: '',
      name: '',
      rack_id: '',
      mfr: '',
      admin_status: false,
      fabric_role: 'unknown',
      leaf_group: '',
      managementAddress: '',
      port: '',
      protocol: '',
      description: ''
    }
  
    this.di.$scope.showWizard = false;
    this.di.$scope.mode = 'add'; // 'add': add a new switch | 'update': update the switch
    this.di.$scope.title = '添加交换机';
    this.di.$scope.steps = [
      {
        id: 'step1',
        title: 'Info',
        content: require('../template/step1.html'),
      },
      // {
      //   id: 'second',
      //   title: 'Clock',
      //   content: require('../template/step2.html')
      // },
      // {
      //   id: 'third',
      //   title: 'SNP',
      //   content: require('../template/step3.html')
      // },
      // {
      //   id: 'fourth',
      //   title: 'SNP Traps',
      //   content: require('../template/step4.html')
      // },
      // {
      //   id: 'fifth',
      //   title: 'Logging',
      //   content: require('../template/step5.html')
      // },
    ];
  
    // init form data
    this.di.$scope.switch = _.cloneDeep(initSwitch);
    
    this.di.$scope.mac_regex = '^([A-Fa-f0-9]{2}:){5}[A-Fa-f0-9]{2}$';  // MAC Address regex for validation
    this.di.$scope.ip_regex = '^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$';
    this.di.$scope.num_regex = '^\d$|^[1-9]+[0-9]*$';
    
    this.di.$scope.mac_addresses = [
      '00:00:00:02:00:01',
      '00:00:00:02:00:02',
      '00:00:00:02:00:03',
      '00:00:00:02:00:04',
      '00:00:00:02:00:05',
      '00:00:00:02:00:06'
    ];
  
    this.di.$scope.protocols = ['Rest', 'gRPC', 'SNMP', 'OF_13'];
    
    // this.di.$scope.leaf_groups = [
    //   'R1L1', 'R1L2', 'R1L3', 'R2L1', 'R2L2', 'R2L3'
    // ];
    
    this.di.$scope.open = function(deviceId){
      if(scope.showWizard) return;
      
      // 'update' mode
      if(deviceId) {
        scope.mode = 'update';
        deviceDataManager.getDeviceDetail(deviceId)
          .then((res) => {
            if(res) {
              const device = res.data;
              let port = device.annotations.channelId ? device.annotations.channelId.split(':')[1] : '';
              
              scope.switch = {
                id: device.id,
                mac_address: device.mac,
                description: 'test',
                admin_status: device.available,
                fabric_role: device.type,
                leaf_group: device.leaf_group,
                rack_id: device.rack_id,
                mfr: device.mfr,
                community: device.community,
                name: device.annotations.name,
                managementAddress: device.annotations.managementAddress,
                port: parseInt(port),
                protocol: device.annotations.protocol,
              }
  
              scope.showWizard = true;
            }
          });
      } else { // 'add' mode
        scope.mode = 'add';
        scope.switch = _.cloneDeep(initSwitch);
        scope.showWizard = true;
      }
    }
    
    this.di.$scope.stepValidation = function(curStep, nextStep) {
      // TODO:
      // if(scope.switch.name) {
      //   return {
      //     valid: true,
      //     errorMessage: ''
      //   }
      // } else {
      //   return {
      //     valid: false,
      //     errorMessage: 'Name error'
      //   }
      // }
  
      return {
        valid: true,
        errorMessage: ''
      }
    }
    
    this.di.$scope.cancel = function(formData){
      return new Promise((resolve, reject) => {
        resolve({valid: true, errorMessage: ''});
      });
    }
  
    this.di.$scope.submit = function() {
      let params = {
        deviceId: scope.switch.id,
        mac: scope.switch.mac_address,
        name: scope.switch.name,
        type: scope.switch.fabric_role,
        available: scope.switch.admin_status,
        leaf_group: scope.switch.leaf_group,
        rack_id: scope.switch.rack_id,
        mfr: scope.switch.mfr,
        community: scope.switch.community,
        managementAddress: scope.switch.managementAddress,
        port: scope.switch.port,
        protocol: scope.switch.protocol,
      }
      
      return new Promise((resolve, reject) => {
        if(scope.mode == 'update') { // update switch config
          deviceDataManager.putDeviceDetail(params)
            .then(() => {
              scope.switch = _.cloneDeep(initSwitch);
              rootScope.$emit('device-list-refresh');
              resolve({valid: true, errorMessage: ''});
            }, () => {
              scope.switch = _.cloneDeep(initSwitch);
              resolve({valid: false, errorMessage: 'Error occurred!'});
            });
        } else { // add a new switch
          deviceDataManager.postDeviceDetail(params)
            .then(() => {
              scope.switch = _.cloneDeep(initSwitch);
              rootScope.$emit('device-list-refresh');
              resolve({valid: true, errorMessage: ''});
            }, () => {
              scope.switch = _.cloneDeep(initSwitch);
              resolve({valid: false, errorMessage: 'Error occurred!'});
            });
        }
      });
    }
  
    unsubscribes.push(this.di.$scope.$watch('mode', (newMode, oldMode) => {
      if(newMode == 'update') {
        scope.title = '修改交换机配置';
      }
    }));
    
    unsubscribes.push(this.di.$rootScope.$on('switch-wizard-show', ($event, deviceId) => {
      scope.open(deviceId);
    }));
    
    this.di.$scope.$on('$destroy', () => {
      unsubscribes.forEach((cb) => {
        cb();
      })
    })
  }
}

DeviceWizardController.$inject = DeviceWizardController.getDI();
DeviceWizardController.$$ngIsClass = true;


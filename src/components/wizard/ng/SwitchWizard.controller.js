export class SwitchWizardController {
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
    SwitchWizardController.getDI().forEach((value, index) => {
      this.di[value] = args[index];
    });
    
    let unsubscribes = [];
    const deviceDataManager = this.di.deviceDataManager;
    
    let initSwitch = {
      id: '',
      mac_address: '',
      name: '',
      description: '',
      admin_status: false,
      fabric_role: 'unknown',
      leaf_group: ''
    }
  
    this.di.$scope.showWizard = false;
    this.di.$scope.mode = 'add'; // 'add': add a new switch | 'update': update the switch
    this.di.$scope.title = '添加交换机';
    this.di.$scope.steps = [
      {
        id: 'step1',
        title: 'Info',
        content: require('../template/switch/step1.html'),
      },
      // {
      //   id: 'second',
      //   title: 'Clock',
      //   content: require('../template/switch/step2.html')
      // },
      // {
      //   id: 'third',
      //   title: 'SNP',
      //   content: require('../template/switch/step3.html')
      // },
      // {
      //   id: 'fourth',
      //   title: 'SNP Traps',
      //   content: require('../template/switch/step4.html')
      // },
      // {
      //   id: 'fifth',
      //   title: 'Logging',
      //   content: require('../template/switch/step5.html')
      // },
    ];
  
    // init form data
    this.di.$scope.switch = _.cloneDeep(initSwitch);
    
    this.di.$scope.mac_regex = '^([A-F0-9]{2}:){5}[A-F0-9]{2}$';  // MAC Address regex for validation
    this.di.$scope.ip_regex = '/\\b(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\b/';
    
    this.di.$scope.mac_addresses = [
      '00:00:00:02:00:01',
      '00:00:00:02:00:02',
      '00:00:00:02:00:03',
      '00:00:00:02:00:04',
      '00:00:00:02:00:05',
      '00:00:00:02:00:06'
    ];
  
    this.di.$scope.protocols = ['Rest', 'gRPC', 'SNMP', 'OF_13'];
    
    this.di.$scope.leaf_groups = [
      'R1L1', 'R1L2', 'R1L3'
    ];
    
    let scope = this.di.$scope;
    
    this.di.$scope.upper = function(mac) {
      scope.switch.mac_address = mac.toUpperCase();  // Make every character uppercase
    }
    
    this.di.$scope.open = function(deviceId){
      if(scope.showWizard) return;
      
      // 'update' mode
      if(deviceId) {
        scope.mode = 'update';
        deviceDataManager.getDeviceDetail(deviceId)
          .then((res) => {
            if(res) {
              const device = res.data;
              scope.switch = {
                id: device.id,
                mac_address: device.mac,
                name: device.annotations.name,
                description: 'test',
                admin_status: device.available,
                fabric_role: device.type,
                leaf_group: device.leaf_group
              }
  
              scope.showWizard = true;
            }
          });
      } else { // 'add' mode
        scope.switch = _.cloneDeep(initSwitch);
        scope.showWizard = true;
      }
    }
    
    this.di.$scope.cancel = function(formData){
      return true;
    }
  
    const rootScope = this.di.$rootScope;
    this.di.$scope.submit = function() {
      let params = {
        deviceId: scope.switch.id,
        mac: scope.switch.mac_address,
        name: scope.switch.name,
        type: scope.switch.fabric_role,
        available: scope.switch.admin_status,
        leaf_group: scope.switch.leaf_group
      }
      
      // TODO:
      return new Promise((resolve, reject) => {
        if(scope.mode == 'update') { // update switch config
          deviceDataManager.putDeviceDetail(params)
            .then(() => {
              scope.switch = _.cloneDeep(initSwitch);
              rootScope.$emit('device-list-refresh');
              resolve(true);
            }, () => {
              scope.switch = _.cloneDeep(initSwitch);
              resolve(false);
            });
        } else { // add a new switch
          deviceDataManager.postDeviceDetail(params)
            .then(() => {
              scope.switch = _.cloneDeep(initSwitch);
              rootScope.$emit('device-list-refresh');
              resolve(true);
            }, () => {
              scope.switch = _.cloneDeep(initSwitch);
              resolve(false);
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

SwitchWizardController.$inject = SwitchWizardController.getDI();
SwitchWizardController.$$ngIsClass = true;


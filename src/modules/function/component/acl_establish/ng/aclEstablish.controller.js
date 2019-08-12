export class AclEstablishController {
  static getDI() {
    return [
      '$scope',
      '$rootScope',
      '$filter',
      '$log',
      '$q',
      '$timeout',
      '_',
      '$http',
      'appService',
      'deviceDataManager',
      'functionDataManager'
    ];
  }

  constructor(...args) {
    this.di = {};
    AclEstablishController.getDI().forEach((value, index) => {
      this.di[value] = args[index];
    });

    let unsubscribes = [];
    const scope = this.di.$scope;
    const deviceDataManager = this.di.deviceDataManager;
    const functionDataManager = this.di.functionDataManager;
    const rootScope = this.di.$rootScope;

    this.translate = this.di.$filter('translate')
    // initial acl
    let initialAcl = {
      "device": "",
      "port": "",
      "direction": true,
      "action": "permit",
      "mac": {
        "srcMac": "",
        "dstMac": "",
        "etherType": "",
        "vid": ""
      },
      "ipv4": {
        "protocol": '',
        "srcIp": "",
        "dstIp": "",
        "srcPort": '',
        "dstPort": ''
      }
    }

    scope.showWizard = false;
    scope.mode = 'add'; // 'add': add a new acl | 'update': update the acl
    scope.deviceChangable = true;
    scope.title = this.translate('COMPONENT.ACLWIZARD.TITLE.CREATE_ACL');
    scope.permitRadioOption = {
      id: 'check_1',
      label: this.translate("COMPONENT.ACLWIZARD.INPUT.ACTION.PERMIT"),
      name: 'action',
      value: 'permit'
    }
    scope.denyRadioOption = {
      id: 'check_2',
      label: this.translate("COMPONENT.ACLWIZARD.INPUT.ACTION.DENY"),
      name: 'action',
      value: 'deny'
    }
    scope.macRuleDisplayLabel = {
      id: 'mac_rule',
      label: this.translate('COMPONENT.ACLWIZARD.INPUT.RULE.MAC')
    }
    scope.ipRuleDisplayLabel = {
      id: 'ip_rule',
      label: this.translate('COMPONENT.ACLWIZARD.INPUT.RULE.IP'),
    }
    scope.steps = [
      {
        id: 'step1',
        title: 'Info',
        content: require('../template/acl_wizard.html'),
      },
    ];

    // init form data
    let ipv4_regex = '^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$';
    // let ipv6_regex = '((^\\s*((([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5]))\\s*$)|(^\\s*((([0-9A-Fa-f]{1,4}:){7}([0-9A-Fa-f]{1,4}|:))|(([0-9A-Fa-f]{1,4}:){6}(:[0-9A-Fa-f]{1,4}|((25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]?\\d)(\\.(25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]?\\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){5}(((:[0-9A-Fa-f]{1,4}){1,2})|:((25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]?\\d)(\\.(25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]?\\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){4}(((:[0-9A-Fa-f]{1,4}){1,3})|((:[0-9A-Fa-f]{1,4})?:((25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]?\\d)(\\.(25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]?\\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){3}(((:[0-9A-Fa-f]{1,4}){1,4})|((:[0-9A-Fa-f]{1,4}){0,2}:((25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]?\\d)(\\.(25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]?\\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){2}(((:[0-9A-Fa-f]{1,4}){1,5})|((:[0-9A-Fa-f]{1,4}){0,3}:((25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]?\\d)(\\.(25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]?\\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){1}(((:[0-9A-Fa-f]{1,4}){1,6})|((:[0-9A-Fa-f]{1,4}){0,4}:((25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]?\\d)(\\.(25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]?\\d)){3}))|:))|(:(((:[0-9A-Fa-f]{1,4}){1,7})|((:[0-9A-Fa-f]{1,4}){0,5}:((25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]?\\d)(\\.(25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]?\\d)){3}))|:)))(%.+)?\\s*$))';
    scope.mac_regex = '^([A-Fa-f0-9]{2}:){5}[A-Fa-f0-9]{2}$';  // MAC Address regex for validation
    // scope.ip_regex = `(${ipv4_regex}|${ipv6_regex})`;
    scope.ip_regex = ipv4_regex;
    scope.num_regex = '^\d$|^[1-9]+[0-9]*$';
    scope.protocols = ['of' ,'snmp', 'rest', 'grpc'];

    scope.model = {
      selectedDevice: null,
      selectedPort: null,
    }

    scope.open = function(mode, param){
      if(scope.showWizard) return;

      deviceDataManager.getDeviceConfigs()
        .then((res)=>{
          let devices = res;
          let deviceOptions = []

          devices.forEach((item) => {
            // this.scope.model.devicesMap[item.id] = item.name;
            deviceOptions.push({label: item.name, value: item.id})
          })

          scope.deviceOptions = deviceOptions;
          // 'update' mode
          if(mode == 'update') {
            scope.mode = 'update';
            scope.deviceChangable = true;
            scope.acl = _.cloneDeep(param);

            let foundDevice = deviceOptions.find((device) => {
              return device.value === param.device
            })

            scope.model.selectedDevice = foundDevice;
          } else { // 'add' mode
            scope.mode = 'add';
            scope.deviceChangable = false;
            scope.acl = _.cloneDeep(initialAcl)

            if(param && typeof param == 'string') {
              scope.acl.device = param;

              let foundDevice = deviceOptions.find((device) => {
                return device.value === param
              })

              scope.model.selectedDevice = foundDevice;
            } else {
              scope.model.selectedDevice = deviceOptions[0]
            }
          }

          scope.showWizard = true;
        });
    }

    scope.stepValidation = (curStep, nextStep) => {
      return {
        valid: true,
        errorMessage: ''
      }
    }

    scope.cancel = (formData) => {
      return new Promise((resolve, reject) => {
        resolve({valid: true, errorMessage: ''});
      });
    }

    scope.submit = () => {
      let params = {
        "device": scope.acl.device,
        "port": scope.acl.port,
        "direction": scope.acl.direction,
        "action": scope.acl.action,
        "mac": {
          "srcMac": scope.acl.mac.srcMac,
          "dstMac": scope.acl.mac.dstMac,
          "etherType": scope.acl.mac.etherType,
          "vid": scope.acl.mac.vid,
        },
        "ipv4": {
          "protocol": scope.acl.ipv4.protocol,
          "srcIp": scope.acl.ipv4.srcIp,
          "dstIp": scope.acl.ipv4.dstIp,
          "srcPort": scope.acl.ipv4.srcPort,
          "dstPort": scope.acl.ipv4.dstPort,
        }
      };

      return new Promise((resolve, reject) => {
        if(scope.mode == 'update') { // update acl config
          // TODO:
        } else { // add a new acl
          functionDataManager.postAcl(params)
            .then(() => {
              scope.acl = _.cloneDeep(initialAcl);
              rootScope.$emit('acl-list-refresh');
              resolve({valid: true, errorMessage: ''});
            }, (err) => {
              // scope.switch = _.cloneDeep(initSwitch);
              resolve({valid: false, errorMessage: this.di.$filter('translate')('COMPONENT.ACLWIZARD.SAVE_FAIL')});
            });
        }
      });
    }

    unsubscribes.push(scope.$watch('mode', (newMode, oldMode) => {
      if(newMode == 'update') {
        scope.title = this.di.$filter('translate')('COMPONENT.ACLWIZARD.TITLE.UPDATE_ACL') ;
      }
    }));

    unsubscribes.push(scope.$watch('model.selectedDevice', (newValue, oldValue) => {
      if(scope.model.selectedDevice) {
        // get device ports
        let portOptions = []
        deviceDataManager.getDevicePorts(scope.model.selectedDevice.value).then((res) => {
          let ports = res.data.ports;

          ports.forEach( (port) => {
            portOptions.push({label: port.annotations.portName, value: port.annotations.portName})
          })

          scope.portOptions = portOptions
          if(scope.mode == 'update') {
            let selectedPort = portOptions.find((item) => {
              return item.label == scope.acl.port
            })
            scope.model.selectedPort = selectedPort
          } else {
            scope.model.selectedPort = portOptions[0]
          }
        })
      }
    }));

    // unsubscribes.push(scope.$watch('switch.protocol', (newPro, oldPro) => {
    //   if(newPro.value == 'rest') {
    //     scope.switch.mfr = 'Accton';
    //   }
    // }));

    // unsubscribes.push(scope.$watch('switch.mac_address', (newMac, oldMac) => {
    //   if(newMac == oldMac) return
    //
    //   scope.ip_addresses = [];
    //   let macs = Object.keys(scope.mac_ip_bindings)
    //   for(let mac of macs) {
    //     if(mac.indexOf(newMac) != -1) {
    //       scope.ip_addresses.push(scope.mac_ip_bindings[mac])
    //     }
    //   }
    // }));

    unsubscribes.push(this.di.$rootScope.$on('acl-wizard-show', ($event, mode, param) => {
      scope.open(mode, param);
    }));

    scope.$on('$destroy', () => {
      unsubscribes.forEach((cb) => {
        cb();
      })
    })
  }
}

AclEstablishController.$inject = AclEstablishController.getDI();
AclEstablishController.$$ngIsClass = true;


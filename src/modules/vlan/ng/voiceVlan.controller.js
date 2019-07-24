export class VoiceVlanCtrl{
  static getDI() {
    return [
      '$scope',
      '$rootScope',
      '$q',
      '$filter',
      '$timeout',
      'roleService',
      '_',
      'modalManager',
      'vlanService',
      'dialogService',
      'notificationService',
      'tableProviderFactory',
      'vlanDataManager',
      'deviceDataManager'
    ];
  }
  constructor(...args) {
    this.di = {};
    VoiceVlanCtrl.getDI().forEach((value, index) => {
      this.di[value] = args[index];
    });

    this.translate = this.di.$filter('translate');
    this.scope = this.di.$scope;
    let scope = this.scope;
    const DI = this.di;

    this.scope.model = {
      devices: [],
      voiceVlanMap: {},
      'deviceMap': {},
      'voiceVlanMap': {},
      selectedDevice: null,
      'actionsShow': this.di.vlanService.getVoiceVlanTableActionsShow(),
      'rowActions': this.di.vlanService.getVoiceVlanTableRowActions(),
      'provider': null,
      'ouiActionsShow': this.di.vlanService.getVoiceVlanOuiTableActionsShow(),
      'ouiRowActions': this.di.vlanService.getVoiceVlanOuiTableRowActions(),
      'ouiProvider': null,
      'portActionsShow': this.di.vlanService.getVoiceVlanPortTableActionsShow(),
      'ouiRowActions': this.di.vlanService.getVoiceVlanPortTableRowActions(),
      'ouiProvider': null,
      changedPorts: []
    };
    this.scope.role = this.di.roleService.getRole();

    this.scope.entities = [],
      this.scope.ouiEntities = [],
        this.scope.portEntities = [];

    this.scope.onAPIReady = ($api) => {
      this.scope.model.API = $api;
    };

    this.scope.onOuiAPIReady = ($api) => {
      this.scope.model.ouiAPI = $api;
    };

    this.scope.onPortAPIReady = ($api) => {
      this.scope.model.portAPI = $api;
    };

    this.scope.addVoiceVlan = () => {
      let devices = [];
      let idArr = Object.keys(scope.model.voiceVlanMap);
      scope.model.devices.forEach((device) => {
        if(idArr.indexOf(device.id) == -1) {
          devices.push(device)
        }
      })

      DI.modalManager.open({
        template: require('../component/createVoiceVlan/template/createVoiceVlanDialog.html'),
        controller: 'createVoiceVlanCtrl',
        windowClass: 'voice-vlan-dialog-modal',
        resolve: {
          dataModel: () => {
            return {
              devices: devices
            }
          }
        }
      }).result.then((data) => {
        if(!data || data.canceled) {
          return;
        } else if (data && !data.canceled) {

          let params = {
            devices: [
              {
                "device-id": data.result.device_id,
                basic: {
                  vlan: data.result.vlan,
                  aging: data.result.aging,
                  status: data.result.status
                }
              }
            ]
          }
          this.di.vlanDataManager.postVoiceVlanConfig(params).then(() => {
            this.di.notificationService.renderSuccess(this.scope, this.translate("MODULES.VLAN.VOICE.TABLE.MESSAGE.ADD_VOICE_VLAN_SUCCESS"));
            scope.model.API.queryUpdate();
          }, () => {
            this.di.notificationService.renderWarning(this.scope, this.translate("MODULES.VLAN.VOICE.TABLE.MESSAGE.ADD_VOICE_VLAN_FAILED"));
          });
        }
      });
    };

    this.scope.addOui = () => {
      let devices = [];
      let idArr = Object.keys(scope.model.voiceVlanMap);
      scope.model.devices.forEach((device) => {
        if(idArr.indexOf(device.device_id) == -1) {
          devices.push(device)
        }
      })

      DI.modalManager.open({
        template: require('../component/createOui/template/createOuiDialog.html'),
        controller: 'createOuiCtrl',
        windowClass: 'voice-vlan-dialog-modal',
        resolve: {
          dataModel: () => {
            return {
              devices: devices
            }
          }
        }
      }).result.then((data) => {
        if(!data || data.canceled) {
          return;
        } else if (data && !data.canceled) {

          let params = {
            ouis: [
              {
                macAddress: data.result.macAddress,
                maskAddress: data.result.maskAddress,
                description: data.result.description
              }
            ]
          }
          this.di.vlanDataManager.postVoiceVlanConfigByDeviceId(scope.model.selectedDevice.device_id, params).then(() => {
            this.di.notificationService.renderSuccess(this.scope, this.translate("MODULES.VLAN.VOICE.TABLE.MESSAGE.ADD_VOICE_VLAN_SUCCESS"));
            scope.model.ouiAPI.queryUpdate();
          }, () => {
            this.di.notificationService.renderWarning(this.scope, this.translate("MODULES.VLAN.VOICE.TABLE.MESSAGE.ADD_VOICE_VLAN_FAIL"));
          });
        }
      });
    };

    this.scope.addPort = () => {
      let devices = [];
      let idArr = Object.keys(scope.model.voiceVlanMap);
      scope.model.devices.forEach((device) => {
        if(idArr.indexOf(device.device_id) == -1) {
          devices.push(device)
        }
      })

      DI.modalManager.open({
        template: require('../component/createPort/template/createPortDialog.html'),
        controller: 'createPortCtrl',
        windowClass: 'voice-vlan-dialog-modal',
        resolve: {
          dataModel: () => {
            return {
              device: scope.model.selectedDevice
            }
          }
        }
      }).result.then((data) => {
        if(!data || data.canceled) {
          return;
        } else if (data && !data.canceled) {

          let params = {
            ports: [
              {
                port: data.result.port,
                security: data.result.security,
                priority: data.result.priority,
                rule: data.result.rule,
                mode: data.result.mode,
              }
            ]
          }
          this.di.vlanDataManager.postVoiceVlanConfigByDeviceId(scope.model.selectedDevice.device_id, params).then(() => {
            this.di.notificationService.renderSuccess(this.scope, this.translate("MODULES.VLAN.VOICE.TABLE.MESSAGE.ADD_VOICE_PORT_SUCCESS"));
            scope.model.portAPI.queryUpdate();
          }, () => {
            this.di.notificationService.renderWarning(this.scope, this.translate("MODULES.VLAN.VOICE.TABLE.MESSAGE.ADD_VOICE_PORT_FAILED"));
          });
        }
      });
    };

    this.scope.savePort = () => {
      let params = {ports: []}
      scope.model.changedPorts.forEach((port) => {
        params.ports.push(port)
      })

      this.di.vlanDataManager.postVoiceVlanConfigByDeviceId(scope.model.selectedDevice.device_id, params).then(() => {
        scope.model.changedPorts = []
        this.di.notificationService.renderSuccess(this.scope, this.translate("MODULES.VLAN.VOICE.TABLE.MESSAGE.UPDATE_PORT_SUCCESS"));
      }, () => {
        this.scope.model.portAPI.queryUpdate();
        this.di.notificationService.renderWarning(this.scope, this.translate("MODULES.VLAN.VOICE.TABLE.MESSAGE.UPDATE_PORT_FAILED"));
      });
    }

    this.scope.batchRemoveVoiceVlan = (items) => {
      this.di.dialogService.createDialog('warning', this.translate("MODULES.VLAN.VOICE.DIALOG.BATCH_DELETE_VOICE_VLAN"))
        .then(() =>{
          this.batchDeleteVoiceVlans(items);
        }, () => {

        });
    };

    this.scope.batchRemoveOui = (items) => {
      if(this.scope.ouiEntities.length <= items.length) {
        this.di.notificationService.renderWarning(this.scope, this.translate("MODULES.VLAN.VOICE.TABLE.MESSAGE.BATCH_DELETE_OUI_WARNING"));
        return;
      }
      this.di.dialogService.createDialog('warning', this.translate("MODULES.VLAN.VOICE.DIALOG.BATCH_DELETE_OUI"))
        .then(() =>{
          this.batchDeleteOuis(items);
        }, () => {

        });
    };

    this.scope.batchRemovePort = (items) => {
      if(this.scope.portEntities.length <= items.length) {
        this.di.notificationService.renderWarning(this.scope, this.translate("MODULES.VLAN.VOICE.TABLE.MESSAGE.BATCH_DELETE_PORT_WARNING"));
        return;
      }
      this.di.dialogService.createDialog('warning', this.translate("MODULES.VLAN.VOICE.DIALOG.BATCH_DELETE_PORT"))
        .then(() =>{
          this.batchDeletePorts(items);
        }, () => {

        });
    };

    this.scope.onTableRowClick = ($event) => {
      this.scope.model.selectedDevice = this.scope.model.voiceVlanMap[$event.$data.device_id];
      this.scope.model.API.setSelectedRow($event.$data.device_id);
      this.scope.model.changedPorts = []

      this.scope.model.ouiAPI.queryUpdate()
      this.scope.model.portAPI.queryUpdate();
    };

    this.scope.onTableRowSelectAction = (event) => {
      if (event.action.value === 'disable' || event.action.value === 'enable') {
        let deviceId = event.data.device_id;
        let params = {
          'basic': {
            vlan: event.data.vlan,
            aging: event.data.aging,
            status: event.action.value
          }
        }

        this.di.vlanDataManager.postVoiceVlanConfigByDeviceId(deviceId, params).then(() => {
          this.scope.entities.forEach((entity) => {
            if(entity.device_id == event.data.device_id) {
              entity.status = event.action.value == 'enable' ? 'done' : 'not_interested';
            }
          })
          this.scope.model.API.update();
          this.di.notificationService.renderSuccess(this.scope, this.translate("MODULES.VLAN.VOICE.TABLE.MESSAGE.UPDATE_STATUS_SUCCESS"));
        }, (msg) => {
          this.di.notificationService.renderWarning(this.scope, this.translate("MODULES.VLAN.VOICE.TABLE.MESSAGE.UPDATE_STATUS_FAIL"));
        });
      }
    };

    this.scope.onTableRowActionsFilter = (event) => {
      let filterActions = [];
      if (event.data) {
        event.actions.forEach((action) =>{
          if (action.value === 'disable' && event.data.status == 'done') {
            filterActions.push(action);
          }

          if (action.value === 'enable' && event.data.status == 'not_interested') {
            filterActions.push(action);
          }
        });
      }
      return filterActions;
    };

    this.init();

    let unsubscribes = [];
    unsubscribes.push(this.di.$rootScope.$on('voice-vlan-list-refresh', () => {
      this.scope.model.API.queryUpdate();
    }));

    unsubscribes.push(this.scope.$on('td-select-change', (event, newValue) => {
      _handle_update_port(newValue);
    }, true));

    this.scope.$on('$destroy', () => {
      unsubscribes.forEach((cb) => cb());
    });

    // update port table's one row data
    let _handle_update_port = (newValue) =>{
      let deviceObj = scope.model.selectedDevice;
      if(!deviceObj) return;

      let entity = this.scope.portEntities.find((value) => {
        return value.port == newValue.trObject.port
      });

      let portObj = deviceObj.ports.find((port) => {
        return port.port == entity.port;
      })

      switch(newValue.column) {
        case 'security':
          entity.security = newValue.trObject.security;
          break;
        case 'rule':
          entity.rule = newValue.trObject.rule;
          break;
        case 'priority':
          entity.priority = newValue.trObject.priority;
          break;
        case 'mode':
          entity.mode = newValue.trObject.mode;
          break;
      }

      scope.model.portAPI.inlineFilter();
      scope.model.portAPI.update();

      let changedPort = _get_changed_port(portObj, entity);
      let index = scope.model.changedPorts.findIndex((port) => {
        return port.port == entity.port
      })

      if(changedPort) {
        if(index > -1) {
          scope.model.changedPorts[index] = changedPort;
        } else {
          scope.model.changedPorts.push(changedPort)
        }
      } else {
        if(index > -1) {
          scope.model.changedPorts.splice(index, 1);
        }
      }
    };

    let _get_changed_port = (port, entity) => {
      let newPort = false;

      if(port.priority != entity.priority || port.security != entity.security || port.mode != entity.mode || port.rule != entity.rule) {
        newPort = DI._.cloneDeep(port)
        newPort.security = entity.security
        newPort.rule = entity.rule
        newPort.priority = entity.priority
        newPort.mode = entity.mode
      }

      return newPort;
    }
  }

  init() {
    // init flag
    let voiceVlanInitFlag = true, ouiInitFlag = true, portInitFlag = true;
    let initDefer = this.di.$q.defer();
    this.scope.model.provider = this.di.tableProviderFactory.createProvider({
      query: (params) => {
        let defer = this.di.$q.defer();
        let deviceDefer = this.di.$q.defer();
        let voiceVlanDefer = this.di.$q.defer();

        this.di.deviceDataManager.getDeviceConfigs().then((devices)=>{
          deviceDefer.resolve(devices)
        }, (err) => {
          deviceDefer.reject(err)
        });

        this.di.vlanDataManager.getVoiceVlanConfig().then((res)=>{
          voiceVlanDefer.resolve(res.data.devices)
        }, (err) => {
          voiceVlanDefer.reject(err)
        });

        Promise.all([deviceDefer.promise, voiceVlanDefer.promise]).then((res) => {
          let devices = res[0], deviceArr = [];
          devices.forEach((device) => {
            if (device.protocol === 'rest') {
              deviceArr.push(device);
            }
          });
          if (deviceArr.length > 0) {
            // sort by device name
            deviceArr = this.di._.sortBy(deviceArr, (device) => {
              return device.name;
            })
            this.scope.model.devices = deviceArr;
          }

          this.scope.model.voiceVlanMap = this.getVoiceVlanMap(res[1]);
          this.scope.entities = this.getEntities();
          initDefer.resolve();

          if(this.scope.entities.length > 0) {
            this.scope.model.selectedDevice = this.scope.model.voiceVlanMap[this.scope.entities[0].device_id];
            this.scope.model.API.setSelectedRow(this.scope.entities[0].device_id);
          }
          defer.resolve({
            data: this.scope.entities
          });
        })

        return defer.promise;
      },
      getSchema: () => {
        return {
          schema: this.di.vlanService.getVoiceVlanTableSchema(),
          index_name: 'device_id',
          rowCheckboxSupport: true,
          rowActionsSupport: true,
          authManage: {
            support: true,
            currentRole: this.scope.role
          }
        };
      }
    });

    this.scope.model.ouiProvider = this.di.tableProviderFactory.createProvider({
      query: (params) => {
        let defer = this.di.$q.defer();

        this.scope.ouiEntities = [];
        if(ouiInitFlag) {
          initDefer.promise.then(() => {
            this.scope.ouiEntities = this.getOuiEntities();
            defer.resolve({
              data: this.scope.ouiEntities
            });
          })

          ouiInitFlag = false;
        } else {
          this.di.vlanDataManager.getVoiceVlanConfig().then((res)=>{
            this.scope.model.voiceVlanMap = this.getVoiceVlanMap(res.data.devices);
            if(this.scope.model.selectedDevice) {
              this.scope.model.selectedDevice = this.scope.model.voiceVlanMap[this.scope.model.selectedDevice.device_id];
            }
            this.scope.ouiEntities = this.getOuiEntities();
            defer.resolve({
              data: this.scope.ouiEntities
            });
          }, (err) => {
            defer.resolve({
              data: this.scope.ouiEntities
            });
          });
        }

        return defer.promise;
      },
      getSchema: () => {
        return {
          schema: this.di.vlanService.getVoiceVlanOuiTableSchema(),
          index_name: 'mac_address',
          rowCheckboxSupport: true,
          rowActionsSupport: false,
          authManage: {
            support: true,
            currentRole: this.scope.role
          }
        };
      }
    });

    this.scope.model.portProvider = this.di.tableProviderFactory.createProvider({
      query: (params) => {
        let defer = this.di.$q.defer();

        this.scope.portEntities = [];
        if(portInitFlag) {
          initDefer.promise.then(() => {
            this.scope.portEntities = this.getPortEntities();
            defer.resolve({
              data: this.scope.portEntities
            });
          })

          portInitFlag = false;
        } else {
          this.di.vlanDataManager.getVoiceVlanConfig().then((res) => {
            this.scope.model.voiceVlanMap = this.getVoiceVlanMap(res.data.devices);
            if (this.scope.model.selectedDevice) {
              this.scope.model.selectedDevice = this.scope.model.voiceVlanMap[this.scope.model.selectedDevice.device_id];
            }
            this.scope.portEntities = this.getPortEntities();

            defer.resolve({
              data: this.scope.portEntities
            });
          }, (err) => {
            defer.resolve({
              data: this.scope.portEntities
            });
          });
        }

        return defer.promise;
      },
      getSchema: () => {
        return {
          schema: this.di.vlanService.getVoiceVlanPortTableSchema(),
          index_name: 'port',
          rowCheckboxSupport: true,
          rowActionsSupport: false,
          authManage: {
            support: true,
            currentRole: this.scope.role
          }
        };
      }
    });
  }

  getVoiceVlanMap(devices) {
    let voiceVlanMap = {}
    devices.forEach((device) => {
      if(device.basic.vlan == 0 && device.basic.status == 'disable') return;

      let foundDevice = this.scope.model.devices.find((value) => { return value.id == device['device-id']})
      voiceVlanMap[device['device-id']] = {
        'device_id': device['device-id'],
        'device_name': foundDevice ? foundDevice.name : device['device-id'],
        'basic': device.basic,
        'ports': device.ports,
        'ouis': device.ouis
      }
    })

    return voiceVlanMap
  }

  getEntities(devices) {
    let result = [];
    for(let key of Object.keys(this.scope.model.voiceVlanMap)) {
      result.push({
        'device_id': key,
        'device_name': this.scope.model.voiceVlanMap[key].device_name,
        'vlan': this.scope.model.voiceVlanMap[key].basic.vlan,
        'aging': this.scope.model.voiceVlanMap[key].basic.aging,
        'status': this.scope.model.voiceVlanMap[key].basic.status === 'enable' ? 'done' : 'not_interested'
      });
    };

    return result;
  }

  getOuiEntities() {
    let result = [];
    let device = this.scope.model.selectedDevice;
    if(device) {
      device.ouis.forEach((oui) => {
        result.push({
          'mac_address': oui.macAddress,
          'mask_address': oui.maskAddress,
          'description': oui.description,
        });
      })
    }

    return result;
  }

  getPortEntities() {
    let result = [];
    let device = this.scope.model.selectedDevice;
    if(device) {
      device.ports.forEach((port) => {
        result.push({
          'port': port.port,
          'security': port.security,
          'rule': port.rule,
          'priority': port.priority,
          'mode': port.mode,
        });
      })
    }

    result = this.di._.sortBy(result, (port) => {
      return parseInt(port.port)
    })
    return result;
  }

  batchDeleteVoiceVlans(arr) {
    let promises = [];
    arr.forEach((item) => {
      let defer = this.di.$q.defer();
      this.di.vlanDataManager.deleteVoiceVlanConfigByDeviceId(item.device_id).then(() => {
        defer.resolve()
      }, () => {
        defer.reject()
      });

      promises.push(defer.promise)
    });

    Promise.all(promises).then(() => {
      this.scope.model.API.queryUpdate();
      this.di.notificationService.renderSuccess(this.scope, this.translate("MODULES.VLAN.VOICE.TABLE.MESSAGE.BATCH_DELETE_VOICE_VLAN_SUCCESS"));
    }, () => {
      this.scope.model.API.queryUpdate();
      this.di.notificationService.renderWarning(this.scope, this.translate("MODULES.VLAN.VOICE.TABLE.MESSAGE.BATCH_DELETE_VOICE_VLAN_FAILED"));
    })
  }

  batchDeleteOuis(items) {
    let deviceObj = this.di._.cloneDeep(this.scope.model.selectedDevice);

    items.forEach((item) => {
      let index = deviceObj.ouis.findIndex((oui) => {
        return oui.macAddress == item.mac_address && oui.maskAddress == item.mask_address;
      })
      if(index > -1) {
        deviceObj.ouis.splice(index, 1);
      }
    });

    let params = {
      ouis: deviceObj.ouis
    }

    this.di.vlanDataManager.putVoiceVlanConfigByDeviceId(deviceObj.device_id, params).then(() => {
      items.forEach((item) => {
        let index = this.scope.ouiEntities.findIndex((oui) => {
          return oui.mac_address == item.mac_address && oui.mask_address == item.mask_address;
        })
        if(index > -1) {
          this.scope.ouiEntities.splice(index, 1);
        }
      });
      this.scope.model.ouiAPI.queryUpdate();
      this.di.notificationService.renderSuccess(this.scope, this.translate("MODULES.VLAN.VOICE.TABLE.MESSAGE.BATCH_DELETE_OUI_SUCCESS"));
    }, () => {
      this.di.notificationService.renderWarning(this.scope, this.translate("MODULES.VLAN.VOICE.TABLE.MESSAGE.BATCH_DELETE_OUI_FAILED"));
    });
  }

  batchDeletePorts(items) {
    let deviceObj = this.di._.cloneDeep(this.scope.model.selectedDevice);

    items.forEach((item) => {
      let index = deviceObj.ports.findIndex((port) => {
        return port.port == item.port;
      })

      let changedIndex = this.scope.model.changedPorts.findIndex((port) => {
        return port.port == item.port;
      })

      if(index > -1) {
        deviceObj.ports.splice(index, 1);
      }

      if(changedIndex > -1) {
        this.scope.model.changedPorts.splice(changedIndex, 1);
      }
    });

    let params = {
      ports: deviceObj.ports
    }

    this.di.vlanDataManager.putVoiceVlanConfigByDeviceId(deviceObj.device_id, params).then(() => {
      items.forEach((item) => {
        let index = this.scope.portEntities.findIndex((port) => {
          return port.port == item.port;
        })
        if(index > -1) {
          this.scope.portEntities.splice(index, 1);
        }
      });
      this.scope.model.portAPI.queryUpdate();
      this.di.notificationService.renderSuccess(this.scope, this.translate("MODULES.VLAN.VOICE.TABLE.MESSAGE.BATCH_DELETE_PORT_SUCCESS"));
    }, () => {
      this.di.notificationService.renderWarning(this.scope, this.translate("MODULES.VLAN.VOICE.TABLE.MESSAGE.BATCH_DELETE_PORT_FAILED"));
    });
  }
}
VoiceVlanCtrl.$inject = VoiceVlanCtrl.getDI();
VoiceVlanCtrl.$$ngIsClass = true;
export class VlanController {
  static getDI() {
    return [
      '$scope',
      '$rootScope',
      '$filter',
      '$q',
      '_',
      'deviceService',
      'vlanService',
      'roleService',
      'notificationService',
      'dialogService',
      'deviceDataManager',
      'vlanDataManager',
      'modalManager',
      'tableProviderFactory'
    ];
  };
  constructor(...args) {
    this.di = {};
    VlanController.getDI().forEach((value, index) => {
      this.di[value] = args[index];
    });
    this.scope = this.di.$scope;
    let scope = this.di.$scope;
    const DI = this.di;
    this.translate = this.di.$filter('translate');
    let unsubscribers = [];
    scope.role = this.di.roleService.getRole();
    scope.tabSwitch = true;
    scope.tabSelected = null;
    scope.tabs = this.di.deviceService.getVlanTabSchema();
    scope.model = {
      provider: null,
      api: null,
      actionsShow: null,
      rowActions: null,
      entities: [],
      typeMode: {'label':'port'},
      portDisplayLabel:{
        "id": "port-display",
        "name": "display-type", 
        "label": this.translate("MODULES.VLAN.TAB.DEFAULT.TYPE.PORT"),
        "value": "port"
      },
      tableDisplayLabel:{
        "id": "table-display",
        "name": "display-type", 
        "label": this.translate("MODULES.VLAN.TAB.DEFAULT.TYPE.TABLE"),
        "value": "table"
      },
      filterTypes: [],
      selectedFilterType: null,
      subFilterItems: [],
      selectedSubFilter: null,
      devicesMap: {},
      devicesMapArr: [],
      vlanMembers: [],
      vlanConfig: [],
      vlansMapArr: [],
      ports: [],
      vlanPortsList: [],
      topoDevices:[],
      topoLinks:[],
      topoVlanIdSelect:[],
      topoVlanIdFilter:null
    };

    // scope value for editing tab
    scope.vlanModel = {
      editType: {'label': 'edit_vlan'},
      editSelectedType: 'port',
      vlanOptions: [],
      portsOptions: [],
      selectedVlan: '',
      selectedPort: '',
      selectedPortObj: {},
      selectedDevice: [],
      changedPorts: {count: 0},
      addedDevices: [],
      portInputArr: [],
      vlanInput: '',
      nativeVlan: '',
      tagType: '',
      portsNumPerRow: 0,
      selectedMode: null,
      modeOptions: null,
      portEntities: [],
      actionsShow: null,
      provider: null,
      API: null,
      vlanEntities: [],
      portActionsShow: null,
      portProvider: null,
      portAPI: null,
      portsBatchRegex: '^([1-9]+[0-9]*)([-]{1}[1-9]+[0-9]*)*(,([1-9]+[0-9]*)([-]{1}[1-9]+[0-9]*)*)*$',
      vlanInputRegex: '^([1-9]+[0-9]*)(,[1-9]+[0-9]*)*$',
      nativeVlanRegex: '^[1-9]+[0-9]*$'
    }

    scope.onTabChange = (tab) => {
      if (tab && !this.scope.tabSwitch){
        this.scope.tabSelected = tab;
        this.scope.tabSwitch = true;
        this.prepareTableData();
        setTimeout(function () {
          scope.$apply();
        })
      }
    };

    scope.onApiReady = ($api) => {
      scope.model.API = $api;
    };

    scope.onVlanApiReady = ($api) => {
      scope.vlanModel.API = $api;
    };

    scope.onPortApiReady = ($api) => {
      scope.vlanModel.portAPI = $api;
    };

    scope.addDevice = () => {
      let deviceId = scope.vlanModel.selectedDevice.value;
      let index = DI._.findIndex(scope.vlanModel.addedDevices, (device) => {
        return device.id == deviceId;
      })

      if (index == -1) { // the new device does not exist
        // get device ports
        let ports = [];
        this.scope.model.ports.forEach((port) => {
          if (port.element === deviceId) {
            ports.push({
              id: parseInt(port.port) || port.port,
              title: port.annotations.portName,
              selected: false,
              // immutable: true
            });
          }
        });

        if(!ports.length) {
          scope.removeDeviceDisabled = true;
          DI.notificationService.renderWarning(scope, this.translate('MODULES.VLAN.TAB.ADD_DEVICE_FAILED'));
          return;
        }

        let halfNum = Math.ceil(ports.length / 2);
        scope.vlanModel.addedDevices.push({
          id: deviceId,
          name: scope.vlanModel.selectedDevice.label,
          ports: ports,
        })

        scope.vlanModel.portsNumPerRow = halfNum > scope.vlanModel.portsNumPerRow ? halfNum : scope.vlanModel.portsNumPerRow;
        scope.addDeviceDisabled = true;
        scope.removeDeviceDisabled = false;
      }
    }

    scope.removeDevice = (deviceId) => {
      this.di.dialogService.createDialog('warning', this.translate('MODULES.VLAN.TAB.REMOVE_DEVICE_COMFIRM'))
        .then((data) =>{
          let index = DI._.findIndex(scope.vlanModel.addedDevices, (device) => {
            return device.id == deviceId;
          })

          if (index > -1) { // remove device
            scope.vlanModel.addedDevices.splice(index, 1);
            scope.removeDeviceDisabled = true;
            scope.addDeviceDisabled = false;
          }
        }, (res) =>{
          this.di.$log.debug('Delete device dialog canceled');
        });
    }

    scope.createVlan = () => {
      let params = {devices: []}, vlans = [];

      let tag, nativeVlan;
      switch(scope.vlanModel.selectedMode.value) {
        case 'access':
          tag = 'untag';
          nativeVlan = scope.vlanModel.vlanInput;
          break;
        case 'trunk':
          tag = 'tag';
          nativeVlan = scope.vlanModel.nativeVlan;
          break;
        default:
          tag = scope.vlanModel.tagType;
          nativeVlan = scope.vlanModel.nativeVlan;
      }

      scope.vlanModel.vlanInput.split(',').forEach((val) => {
        vlans.push(val + '/' + tag);
      })

      scope.vlanModel.addedDevices.forEach((device) => {
        let obj = {}, ports = []
        obj['device-id'] = device.id;

        device.ports.forEach((port) => {
          if(port.selected) {
            ports.push({
              port: port.id,
              native: parseInt(nativeVlan),
              mode: scope.vlanModel.selectedMode.value,
              vlans: vlans
            })
          }
        })
        obj.ports = ports;

        params.devices.push(obj);
      })

      DI.vlanDataManager.postVlanConfig(params).then((res) => {
        DI.notificationService.renderSuccess(scope, this.translate('MODULES.VLAN.TAB.ADD_BATCH_VLAN_SUCCESS'));
        scope.vlanModel.addedDevices = []
        scope.addDeviceDisabled = false;
        scope.removeDeviceDisabled = true;
      }, (err) => {
        DI.notificationService.renderWarning(scope, this.translate('MODULES.VLAN.TAB.ADD_BATCH_VLAN_FAILED'));
        console.error(err)
      })
    }

    scope.updateVlan = () => {
      let params = {ports: []};

      Object.keys(scope.vlanModel.changedPorts).forEach((key) => {
        if(key == 'count') return;

        let port = {}
        port.port = scope.vlanModel.changedPorts[key].port;
        port.native = scope.vlanModel.changedPorts[key].native;
        port.mode = scope.vlanModel.changedPorts[key].mode;
        port.vlans = scope.vlanModel.changedPorts[key].vlans;

        params.ports.push(port);
      })

      DI.vlanDataManager.postVlanConfigByDeviceId(scope.vlanModel.selectedDevice.value, params).then((res) => {
        DI.notificationService.renderSuccess(scope, this.translate('MODULES.VLAN.TAB.UPDATE_VLAN_SUCCESS'));
        scope.vlanModel.changedPorts = {count:0}
        scope.vlanModel.portAPI.queryUpdate();
      }, (err) => {
        DI.notificationService.renderWarning(scope, this.translate('MODULES.VLAN.TAB.UPDATE_VLAN_FAILED'));
        console.error(err)
      })
    }

    scope.addPortVlan = () => {
      if(scope.vlanModel.selectedPortObj.selectedMode.value == 'access') {
        let newPort = {
          port: scope.vlanModel.selectedPort.value,
          native: scope.vlanModel.selectedPortObj.native,
          mode: scope.vlanModel.selectedPortObj.selectedMode.value,
          vlans: [scope.vlanModel.selectedPortObj.native + '/' + scope.vlanModel.selectedPortObj.selectedMode.value]
        }

        let entity = {
          id: scope.vlanModel.selectedDevice.value + '_' + newPort.native,
          vlan: newPort.native,
          membership_type: 'untag',
          mode: newPort.mode
        };

        scope.vlanModel.changedPorts.count += 1;
        scope.vlanModel.changedPorts[scope.vlanModel.selectedPort.value] = newPort;
        scope.vlanModel.vlanEntities.push(entity);
        scope.vlanModel.portAPI.inlineFilter();
        scope.vlanModel.portAPI.update();
        return;
      }

      DI.modalManager.open({
        template: require('../component/createVlan/template/createVlanDialog.html'),
        controller: 'createVlanDialogCtl',
        windowClass: 'create-vlan-dialog-modal',
        resolve: {
          dataModel: () => {
            return {portMode: scope.vlanModel.selectedPortObj.selectedMode.value}
          }
        }
      }).result.then((data) => {
        if(!data || data.canceled) {
          return;
        } else if (data && !data.canceled) {
          let deviceObj = DI._.find(scope.model.vlanConfig, (device) => {
            return device['device-id'] == scope.vlanModel.selectedDevice.value;
          })

          let portObj = deviceObj && deviceObj.ports.find((port) => {
            return port.port == scope.vlanModel.selectedPort.value;
          })

          // update entity
          let newVlans = []
          data.result.vlans.forEach((vlan) => {
            newVlans.push(vlan + '/' + data.result.membership_type)

            let entity = {
              id: scope.vlanModel.selectedDevice.value + '_' + vlan,
              vlan: vlan,
              membership_type: data.result.membership_type,
              mode: scope.vlanModel.selectedPortObj.selectedMode.value
            };
            scope.vlanModel.vlanEntities.push(entity);
          })

          let changedPort = scope.vlanModel.changedPorts[scope.vlanModel.selectedPort.value];
          if(changedPort) {
            let newPort = {
              port: scope.vlanModel.selectedPort.value,
              native: scope.vlanModel.selectedPortObj.native,
              mode: scope.vlanModel.selectedPortObj.selectedMode.value,
              vlans: changedPort.vlans.concat(newVlans)
            }

            scope.vlanModel.changedPorts[scope.vlanModel.selectedPort.value] = newPort;
          } else{
            let newPort = {
              port: scope.vlanModel.selectedPort.value,
              native: scope.vlanModel.selectedPortObj.native,
              mode: scope.vlanModel.selectedPortObj.selectedMode.value,
              vlans: portObj ? portObj.vlans.concat(newVlans) : newVlans
            }

            scope.vlanModel.changedPorts.count += 1;
            scope.vlanModel.changedPorts[scope.vlanModel.selectedPort.value] = newPort;
          }

          scope.vlanModel.portAPI.inlineFilter();
          scope.vlanModel.portAPI.update();

          // DI.vlanDataManager.postVlanConfigByDeviceId(scope.vlanModel.selectedDevice.value, params).then((res) => {
          //   DI.notificationService.renderSuccess(scope, this.translate('MODULES.VLAN.TAB.UPDATE_VLAN_SUCCESS'));
          //   scope.vlanModel.portAPI.queryUpdate();
          // }, (err) => {
          //   DI.notificationService.renderWarning(scope, this.translate('MODULES.VLAN.TAB.UPDATE_VLAN_FAILED'));
          // })
        }
      });
    }

    scope.removePortVlan = () => {
      let removeItems = scope.vlanModel.portAPI.getSelectedRows()
      if (!removeItems.length) {
        DI.notificationService.renderWarning(scope, this.translate('MODULES.VLAN.TAB.EDIT.SELECT_VLAN_WARNING'));
        return;
      }

      this.di.dialogService.createDialog('warning', this.translate('MODULES.VLAN.TAB.EDIT.DIALOG.DELETE.WARNING'))
        .then(() =>{
          this.batchDeletePortVlan(removeItems);
        }, () => {
          this.scope.vlanModel.portAPI.queryUpdate();
        });
    };

    let batchChangePortsInterval = null;
    scope.batchChangePorts = (index) => {
      const getPortsArrayFromStr = this.getPortsArrayFromStr;
      let portsStr = scope.vlanModel.portInputArr[index];

      let regex = new RegExp(scope.vlanModel.portsBatchRegex)
      if(!portsStr || !portsStr.match(regex)) return;

      function handleBatch() {
        let regex = new RegExp(scope.vlanModel.portsBatchRegex)
        if(portsStr && portsStr.match(regex)) {
          let portsArr = getPortsArrayFromStr(portsStr);
          scope.vlanModel.addedDevices[index].ports.forEach((port) => {
            if(portsArr.indexOf(port.id) > -1) {
              port.selected = true;
            } else {
              port.selected = false;
            }
          })
        } else if(portsStr && portsStr.trim() == '') {
          scope.vlanModel.addedDevices[index].ports.forEach((port) => {
            port.selected = false;
          })
        }

        scope.$apply();
      }

      if(batchChangePortsInterval) {
        clearTimeout(batchChangePortsInterval);
        batchChangePortsInterval = setTimeout(handleBatch, 2 * 1000)
      } else {
        batchChangePortsInterval = setTimeout(handleBatch, 2 * 1000)
      }
    }

    scope.changeDisplayType = (value) => {
      console.log(value);
      if (value === 'table') {
        
      }
    };

    scope.changeVlanTopoId = (value) =>{
      // console.log('==> changeVlanTopoId: '+ value);
      this.di.$rootScope.$emit('vlan_topo_highlight', value.value)
    }

    scope.viewChanged = () =>{
      scope.model.topoVlanIdFilter = null;
    }

    scope.changeFilterType = (value) => {
      if (scope.model.selectedFilterType == value) return;
      scope.model.selectedFilterType = value;
      scope.model.subFilterItems = scope.model.selectedFilterType.value === 'vlan'
            ? this.scope.model.vlansMapArr : this.scope.model.devicesMapArr;
      console.log(value);
      scope.model.selectedSubFilter = this.scope.model.subFilterItems[0];
      scope.changeDisplayPorts(scope.model.selectedSubFilter);
    };

    scope.changeDisplayPorts = (value) => {
      //if (scope.model.selectedSubFilter == value) return;
      scope.model.selectedSubFilter = value;
      scope.model.vlanPortsList = this.getPortListFromConfig();
    };

    unsubscribers.push(scope.$watch('vlanModel.editType', () => {
      scope.vlanModel.changedPorts = {count:0} // reinit
      scope.addDeviceDisabled = false;
      scope.removeDeviceDisabled = true;

      scope.vlanModel.selectedDevice = scope.model.devicesMapArr[0];
    }, true));

    unsubscribers.push(scope.$watch('vlanModel.selectedDevice', () => {
      scope.vlanModel.changedPorts = {count:0};

      if(scope.vlanModel.editType.label == 'edit_vlan') {
        // specify port
        let portOptions = [];
        this.scope.model.ports.forEach((port) => {
          if (port.element == scope.vlanModel.selectedDevice.value) {
            portOptions.push({label: port.port, value: port.port})
          }
        });

        scope.vlanModel.portsOptions = portOptions;
        scope.vlanModel.selectedPort = portOptions[0];

        // specify vlan
        let vlanConfig = scope.model.vlanConfig.find((device) => {
          return device['device-id'] == scope.vlanModel.selectedDevice.value;
        })

        if (vlanConfig) {
          let vlanSet = new Set(), vlanOptions = [];
          vlanConfig.ports.forEach((port) => {
            port.vlans.forEach((vlan) => {
              let vlanArr = vlan.split('/');
              vlanSet.add(vlanArr[0]);
            })
          })

          for(let vlan of vlanSet) {
            vlanOptions.push({label: vlan, value: vlan})
          }

          scope.vlanModel.vlanOptions = DI._.sortBy(vlanOptions, (vlan) => {
            return parseInt(vlan.value)
          });
          scope.vlanModel.selectedVlan = scope.vlanModel.vlanOptions[0];
        } else {
          scope.vlanModel.vlanOptions = [];
          scope.vlanModel.selectedVlan = {};
        }
      } else {
        let index = DI._.findIndex(scope.vlanModel.addedDevices, (device) => {
          return device.id == scope.vlanModel.selectedDevice.value;
        })

        if (index == -1) { // the device does not exist
          scope.addDeviceDisabled = false;
          scope.removeDeviceDisabled = true;
        } else {
          scope.addDeviceDisabled = true;
          scope.removeDeviceDisabled = false;
        }
      }
    }, true));

    unsubscribers.push(scope.$watch('vlanModel.editSelectedType', () => {
      scope.vlanModel.changedPorts = {count:0} // reinit
    }, true));

    unsubscribers.push(scope.$watchGroup(['vlanModel.selectedVlan', 'vlanModel.selectedPort'], () => {
      scope.vlanModel.changedPorts = {count:0}
      if(scope.vlanModel.API && scope.vlanModel.editSelectedType == 'vlan') {
        setTimeout(() => {
          scope.vlanModel.API.queryUpdate();
        })
      }

      if(scope.vlanModel.portAPI && scope.vlanModel.editSelectedType == 'port') {
        setTimeout(() => {
          scope.vlanModel.portAPI.queryUpdate();
        })
      }
    }, true));

    unsubscribers.push(scope.$watch('vlanModel.selectedMode', () => {
      if(!scope.vlanModel.selectedMode) return;

      if(scope.vlanModel.selectedMode.value == 'access') {
        scope.vlanModel.nativeVlan = scope.vlanModel.vlanInput;
        scope.vlanModel.tagType = 'untag';
      } else if(scope.vlanModel.selectedMode.value == 'trunk') {
        scope.vlanModel.tagType = 'tag';
      }
    }, true))

    unsubscribers.push(scope.$watch('vlanModel.vlanInput', () => {
      if(!scope.vlanModel.selectedMode) return;

      let regexStr = scope.vlanModel.selectedMode.value == 'access' ? scope.vlanModel.nativeVlanRegex : scope.model.vlanInputRegex
      if(scope.vlanModel.selectedMode.value == 'access' && scope.vlanModel.vlanInput.match(regexStr)) {
        scope.vlanModel.nativeVlan = scope.vlanModel.vlanInput;
      } else {
        scope.vlanModel.nativeVlan = ''
      }
    }, true))

    unsubscribers.push(scope.$watch('model.vlanConfig', () => {
      if(scope.model.vlanConfig && scope.model.selectedFilterType) {
        scope.model.vlanPortsList = this.getPortListFromConfig();
      }

      if(scope.vlanModel.selectedDevice && scope.vlanModel.editType.label == 'edit_vlan') {
        // specify vlan options
        let vlanConfig = scope.model.vlanConfig.find((device) => {
          return device['device-id'] == scope.vlanModel.selectedDevice.value;
        })

        if (vlanConfig) {
          let vlanSet = new Set(), vlanOptions = [];
          vlanConfig.ports.forEach((port) => {
            port.vlans.forEach((vlan) => {
              let vlanArr = vlan.split('/');
              vlanSet.add(vlanArr[0]);
            })
          })

          for (let vlan of vlanSet) {
            vlanOptions.push({label: vlan, value: vlan})
          }

          scope.vlanModel.vlanOptions = DI._.sortBy(vlanOptions, (vlan) => {
            return parseInt(vlan.value)
          });
          scope.vlanModel.selectedVlan = scope.vlanModel.vlanOptions[0];
        } else {
          scope.vlanModel.vlanOptions = [];
          scope.vlanModel.selectedVlan = {};
        }
      }
    }, true));

    unsubscribers.push(scope.$watch('vlanModel.addedDevices', (newValue, oldValue) => {
      if(!newValue || !oldValue) return;

      scope.vlanModel.portInputArr = [];
      scope.vlanModel.addedDevices.forEach(device => {
        scope.vlanModel.portInputArr.push(_formatPortsToStr(device.ports))
      })
    }, true));

    unsubscribers.push(scope.$on('td-select-change', (event, newValue) => {
      if(scope.vlanModel.editSelectedType == 'vlan') {
        _handle_update_vlan(newValue);
      }
    }, true));

    unsubscribers.push(scope.$on('td-radio-change', (event, newValue) => {
      if(scope.vlanModel.editSelectedType == 'vlan') {
        _handle_update_vlan(newValue);
      } else {
        _handle_update_port(newValue);
      }
    }, true));

    scope.$on('$destroy', () => {
      unsubscribers.forEach((cb) => {
        cb();
      });
    });

    this.init();

    let _formatPortsToStr = (ports) => {
      // get formatted port string
      let formattedArr = [];

      let sortedPorts = DI._.sortBy(ports, () => {
        return ports.id
      })

      let startId, currentId, preId;
      for (let i = 0; i < sortedPorts.length; i++) {
        currentId = parseInt(sortedPorts[i].id);
        if(sortedPorts[i].selected && startId == undefined) {
          startId = parseInt(sortedPorts[i].id);
          preId = parseInt(sortedPorts[i].id);
          continue;
        }

        if(sortedPorts[i].selected && currentId - preId == 1) {
          preId = currentId;
        } else if(sortedPorts[i].selected) {
          if(startId == preId) {
            formattedArr.push(preId);
          } else {
            formattedArr.push(startId + '-' + preId);
          }

          startId = currentId;
          preId = currentId;
        }
      }

      if(startId == preId && startId !== undefined) {
        formattedArr.push(preId);
      } else if(startId !== undefined){
        formattedArr.push(startId + '-' + preId);
      }

      return formattedArr.join(',');
    }

    // update port table's one row data
    let _handle_update_vlan = (newValue) =>{
      let deviceObj = DI._.find(scope.model.vlanConfig, (device) => {
        return device['device-id'] == scope.vlanModel.selectedDevice.value;
      })

      let entity = this.scope.vlanModel.portEntities.find((value) => {
        return value.id == newValue.trObject.id
      });

      let portObj = deviceObj.ports.find((port) => {
        return port.port == entity.port;
      })

      let vlanObj = portObj.vlans.find((vlanStr) => {
        let vlanArr = vlanStr.split('/')
        return vlanArr[0] == scope.vlanModel.selectedVlan.value;
      }).split('/');

      if(newValue.column == 'mode' && newValue.trObject.mode == 'access') {
        entity.mode = 'access';
        entity.membership_type = 'untag';
        entity.pvid = scope.vlanModel.selectedVlan.value;
        scope.vlanModel.API.inlineFilter();
        scope.vlanModel.API.update();
      } else if(newValue.column == 'mode' && newValue.trObject.mode == 'trunk'){
        // recover entity value
        entity.mode = 'trunk';
        entity.membership_type = 'tag';
        entity.pvid = portObj.native;
        scope.vlanModel.API.inlineFilter();
        scope.vlanModel.API.update();
      } else if(newValue.column == 'mode' && newValue.trObject.mode != 'access'){
        // recover entity value
        entity.pvid = portObj.native;
        entity.membership_type = vlanObj[1];
        scope.vlanModel.API.inlineFilter();
        scope.vlanModel.API.update();
      }

      if(newValue.column == 'membership_type') {
        entity.membership_type = newValue.trObject.membership_type;
      }

      let changedPort = _get_changed_port(portObj, entity);
      if(changedPort) {
        Object.keys(scope.vlanModel.changedPorts).indexOf(portObj.port.toString()) == -1 && scope.vlanModel.changedPorts.count++;
        scope.vlanModel.changedPorts[portObj.port] = changedPort;
      } else {
        if(Object.keys(scope.vlanModel.changedPorts).indexOf(portObj.port.toString()) > -1) {
          scope.vlanModel.changedPorts.count--;
          delete scope.vlanModel.changedPorts[portObj.port];
        }
      }
    };

    // update vlan table's one row data
    let _handle_update_port = (newValue) =>{
      let entity = this.scope.vlanModel.vlanEntities.find((value) => {
        return value.id == newValue.trObject.id
      });

      let deviceObj = DI._.find(scope.model.vlanConfig, (device) => {
        return device['device-id'] == scope.vlanModel.selectedDevice.value;
      })

      let portObj = deviceObj && deviceObj.ports.find((port) => {
        return port.port == scope.vlanModel.selectedPort.value;
      })

      if(!portObj) {
        let newPort = scope.vlanModel.changedPorts[scope.vlanModel.selectedPort.value];
        let index = newPort.vlans.findIndex((vlan) => {
          let vlanArr = vlan.split("/");
          return vlanArr[0] == entity.vlan;
        })

        if(index > -1) {
          newPort.vlans[index] = entity.vlan + '/' + newValue.trObject.membership_type;
        }
      } else {
        let vlanObj = portObj.vlans.find((vlanStr) => {
          let vlanArr = vlanStr.split('/')
          return vlanArr[0] == entity.vlan;
        }).split('/');

        if(newValue.column == 'membership_type') {
          entity.membership_type = newValue.trObject.membership_type;
        }

        let changedPort = _get_changed_port(portObj, entity);
        if(changedPort) {
          Object.keys(scope.vlanModel.changedPorts).indexOf(portObj.port.toString()) == -1 && scope.vlanModel.changedPorts.count++;
          scope.vlanModel.changedPorts[portObj.port] = changedPort;
        } else {
          if(Object.keys(scope.vlanModel.changedPorts).indexOf(portObj.port.toString()) > -1) {
            scope.vlanModel.changedPorts.count--;
            delete scope.vlanModel.changedPorts[portObj.port];
          }
        }
      }
    };

    let _get_changed_port = (port, entity) => {
      let newPort = false;
      let index = port.vlans.findIndex((vlan) => {
        let vlanArr = vlan.split("/");
        return vlanArr[0] == (scope.vlanModel.editSelectedType == 'vlan' ? scope.vlanModel.selectedVlan.value : entity.vlan);
      })
      let vlanObj = port.vlans[index].split('/')
      if(scope.vlanModel.editSelectedType == 'vlan' && (vlanObj[1] != entity.membership_type || port.mode != entity.mode || port.native != entity.pvid)) {
        newPort = DI._.cloneDeep(port)
        newPort.mode = entity.mode
        newPort.native = entity.pvid
        newPort.vlans[index] = scope.vlanModel.selectedVlan.value + '/' + entity.membership_type
      } else if (scope.vlanModel.editSelectedType == 'port' && vlanObj[1] != entity.membership_type) {
        newPort = DI._.cloneDeep(port)
        newPort.vlans[index] = vlanObj[0] + '/' + entity.membership_type
      }

      return newPort;
    }
  }

  init() {
    let promises = [],
        deviceDefer = this.di.$q.defer(),
        deviceConfigsDefer = this.di.$q.defer(),
        linkDefer = this.di.$q.defer(),
        vlanConfigDefer = this.di.$q.defer(),
        vlanMemberDefer = this.di.$q.defer(),
        portDefer = this.di.$q.defer();
    this.di.deviceDataManager.getDevices().then((res)=>{
      deviceDefer.resolve(res.data.devices);
    });
    promises.push(deviceDefer.promise);
    this.di.deviceDataManager.getDeviceConfigs().then((res)=>{
      deviceConfigsDefer.resolve(res);
    });
    promises.push(deviceConfigsDefer.promise);
    this.di.deviceDataManager.getLinks().then((res)=>{
      linkDefer.resolve(res.data.links);
    });
    promises.push(linkDefer.promise);
    this.di.vlanDataManager.getVlanConfig().then((res)=>{
      vlanConfigDefer.resolve(res.data.devices);
    });
    promises.push(vlanConfigDefer.promise);
    this.di.vlanDataManager.getVlanMembers().then((res)=>{
      vlanMemberDefer.resolve(res.data.devices);
    });
    promises.push(vlanMemberDefer.promise);
    this.di.deviceDataManager.getPorts().then((res) => {
      portDefer.resolve(res.data.ports);
    });
    promises.push(portDefer.promise);
    Promise.all(promises).then((resultArr)=>{
      this.scope.model.filterTypes = [];
      if (resultArr[1].length > 0) {
        let devices = [];
        resultArr[1].forEach((item) => {
          this.scope.model.devicesMap[item.id] = item.name;
          if (item.protocol === 'rest') {
            devices.push({
              'label': item.name,
              'value': item.id
            });  
          }
        });
        if (devices.length > 0) {
          // sort by device name
          devices = this.di._.sortBy(devices, (device) => {
            return device.label;
          })
          this.scope.model.devicesMapArr = devices;
          this.scope.model.filterTypes.push({'label': this.translate('MODULES.FABRIC.HOSTSEGMENT.COLUMN.DEVICE'), 'value': 'device'});
        }
      }
      this.scope.model.vlanConfig = resultArr[3];
      this.scope.model.vlanMembers = resultArr[4];
      this.scope.model.vlansMapArr = this.getVlanOptionsFromConfig(resultArr[4]);
      if (this.scope.model.vlansMapArr.length > 0) {
        this.scope.model.filterTypes.push({'label': this.translate('MODULES.FABRIC.HOSTSEGMENT.COLUMN.VLAN'), 'value': 'vlan'});
      }
      if (this.scope.model.filterTypes.length > 0) {
        this.scope.model.selectedFilterType = this.scope.model.filterTypes[0];
        this.scope.model.subFilterItems = this.scope.model.selectedFilterType.value === 'device'
            ? this.scope.model.devicesMapArr : this.scope.model.vlansMapArr;
        this.scope.model.selectedSubFilter = this.scope.model.subFilterItems[0];
      }
      
      this.scope.model.ports = resultArr[5];
      console.log(resultArr);
      this.scope.tabSwitch = false;
      this.scope.onTabChange(this.scope.tabs[0]);
      this.scope.model.actionsShow = this.getActionsShow();
      this.scope.model.vlanPortsList = this.getPortListFromConfig();


      let formatLeafGroupData = (devices, realtimeDevices) => {

        realtimeDevices.forEach(realtimeD => {
          let device = devices.find(d=> d.id === realtimeD.id);
          if(device){
            realtimeD['name'] = device['name']? device['name']: null;
          }
        });
        let curTime = new Date().getTime();
        this.di._.forEach(devices, (device) => {
          if (device.type.toLowerCase() === 'leaf') {
            device['leaf_group_name'] = device.leaf_group.name ? device.leaf_group.name : null;
            device['leaf_group_port'] = device.leaf_group.switch_port ? device.leaf_group.switch_port : null;
          }
        })
      };
      this.scope.model.topoLinks = angular.copy(resultArr[2]);
      let devices = angular.copy(resultArr[1]);
      let realtimeDevices = angular.copy(resultArr[0]);
      let portGroups = this.di._.groupBy(angular.copy(resultArr[5]), "element");
      formatLeafGroupData(devices, realtimeDevices);
      this.di._.forEach(realtimeDevices, (device) => {
        device.ports = portGroups[device.id];
      });
      this.scope.model.topoDevices = realtimeDevices;

      let vlanIds = [];
      this.scope.model.vlanMembers.forEach( v => {
        vlanIds = vlanIds.concat(v.vlans);
      })
      vlanIds = Array.from(new Set(vlanIds));
      this.scope.model.topoVlanIdSelect = [{label: this.translate('MODULES.VLAN.STATIC.TOPO.VLAN_ID_SELECT'), 'value': null}];
      vlanIds.forEach(id => {this.scope.model.topoVlanIdSelect.push({'label' : id+'', 'value' : id})});
    });

    //init table
    this.scope.model.provider = this.di.tableProviderFactory.createProvider({
      query: (params) => {
        let defer = this.di.$q.defer();
        this.di.vlanDataManager.getVlanConfig().then((res)=>{
          //this.scope.model.vlansMapArr = this.getVlanOptionsFromConfig(res.data.devices);
          this.entityStandardization(res.data.devices);
          defer.resolve({
            data: this.scope.model.entities
          });
        });
        return defer.promise;
      },
      getSchema: () => {
        return {
          schema: this.di.vlanService.getDevicesPortsVlanInfoSchema(),
          index_name: 'id',
          rowCheckboxSupport: false,
          rowActionsSupport: false,
          authManage: {
            support: true,
            currentRole: this.scope.role
          }
        };
      }
    });
  }

  prepareTableData() {
    const scope = this.scope;
    scope.tabSwitch = false;

    if(scope.tabSelected.type == 'edit') {
      scope.tabSwitch = false;
      const modeOptions = [{label: 'access', value: 'access'}, {label: 'trunk', value: 'trunk'}, {label: 'hybrid', value: 'hybrid'}]

      scope.vlanModel.selectedDevice = scope.model.devicesMapArr[0]
      scope.vlanModel.modeOptions = modeOptions
      scope.vlanModel.selectedMode = modeOptions[0]
      scope.vlanModel.changedPorts = {count: 0}

      // editable ports table options
      scope.vlanModel.actionsShow = this.getActionsShow();
      scope.vlanModel.provider = this.di.tableProviderFactory.createProvider({
        query: (params) => {
          let defer = this.di.$q.defer();
          this.di.vlanDataManager.getVlanConfig().then((res)=>{
            //this.scope.model.vlansMapArr = this.getVlanOptionsFromConfig(res.data.devices);
            this.entityStandardization(res.data.devices);
            defer.resolve({
              data: this.scope.vlanModel.portEntities
            });
          });
          return defer.promise;
        },
        getSchema: () => {
          return {
            schema: this.di.vlanService.getPortsListSchema(),
            index_name: 'id',
            rowCheckboxSupport: false,
            rowActionsSupport: false,
            authManage: {
              support: true,
              currentRole: this.scope.role
            }
          };
        }
      });

      // editable vlans table options
      scope.vlanModel.portActionsShow = this.di.vlanService.getDevicesPortEditableTableActionsShow();
      scope.vlanModel.portProvider = this.di.tableProviderFactory.createProvider({
        query: (params) => {
          let defer = this.di.$q.defer();
          this.di.vlanDataManager.getVlanConfig().then((res)=>{
            scope.model.vlanConfig = res.data.devices;
            this.entityStandardization(res.data.devices);
            defer.resolve({
              data: this.scope.vlanModel.vlanEntities
            });
          });
          return defer.promise;
        },
        getSchema: () => {
          return {
            schema: this.di.vlanService.getVlanListSchema(),
            index_name: 'id',
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
  }

  getPortsArrayFromStr(ports) {
    let portsArr = [];
    if(Array.isArray(ports)) {
      portsArr = ports
    } else if (typeof ports == 'string') {
      let tmpArr = ports.split(',');
      for(let portStr of tmpArr) {
        portStr = portStr.trim();
        if(portStr) {
          if(parseInt(portStr) != portStr) {
            let portStrArr = portStr.split('-');
            if(portStrArr.length == 2 && !isNaN(parseInt(portStrArr[0])) && !isNaN(parseInt(portStrArr[1]))) {
              for(let num = parseInt(portStrArr[0]); num <= parseInt(portStrArr[1]); num++) {
                portsArr.push(num);
              }
            }
          } else {
            portsArr.push(parseInt(portStr));
          }
        }
      }
    }

    return portsArr;
  }

  batchDeletePortVlan(vlanItems) {
    let deviceObj = this.scope.model.vlanConfig.find((device) => {
      return device['device-id'] == this.scope.vlanModel.selectedDevice.value;
    })

    let portObj = deviceObj && deviceObj.ports.find((port) => {
      return port.port == this.scope.vlanModel.selectedPort.value;
    })

    let changedPort = this.scope.vlanModel.changedPorts[this.scope.vlanModel.selectedPort.value]
    let newPort = this.di._.cloneDeep(portObj);

    if(changedPort || newPort) {
      vlanItems.forEach((item) => {
        // update entity
        let entityIndex = this.scope.vlanModel.vlanEntities.findIndex((entity) => {
          return entity.id == item.id;
        })
        this.scope.vlanModel.vlanEntities.splice(entityIndex, 1)

        // update changePortsList
        if(changedPort) {
          let index = changedPort.vlans.findIndex((vlan) => {
            let vlanArr = vlan.split("/");
            return vlanArr[0] == item.vlan;
          })

          changedPort.vlans.splice(index, 1)
        } else {
          let index = newPort.vlans.findIndex((vlan) => {
            let vlanArr = vlan.split("/");
            return vlanArr[0] == item.vlan;
          })

          newPort.vlans.splice(index, 1)
        }
      })

      this.scope.vlanModel.portAPI.inlineFilter();
      this.scope.vlanModel.portAPI.update();

      if(!changedPort) {
        this.scope.vlanModel.changedPorts[newPort.port] = newPort
        this.scope.vlanModel.changedPorts.count++;
      }
    }
  }

  formatSubTableValue(relayAgentIps){
    let entities = [];
    if(!relayAgentIps){
      return [];
    }
    let keys = Object.keys(relayAgentIps);
    keys.forEach((key) => {
      let agent = relayAgentIps[key];
      let obj = {};
      obj['device'] = this.getDeviceName(key);
      obj['ipv4'] = agent.ipv4 ? agent.ipv4 : null;
      obj['ipv6'] = agent.ipv6 ? agent.ipv6 : null;
      entities.push(obj)
    });
    return entities;
  }

  entityStandardization(entities) {
    this.scope.model.entities = [];
    switch (this.scope.tabSelected.type) {
      case 'default':
        entities.forEach((device) => {
          device.ports.forEach((port) => {
            let obj = {};
            obj['id'] = device['device-id'] + '_' + port.port;
            obj['device'] = this.scope.model.devicesMap[device['device-id']] || device['device-id'];
            obj['port'] = port.port;
            obj['type'] = port.mode;
            obj['vlan'] = port.vlans.toString();
            obj['pvid'] = port.native;
            this.scope.model.entities.push(obj);
          });
        });
        break;
      case 'edit':
        let dataArr = [];
        if(this.scope.vlanModel.editSelectedType == 'vlan') {
          this.scope.vlanModel.portEntities = [];

          let foundDevice = entities.find((device) => {
            return device['device-id'] == this.scope.vlanModel.selectedDevice.value
          })

          if(foundDevice) {
            foundDevice.ports.forEach((port) => {
              let obj = {},vlans = [];
              port.vlans.forEach((vlan) => {
                let vlanArr = vlan.split("/");
                vlans.push({id: vlanArr[0], type: vlanArr[1]});
              })

              let foundVlan = vlans.find((vlan) => {
                return vlan.id == this.scope.vlanModel.selectedVlan.value;
              })

              if(foundVlan) {
                obj['id'] = foundDevice['device-id'] + '_' + port.port;
                obj['port'] = port.port;
                obj['mode'] = port.mode;
                obj['pvid'] = port.native;
                obj['membership_type'] = foundVlan.type;
                dataArr.push(obj);
              }
            });
          }

          this.scope.vlanModel.portEntities = this.di._.sortBy(dataArr, (entity) => {
            return entity.port;
          })
        } else {
          this.scope.vlanModel.vlanEntities = [];
          let foundDevice = entities.find((device) => {
            return device['device-id'] == this.scope.vlanModel.selectedDevice.value
          })

          if(foundDevice) {
            let foundPort = foundDevice.ports.find((port) => {
              return port.port == this.scope.vlanModel.selectedPort.value;
            });

            if(foundPort) {
              this.scope.vlanModel.selectedPortObj = {selectedMode: {label:foundPort.mode, value:foundPort.mode}, native: foundPort.native};
              foundPort.vlans.forEach((vlan) => {
                let obj = {};
                let vlanArr = vlan.split("/")

                obj['id'] = foundDevice['device-id'] + '_' + vlanArr[0];
                obj['vlan'] = vlanArr[0];
                obj['membership_type'] = vlanArr[1];
                obj['mode'] = foundPort.mode;
                dataArr.push(obj);
              })
            } else {
              this.scope.vlanModel.selectedPortObj = {selectedMode: {label:'', value:''}, native: ''};
            }
          } else {
            this.scope.vlanModel.selectedPortObj = {selectedMode: {label:'', value:''}, native: ''};
          }

          this.scope.vlanModel.vlanEntities = this.di._.sortBy(dataArr, (entity) => {
            return entity.vlan;
          })
        }
    }
  }

  getActionsShow() {
    let actions;
    switch (this.scope.tabSelected.type) {
      case 'default':
        actions = this.di.vlanService.getDevicesVlanTableActionsShow();
        break;
      case 'edit':
        actions = this.di.vlanService.getDevicesVlanEditableTableActionsShow();
        break;
    }
    return actions;
  }

  getVlanOptionsFromConfig(config) {
    let vlanObject = new Map(), result = [];
    config.forEach((device) => {
      device.vlans.forEach((vlan) => {
        vlanObject.set(vlan, vlan);
      });
    });
    vlanObject.forEach((val, key) => {
      result.push({
        'label': key,
        'value': val
      });
    });
    return result;
  }

  getPortListFromConfig() {
    let result = [];
    if (this.scope.model.selectedFilterType.value === 'device') {
      let deviceVlans = new Set(),
          deviceVlanPorts = {},
          portsList = this.getPortsFromDevice(this.scope.model.selectedSubFilter.value);
      //rest交换机默认包含vlan1
      deviceVlans.add(1);      
      this.scope.model.vlanConfig.forEach((device => {
        if (device['device-id'] === this.scope.model.selectedSubFilter.value) {
          //deviceVlanPorts = device.ports;
          device.ports.forEach((port) => {
            port.vlans.forEach((vlan) => {
              let vlanId = parseInt(vlan.split('/')[0]);
              if (!deviceVlanPorts.hasOwnProperty(vlanId)) deviceVlanPorts[vlanId] = [];
              deviceVlanPorts[vlanId].push(port.port);
              deviceVlans.add(vlanId);
            });
          });
        }
      }));
      deviceVlans.forEach((value, key) => {
        result.push({
          id: this.scope.model.selectedSubFilter.value + '_' + value,
          deviceName: this.scope.model.selectedSubFilter.label,
          vlanId: value,
          ports: this.updatePortsListByDevice(value, deviceVlanPorts[value], this.di._.cloneDeep(portsList))
        }); 
      });
    }
    else {
      //vlan
      let devicePortsMap = {};
      this.scope.model.vlanConfig.forEach((device) => {
        if (this.scope.model.selectedSubFilter.value == 1) {
          devicePortsMap[device['device-id']] = [];
        }
        else {
          device.ports.forEach((port) => {
            if (port.vlans.length > 0) {
              for (let i = 0 ; i < port.vlans.length; i++) {
                if (port.vlans[i].split('/')[0] == this.scope.model.selectedSubFilter.value) {
                  if(!devicePortsMap.hasOwnProperty(device['device-id'])) {
                    devicePortsMap[device['device-id']] = [];
                  }
                  else {
                    devicePortsMap[device['device-id']].push(port.port);
                  }
                  break;
                }
              }
            }
          });
        }
      });
      for(let key in devicePortsMap) {
        let portsList = this.getPortsFromDevice(key);
        if (this.scope.model.selectedSubFilter.value == 1) {
          portsList = portsList.map((port) => {
            port.selected = true;
            return port;
          })
        }
        else {
          portsList = this.updatePortListByVlan(devicePortsMap[key], portsList);
        }
        if (portsList.length > 0) {
          result.push({
            id: key + '_' + this.scope.model.selectedSubFilter.value,
            deviceName: this.scope.model.devicesMap[key] || key,
            vlanId: this.scope.model.selectedSubFilter.value,
            ports: portsList
          });  
        }
      }
    }
    return result;
  }

  getPortsFromDevice(device_id){
    let ports = [];
    this.scope.model.ports.forEach((port) => {
      if (port.element === device_id) {
        let num = parseInt(port.port);
        ports.push({
          id: num,
          title: num,
          selected: false
        });
      }
    });
    return ports;
  }

  updatePortsListByDevice(vlanId, vlanPorts, portsList) {
    if (vlanId === 1) {
      portsList = portsList.map((port) => {
        port.selected = true;
        return port;
      });
    }
    else {
      for (let i = 0, vLen = vlanPorts.length; i < vLen; i++) {
        for (let j = 0, pLen = portsList.length; j < pLen; j++) {
          if (vlanPorts[i] === portsList[j].id) {
            portsList[j].selected = true;
            break;
          }
        }
      }
    }
    return portsList;
  }

  updatePortListByVlan(vlanPorts, portsList) {
    vlanPorts.forEach((vlanPort) => {
      portsList.forEach((port) => {
        if (vlanPort == port.id) {
          port.selected = true;
        }
      });
    });
    return portsList;
  }
}

VlanController.$inject = VlanController.getDI();
VlanController.$$ngIsClass = true;
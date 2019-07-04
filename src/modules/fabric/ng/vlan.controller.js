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
    scope.tabSwitch = false;
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
      topoLinks:[]
    };

    scope.onTabChange = (tab) => {
      // if (tab && !this.scope.tabSwitch){
      //   this.scope.model.subRelayIps = null;
      //   this.scope.tabSelected = tab;
      //   this.scope.tabSwitch = true;
      //   this.prepareTableData();
      // }
      if (tab){
        this.scope.tabSelected = tab;
        this.prepareTableData();
      }
    };

    scope.onApiReady = ($api) => {
      scope.model.API = $api;
    };

    scope.addDevice = (deviceId) => {
      let index = DI._.findIndex(scope.vlanModel.addedDevices, (device) => {
        return device.id == deviceId;
      })

      if (index == -1) { // the new device does not exist
        // get device ports
        this.di.deviceDataManager.getDevicePorts(deviceId).then((res) => {
          let ports = [];

          if(!res.data.ports.length) {
            scope.removeDeviceDisabled = true;
            DI.notificationService.renderWarning(scope, this.translate('MODULES.VLAN.TAB.ADD_DEVICE_FAILED'));
            return;
          }

          res.data.ports.forEach((port) => {
            ports.push({
              id: parseInt(port.port) || port.port,
              title: port.annotations.portName,
              selected: false
            });
          });

          let halfNum = Math.ceil(ports.length / 2);
          scope.vlanModel.addedDevices.push({
            id: deviceId,
            name: res.data.annotations.name,
            ports: ports
          })

          scope.vlanModel.portsNumPerRow = halfNum > scope.vlanModel.portsNumPerRow ? halfNum : scope.vlanModel.portsNumPerRow;
        });

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
      // TODO: add new vlan
      if (scope) {

      }
    }

    scope.formatPortsToStr = (ports) => {
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

    let batchChangePortsInterval = null;
    scope.batchChangePorts = (index, portsStr) => {
      const getPortsArrayFromStr = this.getPortsArrayFromStr;
      function handleBatch() {
        let regex = new RegExp(scope.portsBatchRegex)
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

    scope.changeFilterType = (value) => {
      if (scope.model.selectedFilterType == value) return;
      scope.model.subFilterItems = scope.model.selectedFilterType.value === 'device'
            ? this.scope.model.devicesMapArr : this.scope.model.vlansMapArr;
      console.log(value);
      scope.model.selectedSubFilter = this.scope.model.subFilterItems[0];
      scope.changeDisplayPorts();
    };

    scope.changeDisplayPorts = (value) => {
      if (scope.model.selectedSubFilter == value) return;
      console.log(value);
      scope.model.vlanPortsList = this.getPortListFromConfig();
    };

    unsubscribers.push(scope.$watch('vlanModel.selectedDevice', () => {
      if (!scope.vlanModel || scope.vlanModel.selectedDevice.value == '') {
        scope.addDeviceDisabled = true;
        scope.removeDeviceDisabled = true;
        return;
      }

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
    }, true));

    scope.$on('$destroy', () => {
      unsubscribers.forEach((cb) => {
        cb();
      });
    });

    this.init();
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
    });

    //init table
    this.scope.model.provider = this.di.tableProviderFactory.createProvider({
      query: (params) => {
        let defer = this.di.$q.defer();
        this.di.vlanDataManager.getVlanConfig().then((res)=>{
          this.scope.model.vlansMapArr = this.getVlanOptionsFromConfig(res.data.devices);
          this.entityStandardization(res.data.devices);
          defer.resolve({
            data: this.scope.vlanModel.entities
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

    if(scope.tabSelected.type == 'edit') {
      const modeOptions = [{label: 'access', value: 'access'}, {label: 'trunk', value: 'trunk'}, {label: 'hybrid', value: 'hybrid'}]
      let devicesOptions = [];

      scope.model.vlanConfig.forEach((device) => {
        let index = scope.model.devicesMapArr.findIndex((map) => {
          return map.value == device['device-id']
        })

        if(index > -1) {
          devicesOptions.push(scope.model.devicesMapArr[index])
        } else {
          devicesOptions.push({label: device['device-id'], value: device['device-id']})
        }
      })

      scope.vlanModel = {
        editType: 'edit_vlan',
        editSelectedType: 'vlan',
        devicesOptions: devicesOptions,
        vlanOptions: [],
        portsOptions: [],
        selectedVlan: '',
        selectedPort: '',
        selectedDevice: devicesOptions[0],
        addedDevices: [],
        portsNumPerRow: 0,
        selectedMode: modeOptions[0],
        modeOptions: modeOptions
      }

      // editable table options
      scope.vlanModel.actionsShow = this.getActionsShow();

      scope.vlanModel.provider = this.di.tableProviderFactory.createProvider({
        query: (params) => {
          let defer = this.di.$q.defer();
          this.di.vlanDataManager.getVlanConfig().then((res)=>{
            this.scope.model.vlansMapArr = this.getVlanOptionsFromConfig(res.data.devices);
            this.entityStandardization(res.data.devices);
            defer.resolve({
              data: this.scope.model.entities
            });
          });
          return defer.promise;
        },
        getSchema: () => {
          return {
            schema: scope.vlanModel.editSelectedType == 'vlan' ? this.di.vlanService.getPortsListSchema() : this.di.vlanService.getVlanListSchema(),
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

      scope.portsBatchRegex = '^([1-9]+[0-9]*)([-]{1}[1-9]+[0-9]*)*(,([1-9]+[0-9]*)([-]{1}[1-9]+[0-9]*)*)*$';
      scope.vlanInputRegex = '^([1-9]+[0-9]*)(,[1-9]+[0-9]*)*$';
      scope.nativeVlanRegex = '^[1-9]+[0-9]*$';
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

  getEntities(params) {
    let defer = this.di.$q.defer();
    switch (this.scope.tabSelected.type) {
      case 'default':
        this.di.deviceDataManager.getDHCPRelayDefault().then((data) => {
          defer.resolve({'data': data});
        });
        break;
      case 'indirect':
        this.di.deviceDataManager.getDHCPRelayIndirect().then((data) => {
          defer.resolve({'data': data});
        });
        break;
      case 'interface':
        this.di.deviceDataManager.getDHCPRelayInterface().then((data) => {
          defer.resolve({'data': data});
        });
        break;
      case 'counter':
        this.di.deviceDataManager.getDHCPRelayCounters().then((data) => {
          defer.resolve({'data': data});
        });
        break;
    }
    return defer.promise;
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
    this.scope.vlanModel.entities = [];
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
        if(this.scope.vlanModel.editSelectedType == 'vlan') {
          entities.forEach((device) => {
            if(device['device-id'] == this.scope.vlanModel.selectedDevice.value) {
              device.ports.forEach((port) => {
                let obj = {};
                let vlans = [];
                port.vlans.forEach((vlan) => {
                  let vlanArr = vlan.split("/");
                  vlans.push({id: vlanArr[0], type: vlanArr[1]});
                })

                let foundVlan = vlans.find((vlan) => {
                  return vlan.id == this.scope.vlanModel.selectedVlan;
                })

                if(foundVlan) {
                  obj['id'] = device['device-id'] + '_' + port.port;
                  obj['port'] = port.port;
                  obj['mode'] = port.mode;
                  obj['pvid'] = port.native;
                  obj['membership_type'] = foundVlan.type;
                  this.scope.vlanModel.entities.push(obj);
                }
              });
            }
          });
        } else {
          entities.forEach((device) => {
            if(device['device-id'] == this.scope.vlanModel.selectedDevice.value) {
              device.ports.forEach((port) => {
                let obj = {};
                let vlans = [];
                port.vlans.forEach((vlan) => {
                  vlans.push(vlan.split("/")[0]);
                })

                if(vlans.indexOf(this.scope.vlanModel.selectedVlan)) {
                  obj['id'] = device['device-id'] + '_' + port.port;
                  obj['port'] = port.port;
                  obj['type'] = port.mode;
                  obj['vlan'] = port.vlans.toString();
                  obj['pvid'] = port.native;
                  this.scope.vlanModel.entities.push(obj);
                }
              });
            }
          });
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
  		this.scope.model.vlanConfig.forEach((device => {
  			if (device['device-id'] === this.scope.model.selectedSubFilter.value) {
  				let ports = this.getPortsFromDevice(device['device-id']);
  				device.vlans.forEach((vlan) => {
  					result.push({
  						id: device['device-id'] + '_' + vlan.vlan,
  						port: this.di._.cloneDeep(ports)
  					}); 
  				});
  			}
  		}));
  	}
  	else {
  		//vlan
  		
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
}

VlanController.$inject = VlanController.getDI();
VlanController.$$ngIsClass = true;
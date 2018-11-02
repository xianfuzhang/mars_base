export class DeviceDetailController {
  static getDI() {
    return [
      '$scope',
      '$rootScope',
      '$routeParams',
      '$filter',
      '$q',
      '$log',
      '_',
      'flowService',
      'deviceService',
      'deviceDetailService',
      'notificationService',
      'dialogService',
      'deviceDataManager',
      'tableProviderFactory'
    ];
  }
  constructor(...args){
    this.di = {};
    DeviceDetailController.getDI().forEach((value, index) => {
      this.di[value] = args[index];
    });
    this.scope = this.di.$scope;
    this.translate = this.di.$filter('translate');
    this.scope.page_title = this.translate('MODULES.SWITCH.DETAIL.TITLE');
    this.scope.deviceId = this.di.$routeParams['deviceId'];
    this.scope.tabSelected = null;
    this.scope.tabs = this.di.deviceDetailService.getTabSchema();
    this.scope.detailDisplay= false;
    this.scope.detailValue= null;
    this.scope.detailModel = {
      provider: null,
      actionsShow: null,
      api: null,
      schema: [],
      rowActions: [],
      entities: [],
      total: null
    };

    this.prepareScope();

    this.di.deviceDataManager.getDeviceConfig(this.scope.deviceId).then((res) => {
      if (res) {
        this.scope.detailDisplay = true;
        this.scope.detailValue = res;

        this.scope.page_title = this.translate('MODULES.SWITCH.DETAIL.TITLE') + "(" + this.scope.detailValue.name + ")";
        this.scope.detailValue.leaf_group = !this.scope.detailValue.leaf_group ? '-' : this.scope.detailValue.leaf_group;
      }
      this.init();
    });

    let unSubscribers = [];
    unSubscribers.push(this.di.$rootScope.$on('device-flow-refresh',()=>{
      this.scope.detailModel.api.queryUpdate();
    }));
  
    unSubscribers.push(this.di.$rootScope.$on('group-list-refresh',()=>{
      this.scope.detailModel.api.queryUpdate();
    }));
    
    this.scope.$on('$destroy', () => {
      unSubscribers.forEach((unSubscribe) => {
        unSubscribe();
      });
    });
  }

  prepareScope() {
    this.scope.onApiReady = ($api) => {
      this.scope.detailModel.api = $api;
    };

    this.scope.onTabChange= (tab) => {
      if (tab){
        this.scope.tabSelected = tab;
        this.prepareTableData();
      }
    };

    this.scope.onTableRowClick = (event) => {
      if (event.$data){
        this.scope.detailModel.api.setSelectedRow(event.$data.id);
      }
    };

    this.scope.onTableRowActionsFilter = (event) => {
      let filterActions = [];
      if (event.data) {
        switch (this.scope.tabSelected.type){
          case 'port':
            event.actions.forEach((action) =>{
              if (event.data.isEnabled && action.value === 'disable') {
                filterActions.push(action);
              }
              else if (!event.data.isEnabled && action.value === 'enable') {
                filterActions.push(action);
              }
            });
            break;
          case 'flow':
            break;
          case 'group':
            // TODO: complete the group delete action
            break;
        }
      }
      return filterActions;
    };

    this.scope.onTableRowSelectAction = (event) => {
      if (event.data) {
        switch (this.scope.tabSelected.type){
          case 'port':
            let enabled = event.action.value === 'enable' ?  true : false;
            this.di.deviceDataManager.changePortState(event.data.element, event.data.port_id, {'enabled': enabled})
              .then((res) => {
                event.data.isEnabled = !event.data.isEnabled;
                this.scope.detailModel.entities.forEach((item) => {
                  if (item.element === event.data.element && item.port_id === event.data.port_id) {
                    item.port_status = event.data.isEnabled === true ?
                      this.translate('MODULES.SWITCHES.PORT.ROW.ACTION.ENABLE') :
                      this.translate('MODULES.SWITCHES.PORT.ROW.ACTION.DISABLE');
                    this.scope.detailModel.api.update();
                  }
                });

                this.scope.$emit('change-device-port-state', {data: event.data});
              });
            break;
          case 'flow':
            let flowId = event.data.id;
            this.di.deviceDataManager.deleteDeviceFlow(this.scope.deviceId, flowId)
              .then((res) => {
                this.scope.detailModel.api.queryUpdate();
              }, (res) => {
                this.scope.alert = {
                  type: 'warning',
                  msg: res.data
                }
              this.di.notificationService.render(this.scope);
              });
            break;
          case 'group':
            // TODO: group data
            let groupId = event.data.id;
            this.di.deviceDataManager.deleteDeviceGroup(this.scope.deviceId, groupId)
              .then((res) => {
                this.scope.detailModel.api.queryUpdate();
              }, (res) => {
                this.scope.alert = {
                  type: 'warning',
                  msg: res.data
                }
                this.di.notificationService.render(this.scope);
              });
            break;
        }
      }
    };

    this.scope.createFlow = () => {
      this.di.$rootScope.$emit('flow-wizard-show', this.scope.deviceId);
    };
  
    this.scope.createGroup = () => {
      this.di.$rootScope.$emit('group-wizard-show', this.scope.deviceId);
    };

    this.scope.batchRemove = ($value) => {
      if ($value.length) {
        this.di.dialogService.createDialog('warning', this.translate('MODULES.SWITCH.DETAIL.DIALOG.CONTENT.BATCH_DELETE_FLOWS'))
          .then(() =>{
            this.batchDeleteDeviceFlows($value);
          }, () =>{
            this.di.$log.debug('delete switch flows cancel');
          });
      }
    };
  }

  init() {
    this.scope.detailModel.provider = this.di.tableProviderFactory.createProvider({
      query: (params) => {
        let defer = this.di.$q.defer();
        this.getEntities(params).then((res) => {
          this.entityStandardization(res.data);
          this.scope.detailModel.total = res.total;
          defer.resolve({
            data: this.scope.detailModel.entities,
            count: this.scope.detailModel.total
          });
        });
        return defer.promise;
      },
      getSchema: () => {
        return {
          schema: this.scope.detailModel.schema,
          index_name: this.getDataType().index_name,
          rowCheckboxSupport: this.getDataType().rowCheckboxSupport,
          rowActionsSupport: this.getDataType().rowActionsSupport
        };
      }
    });
    this.scope.onTabChange(this.scope.tabs[0]);
  }

  prepareTableData() {
    this.scope.detailModel.schema = this.getSchema(this.scope.tabSelected.type);
    this.scope.detailModel.actionsShow = this.getActionsShow(this.scope.tabSelected.type);
    this.scope.detailModel.rowActions = this.getRowActions(this.scope.tabSelected.type);
    //this.scope.detailModel.entities = this.getEntities(this.scope.tabSelected.type);
  }

  getSchema(type) {
    let schema;
    switch (type) {
      case 'port':
        schema = this.di.deviceDetailService.getDevicePortsSchema();
        break;
      case 'link':
        schema = this.di.deviceDetailService.getDeviceLinksSchema();
        break;
      case 'statistic':
        schema = this.di.deviceDetailService.getDevicePortsStatisticsSchema();
        break;
      case 'flow':
        schema = this.di.deviceDetailService.getDeviceFlowsSchema();
        break;
      case 'endpoint':
        schema = this.di.deviceService.getEndpointTableSchema();
        break;
      case 'group':
        schema = this.di.deviceDetailService.getDeviceGroupsSchema();
        break;
    }
    return schema;
  }

  getActionsShow(type) {
    let actions;
    switch (type) {
      case 'port':
        actions = this.di.deviceDetailService.getPortActionsShow();
        break;
      case 'link':
        actions = this.di.deviceDetailService.getLinkActionsShow();
        break;
      case 'statistic':
        actions = this.di.deviceDetailService.getStatisticActionsShow();
        break;
      case 'flow':
        actions = this.di.deviceDetailService.getFlowActionsShow();
        break;
      case 'endpoint':
        actions = this.di.deviceDetailService.getEndpointActionsShow();
        break;
      case 'group':
        actions = this.di.deviceDetailService.getGroupActionsShow();
        break;
    }
    return actions;
  }

  getDataType() {
    let schema = {};
    if (this.scope.detailModel.entities.length === 0) {
      return {
        index_name: '',
        rowCheckboxSupport: false,
        rowActionsSupport: false,
      };
    }
    switch (this.scope.tabSelected.type) {
      case 'port':
        schema['index_name'] = 'id';
        schema['rowCheckboxSupport'] = false;
        schema['rowActionsSupport'] = true;
        break;
      case 'link':
        schema['index_name'] = 'id';
        schema['rowCheckboxSupport'] = false;
        schema['rowActionsSupport'] = false;
        break;
      case 'statistic':
        schema['index_name'] = 'id';
        schema['rowCheckboxSupport'] = false;
        schema['rowActionsSupport'] = false;
        break;
      case 'flow':
        schema['index_name'] = 'id';
        schema['rowCheckboxSupport'] = true;
        schema['rowActionsSupport'] = true;
        break;
      case 'endpoint':
        schema['index_name'] = 'mac';
        schema['rowCheckboxSupport'] = false;
        schema['rowActionsSupport'] = false;
        break;
      case 'group':
        schema['index_name'] = 'id';
        schema['rowCheckboxSupport'] = true;
        schema['rowActionsSupport'] = true;
        break;
    }
    return schema;
  }

  getEntities(params) {
    let defer = this.di.$q.defer();
    switch (this.scope.tabSelected.type) {
      case 'port':
        this.di.deviceDataManager.getDevicePorts(this.scope.deviceId, params).then((res) => {
          defer.resolve({'data': res.data, 'total': res.data.total});
        });
        break;
      case 'link':
        this.di.deviceDataManager.getDeviceLinks(this.scope.deviceId, params).then((res) => {
          defer.resolve({'data': res.data, 'total': res.data.total});
        });
        break;
      case 'statistic':
        this.di.deviceDataManager.getDevicePortsStatistics(this.scope.deviceId, params).then((res) => {
          defer.resolve({'data': res.data.statistics, 'total': res.data.total});
        });
        break;
      case 'flow':
        this.di.deviceDataManager.getDeviceFlows(this.scope.deviceId, params).then((res) => {
          defer.resolve({'data': res.data.flows, 'total': res.data.total});
        });
        break;
      case 'endpoint':
        this.di.deviceDataManager.getEndpoints(params).then((res) => {
          defer.resolve({'data': res.data.hosts, 'total': res.data.total});
        });
        break;
      case 'group':
        this.di.deviceDataManager.getDeviceGroups(this.scope.deviceId, params).then((res) => {
          defer.resolve({'data': res.data.groups, 'total': res.data.total});
        });
        break;
    }
    return defer.promise;
  }

  entityStandardization(entities) {
    this.scope.detailModel.entities = [];
    switch (this.scope.tabSelected.type) {
      case 'port':
        entities.ports.forEach((entity) => {
          let obj = {};
          obj['id'] = entity.element + '_' + entity.port;
          obj['element'] = entity.element;
          obj['port_name'] = entity.annotations.portName;
          obj['port_mac'] = entity.annotations.portMac;
          obj['port_id'] = entity.port;
          obj['isEnabled'] = entity.isEnabled;
          obj['port_status'] = entity.isEnabled === true ?
            this.translate('MODULES.SWITCHES.PORT.ROW.ACTION.ENABLE') :
            this.translate('MODULES.SWITCHES.PORT.ROW.ACTION.DISABLE');
          obj['link_status'] = entity.annotations.linkStatus;;
          obj['type'] = entity.type;
          obj['speed'] = entity.portSpeed;
          this.scope.detailModel.entities.push(obj);
        });
        break;
      case 'link':
        entities.links.forEach((entity) => {
          let obj = {};
          obj['id'] =  entity.src.device + '_' + entity.src.port;
          obj['src_device'] = entity.src.device;
          obj['src_port'] = entity.src.port;
          obj['dst_device'] = entity.dst.device;
          obj['dst_port'] = entity.dst.port;
          obj['state'] = entity.state;
          obj['type'] = entity.type;
          if(entity.annotations){
            obj['duration'] = entity.annotations.durable;
            obj['protocol'] = entity.annotations.protocol;
            obj['latency'] = entity.annotations.latency;
          }
          this.scope.detailModel.entities.push(obj);
        });
        break;
      case 'statistic':
        entities.forEach((entity) => {
          entity.ports.forEach((port) => {
            let obj = {};
            obj['id'] = entity.device + '_' + port.port;
            obj['device'] = entity.device;
            obj['port'] = port.port;
            obj['rx_pkt'] = port.packetsReceived;
            obj['tx_pkt'] = port.packetsSent;
            obj['rx_byte'] = port.bytesReceived;
            obj['tx_byte'] = port.bytesSent;
            obj['rx_pkt_drop'] = port.packetsRxDropped;
            obj['tx_pkt_drop'] = port.packetsTxDropped;
            obj['rx_pkt_error'] = port.packetsRxErrors;
            obj['tx_pkt_error'] = port.packetsTxErrors;
            obj['duration'] = port.durationSec;
            this.scope.detailModel.entities.push(obj);
          });
        });
        break;
      case 'flow':
        entities.forEach((entity) => {
          let obj = {};
          obj['id'] = entity.id;
          obj['state'] = entity.state;
          obj['packets'] = entity.packets;
          obj['duration'] = entity.life;
          obj['priority'] = entity.priority;
          obj['name'] = entity.tableId;
          obj['selector'] = this.di.flowService.selectorHandler(entity.selector);
          obj['treatment'] = this.di.flowService.treatmentHander(entity.treatment);
          obj['app'] = entity.appId;
          this.scope.detailModel.entities.push(obj);
        });
        break;
      case 'endpoint':
        entities.forEach((entity) => {
          if (this.di._.find(entity.locations, {'device_id': this.scope.deviceId}) ||
              this.di._.find(entity.locations, {'elementId': this.scope.deviceId})) {
            let obj = {};
            obj.id = entity.id;
            obj.mac = entity.mac;
            obj.tenant_name = entity.tenant;
            obj.segment_name = entity.segment|| entity.vlan;;
            obj.ip = (entity.ip_addresses && entity.ip_addresses.join(" | ")) 
              || (entity.ipAddresses && entity.ipAddresses.join(" | "));
            let locals = [];
            entity.locations.forEach((location) => {
              if ((location.device_id || location.elementId) === this.scope.deviceId) {
                locals.push(this.scope.detailValue.name + '/' + location.port);
              }
            });
            obj.location = locals.join(" | ");
            this.scope.detailModel.entities.push(obj);
          }
        });
        break;
      case 'group':
        // TODO: complete group data
        entities.forEach((entity) => {
          let obj = {};
          let groupObj = this.di.deviceDataManager.parseDeviceGroup(entity.id);
          obj['id'] = entity.id;
          obj['group_id'] = '0x' + entity.id.toString(16); // 转16进制
          obj['name'] = groupObj.name;
          obj['vlan_id'] = groupObj.vlan_id;
          obj['type'] = entity.type;
          obj['buckets'] = JSON.stringify(entity.buckets);
          this.scope.detailModel.entities.push(obj);
        });
        break;
    }
  }

  getRowActions(type) {
    let actions = [];
    switch (type) {
      case 'port':
        actions = this.di.deviceDetailService.getDevicePortsTableRowActions();
        break;
      case 'flow':
        actions = this.di.deviceDetailService.getDeviceFlowsTableRowActions();
        break;
      case 'group':
        actions = this.di.deviceDetailService.getDeviceGroupsTableRowActions();
        break;
    }
    return actions;
  }

  batchDeleteDeviceFlows(arr) {
    let deferredArr = [];
    arr.forEach((item) => {
      let defer = this.di.$q.defer();
      let flowId = item.id;
      this.di.deviceDataManager.deleteDeviceFlow(this.scope.deviceId, flowId)
        .then(() => {
          defer.resolve();
        }, () => {
          defer.resolve();
        });
      deferredArr.push(defer.promise);
    });

    this.di.$q.all(deferredArr).then(() => {
      this.scope.detailModel.api.queryUpdate();
    });

    this.scope.$emit('batch-delete-endpoints');
  }
}
DeviceDetailController.$inject = DeviceDetailController.getDI();
DeviceDetailController.$$ngIsClass = true;
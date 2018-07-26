export class DeviceDetailController {
  static getDI() {
    return [
      '$scope',
      '$routeParams',
      '$filter',
      '$q',
      '$log',
      'deviceDetailService',
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

    this.di.deviceDataManager.getDeviceDetail(this.scope.deviceId).then((res) => {
      if (res) {
        this.scope.detailDisplay = true;
        this.scope.detailValue = res.data;
      }
      this.init();
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
            break;
        }
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
        schema = this.di.deviceDetailService.getDeviceSFlowsSchema();
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
          defer.resolve({'data': res.data.ports, 'total': res.data.total});
        });
        break;
      case 'flow':
        this.di.deviceDataManager.getDeviceFlows(this.scope.deviceId, params).then((res) => {
          defer.resolve({'data': res.data.flows, 'total': res.data.total});
        });
        break;
    }
    return defer.promise;
  }

  entityStandardization(entities) {
    this.scope.detailModel.entities = [];
    switch (this.scope.tabSelected.type) {
      case 'port':
        entities.forEach((entity) => {
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
        entities.forEach((entity) => {
          let obj = {};
          obj['id'] =  entity.src.device + '_' + entity.src.port;
          obj['src_device'] = entity.src.device;
          obj['src_port'] = entity.src.port;
          obj['dst_device'] = entity.dst.device;
          obj['dst_port'] = entity.dst.port;
          obj['state'] = entity.state;
          obj['type'] = entity.type;
          obj['duration'] = entity.annotations.durable;
          obj['protocol'] = entity.annotations.protocol;
          obj['latency'] = entity.annotations.latency;
          this.scope.detailModel.entities.push(obj);
        });
        break;
      case 'statistic':
        entities.forEach((entity) => {
          let obj = {};
          obj['id'] = entity.deviceId + '_' + entity.port;
          obj['device'] = entity.device;
          obj['port'] = entity.port;
          obj['rx_pkt'] = entity.packetsReceived;
          obj['tx_pkt'] = entity.packetsSent;
          obj['rx_byte'] = entity.bytesReceived;
          obj['tx_byte'] = entity.bytesSent;
          obj['rx_pkt_drop'] = entity.packetsRxDropped;
          obj['tx_pkt_drop'] = entity.packetsTxDropped;
          obj['rx_pkt_error'] = entity.packetsRxErrors;
          obj['tx_pkt_error'] = entity.packetsTxErrors;
          obj['duration'] = entity.durationSec;
          this.scope.detailModel.entities.push(obj);
        });
        break;
      case 'flow':
        entities.forEach((entity) => {
          let obj = {};
          obj['id'] = entity.id;
          obj['ip'] = entity.collector_ip;
          obj['payload'] = entity.max_payload_length;
          obj['header'] = entity.max_header_length;
          obj['interval'] = entity.polling_interva;
          obj['rate'] = entity.sample_rate;
          obj['port'] = entity.port;
          obj['duration'] = entity.duration;
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
        break;
    }
    return actions;
  }
}
DeviceDetailController.$inject = DeviceDetailController.getDI();
DeviceDetailController.$$ngIsClass = true;
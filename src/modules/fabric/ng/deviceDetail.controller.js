export class DeviceDetailController {
  static getDI() {
    return [
      '$scope',
      '$rootScope',
      '$routeParams',
      '$filter',
      '$q',
      '$log',
      '$location',
      '_',
      'roleService',
      'flowService',
      'colorService',
      'deviceService',
      'deviceDetailService',
      'notificationService',
      'dialogService',
      'deviceDataManager',
      'tableProviderFactory',
      'modalManager',
      'applicationService',
      'logicalDataManager',
      'chartService',
      'dateService'
    ];
  }
  constructor(...args){
    this.di = {};
    DeviceDetailController.getDI().forEach((value, index) => {
      this.di[value] = args[index];
    });
    this.scope = this.di.$scope;
    const scope = this.di.$scope;
    this.translate = this.di.$filter('translate');
    this.scope.page_title = this.translate('MODULES.SWITCH.DETAIL.TITLE');
    this.scope.deviceId = this.di.$routeParams['deviceId'];
    this.scope.role = this.di.roleService.getRole();
    this.scope.tabSelected = null;
    this.scope.tabSwitch = false;
    this.scope.tabs = [];
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

    let date = this.di.dateService.getTodayObject();
    let before = this.di.dateService.getBeforeDateObject(30*60*1000); // 前30分钟
    let one_minute_before = this.di.dateService.getBeforeDateObject(60 * 1000); // 前1分钟
    const GRID_NUM = 24; // chart grid number
    let begin_time = new Date(before.year, before.month, before.day, before.hour, before.minute, 0);
    let one_minute_before_time = new Date(one_minute_before.year, one_minute_before.month, one_minute_before.day, one_minute_before.hour, one_minute_before.minute, 0);
    let end_time = new Date(date.year, date.month, date.day, date.hour, date.minute, 0);

    scope.portUnitTypes = [{
      label: 'Packets_TX',
      value: 'packets_tx'
    },{
      label: 'Packets_RX',
      value: 'packets_rx'
    },{
      label: 'Bytes_TX',
      value: 'bytes_tx'
    },{
      label: 'Bytes_RX',
      value: 'bytes_rx'
    }];

    scope.portStateTypes = [{
      label: 'Normal',
      value: 'normal'
    },{
      label: 'Dropped',
      value: 'dropped'
    },{
      label: 'Error',
      value: 'error'
    }];

    this.di.$scope.chartModel = {
      cpu: {
        'begin_time': begin_time,
        'end_time': end_time,
        'step': (end_time.getTime() - begin_time.getTime()) / (GRID_NUM * 1000),
        'origin_begin_time': begin_time,
        'origin_end_time': end_time,
        'analyzer': [],
        loading: true
      },
      memory: {
        'begin_time': begin_time,
        'end_time': end_time,
        'step': (end_time.getTime() - begin_time.getTime()) / (GRID_NUM * 1000),
        'origin_begin_time': begin_time,
        'origin_end_time': end_time,
        'analyzer': [],
        loading: true

      },
      disk: {
        'begin_time': one_minute_before_time,
        'end_time': end_time,
        'step': 60,
        'origin_begin_time': one_minute_before_time,
        'origin_end_time': end_time,
        'analyzer': [],
        loading: true
      },
      port: {
        'begin_time': begin_time,
        'end_time': end_time,
        'step': (end_time.getTime() - begin_time.getTime()) / (GRID_NUM * 1000),
        'origin_begin_time': begin_time,
        'origin_end_time': end_time,
        'analyzer': [],
        loading: true,
        unitTypeOption: {label: 'Packets_TX', value: 'packets_tx'},
        stateTypeOption: {label: 'Normal',value: 'normal'},
        display: false
      },
      top10ports: {
        'begin_time': begin_time,
        'end_time': end_time,
        'step': (end_time.getTime() - begin_time.getTime()) / (GRID_NUM * 1000),
        'origin_begin_time': begin_time,
        'origin_end_time': end_time,
        'analyzer': [],
        loading: true,
        unitTypeOption: {label: 'Packets_TX', value: 'packets_tx'},
        stateTypeOption: {label: 'Normal',value: 'normal'},
        display: false
      }
    };

    this.di.$scope.deviceCpuChartConfig = {
      data: [],
      labels: [],
      options: {},
      series: [],
      onClick: () => {},
      isRealtime: false
    }
    this.di.$scope.deviceMemoryChartConfig = {
      data: [],
      labels: [],
      options: {},
      series: [],
      onClick: () => {},
      isRealtime: false
    }
    this.di.$scope.deviceDiskChartConfig = {
      data: [],
      labels: [],
      options: {},
      series: [],
      onClick: () => {},
      isRealtime: false
    }

    this.di.$scope.devicePortChartConfig = {
      data: [],
      labels: [],
      options: {},
      series: [],
      onClick: () => {},
      isRealtime: false,
    }

    this.scope.isOpenflowEnable= false;
    this.scope.isQosEnable= false;
    this.scope.isSwtManageEnable= false;
    this.scope.isHCEnable= false;
    this.scope.isTenantEnable= false;
    this.scope.isEndpointEnable= false;

    this.scope.summary = {
      fanSensors: [],
      tempSensors: [],
      psuSensors: []
    };

    this.prepareScope();
    this.init_application_license().then(()=>{
      this.di.deviceDataManager.getDeviceConfig(this.scope.deviceId).then((res) => {
        if (res) {
          this.scope.detailDisplay = true;
          this.scope.detailValue = res;

          this.scope.page_title = this.translate('MODULES.SWITCH.DETAIL.TITLE') + "(" + this.scope.detailValue.name + ")";
          this.scope.detailValue.leaf_group = !this.scope.detailValue.leaf_group ? '-' : this.scope.detailValue.leaf_group;

          // res.mfr = 'pica8'; //Test code
          if(res.mfr.toLowerCase() === 'pica8' || res.mfr.toLowerCase() === 'h3c'){
            this.di._.remove(this.scope.tabs, (tab)=>{
              return tab['value'] === 'group';
            });
          }
        }
        this.init();
      });
    });

    this.scope.resetTimeScale = (type) => {
      if (type === 'device-cpu') {
        this.di.$scope.chartModel.cpu.begin_time = scope.chartModel.cpu.origin_begin_time;
        this.di.$scope.chartModel.cpu.end_time = scope.chartModel.cpu.origin_end_time;
        this.di.$scope.chartModel.cpu.step = Math.floor((scope.chartModel.cpu.origin_end_time.getTime() - scope.chartModel.cpu.origin_begin_time) / (GRID_NUM * 1000));
      }
      else if (type === 'device-memory') {
        this.di.$scope.chartModel.memory.begin_time = scope.chartModel.memory.origin_begin_time;
        this.di.$scope.chartModel.memory.end_time = scope.chartModel.memory.origin_end_time;
        this.di.$scope.chartModel.memory.step = Math.floor((scope.chartModel.memory.origin_end_time.getTime() - scope.chartModel.memory.origin_begin_time) / (GRID_NUM * 1000));
      }
      else if (type === 'device-port') {
        this.di.$scope.chartModel.port.begin_time = scope.chartModel.port.origin_begin_time;
        this.di.$scope.chartModel.port.end_time = scope.chartModel.port.origin_end_time;
        this.di.$scope.chartModel.port.step = Math.floor((scope.chartModel.port.origin_end_time.getTime() - scope.chartModel.port.origin_begin_time) / (GRID_NUM * 1000));
      }
    }

    this.scope.chartSetting = (type) => {
      let chartDataArr = [], selectedData = [];
      let beginTime, endTime, unitTypeOption, stateTypeOption;
      switch(type) {
        case 'device-cpu':
          beginTime = this.di.$scope.chartModel.cpu.begin_time;
          endTime = this.di.$scope.chartModel.cpu.end_time;
          break;
        case 'device-memory':
          beginTime = this.di.$scope.chartModel.memory.begin_time;
          endTime = this.di.$scope.chartModel.memory.end_time;
          break;
        case 'device-port':
          beginTime = this.di.$scope.chartModel.port.begin_time;
          endTime = this.di.$scope.chartModel.port.end_time;
          break;
      }

      this.di.modalManager.open({
        template: require('../template/chart_setting.html'),
        controller: 'deviceChartSettingCtrl',
        windowClass: 'show-chart-setting-modal',
        resolve: {
          dataModel: () => {
            let model = {
              chartType: type,
              beginTime: beginTime,
              endTime: endTime
            };

            return model;
          }
        }
      }).result.then((res) => {
        if (res && !res.canceled) {
          switch(type) {
            case 'device-cpu':
              scope.chartModel.cpu.origin_begin_time = res.data.beginTime;
              scope.chartModel.cpu.origin_end_time = res.data.endTime;
              scope.chartModel.cpu.begin_time = res.data.beginTime;
              scope.chartModel.cpu.end_time = res.data.endTime;
              scope.chartModel.cpu.step = Math.floor((scope.chartModel.cpu.origin_end_time.getTime() - scope.chartModel.cpu.origin_begin_time) / (GRID_NUM * 1000));
              break;
            case 'device-memory':
              scope.chartModel.memory.origin_begin_time = res.data.beginTime;
              scope.chartModel.memory.origin_end_time = res.data.endTime;
              scope.chartModel.memory.begin_time = res.data.beginTime;
              scope.chartModel.memory.end_time = res.data.endTime;
              scope.chartModel.memory.step = Math.floor((scope.chartModel.memory.origin_end_time.getTime() - scope.chartModel.memory.origin_begin_time) / (GRID_NUM * 1000));
              break;
            case 'device-port':
              scope.chartModel.port.origin_begin_time = res.data.beginTime;
              scope.chartModel.port.origin_end_time = res.data.endTime;
              scope.chartModel.port.begin_time = res.data.beginTime;
              scope.chartModel.port.end_time = res.data.endTime;
              scope.chartModel.port.step = Math.floor((scope.chartModel.port.origin_end_time.getTime() - scope.chartModel.port.origin_begin_time) / (GRID_NUM * 1000));
              break;
          }
        }
      });
    }

    this.scope.closePortAnalyzerChart = () => {
      this.scope.chartModel.port.display = false;
    }

    let unSubscribers = [];
    unSubscribers.push(this.di.$rootScope.$on('device-flow-refresh',()=>{
      this.di.notificationService.renderSuccess(this.scope, this.translate('MODULES.SWITCH.DETAIL.FLOW.CREATE.SUCCESS'));
      this.scope.detailModel.api.queryUpdate();
    }));
  
    unSubscribers.push(this.di.$rootScope.$on('group-list-refresh',()=>{
      this.di.notificationService.renderSuccess(this.scope, this.translate('MODULES.SWITCH.DETAIL.GROUP.CREATE.SUCCESS'));
      this.scope.detailModel.api.queryUpdate();
    }));

    unSubscribers.push(this.di.$rootScope.$on('pfc-list-refresh',()=>{
      this.di.notificationService.renderSuccess(this.scope, this.translate('MODULES.SWITCH.DETAIL.PFC.CREATE.SUCCESS'));
      this.scope.detailModel.api.queryUpdate();
    }));

    let cpuTimeHasChanged = false;
    unSubscribers.push(this.di.$scope.$watchGroup(['chartModel.cpu.begin_time', 'chartModel.cpu.end_time'], () => {
      if(!cpuTimeHasChanged) {
        cpuTimeHasChanged = true;
        return;
      }

      this.scope.chartModel.cpu.loading = true;
      this.getDeviceCPUAnalyzer().then(() => {
        // cpu analyzer
        this.scope.chartModel.cpu.loading = false;
        this.setDeviceCpuChartData();
      });
    },true));

    let memoryTimeHasChanged = false;
    unSubscribers.push(this.di.$scope.$watchGroup(['chartModel.memory.begin_time', 'chartModel.memory.end_time'], () => {
      if(!memoryTimeHasChanged) {
        memoryTimeHasChanged = true;
        return;
      }

      this.scope.chartModel.memory.loading = true;
      this.getDeviceMemoryAnalyzer().then(() => {
        //memory analyzer
        this.scope.chartModel.memory.loading = false;
        this.setDeviceMemoryChartData();
      });
    },true));

    let diskTimeHasChanged = false;
    unSubscribers.push(this.di.$scope.$watchGroup(['chartModel.disk.begin_time', 'chartModel.disk.end_time'], () => {
      if(!diskTimeHasChanged) {
        diskTimeHasChanged = true;
        return;
      }

      this.scope.chartModel.disk.loading = true;
      this.getDeviceDiskAnalyzer().then(() => {
        //disk analyzer
        this.scope.chartModel.disk.loading = false;
        this.setDeviceDiskChartData();
      });
    },true));

    let portTimeHasChanged = false;
    unSubscribers.push(this.di.$scope.$watchGroup(['chartModel.port.begin_time', 'chartModel.port.end_time'], () => {
      if(!portTimeHasChanged) {
        portTimeHasChanged = true;
        return;
      }

      this.scope.chartModel.port.loading = true;
      this.getDevicePortAnalyzer(this.scope.port_id).then(() => {
        // interface analyzer
        this.scope.chartModel.port.loading = false;
        this.setDevicePortChartData();
      });
    },true));

    let portTypeHasChanged = false;
    unSubscribers.push(this.di.$scope.$watchGroup(['chartModel.port.unitTypeOption', 'chartModel.port.stateTypeOption'], () => {
      if(!portTypeHasChanged) {
        portTypeHasChanged = true;
        return;
      }

      this.setDevicePortChartData();
    },true));


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
      if (tab && !this.scope.tabSwitch){
        this.scope.tabSelected = tab;
        this.scope.tabSwitch = true;
        this.prepareTableData();
      }
    };

    this.scope.onTableRowClick = (event) => {
      if (event.$data){
        let rowIndex = event.$data.id;
        if(this.scope.tabSelected.type === 'pfc'){
          rowIndex = event.$data.port;
        }
        this.scope.detailModel.api.setSelectedRow(rowIndex);
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
              else if (action.value === 'analyzer') {
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
            if (event.action.value === 'analyzer') {
              this.scope.port_id = event.data.port_id;
              this.getDevicePortAnalyzer(event.data.port_id)
                .then(() => {
                  this.scope.chartModel.port.loading = false;
                  this.setDevicePortChartData();
                  this.scope.chartModel.port.display = true;
                });
            } else {
              let enabled = event.action.value === 'enable' ?  true : false;
              this.di.deviceDataManager.changePortState(event.data.element, event.data.port_id, {'enabled': enabled})
                .then((res) => {
                  event.data.isEnabled = !event.data.isEnabled;
                  this.scope.detailModel.entities.forEach((item) => {
                    if (item.element === event.data.element && item.port_id === event.data.port_id) {
                      item.port_status = event.data.isEnabled === true ? 'Up' : 'Down';
                      //item.link_status = event.data.isEnabled === true ? "available" : "unavailable";
                      this.scope.detailModel.api.update();
                    }
                  });
                });
            }

            break;
          case 'flow':
            if (event.action.value === 'detail'){
              this.di.modalManager.open({
                template: require('../template/showFlowDetail.html'),
                controller: 'showFlowDetailCtrl',
                windowClass: 'show-flow-detail-modal',
                resolve: {
                  dataModel: () => {
                    return {
                      detail: event.data.entity
                    }
                  }
                }
              });
            }
            else if (event.action.value === 'delete') {
              let flowId = event.data.id;
              this.di.dialogService.createDialog('warning', this.translate('MODULES.SWITCH.DETAIL.DIALOG.CONTENT.DELETE_FLOWS'))
                .then(() =>{
                  this.di.deviceDataManager.deleteDeviceFlow(this.scope.deviceId, flowId)
                    .then((res) => {
                      this.di.notificationService.renderSuccess(this.scope, this.translate('MODULES.SWITCH.DETAIL.FLOW.DELETE.SUCCESS'));
                      this.scope.detailModel.api.queryUpdate();
                    }, (res) => {
                      this.di.notificationService.renderWarning(this.scope, res.data);
                    });
                }, () =>{
                  this.di.$log.debug('delete switch flows cancel');
                });
            }
            break;
          case 'group':
            // TODO: group data
            let appCookie = '0x' + parseInt(event.data.id).toString(16);

            this.di.dialogService.createDialog('warning', this.translate('MODULES.SWITCH.DETAIL.DIALOG.CONTENT.DELETE_GROUP'))
              .then(() =>{
                this.di.deviceDataManager.deleteDeviceGroup(this.scope.deviceId, appCookie)
                  .then((res) => {
                    this.di.notificationService.renderSuccess(this.scope, this.translate('MODULES.SWITCH.DETAIL.GROUP.DELETE.SUCCESS'));
                    this.scope.detailModel.api.queryUpdate();
                  }, (res) => {
                    this.di.notificationService.renderWarning(this.scope, res.data);
                  });
              }, () =>{
                this.di.$log.debug('delete switch group cancel');
              });
            // this.di.deviceDataManager.deleteDeviceGroup(this.scope.deviceId, appCookie)
            //   .then((res) => {
            //     this.scope.detailModel.api.queryUpdate();
            //   }, (res) => {
            //     this.scope.alert = {
            //       type: 'warning',
            //       msg: res.data
            //     }
            //     this.di.notificationService.render(this.scope);
            //   });
            break;
          case 'pfc':
            // TODO: group data
            let portNo = event.data.port;
            if (event.action.value === 'edit'){

              this.di.$rootScope.$emit('pfc-wizard-show', this.scope.deviceId, portNo);

            } else if(event.action.value === 'delete'){
              this.di.dialogService.createDialog('warning', this.translate('MODULES.SWITCH.DETAIL.DIALOG.CONTENT.DELETE_PFC'))
                .then(() =>{
                  this.di.deviceDataManager.deletePFC(this.scope.deviceId, portNo)
                    .then((res) => {
                      this.di.notificationService.renderSuccess(this.scope, this.translate('MODULES.SWITCH.DETAIL.PFC.DELETE.SUCCESS'));
                      this.scope.detailModel.api.queryUpdate();
                    }, (res) => {
                      this.di.notificationService.renderWarning(this.scope, res.data);
                    });
                }, () =>{
                  this.di.$log.debug('delete switch pfc cancel');
                });
            }
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

    this.scope.createPFC = () => {
      this.di.$rootScope.$emit('pfc-wizard-show', this.scope.deviceId);
    };


    this.scope.batchRemove = ($value) => {
      if ($value.length) {
        if (this.scope.tabSelected.type === 'flow') {
          this.di.dialogService.createDialog('warning', this.translate('MODULES.SWITCH.DETAIL.DIALOG.CONTENT.BATCH_DELETE_FLOWS'))
            .then(() =>{
              this.batchDeleteDeviceFlows($value);
            }, () =>{
              this.di.$log.debug('delete switch flows cancel');
          });
        }
        else if (this.scope.tabSelected.type === 'group') {
          this.di.dialogService.createDialog('warning', this.translate('MODULES.SWITCH.DETAIL.DIALOG.CONTENT.BATCH_DELETE_GROUPS'))
            .then(() =>{
              this.batchDeleteDeviceGroups($value);
            }, () =>{
              this.di.$log.debug('delete switch flows cancel');
          });
        }
        
      }
    };
  }

  init() {
    this.scope.detailModel.provider = this.di.tableProviderFactory.createProvider({
      query: (params) => {
        let defer = this.di.$q.defer();
        this.getEntities(params).then((res) => {
          this.scope.tabSwitch = false;
          this.entityStandardization(res.data);
          this.scope.detailModel.total = res.total;
          defer.resolve({
            data: this.scope.detailModel.entities,
            count: this.scope.detailModel.total
          });
	
          // select the port
	        this.selectEntity();
        });
        return defer.promise;
      },
      getSchema: () => {
        return {
          schema: this.scope.detailModel.schema,
          index_name: this.getDataType().index_name,
          rowCheckboxSupport: this.getDataType().rowCheckboxSupport,
          rowActionsSupport: this.getDataType().rowActionsSupport,
          authManage: this.getDataType().authManage
        };
      }
    });
    
    // get query string
    let queryObj = this.di.$location.search();
    let selectedTab;
    let tabs = this.scope.tabs;
    if(queryObj.port) {
      selectedTab = this.di._.find(tabs, (tab) => {
        return tab.type === 'port';
      })
    } else if(queryObj.link_port) {
	    selectedTab = this.di._.find(tabs, (tab) => {
		    return tab.type === 'link';
	    })
    }
    
    selectedTab = selectedTab || this.scope.tabs[0];
    this.scope.onTabChange(selectedTab);
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
        schema = this.di.deviceDetailService.getDevicePortsSchema(this.scope.isTenantEnable);
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
      case 'pfc':
        schema = this.di.deviceDetailService.getDevicePFCSchema();

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
      case 'pfc':
        actions = this.di.deviceDetailService.getPFCActionsShow();
        break;
    }
    return actions;
  }

  getDataType() {
    let schema = {};
    /*if (this.scope.detailModel.entities.length === 0) {
      return {
        index_name: '',
        rowCheckboxSupport: false,
        rowActionsSupport: false,
      };
    }*/
    schema['authManage'] = {
      support: true,
      currentRole: this.scope.role
    };
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
      case 'pfc':
        schema['index_name'] = 'port';
        schema['rowCheckboxSupport'] = true;
        schema['rowActionsSupport'] = true;
        break;
    }
    return schema;
  }

  getEntities(params) {
    let defer = this.di.$q.defer();
    switch (this.scope.tabSelected.type) {
      case 'summary':
        let defersArr = [],
            fanDefer = this.di.$q.defer(),
            psuDefer = this.di.$q.defer(),
            tempDefer = this.di.$q.defer();
        this.di.deviceDataManager.getDeviceTemperatureSensors(this.scope.deviceId).then((data) => {
          tempDefer.resolve(data);
        });
        defersArr.push(tempDefer.promise);
        this.di.deviceDataManager.getDevicePsuSensors(this.scope.deviceId).then((data) => {
          psuDefer.resolve(data);
        });
        defersArr.push(psuDefer.promise);
        this.di.deviceDataManager.getDeviceFanSensors(this.scope.deviceId).then((data) => {
          fanDefer.resolve(data);
        });
        defersArr.push(fanDefer.promise);
        this.di.$q.all(defersArr).then((resArr) => {
          defer.resolve({'data': resArr});
        });
        break;
      case 'analyzer':
        // update time
        let date = this.di.dateService.getTodayObject();
        let before = this.di.dateService.getBeforeDateObject(30*60*1000); // 前30分钟
        let one_minute_before = this.di.dateService.getBeforeDateObject(60 * 1000); // 前1分钟
        let begin_time = new Date(before.year, before.month, before.day, before.hour, before.minute, 0);
        let one_minute_before_time = new Date(one_minute_before.year, one_minute_before.month, one_minute_before.day, one_minute_before.hour, one_minute_before.minute, 0);
        let end_time = new Date(date.year, date.month, date.day, date.hour, date.minute, 0);

        this.scope.chartModel.cpu.begin_time = begin_time;
        this.scope.chartModel.cpu.end_time = end_time;

        this.scope.chartModel.memory.begin_time = begin_time;
        this.scope.chartModel.memory.end_time = end_time;

        this.scope.chartModel.disk.begin_time = one_minute_before_time;
        this.scope.chartModel.disk.end_time = end_time;
        // this.getDeviceCPUAnalyzer().then(() => {
        //   this.setDeviceCpuChartData();
        //   this.scope.chartModel.cpu.loading = false;
        // }, (err) => {
        //   console.error("Can't get device cpu analyzer data.");
        //   this.scope.chartModel.cpu.loading = false;
        // });
        //
        // this.getDeviceMemoryAnalyzer().then(() => {
        //   this.setDeviceMemoryChartData();
        //   this.scope.chartModel.memory.loading = false;
        // }, (err) => {
        //   console.error("Can't get device memory analyzer data.");
        //   this.scope.chartModel.memory.loading = false;
        // });
        //
        // this.getDeviceDiskAnalyzer().then(() => {
        //   this.setDeviceDiskChartData();
        //   this.scope.chartModel.disk.loading = false;
        // }, (err) => {
        //   console.error("Can't get device memory analyzer data.");
        //   this.scope.chartModel.disk.loading = false;
        // });

        defer.resolve({data: []});
        break;
      case 'port':
        let deferArr = [];
        let portsDefer = this.di.$q.defer();
        let segmentsDefer = this.di.$q.defer();
        
        // get device ports
        this.di.deviceDataManager.getDevicePorts(this.scope.deviceId, params).then((res) => {
          portsDefer.resolve(res.data);
        });
        deferArr.push(portsDefer.promise);
        
        if(this.scope.role > 2 && this.scope.isTenantEnable) {
          // get segments and ports
          this.getSegmentsPorts(this.scope.deviceId).then((res) => {
            segmentsDefer.resolve(res);
          });
          deferArr.push(segmentsDefer.promise)
        }
        
        this.di.$q.all(deferArr).then((resArr) => {
          if(this.scope.role > 2 && this.scope.isTenantEnable) {
            defer.resolve({data: {ports: resArr[0].ports, segments: resArr[1]}, total: resArr[0].total});
          } else {
            defer.resolve({data: {ports: resArr[0].ports}, total: resArr[0].total});
          }
        })
        break;
      case 'link':
        this.di.deviceDataManager.getDeviceConfigs().then((devices) => {
          this.scope.switches = {};
          devices.forEach((device) => {
            this.scope.switches[device.id] = device.name;
          });
          this.di.deviceDataManager.getDeviceLinks(this.scope.deviceId, params).then((res) => {
            defer.resolve({'data': res.data, 'total': res.data.total});
          });
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
      case 'pfc':
        this.di.deviceDataManager.getPFCListByDeviceId(this.scope.deviceId).then((res) => {
          defer.resolve({'data': res.data.pfcs, 'total': res.data.total});
        });
        break;
    }
    return defer.promise;
  }
  
  getSegmentsPorts(deviceId) {
    let defer = this.di.$q.defer();
    let ports = [];
    let segmentsAndPorts = {}
    // 1. get all segments
    this.di.logicalDataManager.getSegments().then(
      (res) => {
        let segments = res.data.segments;
        let deferArr = [];
        
        // 2.get all segment_member
        segments.forEach((segment) => {
          let segmentDefer = this.di.$q.defer();
          this.di.logicalDataManager.getTenantSegmentMemberVlan(segment.tenant_name, segment.segment_name, deviceId).then(
            (res) => {
              let segmentPorts = [];
              res.data.segment_members.forEach((member) => {
                if(member.ports) {
                  segmentPorts = segmentPorts.concat(member.ports)
                }
              })
              segmentDefer.resolve({segment: segment.segment_name, tenant: segment.tenant_name, ports: segmentPorts})
            },
            (error) => {
              // console.error(error.message)
              segmentDefer.resolve({segment: segment.segment_name, ports: []})
            })
  
          deferArr.push(segmentDefer.promise);
        })
  
        // 3. get all ports
        if(deferArr.length == 0) {
          defer.resolve(segmentsAndPorts)
          return
        }
        
        this.di.$q.all(deferArr).then((resArr) => {
          resArr.forEach((res) => {
            segmentsAndPorts[res.segment] = {tenant: res.tenant, ports:res.ports}
          })
          
          defer.resolve(segmentsAndPorts)
        })
      },
      (error) => {
        defer.resolve(segmentsAndPorts)
      });
  
    return defer.promise;
  }

  getDeviceCPUAnalyzer() {
    let defer = this.di.$q.defer();
    let startTime = this.getISODate(this.di.$scope.chartModel.cpu.begin_time);
    let endTime = this.getISODate(this.di.$scope.chartModel.cpu.end_time);
    let solution_second = this.di.$scope.chartModel.cpu.step;

    this.di.deviceDataManager.getDeviceCPUAnalyzer(this.scope.detailValue.name, startTime, endTime, solution_second)
      .then((data) => {
        this.di.$scope.chartModel.cpu.analyzer = [{'id': this.scope.deviceId, 'name': this.scope.detailValue.name, 'analyzer': data}];
        defer.resolve();
      });

    return defer.promise;
  }

  getDeviceMemoryAnalyzer() {
    let defer = this.di.$q.defer();

    let startTime = this.getISODate(this.di.$scope.chartModel.memory.begin_time);
    let endTime = this.getISODate(this.di.$scope.chartModel.memory.end_time);
    let solution_second = this.di.$scope.chartModel.memory.step;

    this.di.deviceDataManager.getDeviceMemoryAnalyzer(this.scope.detailValue.name, startTime, endTime, solution_second)
      .then((data) => {
        this.di.$scope.chartModel.memory.analyzer = [{'id': this.scope.deviceId, 'name': this.scope.detailValue.name, 'analyzer': data}]
          defer.resolve();
      });

    return defer.promise;
  }

  getDeviceDiskAnalyzer(devices) {
    let defer = this.di.$q.defer();
    let startTime = this.getISODate(this.di.$scope.chartModel.disk.begin_time);
    let endTime = this.getISODate(this.di.$scope.chartModel.disk.end_time);
    let solution_second = this.di.$scope.chartModel.disk.step;

    this.di.deviceDataManager.getDeviceDiskAnalyzer(this.scope.detailValue.name, startTime, endTime, solution_second)
      .then((data) => {
        let analyzer = {'id': this.scope.deviceId, 'name': this.scope.detailValue.name};
        if (data.length > 0) {
          let analyzerArr = this.di._.orderBy(data, 'timepoint', 'desc');
          Object.assign(analyzer, analyzerArr[0])
        } else {
          analyzer.timepoint = this.getISODate(new Date());
          analyzer.used_percent = 0;
          analyzer.free_percent = 0;
          analyzer.reserved_percent = 0;
        }

        this.di.$scope.chartModel.disk.analyzer = [analyzer];
        defer.resolve();
      });

    return defer.promise;
  }

  getDevicePortAnalyzer(port) {
    let defer = this.di.$q.defer();

    let startTime = this.getISODate(this.di.$scope.chartModel.port.begin_time);
    let endTime = this.getISODate(this.di.$scope.chartModel.port.end_time);
    let solution_second = this.di.$scope.chartModel.port.step;

    this.di.deviceDataManager.getDevicePortAnalyzer(this.scope.detailValue.name, port, startTime, endTime, solution_second)
      .then((data) => {
        data = {'id': this.scope.deviceId, 'name': this.scope.detailValue.name, port_id: this.scope.port_id, 'analyzer': data}

        let analyzer = this.calcInterfaceTxRxRate([data]);
        this.di.$scope.chartModel.port.analyzer = analyzer
        defer.resolve();
      });

    return defer.promise;
  }

  setDeviceCpuChartData() {
    //cpu analyzer
    let dataArr = [];
    let series = [];
    let analyzer = this.di.$scope.chartModel.cpu.analyzer;
    let x_times = this.di._.maxBy(analyzer, function(item){return item.analyzer.length;});
    let labelsArr = analyzer.length > 0 ?
      this.getCPUMemoryTimeSeries(x_times) : [];

    if(analyzer.length) {
      analyzer.forEach((item, index) =>{
        let data = [];
        item.analyzer.forEach((record) => {
          data.push((record.system_percent + record.user_percent).toFixed(2))
        })
        dataArr.push(data);
        series.push(item.name);
      });
    }

    const scope = this.scope;
    const pad = this.pad;
    const lineChartOnZoom = this.lineChartOnZoom;
    const lineChartOnClick = this.lineChartOnClick;
    const lineChartOnHover = this.lineChartOnHover;
    const getFormatedDateTime = this.getFormatedDateTime;

    let options = {
      title: {
        display: true,
        text: this.translate('MODULES.SWITCH.DETAIL.CPU_USAGE'),
      },
      legend: {
        display: false
      },
      scales: {
        yAxes: [{
          ticks: {
            beginAtZero: false,
            callback: function(value, index, values) {
              return value.toFixed(2) + '%';
            }
          }
        }],
        xAxes: [{
          ticks: {
            callback: function(value, index, values) {
              value = new Date(value);
              return pad(value.getHours()) + ':' + pad(value.getMinutes()) + ':' + pad(value.getSeconds());
            }
          }
        }],
      },
      tooltips: {
        callbacks: {
          title: (tooltipItem) => {
            let value = new Date(labelsArr[tooltipItem[0].index]);
            return getFormatedDateTime(value);
          },
          label: function(tooltipItem, data) {
            var label = data.datasets[tooltipItem.datasetIndex].label || '';

            if (label) {
              label += ': ';
            }
            label += (tooltipItem.yLabel + '%');
            return label;
          }
        }
      },
      // Container for zoom options
      zoom: {
        // Useful for dynamic data loading
        onZoom: lineChartOnZoom('device-cpu-chart', scope)
      },
      timepoint: (new Date()).getTime()
    }

    this.di.$scope.deviceCpuChartConfig.data = dataArr;
    this.di.$scope.deviceCpuChartConfig.labels = labelsArr;
    this.di.$scope.deviceCpuChartConfig.options = options;
    this.di.$scope.deviceCpuChartConfig.series = series;
    this.di.$scope.deviceCpuChartConfig.onClick = lineChartOnClick(this.scope.chartModel.cpu.analyzer);
    // this.di.$scope.deviceCpuChartConfig.onHover = lineChartOnHover();
  };

  setDeviceMemoryChartData() {
    //memory analyzer
    let dataArr = [];
    let series = [];
    let analyzer = this.di.$scope.chartModel.memory.analyzer;
    let x_times = this.di._.maxBy(analyzer, function(item){return item.analyzer.length;});
    let labelsArr = analyzer.length > 0 ?
      this.getCPUMemoryTimeSeries(x_times) : [];

    let index = 0;
    if(analyzer.length) {
      analyzer.forEach((item, index) =>{
        let data = [];
        item.analyzer.forEach((record) => {
          data.push(record.used_percent.toFixed(2))
        })
        dataArr.push(data);
        series.push(item.name)
      })
    }

    const pad = this.pad;
    const scope = this.di.$scope;
    const lineChartOnZoom = this.lineChartOnZoom;
    const lineChartOnClick = this.lineChartOnClick;
    const lineChartOnHover = this.lineChartOnHover;
    const getFormatedDateTime = this.getFormatedDateTime;

    let options = {
      title: {
        display: true,
        text: this.translate('MODULES.SWITCH.DETAIL.MEMORY_USAGE'),
      },
      legend: {
        display: false
      },
      scales: {
        yAxes: [{
          ticks: {
            beginAtZero: false,
            callback: function(value, index, values) {
              return value.toFixed(2) + '%';
            }
          }
        }],
        xAxes: [{
          ticks: {
            callback: function(value, index, values) {
              value = new Date(value);
              return pad(value.getHours()) + ':' + pad(value.getMinutes())+ ':' + pad(value.getSeconds());
            }
          }
        }],
      },
      tooltips: {
        callbacks: {
          title: (tooltipItem) => {
            let value = new Date(labelsArr[tooltipItem[0].index]);
            return getFormatedDateTime(value);
          },
          label: function(tooltipItem, data) {
            var label = data.datasets[tooltipItem.datasetIndex].label || '';

            if (label) {
              label += ': ';
            }
            label += (tooltipItem.yLabel + '%');
            return label;
          }
        }
      },
      zoom: {
        // Useful for dynamic data loading
        onZoom: lineChartOnZoom('device-memory-chart', scope)
      },
      timepoint: (new Date()).getTime()
    };

    this.di.$scope.deviceMemoryChartConfig.data = dataArr;
    this.di.$scope.deviceMemoryChartConfig.labels = labelsArr;
    this.di.$scope.deviceMemoryChartConfig.options = options;
    this.di.$scope.deviceMemoryChartConfig.series = series;
    this.di.$scope.deviceMemoryChartConfig.onClick = lineChartOnClick(analyzer);
    // this.di.$scope.deviceMemoryChartConfig.onHover = lineChartOnHover();
  };

  setDeviceDiskChartData() {
    let labelsArr = [];

    let usedArr = [], freeArr = [], reservedArr = [];
    let analyzer = this.di.$scope.chartModel.disk.analyzer;
    this.di._.forEach(analyzer, (device)=>{
      labelsArr.push(device.name);
      usedArr.push(device.used_percent);
      freeArr.push(device.free_percent);
      reservedArr.push(device.reserved_percent);
    });

    const pad = this.pad;
    let options = {
      title: {
        text: this.translate('MODULES.SWITCH.DETAIL.DISK_USAGE')
      },
      legend: {
        display: true,
        position: 'right'
      },
      scales: {
        yAxes: [{
          scaleLabel: {
            display: true,
            labelString: 'percent'
          },
          ticks: {
            beginAtZero: false,
            callback: function(value, index, values) {
              return value.toFixed(2) + '%';
            }
          },
        }],
        xAxes: [{
          barThickness: 40,
        }],
      },
      tooltips: {
        callbacks: {
          label: function(tooltipItem) {
            return tooltipItem.yLabel.toFixed(2) + '%';
          }
        }
      },
      timepoint: (new Date()).getTime()
    }

    this.scope.deviceDiskChartConfig.data = [usedArr, freeArr, reservedArr];
    this.scope.deviceDiskChartConfig.labels = labelsArr;
    this.scope.deviceDiskChartConfig.series = ['used_percent', 'free_percent', 'reserved_percent'];
    this.scope.deviceDiskChartConfig.colors = [{backgroundColor: 'rgb(250,128,114)'}, {backgroundColor: 'rgb(144,238,144)'}, {backgroundColor: 'rgb(244,164,96)'}];
    this.scope.deviceDiskChartConfig.options = options;
  };

  setDevicePortChartData() {
    let dataArr = [], series = [],labelsArr = [] , yAxesTitle, onClickType;
    let analyzer = this.di.$scope.chartModel.port.analyzer;
    let x_times = this.di._.maxBy(analyzer, function(item){return item.analyzer.length;});
    labelsArr = analyzer.length > 0 ?
      this.getCPUMemoryTimeSeries(x_times) : [];

    const scope = this.scope;
    analyzer.forEach((device) => {
      let data = [];
      device.analyzer.forEach((item) => {
        switch (scope.chartModel.port.unitTypeOption.value) {
          case 'packets_tx':
            switch (scope.chartModel.port.stateTypeOption.value) {
              case 'normal':
                data.push(item.packets_tx);
                break;
              case 'dropped':
                data.push(item.dropped_tx);
                break;
              case 'error':
                data.push(item.error_tx);
                break;
            }
            yAxesTitle = 'packets';
            break;
          case 'packets_rx':
            switch (scope.chartModel.port.stateTypeOption.value) {
              case 'normal':
                data.push(item.packets_rx);
                break;
              case 'dropped':
                data.push(item.dropped_rx);
                break;
              case 'error':
                data.push(item.error_rx);
                break;
            }
            yAxesTitle = 'packets';
            break;
          case 'bytes_tx':
            data.push(item.bytes_tx);
            yAxesTitle = 'bytes';
            break;
          case 'bytes_rx':
            data.push(item.bytes_rx);
            yAxesTitle = 'bytes';
            break;
        }
      });

      dataArr.push(data);
      series.push(device.name)
    });

    const pad = this.pad;
    const getFormattedNumber = this.getFormattedNumber;
    const getFormatedDateTime = this.getFormatedDateTime;
    const lineChartOnZoom = this.lineChartOnZoom;

    let options = {
      title: {
        display: true,
        text: '端口:' + this.scope.port_id + ' 流量情况',
      },
      legend: {
        display: false,
      },
      scales: {
        yAxes: [{
          scaleLabel: {
            display: true,
            labelString: yAxesTitle
          },
          ticks: {
            beginAtZero: false,
            callback: function(value, index, values) {
              return getFormattedNumber(value);
            }
          }
        }],
        xAxes: [{
          ticks: {
            callback: function(value, index, values) {
              value = new Date(value);
              return pad(value.getHours()) + ':' + pad(value.getMinutes())+ ':' + pad(value.getSeconds());;
            }
          }
        }],
      },
      tooltips: {
        callbacks: {
          title: (tooltipItem) => {
            let value = new Date(labelsArr[tooltipItem[0].index]);
            return getFormatedDateTime(value);
          },
          label: function(tooltipItem, data) {
            var label = data.datasets[tooltipItem.datasetIndex].label || '';

            if (label) {
              label += ': ';
            }
            label += getFormattedNumber(tooltipItem.yLabel);
            return label;
          }
        }
      },
      // Container for zoom options
      zoom: {
        // Useful for dynamic data loading
        onZoom: lineChartOnZoom('device-port-chart', scope)
      }
    };

    this.di.$scope.devicePortChartConfig.data = dataArr;
    this.di.$scope.devicePortChartConfig.labels = labelsArr;
    this.di.$scope.devicePortChartConfig.options = options;
    this.di.$scope.devicePortChartConfig.series = series;
    // this.di.$scope.clusterInterfaceChartConfig.onClick = interfaceLineChartOnClick(scope.dashboardModel.controller.interface.analyzer, yAxesTitle);
    // this.di.$scope.clusterInterfaceChartConfig.onHover = lineChartOnHover();
  };

  getCPUMemoryTimeSeries(device) {
    let timeseries = [];
    device.analyzer.forEach((record) => {
      timeseries.push(record.timepoint);
    });
    return timeseries;
  }

  lineChartOnZoom(chartType, scope) {

    return function(chart, xRange) {
      let ticks = chart.data.labels;
      let startIndex = xRange.start;
      let endIndex = xRange.end;
      if(startIndex === endIndex) {
        if(endIndex == ticks.length - 1) {
          startIndex = endIndex - 1;
        } else {
          endIndex = startIndex + 1;
        }
      }

      let start = new Date(ticks[startIndex]);
      let startTime = start.getTime();
      let end = new Date(ticks[endIndex]);
      let endTime =  end.getTime();
      let step = Math.floor((endTime - startTime) / ((ticks.length - 1) * 1000));
      step = step < 30 ? 30 : step > 3600 ? 3600 : step;

      switch(chartType) {
        case 'device-cpu-chart':
          scope.chartModel.cpu.begin_time = start;
          scope.chartModel.cpu.end_time = end;
          scope.chartModel.cpu.step = step;
          break;
        case 'device-memory-chart':
          scope.chartModel.memory.begin_time = start;
          scope.chartModel.memory.end_time = end;
          scope.chartModel.memory.step = step;
          break;
        case 'device-port-chart':
          scope.chartModel.port.begin_time = start;
          scope.chartModel.port.end_time = end;
          scope.chartModel.port.step = step;
          break;
      }

      scope.$apply()
    }
  }

  lineChartOnClick(analyzer, type) {
    // const getFormatedDateTime = this.getFormatedDateTime;

    return function(evt, chart) { // point element
      // 1.element hover event
      let element = chart.getElementAtEvent(evt);
      if(element.length > 0)
      {
        let datasetIndex = element[0]._datasetIndex;
        let index = element[0]._index;
        let xLabel = chart.data.labels[index];

        let data = analyzer[datasetIndex].analyzer[index];
        let title = analyzer[datasetIndex].name + ' - ' + getFormatedDateTime(xLabel);

        setCpuPieChartData(evt, data, title)
      }
    }
  }

  lineChartOnHover() {
    return function(event, chart) {
      // 1.element hover event
      let element = chart.getElementAtEvent(event);
      if(element.length > 0) return;

      // 2.recover line style when click the grid area
      const box = chart.boxes[0];
      let minTop = 0;
      if(box.position == 'bottom') {
        box.legendHitBoxes.forEach((item, key) => {
          if(key == 0 || minTop > item.top) {
            minTop = item.top;
          }
        })
      }
      if((box.position === "top" && event.layerY >= box.height) || (box.position === "bottom" && event.layerY < minTop) || (box.position === "right" && event.layerX <= box.left)) {
        chart.data.datasets.forEach((value, key) => {
          value.borderColor = chartService.helpers.color(value.borderColor).alpha(1).rgbString();
          value.backgroundColor = chartService.helpers.color(value.backgroundColor).alpha(0.2).rgbString(),
            value.borderWidth = chartStyles.lines.borderWidth;
          value.pointRadius = 1;
        })

        chart.update();
      }
    }
  }

  calcInterfaceTxRxRate(dataArr) {
    let resArr = [];
    dataArr.forEach((data) => {
      let newData = {};
      newData.id = data.id;
      newData.name = data.name;
      newData.port_id = data.port_id;
      newData.analyzer = [];

      data.analyzer.forEach((analyzer, index) => {
        if(index > 0) {
          let newAnalyzer = {}

          let diffSeconds = ((new Date(analyzer.timepoint)).getTime() - (new Date(data.analyzer[index - 1].timepoint)).getTime()) / 1000;

          newAnalyzer.timepoint = analyzer.timepoint;
          newAnalyzer.packets_rx = Math.ceil((analyzer.packetsReceived - data.analyzer[index - 1].packetsReceived) / diffSeconds);
          newAnalyzer.packets_tx = Math.ceil((analyzer.packetsSent - data.analyzer[index - 1].packetsSent) / diffSeconds);
          newAnalyzer.dropped_rx = Math.ceil((analyzer.packetsRxDropped - data.analyzer[index - 1].packetsRxDropped) / diffSeconds);
          newAnalyzer.dropped_tx = Math.ceil((analyzer.packetsTxDropped - data.analyzer[index - 1].packetsTxDropped) / diffSeconds);
          newAnalyzer.error_rx = Math.ceil((analyzer.packetsRxErrors - data.analyzer[index - 1].packetsRxErrors) / diffSeconds);
          newAnalyzer.error_tx = Math.ceil((analyzer.packetsTxErrors - data.analyzer[index - 1].packetsTxErrors) / diffSeconds);
          newAnalyzer.bytes_tx = Math.ceil((analyzer.bytesSent - data.analyzer[index - 1].bytesSent) / diffSeconds);
          newAnalyzer.bytes_rx = Math.ceil((analyzer.bytesReceived - data.analyzer[index - 1].bytesReceived) / diffSeconds);

          newData.analyzer.push(newAnalyzer);
        }
      })

      resArr.push(newData);
    })

    return resArr
  };

  getFormatedDateTime(date) {
    let _fillInt = (num, count) => {
      if(!count){
        count = 2;
      }
      let numStr = num + '';
      if(numStr.length !== count) {
        return '0'.repeat(count - numStr.length) + numStr
      } else
        return num
    };

    let res = date.getFullYear() +
      '-' + _fillInt(date.getMonth() + 1) +
      '-' + _fillInt(date.getDate()) +
      ' ' + _fillInt(date.getHours()) +
      ':' + _fillInt(date.getMinutes()) +
      ':' + _fillInt(date.getSeconds());

    return res
  }

  getFormattedNumber(num) {
    let numArr = num.toString().split('');
    let formattedNum = '';

    if(num >= 0) {
      let numLength = numArr.length;
      let diffCount = numLength % 3;
      for(let i = 1; i <= numLength; i++) {
        formattedNum += numArr[i-1];

        if((i - diffCount) % 3 == 0 && i < numLength) {
          formattedNum += ','
        }
      }
    } else {
      let numLength = numArr.length - 1;
      let diffCount = numLength % 3;
      for(let i = 2; i <= numLength; i++) {
        formattedNum += numArr[i-1];

        if((i - diffCount) % 3 == 0 && i < numLength) {
          formattedNum += ','
        }
      }

      formattedNum = parseInt(formattedNum) * -1;
    }


    return formattedNum;
  }

  getISODate(date) {
    return date.getUTCFullYear() +
      '-' + this.pad( date.getUTCMonth() + 1 ) +
      '-' + this.pad( date.getUTCDate() ) +
      'T' + this.pad( date.getUTCHours() ) +
      ':' + this.pad( date.getUTCMinutes() ) +
      'Z';
  }

  pad(number) {
    if ( number < 10 ) {
      return '0' + number;
    }
    return number;
  }

  entityStandardization(entities) {
    this.scope.detailModel.entities = [];
    switch (this.scope.tabSelected.type) {
      case 'summary':
        this.prepareTempSensors(entities[0]);
        this.preparePsuSensors(entities[1]);
        this.prepareFanSensors(entities[2]);
        break;
      case 'port':
        entities.ports.forEach((entity) => {
          let obj = {};
          obj['id'] = entity.element + '_' + entity.port;
          obj['element'] = entity.element;
          obj['port_name'] = entity.annotations.portName;
          obj['port_mac'] = entity.annotations.portMac;
          obj['port_id'] = parseInt(entity.port);
          obj['isEnabled'] = entity.isEnabled;
          obj['port_status'] = entity.isEnabled === true ? 'Up' : 'Down';
          obj['link_status'] = entity.annotations.linkStatus.toLowerCase() === 'up' ? 'available' : 'unavailable';
          obj['type'] = entity.type;
          obj['speed'] = entity.portSpeed;
          if(this.scope.role > 2 && this.scope.isTenantEnable) {
            obj['segments'] = this.getSegmentsHtml(entity.port, entities.segments);
          }
          this.scope.detailModel.entities.push(obj);
        });
        break;
      case 'link':
        entities.links.forEach((entity) => {
          let obj = {};
          obj['id'] =  entity.src.device + '_' + entity.src.port;
          obj['src_device'] = this.scope.switches[entity.src.device] || entity.src.device;
          obj['src_port'] = entity.src.port;
          obj['dst_device'] = this.scope.switches[entity.dst.device] || entity.dst.device;
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
          obj['selector'] = this.di.flowService.selectorHandler(entity.selector).toString();
          obj['treatment'] = this.di.flowService.treatmentHander(entity.treatment).toString();
          obj['app'] = entity.appId;
          obj['entity'] = entity;
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
          obj['state'] = entity.state
          obj['name'] = groupObj.name;
          obj['vlan_id'] = groupObj.vlan_id;
          obj['type'] = entity.type;
          obj['buckets'] = JSON.stringify(entity.buckets);
          this.scope.detailModel.entities.push(obj);
        });
        break;
      case 'pfc':
        entities.forEach((entity) => {
          let obj = {};
          obj['port'] = entity.port;
          if(entity['queues'] && Array.isArray(entity['queues'])){
            obj['queues'] = entity.queues.join(', ');
          } else {
            obj['queues'] = '';
          }

          this.scope.detailModel.entities.push(obj);
        });
        break;
    }
  }
  
  getSegmentsHtml(port, segments) {
    let segmentHtmlArr = [];
    Object.keys(segments).forEach((name) => {
      segments[name].ports.forEach((portName) => {
        if(portName.indexOf(port) > -1) {
          let html = `<a style="cursor: pointer;text-decoration: underline;color: #47B8E0;" href="/#!/tenant/${segments[name].tenant}/segment/${name}">${name}</a>`
          segmentHtmlArr.push(html);
        }
      })
    });
    
    return segmentHtmlArr.length ? segmentHtmlArr.join(', ') : '-'
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
      case 'pfc':
        actions = this.di.deviceDetailService.getDevicePFCTableRowActions();
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
        }, (msg) => {
          defer.reject(msg);
        });
      deferredArr.push(defer.promise);
    });

    this.di.$q.all(deferredArr).then(() => {
      this.scope.alert = {
        type: 'success',
        msg: this.translate('MODULES.SWITCH.DETAIL.FLOW.BATCH.DELETE.SUCCESS')
      }
      this.di.notificationService.render(this.scope);
      this.scope.detailModel.api.queryUpdate();
    }, (msg) => {
      this.scope.alert = {
        type: 'warning',
        msg: msg
      }
      this.di.notificationService.render(this.scope);
      this.scope.detailModel.api.queryUpdate();
    });
  }

  batchDeleteDeviceGroups(arr) {
    let deferredArr = [];
    arr.forEach((item) => {
      let defer = this.di.$q.defer();
      this.di.deviceDataManager.deleteDeviceGroup(this.scope.deviceId, item.group_id)
        .then(() => {
          defer.resolve();
        }, (msg) => {
          defer.reject(msg);
        });
      deferredArr.push(defer.promise);
    });

    this.di.$q.all(deferredArr).then(() => {
      this.scope.alert = {
        type: 'success',
        msg: this.translate('MODULES.SWITCH.DETAIL.FLOW.BATCH.DELETE.SUCCESS')
      }
      this.di.notificationService.render(this.scope);
      this.scope.detailModel.api.queryUpdate();
    }, (msg) => {
      this.scope.alert = {
        type: 'warning',
        msg: msg
      }
      this.di.notificationService.render(this.scope);
      this.scope.detailModel.api.queryUpdate();
    });
  }

  prepareFanSensors(arr) {
    this.scope.summary.fanSensors = [];
    arr.forEach((item) => {
      this.scope.summary.fanSensors.push({
        'name': item.name,
        'flow_type': item.flow_type,
        'display': item.name + ' / ' + item.flow_type,
        'RPM': item.RPM,
        'gradient': this.di.colorService.getFanSensorGradient(item.pct)
      });
    });
  }

  prepareTempSensors(arr) {
    this.scope.summary.tempSensors = [];
    arr.forEach((item) => {
      this.scope.summary.tempSensors.push({
        'name': item.name,
        'value': item.value,
        'gradient': this.di.colorService.getFanSensorGradient(item.value)
      });
    });
  }

  preparePsuSensors(arr) {
    this.scope.summary.psuSensors = [];
    arr.forEach((item) => {
      this.scope.summary.psuSensors.push({
        'name': item.name,
        'status': item.status,
        'model': item.model,
        'powertype': item.powertype.toUpperCase(),
        'vin': item.vin,
        'vout': item.vout,
        'iin': item.iin,
        'iout': item.iout,
        'pout': item.pout,
        'pin': item.pin
      });
    });
  }

  init_application_license(){
    let defer = this.di.$q.defer();

    let scope = this.di.$scope;
    this.di.applicationService.getNocsysAppsState().then(()=> {
      let allState = this.di.applicationService.getAppsState();

      let _get_license_info = () =>{
        let OPENFLOW_APP_NAME = 'org.onosproject.openflow';
        let QOS_APP_NAME = 'com.nocsys.qos';
        let SWTMGT_APP_NAME = 'com.nocsys.switchmgmt';
        let HEALTHYCHECK_APP_NAME = 'com.nocsys.healthycheck';
        let TENANT_APP_NAME = 'com.nocsys.tenant';
        let ENDPINT_APP_NAME = 'com.nocsys.endpoint';
        if(allState[OPENFLOW_APP_NAME] === 'ACTIVE'){
          scope.isOpenflowEnable = true;
        }
        if(allState[QOS_APP_NAME] === 'ACTIVE'){
          scope.isQosEnable = true;
        }
        if(allState[SWTMGT_APP_NAME] === 'ACTIVE'){
          scope.isSwtManageEnable = true;
        }
        if(allState[HEALTHYCHECK_APP_NAME] === 'ACTIVE'){
          scope.isHCEnable = true;
        }
        if(allState[TENANT_APP_NAME] === 'ACTIVE'){
          scope.isTenantEnable = true;
        }
        if(allState[ENDPINT_APP_NAME] === 'ACTIVE'){
          scope.isEndpointEnable = true;
        }
      };

      let _reset_tab_list = () => {
        let tabs = this.di.deviceDetailService.getTabSchema();
        // this.scope.tabs = this.di.deviceDetailService.getTabSchema();
        if(!scope.isHCEnable){
          this.di._.remove(tabs, (tab)=>{
            return tab['value'] === 'summary';
          });
        }

        if(!this.scope.isQosEnable){
          this.di._.remove(tabs, (tab)=>{
            return tab['value'] === 'pfc';
          });
        }

        if(!this.scope.isOpenflowEnable){
          this.di._.remove(tabs, (tab)=>{
            return tab['value'] === 'flow' || tab['value'] === 'group';
          });
        }

        if(!this.scope.isEndpointEnable){
          this.di._.remove(tabs, (tab)=>{
            return tab['value'] === 'endpoint';
          });
        }

        this.scope.tabs = tabs;
      };

      _get_license_info();
      _reset_tab_list();
      defer.resolve();
    },()=>{
      defer.resolve();
    });

    return defer.promise;
  }
	
	/**
   * select the row data depending on data type
	 */
	selectEntity() {
	  let device_id = this.di.$routeParams['deviceId'];
	  let query = this.di.$location.search();
	  
	  if(query.port !== undefined) {
		  this.scope.detailModel.api.setSelectedRow(device_id + '_' + query.port);
    } else if(query.link_port !== undefined) {
		  this.scope.detailModel.api.setSelectedRow(device_id + '_' + query.link_port);
    }
  
  }
}
DeviceDetailController.$inject = DeviceDetailController.getDI();
DeviceDetailController.$$ngIsClass = true;
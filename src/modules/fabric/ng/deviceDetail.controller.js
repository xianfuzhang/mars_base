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
      'logicalDataManager'
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
        }
        this.init();
      });
    });

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
                    item.port_status = event.data.isEnabled === true ? 'Up' : 'Down';
                    //item.link_status = event.data.isEnabled === true ? "available" : "unavailable";
                    this.scope.detailModel.api.update();
                  }
                });
              });
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
          obj['port_id'] = entity.port;
          obj['isEnabled'] = entity.isEnabled;
          obj['port_status'] = entity.isEnabled === true ? 'Up' : 'Down';
          obj['link_status'] = entity.annotations.adminState === 'enabled' ? 'available' : 'unavailable';
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
        'name': item.device,
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
}
DeviceDetailController.$inject = DeviceDetailController.getDI();
DeviceDetailController.$$ngIsClass = true;
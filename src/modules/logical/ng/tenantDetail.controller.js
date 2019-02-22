export class TenantDetail {
  static getDI() {
    return [
      '$scope',
      '$rootScope',
      '$routeParams',
      '$filter',
      '$location',
      '$q',
      '$log',
      '$timeout',
      '_',
      'logicalService',
      'roleService',
      'dialogService',
      'notificationService',
      'logicalDataManager',
      'deviceDataManager',
      'tableProviderFactory'
    ];
  };
  constructor(...args) {
    this.di = {};
    TenantDetail.getDI().forEach((value, index) => {
      this.di[value] = args[index];
    });
    this.scope = this.di.$scope;
    this.translate = this.di.$filter('translate');
    this.scope.tenantName = this.di.$routeParams['tenantName'];
    this.scope.page_title = this.translate('MODULES.LOGICAL.TENANT.DETAIL.TITLE') + "(" + this.scope.tenantName + ")";
    this.scope.role = this.di.roleService.getRole();
    this.scope.tabSwitch = false;
    this.scope.tabSelected = null;
    this.scope.segment = null;
    this.scope.deviceObjects = {};
    this.scope.detailModel = {
      provider: null,
      api: null,
      actionsShow: null,
      rowActions: null,
      entities: [],
      actionsShow4policy: this.di.logicalService.getTenantPolicyRouteActionsShow(),
      rowActions4policy: this.di.logicalService.getTenantPolicyRouteRowActions(),
      schema4policy: this.di.logicalService.getTenantPolicyRouteSchema(),
      provider4policy: null,
      api4policy: null,
      actionsShow4static: this.di.logicalService.getTenantStaticRouteActionsShow(),
      rowActions4static: this.di.logicalService.getTenantStaticRouteRowActions(),
      schema4static: this.di.logicalService.getTenantStaticRouteSchema(),
      provider4static: null,
      api4static: null,
      actionsShow4nexthop: this.di.logicalService.getTenantNextHopGroupActionsShow(),
      rowActions4nexthop: this.di.logicalService.getTenantNextHopGroupRowActions(),
      schema4nexthop: this.di.logicalService.getTenantNextHopGroupSchema(),
      provider4nexthop: null,
      api4nexthop: null,
    };
    this.scope.segmentModel = {
      actionsShow: null,
      vlanProvider: null,
      vxlanProvider: null
    };
    this.initActions();


    let _proimises = [];
    let tenantDefer = this.di.$q.defer();
    let devicesDefer = this.di.$q.defer();

    this.di.logicalDataManager.getTenants().then((res)=>{
      let tenants = res.data.tenants;
      tenants.forEach((tenant)=>{
        if(tenant.name === this.scope.tenantName){
          this.scope.tenantType = tenant.type;
        }
      });
      if(this.scope.tenantType === 'System'){
        this.scope.tabs = this.di.logicalService.getTenantDetailTabSchema();
         this.di._.remove(this.scope.tabs, (tab)=>{
           return tab.value === 'segment';
         });
      } else {
        this.scope.tabs = this.di.logicalService.getTenantDetailTabSchema();
      }
      tenantDefer.resolve();
    });
    _proimises.push(tenantDefer.promise);

    this.di.deviceDataManager.getDeviceConfigs().then((devices) =>{
      devices.forEach((device) => {
        this.scope.deviceObjects[device.id] = device.name;
      });
      devicesDefer.resolve();
    });
    _proimises.push(devicesDefer.promise);


    this.di.$q.all(_proimises).then(() => {
      this.init();
    });



    let unsubscribers = [];
    unsubscribers.push(this.di.$rootScope.$on('clickabletext', (event, params) => {
      if (params && params.field === 'segment_name') {
        this.di.$location.path('/tenant/' + this.scope.tenantName + '/segment/' + params.object.id);
      }
    }));

    unsubscribers.push(this.di.$rootScope.$on('segment-list-refresh', (event) => {
      this.scope.alert = {
      type: 'success',
      msg: this.translate('MODULES.LOGICAL.SEGMENT.CREATE.SUCCESS')
      };
      this.di.notificationService.render(this.scope);
      this.scope.detailModel.api.queryUpdate();
    }));

    unsubscribers.push(this.scope.$on('segment-selected', ($event, params) => {
      this.scope.segment = params.segment;
      this.scope.detailModel.api.setSelectedRow(params.segment.id);
      this.segmentDetailQuery();
    }));

    unsubscribers.push(this.di.$rootScope.$on('route-config-success', (event) => {
      this.di.notificationService.renderSuccess(this.scope, this.translate('MODULES.LOGICAL.TENANT.DETAIL.ROUTE.CREATE.SUCCESS'));
      this._initRoute();
    }));

    unsubscribers.push(this.di.$rootScope.$on('staticroute-config-success', (event) => {
      this.di.notificationService.renderSuccess(this.scope, this.translate('MODULES.LOGICAL.TENANT.DETAIL.STATICROUTE.CREATE.SUCCESS'));
      this.scope.detailModel.api4static.queryUpdate();
    }));

    unsubscribers.push(this.di.$rootScope.$on('nexthop-config-success', (event) => {
      this.di.notificationService.renderSuccess(this.scope, this.translate('MODULES.LOGICAL.TENANT.DETAIL.NEXTHOP.CREATE.SUCCESS'));
      this.scope.detailModel.api4nexthop.queryUpdate();
    }));

    this.scope.$on('$destroy', () => {
      unsubscribers.forEach((cb) => {
      cb();
      });
    });
  }

  initActions() {
    this.scope.onTabChange = (tab) => {
      if (tab && !this.scope.tabSwitch){

        if(tab.type === 'segment'){
          this.scope.tabSelected = tab;
          this.scope.tabSwitch = true;
          this.prepareTableData();
        } else {
          this.scope.tabSelected = tab;
          this.scope.tabSwitch = true;
          this.prepareRouteTableData();
          this.scope.tabSwitch = false;
        }


      }
    }

    this.scope.onTableRowSelectAction = (event) => {
      switch (this.scope.tabSelected.type){
        case 'segment':
          if (event.action.value === 'delete') {
            this.di.logicalDataManager.deleteSegment(this.scope.tenantName, this.scope.segment.segment_name)
            .then(() =>{
              this.scope.alert = {
        type: 'success',
        msg: this.translate('MODULES.LOGICAL.SEGMENT.DELETE.SUCCESS')
        }
        this.di.notificationService.render(this.scope);
        this.scope.detailModel.api.queryUpdate();
            }, (msg) =>{
              this.scope.alert = {
        type: 'warning',
        msg: msg
        }
        this.di.notificationService.render(this.scope);
            });
          }
          break;
      }
    };

    this.scope.onTableRowClick = (event) => {
      this.scope.segment = event.$data;
      this.scope.detailModel.api.setSelectedRow(event.$data.id);
      switch (this.scope.tabSelected.type){
        case 'segment':
          this.segmentDetailQuery();
          break;
      }
    };

    this.scope.onApiReady = ($api) => {
      this.scope.detailModel.api = $api;
    };

    this.scope.onVlanApiReady = ($api) => {
      this.scope.segmentModel.vlanApi = $api;
    };

    this.scope.onVxlanApiReady = ($api) => {
      this.scope.segmentModel.vxlanApi = $api;
    };

    this.scope.addSegment = () => {
      this.di.$rootScope.$emit('segment-wizard-show', this.scope.tenantName, '');
    };

    this.scope.batchRemove = (value) => {
      this.di.dialogService.createDialog('warning', this.translate('MODULES.LOGICAL.SEGMENT.TABLE.BATCH_DELETE_SEGMENT'))
      .then((data) =>{
      this.batchDeleteSegments(value);
      }, (res) =>{
      this.di.$log.info('delete segments dialog cancel');
      });
    };

    this.initPolicyRouteTable();
    this.initStaticRouteTable();
    this.initNexthopGropupTable();
  }


  initPolicyRouteTable(){
    this.scope.onTableRowSelectAction4policy = (event) => {
      if (event.action.value === 'delete') {
        this.di.dialogService.createDialog('warning', this.translate('MODULES.LOGICAL.TENANT.DETAIL.DIALOG.POLICYROUTE.DELETE.WARNING'))
          .then((data) =>{
            this.di.logicalDataManager.deleteTenantLogicalPolicyRoute(this.scope.tenantName, this.scope.routeName, event.data.name)
              .then(() =>{
                this.di.notificationService.renderSuccess(this.scope, this.translate('MODULES.LOGICAL.TENANT.DETAIL.POLICYROUTE.DELETE.SUCCESS'));
                this.scope.detailModel.api4policy.queryUpdate();
              }, (msg) =>{
                this.di.notificationService.renderWarning(this.scope, msg);
              });
          }, (res) =>{
            this.di.$log.info('delete segments dialog cancel');
          });
      } else if(event.action.value === 'edit'){
        this.di.$rootScope.$emit('policyroute-wizard-show',  this.scope.tenantName, this.scope.routeName, event.data.name)
      }
    };

    this.scope.onTableRowClick4policy = (event) => {
      // this.scope.segment = event.$data;
      this.scope.detailModel.api4policy.setSelectedRow(event.$data.name);
    };

    this.scope.onApiReady4policy = ($api) => {
      this.scope.detailModel.api4policy = $api;
    };

    this.scope.addPolicyRoute = () => {
      this.di.$rootScope.$emit('policyroute-wizard-show', this.scope.tenantName, this.scope.routeName);
    };

    this.scope.batchRemove4policy = (value) => {
      this.di.dialogService.createDialog('warning', this.translate('MODULES.LOGICAL.TENANT.DETAIL.DIALOG.POLICYROUTE.BATCH_DELETE.WARNING'))
        .then((data) =>{
          this.batchDeletePolicyRoute(value);
        }, (res) =>{
          this.di.$log.info('delete segments dialog cancel');
        });
    };
  }

  initStaticRouteTable(){
    this.scope.onTableRowSelectAction4static = (event) => {
      if (event.action.value === 'delete') {
        this.di.dialogService.createDialog('warning', this.translate('MODULES.LOGICAL.TENANT.DETAIL.DIALOG.STATICROUTE.DELETE.WARNING'))
          .then((data) =>{
            this.di.logicalDataManager.deleteTenantLogicalStaticRoute(this.scope.tenantName, this.scope.routeName, event.data.name)
              .then(() =>{
                this.di.notificationService.renderSuccess(this.scope, this.translate('MODULES.LOGICAL.TENANT.DETAIL.STATICROUTE.DELETE.SUCCESS'));
                this.scope.detailModel.api4static.queryUpdate();
              }, (msg) =>{
                this.di.notificationService.renderWarning(this.scope, msg);
              });
          }, (res) =>{
            this.di.$log.info('delete segments dialog cancel');
          });
      } else if(event.action.value === 'edit'){
        this.di.$rootScope.$emit('staticroute-wizard-show',  this.scope.tenantName, this.scope.routeName, event.data.name)
      }
    };

    this.scope.onTableRowClick4static = (event) => {
      this.scope.detailModel.api4static.setSelectedRow(event.$data.name);
    };

    this.scope.onApiReady4static = ($api) => {
      this.scope.detailModel.api4static = $api;
    };

    this.scope.addStaticRoute = () => {
      this.di.$rootScope.$emit('staticroute-wizard-show', this.scope.tenantName, this.scope.routeName);
    };

    this.scope.batchRemove4static = (value) => {
      this.di.dialogService.createDialog('warning', this.translate('MODULES.LOGICAL.TENANT.DETAIL.DIALOG.STATICROUTE.BATCH_DELETE.WARNING'))
        .then((data) =>{
          this.batchDeleteStaticRoute(value);
        }, (res) =>{
          this.di.$log.info('delete segments dialog cancel');
        });
    };
  }

  initNexthopGropupTable(){
    this.scope.onTableRowSelectAction4nexthop = (event) => {

      if (event.action.value === 'delete') {
        this.di.dialogService.createDialog('warning', this.translate('MODULES.LOGICAL.TENANT.DETAIL.DIALOG.NEXTHOP.DELETE.WARNING'))
          .then((data) =>{
            this.di.logicalDataManager.deleteTenantLogicalNexthopGroup(this.scope.tenantName, this.scope.routeName, event.data.nexthop_group_name)
              .then(() =>{
                this.di.notificationService.renderSuccess(this.scope, this.translate('MODULES.LOGICAL.TENANT.DETAIL.NEXTHOP.DELETE.SUCCESS'));
                this.scope.detailModel.api4nexthop.queryUpdate();
              }, (msg) =>{
                this.di.notificationService.renderWarning(this.scope, msg);
              });
          }, (res) =>{
            this.di.$log.info('delete segments dialog cancel');
          });
      } else if(event.action.value === 'edit'){
        this.di.$rootScope.$emit('nexthop-wizard-show',  this.scope.tenantName, this.scope.routeName, event.data.nexthop_group_name)
      }
    };

    this.scope.onTableRowClick4nexthop = (event) => {
      this.scope.detailModel.api4nexthop.setSelectedRow(event.$data.nexthop_group_name);
    };

    this.scope.onApiReady4nexthop = ($api) => {
      this.scope.detailModel.api4nexthop = $api;
    };

    this.scope.addNexthopGroup = () => {
      this.di.$rootScope.$emit('nexthop-wizard-show', this.scope.tenantName, this.scope.routeName);
    };

    this.scope.batchRemove4nexthop = (value) => {
      this.di.dialogService.createDialog('warning', this.translate('MODULES.LOGICAL.TENANT.DETAIL.DIALOG.NEXTHOP.BATCH_DELETE.WARNING'))
        .then((data) =>{
          this.batchDeleteNexthopGroup(value);
        }, (res) =>{
          this.di.$log.info('delete segments dialog cancel');
        });
    };
  }

  init() {
    this.scope.detailModel.provider = this.di.tableProviderFactory.createProvider({
      query: (params) => {
      let defer = this.di.$q.defer();
      this.getEntities(params).then((res) => {
        this.scope.tabSwitch = false;
        this.entityStandardization(res.data);
        defer.resolve({
          data: this.scope.detailModel.entities
        });
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
    this.scope.onTabChange(this.scope.tabs[0]);
  }

  _initRoute(){
    this.di.logicalDataManager.getLoigcalRouteByTenant(this.scope.tenantName).then((res)=>{
      // let _router = res.data.routers;
      // scope.tenantRouteModel = {
      //   name: _router.name,
      //   segments: ', '.join(_router.interfaces)
      // }
      //TODO wls 后期恢复成上面的数据获取方式
      let keys = this.di._.keys(res.data);
      if(keys.length > 0 &&  res.data[keys[0]].length > 0){
        let _router =  res.data[keys[0]][0];
        this.scope.tenantRouteModel = {
          name: _router.name,
          segments: _router.interfaces.join(', ')
        }
        this.scope.routeName = this.scope.tenantRouteModel.name;
      } else {
        this.scope.tenantRouteModel = {
          name: '',
          segments: ''
        }
        this.scope.routeName = null;
      }


      this.scope.detailModel.api4policy.queryUpdate();
      this.scope.detailModel.api4static.queryUpdate();
      this.scope.detailModel.api4nexthop.queryUpdate();

    },(err)=>{
    });
  }

  initRoute(){
    this.scope.routeName = null;
    this.scope._routeInnerModel = {
      policy : [],
      static : [],
      nexthop : []
    };
    this._initRoute();

    this.scope.routeSetting = () =>{
      this.di.$rootScope.$emit('route-wizard-show', this.scope.tenantName)
    };

    this.scope.clearRouteSetting = () =>{
      this.di.dialogService.createDialog('warning', this.translate('MODULES.LOGICAL.TENANT.DETAIL.DIALOG.ROUTE.DELETE.WARNING'))
        .then(()=>{
          this.di.logicalDataManager.deleteLoigcalRouteByTenant(this.scope.tenantName, this.scope.routeName).then((res)=>{
            this.di.notificationService.renderSuccess(this.scope, this.translate('MODULES.LOGICAL.TENANT.DETAIL.ROUTE.DELETE.SUCCESS'));
            this.scope.routeName = null;
            this._initRoute();
          }, (err)=>{
            this.di.notificationService.renderWarning(this.scope, err.data);
          })
        },()=>{});
    };

    this.scope.detailModel.provider4policy = this.di.tableProviderFactory.createProvider({
      query: (params) => {
        let defer = this.di.$q.defer();
        if(this.scope.routeName){
          this.di.logicalDataManager.getTenantLogicalPolicyRoute(this.scope.tenantName, this.scope.routeName).then((res) => {
            this.scope._routeInnerModel.policy = res.data.policies ;
            defer.resolve({'data': this.scope._routeInnerModel.policy});
          });
        } else {
          defer.resolve({'data': []});
        }
        return defer.promise;
      },
      getSchema: () => {
        return {
          schema: this.scope.detailModel.schema4policy,
          index_name: 'name',
          rowCheckboxSupport: true,
          rowActionsSupport: true,
          authManage: {
            support: true,
            currentRole: this.scope.role
          }
        };
      }
    });

    this.scope.detailModel.provider4static = this.di.tableProviderFactory.createProvider({
      query: (params) => {
        let defer = this.di.$q.defer();
        if(this.scope.routeName){
          this.di.logicalDataManager.getTenantLogicalStaticRoute(this.scope.tenantName, this.scope.routeName).then((res) => {
            let statics = res.data.routes;
            statics.map((item)=>{
              item.dest = item.dest + '/' + item.prefix_len;
            });
            this.scope._routeInnerModel.static = statics;
            defer.resolve({'data': this.scope._routeInnerModel.static});
          });
        } else {
          defer.resolve({'data': []});
        }


        return defer.promise;
      },
      getSchema: () => {
        return {
          schema: this.scope.detailModel.schema4static,
          index_name: 'name',
          rowCheckboxSupport: true,
          rowActionsSupport: true,
          authManage: {
            support: true,
            currentRole: this.scope.role
          }
        };
      }
    });

    this.scope.detailModel.provider4nexthop = this.di.tableProviderFactory.createProvider({
      query: (params) => {
        let defer = this.di.$q.defer();
        if(this.scope.routeName){
          this.di.logicalDataManager.getTenantLogicalNexthopGroup(this.scope.tenantName, this.scope.routeName).then((res) => {
            this.scope._routeInnerModel.nextHop = res.data.nextHops;
            defer.resolve({'data': this.scope._routeInnerModel.nextHop});
          });
        } else {
          defer.resolve({'data': []});
        }
        return defer.promise;
      },
      getSchema: () => {
        return {
          schema: this.scope.detailModel.schema4nexthop,
          index_name: 'name',
          rowCheckboxSupport: true,
          rowActionsSupport: true,
          authManage: {
            support: true,
            currentRole: this.scope.role
          }
        };
      }
    });

  }


  prepareTableData() {
    this.scope.detailModel.schema = this.getSchema();
    this.scope.detailModel.actionsShow = this.getActionsShow();
    this.scope.detailModel.rowActions = this.getRowActions();
  }

  prepareRouteTableData(){
    this.initRoute();
  }

  selectEntity() {
    if (this.scope.detailModel.entities.length === 0) {
      this.scope.segment = null;
      return;
    }
    switch (this.scope.tabSelected.type) {
      case 'segment':
        this.scope.$emit('segment-selected', {
        segment: this.scope.detailModel.entities[0]
      });
        break;
    }
  }

  getEntities(params) {
    let defer = this.di.$q.defer();
  switch (this.scope.tabSelected.type) {
    case 'segment':
    this.di.logicalDataManager.getTenantSegments(this.scope.tenantName).then((res) => {
      defer.resolve({'data': res.data.tenantSegments});
    });
    break;
  }
  return defer.promise;
  }

  entityStandardization(entities) {
    this.scope.detailModel.entities = [];
    switch (this.scope.tabSelected.type) {
      case 'segment':
        entities.forEach((entity) => {
          let obj = {};
        obj['id'] = entity.name;
        obj['segment_name'] = entity.name;
        obj['type'] = entity.type;
        obj['value'] = entity.value;
        obj['ip_address'] = entity.ip_address;
        this.scope.detailModel.entities.push(obj);
        });
        break;
    }
  }

  getSchema() {
    let schema;
    switch(this.scope.tabSelected.type) {
      case 'segment':
        schema = this.di.logicalService.getTenantSegmentsSchema();
        break;
    }
    return schema;
  }

  getActionsShow() {
    let actions = [];
    switch(this.scope.tabSelected.type) {
      case 'segment':
        actions = this.di.logicalService.getTenantSegmentsActionsShow();
        break;
    }
    return actions;
  }

  getRowActions() {
    let actions = [];
    switch(this.scope.tabSelected.type) {
      case 'segment':
        actions = this.di.logicalService.getTenantSegmentsRowActions();
        break;
    }
    return actions;
  }

  getDataType() {
    let schema = {};
     schema['authManage'] = {
    support: true,
    currentRole: this.scope.role
  };

  switch (this.scope.tabSelected.type) {
    case 'segment':
    schema['index_name'] = 'id';
    schema['rowCheckboxSupport'] = true;
    schema['rowActionsSupport'] = true;
    break;
  }
  return schema;
  }

  initSegmentVlanProvider() {
    this.scope.segmentModel.vlanSchema = this.di.logicalService.getSegmentVlanSchema();
    this.scope.segmentModel.actionsShow = this.di.logicalService.getSegmentVlanActionsShow();
    this.scope.segmentModel.vlanProvider = this.di.tableProviderFactory.createProvider({
      query: (params) => {
        let defer = this.di.$q.defer();
        this.di.logicalDataManager.getSegmentVlanMember(this.scope.tenantName, this.scope.segment.segment_name).then((res) => {
          let data = this.formatSegmentVLanData(res.data.segment_members);
          defer.resolve({
          data: data
          });
        });
        return defer.promise;
      },
      getSchema: () => {
        return {
          schema: this.scope.segmentModel.vlanSchema,
          rowCheckboxSupport: false,
          rowActionsSupport: false
        };
      }
    });
  }

  initSegmentVxlanProvider() {
    this.scope.segmentModel.vxlanSchema = this.di.logicalService.getSegmentVxlanSchema();
    this.scope.segmentModel.actionsShow = this.di.logicalService.getSegmentVlanActionsShow();
    this.scope.segmentModel.vxlanProvider = this.di.tableProviderFactory.createProvider({
    query: (params) => {
    let defer = this.di.$q.defer();
    this.di.logicalDataManager.getSegmentVxlanMember(this.scope.tenantName, this.scope.segment.segment_name).then((res) => {
      let data = this.formatSegmentVxLanData(res.data);
      defer.resolve({
      data: data
      });
    });
    return defer.promise;
    },
    getSchema: () => {
    return {
      schema: this.scope.segmentModel.vxlanSchema,
      rowCheckboxSupport: false,
      rowActionsSupport: false
    };
    }
  });
  }

  segmentDetailQuery() {
    if (!this.scope.initSegmentDetail) {
      this.initSegmentVlanProvider();
      this.initSegmentVxlanProvider();
      this.scope.initSegmentDetail = true;
    }
    else {
      if (this.scope.segment.type === 'vlan') {
        this.scope.segmentModel.vlanApi.queryUpdate();
      }
      else {
        this.scope.segmentModel.vxlanApi.queryUpdate();
      }
    }
  }

  formatSegmentVLanData(origins) {
    let result = [];
    origins.forEach((member) => {
      let device = this.scope.deviceObjects[member.device_id] || member.device_id;
      if (member.hasOwnProperty('ports')) {
        member.ports.forEach((port) => {
          result.push({
            'type': 'normal',
            'device': device,
            'port': port
          });
        });
      }
      if (member.hasOwnProperty('logical_ports')) {
        member.logical_ports.forEach((logical) => {
          result.push({
            'type': 'logical',
            'device': device,
            'logical_port': logical
          });
        });
      }
      if (member.hasOwnProperty('mac_based_vlans')) {
        member.mac_based_vlans.forEach((mac) => {
          result.push({
            'type': 'macbased',
            'device': device,
            'mac_based_vlan': mac
          });
        });
      }
    });
    return result;
  }

  formatSegmentVxLanData(origins) {
    let result = [];
    if (origins.hasOwnProperty('access_port')) {
      origins.access_port.forEach((port) => {
        result.push({
          'type': 'access port',// + '(' + port.type + ')',
          'name': port.name,
          'vlan': port.vlan,
          'device': port.switch && ((this.scope.deviceObjects[port.switch] || port.switch) + '/' + port.port) || '-',
          'server': port.server_mac
        });
      });
    }
    if (origins.hasOwnProperty('network_port')) {
      origins.network_port.forEach((port) => {
        port.ip_addresses.forEach((ip) => {
          result.push({
            'type': 'network port',
            'name': port.name,
            'ip_address': ip
          });
        });
      });
    }
    return result;
  }

  batchDeleteSegments(arr) {
    let deferredArr = [];
    arr.forEach((item) => {
      let defer = this.di.$q.defer();
      this.di.logicalDataManager.deleteSegment(this.scope.tenantName, item.id)
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
        msg: this.translate('MODULES.LOGICAL.SEGMENT.BATCH.DELETE.SUCCESS')
      }
      this.di.notificationService.render(this.scope);
    }, (msg) => {
      this.scope.alert = {
        type: 'warning',
        msg: msg
        }
      this.di.notificationService.render(this.scope);
      })
    .finally(() => {
      this.scope.detailModel.api.queryUpdate();
    });
  }

  batchDeleteStaticRoute(arr) {
    let deferredArr = [];
    arr.forEach((item) => {
      let defer = this.di.$q.defer();
      this.di.logicalDataManager.deleteTenantLogicalStaticRoute(this.scope.tenantName, this.scope.routeName, item.name)
        .then(() => {
          defer.resolve();
        }, (msg) => {
          defer.reject(msg);
        });
      deferredArr.push(defer.promise);
    });

    this.di.$q.all(deferredArr).then(() => {
      this.di.notificationService.renderSuccess(this.scope, this.translate('MODULES.LOGICAL.TENANT.DETAIL.DIALOG.STATICROUTE.BATCH_DELETE.SUCCESS'));
    }, (msg) => {
      this.di.notificationService.renderWarning(this.scope, msg);
    })
      .finally(() => {
        this.scope.detailModel.api4static.queryUpdate();
      });
  }

  batchDeletePolicyRoute(arr) {
    let deferredArr = [];
    arr.forEach((item) => {
      let defer = this.di.$q.defer();
      this.di.logicalDataManager.deleteTenantLogicalPolicyRoute(this.scope.tenantName, this.scope.routeName, item.name)
        .then(() => {
          defer.resolve();
        }, (msg) => {
          defer.reject(msg);
        });
      deferredArr.push(defer.promise);
    });

    this.di.$q.all(deferredArr).then(() => {
      this.di.notificationService.renderSuccess(this.scope, this.translate('MODULES.LOGICAL.TENANT.DETAIL.DIALOG.POLICYROUTE.BATCH_DELETE.SUCCESS'));
    }, (msg) => {
      this.di.notificationService.renderWarning(this.scope, msg);
    })
      .finally(() => {
        this.scope.detailModel.api4policy.queryUpdate();
      });
  }

  batchDeleteNexthopGroup(arr) {
    let deferredArr = [];
    arr.forEach((item) => {
      let defer = this.di.$q.defer();
      this.di.logicalDataManager.deleteTenantLogicalNexthopGroup(this.scope.tenantName, this.scope.routeName, item.nexthop_group_name)
        .then(() => {
          defer.resolve();
        }, (msg) => {
          defer.reject(msg);
        });
      deferredArr.push(defer.promise);
    });

    this.di.$q.all(deferredArr).then(() => {
      this.di.notificationService.renderSuccess(this.scope, this.translate('MODULES.LOGICAL.TENANT.DETAIL.DIALOG.NEXTHOP.BATCH_DELETE.SUCCESS'));
    }, (msg) => {
      this.di.notificationService.renderWarning(this.scope, msg);
    })
      .finally(() => {
        this.scope.detailModel.api4nexthop.queryUpdate();
      });
  }
}

TenantDetail.$inject = TenantDetail.getDI();
TenantDetail.$$ngIsClass = true;
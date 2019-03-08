export class DHCPRelayController {
  static getDI() {
    return [
      '$scope',
      '$rootScope',
      '$filter',
      '$q',
      '_',
      'deviceService',
      'roleService',
      'notificationService',
      'dialogService',
      'deviceDataManager',
      'tableProviderFactory'
    ];
  };
  constructor(...args) {
    this.di = {};
    DHCPRelayController.getDI().forEach((value, index) => {
      this.di[value] = args[index];
    });
    this.scope = this.di.$scope;
    let scope = this.di.$scope;
    this.translate = this.di.$filter('translate');
    scope.role = this.di.roleService.getRole();
    scope.tabSwitch = false;
    scope.tabSelected = null;
    scope.segment = null;
    scope.tabs = this.di.deviceService.getDHCPRelayTabSchema();
    scope.model = {
      provider: null,
      api: null,
      actionsShow: null,
      rowActions: null,
      entities: [],
      subProvider: null,
      subRelayIps: null,
      subApi:null
    };

    this.initActions();
    this.init();

    scope.devices = [];
    let unsubscribers = [];
    unsubscribers.push(this.di.$rootScope.$on('relay-default-list-refresh',(event, params)=>{
      let msg = params.update ? this.translate('MODULES.QOS.TAB.COS.UPDATE.SUCCESS')
        : this.translate('MODULES.LOGICAL.QOS.TAB.COS.CREATE.SUCCESS');
      this.di.notificationService.renderSuccess(scope, msg);
      scope.model.api.queryUpdate();
    }));

    unsubscribers.push(this.di.$rootScope.$on('relay-indirect-list-refresh',(event, params)=>{
      let msg = params.update ? this.translate('MODULES.LOGICAL.QOS.TAB.ECN.UPDATE.SUCCESS')
        : this.translate('MODULES.LOGICAL.QOS.TAB.ECN.CREATE.SUCCESS');

      this.di.notificationService.renderSuccess(scope, msg);
      this.scope.model.api.queryUpdate();
    }));

    this.scope.$on('$destroy', () => {
    });
  }

  initActions() {
    this.scope.onTabChange = (tab) => {
      if (tab && !this.scope.tabSwitch){
        this.scope.tabSelected = tab;
        this.scope.tabSwitch = true;
        this.prepareTableData();
      }
    };

    this.scope.onTableRowSelectAction = (event) => {
      switch (this.scope.tabSelected.type){
        case 'default':
          if (event.action.value === 'delete') {
            this.di.dialogService.createDialog('warning', this.translate('MODULES.FABRIC.DHCPRELAY.DEFAULT.DIALOG.DELETE.WARNING'))
              .then(()=>{
                this.di.deviceDataManager.deleteDHCPRelayDefault(event.data.point_device, event.data.point_port).then(
                  () => {
                    this.di.notificationService.renderSuccess(this.scope, this.translate('MODULES.FABRIC.DHCPRELAY.DEFAULT.DELETE.SUCCESS'));
                    this.scope.model.api.queryUpdate();
                  },
                  (msg) => {
                    this.di.notificationService.renderWarning(this.scope, msg);
                  }
                );
              },()=>{})
          }
          // this.di.$rootScope.$emit('relay-default-wizard-show', event.data);
          break;
        case 'indirect':
          if (event.action.value === 'delete') {
            this.di.dialogService.createDialog('warning', this.translate('MODULES.FABRIC.DHCPRELAY.INDIRECT.DIALOG.DELETE.WARNING'))
              .then(()=>{
                this.di.deviceDataManager.deleteDHCPRelayIndirect(event.data.point_device, event.data.point_port).then(
                  () => {
                    this.di.notificationService.renderSuccess(this.scope, this.translate('MODULES.FABRIC.DHCPRELAY.INDIRECT.DELETE.SUCCESS'));
                    this.scope.model.api.queryUpdate();
                  },
                  (msg) => {
                    this.di.notificationService.renderWarning(this.scope, msg);
                  }
                );
              },()=>{})
          }
          // this.di.$rootScope.$emit('relay-indirect-wizard-show', event.data);
          break;
        case 'counter':
          break;
      }
    };

    this.scope.onTableRowClick = (event) => {
      this.scope.model.api.setSelectedRow(event.$data.id);
      if (this.scope.tabSelected.type === 'counter') {
        return;
      }
      this.scope.model.subRelayIps = this.formatSubTableValue(event.$data.relayAgentIps);
      this.scope.model.subApi.queryUpdate();
    };

    this.scope.onApiReady = ($api) => {
      this.scope.model.api = $api;
    };

    this.scope.onSubApiReady = ($api) => {
      this.scope.model.subApi = $api;
    };

    this.scope.addDefault = () => {
      this.di.$rootScope.$emit('relay-default-wizard-show');
    };

    this.scope.addIndirect = () => {
      this.di.$rootScope.$emit('relay-indirect-wizard-show');
    };
  }

  init() {
    this.scope.model.provider = this.di.tableProviderFactory.createProvider({
      query: (params) => {
        let defer = this.di.$q.defer();
        this.di.deviceDataManager.getDeviceConfigs().then((configs)=>{
          this.scope.devices = configs;
          this.getEntities(params).then((res) => {
            this.scope.tabSwitch = false;
            this.entityStandardization(res.data);
            defer.resolve({
              data: this.scope.model.entities
            });

            if(this.scope.tabSelected.type === 'default' || this.scope.tabSelected.type === 'indirect'){
              this.scope.model.api.setSelectedRow(this.scope.model.entities[0].id);
              this.scope.model.subRelayIps = this.formatSubTableValue(this.scope.model.entities[0].relayAgentIps);
              this.scope.model.subApi.queryUpdate();
            }
          });
        });
        return defer.promise;
        // let defer = this.di.$q.defer();
        // this.getEntities(params).then((res) => {
        //   this.scope.tabSwitch = false;
        //   this.entityStandardization(res.data);
        //   defer.resolve({
        //     data: this.scope.model.entities
        //   });
        // });
        // return defer.promise;
      },
      getSchema: () => {
        return {
          schema: this.scope.model.schema,
          index_name: this.getDataType().index_name,
          rowCheckboxSupport: this.getDataType().rowCheckboxSupport,
          rowActionsSupport: this.getDataType().rowActionsSupport,
          authManage: this.getDataType().authManage
        };
      }
    });

    this.scope.model.subProvider = this.di.tableProviderFactory.createProvider({
      query: (params) => {
        let defer = this.di.$q.defer();
        let scope = this.scope;
        setTimeout(function () {
          defer.resolve({
            data: scope.model.subRelayIps
          });
        },200);

        return defer.promise;
      },
      getSchema: () => {
        return {
          index_name: 'device',
          schema: this.di.deviceService.getDHCPRelayDefaultTableSubSchema(),
          rowCheckboxSupport: false,
          rowActionsSupport: false
        };
      }
    });

    this.scope.onTabChange(this.scope.tabs[0]);
  }

  prepareTableData() {
    this.scope.model.schema = this.getSchema();
    this.scope.model.actionsShow = this.getActionsShow();
    this.scope.model.rowActions = this.getRowActions();
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
    switch (this.scope.tabSelected.type) {
      case 'default':
        entities.forEach((entity) => {
          let obj = {};
          obj['id'] = entity.dhcpServerConnectPoint;
          let pointArr = entity.dhcpServerConnectPoint.split('/');
          obj['point_device'] = pointArr[0];
          obj['point_port'] = pointArr[1];
          obj['dhcpServerConnectPoint'] = this.getDeviceName(pointArr[0]) + '/' + pointArr[1] ;
          obj['serverIps'] = Array.isArray(entity.serverIps)?entity.serverIps.join(', '):"";
          obj['gatewayIps'] = Array.isArray(entity.gatewayIps)?entity.gatewayIps.join(', '):"";
          obj['relayAgentIps'] = entity.relayAgentIps;
          this.scope.model.entities.push(obj);
        });
        break;
      case 'indirect':
        entities.forEach((entity) => {
          let obj = {};
          obj['id'] = entity.dhcpServerConnectPoint;
          let pointArr = entity.dhcpServerConnectPoint.split('/');
          obj['point_device'] = pointArr[0];
          obj['point_port'] = pointArr[1];
          obj['dhcpServerConnectPoint'] = this.getDeviceName(pointArr[0]) + '/' + pointArr[1] ;
          obj['serverIps'] = Array.isArray(entity.serverIps)?entity.serverIps.join(', '):"";
          obj['gatewayIps'] = Array.isArray(entity.gatewayIps)?entity.gatewayIps.join(', '):"";
          obj['relayAgentIps'] = entity.relayAgentIps;
          this.scope.model.entities.push(obj);
        });
        break;
      case 'counter':
        entities.forEach((entity)=>{
          let obj = {};

          obj['host'] = entity.host;
          obj['location'] = this.getDeviceName(entity.location.deviceId) + '/' + entity.location.port;
          obj['id'] = obj['host'] + obj['location'];
          obj['solicit'] = entity.solicit;
          obj['request'] = entity.request;
          obj['advertise'] = entity.advertise;
          obj['renew'] = entity.renew;
          obj['reply'] = entity.reply;
          this.scope.model.entities.push(obj);
        });
    }
  }

  getSchema() {
    let schema;
    switch(this.scope.tabSelected.type) {
      case 'default':
        schema = this.di.deviceService.getDHCPRelayDefaultTableSchema();
        break;
      case 'indirect':
        schema = this.di.deviceService.getDHCPRelayDefaultTableSchema();
        break;
      case 'counter':
        schema = this.di.deviceService.getDHCPRelayCounterTableSubSchema();
        break;
    }
    return schema;
  }

  getActionsShow() {
    let actions;
    switch (this.scope.tabSelected.type) {
      case 'default':
        actions = this.di.deviceService.getDHCPRelayActionsShow();
        break;
      case 'indirect':
        actions = this.di.deviceService.getDHCPRelayActionsShow();
        break;
      case 'counter':
        actions = this.di.deviceService.getDHCPRelayCounterActionsShow();
        break;
    }

    return actions;
  }

  getRowActions() {
    let actions;
    switch (this.scope.tabSelected.type) {
      case 'default':
        actions = this.di.deviceService.getDHCPRelayTableRowActions();
        break;
      case 'indirect':
        actions = this.di.deviceService.getDHCPRelayTableRowActions();
        break;
      case 'counter':
        actions = [];
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
    schema['index_name'] = 'id';
    if(this.scope.tabSelected.type === 'counter'){
      schema['rowActionsSupport'] = false;
      schema['rowCheckboxSupport'] = false;
    } else {
      schema['rowActionsSupport'] = true;
      schema['rowCheckboxSupport'] = true;
    }

    return schema;
  }

  getDeviceName(deviceId){
    let device =  this.di._.find(this.di.$scope.devices,{"id": deviceId});
    if(device) return device['name'];
    else return '';
  }
}

DHCPRelayController.$inject = DHCPRelayController.getDI();
DHCPRelayController.$$ngIsClass = true;
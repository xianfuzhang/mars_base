export class QoSController {
  static getDI() {
    return [
      '$scope',
      '$rootScope',
      '$filter',
      '$q',
      'logicalService',
      'roleService',
      'notificationService',
      'logicalDataManager',
      'tableProviderFactory'
    ];
  };
  constructor(...args) {
    this.di = {};
    QoSController.getDI().forEach((value, index) => {
      this.di[value] = args[index];
    });
    this.scope = this.di.$scope;
    this.translate = this.di.$filter('translate');
    this.scope.role = this.di.roleService.getRole();
    this.scope.tabSwitch = false;
    this.scope.tabSelected = null;
    this.scope.segment = null;
    this.scope.tabs = this.di.logicalService.getQoSTabSchema();
    this.scope.model = {
      provider: null,
      api: null,
      actionsShow: null,
      rowActions: null,
      entities: []
    };

    this.initActions();
    this.init();

    let unsubscribers = [];
    unsubscribers.push(this.di.$rootScope.$on('cos-list-refresh',(event, params)=>{
      let msg = params.update ? this.translate('MODULES.LOGICAL.QOS.TAB.COS.UPDATE.SUCCESS') 
                          : this.translate('MODULES.LOGICAL.QOS.TAB.COS.CREATE.SUCCESS');
      this.scope.alert = {
        type: 'success',
        msg: msg
      }
      this.di.notificationService.render(this.scope);
      this.scope.model.api.queryUpdate();
    }));
    unsubscribers.push(this.di.$rootScope.$on('ecn-list-refresh',(event, params)=>{
      let msg = params.update ? this.translate('MODULES.LOGICAL.QOS.TAB.ECN.UPDATE.SUCCESS') 
                          : this.translate('MODULES.LOGICAL.QOS.TAB.ECN.CREATE.SUCCESS');
      this.scope.alert = {
        type: 'success',
        msg: msg
      }
      this.di.notificationService.render(this.scope);
      this.scope.model.api.queryUpdate();
    }));

    unsubscribers.push(this.di.$rootScope.$on('schedule-list-refresh',(event, params)=>{
      let msg = this.translate('MODULES.LOGICAL.QOS.TAB.SCHEDULE.UPDATE.SUCCESS');
      this.scope.alert = {
        type: 'success',
        msg: msg
      }
      this.di.notificationService.render(this.scope);
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
    }

    this.scope.onTableRowSelectAction = (event) => {
      switch (this.scope.tabSelected.type){
        case 'cos':
          this.di.$rootScope.$emit('cos-wizard-show', event.data);
          break;
        case 'ecn':
          this.di.$rootScope.$emit('ecn-wizard-show', event.data);
          break;
        case 'schedule':
          this.di.$rootScope.$emit('schedule-wizard-show', event.data);
          break;
      }
    };

    this.scope.onTableRowClick = (event) => {
      this.scope.model.api.setSelectedRow(event.$data.id);
    };

    this.scope.onApiReady = ($api) => {
      this.scope.model.api = $api;
    };

    this.scope.addCOS = () => {
      this.di.$rootScope.$emit('cos-wizard-show');
    };

    this.scope.addECN = () => {
      this.di.$rootScope.$emit('ecn-wizard-show');
    };

    // this.scope.addSchedule = () => {
    //   this.di.$rootScope.$emit('schedule-wizard-show');
    // };
  }

  init() {
    this.scope.model.provider = this.di.tableProviderFactory.createProvider({
      query: (params) => {
        let defer = this.di.$q.defer();
        this.getEntities(params).then((res) => {
          this.scope.tabSwitch = false;
          this.entityStandardization(res.data);
          defer.resolve({
            data: this.scope.model.entities
          });
        });
        return defer.promise;
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
      case 'cos':
        this.di.logicalDataManager.getCosList().then((data) => {
          defer.resolve({'data': data});
        });
        break;
      case 'ecn':
        this.di.logicalDataManager.getEcnList().then((data) => {
          defer.resolve({'data': data});
        });
        break;
      case 'schedule':
        this.di.logicalDataManager.getScheduleList().then((data) => {
          defer.resolve({'data': data});
        });
        break;
    }
    return defer.promise;
  }

  entityStandardization(entities) {
    this.scope.model.entities = [];
    switch (this.scope.tabSelected.type) {
      case 'cos':
        entities.forEach((entity) => {
          let obj = {};
          obj['id'] = entity.queue.toString();
          obj['queue'] = entity.queue;
          obj['dscp'] = entity.dscp;
          this.scope.model.entities.push(obj);
        });
        break;
      case 'ecn':
        entities.forEach((entity) => {
          let obj = {};
          obj['id'] = entity.queue.toString();
          obj['queue'] = entity.queue;
          obj['threshold'] = entity.ecn_threshold;
          this.scope.model.entities.push(obj);
        });
        break;
      case 'schedule':
        entities.forEach((entity)=>{
          if(entity.name === 'bandwidth'){
            entity.queue_weight.forEach((weight, index)=>{
              let obj = {};
              obj['id'] = index.toString();
              obj['queue'] = index;
              obj['weight'] = weight;
              this.scope.model.entities.push(obj);
            })
          }

        })
    }
  }

  getSchema() {
    let schema;
    switch(this.scope.tabSelected.type) {
      case 'cos':
        schema = this.di.logicalService.getQosCosSchema();
        break;
      case 'ecn':
        schema = this.di.logicalService.getQosEcnSchema();
        break;
      case 'schedule':
        schema = this.di.logicalService.getScheduleSchema();
        break;
    }
    return schema;
  }

  getActionsShow() {
    let actions;
    switch(this.scope.tabSelected.type) {
      case 'cos':
      case 'ecn':
        actions = this.di.logicalService.getQosActionsShow();
        break;
      case 'schedule':
        actions = this.di.logicalService.getQosScheduleActionsShow();
        break;
    }
    return actions;
  }

  getRowActions() {
    /*switch(this.scope.tabSelected.type) {
      case 'segment':
        actions = this.di.logicalService.getTenantSegmentsRowActions();
        break;
    }*/
    let actions = this.di.logicalService.getQosRowActions();
    return actions;
  }

  getDataType() {
    let schema = {};
    schema['authManage'] = {
      support: true,
      currentRole: this.scope.role
    };
    schema['index_name'] = 'id';
    schema['rowCheckboxSupport'] = false;
    schema['rowActionsSupport'] = true;
   
    return schema;
  }
}

QoSController.$inject = QoSController.getDI();
QoSController.$$ngIsClass = true;
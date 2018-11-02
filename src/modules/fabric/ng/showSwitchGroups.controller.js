export class ShowSwitchGroupsController {
  static getDI() {
    return [
      '$scope',
      '$q',
      'dataModel',
      'deviceDetailService',
      'deviceDataManager',
      'tableProviderFactory'
    ];
  }
  
  constructor(...args) {
    this.di = {};
    ShowSwitchGroupsController.getDI().forEach((value, index) => {
      this.di[value] = args[index];
    });
    this.scope = this.di.$scope;
    this.scope.switchId = this.di.dataModel.switchId;
    
    this.scope.groupsModel = {
      provider: null,
      api: null,
      schema: this.di.deviceDetailService.getDeviceGroupsSchema(),
      entities: []
    };
    
    this.scope.onTableRowClick = (event) => {
      if (event.$data){
        this.scope.groupsModel.api.setSelectedRow(event.$data.id);
      }
    };
    
    this.scope.onApiReady = ($api) => {
      this.scope.groupsModel.api = $api;
    };
    
    this.init();
  }
  
  init() {
    this.scope.groupsModel.provider = this.di.tableProviderFactory.createProvider({
      query: (params) => {
        let defer = this.di.$q.defer();
        this.di.deviceDataManager.getDeviceGroups(this.scope.switchId, {}).then((res) => {
          this.entityStandardization(res.data.groups);
          defer.resolve({
            data: this.scope.groupsModel.entities,
            count: this.scope.groupsModel.total
          });
        });
        return defer.promise;
      },
      getSchema: () => {
        return {
          schema: this.scope.groupsModel.schema,
          index_name: 'id',
          rowCheckboxSupport: false,
          rowActionsSupport: false
        };
      }
    });
  }
  
  entityStandardization(entities) {
    this.scope.groupsModel.entities = [];
    entities.forEach((entity) => {
      let obj = {};
      let groupObj = this.di.deviceDataManager.parseDeviceGroup(entity.id);
      obj['id'] = entity.id.toString(16);
      obj['group_id'] = '0x' + entity.id.toString(16); // 转16进制
      obj['name'] = groupObj.name;
      obj['vlan_id'] = groupObj.vlan_id;
      obj['type'] = entity.type;
      obj['buckets'] = JSON.stringify(entity.buckets);
      this.scope.groupsModel.entities.push(obj);
    });
  }
}
ShowSwitchGroupsController.$inject = ShowSwitchGroupsController.getDI();
ShowSwitchGroupsController.$$ngIsClass = true;
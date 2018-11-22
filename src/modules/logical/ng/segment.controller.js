export class SegmentController {
  static getDI() {
    return [
      '$filter',
      '$scope',
      '$rootScope',
      '$q',
      'roleService',
      'logicalDataManager',
      'tableProviderFactory',
      'notificationService'
    ];
  }
  
  constructor(...args) {
    this.di = {};
    SegmentController.getDI().forEach((value, index) => {
      this.di[value] = args[index];
    });
    
    this.scope = this.di.$scope;
    this.translate = this.di.$filter('translate');
    this.date = this.di.$filter('date');
    this.scope.role = this.di.roleService.getRole();
    this.scope.hasData = false;
    
    this.scope.segmentModel = {
      provider: null,
      api: null,
      actionsShow: this.getActionsShow()
    };
    
    this.scope.onAPIReady = ($api) => {
      this.scope.segmentModel.api = $api;
    };
  
    this.scope.createSegment = () => {
      this.di.$rootScope.$emit('segment-wizard-show');
    };
    
    this.unsubscribers = [];

    this.init();
  
    this.unsubscribers.push(this.di.$rootScope.$on('segment-list-refresh',()=>{
      this.di.notificationService.renderSuccess(this.scope, this.translate('MODULES.SWITCH.DETAIL.GROUP.CREATE.SUCCESS'));
      this.scope.segmentModel.api.queryUpdate();
    }));
    
    this.scope.$on('$destroy', () => {
      this.unsubscribers.forEach((cb) => {
        cb();
      });
    });
  }
  
  init() {
    this.scope.segmentModel.provider = this.di.tableProviderFactory.createProvider({
      query: (params) => {
        let defer = this.di.$q.defer();
        
        this.di.logicalDataManager.getSegments(params).then((res) => {
          this.scope.hasData = res.data.segments.length ? true : false;
          this.scope.entities = this.getEntities(res.data.segments);
          defer.resolve({
            data: this.scope.entities,
            count: res.data.count
          });
        });
        return defer.promise;
      },
      getSchema: () => {
        return {
          schema: this.getTableSchema(),
          index_name: 'segment_name',
          authManage: {
            support: true,
            currentRole: this.scope.role
          }
        };
      }
    });
  }
  
  getEntities(origins) {
    let entities = [];
    if(!Array.isArray(origins)) return entities;
    origins.forEach((item) => {
      let obj = {};
      
      obj.tenant_name = item.tenant_name;
      obj.tenant_type = item.tenant_type;
      obj.segment_name = item.segment_name;
      obj.segment_type = item.segment_type;
      obj.ip_address = item.ip_address.join(',');
      obj.segment_value = item.segment_value;
      
      entities.push(obj);
    });
    return entities;
  }

  getActionsShow() {
    return {
      'add': {'enable': true, 'role': 3},
      'refresh': {'enable': true, 'role': 3}, 
      'search': {'enable': false, 'role': 3}
    };
  }
  
  getTableSchema() {
    return [
      {
        'label': this.translate('MODULES.LOGICAL.SEGMENT.TABLE.TENANT_NAME'),
        'field': 'tenant_name',
        'layout': {'visible': true, 'sortable': true, 'fixed': true, width:"20%"}
      },
      {
        'label': this.translate('MODULES.LOGICAL.SEGMENT.TABLE.TENANT_TYPE'),
        'field': 'tenant_type',
        'layout': {'visible': true, 'sortable': false, 'fixed': true, width:"10%"}
      },
      {
        'label': this.translate('MODULES.LOGICAL.SEGMENT.TABLE.SEGMENT_NAME'),
        'field': 'segment_name',
        'layout': {'visible': true, 'sortable': false, 'fixed': true, width:"20%"}
      },
      {
        'label': this.translate('MODULES.LOGICAL.SEGMENT.TABLE.SEGMENT_TYPE'),
        'field': 'segment_type',
        'layout': {'visible': true, 'sortable': false, 'fixed': true, width:"10%"}
      },
      {
        'label': this.translate('MODULES.LOGICAL.SEGMENT.TABLE.IP_ADDRESS'),
        'field': 'ip_address',
        'layout': {'visible': true, 'sortable': false, 'fixed': true, width:"30%"}
      },
      {
        'label': this.translate('MODULES.LOGICAL.SEGMENT.TABLE.SEGMENT_VALUE'),
        'field': 'segment_value',
        'layout': {'visible': true, 'sortable': false, 'fixed': true, width:"10%"}
      }
    ];
  }
  
}

SegmentController.$inject = SegmentController.getDI();
SegmentController.$$ngIsClass = true;